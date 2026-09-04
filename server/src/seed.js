/**
 * Seed default credentials and a small set of sample bookings so the
 * dashboards have realistic data on first run.
 *
 * Default credentials:
 *   Admin    -> admin@bridgetech.co.za   / Admin@123
 *   Customer -> lerato@acmegoods.co.za   / Customer@123
 *   Customer -> david@steelmart.co.za    / Customer@123
 *   Customer -> sarah@winelands.co.za    / Customer@123
 */

const bcrypt = require('bcryptjs');
const { db, save, uuidv4 } = require('./db');
const { distanceBetweenLatLng, roadDistance } = require('./services/distance');
const { priceForTrip } = require('./services/pricing');

function ensureDefaultPasswords() {
  const now = new Date().toISOString();
  const defaults = {
    'admin@bridgetech.co.za': 'Admin@123',
    'lerato@acmegoods.co.za': 'Customer@123',
    'david@steelmart.co.za': 'Customer@123',
    'sarah@winelands.co.za': 'Customer@123',
  };

  const applyDefaults = (rows) => {
    for (const user of rows) {
      if (!user.passwordHash && defaults[user.email]) {
        user.passwordHash = bcrypt.hashSync(defaults[user.email], 10);
        user.createdAt = user.createdAt || now;
      }
    }
  };
  applyDefaults(db.users);
  applyDefaults(db.customers);
}

const SA_CITIES = {
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  'Durban': { lat: -29.8587, lng: 31.0218 },
  'Gqeberha': { lat: -33.9608, lng: 25.6022 },
  'Bloemfontein': { lat: -29.0852, lng: 26.1596 },
  'Mbombela': { lat: -25.4585, lng: 30.9699 },
  'Polokwane': { lat: -23.9045, lng: 29.4689 },
  'Pretoria': { lat: -25.7479, lng: 28.2293 },
  'Stellenbosch': { lat: -33.9321, lng: 18.8612 },
};

function coordsFor(city) {
  return SA_CITIES[city] || SA_CITIES['Cape Town'];
}

