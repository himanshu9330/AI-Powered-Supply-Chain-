/**
 * Wrap a Joi schema into Express middleware
 * @param {Object} schema - Joi object schema
 * @param {string} target - 'body' | 'query' | 'params'
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    req[target] = value;
    next();
  };
};

module.exports = validate;
