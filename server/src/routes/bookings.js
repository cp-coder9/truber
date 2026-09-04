const express = require('express');
const { db, save, uuidv4 } = require('../db');
const { requireAuth, requireAdmin } = require('../auth');
const { distanceBetweenLatLng, roadDistance } = require('../services/distance');
const { priceForTrip, TYPE_RATES } = require('../services/pricing');
const { buildInvoice } = require('../services/invoice');
const { computeCancellationFee } = require('../services/cancellation');
const { TRUCK_TYPES, PAYMENT_METHODS } = require('../constants');

const router = express.Router();

function makeReference() {
  return `BT-${uuidv4().slice(0, 6).toUpperCase()}`;
}

function pushTimeline(booking, status, note) {
  booking.timeline.push({ status, at: new Date().toISOString(), note });
}

function findSecureBooking(id, req) {
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return { booking: null };
  if (req.user.role !== 'admin' && booking.customerId !== req.user.sub) {
    return { forbidden: true };
  }
  return { booking };
}

function summarizeTruck(truck) {
  return truck
    ? { id: truck.id, plate: truck.plate, make: truck.make, model: truck.model, type: truck.type }
    : null;
}

function summarizeDriver(driver) {
  return driver
    ? { id: driver.id, name: driver.name, phone: driver.phone, rating: driver.rating, licenseType: driver.licenseType }
    : null;
}

// helper: load a freshly-read booking with embedded truck/driver summaries
function withRefs(booking) {
  const b = { ...booking };
  b.truck = summarizeTruck(db.trucks.find((t) => t.id === booking.truckId));
  b.driver = summarizeDriver(db.drivers.find((d) => d.id === booking.driverId));
  return b;
}

function recordPayment(booking, method) {
  const payment = {
    id: uuidv4(),
    bookingId: booking.id,
    reference: `PAY-${uuidv4().slice(0, 6).toUpperCase()}`,
    amount: booking.estimatedPrice,
    method,
    status: 'paid',
    kind: 'booking',
    createdAt: new Date().toISOString(),
  };
  db.payments.push(payment);
  return payment;
}

// POST /api/bookings  (customer) — creates a booking and records payment
// immediately (pay-on-book), so the trip is confirmed & paid from the outset.
router.post('/', requireAuth, (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can create bookings' });
  }
  const { truckType, weight, cargoDescription, pickupAddress, dropoffAddress, scheduledAt, paymentMethod, distanceKm } = req.body || {};
  const pickupLat = Number(req.body.pickupLat);
  const pickupLng = Number(req.body.pickupLng);
  const dropoffLat = Number(req.body.dropoffLat);
  const dropoffLng = Number(req.body.dropoffLng);

  if (!truckType || !TRUCK_TYPES.includes(truckType)) {
    return res.status(400).json({ error: `Valid truckType is required (one of ${TRUCK_TYPES.join(', ')})` });
  }
  if (!pickupAddress || !dropoffAddress) {
    return res.status(400).json({ error: 'Pickup and dropoff addresses are required' });
  }
  if (![pickupLat, pickupLng, dropoffLat, dropoffLng].every((n) => Number.isFinite(n))) {
    return res.status(400).json({ error: 'Valid coordinates are required' });
  }

  // Validate scheduling time
  let scheduleAt = scheduledAt ? new Date(scheduledAt) : new Date();
  if (Number.isNaN(scheduleAt.getTime())) {
    return res.status(400).json({ error: 'Invalid scheduled time' });
  }
  if (scheduleAt.getTime() < Date.now() - 5 * 60 * 1000) {
    return res.status(400).json({ error: 'Scheduled time must be in the future' });
  }

  const tonnes = Number(weight) || 0;
  const straight = distanceBetweenLatLng(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const distance = distanceKm ? Number(distanceKm) : roadDistance(straight);
  const { price } = priceForTrip({ truckType, distanceKm: distance, weight: tonnes });

  const customer = db.customers.find((c) => c.id === req.user.sub);
  const method = paymentMethod && PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : null;

  const booking = {
    id: uuidv4(),
    reference: makeReference(),
    customerId: customer.id,
    customerName: customer.name,
    company: customer.company || null,
    pickupAddress,
    dropoffAddress,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    distanceKm: Math.round(distance * 10) / 10,
    truckType,
    cargoDescription: cargoDescription || '',
    weight: tonnes,
    truckId: null,
    driverId: null,
    estimatedPrice: price,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: method,
    cancellationFee: 0,
    createdAt: new Date().toISOString(),
    scheduledAt: scheduleAt.toISOString(),
    scheduled: scheduleAt.getTime() > Date.now() + 30 * 60 * 1000,
    timeline: [],
  };
  pushTimeline(booking, 'requested', 'Booking requested');

  // Pay immediately on booking — trips are paid up front, no delay.
  if (method) {
    const payment = recordPayment(booking, method);
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    pushTimeline(booking, 'paid', `Payment of ${currency(price)} received at booking (${method.toUpperCase()})`);
    pushTimeline(booking, 'confirmed', 'Booking confirmed — payment settled');
    db.bookings.push(booking);
    save();
    return res.status(201).json({ booking: withRefs(booking), payment });
  }

  // Fallback for non-payment flows (e.g. manual API/quote-only).
  db.bookings.push(booking);
  save();
  res.status(201).json({ booking: withRefs(booking) });
});

