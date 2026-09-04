# BridgeTech Logistics 🚛

An **Uber-style truck hiring platform for South Africa**. Businesses book a verified
truck and professional driver in minutes — from a single pallet to a 32-ton
inter-provincial haul — with instant pricing, live status tracking and secure
payment.

This repository is a full-stack, three-app monorepo:

| App | Folder | Role | Runs on |
|-----|--------|------|---------|
| **Customer frontend** ("BridgeTech Logistics") | `client/` | Book trucks, quote, track trips, pay | http://localhost:5173 |
| **Admin backend** (operations console) | `admin/` | Dashboard, dispatch, fleet & driver management | http://localhost:5174 |
| **REST API** | `server/` | Express + JSON data store, auth, pricing engine | http://localhost:3001 |

> Built with React (Vite), Express, and a zero-config JSON-backed data store — no
> external database or API keys required. Location data uses a built-in offline
> geocoder for South African cities, and the pricing engine computes quotes with
> a per-truck-type rate card plus 15% VAT.

---

## ✨ Features

### Customer app (`client`)
- Branded landing page ("BridgeTech Logistics") with fleet showcase & how-it-works
- **Book a truck** flow: pick a vehicle type, type-to-search SA cities (autocomplete),
  enter load weight & cargo, get an **instant quote** (distance + VAT breakdown)
- **My Trips**: list all bookings with status badges, live trip timeline, assigned
  truck & driver, and one-click **demo payment** (card / EFT)
- **Live tracking map**: an offline SVG map of South Africa with your pickup/drop-off
  pins and an animated truck marker that moves along the route while in transit
- **Invoices & receipts**: view, print or save-as-PDF a signed **tax invoice** (unpaid)
  or **receipt** (paid) with itemised distance, load and VAT line items
- Register / Login with JWT auth

### Admin console (`admin`)
- **Dashboard**: revenue (6-month chart), fleet availability donut, booking status
  breakdown, recent bookings
- **Bookings**: searchable/filterable list + detail view with
  **dispatch** (assign truck & driver), **status advancement** (confirm →
  in transit → delivered → complete), a **live tracking map**, and
  **invoice / receipt generation**
- **Fleet**: add / edit / delete trucks, capacity, rate cards, status
- **Drivers**: add / edit / remove drivers, licenses, ratings, status
- **Customers**: list customers with spend + drill into their bookings

### API (`server`)
- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- `GET /api/places?q=` — offline SA geocoder
- `POST /api/quotes`, `GET /api/quotes/rates`
- `GET/POST /api/bookings`, `GET /api/bookings/:id`, `PATCH .../assign`,
  `PATCH .../status`, `POST .../cancel`, `POST .../pay`
- `GET /api/bookings/:id/invoice` — generated tax invoice / receipt
- `GET/POST/PUT/DELETE /api/trucks`, `/api/drivers` (admin)
- `GET /api/customers`, `GET /api/stats` (admin)

---

## 🔑 Demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bridgetech.co.za` | `Admin@123` |
| Customer | `lerato@acmegoods.co.za` | `Customer@123` |
| Customer | `david@steelmart.co.za` | `Customer@123` |
| Customer | `sarah@winelands.co.za` | `Customer@123` |

New customers can also self-register from the customer app.

---

## 🚀 Getting started

```bash
# 1. Install dependencies (server, client, admin)
npm run install:all

# 2. Start the API (port 3001)
npm run dev:api

# 3. Start the customer app (port 5173)
npm run dev:client

# 4. Start the admin console (port 5174)
npm run dev:admin
```

Production builds:

```bash
npm run build:client   # -> client/dist
npm run build:admin    # -> admin/dist
```

---

## 🗂 Project structure

```
truber/
├── client/          # Customer frontend (React + Vite)
│   └── src/
│       ├── pages/   # Home, Book, Trips, TripDetail, Login, Register
│       ├── components/
│       └── context/AuthContext.jsx
├── admin/           # Admin operations console (React + Vite)
│   └── src/
│       ├── pages/   # Dashboard, Bookings, BookingDetail, Fleet, Drivers, Customers
│       └── components/
├── server/          # Express REST API
│   └── src/
│       ├── routes/  # auth, trucks, drivers, quotes, bookings, customers, stats
│       ├── services/# pricing, distance (offline geo), invoice generation
│       ├── db.js    # JSON data store + seed data
│       └── seed.js  # sample bookings & default credentials
└── package.json
```

---

## ⚙️ How the data store works

`server/src/db.js` keeps everything in memory and flushes to
`server/data/db.json` (git-ignored) on every mutation. On first boot the server
seeds a fleet of 8 trucks, 7 drivers, 3 customers and a few realistic bookings.
Delete `server/data/db.json` to reset to a fresh seed.

---

## 🏳️ Region / currency

- Currency is **South African Rand (ZAR / R)**, formatted with `en-ZA` locales.
- Pricing applies **15% VAT** (South African standard rate) and uses a winding
  factor to approximate road distance from great-circle distance.
- Locations cover major cities across all nine provinces (Cape Town, Johannesburg,
  Durban, Gqeberha, Bloemfontein, Mbombela, Polokwane, Pretoria, East London, and more).
