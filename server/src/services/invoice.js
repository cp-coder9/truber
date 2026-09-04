/**
 * Invoice / receipt generation for completed bookings.
 *
 * Generates a printable tax invoice (or receipt when the booking has been
 * paid). Pricing is re-derived from the same engine used at booking time so
 * line items always match what the customer was quoted.
 */

const { priceForTrip } = require('./pricing');

const COMPANY = {
  name: 'BridgeTech Logistics (Pty) Ltd',
  regNo: '2024/123456/07',
  vatNo: '4880123456',
  address: '1 Logistics Park, N1 Business Hub',
  city: 'Cape Town, 7441',
  country: 'South Africa',
  email: 'billing@bridgetech.co.za',
  phone: '+27 21 555 0100',
};

const CURRENCY = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

function currency(n) {
  return CURRENCY.format(Number(n) || 0);
}

/**
 * Build an invoice object for a booking.
 * @param {object} booking  a booking from the store
 * @param {object|null} payment  matching paid payment record, if any
 * @param {object|null} customer  the customer record, if available
 */
function buildInvoice(booking, payment, customer) {
  const quote = priceForTrip({
    truckType: booking.truckType,
    distanceKm: booking.distanceKm,
    weight: booking.weight,
  });

  const invoiceNumber = `INV-${booking.reference.replace(/^BT-/, '')}`;
  const issueDate = new Date(booking.createdAt);
  const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const paid = booking.paymentStatus === 'paid';
  const paidAt = payment ? payment.createdAt : paid ? new Date().toISOString() : null;

  const items = [
    {
      label: 'Truck hire — base fee',
      detail: `${booking.truckType} booking`,
      amount: quote.breakdown.baseFee,
    },
    {
      label: 'Distance charge',
      detail: `${booking.distanceKm} km × ${currency(quote.breakdown.perKm)}/km`,
      amount: quote.breakdown.distanceCharge,
    },
    {
      label: 'Load / weight charge',
      detail: `${booking.weight} t × ${currency(quote.breakdown.perTon)}/t`,
      amount: quote.breakdown.loadCharge,
    },
  ];

  let total = booking.estimatedPrice;
  let cancellationFee = 0;
  let refundAmount = 0;

  if (booking.status === 'cancelled') {
    cancellationFee = booking.cancellationFee || 0;
    items.push({
      label: 'Cancellation handling fee',
      detail: 'Applied on cancellation',
      amount: cancellationFee,
    });
    // Total that was charged/owed now reflects the fee.
    total = cancellationFee;
    refundAmount = booking.refundAmount || Math.max(0, booking.estimatedPrice - cancellationFee);
  }

  return {
    kind: paid ? 'receipt' : 'invoice',
    invoiceNumber,
    reference: booking.reference,
    bookingId: booking.id,
    issueDate: issueDate.toISOString(),
    dueDate: dueDate.toISOString(),
    paid,
    paidAt,
    paymentMethod: payment ? payment.method : booking.paymentMethod || null,
    paymentReference: payment ? payment.reference : null,
    total,
    subtotal: booking.status === 'cancelled' ? 0 : quote.subTotal,
    vat: booking.status === 'cancelled' ? 0 : quote.tax,
    cancellationFee,
    refundAmount,
    status: booking.status,
    paidAtBooking: !!payment,
    scheduledAt: booking.scheduledAt,
    company: COMPANY,
    billTo: {
      name: booking.customerName,
      company: booking.company || null,
      email: customer ? customer.email : null,
      phone: customer ? customer.phone : null,
    },
    service: {
      truckType: booking.truckType,
      distanceKm: booking.distanceKm,
      weight: booking.weight,
      cargo: booking.cargoDescription || '',
      pickup: booking.pickupAddress,
      dropoff: booking.dropoffAddress,
      scheduledAt: booking.scheduledAt,
    },
    items,
    currencyFn: currency,
  };
}

module.exports = { buildInvoice, currency };
