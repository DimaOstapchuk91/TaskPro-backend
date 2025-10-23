import Joi from 'joi';

const imageSchema = Joi.object({
  filename: Joi.string().required(),
  url: Joi.string().uri().required(),
});

const backgroundSchema = Joi.object({
  name: Joi.string().required(),
  desk: imageSchema.required(),
  mob: imageSchema.required(),
  tab: imageSchema.required(),
  thumb: imageSchema.required(),
});

export const boardSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
  icons: Joi.valid(
    'icon-star',
    'icon-container',
    'icon-puzzle',
    'icon-project',
    'icon-colors',
    'icon-hexagon',
    'icon-lightning',
    'icon-loading',
  ).required(),
  background: backgroundSchema.optional().allow(null),
});
