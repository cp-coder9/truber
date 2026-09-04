const express = require('express');
const { db, save, uuidv4 } = require('../db');
const { requireAuth, requireAdmin } = require('../auth');
const { LICENSE_TYPES, DRIVER_STATUSES } = require('../constants');

const router = express.Router();

// GET /api/drivers  (auth)
router.get('/', requireAuth, (req, res) => {
  res.json({ drivers: db.drivers });
});

// GET /api/drivers/available (auth)
router.get('/available', requireAuth, (req, res) => {
  res.json({ drivers: db.drivers.filter((d) => d.status === 'available') });
});

// GET /api/drivers/:id  (auth)
router.get('/:id', requireAuth, (req, res) => {
  const driver = db.drivers.find((d) => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json({ driver });
});

// POST /api/drivers  (admin)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.phone || !body.licenseNumber) {
    return res.status(400).json({ error: 'name, phone and licenseNumber are required' });
  }
  if (db.drivers.some((d) => d.licenseNumber.toLowerCase() === String(body.licenseNumber).toLowerCase())) {
    return res.status(409).json({ error: 'A driver with this license number already exists' });
  }
  const driver = {
    id: uuidv4(),
    name: body.name,
    phone: body.phone,
    email: body.email || '',
    licenseNumber: body.licenseNumber.toUpperCase(),
    licenseType: LICENSE_TYPES.includes(body.licenseType) ? body.licenseType : 'Code 14',
    status: DRIVER_STATUSES.includes(body.status) ? body.status : 'available',
    rating: Number(body.rating) || 5,
    yearsExperience: Number(body.yearsExperience) || 0,
    truckId: body.truckId || null,
    location: body.location || '',
  };
  if (driver.truckId) {
    const truck = db.trucks.find((t) => t.id === driver.truckId);
    if (truck) {
      truck.driverId = driver.id;
      if (driver.status === 'on_trip') truck.status = 'on_trip';
    }
  }
  db.drivers.push(driver);
  save();
  res.status(201).json({ driver });
});

// PUT /api/drivers/:id  (admin)
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const driver = db.drivers.find((d) => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  const body = req.body || {};
  const editable = [
    'name',
    'phone',
    'email',
    'licenseNumber',
    'licenseType',
    'status',
    'rating',
    'yearsExperience',
    'truckId',
    'location',
  ];
  for (const key of editable) {
    if (body[key] !== undefined) driver[key] = body[key];
  }
  save();
  res.json({ driver });
});

// DELETE /api/drivers/:id  (admin)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const idx = db.drivers.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Driver not found' });
  db.drivers.splice(idx, 1);
  save();
  res.json({ ok: true });
});

module.exports = router;
