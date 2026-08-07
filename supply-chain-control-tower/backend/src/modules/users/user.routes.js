const express = require('express');
const router = express.Router();
const { protect, adminOnly, authorize } = require('../../middleware/auth');
const ctrl = require('./user.controller');

router.use(protect);
router.get('/', adminOnly, ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/profile', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);
router.patch('/:id/toggle-active', adminOnly, ctrl.toggleActive);
router.patch('/:id/role', adminOnly, ctrl.updateRole);

module.exports = router;
