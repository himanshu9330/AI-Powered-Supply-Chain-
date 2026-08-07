const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../../middleware/validate');
const { protect, authorize } = require('../../middleware/auth');
const ctrl = require('./product.controller');

const createSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  sku: Joi.string().min(2).max(50).required(),
  category_id: Joi.string().uuid().required(),
  description: Joi.string().max(2000).optional(),
  unit_price: Joi.number().min(0).required(),
  unit_cost: Joi.number().min(0).required(),
  unit_of_measure: Joi.string().max(30).default('unit'),
  reorder_point: Joi.number().integer().min(0).default(0),
  safety_stock: Joi.number().integer().min(0).default(0),
  lead_time_days: Joi.number().integer().min(0).default(7),
  image_url: Joi.string().uri().optional(),
});

const updateSchema = createSchema.fork(
  ['name', 'sku', 'category_id', 'unit_price', 'unit_cost'], f => f.optional()
).keys({ is_active: Joi.boolean() });

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'manager'), validate(createSchema), ctrl.create);
router.put('/:id', authorize('admin', 'manager'), validate(updateSchema), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
