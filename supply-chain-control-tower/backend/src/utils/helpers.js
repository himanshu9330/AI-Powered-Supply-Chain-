/**
 * Convert a string to a URL-safe slug
 */
const createSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Paginate a query result set
 */
const paginate = (data, page, limit, total) => ({
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

/**
 * Format currency
 */
const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);
};

/**
 * Generate a unique order/PO number
 */
const generateOrderNumber = (prefix) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = { createSlug, paginate, formatCurrency, generateOrderNumber };
