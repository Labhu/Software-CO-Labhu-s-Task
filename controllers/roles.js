const { catchAsync } = require("../helpers/common");
const { successResponse } = require("../helpers/response");
const resMsg = require("../helpers/messages");
const { statusCode } = require("../helpers/constant");
const {
  addRole,
  getRoles,
  editRole,
  deleteRole,
} = require("../services/roles");

class RoleController {
  getAllRoles = catchAsync(async (req, res) => {
    const { data, metaData } = await getRoles(req);
    successResponse(res, statusCode.SUCCESS, resMsg.LISTING, data, metaData);
  });

  addRole = catchAsync(async (req, res) => {
    const data = await addRole(req);
    successResponse(res, statusCode.CREATED, resMsg.CREATED, data);
  });

  editRole = catchAsync(async (req, res) => {
    await editRole(req);
    successResponse(res, statusCode.SUCCESS, resMsg.UPDATED, {});
  });

  deleteRole = catchAsync(async (req, res) => {
    await deleteRole(req);
    successResponse(res, statusCode.SUCCESS, resMsg.DELETED, {});
  });
}

module.exports = new RoleController();
