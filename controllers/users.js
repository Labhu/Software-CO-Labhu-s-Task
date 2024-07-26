const { catchAsync } = require("../helpers/common");
const { successResponse } = require("../helpers/response");
const resMsg = require("../helpers/messages");
const { statusCode } = require("../helpers/constant");
const {
  addUser,
  getUsers,
  deleteUser,
  bulkEditSameData,
  bulkUpdateDifferentData,
} = require("../services/users");

class UsersController {
  getAllUsers = catchAsync(async (req, res) => {
    const { data, metaData } = await getUsers(req);
    successResponse(res, statusCode.SUCCESS, resMsg.LISTING, data, metaData);
  });

  addUser = catchAsync(async (req, res) => {
    const data = await addUser(req);
    successResponse(res, statusCode.CREATED, resMsg.CREATED, data);
  });

  bulkEditSameData = catchAsync(async (req, res) => {
    await bulkEditSameData(req);
    successResponse(res, statusCode.SUCCESS, resMsg.UPDATED, {});
  });

  bulkEditDifferentData = catchAsync(async (req, res) => {
    const data = await bulkUpdateDifferentData(req);
    successResponse(res, statusCode.SUCCESS, resMsg.UPDATED, data);
  });

  deleteUser = catchAsync(async (req, res) => {
    await deleteUser(req);
    successResponse(res, statusCode.SUCCESS, resMsg.DELETED, {});
  });
}

module.exports = new UsersController();