// GET /api/bookings  (auth) - admin sees all; customer sees own
router.get('/', requireAuth, (req, res) => {
  let list = db.bookings;
  if (req.user.role !== 'admin') {
    list = list.filter((b) => b.customerId === req.user.sub);
  }
  if (req.query.status) {
    list = list.filter((b) => b.status === req.query.status);
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings: list.map(withRefs) });
});

// GET /api/bookings/:id  (auth)
router.get('/:id', requireAuth, (req, res) => {
  const { booking, forbidden } = findSecureBooking(req.params.id, req);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (forbidden) return res.status(403).json({ error: 'Access denied' });
  res.json({ booking: withRefs(booking) });
});

// GET /api/bookings/:id/invoice  (auth) - printable tax invoice / receipt
router.get('/:id/invoice', requireAuth, (req, res) => {
  const { booking, forbidden } = findSecureBooking(req.params.id, req);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (forbidden) return res.status(403).json({ error: 'Access denied' });
  const payment = db.payments.find((p) => p.bookingId === booking.id && p.status === 'paid');
  const customer = db.customers.find((c) => c.id === booking.customerId);
  const invoice = buildInvoice(booking, payment, customer);
  res.json({ invoice });
});

// PATCH /api/bookings/:id/assign  (admin) - assign truck + driver
router.patch('/:id/assign', requireAuth, requireAdmin, (req, res) => {
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const { truckId, driverId } = req.body || {};
  if (truckId) {
    const truck = db.trucks.find((t) => t.id === truckId);
    if (!truck) return res.status(404).json({ error: 'Truck not found' });
    booking.truckId = truck.id;
    if (truck.status !== 'on_trip') truck.status = 'on_trip';
    truck.driverId = driverId || truck.driverId || null;
  }
  if (driverId) {
    const driver = db.drivers.find((d) => d.id === driverId);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    booking.driverId = driver.id;
    if (driver.status !== 'on_trip') driver.status = 'on_trip';
    driver.truckId = truckId || driver.truckId || null;
  }
  if (driverId && truckId) {
    pushTimeline(booking, 'assigned', `Assigned ${summarizeTruck(db.trucks.find(t=>t.id===truckId))?.plate} / ${summarizeDriver(db.drivers.find(d=>d.id===driverId))?.name}`);
  }
  save();
  res.json({ booking: withRefs(booking) });
});

