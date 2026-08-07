const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Protect route — requires valid access token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first, then cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const { rows } = await db.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'Not authorized. User not found or inactive.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized. Invalid token.' });
  }
};

/**
 * Role-based guard — restrict to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this resource`,
      });
    }
    next();
  };
};

/**
 * Admin only
 */
const adminOnly = authorize('admin');

module.exports = { protect, authorize, adminOnly };
