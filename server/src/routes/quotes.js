const express = require('express');
const { distanceBetweenLatLng, roadDistance } = require('../services/distance');
const { priceForTrip, TYPE_RATES } = require('../services/pricing');
const { TRUCK_TYPES } = require('../constants');

const router = express.Router();

// POST /api/quotes  (public) - compute distance + price for a trip.
// Quoting is intentionally open so users can see a price before signing up;
// actually placing a booking still requires authentication.
router.post('/', (req, res) => {
  const { truckType, weight, pickupLat, pickupLng, dropoffLat, dropoffLng, distanceKm } = req.body || {};
  if (!truckType || !TRUCK_TYPES.includes(truckType)) {
    return res.status(400).json({ error: `Valid truckType is required (one of ${TRUCK_TYPES.join(', ')})` });
  }
  const tonnes = Number(weight) || 0;

  let distance;
  if (distanceKm) {
    distance = Number(distanceKm);
  } else if ([pickupLat, pickupLng, dropoffLat, dropoffLng].every((n) => Number.isFinite(Number(n)))) {
    const straight = distanceBetweenLatLng(
      Number(pickupLat), Number(pickupLng), Number(dropoffLat), Number(dropoffLng)
    );
    distance = roadDistance(straight);
  } else {
    return res.status(400).json({ error: 'Provide distanceKm or valid pickup/dropoff coordinates' });
  }

  const quote = priceForTrip({ truckType, distanceKm: distance, weight: tonnes });
  return res.json(quote);
});

// GET /api/quotes/rates  (public) - expose truck type rate card
router.get('/rates', (req, res) => {
  res.json({ rates: TYPE_RATES, types: TRUCK_TYPES });
});

module.exports = router;
