const express = require('express');
const cors = require('cors');
const { runSeeds } = require('./seed');
const places = require('./places');

const authRoutes = require('./routes/auth');
const truckRoutes = require('./routes/trucks');
const driverRoutes = require('./routes/drivers');
const quoteRoutes = require('./routes/quotes');
const bookingRoutes = require('./routes/bookings');
const customerRoutes = require('./routes/customers');
const statsRoutes = require('./routes/stats');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Simple request log
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'BridgeTech Logistics API' }));

// Public place search (offline geocoder for SA cities)
app.get('/api/places', (req, res) => res.json({ results: places.search(req.query.q || '') }));
app.get('/api/places/all', (_req, res) => res.json({ places: places.all() }));

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stats', statsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Boot
runSeeds();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BridgeTech Logistics API listening on http://0.0.0.0:${PORT}`);
});
