const db = require('../../config/db');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, warehouse_id } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['p.is_active = TRUE'];
    const params = [];
    let idx = 1;

    if (warehouse_id) { conditions.push(`i.warehouse_id = $${idx++}`); params.push(warehouse_id); }
    if (search) { conditions.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const where = conditions.join(' AND ');
    const { rows } = await db.query(
      `SELECT * FROM vw_inventory_status WHERE ${where.replace(/p\./g, '').replace(/i\./g, '')}
       ORDER BY stock_status, product_name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM vw_inventory_status`);
    res.json({ success: true, data: rows, pagination: { page: +page, limit: +limit, total: +count.rows[0].count } });
  } catch (err) { next(err); }
};

const getStatus = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_inventory_status ORDER BY product_name`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const updateStock = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, quantity_on_hand, quantity_reserved } = req.body;
    const { rows } = await db.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, warehouse_id) DO UPDATE
       SET quantity_on_hand = $3, quantity_reserved = COALESCE($4, inventory.quantity_reserved),
           last_counted_at = NOW(), updated_at = NOW()
       RETURNING *`,
      [product_id, warehouse_id, quantity_on_hand, quantity_reserved || 0]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM vw_inventory_status WHERE stock_status IN ('low', 'critical', 'stockout') ORDER BY stock_status DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getOverstock = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM vw_inventory_status WHERE stock_status = 'overstock' ORDER BY quantity_on_hand DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getMovement = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, days = 30 } = req.query;
    let query = `SELECT * FROM vw_stock_movement WHERE movement_date >= NOW() - INTERVAL '${parseInt(days)} days'`;
    const params = [];
    if (product_id) { query += ` AND product_id = $${params.length + 1}`; params.push(product_id); }
    if (warehouse_id) { query += ` AND warehouse_id = $${params.length + 1}`; params.push(warehouse_id); }
    query += ' ORDER BY movement_date DESC';
    const { rows } = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getAll, getStatus, updateStock, getLowStock, getOverstock, getMovement };
