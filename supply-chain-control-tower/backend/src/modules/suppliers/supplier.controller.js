const db = require('../../config/db');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_supplier_performance ORDER BY supplier_name`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Supplier not found' });
    const { rows: orders } = await db.query(
      `SELECT po.*, w.name as warehouse_name FROM purchase_orders po
       JOIN warehouses w ON w.id = po.warehouse_id WHERE po.supplier_id = $1
       ORDER BY po.created_at DESC LIMIT 10`, [req.params.id]
    );
    res.json({ success: true, data: { ...rows[0], recent_orders: orders } });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, code, contact_name, email, phone, address, city, country, lead_time_days, reliability_score, payment_terms } = req.body;
    const { rows } = await db.query(
      `INSERT INTO suppliers (name, code, contact_name, email, phone, address, city, country, lead_time_days, reliability_score, payment_terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, code, contact_name, email, phone, address, city, country, lead_time_days, reliability_score, payment_terms]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const fields = ['name', 'contact_name', 'email', 'phone', 'address', 'city', 'country', 'lead_time_days', 'reliability_score', 'payment_terms', 'is_active'];
    const updates = []; const values = []; let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); values.push(req.body[f]); }
    }
    values.push(req.params.id);
    const { rows } = await db.query(`UPDATE suppliers SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await db.query('UPDATE suppliers SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Supplier deactivated' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
