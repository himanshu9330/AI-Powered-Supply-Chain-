const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./purchaseOrder.controller');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'manager'), ctrl.create);
router.patch('/:id/status', authorize('admin', 'manager'), ctrl.updateStatus);

module.exports = router;
