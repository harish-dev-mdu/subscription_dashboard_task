const { errorResponse } = require('../utils/response.utils');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });
      next();
    } catch (error) {
      if (error.errors) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return errorResponse(res, 'Validation failed', 400, errors);
      }
      return errorResponse(res, 'Validation failed', 400);
    }
  };
};

module.exports = { validate };
