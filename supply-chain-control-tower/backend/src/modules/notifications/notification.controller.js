const db = require('../../config/db');

const getAll = async (req, res, next) => {
  try {
    const { is_read } = req.query;
    let query = 'SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL';
    const params = [req.user.id];
    if (is_read !== undefined) { query += ` AND is_read = $2`; params.push(is_read === 'true'); }
    query += ' ORDER BY created_at DESC LIMIT 50';
    const { rows } = await db.query(query, params);
    const { rows: countRows } = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ success: true, data: rows, unread_count: parseInt(countRows[0].count) });
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

const createNotification = async (type, title, message, userId = null, metadata = {}) => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5)',
      [userId, type, title, message, JSON.stringify(metadata)]
    );
  } catch (err) { console.error('Notification error:', err.message); }
};

module.exports = { getAll, markRead, markAllRead, createNotification };
