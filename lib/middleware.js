const jwt = require('jsonwebtoken');
const prisma = require('./prisma');

function cors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://animalconceptsrl.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const originOk = allowed.includes(origin) || origin.endsWith('.vercel.app');

  res.setHeader('Access-Control-Allow-Origin', originOk ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

async function adminAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Code d\'accès manquant' });
    return false;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Accès non autorisé' });
      return false;
    }
    req.adminId = decoded.id;
    return true;
  } catch (e) {
    res.status(401).json({ error: 'Code invalide ou expiré' });
    return false;
  }
}

module.exports = { cors, adminAuth };
