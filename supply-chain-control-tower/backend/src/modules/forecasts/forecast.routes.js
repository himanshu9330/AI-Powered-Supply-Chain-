const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./forecast.controller');

router.use(protect);
router.post('/predict', ctrl.predict);
router.post('/train', authorize('admin', 'manager'), ctrl.train);
router.get('/metrics', ctrl.getMetrics);
router.get('/feature-importance', ctrl.getFeatureImportance);
router.get('/history/:productId', ctrl.getHistory);

module.exports = router;
