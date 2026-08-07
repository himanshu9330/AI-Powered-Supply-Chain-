-- ============================================================
-- Supply Chain Control Tower — KPI & Analytics Views
-- Migration: 002_analytics_views.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_inventory_status
-- Real-time inventory status per product/warehouse
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_inventory_status AS
SELECT
    i.id,
    i.product_id,
    p.name                          AS product_name,
    p.sku,
    c.name                          AS category_name,
    i.warehouse_id,
    w.name                          AS warehouse_name,
    w.code                          AS warehouse_code,
    i.quantity_on_hand,
    i.quantity_reserved,
    i.quantity_available,
    p.reorder_point,
    p.safety_stock,
    p.unit_cost,
    p.unit_price,
    (i.quantity_on_hand * p.unit_cost) AS inventory_value,
    CASE
        WHEN i.quantity_available = 0                          THEN 'stockout'
        WHEN i.quantity_available <= p.safety_stock            THEN 'critical'
        WHEN i.quantity_available <= p.reorder_point           THEN 'low'
        WHEN i.quantity_on_hand > (p.reorder_point * 3)       THEN 'overstock'
        ELSE 'optimal'
    END AS stock_status,
    p.abc_class,
    p.xyz_class,
    i.updated_at
FROM inventory i
JOIN products p ON p.id = i.product_id
JOIN categories c ON c.id = p.category_id
JOIN warehouses w ON w.id = i.warehouse_id
WHERE p.is_active = TRUE AND w.is_active = TRUE;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_kpi_summary
-- Executive KPI card data
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_kpi_summary AS
SELECT
    -- Inventory metrics
    COALESCE(SUM(i.quantity_on_hand * p.unit_cost), 0)      AS total_inventory_value,
    COUNT(DISTINCT i.product_id)                             AS total_products,
    COUNT(DISTINCT i.warehouse_id)                           AS total_warehouses,
    COUNT(CASE WHEN i.quantity_available = 0 THEN 1 END)     AS stockout_count,
    COUNT(CASE WHEN i.quantity_available <= p.safety_stock
               AND i.quantity_available > 0 THEN 1 END)      AS critical_stock_count,
    COUNT(CASE WHEN i.quantity_on_hand > p.reorder_point * 3 THEN 1 END) AS overstock_count,

    -- Fill rate (% of demand that can be met immediately)
    ROUND(
        COUNT(CASE WHEN i.quantity_available > 0 THEN 1 END)::DECIMAL /
        NULLIF(COUNT(*), 0) * 100, 1
    ) AS fill_rate_pct

FROM inventory i
JOIN products p ON p.id = i.product_id
WHERE p.is_active = TRUE;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_sales_kpis
-- Revenue, COGS, profit, inventory turnover
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_sales_kpis AS
SELECT
    DATE_TRUNC('month', sale_date)                          AS month,
    COUNT(*)                                                AS total_orders,
    SUM(quantity_sold)                                      AS total_units,
    ROUND(SUM(total_revenue)::DECIMAL, 2)                  AS total_revenue,
    ROUND(SUM(cost_of_goods)::DECIMAL, 2)                  AS total_cogs,
    ROUND(SUM(profit)::DECIMAL, 2)                         AS total_profit,
    ROUND(AVG(CASE WHEN total_revenue > 0
        THEN profit / total_revenue * 100 END), 1)         AS avg_margin_pct,
    ROUND(AVG(CAST(is_on_time AS INTEGER)) * 100, 1)       AS otd_rate_pct
FROM sales
GROUP BY DATE_TRUNC('month', sale_date)
ORDER BY month;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_abc_analysis
-- ABC classification based on revenue contribution
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_abc_analysis AS
WITH product_revenue AS (
    SELECT
        s.product_id,
        p.name AS product_name,
        p.sku,
        c.name AS category_name,
        SUM(s.total_revenue) AS total_revenue
    FROM sales s
    JOIN products p ON p.id = s.product_id
    JOIN categories c ON c.id = p.category_id
    GROUP BY s.product_id, p.name, p.sku, c.name
),
ranked AS (
    SELECT *,
        SUM(total_revenue) OVER ()                                     AS grand_total,
        SUM(total_revenue) OVER (ORDER BY total_revenue DESC)          AS cumulative_revenue,
        ROW_NUMBER() OVER (ORDER BY total_revenue DESC)                AS rank
    FROM product_revenue
)
SELECT
    product_id,
    product_name,
    sku,
    category_name,
    ROUND(total_revenue::DECIMAL, 2)                                   AS total_revenue,
    ROUND(total_revenue / NULLIF(grand_total, 0) * 100, 2)            AS revenue_pct,
    ROUND(cumulative_revenue / NULLIF(grand_total, 0) * 100, 2)       AS cumulative_pct,
    rank,
    CASE
        WHEN cumulative_revenue / NULLIF(grand_total, 0) <= 0.80 THEN 'A'
        WHEN cumulative_revenue / NULLIF(grand_total, 0) <= 0.95 THEN 'B'
        ELSE 'C'
    END AS abc_class
