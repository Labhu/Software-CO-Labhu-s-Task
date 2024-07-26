const Joi = require("joi");

class CommonValidator {
  paginationValidator = () => {
    return {
      limit: Joi.number().integer().min(0).default(10),
      pageNo: Joi.number().integer().min(1).default(1),
      search: Joi.string().allow("").optional(),
      sort: Joi.string().default("_id"),
      sortBy: Joi.string().default("desc"),
    };
  };
}

module.exports = new CommonValidator();
