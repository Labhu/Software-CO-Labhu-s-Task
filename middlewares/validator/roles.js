const Joi = require("joi");
const { ErrorHandler } = require("../../helpers/error");
const { statusCode } = require("../../helpers/constant");
const resMsg = require("../../helpers/constant");
const { catchAsync } = require("../../helpers/common");
const { paginationValidator } = require("./common");

class RoleValidator {
  addEditRoleValidator = catchAsync(async (req, res, next) => {
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      active: Joi.boolean().required(),
      access_modules: Joi.array().optional().default([]),
    });

    const { error, value } = validationSchema.validate(req.body);

    if (error) {
      throw new ErrorHandler(
        statusCode.BAD_REQUEST,
        error.details[0].message || resMsg.BAD_REQUEST
      );
    }
    req.body = value;
    next();
  });

  getRoleValidator = catchAsync(async (req, res, next) => {
    const validationSchema = Joi.object({
      ...paginationValidator(),
      _id: Joi.string().optional(),
    });

    const { error, value } = validationSchema.validate(req.body);

    if (error) {
      throw new ErrorHandler(
        statusCode.BAD_REQUEST,
        error.details[0].message || resMsg.BAD_REQUEST
      );
    }
    req.body = value;
    next();
  });
}

module.exports = new RoleValidator();
