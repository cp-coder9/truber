const express = require('express');
const bcrypt = require('bcryptjs');
const { db, save, uuidv4 } = require('../db');
const { signToken, requireAuth } = require('../auth');

const router = express.Router();

const publicCustomer = (c) => ({
  id: c.id,
  role: c.role,
  name: c.name,
  email: c.email,
  phone: c.phone,
  company: c.company || null,
});

function findUserByEmail(email) {
  const lower = String(email || '').toLowerCase().trim();
  return (
    db.users.find((u) => u.email.toLowerCase() === lower) ||
    db.customers.find((c) => c.email.toLowerCase() === lower)
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  const payload = user.role === 'admin'
    ? { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone }
    : publicCustomer(user);
  return res.json({ token, user: payload });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, phone, password, company } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const lower = email.toLowerCase().trim();
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const customer = {
    id: uuidv4(),
    role: 'customer',
    name,
    email: lower,
    phone: phone || '',
    company: company || null,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  db.customers.push(customer);
  save();
  const token = signToken(customer);
  return res.status(201).json({ token, user: publicCustomer(customer) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user =
    db.users.find((u) => u.id === req.user.sub) ||
    db.customers.find((c) => c.id === req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const payload = user.role === 'admin'
    ? { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone }
    : publicCustomer(user);
  return res.json({ user: payload });
});

module.exports = router;
