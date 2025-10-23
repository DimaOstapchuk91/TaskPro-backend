import Joi from 'joi';

export const columnSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
});
