const { catchAsync } = require("../helpers/common");
const { successResponse } = require("../helpers/response");
const resMsg = require("../helpers/messages");
const { statusCode } = require("../helpers/constant");
const {
  getRolesForDropdown,
  getModulesForDropdown,
} = require("../services/master");

class MasterController {
  getRolesForDropdown = catchAsync(async (req, res) => {
    const data = await getRolesForDropdown(req);
    successResponse(res, statusCode.SUCCESS, resMsg.LISTING, data);
  });

  getModulesForDropdown = catchAsync(async (req, res) => {
    const data = await getModulesForDropdown(req);
    successResponse(res, statusCode.SUCCESS, resMsg.LISTING, data);
  });
}

module.exports = new MasterController();
