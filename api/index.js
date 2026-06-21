const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const { prisma } = require('../lib/prisma.js');
const { sendReservationConfirmation } = require('../lib/mailer.js');
const { generateReservationNumber } = require('../lib/helpers.js');

const app = express();

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL manquant');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant');
if (!process.env.ADMIN_ACCESS_CODE) console.warn('⚠ ADMIN_ACCESS_CODE non défini');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET manquant');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Ensure storage bucket exists
(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === 'puppies')) {
    const { error } = await supabase.storage.createBucket('puppies', { public: true });
    if (error) console.error('⚠ Erreur création bucket puppies:', error.message);
    else console.log('✅ Bucket puppies créé');
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

async function uploadFiles(files, folder = 'puppies') {
  const sorted = [...files].sort((a, b) =>
    a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
  );
  const results = await Promise.all(
    sorted.map(async (file, index) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${index}-${safeName}`;
      const url = `${process.env.SUPABASE_URL}/storage/v1/object/${folder}/${fileName}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': file.mimetype,
        },
        body: file.buffer,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload ${response.status}: ${text}`);
      }
      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${folder}/${fileName}`;
      return { index, url: publicUrl };
    })
  );
  const urls = {};
  results.forEach(({ index, url }) => {
    urls[index === 0 ? 'imageUrl' : `imageUrl${index + 1}`] = url;
  });
  return urls;
}

