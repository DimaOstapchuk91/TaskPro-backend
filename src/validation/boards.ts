import Joi from 'joi';

export const createBoardSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
});

export const editBoardSchema = Joi.object({
  id: Joi.number().required(),
  title: Joi.string().min(2).max(50).required(),
});
