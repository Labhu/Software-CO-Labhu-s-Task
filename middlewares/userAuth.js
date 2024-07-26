const { statusCode, MASTER_DATA } = require("../helpers/constant");
const resMsg = require("../helpers/messages");
const { catchAsync, getArrayChanges } = require("../helpers/common");
const { ErrorHandler } = require("../helpers/error");
const mongoose = require("mongoose");
const { verifyJWTToken } = require("../helpers/jwt");
const UserModel = require("../models/users");
const RoleModel = require("../models/roles");

class AuthMiddleware {
  checkAPIKey = catchAsync(async (req, res, next) => {
    if (!req.headers["x-api-key"])
      throw new ErrorHandler(statusCode.UNAUTHORIZED, resMsg.UNAUTHORIZED_KEY);

    if (req.headers["x-api-key"] !== process.env.API_ACCESS_KEY)
      throw new ErrorHandler(
        statusCode.UNAUTHORIZED,
        resMsg.INVALID_ACCESS_KEY
      );

    next();
  });

  checkUserAuth = catchAsync(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token)
      throw new ErrorHandler(statusCode.UNAUTHORIZED, resMsg.UNAUTHORIZED);

    try {
      req.user = await verifyJWTToken(token);
    } catch (error) {
      throw new ErrorHandler(
        statusCode.UNAUTHORIZED,
        resMsg.INVALID_ACCESS_TOKEN
      );
    }

    const checkUser = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(req.user._id),
      isDeleted: false,
    });

    if (!checkUser)
      throw new ErrorHandler(statusCode.UNAUTHORIZED, resMsg.USER_NOT_FOUND);

    if (checkUser.active == false)
      throw new ErrorHandler(statusCode.UNAUTHORIZED, resMsg.IN_ACTIVE_USER);

    next();
  });

  checkUserModuleAccess = catchAsync(async (req, res, next) => {
    // Get module base on api url..
    const module = req.baseUrl.split("/v1/")[1];

    const { role, access_modules } = req.user;

    // check if login user is super admin..
    if (role.name == MASTER_DATA.SYSTEM_ROLE.SUPER_ADMIN) {
      next();
      return;
    }

    // Check user permission...
    const result = await this.checkPermission(role._id, access_modules, module);
    if (!result.allow)
      next(
        new ErrorHandler(
          statusCode.FORBIDDEN,
          result.message || resMsg.ACCESS_DENIED
        )
      );
    else next();
  });

  checkPermission = async (roleId, tokenPermissions, moduleName) => {
    try {
      let allow = false;
      let message = "";

      const dbRoleAccess = await RoleModel.findOne({
        _id: new mongoose.Types.ObjectId(roleId),
        isDeleted: false,
        active: true,
      }).populate("access_modules");

      if (dbRoleAccess) {
        const dbPermissions = dbRoleAccess.access_modules.map((r) =>
          r._id.toString()
        );

        // Check if token permissions match DB permissions..
        const { removedElements, addedElements } = getArrayChanges(
          tokenPermissions.map((m) => m._id.toString()),
          dbPermissions
        );

        //  if access remove/add in role..need to re-login for new permission...
        if (removedElements.length > 0 || addedElements.length > 0) {
          message = resMsg.ROLE_ACCESS_CHANGED;
        }
        // else check module access....
        else {
          if (tokenPermissions.find((module) => module.slug == moduleName)) {
            allow = true;
          }
        }
      }

      return { allow, message };
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new AuthMiddleware();
