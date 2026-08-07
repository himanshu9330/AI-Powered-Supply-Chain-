const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./inventory.controller');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/status', ctrl.getStatus);
router.get('/low-stock', ctrl.getLowStock);
router.get('/overstock', ctrl.getOverstock);
router.get('/movement', ctrl.getMovement);
router.post('/update-stock', authorize('admin', 'manager'), ctrl.updateStock);

module.exports = router;
