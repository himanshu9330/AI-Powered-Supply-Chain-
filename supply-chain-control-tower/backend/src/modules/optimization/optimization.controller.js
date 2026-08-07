const db = require('../../config/db');

/**
 * EOQ = sqrt(2 * D * S / H)
 * D = annual demand, S = ordering cost, H = holding cost per unit per year
 */
const calculateEOQ = (annualDemand, orderingCost = 50, holdingCostRate = 0.25, unitCost) => {
  const H = holdingCostRate * unitCost;
  if (!H || !annualDemand) return 0;
  return Math.round(Math.sqrt((2 * annualDemand * orderingCost) / H));
};

/**
 * Safety Stock = Z * sigma_LT * sqrt(LT)
 * Z = 1.645 for 95% service level
 */
const calculateSafetyStock = (avgDailyDemand, stdDev, leadTimeDays, serviceLevel = 0.95) => {
  const Z = serviceLevel >= 0.99 ? 2.326 : serviceLevel >= 0.95 ? 1.645 : 1.282;
  return Math.round(Z * stdDev * Math.sqrt(leadTimeDays));
};

/**
 * Reorder Point = (avg_demand * LT) + safety_stock
 */
const calculateReorderPoint = (avgDailyDemand, leadTimeDays, safetyStock) => {
  return Math.round(avgDailyDemand * leadTimeDays + safetyStock);
};

const getEOQ = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { rows: prod } = await db.query(
      'SELECT unit_cost, lead_time_days FROM products WHERE id = $1', [product_id]
    );
    if (!prod.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const { rows: demand } = await db.query(
      `SELECT SUM(quantity_sold) as annual_demand FROM sales
       WHERE product_id = $1 AND sale_date >= NOW() - INTERVAL '1 year'`,
      [product_id]
    );

    const annualDemand = parseFloat(demand[0]?.annual_demand) || 0;
    const eoq = calculateEOQ(annualDemand, 50, 0.25, parseFloat(prod[0].unit_cost));

    await db.query('UPDATE products SET eoq = $1 WHERE id = $2', [eoq, product_id]);

    res.json({ success: true, data: { product_id, eoq, annual_demand: annualDemand, ordering_cost: 50, holding_cost_rate: 0.25 } });
  } catch (err) { next(err); }
};

const getReorderPoints = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.name, p.sku, p.reorder_point, p.safety_stock, p.lead_time_days, p.unit_cost,
        COALESCE(SUM(inv.quantity_on_hand), 0) as current_stock,
        COALESCE(d.avg_daily_demand, 0) as avg_daily_demand,
        COALESCE(d.stddev_demand, 0) as stddev_demand,
        CASE WHEN COALESCE(inv.quantity_on_hand, 0) <= p.reorder_point THEN true ELSE false END as reorder_needed
      FROM products p
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN (
        SELECT product_id,
               AVG(daily_qty)::DECIMAL as avg_daily_demand,
               STDDEV(daily_qty)::DECIMAL as stddev_demand
        FROM (SELECT product_id, sale_date, SUM(quantity_sold) as daily_qty FROM sales
              WHERE sale_date >= NOW() - INTERVAL '90 days' GROUP BY product_id, sale_date) d
        GROUP BY product_id
      ) d ON d.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name, p.sku, p.reorder_point, p.safety_stock, p.lead_time_days, p.unit_cost,
               d.avg_daily_demand, d.stddev_demand
      ORDER BY reorder_needed DESC, p.name
    `);

    const enriched = rows.map(r => ({
      ...r,
      calculated_safety_stock: calculateSafetyStock(
        parseFloat(r.avg_daily_demand), parseFloat(r.stddev_demand), r.lead_time_days
      ),
      calculated_reorder_point: calculateReorderPoint(
        parseFloat(r.avg_daily_demand), r.lead_time_days, r.safety_stock
      ),
      eoq: calculateEOQ(parseFloat(r.avg_daily_demand) * 365, 50, 0.25, parseFloat(r.unit_cost)),
      lead_time_demand: parseFloat(r.avg_daily_demand) * r.lead_time_days,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
};

const getAbcXyzMatrix = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.name, p.sku, p.abc_class, p.xyz_class,
        c.name as category_name,
        COALESCE(SUM(s.total_revenue), 0) as annual_revenue,
        COALESCE(SUM(s.quantity_sold), 0) as annual_units,
        COALESCE(AVG(inv.quantity_on_hand), 0) as avg_stock
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN sales s ON s.product_id = p.id AND s.sale_date >= NOW() - INTERVAL '1 year'
      LEFT JOIN inventory inv ON inv.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name, p.sku, p.abc_class, p.xyz_class, c.name
      ORDER BY annual_revenue DESC
    `);

    const matrix = {};
    ['A', 'B', 'C'].forEach(a => {
      matrix[a] = {};
      ['X', 'Y', 'Z'].forEach(x => { matrix[a][x] = []; });
    });
    rows.forEach(r => {
      const a = r.abc_class || 'C';
      const x = r.xyz_class || 'Z';
      if (matrix[a] && matrix[a][x]) matrix[a][x].push(r);
    });

    res.json({ success: true, data: rows, matrix });
  } catch (err) { next(err); }
};

const getDeadStock = async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const { rows } = await db.query(`
      SELECT p.id, p.name, p.sku, c.name as category_name,
             COALESCE(SUM(inv.quantity_on_hand), 0) as stock_on_hand,
             COALESCE(SUM(inv.quantity_on_hand * p.unit_cost), 0) as stock_value,
             MAX(s.sale_date) as last_sale_date,
             EXTRACT(DAYS FROM NOW() - MAX(s.sale_date)) as days_since_last_sale
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN sales s ON s.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name, p.sku, c.name
      HAVING COALESCE(SUM(inv.quantity_on_hand), 0) > 0
         AND (MAX(s.sale_date) IS NULL OR EXTRACT(DAYS FROM NOW() - MAX(s.sale_date)) > $1)
      ORDER BY days_since_last_sale DESC NULLS FIRST
    `, [parseInt(days)]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getOverstock = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.name, p.sku, c.name as category_name,
        p.reorder_point,
        COALESCE(SUM(inv.quantity_on_hand), 0) as stock_on_hand,
        COALESCE(SUM(inv.quantity_on_hand * p.unit_cost), 0) as excess_value,
        COALESCE(AVG(daily.qty), 0) as avg_daily_demand,
        CASE WHEN COALESCE(AVG(daily.qty), 0) = 0 THEN NULL
             ELSE ROUND(COALESCE(SUM(inv.quantity_on_hand), 0) / NULLIF(AVG(daily.qty), 0), 0)
        END as days_of_supply
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN (
        SELECT product_id, SUM(quantity_sold) / 90.0 as qty
        FROM sales WHERE sale_date >= NOW() - INTERVAL '90 days'
        GROUP BY product_id
      ) daily ON daily.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name, p.sku, c.name, p.reorder_point
      HAVING COALESCE(SUM(inv.quantity_on_hand), 0) > p.reorder_point * 3
      ORDER BY excess_value DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getRecommendations = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, p.name as product_name, p.sku, w.name as warehouse_name
       FROM recommendations r JOIN products p ON p.id = r.product_id
       LEFT JOIN warehouses w ON w.id = r.warehouse_id
       WHERE r.is_actioned = FALSE AND (r.expires_at IS NULL OR r.expires_at > NOW())
       ORDER BY CASE r.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, r.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getEOQ, getReorderPoints, getAbcXyzMatrix, getDeadStock, getOverstock, getRecommendations };
