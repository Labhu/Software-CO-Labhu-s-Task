const mongoose = require("mongoose");
const { ErrorHandler } = require("../helpers/error");
const { statusCode, MASTER_DATA } = require("../helpers/constant");
const resMsg = require("../helpers/messages");
const { utcDefault, parse, generatePassword } = require("../helpers/common");
const { UserModel } = require("../models");
const {
  searchDataArr,
  getTotalCountQuery,
  getAggregationPagination,
  getPagination,
} = require("../helpers/dbQueryHelper");
const { checkUserExist } = require("./auth");
const { sendWelcomeMailWithCredentials } = require("../templates/users");

class UsersService {
  addUser = async ({ body, user }) => {
    try {
      if (await checkUserExist(body)) {
        throw new ErrorHandler(
          statusCode.CONFLICT,
          resMsg.EMAIL_ALREADY_EXISTS
        );
      }

      const obj = {
        ...body,
        password: generatePassword(),
        createdAt: utcDefault(),
        updatedAt: utcDefault(),
        createdBy: new mongoose.Types.ObjectId(user._id),
        updatedBy: new mongoose.Types.ObjectId(user._id),
      };
      let data = new UserModel(obj);
      data = parse(await data.save());
      delete data.password;

      // send mail for user credentials...
      await sendWelcomeMailWithCredentials(obj);
      return data;
    } catch (error) {
      throw error;
    }
  };

  getUsers = async ({ body, user }) => {
    try {
      const { _id, limit, pageNo, sort, sortBy, search } = body;

      let matchQuery = {
        isDeleted: false,
        ...(_id
          ? // profile or details data..
            { _id: new mongoose.Types.ObjectId(_id) }
          : {
              // remove login user from list..
              _id: {
                $ne: new mongoose.Types.ObjectId(user._id),
              },
            }),
      };

      if (search) {
        matchQuery = {
          ...matchQuery,
          ...searchDataArr(["first_name", "last_name", "role.name"], search),
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
            from: "roles",
            let: { roleId: "$role_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$roleId"] },
                      { $eq: ["$isDeleted", false] },
                      { $eq: ["$active", true] },
                    ],
                  },
                },
              },
            ],
            as: "role",
          },
        },
        {
          $unwind: {
            path: "$role",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            active: 1,
            contact: 1,
            address: 1,
            role: {
              _id: 1,
              name: 1,
              isSystemRole: 1,
            },
          },
        },
      ];

      const totalCountQuery = getTotalCountQuery(mainQuery);
      const totalCountResult = await UserModel.aggregate(totalCountQuery);
      const totalCount = totalCountResult[0] ? totalCountResult[0].count : 0;

      const listQuery = await getAggregationPagination(mainQuery, pagination);
      let data = await UserModel.aggregate(listQuery);

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

  bulkEditSameData = async ({ body, user }) => {
    try {
      let { email, user_ids } = body;

      // login user can not update self data..
      user_ids = user_ids
        .filter((u) => u.toString() !== user._id.toString())
        .map((id) => new mongoose.Types.ObjectId(id));

      // check req body exist email for bulk update..
      if (email && user_ids?.length > 1) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          resMsg.CAN_NOT_BULK_UPDATE_EMAIL
        );
      }

      if (email && (await checkUserExist(body, user_ids[0]))) {
        throw new ErrorHandler(
          statusCode.CONFLICT,
          resMsg.EMAIL_ALREADY_EXISTS
        );
      }

      const where = {
        _id: {
          $in: user_ids,
        },
        isDeleted: false,
      };

      // get users..
      const getUsers = parse(await UserModel.find(where).populate("role_id"));
      if (getUsers && getUsers.length == 0) {
        throw new ErrorHandler(statusCode.NOT_FOUND, resMsg.NOT_FOUND);
      }

      // if update user_ids include super admin.. make restrict to update...
      if (
        getUsers.find(
          (user) => user?.role_id?.name === MASTER_DATA.SYSTEM_ROLE.SUPER_ADMIN
        )
      ) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          resMsg.SUPER_ADMIN_NOT_UPDATE
        );
      }

      const fieldsToUpdate = this.getFieldsToUpdate(body);
      await UserModel.updateMany(where, {
        $set: {
          ...fieldsToUpdate,
          updatedAt: utcDefault(),
          updatedBy: new mongoose.Types.ObjectId(user._id),
        },
      });
      return {};
    } catch (error) {
      throw error;
    }
  };

  bulkUpdateDifferentData = async ({ body, user }) => {
    try {
      // Separate operations into valid and invalid based on checks
      const validUpdates = [];
      const invalidUpdates = [];

      for (const userData of body) {
        const { user_id, email } = userData;

        const fieldsToUpdate = this.getFieldsToUpdate(userData);

        const userExists = await UserModel.findById(user_id).populate(
          "role_id"
        );

        if (!userExists || userExists.isDeleted) {
          invalidUpdates.push({
            user_id,
            message: resMsg.NOT_FOUND,
          });
          continue;
        }

        // Check for super admin
        if (
          userExists?.role_id &&
          userExists?.role_id.name === MASTER_DATA.SYSTEM_ROLE.SUPER_ADMIN
        ) {
          invalidUpdates.push({
            user_id,
            message: resMsg.SUPER_ADMIN_NOT_UPDATE,
          });
          continue;
        }

        // Check email uniqueness
        if (email) {
          const emailExists = await checkUserExist({ email }, user_id);
          if (emailExists) {
            invalidUpdates.push({
              user_id,
              message: resMsg.EMAIL_ALREADY_EXISTS,
            });
            continue;
          }
        }

        validUpdates.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(user_id) },
            update: {
              $set: {
                ...fieldsToUpdate,
                updatedAt: utcDefault(),
                updatedBy: new mongoose.Types.ObjectId(user._id),
              },
            },
            upsert: true,
          },
        });
      }
      if (validUpdates.length > 0) {
        await UserModel.bulkWrite(validUpdates);
      }
      return { invalidRecords: invalidUpdates };
    } catch (err) {
      throw err;
    }
  };

  getFieldsToUpdate = (reqBody) => {
    const {
      user_id,
      first_name,
      last_name,
      contact,
      email,
      role_id,
      address,
      active,
    } = reqBody;

    return {
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(contact && { contact }),
      ...(email && { email }),
      ...(role_id && { role_id }),
      ...(address && { address }),
      ...(typeof active !== "undefined" && { active }),
    };
  };

  deleteUser = async ({ user, params }) => {
    try {
      const getUser = await UserModel.findOne({
        _id: new mongoose.Types.ObjectId(params.id),
        isDeleted: false,
      }).populate("role_id");

      if (!getUser) {
        throw new ErrorHandler(statusCode.NOT_FOUND, resMsg.NOT_FOUND);
      }

      //  if delete role is system role.. make restrict to inactive...
      if (getUser?.role_id?.name == MASTER_DATA.SYSTEM_ROLE.SUPER_ADMIN) {
        throw new ErrorHandler(
          statusCode.BAD_REQUEST,
          resMsg.SUPER_ADMIN_NOT_DELETE
        );
      }

      // soft delete user from db...
      let data = await UserModel.updateOne(
        { _id: new mongoose.Types.ObjectId(getUser._id) },
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

module.exports = new UsersService();
