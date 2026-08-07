const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./warehouse.controller');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/comparison', ctrl.getComparison);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'manager'), ctrl.create);
router.put('/:id', authorize('admin', 'manager'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