// PATCH /api/bookings/:id/status  (admin) - advance workflow
router.patch('/:id/status', requireAuth, requireAdmin, (req, res) => {
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const { status, note } = req.body || {};
  const allowed = ['confirmed', 'in_transit', 'delivered', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of ${allowed.join(', ')}` });
  }
  booking.status = status;
  pushTimeline(booking, status, note || `Status changed to ${status}`);

  if (status === 'confirmed' || status === 'in_transit') {
    if (booking.truckId) {
      const truck = db.trucks.find((t) => t.id === booking.truckId);
      if (truck) truck.status = 'on_trip';
    }
    if (booking.driverId) {
      const driver = db.drivers.find((d) => d.id === booking.driverId);
      if (driver) driver.status = 'on_trip';
    }
  }
  if (status === 'delivered' || status === 'completed') {
    if (booking.truckId) {
      const truck = db.trucks.find((t) => t.id === booking.truckId);
      if (truck) truck.status = 'available';
    }
    if (booking.driverId) {
      const driver = db.drivers.find((d) => d.id === booking.driverId);
      if (driver) driver.status = 'available';
    }
  }
  if (status === 'completed') booking.paymentStatus = 'paid';
  save();
  res.json({ booking: withRefs(booking) });
});

// POST /api/bookings/:id/cancel  (customer or admin) — applies a handling fee
router.post('/:id/cancel', requireAuth, (req, res) => {
  const { booking, forbidden } = findSecureBooking(req.params.id, req);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (forbidden) return res.status(403).json({ error: 'Access denied' });
  if (booking.status === 'delivered' || booking.status === 'completed') {
    return res.status(400).json({ error: 'A completed booking cannot be cancelled' });
  }
  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }

  const { amount, label } = computeCancellationFee({
    price: booking.estimatedPrice,
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    hasTruck: !!booking.truckId,
    hasDriver: !!booking.driverId,
  });

  booking.cancellationFee = amount;
  booking.status = 'cancelled';
  pushTimeline(booking, 'cancelled', req.body?.note || 'Cancelled by customer');

  if (amount > 0) {
    pushTimeline(booking, 'cancellation_fee', `Cancellation handling fee of ${currency(amount)} applied (${label})`);
  }

  // If the trip was already paid, compute the refund after the fee.
  if (booking.paymentStatus === 'paid') {
    const refund = Math.max(0, booking.estimatedPrice - amount);
    booking.refundAmount = refund;
    pushTimeline(
      booking,
      'refund',
      refund > 0 ? `Refund of ${currency(refund)} processed after ${currency(amount)} cancellation fee` : 'No refund — cancellation fee equals amount paid'
    );
  }

  // release assigned resources
  if (booking.truckId) {
    const truck = db.trucks.find((t) => t.id === booking.truckId);
    if (truck) truck.status = 'available';
  }
  if (booking.driverId) {
    const driver = db.drivers.find((d) => d.id === booking.driverId);
    if (driver) driver.status = 'available';
  }

  save();
  res.json({ booking: withRefs(booking), cancellationFee: amount, refundAmount: booking.refundAmount || 0, feeLabel: label });
});

// POST /api/bookings/:id/pay  (customer or admin) - mark paid (fallback)
router.post('/:id/pay', requireAuth, (req, res) => {
  const { booking, forbidden } = findSecureBooking(req.params.id, req);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (forbidden) return res.status(403).json({ error: 'Access denied' });
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ error: 'Booking is already paid' });
  }
  const method = req.body?.method || booking.paymentMethod || 'card';
  const payment = recordPayment(booking, method);
  booking.paymentStatus = 'paid';
  booking.paymentMethod = method;
  pushTimeline(booking, 'paid', `Payment of ${currency(booking.estimatedPrice)} received (${method.toUpperCase()})`);
  save();
  res.json({ booking: withRefs(booking), payment });
});

function currency(n) {
  return 'R' + Number(n).toLocaleString('en-ZA', { maximumFractionDigits: 0 });
}

module.exports = router;
