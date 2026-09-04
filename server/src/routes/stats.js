const express = require('express');
const { db } = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// GET /api/stats  (admin)
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const bookings = db.bookings;
  const paid = bookings.filter((b) => b.paymentStatus === 'paid' && b.status !== 'cancelled');

  const revenue = paid.reduce((sum, b) => sum + b.estimatedPrice, 0);
  const byStatus = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const byTruckType = bookings.reduce((acc, b) => {
    acc[b.truckType] = (acc[b.truckType] || 0) + 1;
    return acc;
  }, {});

  // revenue by month (last 6 months)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-ZA', { month: 'short' });
    const amount = paid
      .filter((b) => b.createdAt.slice(0, 7) === key)
      .reduce((sum, b) => sum + b.estimatedPrice, 0);
    months.push({ key, label, amount: Math.round(amount) });
  }

  res.json({
    summary: {
      fleetSize: db.trucks.length,
      drivers: db.drivers.length,
      customers: db.customers.length,
      activeBookings: bookings.filter((b) => ['pending', 'confirmed', 'in_transit'].includes(b.status)).length,
      totalBookings: bookings.length,
      revenue: Math.round(revenue),
    },
    byStatus,
    byTruckType,
    months,
    fleetAvailable: db.trucks.filter((t) => t.status === 'available').length,
    driversAvailable: db.drivers.filter((d) => d.status === 'available').length,
  });
});

module.exports = router;
