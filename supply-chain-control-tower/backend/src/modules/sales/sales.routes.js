const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./sales.controller');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/trend', ctrl.getTrend);
router.post('/', authorize('admin', 'manager'), ctrl.create);

module.exports = router;
