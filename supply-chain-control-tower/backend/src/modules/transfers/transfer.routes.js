const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./transfer.controller');

router.use(protect);
router.get('/', ctrl.getAll);
router.post('/', authorize('admin', 'manager'), ctrl.create);
router.patch('/:id/status', authorize('admin', 'manager'), ctrl.updateStatus);

module.exports = router;
