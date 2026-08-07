const db = require('../../config/db');

const buildQuery = (filters) => {
  const conditions = ['p.is_active = TRUE'];
  const params = [];
  let idx = 1;

  if (filters.category_id) { conditions.push(`p.category_id = $${idx++}`); params.push(filters.category_id); }
  if (filters.search) { conditions.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`); params.push(`%${filters.search}%`); idx++; }
  if (filters.abc_class) { conditions.push(`p.abc_class = $${idx++}`); params.push(filters.abc_class); }
  if (filters.stock_status) {
    if (filters.stock_status === 'low') conditions.push('i.quantity_available <= p.reorder_point');
    if (filters.stock_status === 'overstock') conditions.push('i.quantity_on_hand > p.reorder_point * 3');
    if (filters.stock_status === 'stockout') conditions.push('i.quantity_available = 0');
  }

  return { where: conditions.join(' AND '), params };
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, ...filters } = req.query;
    const offset = (page - 1) * limit;
    const { where, params } = buildQuery(filters);

    const countResult = await db.query(
      `SELECT COUNT(DISTINCT p.id) FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       JOIN categories c ON c.id = p.category_id WHERE ${where}`, params
    );

    const { rows } = await db.query(
      `SELECT p.*, c.name as category_name,
              COALESCE(SUM(i.quantity_on_hand),0) as total_stock,
              COALESCE(SUM(i.quantity_available),0) as total_available
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE ${where}
       GROUP BY p.id, c.name
       ORDER BY p.name
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page: +page, limit: +limit, total: +countResult.rows[0].count },
    });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT p.*, c.name as category_name FROM products p
       JOIN categories c ON c.id = p.category_id WHERE p.id = $1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });

    // Get inventory per warehouse
    const { rows: inventory } = await db.query(
      `SELECT i.*, w.name as warehouse_name, w.code as warehouse_code
       FROM inventory i JOIN warehouses w ON w.id = i.warehouse_id
       WHERE i.product_id = $1`, [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], inventory } });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, sku, category_id, description, unit_price, unit_cost,
            unit_of_measure, reorder_point, safety_stock, lead_time_days, image_url } = req.body;
    const { rows } = await db.query(
      `INSERT INTO products (name, sku, category_id, description, unit_price, unit_cost,
        unit_of_measure, reorder_point, safety_stock, lead_time_days, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, sku, category_id, description, unit_price, unit_cost,
       unit_of_measure, reorder_point, safety_stock, lead_time_days, image_url]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const fields = ['name', 'category_id', 'description', 'unit_price', 'unit_cost',
                    'unit_of_measure', 'reorder_point', 'safety_stock', 'lead_time_days', 'image_url', 'is_active'];
    const updates = [];
    const values = [];
    let idx = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }
    if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await db.query('UPDATE products SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
