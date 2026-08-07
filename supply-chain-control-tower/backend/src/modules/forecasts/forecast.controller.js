const axios = require('axios');
const db = require('../../config/db');

const ML_URL = () => process.env.ML_SERVICE_URL || 'http://localhost:8000';

const predict = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, horizon_days = 30, model_type = 'xgboost' } = req.body;

    // Get historical sales for the product
    const { rows: history } = await db.query(
      `SELECT sale_date, SUM(quantity_sold) as quantity
       FROM sales WHERE product_id = $1
       ${warehouse_id ? 'AND warehouse_id = $2' : ''}
       GROUP BY sale_date ORDER BY sale_date DESC LIMIT 90`,
      warehouse_id ? [product_id, warehouse_id] : [product_id]
    );

    const { data: mlResult } = await axios.post(`${ML_URL()}/forecast`, {
      product_id,
      horizon_days,
      model_type,
      history: history.map(r => ({ date: r.sale_date, quantity: parseFloat(r.quantity) })),
    });

    // Save forecast to DB
    const today = new Date().toISOString().split('T')[0];
    const { rows: saved } = await db.query(
      `INSERT INTO forecasts (product_id, warehouse_id, model_type, forecast_date, horizon_days,
        predicted_quantity, confidence_lower, confidence_upper, accuracy_mae, accuracy_rmse, is_trained)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true) RETURNING *`,
      [product_id, warehouse_id, model_type, today, horizon_days,
       mlResult.predicted_total, mlResult.confidence_lower, mlResult.confidence_upper,
       mlResult.mae, mlResult.rmse]
    );

    res.json({ success: true, data: { forecast: saved[0], predictions: mlResult.predictions } });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'ML service unavailable' });
    }
    next(err);
  }
};

const train = async (req, res, next) => {
  try {
    const { model_type = 'xgboost', product_id } = req.body;

    // Get full historical data
    const { rows: history } = await db.query(
      `SELECT sale_date as date, SUM(quantity_sold) as quantity
       FROM sales WHERE product_id = $1 GROUP BY sale_date ORDER BY sale_date`,
      [product_id]
    );

    const { data: mlResult } = await axios.post(`${ML_URL()}/train`, {
      model_type,
      product_id,
      history: history.map(r => ({ date: r.date, quantity: parseFloat(r.quantity) })),
    });

    res.json({ success: true, data: mlResult });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'ML service unavailable' });
    }
    next(err);
  }
};

const getMetrics = async (req, res, next) => {
  try {
    const { model_type } = req.query;
    const { data } = await axios.get(`${ML_URL()}/metrics${model_type ? `?model_type=${model_type}` : ''}`);
    res.json({ success: true, data });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'ML service unavailable' });
    }
    next(err);
  }
};

const getFeatureImportance = async (req, res, next) => {
  try {
    const { model_type = 'xgboost' } = req.query;
    const { data } = await axios.get(`${ML_URL()}/feature-importance?model_type=${model_type}`);
    res.json({ success: true, data });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'ML service unavailable' });
    }
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT f.*, p.name as product_name, p.sku, w.name as warehouse_name
       FROM forecasts f JOIN products p ON p.id = f.product_id
       LEFT JOIN warehouses w ON w.id = f.warehouse_id
       WHERE f.product_id = $1 ORDER BY f.created_at DESC LIMIT 20`,
      [req.params.productId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { predict, train, getMetrics, getFeatureImportance, getHistory };
