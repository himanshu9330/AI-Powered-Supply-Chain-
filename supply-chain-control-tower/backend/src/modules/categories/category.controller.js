const db = require('../../config/db');
const { createSlug } = require('../../utils/helpers');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id
       WHERE c.is_active = true GROUP BY c.id ORDER BY c.name`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = createSlug(name);
    const { rows } = await db.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    const slug = name ? createSlug(name) : undefined;
    const { rows } = await db.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        is_active = COALESCE($4, is_active)
       WHERE id = $5 RETURNING *`,
      [name, slug, description, is_active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows: products } = await db.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1', [req.params.id]
    );
    if (parseInt(products[0].count) > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category with existing products' });
    }
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