function makeBooking({
  customer,
  truckType,
  fromCity,
  toCity,
  cargo,
  weight,
  status,
  assignedTruck,
  assignedDriver,
  paymentStatus,
  paymentMethod,
  createdAt,
  scheduledAt,
}) {
  const pickup = coordsFor(fromCity);
  const dropoff = coordsFor(toCity);
  const straight = distanceBetweenLatLng(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const distance = roadDistance(straight);
  const { price } = priceForTrip({ truckType, distanceKm: distance, weight });
  const id = uuidv4();
  const reference = `BT-${id.slice(0, 6).toUpperCase()}`;

  const timeline = [];
  const push = (s, note) => timeline.push({ status: s, at: new Date(createdAt).toISOString(), note });
  push('requested', 'Booking created');

  if (status !== 'pending' && status !== 'cancelled') {
    push('confirmed', 'Booking confirmed by BridgeTech');
  }
  if (status === 'in_transit' || status === 'delivered' || status === 'completed') {
    push('in_transit', `Driver en route from ${fromCity}`);
  }
  if (status === 'delivered' || status === 'completed') {
    push('delivered', `Delivered in ${toCity}`);
  }
  if (status === 'completed') {
    push('completed', 'Job completed - payment settled');
  }
  if (status === 'cancelled') {
    timeline.push({ status: 'cancelled', at: new Date(createdAt).toISOString(), note: 'Cancelled by customer' });
  }

  return {
    id,
    reference,
    customerId: customer.id,
    customerName: customer.name,
    company: customer.company || null,
    pickupAddress: `${fromCity} Distribution Hub, ${fromCity}, South Africa`,
    dropoffAddress: `${toCity} Industrial Park, ${toCity}, South Africa`,
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    dropoffLat: dropoff.lat,
    dropoffLng: dropoff.lng,
    distanceKm: Math.round(distance * 10) / 10,
    truckType,
    cargoDescription: cargo,
    weight,
    truckId: assignedTruck ? assignedTruck.id : null,
    truck: assignedTruck
      ? { id: assignedTruck.id, plate: assignedTruck.plate, make: assignedTruck.make, model: assignedTruck.model, type: assignedTruck.type }
      : null,
    driverId: assignedDriver ? assignedDriver.id : null,
    driver: assignedDriver
      ? { id: assignedDriver.id, name: assignedDriver.name, phone: assignedDriver.phone, rating: assignedDriver.rating }
      : null,
    estimatedPrice: Math.round(price),
    status,
    paymentStatus,
    paymentMethod: paymentMethod || null,
    createdAt,
    scheduledAt: scheduledAt || createdAt,
    timeline,
  };
}

function seedSampleBookings() {
  if (db.bookings.length > 0) return;

  const customers = {
    lerato: db.customers.find((c) => c.email === 'lerato@acmegoods.co.za'),
    david: db.customers.find((c) => c.email === 'david@steelmart.co.za'),
    sarah: db.customers.find((c) => c.email === 'sarah@winelands.co.za'),
  };
  const trucks = {
    superlink: db.trucks.find((t) => t.type === 'Super Link'),
    flatbed: db.trucks.find((t) => t.type === 'Flatbed'),
    fridge: db.trucks.find((t) => t.type === 'Fridge'),
    bakkie: db.trucks.find((t) => t.type === 'Bakkie / 1-ton'),
    lowbed: db.trucks.find((t) => t.type === 'Lowbed'),
  };
  const drivers = {
    thabo: db.drivers.find((d) => d.name === 'Thabo Nkosi'),
    pieter: db.drivers.find((d) => d.name === 'Pieter van der Merwe'),
    sipho: db.drivers.find((d) => d.name === 'Sipho Dlamini'),
    ntombi: db.drivers.find((d) => d.name === 'Ntombi Khumalo'),
    riaan: db.drivers.find((d) => d.name === 'Riaan Swanepoel'),
  };

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const samples = [
    makeBooking({
      customer: customers.lerato,
      truckType: 'Super Link',
      fromCity: 'Johannesburg',
      toCity: 'Durban',
      cargo: 'Packaged food & beverages',
      weight: 28,
      status: 'in_transit',
      assignedTruck: trucks.superlink,
      assignedDriver: drivers.sipho,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      createdAt: new Date(now - day * 1.2).toISOString(),
      scheduledAt: new Date(now - day * 1.0).toISOString(),
    }),
    makeBooking({
      customer: customers.david,
      truckType: 'Flatbed',
      fromCity: 'Gqeberha',
      toCity: 'Cape Town',
      cargo: 'Steel beams & rebar',
      weight: 10,
      status: 'confirmed',
      assignedTruck: trucks.flatbed,
      assignedDriver: drivers.thabo,
      paymentStatus: 'paid',
      paymentMethod: 'eft',
      createdAt: new Date(now - day * 0.6).toISOString(),
      scheduledAt: new Date(now + day * 0.4).toISOString(),
    }),
    makeBooking({
      customer: customers.sarah,
      truckType: 'Fridge',
      fromCity: 'Cape Town',
      toCity: 'Bloemfontein',
      cargo: 'Chilled wine & produce',
      weight: 12,
      status: 'pending',
      assignedTruck: null,
      assignedDriver: null,
      paymentStatus: 'unpaid',
      paymentMethod: null,
      createdAt: new Date(now - day * 0.2).toISOString(),
      scheduledAt: new Date(now + day * 0.8).toISOString(),
    }),
    makeBooking({
      customer: customers.lerato,
      truckType: 'Bakkie / 1-ton',
      fromCity: 'Cape Town',
      toCity: 'Stellenbosch',
      cargo: 'Office relocation - small load',
      weight: 0.8,
      status: 'completed',
      assignedTruck: trucks.bakkie,
      assignedDriver: drivers.ntombi,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      createdAt: new Date(now - day * 5).toISOString(),
      scheduledAt: new Date(now - day * 4).toISOString(),
    }),
    makeBooking({
      customer: customers.david,
      truckType: 'Lowbed',
      fromCity: 'Polokwane',
      toCity: 'Pretoria',
      cargo: 'Excavator & machinery',
      weight: 26,
      status: 'completed',
      assignedTruck: trucks.lowbed,
      assignedDriver: drivers.riaan,
      paymentStatus: 'paid',
      paymentMethod: 'eft',
      createdAt: new Date(now - day * 9).toISOString(),
      scheduledAt: new Date(now - day * 8).toISOString(),
    }),
  ];

  db.bookings.push(...samples);
}

function runSeeds() {
  ensureDefaultPasswords();
  seedSampleBookings();
  save();
}

module.exports = { runSeeds };
