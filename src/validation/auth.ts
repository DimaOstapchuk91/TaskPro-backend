import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(16),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(28).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(28).required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(16).optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.any().optional(),
  password: Joi.string().min(6).max(28).optional(),
  theme: Joi.string().valid('light', 'dark', 'violet').optional(),
});
