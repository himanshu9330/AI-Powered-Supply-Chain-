const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, is_active, avatar_url, phone, last_login_at, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, is_active, avatar_url, phone, last_login_at, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET name=$1, phone=$2, avatar_url=$3 WHERE id=$4 RETURNING id, name, email, role, phone, avatar_url',
      [name, phone, avatar_url, req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

const toggleActive = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role', [role, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, updateProfile, changePassword, toggleActive, updateRole };
