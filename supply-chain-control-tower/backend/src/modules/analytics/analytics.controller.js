const db = require('../../config/db');

const getExecutiveKPIs = async (req, res, next) => {
  try {
    const [invKpis, salesKpis, supplierKpis] = await Promise.all([
      db.query(`SELECT * FROM vw_kpi_summary`),
      db.query(`
        SELECT
          ROUND(SUM(total_revenue)::DECIMAL, 2) as total_revenue,
          ROUND(SUM(total_profit)::DECIMAL, 2) as total_profit,
          ROUND(AVG(avg_margin_pct)::DECIMAL, 1) as avg_margin_pct,
          ROUND(AVG(otd_rate_pct)::DECIMAL, 1) as avg_otd_rate,
          ROUND(SUM(total_orders)::DECIMAL, 0) as total_orders
        FROM vw_sales_kpis
        WHERE month >= NOW() - INTERVAL '12 months'
      `),
      db.query(`
        SELECT
          ROUND(AVG(on_time_delivery_pct)::DECIMAL, 1) as avg_supplier_otd,
          ROUND(AVG(reliability_score)::DECIMAL, 1) as avg_reliability,
          COUNT(*) as active_suppliers
        FROM vw_supplier_performance
      `),
    ]);

    const inv = invKpis.rows[0];
    const sales = salesKpis.rows[0];
    const suppliers = supplierKpis.rows[0];

    res.json({
      success: true,
      data: {
        total_inventory_value: parseFloat(inv.total_inventory_value),
        total_products: parseInt(inv.total_products),
        total_warehouses: parseInt(inv.total_warehouses),
        stockout_count: parseInt(inv.stockout_count),
        critical_stock_count: parseInt(inv.critical_stock_count),
        overstock_count: parseInt(inv.overstock_count),
        fill_rate_pct: parseFloat(inv.fill_rate_pct),
        total_revenue: parseFloat(sales.total_revenue),
        total_profit: parseFloat(sales.total_profit),
        avg_margin_pct: parseFloat(sales.avg_margin_pct),
        otd_rate_pct: parseFloat(sales.avg_otd_rate),
        total_orders: parseInt(sales.total_orders),
        supplier_otd_pct: parseFloat(suppliers.avg_supplier_otd),
        supplier_reliability: parseFloat(suppliers.avg_reliability),
        active_suppliers: parseInt(suppliers.active_suppliers),
      },
    });
  } catch (err) { next(err); }
};

const getInventoryTrend = async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const { rows } = await db.query(`
      SELECT
        DATE_TRUNC('week', s.sale_date) as period,
        SUM(s.quantity_sold) as units_sold,
        SUM(s.total_revenue) as revenue,
        COUNT(DISTINCT s.product_id) as products_sold
      FROM sales s
      WHERE s.sale_date >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE_TRUNC('week', s.sale_date)
      ORDER BY period
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getAbcAnalysis = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_abc_analysis LIMIT 100`);
    const summary = { A: 0, B: 0, C: 0 };
    rows.forEach(r => summary[r.abc_class]++);
    res.json({ success: true, data: rows, summary });
  } catch (err) { next(err); }
};

const getXyzAnalysis = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.name, p.sku, c.name as category_name,
        STDDEV(daily.qty) as demand_stddev,
        AVG(daily.qty) as demand_avg,
        CASE WHEN AVG(daily.qty) = 0 THEN 0
             ELSE ROUND((STDDEV(daily.qty) / NULLIF(AVG(daily.qty), 0) * 100)::DECIMAL, 1)
        END as cov_pct,
        p.xyz_class
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN (
        SELECT product_id, sale_date, SUM(quantity_sold) as qty FROM sales GROUP BY product_id, sale_date
      ) daily ON daily.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name, p.sku, c.name, p.xyz_class
      ORDER BY cov_pct ASC NULLS LAST LIMIT 100
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getSupplierPerformance = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_supplier_performance ORDER BY on_time_delivery_pct DESC`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getWarehouseComparison = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_warehouse_utilization ORDER BY utilization_pct DESC`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getInventoryTurnover = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_inventory_turnover ORDER BY inventory_turnover_ratio DESC LIMIT 50`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getSalesKpis = async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM vw_sales_kpis ORDER BY month`);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getStockMovement = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT movement_date, SUM(units_out) as units_out, SUM(units_in) as units_in,
             (SUM(units_in) - SUM(units_out)) as net
      FROM vw_stock_movement
      WHERE movement_date >= NOW() - INTERVAL '30 days'
      GROUP BY movement_date ORDER BY movement_date
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = {
  getExecutiveKPIs, getInventoryTrend, getAbcAnalysis, getXyzAnalysis,
  getSupplierPerformance, getWarehouseComparison, getInventoryTurnover, getSalesKpis, getStockMovement
};