const corsOptions = {
  origin: [
    'https://sweetpuppies.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiter for admin code attempts
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
    service: 'Sweet Puppies API',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// ─── Puppies Routes ────────────────────────────────────────────────────────
app.get('/api/puppies', async (req, res) => {
  try {
    const { breed, sex, status, featured, search, minPrice, maxPrice, limit, page = 1 } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    const skip = page ? (parseInt(page) - 1) * (take || 12) : 0;
    const where = { isActive: true };

    if (breed) where.breed = { contains: breed, mode: 'insensitive' };
    if (sex) where.sex = sex;
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { breed: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    const [puppies, total] = await Promise.all([
      prisma.puppy.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      prisma.puppy.count({ where })
    ]);

    res.json({ puppies, total });
  } catch (error) {
    console.error('GET /api/puppies error:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur', puppies: [], total: 0 });
  }
});

app.get('/api/puppies/breeds', async (req, res) => {
  try {
    const breeds = await prisma.puppy.groupBy({
      by: ['breed'],
      where: { isActive: true },
      _count: { breed: true }
    });
    res.json({ breeds: breeds.map(b => ({ breed: b.breed, count: b._count.breed })) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', breeds: [] });
  }
});

app.get('/api/puppies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const puppyId = Number(id);
    if (isNaN(puppyId) || puppyId <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }
    const puppy = await prisma.puppy.findUnique({ where: { id: puppyId } });
    if (!puppy) return res.status(404).json({ error: 'Chiot non trouvé' });
    res.json({ puppy });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// ─── Admin: Puppies CRUD ──────────────────────────────────────────────────
app.get('/api/admin/puppies', authenticateAdmin, async (req, res) => {
  try {
    const puppies = await prisma.puppy.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ puppies, total: puppies.length });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', puppies: [], total: 0 });
  }
});

app.post('/api/admin/puppies', authenticateAdmin, upload.any(), async (req, res) => {
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    const sexMap = { 'male': 'Male', 'female': 'Female' };
    if (req.body.sex) req.body.sex = sexMap[req.body.sex.toLowerCase()] || req.body.sex;

    const requiredFields = ['name', 'breed', 'sex', 'birthDate', 'color', 'price'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Champs obligatoires: ${missingFields.join(', ')}` });
    }

    const puppyData = {
      name: req.body.name,
      breed: req.body.breed,
      sex: req.body.sex,
      birthDate: new Date(req.body.birthDate),
      color: req.body.color,
      price: parseFloat(req.body.price),
      deposit: req.body.deposit ? parseFloat(req.body.deposit) : Math.round(parseFloat(req.body.price) * 0.25),
      microchipNumber: req.body.microchipNumber || null,
      vaccinationStatus: req.body.vaccinationStatus || 'À jour',
      dewormingStatus: req.body.dewormingStatus || 'À jour',
      weightCurrent: req.body.weightCurrent ? parseFloat(req.body.weightCurrent) : null,
      weightEstimatedAdult: req.body.weightEstimatedAdult ? parseFloat(req.body.weightEstimatedAdult) : null,
      description: req.body.description || null,
      pedigreeDocUrl: req.body.pedigreeDocUrl || null,
      healthCertificateUrl: req.body.healthCertificateUrl || null,
      parentMotherName: req.body.parentMotherName || null,
      parentFatherName: req.body.parentFatherName || null,
      status: req.body.status || 'available',
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      location: req.body.location || null,
      featured: req.body.featured === 'true' || req.body.featured === true,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
      videoUrl: req.body.videoUrl || null,
    };

    if (req.files && req.files.length > 0) {
      Object.assign(puppyData, await uploadFiles(req.files, 'puppies'));
    }

    const puppy = await prisma.puppy.create({ data: puppyData });
    res.status(201).json({ puppy });
  } catch (error) {
    console.error('Create puppy error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du chiot' });
  }
});

app.put('/api/admin/puppies/:id', authenticateAdmin, upload.any(), async (req, res) => {
  req.files = (req.files || []).filter(f => f.fieldname === 'images');
  try {
    const sexMap = { 'male': 'Male', 'female': 'Female' };
    if (req.body.sex) req.body.sex = sexMap[req.body.sex.toLowerCase()] || req.body.sex;

    const { id } = req.params;
    const puppyId = Number(id);
    if (isNaN(puppyId) || puppyId <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const puppyData = {
      name: req.body.name,
      breed: req.body.breed,
      sex: req.body.sex,
      birthDate: new Date(req.body.birthDate),
      color: req.body.color,
      price: parseFloat(req.body.price),
      deposit: req.body.deposit ? parseFloat(req.body.deposit) : Math.round(parseFloat(req.body.price) * 0.25),
      microchipNumber: req.body.microchipNumber || null,
      vaccinationStatus: req.body.vaccinationStatus || 'À jour',
      dewormingStatus: req.body.dewormingStatus || 'À jour',
      weightCurrent: req.body.weightCurrent ? parseFloat(req.body.weightCurrent) : null,
      weightEstimatedAdult: req.body.weightEstimatedAdult ? parseFloat(req.body.weightEstimatedAdult) : null,
      description: req.body.description || null,
      pedigreeDocUrl: req.body.pedigreeDocUrl || null,
      healthCertificateUrl: req.body.healthCertificateUrl || null,
      parentMotherName: req.body.parentMotherName || null,
      parentFatherName: req.body.parentFatherName || null,
      status: req.body.status || 'available',
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
      location: req.body.location || null,
      featured: req.body.featured === 'true' || req.body.featured === true,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
      videoUrl: req.body.videoUrl || null,
    };

    if (req.files && req.files.length > 0) {
      Object.assign(puppyData, await uploadFiles(req.files, 'puppies'));
    }

    if (req.body.existingImages) {
      const existingImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
      existingImages.forEach((url, idx) => {
        const fieldName = idx === 0 ? 'imageUrl' : `imageUrl${idx + 1}`;
        if (!puppyData[fieldName]) puppyData[fieldName] = url;
      });
    }

    const puppy = await prisma.puppy.update({ where: { id: puppyId }, data: puppyData });
    res.json({ puppy });
  } catch (error) {
    console.error('Update puppy error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.patch('/api/admin/puppies/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const puppyId = parseInt(req.params.id);
    if (isNaN(puppyId)) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.puppy.findUnique({ where: { id: puppyId } });
    if (!existing) return res.status(404).json({ error: 'Chiot non trouvé' });
    const puppy = await prisma.puppy.update({
      where: { id: puppyId },
      data: { isActive: !existing.isActive },
    });
    res.json({ puppy });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/puppies/:id', authenticateAdmin, async (req, res) => {
  try {
    const puppyId = parseInt(req.params.id);
    if (isNaN(puppyId) || puppyId <= 0) return res.status(400).json({ error: 'ID invalide' });
    const existing = await prisma.puppy.findUnique({ where: { id: puppyId } });
    if (!existing) return res.status(404).json({ error: 'Chiot non trouvé' });
    await prisma.$transaction([
      prisma.reservationTracking.deleteMany({ where: { reservation: { puppyId } } }),
      prisma.reservation.deleteMany({ where: { puppyId } }),
      prisma.puppy.delete({ where: { id: puppyId } }),
    ]);
    res.json({ success: true, message: 'Chiot supprimé' });
  } catch (e) {
    console.error('Delete puppy error:', e);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ─── Waitlist ───────────────────────────────────────────────────────────────
app.post('/api/waitlist', async (req, res) => {
  try {
    const { breed, name, email, phone } = req.body;
    if (!breed || !name || !email) {
      return res.status(400).json({ error: 'Race, nom et email requis' });
    }
    const entry = await prisma.waitlistEntry.create({
      data: { breed, name, email, phone: phone || null }
    });
    res.status(201).json({ success: true, entry });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Reservations ─────────────────────────────────────────────────────────
app.post('/api/reservations', async (req, res) => {
  try {
    const { puppyId, guestName, guestEmail, guestPhone, guestProfession, guestHomeAddress, deliveryMethod, deliveryAddress, notes, paymentMethod, hasPet, hasLostPet } = req.body;
    if (!puppyId || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const puppy = await prisma.puppy.findUnique({ where: { id: parseInt(puppyId) } });
    if (!puppy || !puppy.isActive) {
      return res.status(404).json({ error: 'Chiot non trouvé' });
    }
    if (puppy.status !== 'available') {
      return res.status(400).json({ error: 'Ce chiot n\'est plus disponible' });
    }

    // Payment logic
    const isFullPayment = paymentMethod === 'full';
    const discountPercent = isFullPayment ? 15 : 0;
    const discountAmount = isFullPayment ? Math.round(puppy.price * 0.15) : 0;
    const totalPrice = puppy.price - discountAmount;
    const depositAmount = isFullPayment ? totalPrice : Math.round(puppy.price * 0.5);
    const balanceAmount = isFullPayment ? 0 : puppy.price - depositAmount;
    const paymentLabel = isFullPayment
      ? `Paiement intégral (-${discountPercent}%)`
      : `Acompte 50% (solde à la livraison)`;

    let reservationNumber;
    let exists = true;
    while (exists) {
      reservationNumber = generateReservationNumber();
      exists = !!(await prisma.reservation.findUnique({ where: { reservationNumber } }));
    }

    // Upsert guest
    let guest = await prisma.guest.findFirst({ where: { email: guestEmail } });
    if (!guest) {
      guest = await prisma.guest.create({
        data: { name: guestName, email: guestEmail, phone: guestPhone, address: deliveryAddress || null, hasPet: hasPet === 'true' || hasPet === true || null, hasLostPet: hasLostPet === 'true' || hasLostPet === true || null }
      });
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          reservationNumber,
          puppyId: puppy.id,
          guestId: guest.id,
          guestName, guestEmail, guestPhone,
          guestProfession: guestProfession || null,
          guestHomeAddress: guestHomeAddress || null,
          paymentMethod: isFullPayment ? 'full' : 'deposit',
          paymentLabel,
          hasPet: hasPet === 'true' || hasPet === true || null,
          hasLostPet: hasLostPet === 'true' || hasLostPet === true || null,
          discountPercent, discountAmount, totalPrice,
          depositAmount, balanceAmount,
          deliveryMethod: deliveryMethod || 'pickup',
          deliveryAddress: deliveryAddress || null,
          notes: notes || null,
          status: 'pending',
        },
      });

      await tx.reservationTracking.create({
        data: {
          reservationId: newReservation.id,
          status: 'pending',
          comment: 'Demande de réservation reçue',
        },
      });

      await tx.puppy.update({
        where: { id: puppy.id },
        data: { status: 'reserved' },
      });

      return newReservation;
    });

    // Send confirmation email (non-blocking)
    sendReservationConfirmation({
      email: guestEmail,
      name: guestName,
      reservation,
      puppy,
    }).catch(err => console.error('Confirmation email error:', err));

    res.status(201).json({ success: true, reservationNumber: reservation.reservationNumber, reservation });
  } catch (e) {
    console.error('Create reservation error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/reservations/track/:reservationNumber', async (req, res) => {
  try {
    const { reservationNumber } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { reservationNumber },
      include: {
        puppy: true,
        tracking: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée' });
    res.json({ reservation });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Admin: Reservations ───────────────────────────────────────────────────
app.get('/api/admin/reservations', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          puppy: { select: { name: true, breed: true, imageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page)-1)*parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.reservation.count({ where }),
    ]);
    const statusCounts = await prisma.reservation.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    res.json({ reservations, total, statusCounts });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/reservations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reservationId = parseInt(id);
    const isNumeric = !isNaN(reservationId) && reservationId > 0;
    const where = isNumeric ? { id: reservationId } : { reservationNumber: id };

    const reservation = await prisma.reservation.findFirst({
      where,
      include: {
        puppy: true,
        tracking: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée' });
    res.json({ reservation });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.patch('/api/admin/reservations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const validStatuses = ['pending', 'deposit_confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    await prisma.reservationTracking.create({
      data: { reservationId: reservation.id, status, comment: comment || null },
    });

    // If cancelled, set puppy back to available
    if (status === 'cancelled') {
      await prisma.puppy.update({
        where: { id: reservation.puppyId },
        data: { status: 'available' },
      });
    }
    // If delivered, set puppy to sold
    if (status === 'delivered') {
      await prisma.puppy.update({
        where: { id: reservation.puppyId },
        data: { status: 'sold' },
      });
    }

    res.json({ success: true, reservation });
  } catch (e) {
    console.error('Update reservation error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Admin: Hard delete reservation ────────────────────────────────────────
app.delete('/api/admin/reservations/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée' });

    await prisma.$transaction(async (tx) => {
      await tx.reservationTracking.deleteMany({ where: { reservationId: id } });
      await tx.reservation.delete({ where: { id } });
      // If the puppy was reserved, set it back to available
      if (reservation.status !== 'delivered') {
        await tx.puppy.update({
          where: { id: reservation.puppyId },
          data: { status: 'available' },
        });
      }
    });

    await prisma.adminLog.create({
      data: { action: 'DELETE_RESERVATION', detail: `Réservation #${reservation.reservationNumber} supprimée` },
    });

    res.json({ success: true, message: 'Réservation supprimée définitivement' });
  } catch (e) {
    console.error('Hard delete reservation error:', e);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ─── Admin: Stats ──────────────────────────────────────────────────────────
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalPuppies = await prisma.puppy.count();
    const availablePuppies = await prisma.puppy.count({ where: { status: 'available' } });
    const totalReservations = await prisma.reservation.count();
    const pendingReservations = await prisma.reservation.count({ where: { status: 'pending' } });
    const totalRevenue = await prisma.reservation.aggregate({ _sum: { depositAmount: true } });

    const recentReservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        puppy: { select: { name: true, breed: true } },
      },
    });

    res.json({
      totalPuppies, availablePuppies, totalReservations,
      pendingReservations,
      totalRevenue: totalRevenue._sum.depositAmount || 0,
      recentReservations,
    });
  } catch (e) {
    res.status(500).json({
      totalPuppies: 0, availablePuppies: 0, totalReservations: 0,
      pendingReservations: 0, totalRevenue: 0, recentReservations: [],
      error: 'Erreur récupération statistiques'
    });
  }
});

