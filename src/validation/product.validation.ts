import Joi from 'joi';

// ip validations
// Define the schema for a single IP address string
const ipStringSchema = Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required();

// Define the schema for an array of IP address strings
const ipArraySchema = Joi.array().items(ipStringSchema).min(1).required();

// The final schema uses .alternatives() to accept either a single string or an array
export const ipValidationSchema = Joi.object({
  ip: Joi.alternatives().try(ipStringSchema, ipArraySchema),
  mode: Joi.string().valid('blacklist', 'whitelist').required(),
});

// url validation\
// Schema for a full URL with a protocol (e.g., https://google.com)
const fullUrlSchema = Joi.string().uri({ scheme: ['http', 'https'] });

// Schema for a domain without a protocol (e.g., google.com)
const domainSchema = Joi.string().domain();

// The final schema uses .alternatives() to accept either a full URL or a domain name.
const itemSchema = Joi.alternatives().try(fullUrlSchema, domainSchema).required();

export const urlValidationSchema = Joi.object({
  url: Joi.alternatives().try(
    itemSchema,
    Joi.array().items(itemSchema).min(1)
  ).required(),
  mode: Joi.string().valid('blacklist', 'whitelist').required(),
});

//port validation
// Schema for a single port number
const portNumberSchema = Joi.number().integer().min(1).max(65535).required();

// The final schema uses .alternatives() to accept either a single number or an array
export const portValidationSchema = Joi.object({
  port: Joi.alternatives().try(
    portNumberSchema,
    Joi.array().items(portNumberSchema).min(1)
  ).required(),
  mode: Joi.string().valid('blacklist', 'whitelist').required(),
});
