const db = require('../../config/db');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_warehouse_utilization ORDER BY warehouse_name`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM warehouses WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    const { rows: inv } = await db.query(
      `SELECT i.*, p.name as product_name, p.sku, c.name as category_name
       FROM inventory i JOIN products p ON p.id = i.product_id
       JOIN categories c ON c.id = p.category_id WHERE i.warehouse_id = $1 ORDER BY p.name`,
      [req.params.id]
    );
    res.json({ success: true, data: { ...rows[0], inventory: inv } });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, code, location, city, country, region, capacity_units, manager_id } = req.body;
    const { rows } = await db.query(
      `INSERT INTO warehouses (name, code, location, city, country, region, capacity_units, manager_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, code, location, city, country, region, capacity_units, manager_id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const fields = ['name', 'location', 'city', 'country', 'region', 'capacity_units', 'manager_id', 'is_active'];
    const updates = []; const values = []; let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
    }
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE warehouses SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await db.query('UPDATE warehouses SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Warehouse deactivated' });
  } catch (err) { next(err); }
};

const getComparison = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_warehouse_utilization ORDER BY utilization_pct DESC`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, getComparison };
