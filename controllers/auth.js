const { catchAsync } = require("../helpers/common");
const { successResponse } = require("../helpers/response");
const { signUp, login } = require("../services/auth");
const resMsg = require("../helpers/messages");
const { statusCode } = require("../helpers/constant");

class AuthController {
  signUp = catchAsync(async (req, res) => {
    const data = await signUp(req);
    successResponse(res, statusCode.CREATED, resMsg.CREATED, data);
  });

  login = catchAsync(async (req, res) => {
    const data = await login(req);
    successResponse(res, statusCode.SUCCESS, resMsg.USER_LOGIN, data);
  });
}

module.exports = new AuthController();
