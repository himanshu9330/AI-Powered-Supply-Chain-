const db = require('../../config/db');

const getAll = async (req, res, next) => {
  try {
    const { warehouse_id, product_id, channel, start_date, end_date } = req.query;
    let query = `SELECT s.*, p.name as product_name, p.sku, w.name as warehouse_name
                 FROM sales s JOIN products p ON p.id = s.product_id
                 JOIN warehouses w ON w.id = s.warehouse_id WHERE 1=1`;
    const params = []; let idx = 1;
    if (warehouse_id) { query += ` AND s.warehouse_id = $${idx++}`; params.push(warehouse_id); }
    if (product_id) { query += ` AND s.product_id = $${idx++}`; params.push(product_id); }
    if (channel) { query += ` AND s.channel = $${idx++}`; params.push(channel); }
    if (start_date) { query += ` AND s.sale_date >= $${idx++}`; params.push(start_date); }
    if (end_date) { query += ` AND s.sale_date <= $${idx++}`; params.push(end_date); }
    query += ' ORDER BY s.sale_date DESC LIMIT 500';
    const { rows } = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getTrend = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_sales_kpis ORDER BY month`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, quantity_sold, unit_price, sale_date, channel, region, customer_segment, shipping_mode, days_to_ship } = req.body;
    const saleNum = `SALE-${Date.now()}`;
    const { rows: prod } = await db.query('SELECT unit_cost FROM products WHERE id = $1', [product_id]);
    const cogs = prod[0]?.unit_cost * quantity_sold || 0;
    const revenue = unit_price * quantity_sold;
    const profit = revenue - cogs;
    const isOnTime = days_to_ship <= 3;

    const { rows } = await db.query(
      `INSERT INTO sales (sale_number, product_id, warehouse_id, quantity_sold, unit_price,
       cost_of_goods, profit, sale_date, channel, region, customer_segment, is_on_time, shipping_mode, days_to_ship)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [saleNum, product_id, warehouse_id, quantity_sold, unit_price, cogs, profit,
       sale_date, channel, region, customer_segment, isOnTime, shipping_mode, days_to_ship]
    );

    // Deduct inventory
    await db.query(
      `UPDATE inventory SET quantity_on_hand = quantity_on_hand - $1, updated_at = NOW()
       WHERE product_id = $2 AND warehouse_id = $3 AND quantity_on_hand >= $1`,
      [quantity_sold, product_id, warehouse_id]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, getTrend, create };