// ─── Admin: Clients ────────────────────────────────────────────────────────
app.get('/api/admin/clients', authenticateAdmin, async (req, res) => {
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
    const [clients, total] = await Promise.all([
      prisma.guest.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
      prisma.guest.count({ where }),
    ]);
    res.json({ clients, total, page: parseInt(page), limit: take });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Budget Simulator ──────────────────────────────────────────────────────
app.get('/api/budget-simulator', async (req, res) => {
  try {
    const { budget, includeAccessories } = req.query;
    if (!budget || budget <= 0) {
      return res.status(400).json({ error: 'Budget invalide' });
    }
    const b = parseFloat(budget);
    const accessoriesCost = includeAccessories === 'true' ? 300 : 0;
    const vetFirstYear = 200;
    const effectiveBudget = b - accessoriesCost - vetFirstYear;

    const puppies = await prisma.puppy.findMany({
      where: { isActive: true, status: 'available', price: { lte: effectiveBudget } },
      orderBy: { price: 'desc' },
    });

    res.json({
      count: puppies.length,
      budget: b,
      accessoriesCost,
      vetFirstYear,
      effectiveBudget,
      puppies,
      breakdown: {
        accessories: accessoriesCost > 0 ? `~€${accessoriesCost} (panier, laisse, gamelles, jouets)` : null,
        vet: `~€${vetFirstYear} (vaccins, vermifuge, visite de contrôle)`,
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Waitlist (admin) ──────────────────────────────────────────────────────
app.get('/api/admin/waitlist', authenticateAdmin, async (req, res) => {
  try {
    const entries = await prisma.waitlistEntry.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ entries });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = app;
