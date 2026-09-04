/**
 * Pricing engine. Truck-specific base rates per kilometre are stored on each
 * truck; the requested truck type carries a representative rate used for
 * quoting even before a specific unit is assigned.
 */

const UVL = 0.15; // 15% VAT (South African standard rate)

// Representative default rate per km by truck type (used for quoting).
const TYPE_RATES = {
  'Bakkie / 1-ton': { ratePerKm: 38, tonRate: 40, base: 150 },
  'Box Truck': { ratePerKm: 72, tonRate: 22, base: 350 },
  'Flatbed': { ratePerKm: 95, tonRate: 18, base: 450 },
  'Fridge': { ratePerKm: 110, tonRate: 20, base: 550 },
  'Tanker': { ratePerKm: 130, tonRate: 15, base: 650 },
  'Lowbed': { ratePerKm: 150, tonRate: 16, base: 750 },
  'Side Tipper': { ratePerKm: 175, tonRate: 13, base: 800 },
  'Super Link': { ratePerKm: 160, tonRate: 14, base: 750 },
};

/**
 * Compute a trip quote.
 * @param {object} input
 * @param {string} input.truckType
 * @param {number} input.distanceKm
 * @param {number} input.weight  tonnes
 * @param {object} [input.rates] optional per-truck overrides
 * @returns {{price:number, subTotal:number, tax:number, distanceKm:number, breakdown:object}}
 */
function priceForTrip({ truckType, distanceKm, weight }) {
  const cfg = TYPE_RATES[truckType] || TYPE_RATES['Flatbed'];
  const distanceCharge = cfg.ratePerKm * (Number(distanceKm) || 0);
  const loadCharge = cfg.tonRate * Math.max(0, Number(weight) || 0);
  const subTotal = cfg.base + distanceCharge + loadCharge;
  const tax = subTotal * UVL;
  const price = Math.round(subTotal + tax);
  return {
    price,
    subTotal: Math.round(subTotal),
    tax: Math.round(tax),
    distanceKm,
    breakdown: {
      baseFee: cfg.base,
      distanceCharge: Math.round(distanceCharge),
      perKm: cfg.ratePerKm,
      loadCharge: Math.round(loadCharge),
      perTon: cfg.tonRate,
      vat: Math.round(tax),
    },
  };
}

module.exports = { priceForTrip, TYPE_RATES };
