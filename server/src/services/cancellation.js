/**
 * Cancellation handling-fee policy.
 *
 * Fees escalate the further a booking has progressed and the closer it is to
 * departure, mirroring how real ride-hailing & freight platforms charge for
 * cancelled trips. The fee is withheld from the amount already paid.
 *
 *   - Not confirmed, > 24h before departure  -> free cancellation
 *   - Not confirmed, within 24h              -> 20% (min R150)
 *   - Confirmed / assigned, > 24h            -> 20% (min R250)
 *   - Confirmed / assigned, within 24h       -> 50%
 *   - Already in transit                     -> 100% (non-refundable)
 */

const MIN_FEE = 150;
const ASSIGNED_MIN_FEE = 250;

function computeCancellationFee({ price, status, scheduledAt, hasTruck, hasDriver }) {
  const p = Number(price) || 0;
  const scheduled = scheduledAt ? new Date(scheduledAt).getTime() : NaN;
  const now = Date.now();
  const within24h = Number.isFinite(scheduled) && scheduled - now < 24 * 60 * 60 * 1000;
  const confirmedOrAssigned =
    status === 'confirmed' || status === 'in_transit' || hasTruck || hasDriver;

  let amount = 0;
  let label = 'No cancellation fee';

  if (status === 'in_transit') {
    amount = p;
    label = '100% of trip (in transit)';
  } else if (confirmedOrAssigned && within24h) {
    amount = Math.round(p * 0.5);
    label = '50% of trip (within 24h of departure)';
  } else if (confirmedOrAssigned) {
    amount = Math.max(Math.round(p * 0.2), ASSIGNED_MIN_FEE);
    label = `20% of trip (min ${currency(ASSIGNED_MIN_FEE)})`;
  } else if (within24h) {
    amount = Math.max(Math.round(p * 0.2), MIN_FEE);
    label = `20% of trip (min ${currency(MIN_FEE)})`;
  }

  return { amount, label, percent: p ? Math.round((amount / p) * 100) : 0 };
}

function currency(n) {
  return 'R' + Number(n).toLocaleString('en-ZA', { maximumFractionDigits: 0 });
}

module.exports = { computeCancellationFee, currency };
