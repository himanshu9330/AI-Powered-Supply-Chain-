-- ============================================================
-- Supply Chain Control Tower — PostgreSQL Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'analyst');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'cancelled');
CREATE TYPE transfer_status AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');
CREATE TYPE forecast_model AS ENUM ('xgboost', 'random_forest', 'arima', 'ensemble');
CREATE TYPE recommendation_type AS ENUM ('purchase', 'transfer', 'reorder', 'dispose');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE notification_type AS ENUM ('low_stock', 'overstock', 'supplier_delay', 'forecast_complete', 'reorder_point', 'transfer_required');
CREATE TYPE sales_channel AS ENUM ('online', 'retail', 'wholesale', 'b2b');
CREATE TYPE abc_class AS ENUM ('A', 'B', 'C');
CREATE TYPE xyz_class AS ENUM ('X', 'Y', 'Z');

-- ─────────────────────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'analyst',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url      TEXT,
    phone           VARCHAR(30),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: refresh_tokens
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: password_reset_tokens
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: categories
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: suppliers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    code                VARCHAR(30) NOT NULL UNIQUE,
    contact_name        VARCHAR(100),
    email               VARCHAR(255),
    phone               VARCHAR(30),
    address             TEXT,
    city                VARCHAR(100),
    country             VARCHAR(100),
    lead_time_days      INTEGER NOT NULL DEFAULT 7,
    reliability_score   DECIMAL(4,2) DEFAULT 100.00, -- 0-100
    payment_terms       VARCHAR(100),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: warehouses
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    location        TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100) NOT NULL DEFAULT 'US',
    region          VARCHAR(100),
    capacity_units  INTEGER NOT NULL DEFAULT 10000,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    manager_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: products
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200) NOT NULL,
    sku                 VARCHAR(50) NOT NULL UNIQUE,
    category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description         TEXT,
    unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit_cost           DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit_of_measure     VARCHAR(30) NOT NULL DEFAULT 'unit',
    reorder_point       INTEGER NOT NULL DEFAULT 0,
    safety_stock        INTEGER NOT NULL DEFAULT 0,
    lead_time_days      INTEGER NOT NULL DEFAULT 7,
    eoq                 INTEGER,                        -- Economic Order Quantity (computed)
    abc_class           abc_class,                      -- ABC classification
    xyz_class           xyz_class,                      -- XYZ classification
    image_url           TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: inventory
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id        UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity_on_hand    INTEGER NOT NULL DEFAULT 0,
    quantity_reserved   INTEGER NOT NULL DEFAULT 0,
    quantity_available  INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    last_counted_at     TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, warehouse_id)
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: purchase_orders
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number       VARCHAR(30) NOT NULL UNIQUE,
    supplier_id     UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status          order_status NOT NULL DEFAULT 'draft',
    ordered_at      TIMESTAMPTZ,
    expected_at     TIMESTAMPTZ,
    received_at     TIMESTAMPTZ,
    total_amount    DECIMAL(14,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: purchase_order_items
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id               UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_ordered    INTEGER NOT NULL,
    quantity_received   INTEGER NOT NULL DEFAULT 0,
    unit_cost           DECIMAL(12,2) NOT NULL,
    total_cost          DECIMAL(14,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: sales
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_number         VARCHAR(30) NOT NULL UNIQUE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    warehouse_id        UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    quantity_sold       INTEGER NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL,
    total_revenue       DECIMAL(14,2) GENERATED ALWAYS AS (quantity_sold * unit_price) STORED,
    cost_of_goods       DECIMAL(14,2),
    profit              DECIMAL(14,2),
    sale_date           DATE NOT NULL,
    channel             sales_channel NOT NULL DEFAULT 'online',
    region              VARCHAR(100),
    customer_segment    VARCHAR(100),
    is_on_time          BOOLEAN DEFAULT TRUE,
    shipping_mode       VARCHAR(50),
    days_to_ship        INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: transfers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transfers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_number     VARCHAR(30) NOT NULL UNIQUE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    from_warehouse_id   UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    to_warehouse_id     UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    quantity            INTEGER NOT NULL,
    status              transfer_status NOT NULL DEFAULT 'pending',
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shipped_at          TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    reason              TEXT,
    created_by          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: forecasts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forecasts (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id              UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id            UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    model_type              forecast_model NOT NULL DEFAULT 'xgboost',
    forecast_date           DATE NOT NULL,
    horizon_days            INTEGER NOT NULL DEFAULT 30,
    predicted_quantity      DECIMAL(12,2) NOT NULL,
    confidence_lower        DECIMAL(12,2),
    confidence_upper        DECIMAL(12,2),
    accuracy_mae            DECIMAL(10,4),
    accuracy_rmse           DECIMAL(10,4),
    accuracy_mape           DECIMAL(8,4),
    is_trained              BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: recommendations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id              UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id            UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    type                    recommendation_type NOT NULL,
    recommended_quantity    INTEGER,
    recommended_date        DATE,
    reason                  TEXT NOT NULL,
    priority                priority_level NOT NULL DEFAULT 'medium',
    is_actioned             BOOLEAN NOT NULL DEFAULT FALSE,
    actioned_at             TIMESTAMPTZ,
    actioned_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_warehouse ON sales(warehouse_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_forecasts_product ON forecasts(product_id);
CREATE INDEX idx_recommendations_product ON recommendations(product_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_transfers_product ON transfers(product_id);

-- ─────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['users','categories','suppliers','warehouses','products','purchase_orders','transfers'] LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
    END LOOP;
END;
$$;
