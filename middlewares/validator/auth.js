const Joi = require("joi");
const { ErrorHandler } = require("../../helpers/error");
const { statusCode } = require("../../helpers/constant");
const resMsg = require("../../helpers/constant");
const { catchAsync } = require("../../helpers/common");

class AuthValidator {
  signUpValidator = catchAsync(async (req, res, next) => {
    const validationSchema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      contact: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      address: Joi.string().optional().default(""),
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

  loginValidator = catchAsync(async (req, res, next) => {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
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

module.exports = new AuthValidator();
