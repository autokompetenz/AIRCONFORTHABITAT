const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const { prisma } = require('../lib/prisma.js');
const { sendOrderConfirmation, sendAdminNotification, sendStatusNotification, sendReplyToCustomer, sendPaymentProofToAdmin } = require('../lib/mailer.js');
const { generateOrderNumber } = require('../lib/helpers.js');
const { Prisma } = require('@prisma/client');

const app = express();

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL manquant');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant');
if (!process.env.ADMIN_ACCESS_CODE) console.warn('⚠ ADMIN_ACCESS_CODE non défini');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET manquant');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === 'products')) {
    const { error } = await supabase.storage.createBucket('products', { public: true });
    if (error) console.error('⚠ Erreur création bucket products:', error.message);
    else console.log('✅ Bucket products créé');
  }
})();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image et PDF sont autorisés'), false);
    }
  }
});

async function uploadFiles(files, folder = 'products') {
  const sorted = [...files].sort((a, b) =>
    a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
  );
  const urls = {};
  for (let index = 0; index < sorted.length; index++) {
    try {
      const file = sorted[index];
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${index}-${safeName}`;
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) {
        console.error(`Upload error for ${file.originalname}:`, error.message);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);
      urls[index === 0 ? 'imageUrl' : `imageUrl${index + 1}`] = urlData.publicUrl;
    } catch (err) {
      console.error(`Upload failed for file ${index}:`, err.message);
    }
  }
  return urls;
}

const corsOptions = {
  origin: [
    'https://animalconceptsrl.com',
    'https://animalconceptsrl.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// ─── Admin Auth ────────────────────────────────────────────────────────────
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code requis' });
  if (code !== process.env.ADMIN_ACCESS_CODE) {
    return res.status(401).json({ error: 'Code incorrect' });
  }
  const token = jwt.sign({ role: 'admin', id: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, expiresIn: '8h' });
});

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Code d\'accès manquant' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Code invalide ou expiré' });
  }
}

// ─── API Root ──────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AIRCONFORTHABITAT API',
    version: '2.0.0',
    time: new Date().toISOString()
  });
});

// ─── Products ─────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { type, brand, status, featured, search, minPrice, maxPrice, sort, limit, page = 1 } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = page ? (parseInt(page) - 1) * (take || 12) : 0;
    const where = { isActive: true, status: { not: 'discontinued' } };

    if (type) where.type = type;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, take, skip, orderBy, include: { category: true } }),
      prisma.product.count({ where })
    ]);

    res.json({ products, total });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', products: [], total: 0 });
  }
});

app.get('/api/products/types', async (req, res) => {
  try {
    const types = await prisma.product.groupBy({
      by: ['type'],
      where: { isActive: true, status: { not: 'discontinued' } },
      _count: { type: true }
    });
    res.json({ types: types.map(t => ({ type: t.type, count: t._count.type })) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', types: [] });
  }
});

app.get('/api/products/brands', async (req, res) => {
  try {
    const brands = await prisma.product.groupBy({
      by: ['brand'],
      where: { isActive: true, status: { not: 'discontinued' } },
      _count: { brand: true }
    });
    res.json({ brands: brands.map(b => ({ brand: b.brand, count: b._count.brand })) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', brands: [] });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);
    const product = isNaN(productId) || productId <= 0
      ? await prisma.product.findUnique({ where: { slug: id }, include: { category: true } })
      : await prisma.product.findUnique({ where: { id: productId }, include: { category: true } });
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, customerAddress, deliveryAddress, notes } = req.body;
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Nom, email et téléphone requis' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Au moins un produit requis' });
    }

    // Validate products
    const productIds = items.map(i => parseInt(i.productId)).filter(id => !isNaN(id));
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    if (products.length === 0) {
      return res.status(404).json({ error: 'Produits non trouvés' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId));
      if (!product) return null;
      const qty = parseInt(item.quantity) || 1;
      const price = product.salePrice || product.price;
      totalAmount += price * qty;
      return { productId: product.id, quantity: qty, price };
    }).filter(Boolean);

    let orderNumber;
    let exists = true;
    while (exists) {
      orderNumber = generateOrderNumber();
      exists = !!(await prisma.order.findUnique({ where: { orderNumber } }));
    }

    // Upsert customer
    let customer = await prisma.customer.findFirst({ where: { email: customerEmail } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: customerName, email: customerEmail, phone: customerPhone, address: deliveryAddress || customerAddress || null }
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName, customerEmail, customerPhone,
          customerAddress: customerAddress || null,
          deliveryMethod: 'pickup',
          deliveryAddress: deliveryAddress || null,
          totalAmount,
          notes: notes || null,
          status: 'pending',
          items: {
            create: orderItems,
          },
        },
      });

      await tx.orderTracking.create({
        data: {
          orderId: newOrder.id,
          status: 'pending',
          comment: 'Demande de commande reçue',
        },
      });

      return newOrder;
    });

    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });

    try {
      await sendOrderConfirmation({ email: customerEmail, name: customerName, order, items: orderWithItems.items });
    } catch (err) {
      console.error('Confirmation email error:', err.message);
    }
    try {
      await sendAdminNotification({ order, items: orderWithItems.items });
    } catch (err) {
      console.error('Admin notification error:', err.message);
    }

    res.status(201).json({ success: true, orderNumber: order.orderNumber, order });
  } catch (e) {
    console.error('Create order error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: true } },
        tracking: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    res.json({
      order,
      payment: {
        iban: process.env.ORDER_IBAN || 'BE68 1234 5678 9012',
        bic: process.env.ORDER_BIC || 'GEBABEBB',
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Upload payment proof ─────────────────────────────────────────────────
app.post('/api/orders/upload-payment-proof/:orderNumber', upload.array('file', 1), async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    const bucketName = 'payment-proofs';
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
      const { error } = await supabase.storage.createBucket(bucketName, { public: true });
      if (error) return res.status(500).json({ error: error.message });
    }

    const file = req.files && req.files[0];
    if (!file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const ext = file.originalname.split('.').pop();
    const fileName = `payment_proof_${orderNumber}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const receiptUrl = urlData.publicUrl;

    sendPaymentProofToAdmin({
      orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      fileName: file.originalname,
      fileBuffer: file.buffer,
      fileMimetype: file.mimetype,
    }).catch(err => console.error('Email payment proof error:', err.message));

    try {
      await prisma.order.update({
        where: { orderNumber },
        data: { paymentProofUrl: receiptUrl }
      });
    } catch (dbErr) {
      console.error('DB update paymentProofUrl error:', dbErr.message);
    }

    try {
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: order.status,
          comment: '📎 Preuve de virement reçue'
        }
      });
    } catch (trackErr) {
      console.error('Tracking create error:', trackErr.message);
    }

    res.json({ success: true, receiptUrl });
  } catch (e) {
    console.error('Upload payment proof error:', e);
    res.status(500).json({ error: e.message || 'Erreur lors de l\'upload' });
  }
});

