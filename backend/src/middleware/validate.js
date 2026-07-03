'use strict';

const { BadRequestError } = require('../utils/errors');

/**
 * Validate the request against a zod schema describing { body, query, params }.
 */
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return next(new BadRequestError('Validation failed', result.error.flatten()));
  }
  if (result.data.body) req.body = result.data.body;
  // Don't reassign req.query / req.params – Express 4/5 freeze them.
  return next();
};

module.exports = validate;
