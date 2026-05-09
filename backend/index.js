require('dotenv').config();

const cors = require('cors');
const express = require('express');
const passport = require('passport');
const connectDB = require('./config/db');
const { getAllowedOrigins, normalizeBaseUrl, validateEnv } = require('./config/env');

const authRoutes = require('./routes/auth');
const holdingsRoutes = require('./routes/holdings');
const positionsRoutes = require('./routes/positions');
const ordersRoutes = require('./routes/orders');
const stocksRoutes = require('./routes/stocks');
const fundsRoutes = require('./routes/funds');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const allowedOrigins = getAllowedOrigins();

connectDB();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!isProduction && allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(normalizeBaseUrl(origin))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());

app.use(passport.initialize());
require('./config/passport')(passport);

app.get('/', (req, res) => {
  res.json({
    message: 'Trading Platform API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/funds', fundsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.message && error.message.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({ message: 'Request origin is not allowed.' });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
