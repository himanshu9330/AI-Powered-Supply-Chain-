const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const warehouseRoutes = require('./modules/warehouses/warehouse.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const supplierRoutes = require('./modules/suppliers/supplier.routes');
const purchaseOrderRoutes = require('./modules/purchase-orders/purchaseOrder.routes');
const salesRoutes = require('./modules/sales/sales.routes');
const transferRoutes = require('./modules/transfers/transfer.routes');
const forecastRoutes = require('./modules/forecasts/forecast.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const optimizationRoutes = require('./modules/optimization/optimization.routes');
const reportRoutes = require('./modules/reports/report.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

const app = express();

// ── Security & Parsing ─────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// ── CORS ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ───────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Logging ─────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(requestLogger);

// ── Health Check ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'supply-chain-control-tower-api', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────────────
const API = '/api';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/warehouses`, warehouseRoutes);
app.use(`${API}/inventory`, inventoryRoutes);
app.use(`${API}/suppliers`, supplierRoutes);
app.use(`${API}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API}/sales`, salesRoutes);
app.use(`${API}/transfers`, transferRoutes);
app.use(`${API}/forecasts`, forecastRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/optimization`, optimizationRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/notifications`, notificationRoutes);

// ── 404 ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
