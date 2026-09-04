const express = require('express');
const { db, save, uuidv4 } = require('../db');
const { requireAuth, requireAdmin } = require('../auth');
const { TRUCK_TYPES, TRUCK_STATUSES } = require('../constants');

const router = express.Router();

// Public metadata for customers to query types and availability.
router.get('/types', (req, res) => {
  res.json({ types: TRUCK_TYPES });
});

// GET /api/trucks  (auth)
router.get('/', requireAuth, (req, res) => {
  res.json({ trucks: db.trucks });
});

// GET /api/trucks/available (auth) - for admin assignment dropdown
router.get('/available', requireAuth, (req, res) => {
  res.json({ trucks: db.trucks.filter((t) => t.status === 'available') });
});

// GET /api/trucks/:id  (auth)
router.get('/:id', requireAuth, (req, res) => {
  const truck = db.trucks.find((t) => t.id === req.params.id);
  if (!truck) return res.status(404).json({ error: 'Truck not found' });
  res.json({ truck });
});

// POST /api/trucks  (admin)
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const body = req.body || {};
  if (!body.plate || !body.make || !body.model || !body.type) {
    return res.status(400).json({ error: 'plate, make, model and type are required' });
  }
  if (db.trucks.some((t) => t.plate.toLowerCase() === String(body.plate).toLowerCase())) {
    return res.status(409).json({ error: 'A truck with this plate already exists' });
  }
  const truck = {
    id: uuidv4(),
    plate: body.plate.toUpperCase(),
    make: body.make,
    model: body.model,
    type: body.type,
    capacityTons: Number(body.capacityTons) || 1,
    lengthMeters: Number(body.lengthMeters) || 6,
    ratePerKm: Number(body.ratePerKm) || 90,
    tonRate: Number(body.tonRate) || 18,
    year: Number(body.year) || new Date().getFullYear(),
    fuelType: body.fuelType || 'Diesel',
    status: TRUCK_STATUSES.includes(body.status) ? body.status : 'available',
    driverId: body.driverId || null,
    location: body.location || '',
  };
  if (truck.status === 'on_trip' && truck.driverId) {
    const driver = db.drivers.find((d) => d.id === truck.driverId);
    if (driver) driver.status = 'on_trip';
  }
  db.trucks.push(truck);
  save();
  res.status(201).json({ truck });
});

// PUT /api/trucks/:id  (admin)
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const truck = db.trucks.find((t) => t.id === req.params.id);
  if (!truck) return res.status(404).json({ error: 'Truck not found' });
  const body = req.body || {};
  const editable = [
    'plate',
    'make',
    'model',
    'type',
    'capacityTons',
    'lengthMeters',
    'ratePerKm',
    'tonRate',
    'year',
    'fuelType',
    'status',
    'driverId',
    'location',
  ];
  for (const key of editable) {
    if (body[key] !== undefined) truck[key] = body[key];
  }
  if (truck.status === 'available') truck.driverId = truck.driverId || null;
  save();
  res.json({ truck });
});

// DELETE /api/trucks/:id  (admin)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const idx = db.trucks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Truck not found' });
  db.trucks.splice(idx, 1);
  save();
  res.json({ ok: true });
});

module.exports = router;
