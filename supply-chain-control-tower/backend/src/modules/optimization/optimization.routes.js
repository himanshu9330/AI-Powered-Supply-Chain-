const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const ctrl = require('./optimization.controller');

router.use(protect);
router.get('/eoq/:product_id', ctrl.getEOQ);
router.get('/reorder-points', ctrl.getReorderPoints);
router.get('/abc-xyz-matrix', ctrl.getAbcXyzMatrix);
router.get('/dead-stock', ctrl.getDeadStock);
router.get('/overstock', ctrl.getOverstock);
router.get('/recommendations', ctrl.getRecommendations);

module.exports = router;
