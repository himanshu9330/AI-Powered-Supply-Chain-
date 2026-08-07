<div align="center">

# 🏭 AI-Powered Supply Chain Control Tower

### Predictive Inventory Planning & Smart Logistics Analytics Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-FF6600?style=for-the-badge&logo=python&logoColor=white)](https://xgboost.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> An enterprise-grade, three-tier platform integrating real-time inventory management,  
> AI-driven demand forecasting, and smart logistics analytics into a unified control tower.

[Features](#-key-features) · [Architecture](#-high-level-architecture) · [Tech Stack](#-technology-stack) · [Installation](#-installation-guide) · [API Docs](#-api-overview) · [Roadmap](#-future-roadmap)

</div>

---

## 📋 Project Overview

The **AI-Powered Supply Chain Control Tower** is a full-stack SaaS platform that gives supply chain managers, analysts, and executives a **single pane of glass** across their entire inventory and logistics network.

Built by analysing, refactoring, and unifying **three source repositories** into one cohesive enterprise product:

| Source Repository | Domain | Contribution |
|---|---|---|
| **Inventory Management App** | Operations | JWT auth, product CRUD, email flows, React UI foundation |
| **Inventory Forecast** | Intelligence | XGBoost, Random Forest & ARIMA ML models, feature engineering |
| **Supply Chain Logistics Dashboard** | Analytics | KPI definitions, star-schema design, EDA pipeline, Power BI logic |

> All three domains are now unified behind a single REST API, shared PostgreSQL database, and a React dashboard.

---

## ✨ Key Features

- 🔐 **JWT Authentication** — Role-based access control (`admin`, `manager`, `analyst`) with refresh-token rotation
- 📦 **15-Module REST API** — Auth, Users, Products, Categories, Warehouses, Inventory, Suppliers, Purchase Orders, Sales, Transfers, Forecasts, Analytics, Optimization, Reports, Notifications
- 🤖 **Ensemble ML Forecasting** — XGBoost, Random Forest & ARIMA with automatic model selection and joblib persistence
- 📊 **KPI Analytics Engine** — PostgreSQL materialised views for OTD, OTIF, SLA Breach, Fill Rate, Perfect Order Rate
- 🔔 **Smart Notifications** — Event-driven alerts for low stock, overstock, reorder triggers, and supplier delays
- 📄 **Report Generation** — PDF (PDFKit) and Excel (ExcelJS) export for audits and stakeholder reports
- 🛡️ **Production-Grade Security** — Helmet, rate limiting, CORS, Joi validation
- ⚙️ **Inventory Optimization** — EOQ, Safety Stock, Reorder Points, ABC/XYZ classification
- 📈 **Recharts Dashboard** — Interactive time-series, heatmaps, and KPI cards replacing Power BI

---

## 🔄 System Workflow

```mermaid
flowchart TD
    U([👤 User / Analyst]) -->|HTTPS| FE[React 18 Frontend\nVite + MUI v5]
    FE -->|REST /api/*| BE[Node.js / Express\nAPI Server :5000]
    FE -->|REST /forecast| ML[FastAPI ML Service\nPython :8000]

    BE -->|SQL| DB[(PostgreSQL 15\nDatabase)]
    BE -->|HTTP Proxy| ML
    ML -->|joblib| FS[(Model Store\n.pkl files)]

    BE -->|SMTP| EMAIL[📧 Email\nNodemailer]
    BE -->|node-cron| CRON[⏰ Scheduled Jobs\nDaily Reports & Alerts]

    subgraph API Modules
        AUTH[Auth & Users]
        INV[Inventory & Warehouses]
        PO[Purchase Orders]
        SALES[Sales & Transfers]
        FORE[Forecasts & Optimization]
        REP[Reports & Notifications]
    end

    BE --> AUTH & INV & PO & SALES & FORE & REP
```

---

## 🌊 Data Flow Diagram

```mermaid
flowchart LR
    RAW[📥 Sales History\ndate + quantity] --> PREP[Feature Engineering\nCalendar · Lag · Rolling]
    PREP --> TRAIN{Model Training}
    TRAIN --> XGB[XGBoost\nRegressor]
    TRAIN --> RF[Random Forest\nRegressor]
    TRAIN --> ARIMA_M[ARIMA\nAuto AIC Selection]
    XGB & RF & ARIMA_M --> EVAL[📏 Evaluation\nMAE · RMSE · MAPE]
    EVAL --> PERSIST[(joblib Persistence\n.pkl files)]
    PERSIST --> PRED[🔮 Predictions\n+ 95% CI Bands]
    PRED --> REC[💡 Recommendations\nPurchase · Transfer · Reorder]
    REC --> NOTIF[🔔 Alerts\nEmail + In-App]
```

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Tier"]
        FE["⚛️ React 18 + Vite\nMUI v5 Dashboard SPA\n:3000"]
    end

    subgraph App["Application Tier"]
        BE["🟢 Node.js / Express\nREST API\n:5000"]
        ML["🐍 FastAPI / Uvicorn\nML Microservice\n:8000"]
    end

    subgraph Data["Data Tier"]
        PG[("🐘 PostgreSQL 15\n15 Tables · 6 Views")]
        FS[("📂 File System\nModel Store .pkl")]
    end

    subgraph Ext["External Services"]
        SMTP["📧 SMTP\nNodemailer"]
    end

    FE -->|JSON REST| BE
    FE -->|JSON REST| ML
    BE <-->|HTTP Axios| ML
    BE -->|pg driver| PG
    ML -->|joblib| FS
    BE -->|nodemailer| SMTP
```

---

## 🧩 Component Architecture

```mermaid
graph LR
    subgraph Backend["Backend Modules (15)"]
        A[auth] --> MW[JWT Middleware]
        B[users]
        C[products]
        D[categories]
        E[warehouses]
        F[inventory]
        G[suppliers]
        H[purchase-orders]
        I[sales]
        J[transfers]
        K[forecasts] --> MLC[ML Service Client]
        L[analytics]
        M[optimization]
        N[reports]
        O[notifications]
    end

    subgraph ML["ML Microservice"]
        R1[/forecast router/]
        S1[ForecastingService]
        XGB_C[XGBoostForecaster]
        RF_C[RandomForestForecaster]
        ARIMA_C[ARIMAForecaster]
        R1 --> S1
        S1 --> XGB_C & RF_C & ARIMA_C
    end
```

---

## 🚀 Technology Stack

### Backend
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | Server runtime |
| Framework | Express | 4.18 | REST API framework |
| Database | PostgreSQL | 15 | Primary relational store |
| DB Driver | `pg` | 8.11 | Raw SQL, full control |
| Auth | `jsonwebtoken` + `bcryptjs` | — | JWT + password hashing |
| Validation | `joi` | 17 | Request schema validation |
| Security | `helmet` + `express-rate-limit` | — | HTTP hardening |
| Logging | `winston` + `morgan` | — | Structured JSON logs |
| Scheduling | `node-cron` | — | Daily jobs & alerts |
| Email | `nodemailer` | — | SMTP notifications |
| Reports | `pdfkit` + `exceljs` | — | PDF & Excel generation |

### ML Microservice
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | FastAPI | 0.104 | High-performance async API |
| Server | Uvicorn | — | ASGI server |
| Validation | Pydantic | v2 | Request/response schemas |
| Gradient Boost | XGBoost | 2.0 | Non-linear demand patterns |
| Tree Ensemble | scikit-learn RandomForest | 1.3 | Robust baseline |
| Time Series | statsmodels ARIMA | 0.14 | Classical forecasting |
| Data | pandas + numpy | — | Feature engineering |
| Persistence | joblib | 1.3 | Model serialisation |
| Calendar | `holidays` | — | Holiday feature detection |

### Frontend
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 18.2 | Component-based UI |
| Build Tool | Vite | 5 | Fast dev server & bundler |
| UI Library | Material UI (MUI) | v5 | Enterprise component set |
| State | React Query + Zustand | v5 | Server & client state |
| Charts | Recharts | 2.x | KPI & forecast visualisation |
| Forms | React Hook Form + Zod | — | Validated form handling |
| HTTP | Axios | — | API client with interceptors |

---

## 📁 Folder Structure

```
supply-chain-control-tower/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express app bootstrap
│   │   ├── server.js                 # HTTP server entry point
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL connection pool
│   │   │   └── logger.js             # Winston configuration
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── 001_initial_schema.sql
│   │   │   │   └── 002_analytics_views.sql
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # protect / adminGuard
│   │   │   ├── errorHandler.js       # global error handler
│   │   │   └── requestLogger.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── warehouses/
│   │   │   ├── inventory/
│   │   │   ├── suppliers/
│   │   │   ├── purchase-orders/
│   │   │   ├── sales/
│   │   │   ├── transfers/
│   │   │   ├── forecasts/            # proxy to ML service
│   │   │   ├── analytics/            # KPI views
│   │   │   ├── optimization/         # EOQ / ABC / XYZ
│   │   │   ├── reports/              # PDF & Excel
│   │   │   └── notifications/
│   │   └── utils/
│   └── package.json
│
├── ml-service/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point
│   │   ├── routers/
│   │   │   ├── forecast.py
│   │   │   └── health.py
│   │   ├── schemas/                  # Pydantic models
│   │   └── services/
│   │       └── forecasting.py        # XGBoost / RF / ARIMA
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── theme/                    # MUI dark/light palette
│   │   ├── components/
│   │   │   ├── layout/               # AppShell, Sidebar, TopBar
│   │   │   ├── common/               # KPICard, DataTable, Charts
│   │   │   └── ui/                   # Button, Modal, Badge
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   ├── products/
│   │   │   ├── warehouses/
│   │   │   ├── suppliers/
│   │   │   ├── forecasts/
│   │   │   ├── analytics/
│   │   │   ├── orders/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── services/                 # Axios API clients
│   │   ├── store/                    # Zustand stores
│   │   └── App.jsx
│   └── package.json
│
└── .env.example
```

---

## 🗄️ Database Schema

The PostgreSQL database contains **11 core tables** across three functional areas.

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ refresh_tokens : has
    users ||--o{ notifications : receives
    users ||--o{ purchase_orders : creates
    users ||--o{ transfers : creates

    categories ||--o{ products : contains
    suppliers ||--o{ purchase_orders : fulfils

    warehouses ||--o{ inventory : stores
    warehouses ||--o{ purchase_orders : receives
    warehouses ||--o{ sales : ships_from
    warehouses ||--o{ transfers : origin
    warehouses ||--o{ transfers : destination

    products ||--o{ inventory : tracked_in
    products ||--o{ purchase_order_items : ordered_in
    products ||--o{ sales : sold_as
    products ||--o{ forecasts : predicted_for
    products ||--o{ recommendations : suggested_for
    products ||--o{ transfers : moved_as

    purchase_orders ||--o{ purchase_order_items : contains
```

### Core Tables

| Table | Key Columns | Purpose |
|---|---|---|
| `users` | `id, name, email, password_hash, role, is_active` | Platform users & RBAC |
| `products` | `sku, category_id, unit_price, reorder_point, safety_stock, lead_time_days, abc_class, xyz_class` | SKU catalogue |
| `warehouses` | `code, location, city, country, capacity_units, manager_id` | Warehouse registry |
| `suppliers` | `code, lead_time_days, reliability_score` | Supplier directory |
| `inventory` | `product_id, warehouse_id, quantity_on_hand, quantity_reserved, quantity_available` | Real-time stock |
| `purchase_orders` | `po_number, supplier_id, status, ordered_at, expected_at, received_at` | PO lifecycle |
| `sales` | `sale_number, product_id, quantity_sold, sale_date, channel, region` | Transaction history |
| `forecasts` | `model_type, forecast_date, predicted_quantity, confidence_lower, confidence_upper, accuracy_mae, accuracy_rmse` | ML predictions |
| `recommendations` | `type, recommended_quantity, priority, is_actioned` | AI-generated actions |
| `notifications` | `type, message, is_read, created_at` | Alert inbox |

---

## 📡 API Overview

**Base URL:** `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create new account |
| `POST` | `/auth/login` | Public | Login → access + refresh tokens |
| `POST` | `/auth/refresh` | Refresh token | Rotate access token |
| `POST` | `/auth/logout` | Bearer | Invalidate session |
| `POST` | `/auth/forgot-password` | Public | Send reset email |
| `POST` | `/auth/reset-password` | Reset token | Complete password reset |
| `GET` | `/auth/me` | Bearer | Current user profile |

### Core Resources (CRUD Pattern)

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/products` | List / create products |
| `GET/PUT/DELETE` | `/products/:id` | Single product CRUD |
| `GET/POST` | `/inventory` | Stock levels across warehouses |
| `PATCH` | `/inventory/:id/adjust` | Manual stock adjustment |
| `GET/POST` | `/purchase-orders` | Purchase order management |
| `PATCH` | `/purchase-orders/:id/receive` | Receive goods into stock |
| `GET/POST` | `/sales` | Record sales transactions |
| `GET/POST` | `/transfers` | Inter-warehouse transfers |
| `GET/POST` | `/suppliers` | Supplier directory |
| `GET/POST` | `/warehouses` | Warehouse management |

### Analytics & KPIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/dashboard` | Executive KPI summary |
| `GET` | `/analytics/sales-trends` | Time-series sales data |
| `GET` | `/analytics/inventory-health` | Stock status overview |
| `GET` | `/analytics/abc-analysis` | ABC classification breakdown |
| `GET` | `/analytics/xyz-analysis` | Demand variability matrix |
| `GET` | `/analytics/supplier-performance` | On-time delivery rates |
| `GET` | `/analytics/warehouse-comparison` | Cross-warehouse utilisation |

### Forecasting

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/forecasts/generate` | Trigger ML forecast for a product |
| `GET` | `/forecasts/:productId` | Retrieve stored forecast results |
| `GET` | `/forecasts/metrics` | Model accuracy scores (MAE/RMSE/MAPE) |
| `GET` | `/forecasts/feature-importance` | XGBoost/RF feature importance |

### Optimization Engine

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/optimization/eoq/:productId` | Economic Order Quantity |
| `GET` | `/optimization/safety-stock/:productId` | Safety stock recommendation |
| `GET` | `/optimization/reorder-points` | All products at/below reorder point |
| `GET` | `/optimization/recommendations` | AI-prioritised action list |
| `GET` | `/optimization/dead-stock` | Slow-moving inventory |
| `GET` | `/optimization/overstock` | Overstock value report |

### Reports & Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports/inventory?format=xlsx\|pdf` | Inventory export |
| `GET` | `/reports/sales?format=xlsx\|pdf` | Sales report export |
| `GET` | `/reports/forecast?format=xlsx\|pdf` | Forecast summary export |
| `GET` | `/notifications` | User alert inbox |
| `PATCH` | `/notifications/:id/read` | Mark as read |

### ML Service (FastAPI)
**Base URL:** `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/forecast/predict` | Generate demand forecast |
| `POST` | `/forecast/train` | Train / retrain a model |
| `GET` | `/forecast/importance/:productId` | Feature importance scores |
| `GET` | `/health` | Service health check |
| `GET` | `/docs` | Interactive Swagger UI |

---

## 🖥️ Dashboard Features

| Module | Capabilities |
|---|---|
| **Executive Dashboard** | 12 KPI cards, stock health gauge, top-10 SKUs by value |
| **Inventory Manager** | Multi-warehouse stock grid, adjustment history, low-stock alerts |
| **Demand Forecasting** | Time-series chart with 95% CI bands, model switcher, horizon slider |
| **Purchase Orders** | Full PO lifecycle (Draft → Approved → Ordered → Received) |
| **Supplier Portal** | Supplier directory, reliability scores, lead-time analytics |
| **Transfer Center** | Inter-warehouse transfers with in-transit tracking |
| **Analytics Hub** | Sales trends, ABC heatmap, channel & region breakdowns |
| **Reports** | On-demand PDF/Excel exports for inventory, sales, and forecasts |
| **Notifications** | Real-time alert inbox with read/unread state |

---

## 🤖 Machine Learning Pipeline

```mermaid
flowchart TD
    INPUT[Sales History\ndate + quantity] --> FE1[Calendar Features\nday_of_week · month · year\nis_weekend · is_holiday]
    INPUT --> FE2[Lag Features\nlag_1 through lag_7]
    INPUT --> FE3[Rolling Statistics\nrolling_mean_7 and 30\nrolling_std_7]

    FE1 & FE2 & FE3 --> SPLIT[80/20 Train-Test Split]

    SPLIT --> XGB_T[XGBoost\nn_estimators=200\nmax_depth=6\nlr=0.05]
    SPLIT --> RF_T[Random Forest\nn_estimators=200\nmax_depth=10]
    SPLIT --> ARIMA_T[ARIMA\nAuto p-d-q\nAIC grid search]

    XGB_T & RF_T & ARIMA_T --> METRICS[Evaluation\nMAE · RMSE · MAPE]
    METRICS --> SAVE[joblib Persistence\n.pkl files]
    SAVE --> INFER[Iterative Inference\nHorizon 1-90 days\n95% Confidence Intervals]
```

### Model Comparison

| Model | Algorithm | Strengths | Best Use Case |
|---|---|---|---|
| **XGBoost** | Gradient Boosting | Non-linear patterns, feature importance | Complex seasonal products |
| **Random Forest** | Bagged Decision Trees | Robust to noise, parallelised | Stable, high-volume SKUs |
| **ARIMA** | Auto-Regression | Captures autocorrelation, interpretable | Smooth trend-driven products |

---

## ⚙️ Inventory Optimization Engine

| Formula | Expression |
|---|---|
| **EOQ** | `√( (2 × Annual Demand × Order Cost) / Holding Cost )` |
| **Safety Stock** | `Z × σ_LT × √(Lead Time)` |
| **Reorder Point** | `(Avg Daily Demand × Lead Time) + Safety Stock` |

### Recommendation Triggers

| Type | Trigger Condition | Priority |
|---|---|---|
| `reorder` | `quantity_available ≤ reorder_point` | High / Critical |
| `purchase` | Forecast demand exceeds projected stock within lead-time window | Medium / High |
| `transfer` | Overstock in warehouse A + shortage in warehouse B | Medium |
| `dispose` | Inventory holding cost exceeds threshold for slow movers | Low |

### ABC/XYZ Classification

| Class | ABC Criteria | XYZ Criteria |
|---|---|---|
| **A / X** | Top 80% of revenue | Low demand variability (CV < 0.5) |
| **B / Y** | Next 15% of revenue | Moderate variability (CV 0.5–1.0) |
| **C / Z** | Bottom 5% of revenue | High variability (CV > 1.0) |

---

## 📈 Business KPIs

| KPI | Formula | Source |
|---|---|---|
| **On-Time Delivery (OTD)** | `Orders delivered on time / Total orders` | `sales.days_to_ship` |
| **OTIF Rate** | `Orders On-Time AND In-Full / Total orders` | `sales` + `inventory` |
| **SLA Breach Rate** | `Orders exceeding SLA threshold / Total orders` | `sales.days_to_ship` |
| **Perfect Order Rate** | `OTIF + no damage + correct invoice` | Composite |
| **Fill Rate** | `Units shipped / Units ordered` | `purchase_order_items` |
| **Inventory Turnover** | `COGS / Average Inventory Value` | `sales` + `inventory` |
| **Days of Supply** | `Stock on hand / Average daily demand` | `inventory` + `sales` |
| **Forecast Accuracy** | `100 - MAPE (%)` | `forecasts.accuracy_mape` |
| **Supplier On-Time Rate** | `POs received by expected_at / Total POs` | `purchase_orders` |
| **Gross Margin** | `(Revenue - COGS) / Revenue × 100` | `sales` + `products` |
| **Stock-Out Rate** | `SKUs at zero stock / Total active SKUs` | `inventory` |
| **Overstock Value** | `Units above safety_stock × unit_cost` | `inventory` + `products` |

---

## 🛠️ Installation Guide

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS |
| Python | 3.10+ |
| PostgreSQL | 15+ |
| npm | 9+ |
| pip | 23+ |

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/supply-chain-control-tower.git
cd supply-chain-control-tower
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, SMTP credentials
```

`.env.example` reference:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/supply_chain

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Server
PORT=5000
NODE_ENV=development
```

### 3. Set Up the Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE supply_chain;"

# Install backend dependencies and run migrations
cd backend
npm install
npm run migrate

# Seed with realistic sample data
npm run seed
```

### 4. Start the Backend API

```bash
cd backend
npm run dev
# API running at http://localhost:5000
# Health check: http://localhost:5000/health
```

### 5. Start the ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# ML API running at http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

### 6. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

---

## 📸 Screenshots

### Executive Dashboard
> Real-time KPI cards, inventory health gauge, and top-SKU revenue breakdown.

![Executive Dashboard](./screenshots/dashboard.png)

### Demand Forecasting
> 90-day XGBoost forecast with 95% confidence interval bands and model switcher.

![Forecasting Page](./screenshots/forecast.png)

### Inventory Manager
> Multi-warehouse stock grid with inline adjustment and low-stock alert badges.

![Inventory Manager](./screenshots/inventory.png)

### Analytics Hub
> ABC/XYZ heatmap, sales trends, channel breakdown, and supplier performance charts.

![Analytics Hub](./screenshots/analytics.png)

---

## 🗺️ Future Roadmap

### Phase 2 — Advanced ML
- [ ] Ensemble model voting (weighted average of XGBoost + RF + ARIMA)
- [ ] Automatic model retraining via `node-cron` scheduler
- [ ] Anomaly detection for demand spikes and supplier delays
- [ ] LLM-powered NL insights ("Why did SKU-003 overstock last month?")

### Phase 3 — Enterprise Integrations
- [ ] ERP connector (SAP / Oracle integration layer)
- [ ] Barcode / QR scanning via mobile PWA
- [ ] Multi-currency and multi-language support
- [ ] Supplier self-service portal

### Phase 4 — Observability & Scale
- [ ] Prometheus metrics + Grafana dashboards
- [ ] Connection pooling (PgBouncer)
- [ ] End-to-end test suite (Playwright + pytest)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with ❤️ as an enterprise portfolio project demonstrating full-stack supply chain architecture.

**[⬆ Back to Top](#-ai-powered-supply-chain-control-tower)**

</div>
