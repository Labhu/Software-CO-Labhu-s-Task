const mongoose = require("mongoose");
const { ErrorHandler } = require("../helpers/error");
const { statusCode } = require("../helpers/constant");
const resMsg = require("../helpers/messages");
const { utcDefault, parse } = require("../helpers/common");
const { UserModel, RoleModel } = require("../models");
const {
  searchDataArr,
  getTotalCountQuery,
  getAggregationPagination,
  getPagination,
} = require("../helpers/dbQueryHelper");

class RoleService {
  checkRoleExist = async (roleName, id = null) => {
    let isExist = false;
    const where = {
      name: {
        $regex: roleName,
        $options: "i",
      },
      ...(id
        ? {
            _id: {
              $ne: new mongoose.Types.ObjectId(id),
            },
          }
        : {}),
    };

    const user = await RoleModel.findOne(where);
    if (user) isExist = true;
    return isExist;
  };

  addRole = async ({ body, user }) => {
    try {
      if (await this.checkRoleExist(body?.name)) {
        throw new ErrorHandler(statusCode.CONFLICT, resMsg.ALREADY_EXISTS);
      }

      let data = new RoleModel({
        name: body?.name,
        active: body.active,
        access_modules: body?.access_modules?.map(
          (m) => new mongoose.Types.ObjectId(m)
        ),
        createdAt: utcDefault(),
        updatedAt: utcDefault(),
        createdBy: new mongoose.Types.ObjectId(user._id),
        updatedBy: new mongoose.Types.ObjectId(user._id),
      });
      data = parse(await data.save());
      return data;
    } catch (error) {
      throw error;
    }
  };

  getRoles = async ({ body }) => {
    try {
      const { _id, limit, pageNo, sort, sortBy, search } = body;

      let matchQuery = {
        isDeleted: false,
        ...(_id ? { _id: new mongoose.Types.ObjectId(_id) } : {}),
      };

      if (search) {
        matchQuery = {
          ...matchQuery,
          ...searchDataArr(["name"], search),
        };
      }

      const pagination = getPagination({
        pageLimit: limit,
        pageNum: pageNo,
        sort: sort,
        sortBy: sortBy,
      });

      const mainQuery = [
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "modules",
            let: { modulesId: "$access_modules" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$modulesId"] },
                      { $eq: ["$isDeleted", false] },
                      { $eq: ["$active", true] },
                    ],
                  },
                },
              },
            ],
            as: "access_modules",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            isSystemRole: 1,
            active: 1,
            access_modules: {
              $map: {
                input: {
                  $cond: {
                    if: {
                      $and: [
                        { $isArray: "$access_modules" },
                        { $ne: ["$access_modules", []] },
                      ],
                    },
                    then: "$access_modules",
                    else: [],
                  },
                },
                as: "access_modules",
                in: {
                  _id: "$$access_modules._id",
                  emp_img: "$$access_modules.name",
                  name: "$$access_modules.slug",
                },
              },
            },
          },
        },
      ];

      const totalCountQuery = getTotalCountQuery(mainQuery);
      const totalCountResult = await RoleModel.aggregate(totalCountQuery);
      const totalCount = totalCountResult[0] ? totalCountResult[0].count : 0;

      const listQuery = await getAggregationPagination(mainQuery, pagination);
      let data = await RoleModel.aggregate(listQuery);

      let metaData = {};
      // Only for Listing data.. (_id means only one data)
      if (!_id) {
        metaData = {
          total: totalCount,
          limit: pagination.limit,
          pageNo: pagination.page,
          totalPages:
            pagination.limit > 0 ? Math.ceil(totalCount / pagination.limit) : 1,
          currentPage: pagination.page,
        };
      }

      return { data, metaData };
    } catch (error) {
      throw error;
    }
  };

  editRole = async ({ body, user, params }) => {
    try {
      if (await this.checkRoleExist(body?.name, params.id)) {
        throw new ErrorHandler(statusCode.CONFLICT, resMsg.ALREADY_EXISTS);
      }

      const getRole = await RoleModel.findOne({
        _id: new mongoose.Types.ObjectId(params.id),
        isDeleted: false,
      });

      if (!getRole) {
        throw new ErrorHandler(statusCode.NOT_FOUND, resMsg.NOT_FOUND);
      }

      //  if update role is system role.. make restrict to inactive...
      if (getRole.isSystemRole == true) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          resMsg.SYSTEM_ROLE_NOT_UPDATE
        );
      }

      let data = await RoleModel.updateOne(
        { _id: new mongoose.Types.ObjectId(getRole._id) },
        {
          $set: {
            name: body?.name,
            active: body?.active,
            access_modules: body?.access_modules?.map(
              (m) => new mongoose.Types.ObjectId(m)
            ),
            updatedAt: utcDefault(),
            updatedBy: new mongoose.Types.ObjectId(user._id),
          },
        }
      );
      return data;
    } catch (error) {
      throw error;
    }
  };

  deleteRole = async ({ user, params }) => {
    try {
      const getRole = await RoleModel.findOne({
        _id: new mongoose.Types.ObjectId(params.id),
        isDeleted: false,
      });

      if (!getRole) {
        throw new ErrorHandler(statusCode.NOT_FOUND, resMsg.NOT_FOUND);
      }

      //  if delete role is system role.. make restrict to update...
      if (getRole.isSystemRole == true) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          resMsg.SYSTEM_ROLE_NOT_DELETED
        );
      }

      // check users are associated with delete role...
      const getUsers = await UserModel.findOne({
        role_id: new mongoose.Types.ObjectId(params.id),
        isDeleted: false,
      });

      if (getUsers) {
        throw new ErrorHandler(statusCode.BAD_REQUEST, resMsg.ROLE_NOT_DELETED);
      }

      // soft delete role from db...
      let data = await RoleModel.updateOne(
        { _id: new mongoose.Types.ObjectId(getRole._id) },
        {
          $set: {
            isDeleted: true,
            deletedAt: utcDefault(),
            deletedBy: new mongoose.Types.ObjectId(user._id),
          },
        }
      );
      return data;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new RoleService();
