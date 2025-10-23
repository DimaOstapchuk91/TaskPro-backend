import Joi from 'joi';

export const taskSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
  description: Joi.string().min(5).max(500).required(),
  priority: Joi.valid('High', 'Medium', 'Low', 'Without').required(),
  deadline: Joi.date().iso().required(),
});
