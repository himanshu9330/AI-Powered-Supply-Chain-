require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🌱 Seeding database...');

    // ── Users ─────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const managerHash = await bcrypt.hash('Manager@123', 10);

    const adminResult = await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['System Admin', 'admin@controltower.io', adminHash, 'admin']);

    const managerId = (await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['Warehouse Manager', 'manager@controltower.io', managerHash, 'manager'])).rows[0].id;

    console.log('✅ Users seeded');

    // ── Categories ───────────────────────────────────────────
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and components' },
      { name: 'Raw Materials', slug: 'raw-materials', description: 'Basic manufacturing inputs' },
      { name: 'Packaging', slug: 'packaging', description: 'Boxes, bags, and containers' },
      { name: 'Spare Parts', slug: 'spare-parts', description: 'Maintenance and repair parts' },
      { name: 'Finished Goods', slug: 'finished-goods', description: 'Ready-to-ship products' },
      { name: 'Consumables', slug: 'consumables', description: 'Single-use supplies' },
    ];

    const catIds = {};
    for (const cat of categories) {
      const r = await client.query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [cat.name, cat.slug, cat.description]);
      catIds[cat.slug] = r.rows[0].id;
    }
    console.log('✅ Categories seeded');

    // ── Suppliers ─────────────────────────────────────────────
    const suppliers = [
      { name: 'TechSource Global', code: 'SUP-001', contact: 'John Smith', email: 'orders@techsource.com', country: 'China', lead_time: 14, reliability: 92.5 },
      { name: 'MateriMax Corp', code: 'SUP-002', contact: 'Sarah Lee', email: 'supply@materimax.com', country: 'USA', lead_time: 7, reliability: 97.0 },
      { name: 'PackPro Industries', code: 'SUP-003', contact: 'Carlos Ruiz', email: 'sales@packpro.com', country: 'Mexico', lead_time: 10, reliability: 88.3 },
      { name: 'Apex Components', code: 'SUP-004', contact: 'Priya Sharma', email: 'procurement@apex.in', country: 'India', lead_time: 21, reliability: 85.0 },
      { name: 'SwiftParts EU', code: 'SUP-005', contact: 'Klaus Weber', email: 'exports@swiftparts.eu', country: 'Germany', lead_time: 12, reliability: 94.8 },
    ];

    const supIds = {};
    for (const sup of suppliers) {
      const r = await client.query(`
        INSERT INTO suppliers (name, code, contact_name, email, country, lead_time_days, reliability_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [sup.name, sup.code, sup.contact, sup.email, sup.country, sup.lead_time, sup.reliability]);
      supIds[sup.code] = r.rows[0].id;
    }
    console.log('✅ Suppliers seeded');

    // ── Warehouses ────────────────────────────────────────────
    const warehouses = [
      { name: 'East Coast Hub', code: 'WH-ECH', city: 'New York', country: 'USA', region: 'East', capacity: 50000 },
      { name: 'West Coast Depot', code: 'WH-WCD', city: 'Los Angeles', country: 'USA', region: 'West', capacity: 45000 },
      { name: 'Central Distribution', code: 'WH-CDL', city: 'Chicago', country: 'USA', region: 'Central', capacity: 60000 },
      { name: 'Southern Fulfillment', code: 'WH-SFL', city: 'Dallas', country: 'USA', region: 'South', capacity: 35000 },
      { name: 'European Gateway', code: 'WH-EUG', city: 'Frankfurt', country: 'Germany', region: 'Europe', capacity: 40000 },
    ];

    const whIds = {};
    for (const wh of warehouses) {
      const r = await client.query(`
        INSERT INTO warehouses (name, code, city, country, region, capacity_units, manager_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [wh.name, wh.code, wh.city, wh.country, wh.region, wh.capacity, managerId]);
      whIds[wh.code] = r.rows[0].id;
    }
    console.log('✅ Warehouses seeded');

    // ── Products ──────────────────────────────────────────────
    const products = [
      { name: 'Wireless Sensor Module', sku: 'ELEC-001', cat: 'electronics', price: 45.99, cost: 22.50, reorder: 100, safety: 50, lead: 14, abc: 'A', xyz: 'X' },
      { name: 'Microcontroller Unit MCU-32', sku: 'ELEC-002', cat: 'electronics', price: 12.50, cost: 5.80, reorder: 200, safety: 80, lead: 21, abc: 'A', xyz: 'Y' },
      { name: 'Industrial Grade Polymer Resin', sku: 'RAW-001', cat: 'raw-materials', price: 8.25, cost: 3.20, reorder: 500, safety: 200, lead: 7, abc: 'B', xyz: 'X' },
      { name: 'Corrugated Shipping Box (Large)', sku: 'PACK-001', cat: 'packaging', price: 2.99, cost: 1.10, reorder: 1000, safety: 400, lead: 5, abc: 'C', xyz: 'X' },
      { name: 'High-Torque Servo Motor', sku: 'ELEC-003', cat: 'electronics', price: 89.99, cost: 42.00, reorder: 75, safety: 30, lead: 14, abc: 'A', xyz: 'Y' },
      { name: 'Stainless Steel Fastener Set', sku: 'PART-001', cat: 'spare-parts', price: 5.49, cost: 1.80, reorder: 300, safety: 100, lead: 10, abc: 'B', xyz: 'Z' },
      { name: 'Smart Thermostat Kit', sku: 'FIN-001', cat: 'finished-goods', price: 149.99, cost: 68.00, reorder: 50, safety: 20, lead: 7, abc: 'A', xyz: 'X' },
      { name: 'Industrial Lubricant (5L)', sku: 'CONS-001', cat: 'consumables', price: 18.75, cost: 7.40, reorder: 200, safety: 80, lead: 3, abc: 'C', xyz: 'X' },
      { name: 'PCB Assembly Board v3', sku: 'ELEC-004', cat: 'electronics', price: 34.00, cost: 16.50, reorder: 150, safety: 60, lead: 21, abc: 'B', xyz: 'Y' },
      { name: 'Aluminum Extrusion Profile 2m', sku: 'RAW-002', cat: 'raw-materials', price: 22.00, cost: 10.00, reorder: 250, safety: 100, lead: 14, abc: 'B', xyz: 'Z' },
      { name: 'Industrial Battery Pack 48V', sku: 'ELEC-005', cat: 'electronics', price: 225.00, cost: 110.00, reorder: 40, safety: 15, lead: 28, abc: 'A', xyz: 'Y' },
      { name: 'Precision Bearing Kit', sku: 'PART-002', cat: 'spare-parts', price: 28.50, cost: 12.00, reorder: 120, safety: 50, lead: 10, abc: 'B', xyz: 'X' },
    ];

    const prodIds = {};
    for (const prod of products) {
      const r = await client.query(`
        INSERT INTO products (name, sku, category_id, unit_price, unit_cost, reorder_point, safety_stock, lead_time_days, abc_class, xyz_class)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [prod.name, prod.sku, catIds[prod.cat], prod.price, prod.cost, prod.reorder, prod.safety, prod.lead, prod.abc, prod.xyz]);
      prodIds[prod.sku] = r.rows[0].id;
    }
    console.log('✅ Products seeded');

    // ── Inventory ─────────────────────────────────────────────
    const skus = Object.keys(prodIds);
    const whCodes = Object.keys(whIds);
    for (const sku of skus) {
      for (const whCode of whCodes.slice(0, 3)) { // 3 warehouses per product
        const qty = Math.floor(Math.random() * 800) + 100;
        const reserved = Math.floor(qty * 0.1);
        await client.query(`
          INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (product_id, warehouse_id) DO UPDATE
          SET quantity_on_hand = EXCLUDED.quantity_on_hand
        `, [prodIds[sku], whIds[whCode], qty, reserved]);
      }
    }
    console.log('✅ Inventory seeded');

    // ── Sales (12 months of historical data) ─────────────────
    const channels = ['online', 'retail', 'wholesale', 'b2b'];
    const regions = ['East', 'West', 'Central', 'South', 'Europe'];
    const segments = ['Consumer', 'Corporate', 'Home Office'];
    const skuList = skus;

    let saleCounter = 1;
    for (let daysBack = 365; daysBack >= 0; daysBack--) {
      const date = new Date();
      date.setDate(date.getDate() - daysBack);
      const dateStr = date.toISOString().split('T')[0];
      const dailySales = Math.floor(Math.random() * 5) + 1;

      for (let s = 0; s < dailySales; s++) {
        const sku = skuList[Math.floor(Math.random() * skuList.length)];
        const whCode = whCodes[Math.floor(Math.random() * 3)];
        const prodId = prodIds[sku];
        const whId = whIds[whCode];
        const prodData = products.find(p => p.sku === sku);
        const qty = Math.floor(Math.random() * 20) + 1;
        const price = prodData.price;
        const cogs = prodData.cost * qty;
        const profit = (price * qty) - cogs;
        const channel = channels[Math.floor(Math.random() * channels.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const segment = segments[Math.floor(Math.random() * segments.length)];
        const daysToShip = Math.floor(Math.random() * 7) + 1;
        const isOnTime = daysToShip <= 3;
        const saleNum = `SALE-${String(saleCounter++).padStart(6, '0')}`;

        await client.query(`
          INSERT INTO sales (sale_number, product_id, warehouse_id, quantity_sold, unit_price,
            cost_of_goods, profit, sale_date, channel, region, customer_segment,
            is_on_time, days_to_ship)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (sale_number) DO NOTHING
        `, [saleNum, prodId, whId, qty, price, cogs, profit, dateStr,
            channel, region, segment, isOnTime, daysToShip]);
      }
    }
    console.log('✅ Sales data seeded (12 months)');

    await client.query('COMMIT');
    console.log('\n🎉 Database seeded successfully!');
    console.log('   Admin login: admin@controltower.io / Admin@123');
    console.log('   Manager login: manager@controltower.io / Manager@123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
