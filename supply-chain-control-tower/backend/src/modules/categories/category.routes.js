const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../../middleware/validate');
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./category.controller');

const schema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  is_active: Joi.boolean(),
});

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'manager'), validate(schema), ctrl.create);
router.put('/:id', authorize('admin', 'manager'), validate(updateSchema), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
