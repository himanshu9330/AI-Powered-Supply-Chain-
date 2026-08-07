const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const ctrl = require('./notification.controller');

router.use(protect);
router.get('/', ctrl.getAll);
router.patch('/:id/read', ctrl.markRead);
router.patch('/mark-all-read', ctrl.markAllRead);

module.exports = router;
