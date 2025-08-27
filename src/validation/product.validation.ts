import Joi from 'joi';

// This schema mirrors the structure of your IPInterface
export const ipValidationSchema = Joi.object({
  ip: Joi.string().ip({ version: ['ipv4','ipv6'] }).required(),
  mode: Joi.string().valid('blacklist', 'whitelist').required(),
});