// ─── Admin: Products CRUD ─────────────────────────────────────────────────
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true } });
    res.json({ products, total: products.length });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', products: [], total: 0 });
  }
});

app.get('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);
    if (isNaN(productId) || productId <= 0) return res.status(400).json({ error: 'ID invalide' });
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { category: true } });
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/admin/products', authenticateAdmin, upload.any(), async (req, res) => {
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    const requiredFields = ['name', 'type', 'brand', 'model', 'price'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Champs obligatoires: ${missingFields.join(', ')}` });
    }

    const slug = req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();

    const productData = {
      name: req.body.name,
      slug,
      type: req.body.type,
      brand: req.body.brand,
      model: req.body.model,
      description: req.body.description || null,
      technicalDescription: req.body.technicalDescription || null,
      price: parseFloat(req.body.price),
      salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : null,
      btu: req.body.btu || null,
      surface: req.body.surface || null,
      noiseLevel: req.body.noiseLevel ? parseFloat(req.body.noiseLevel) : null,
      energyClass: req.body.energyClass || null,
      cop: req.body.cop ? parseFloat(req.body.cop) : null,
      seer: req.body.seer ? parseFloat(req.body.seer) : null,
      scop: req.body.scop ? parseFloat(req.body.scop) : null,
      color: req.body.color || null,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      dimensions: req.body.dimensions || null,
      warranty: req.body.warranty || null,
      stock: req.body.stock ? parseInt(req.body.stock) : 0,
      status: req.body.status || 'available',
      featured: req.body.featured === 'true' || req.body.featured === true,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
      videoUrl: req.body.videoUrl || null,
    };

    if (req.files && req.files.length > 0) {
      Object.assign(productData, await uploadFiles(req.files, 'products'));
    }

    const product = await prisma.product.create({ data: productData });
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

app.put('/api/admin/products/:id', authenticateAdmin, upload.any(), async (req, res) => {
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    const { id } = req.params;
    const productId = Number(id);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const productData = {
      name: req.body.name,
      type: req.body.type,
      brand: req.body.brand,
      model: req.body.model,
      description: req.body.description || null,
      technicalDescription: req.body.technicalDescription || null,
      price: parseFloat(req.body.price),
      salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : null,
      btu: req.body.btu || null,
      surface: req.body.surface || null,
      noiseLevel: req.body.noiseLevel ? parseFloat(req.body.noiseLevel) : null,
      energyClass: req.body.energyClass || null,
      cop: req.body.cop ? parseFloat(req.body.cop) : null,
      seer: req.body.seer ? parseFloat(req.body.seer) : null,
      scop: req.body.scop ? parseFloat(req.body.scop) : null,
      color: req.body.color || null,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      dimensions: req.body.dimensions || null,
      warranty: req.body.warranty || null,
      stock: req.body.stock ? parseInt(req.body.stock) : 0,
      status: req.body.status || 'available',
      featured: req.body.featured === 'true' || req.body.featured === true,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
      videoUrl: req.body.videoUrl || null,
    };

    if (req.files && req.files.length > 0) {
      Object.assign(productData, await uploadFiles(req.files, 'products'));
    }

    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
      existingImages.forEach((url, idx) => {
        const fieldName = idx === 0 ? 'imageUrl' : `imageUrl${idx + 1}`;
        if (!productData[fieldName]) productData[fieldName] = url;
      });
    }

    const product = await prisma.product.update({ where: { id: productId }, data: productData });
    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.patch('/api/admin/products/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });
    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !existing.isActive },
    });
    res.json({ product });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId) || productId <= 0) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) return res.status(404).json({ error: 'Produit non trouvé' });
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (e) {
    console.error('Delete product error:', e);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ─── Admin: Orders ─────────────────────────────────────────────────────────
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, imageUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page)-1)*parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    res.json({ orders, total, statusCounts });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const isNumeric = !isNaN(orderId) && orderId > 0;
    const where = isNumeric ? { id: orderId } : { orderNumber: id };

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: { include: { product: true } },
        tracking: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    res.json({ order });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.patch('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    await prisma.orderTracking.create({
      data: { orderId: order.id, status, comment: comment || null },
    });

    try {
      await sendStatusNotification({
        email: order.customerEmail,
        name: order.customerName,
        orderNumber: order.orderNumber,
        status,
      });
    } catch (err) {
      console.error('Status notification failed:', err.message);
    }

    res.json({ success: true, order });
  } catch (e) {
    console.error('Update order error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Admin: Reply to customer ─────────────────────────────────────────────
app.post('/api/admin/orders/:id/reply', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return res.status(400).json({ error: 'ID invalide' });

    const { message, subject } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    await sendReplyToCustomer({
      email: order.customerEmail,
      name: order.customerName,
      subject: subject || `AIRCONFORTHABITAT — Suivi commande ${order.orderNumber}`,
      message: message.trim(),
    });

    await prisma.orderTracking.create({
      data: {
        orderId,
        status: order.status,
        comment: `📧 Message envoyé au client : ${message.trim().substring(0, 100)}${message.length > 100 ? '...' : ''}`,
      },
    });

    res.json({ success: true, message: 'Message envoyé au client' });
  } catch (e) {
    console.error('Reply error:', e);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// ─── Admin: Hard delete order ──────────────────────────────────────────────
app.delete('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    await prisma.$transaction(async (tx) => {
      await tx.orderTracking.deleteMany({ where: { orderId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    await prisma.adminLog.create({
      data: { action: 'DELETE_ORDER', detail: `Commande #${order.orderNumber} supprimée` },
    });

    res.json({ success: true, message: 'Commande supprimée définitivement' });
  } catch (e) {
    console.error('Hard delete order error:', e);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ─── Admin: Stats ──────────────────────────────────────────────────────────
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    const availableProducts = await prisma.product.count({ where: { status: 'available' } });
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    const totalRevenue = await prisma.order.aggregate({ _sum: { totalAmount: true } });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    });

    res.json({
      totalProducts, availableProducts, totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentOrders,
    });
  } catch (e) {
    res.status(500).json({
      totalProducts: 0, availableProducts: 0, totalOrders: 0,
      pendingOrders: 0, totalRevenue: 0, recentOrders: [],
      error: 'Erreur récupération statistiques'
    });
  }
});

// ─── Admin: Customers ─────────────────────────────────────────────────────
app.get('/api/admin/customers', authenticateAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
      prisma.customer.count({ where }),
    ]);
    res.json({ customers, total, page: parseInt(page), limit: take });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Admin: Stock Alerts ──────────────────────────────────────────────────
app.get('/api/admin/stock-alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = await prisma.stockAlert.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ alerts });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/stock-alerts', async (req, res) => {
  try {
    const { productId, productName, brand, name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }
    const entry = await prisma.stockAlert.create({
      data: { productId: productId ? parseInt(productId) : null, productName: productName || null, brand: brand || null, name, email, phone: phone || null }
    });
    res.status(201).json({ success: true, entry });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Error handling ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = app;
