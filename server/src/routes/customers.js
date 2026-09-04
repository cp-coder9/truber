const express = require('express');
const { db, save } = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

const publicCustomer = (c) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  company: c.company || null,
  createdAt: c.createdAt,
});

function bookingsFor(customerId) {
  return db.bookings
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function customerProfile(c) {
  const bookings = bookingsFor(c.id);
  const paid = bookings.filter((b) => b.paymentStatus === 'paid');
  // For paid bookings, net spend reflects the cancellation fee retained (not the full price).
  const totalSpend = paid.reduce(
    (sum, b) => sum + (b.status === 'cancelled' ? b.cancellationFee || 0 : b.estimatedPrice),
    0
  );
  const active = bookings.filter((b) => ['pending', 'confirmed', 'in_transit'].includes(b.status));
  const cancelled = bookings.filter((b) => b.status === 'cancelled');
  const byType = bookings.reduce((acc, b) => { acc[b.truckType] = (acc[b.truckType] || 0) + 1; return acc; }, {});

  return {
    ...publicCustomer(c),
    bookingCount: bookings.length,
    totalSpend: Math.round(totalSpend),
    activeBookings: active.length,
    cancelledBookings: cancelled.length,
    cancellationFeesPaid: Math.round(cancelled.reduce((s, b) => s + (b.cancellationFee || 0), 0)),
    confirmedBookings: bookings.filter((b) => ['confirmed', 'in_transit', 'delivered', 'completed'].includes(b.status)).length,
    byType,
  };
}

// GET /api/customers/me  (auth) - logged-in customer's own profile
router.get('/me', requireAuth, (req, res) => {
  const customer = db.customers.find((c) => c.id === req.user.sub);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ profile: customerProfile(customer) });
});

// GET /api/customers  (admin)
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const customers = db.customers.map((c) => {
    const bookings = bookingsFor(c.id);
    const totalSpend = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.estimatedPrice, 0);
    return {
      ...publicCustomer(c),
      bookingCount: bookings.length,
      totalSpend: Math.round(totalSpend),
      activeBookings: bookings.filter((b) => ['pending', 'confirmed', 'in_transit'].includes(b.status)).length,
    };
  });
  res.json({ customers });
});

// GET /api/customers/:id/bookings  (admin)
router.get('/:id/bookings', requireAuth, requireAdmin, (req, res) => {
  const bookings = bookingsFor(req.params.id).map((b) => ({
    ...b,
    truck: db.trucks.find((t) => t.id === b.truckId)
      ? (() => { const t = db.trucks.find((x) => x.id === b.truckId); return { id: t.id, plate: t.plate, model: t.model, type: t.type }; })()
      : null,
    driver: db.drivers.find((d) => d.id === b.driverId)
      ? (() => { const d = db.drivers.find((x) => x.id === b.driverId); return { id: d.id, name: d.name }; })()
      : null,
  }));
  res.json({ bookings });
});

// GET /api/payments  (admin)
router.get('/payments/all', requireAuth, requireAdmin, (req, res) => {
  res.json({ payments: db.payments });
});

module.exports = router;