FROM ranked
ORDER BY rank;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_supplier_performance
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_supplier_performance AS
SELECT
    s.id                                                            AS supplier_id,
    s.name                                                          AS supplier_name,
    s.code,
    s.reliability_score,
    s.lead_time_days,
    COUNT(po.id)                                                    AS total_orders,
    COALESCE(SUM(po.total_amount), 0)                              AS total_spend,
    COUNT(CASE WHEN po.status = 'received' THEN 1 END)             AS completed_orders,
    COUNT(CASE WHEN po.received_at > po.expected_at THEN 1 END)    AS late_deliveries,
    ROUND(
        COUNT(CASE WHEN po.received_at <= po.expected_at AND po.status='received' THEN 1 END)::DECIMAL /
        NULLIF(COUNT(CASE WHEN po.status='received' THEN 1 END), 0) * 100
    , 1)                                                            AS on_time_delivery_pct,
    ROUND(AVG(EXTRACT(EPOCH FROM (po.received_at - po.ordered_at))/86400)::DECIMAL, 1) AS avg_lead_time_days
FROM suppliers s
LEFT JOIN purchase_orders po ON po.supplier_id = s.id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.code, s.reliability_score, s.lead_time_days;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_warehouse_utilization
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_warehouse_utilization AS
SELECT
    w.id                                                            AS warehouse_id,
    w.name                                                          AS warehouse_name,
    w.code,
    w.city,
    w.country,
    w.region,
    w.capacity_units,
    COALESCE(SUM(i.quantity_on_hand), 0)                           AS units_in_stock,
    ROUND(
        COALESCE(SUM(i.quantity_on_hand), 0)::DECIMAL /
        NULLIF(w.capacity_units, 0) * 100
    , 1)                                                            AS utilization_pct,
    COALESCE(SUM(i.quantity_on_hand * p.unit_cost), 0)            AS inventory_value,
    COUNT(DISTINCT i.product_id)                                    AS distinct_products
FROM warehouses w
LEFT JOIN inventory i ON i.warehouse_id = w.id
LEFT JOIN products p ON p.id = i.product_id
WHERE w.is_active = TRUE
GROUP BY w.id, w.name, w.code, w.city, w.country, w.region, w.capacity_units;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_stock_movement
-- Daily stock in/out summary
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_stock_movement AS
SELECT
    DATE_TRUNC('day', s.sale_date)      AS movement_date,
    s.product_id,
    p.name                              AS product_name,
    p.sku,
    s.warehouse_id,
    w.name                              AS warehouse_name,
    SUM(s.quantity_sold)                AS units_out,
    0                                   AS units_in
FROM sales s
JOIN products p ON p.id = s.product_id
JOIN warehouses w ON w.id = s.warehouse_id
GROUP BY DATE_TRUNC('day', s.sale_date), s.product_id, p.name, p.sku, s.warehouse_id, w.name

UNION ALL

SELECT
    DATE_TRUNC('day', poi.created_at)   AS movement_date,
    poi.product_id,
    p.name                              AS product_name,
    p.sku,
    po.warehouse_id,
    w.name                              AS warehouse_name,
    0                                   AS units_out,
    SUM(poi.quantity_received)          AS units_in
FROM purchase_order_items poi
JOIN purchase_orders po ON po.id = poi.po_id
JOIN products p ON p.id = poi.product_id
JOIN warehouses w ON w.id = po.warehouse_id
WHERE po.status IN ('received', 'partially_received')
GROUP BY DATE_TRUNC('day', poi.created_at), poi.product_id, p.name, p.sku, po.warehouse_id, w.name;

-- ─────────────────────────────────────────────────────────────
-- VIEW: vw_inventory_turnover
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_inventory_turnover AS
SELECT
    p.id                                                            AS product_id,
    p.name                                                          AS product_name,
    p.sku,
    c.name                                                          AS category_name,
    COALESCE(SUM(s.cost_of_goods), 0)                              AS annual_cogs,
    COALESCE(AVG(i.quantity_on_hand * p.unit_cost), 0)             AS avg_inventory_value,
    CASE
        WHEN COALESCE(AVG(i.quantity_on_hand * p.unit_cost), 0) = 0 THEN 0
        ELSE ROUND(COALESCE(SUM(s.cost_of_goods), 0) /
             NULLIF(AVG(i.quantity_on_hand * p.unit_cost), 0), 2)
    END                                                             AS inventory_turnover_ratio,
    CASE
        WHEN COALESCE(SUM(s.cost_of_goods), 0) = 0 THEN NULL
        ELSE ROUND(365 / (COALESCE(SUM(s.cost_of_goods), 0) /
             NULLIF(AVG(i.quantity_on_hand * p.unit_cost), 0)), 0)
    END                                                             AS days_inventory_outstanding
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN sales s ON s.product_id = p.id AND s.sale_date >= CURRENT_DATE - INTERVAL '1 year'
LEFT JOIN inventory i ON i.product_id = p.id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.sku, c.name;
