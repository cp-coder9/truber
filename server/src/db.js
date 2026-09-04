/**
 * BridgeTech Logistics - lightweight JSON-backed data store.
 *
 * This module owns the persistence layer. All data is held in memory for speed
 * and flushed to a single JSON file on disk (server/data/db.json) so that the
 * platform survives restarts without needing an external database engine.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uuidv4 = () => crypto.randomUUID();

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function seedPayload() {
  return {
    users: [
      {
        id: uuidv4(),
        role: 'admin',
        name: 'BridgeTech Admin',
        email: 'admin@bridgetech.co.za',
        phone: '+27 21 555 0100',
        passwordHash: null, // filled on first boot by seedAuth()
        createdAt: new Date().toISOString(),
      },
    ],
    trucks: [
      {
        id: uuidv4(),
        plate: 'CA 458-391',
        make: 'Mercedes-Benz',
        model: 'Actros 2645',
        type: 'Flatbed',
        capacityTons: 12,
        lengthMeters: 14,
        ratePerKm: 95,
        tonRate: 18,
        year: 2019,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Cape Town, Western Cape',
      },
      {
        id: uuidv4(),
        plate: 'GP 812-774',
        make: 'Scania',
        model: 'R500 LR',
        type: 'Super Link',
        capacityTons: 32,
        lengthMeters: 22,
        ratePerKm: 160,
        tonRate: 14,
        year: 2021,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Johannesburg, Gauteng',
      },
      {
        id: uuidv4(),
        plate: 'KZN 990-220',
        make: 'Volvo',
        model: 'FH16 660',
        type: 'Side Tipper',
        capacityTons: 34,
        lengthMeters: 21,
        ratePerKm: 175,
        tonRate: 13,
        year: 2020,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Durban, KwaZulu-Natal',
      },
      {
        id: uuidv4(),
        plate: 'EC 220-118',
        make: 'Hino',
        model: '500 Series 1626',
        type: 'Box Truck',
        capacityTons: 8,
        lengthMeters: 9,
        ratePerKm: 72,
        tonRate: 22,
        year: 2018,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Gqeberha, Eastern Cape',
      },
      {
        id: uuidv4(),
        plate: 'CF 134-560',
        make: 'Isuzu',
        model: 'NQR 500',
        type: 'Bakkie / 1-ton',
        capacityTons: 1,
        lengthMeters: 3,
        ratePerKm: 38,
        tonRate: 40,
        year: 2022,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Bloemfontein, Free State',
      },
      {
        id: uuidv4(),
        plate: 'MP 707-345',
        make: 'MAN',
        model: 'TGS 26.480',
        type: 'Fridge',
        capacityTons: 14,
        lengthMeters: 13,
        ratePerKm: 110,
        tonRate: 20,
        year: 2020,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Mbombela, Mpumalanga',
      },
      {
        id: uuidv4(),
        plate: 'WC 601-902',
        make: 'Daf',
        model: 'XF 530 FT',
        type: 'Tanker',
        capacityTons: 20,
        lengthMeters: 16,
        ratePerKm: 130,
        tonRate: 15,
        year: 2019,
        fuelType: 'Diesel',
        status: 'maintenance',
        driverId: null,
        location: 'Cape Town, Western Cape',
      },
      {
        id: uuidv4(),
        plate: 'GA 554-009',
        make: 'Iveco',
        model: 'Stralis 440',
        type: 'Lowbed',
        capacityTons: 28,
        lengthMeters: 18,
        ratePerKm: 150,
        tonRate: 16,
        year: 2017,
        fuelType: 'Diesel',
        status: 'available',
        driverId: null,
        location: 'Polokwane, Limpopo',
      },
    ],
    drivers: [
      {
        id: uuidv4(),
        name: 'Thabo Nkosi',
        phone: '+27 82 555 1101',
        email: 'thabo.nkosi@bridgetech.co.za',
        licenseNumber: 'A1234567',
        licenseType: 'Code 14',
        status: 'available',
        rating: 4.9,
        yearsExperience: 14,
        truckId: null,
        location: 'Cape Town, Western Cape',
      },
      {
        id: uuidv4(),
        name: 'Pieter van der Merwe',
        phone: '+27 83 555 1102',
        email: 'pieter.vdm@bridgetech.co.za',
        licenseNumber: 'B7654321',
        licenseType: 'Code 14',
        status: 'available',
        rating: 4.7,
        yearsExperience: 11,
        truckId: null,
        location: 'Johannesburg, Gauteng',
      },
      {
        id: uuidv4(),
        name: 'Sipho Dlamini',
        phone: '+27 79 555 1103',
        email: 'sipho.dlamini@bridgetech.co.za',
        licenseNumber: 'C9988776',
        licenseType: 'Code 14',
        status: 'available',
        rating: 4.8,
        yearsExperience: 9,
        truckId: null,
        location: 'Durban, KwaZulu-Natal',
      },
      {
        id: uuidv4(),
        name: 'Lindiwe Mokoena',
        phone: '+27 84 555 1104',
        email: 'lindiwe.mokoena@bridgetech.co.za',
        licenseNumber: 'D5566774',
        licenseType: 'Code 10',
        status: 'available',
        rating: 4.6,
        yearsExperience: 7,
        truckId: null,
        location: 'Bloemfontein, Free State',
      },
      {
        id: uuidv4(),
        name: 'Johan Botha',
        phone: '+27 72 555 1105',
        email: 'johan.botha@bridgetech.co.za',
        licenseNumber: 'E3344556',
        licenseType: 'Code 14',
        status: 'off',
        rating: 4.5,
        yearsExperience: 18,
        truckId: null,
        location: 'Gqeberha, Eastern Cape',
      },
      {
        id: uuidv4(),
        name: 'Ntombi Khumalo',
        phone: '+27 76 555 1106',
        email: 'ntombi.khumalo@bridgetech.co.za',
        licenseNumber: 'F1122334',
        licenseType: 'Code 10',
        status: 'available',
        rating: 4.9,
        yearsExperience: 12,
        truckId: null,
        location: 'Mbombela, Mpumalanga',
      },
      {
        id: uuidv4(),
        name: 'Riaan Swanepoel',
        phone: '+27 81 555 1107',
        email: 'riaan.swanepoel@bridgetech.co.za',
        licenseNumber: 'G6677889',
        licenseType: 'Code 14',
        status: 'available',
        rating: 4.4,
        yearsExperience: 16,
        truckId: null,
        location: 'Polokwane, Limpopo',
      },
    ],
    customers: [
      {
        id: uuidv4(),
        role: 'customer',
        name: 'Lerato Molefe',
        email: 'lerato@acmegoods.co.za',
        phone: '+27 71 555 2201',
        company: 'Acme Foods (Pty) Ltd',
        passwordHash: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        role: 'customer',
        name: 'David Naidoo',
        email: 'david@steelmart.co.za',
        phone: '+27 78 555 2202',
        company: 'SteelMart Trading',
        passwordHash: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        role: 'customer',
        name: 'Sarah van Wyk',
        email: 'sarah@winelands.co.za',
        phone: '+27 82 555 2203',
        company: 'Winelands Logistics',
        passwordHash: null,
        createdAt: new Date().toISOString(),
      },
    ],
    bookings: [],
    payments: [],
  };
}

/**
 * Load the database from disk. If the file does not exist, seed it.
 */
function loadDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const payload = seedPayload();
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2));
    return payload;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // Corrupt file -> fall back to a fresh seed.
    const payload = seedPayload();
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2));
    return payload;
  }
}

const db = loadDb();

/**
 * Persist the in-memory database to disk.
 */
function save() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

module.exports = { db, save, uuidv4 };
