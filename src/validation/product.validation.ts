import Joi from 'joi';

// Define the schema for a single IP address string
const ipStringSchema = Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required();

// Define the schema for an array of IP address strings
const ipArraySchema = Joi.array().items(ipStringSchema).min(1).required();

// The final schema uses .alternatives() to accept either a single string or an array
export const ipValidationSchema = Joi.object({
  ip: Joi.alternatives().try(ipStringSchema, ipArraySchema),
  mode: Joi.string().valid('blacklist', 'whitelist').required(),
});