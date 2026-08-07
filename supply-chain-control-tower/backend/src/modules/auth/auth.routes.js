const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');
const ctrl = require('./auth.controller');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'manager', 'analyst').default('analyst'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotSchema = Joi.object({ email: Joi.string().email().required() });

const resetSchema = Joi.object({ password: Joi.string().min(8).required() });

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.get('/me', protect, ctrl.getMe);
router.post('/forgot-password', validate(forgotSchema), ctrl.forgotPassword);
router.post('/reset-password/:token', validate(resetSchema), ctrl.resetPassword);

module.exports = router;
