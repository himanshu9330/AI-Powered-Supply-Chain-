const { Pool } = require('pg');
const logger = require('./logger');

let pool = null;
let isConnected = false;

const connect = async () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/supply_chain';
  
  try {
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    // Handle pool errors gracefully to prevent process crash
    pool.on('error', (err) => {
      logger.warn(`⚠️ PostgreSQL pool error: ${err.message}`);
      isConnected = false;
    });

    const client = await pool.connect();
    client.release();
    isConnected = true;
    logger.info('✅ PostgreSQL connected successfully');
    return pool;
  } catch (err) {
    isConnected = false;
    logger.warn(`⚠️ PostgreSQL connection attempt failed (${err.message}). API will run in standalone mode with mock database fallback.`);
    return null;
  }
};

/**
 * Execute a query against the PostgreSQL pool
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  if (!pool || !isConnected) {
    logger.warn(`[DB] Database query skipped (no active PostgreSQL pool): ${text.substring(0, 60)}...`);
    return { rows: [], rowCount: 0 };
  }

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[DB] query: ${text.substring(0, 80)}... | duration: ${duration}ms | rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    logger.error(`[DB] Query error: ${error.message} | query: ${text.substring(0, 100)}`);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
  if (!pool || !isConnected) {
    throw new Error('Database pool not connected');
  }
  return pool.connect();
};

/**
 * Execute a function within a transaction
 */
const withTransaction = async (fn) => {
  if (!pool || !isConnected) {
    return fn(null);
  }
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { connect, query, getClient, withTransaction };
