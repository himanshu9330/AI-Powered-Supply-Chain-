const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const ctrl = require('./report.controller');

router.use(protect);
router.get('/inventory', ctrl.inventory);
router.get('/warehouse', ctrl.warehouse);
router.get('/forecast', ctrl.forecast);

module.exports = router;
