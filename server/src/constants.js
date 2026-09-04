const TRUCK_TYPES = [
  'Bakkie / 1-ton',
  'Box Truck',
  'Flatbed',
  'Fridge',
  'Tanker',
  'Lowbed',
  'Side Tipper',
  'Super Link',
];

const TRUCK_STATUSES = ['available', 'on_trip', 'maintenance', 'off'];

const DRIVER_STATUSES = ['available', 'on_trip', 'off'];

const LICENSE_TYPES = ['Code 8', 'Code 10', 'Code 14'];

const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
];

const PAYMENT_METHODS = ['card', 'eft', 'cash', 'voucher'];

module.exports = {
  TRUCK_TYPES,
  TRUCK_STATUSES,
  DRIVER_STATUSES,
  LICENSE_TYPES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
};
