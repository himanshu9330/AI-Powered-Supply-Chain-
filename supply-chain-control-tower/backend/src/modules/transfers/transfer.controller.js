const db = require('../../config/db');

const generateTransferNumber = () => `TRF-${Date.now()}`;

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT t.*, p.name as product_name, p.sku,
              fw.name as from_warehouse, tw.name as to_warehouse, u.name as created_by_name
       FROM transfers t JOIN products p ON p.id = t.product_id
       JOIN warehouses fw ON fw.id = t.from_warehouse_id
       JOIN warehouses tw ON tw.id = t.to_warehouse_id
       JOIN users u ON u.id = t.created_by
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { product_id, from_warehouse_id, to_warehouse_id, quantity, reason } = req.body;
    const { rows: src } = await db.query(
      'SELECT quantity_available FROM inventory WHERE product_id = $1 AND warehouse_id = $2',
      [product_id, from_warehouse_id]
    );
    if (!src.length || src[0].quantity_available < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock at source warehouse' });
    }
    const { rows } = await db.query(
      `INSERT INTO transfers (transfer_number, product_id, from_warehouse_id, to_warehouse_id, quantity, reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [generateTransferNumber(), product_id, from_warehouse_id, to_warehouse_id, quantity, reason, req.user.id]
    );
    await db.query(
      'UPDATE inventory SET quantity_reserved = quantity_reserved + $1 WHERE product_id = $2 AND warehouse_id = $3',
      [quantity, product_id, from_warehouse_id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { rows } = await db.query(
      `UPDATE transfers SET status = $1,
       shipped_at = CASE WHEN $1 = 'in_transit' THEN NOW() ELSE shipped_at END,
       received_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE received_at END
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transfer not found' });
    const transfer = rows[0];

    if (status === 'completed') {
      // Move stock
      await db.query(
        `UPDATE inventory SET quantity_on_hand = quantity_on_hand - $1,
         quantity_reserved = quantity_reserved - $1 WHERE product_id = $2 AND warehouse_id = $3`,
        [transfer.quantity, transfer.product_id, transfer.from_warehouse_id]
      );
      await db.query(
        `INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, warehouse_id) DO UPDATE
         SET quantity_on_hand = inventory.quantity_on_hand + $3, updated_at = NOW()`,
        [transfer.product_id, transfer.to_warehouse_id, transfer.quantity]
      );
    }
    res.json({ success: true, data: transfer });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, updateStatus };
