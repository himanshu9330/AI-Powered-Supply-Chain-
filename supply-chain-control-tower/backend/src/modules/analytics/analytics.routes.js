const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const ctrl = require('./analytics.controller');

router.use(protect);
router.get('/kpis', ctrl.getExecutiveKPIs);
router.get('/inventory-trends', ctrl.getInventoryTrend);
router.get('/sales-kpis', ctrl.getSalesKpis);
router.get('/abc-analysis', ctrl.getAbcAnalysis);
router.get('/xyz-analysis', ctrl.getXyzAnalysis);
router.get('/supplier-performance', ctrl.getSupplierPerformance);
router.get('/warehouse-comparison', ctrl.getWarehouseComparison);
router.get('/inventory-turnover', ctrl.getInventoryTurnover);
router.get('/stock-movement', ctrl.getStockMovement);

module.exports = router;
