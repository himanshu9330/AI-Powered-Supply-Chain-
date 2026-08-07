const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../config/db');
const { sendEmail } = require('../../utils/email');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hash, role || 'analyst']
    );

    const user = rows[0];
    const { accessToken, refreshToken } = generateTokens(user.id);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]);

    setCookies(res, accessToken, refreshToken);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1', [email]
    );
    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { accessToken, refreshToken } = generateTokens(user.id);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Remove old refresh tokens for this user
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);
    await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]);

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    setCookies(res, accessToken, refreshToken);
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, accessToken } });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { rows } = await db.query(
      'SELECT id FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2 AND expires_at > NOW()',
      [tokenHash, decoded.id]
    );
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

    const { accessToken, refreshToken } = generateTokens(decoded.id);
    const newHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query('UPDATE refresh_tokens SET token_hash = $1, expires_at = $2 WHERE user_id = $3',
      [newHash, expiresAt, decoded.id]);

    setCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: { accessToken } });
  } catch (err) { next(err); }
};

const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (!rows.length) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
    await db.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Supply Chain Control Tower — Password Reset',
      html: `<h2>Hello ${user.name}</h2><p>Click below to reset your password (valid 30 min):</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { rows } = await db.query(
      'SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenHash]
    );
    if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    const hash = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, rows[0].user_id]);
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [rows[0].user_id]);

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, refresh, getMe, forgotPassword, resetPassword };
