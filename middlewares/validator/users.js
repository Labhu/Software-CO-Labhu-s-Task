const Joi = require("joi");
const { ErrorHandler } = require("../../helpers/error");
const { statusCode } = require("../../helpers/constant");
const resMsg = require("../../helpers/constant");
const { catchAsync } = require("../../helpers/common");
const { paginationValidator } = require("./common");

class UserValidator {
  addUserValidator = catchAsync(async (req, res, next) => {
    const validationSchema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().required(),
      contact: Joi.string().required(),
      role_id: Joi.string().required(),
      address: Joi.string().optional().default(""),
      active: Joi.boolean().required(),
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

  getUsersValidator = catchAsync(async (req, res, next) => {
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

  bulkEditSameDataValidator = catchAsync(async (req, res, next) => {
    const validationSchema = Joi.object({
      first_name: Joi.string().optional(),
      last_name: Joi.string().optional(),
      contact: Joi.string().optional(),
      email: Joi.string().optional(),
      role_id: Joi.string().optional(),
      address: Joi.string().optional(),
      active: Joi.boolean().optional(),
      user_ids: Joi.array().min(1).required(),
    }).min(2); // At least 'user_ids' and one other field must be present

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

  bulkEditDifferentDataValidator = async (req, res, next) => {
    try {
      const validationSchema = Joi.array()
        .items(
          Joi.object({
            user_id: Joi.string().required(),
            first_name: Joi.string().optional(),
            last_name: Joi.string().optional(),
            contact: Joi.string().optional(),
            email: Joi.string().optional().email(),
            role_id: Joi.string().optional(),
            address: Joi.string().optional(),
            active: Joi.boolean().optional(),
          }).min(2) // At least 'user_id' and one other field must be present
        )
        .min(1);

      const { error, value } = validationSchema.validate(req.body);

      if (error) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          error.details[0].message || resMsg.BAD_REQUEST
        );
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new UserValidator();
