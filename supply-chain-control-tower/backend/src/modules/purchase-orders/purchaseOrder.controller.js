const db = require('../../config/db');

const generatePONumber = () => `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const getAll = async (req, res, next) => {
  try {
    const { status, supplier_id, warehouse_id } = req.query;
    let query = `SELECT po.*, s.name as supplier_name, w.name as warehouse_name,
                   u.name as created_by_name
                 FROM purchase_orders po
                 JOIN suppliers s ON s.id = po.supplier_id
                 JOIN warehouses w ON w.id = po.warehouse_id
                 JOIN users u ON u.id = po.created_by WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (status) { query += ` AND po.status = $${idx++}`; params.push(status); }
    if (supplier_id) { query += ` AND po.supplier_id = $${idx++}`; params.push(supplier_id); }
    if (warehouse_id) { query += ` AND po.warehouse_id = $${idx++}`; params.push(warehouse_id); }
    query += ' ORDER BY po.created_at DESC';
    const { rows } = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT po.*, s.name as supplier_name, w.name as warehouse_name
       FROM purchase_orders po JOIN suppliers s ON s.id = po.supplier_id
       JOIN warehouses w ON w.id = po.warehouse_id WHERE po.id = $1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'PO not found' });
    const { rows: items } = await db.query(
      `SELECT poi.*, p.name as product_name, p.sku FROM purchase_order_items poi
       JOIN products p ON p.id = poi.product_id WHERE poi.po_id = $1`, [req.params.id]
    );
    res.json({ success: true, data: { ...rows[0], items } });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { supplier_id, warehouse_id, expected_at, notes, items } = req.body;
    const totalAmount = items.reduce((sum, i) => sum + (i.quantity_ordered * i.unit_cost), 0);

    await db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, expected_at, total_amount, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [generatePONumber(), supplier_id, warehouse_id, expected_at, totalAmount, notes, req.user.id]
      );
      const po = rows[0];
      for (const item of items) {
        await client.query(
          `INSERT INTO purchase_order_items (po_id, product_id, quantity_ordered, unit_cost)
           VALUES ($1, $2, $3, $4)`,
          [po.id, item.product_id, item.quantity_ordered, item.unit_cost]
        );
      }
      return res.status(201).json({ success: true, data: po });
    });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, received_at } = req.body;
    const { rows } = await db.query(
      `UPDATE purchase_orders SET status = $1, received_at = COALESCE($2, received_at),
       ordered_at = CASE WHEN $1 = 'ordered' THEN NOW() ELSE ordered_at END
       WHERE id = $3 RETURNING *`,
      [status, received_at, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'PO not found' });

    // Update inventory if received
    if (status === 'received') {
      const { rows: items } = await db.query(
        'SELECT * FROM purchase_order_items WHERE po_id = $1', [req.params.id]
      );
      for (const item of items) {
        await db.query(
          `INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, warehouse_id) DO UPDATE
           SET quantity_on_hand = inventory.quantity_on_hand + $3, updated_at = NOW()`,
          [item.product_id, rows[0].warehouse_id, item.quantity_ordered]
        );
        await db.query(
          'UPDATE purchase_order_items SET quantity_received = quantity_ordered WHERE po_id = $1',
          [req.params.id]
        );
      }
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStatus };
