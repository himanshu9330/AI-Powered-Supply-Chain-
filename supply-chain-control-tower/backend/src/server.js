require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Catch unhandled promises and exceptions to prevent nodemon crashes
process.on('unhandledRejection', (reason) => {
  logger.warn('⚠️ Unhandled Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
  logger.warn('⚠️ Uncaught Exception:', err?.message || err);
});

const startServer = async () => {
  try {
    await db.connect();
  } catch (error) {
    logger.warn('⚠️ Database initialization warning:', error.message || error);
  }

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Supply Chain Control Tower API running on port ${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   ML Service:  ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use by another process.`);
      logger.info(`💡 Please terminate the process using port ${PORT} or restart nodemon.`);
    } else {
      logger.error('❌ Server error:', error.message);
    }
  });
};

startServer();
