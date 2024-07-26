const mongoose = require("mongoose");
const { ErrorHandler } = require("../helpers/error");
const { statusCode, MASTER_DATA } = require("../helpers/constant");
const resMsg = require("../helpers/messages");
const { utcDefault, parse } = require("../helpers/common");
const { UserModel, RoleModel } = require("../models");
const { verifyPassword } = require("../helpers/hash");
const { createJWTToken } = require("../helpers/jwt");

class AuthService {
  checkUserExist = async (body, id = null) => {
    let isExist = false;
    const where = {
      isDeleted: false,
      email: body.email,
      ...(id
        ? {
            _id: {
              $ne: new mongoose.Types.ObjectId(id),
            },
          }
        : {}),
    };

    const user = await UserModel.findOne(where);
    if (user) isExist = true;
    return isExist;
  };

  signUp = async ({ body }) => {
    try {
      //check user with same email should not exist
      if (await this.checkUserExist(body)) {
        throw new ErrorHandler(
          statusCode.CONFLICT,
          resMsg.EMAIL_ALREADY_EXISTS
        );
      }

      // get user role..
      const role = await RoleModel.findOne({
        isDeleted: false,
        name: MASTER_DATA.SYSTEM_ROLE.USER,
      });

      //save user data in db...
      let data = new UserModel({
        ...body,
        role_id: role._id,
        createdAt: utcDefault(),
        updatedAt: utcDefault(),
      });
      data = parse(await data.save());
      delete data.password;
      return data;
    } catch (error) {
      throw error;
    }
  };

  login = async ({ body }) => {
    try {
      const query = [
        {
          $match: {
            isDeleted: false,
            email: body.email,
          },
        },
        {
          $lookup: {
            from: "roles",
            let: { role_id: "$role_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$role_id"] },
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
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "modules",
            let: { modulesId: "$role.access_modules" },
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
            first_name: 1,
            last_name: 1,
            email: 1,
            password: 1,
            active: 1,
            role: {
              _id: 1,
              name: 1,
              isSystemRole: 1,
            },
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
                  name: "$$access_modules.name",
                  slug: "$$access_modules.slug",
                },
              },
            },
          },
        },
      ];
      let getUser = await UserModel.aggregate(query);

      getUser = getUser[0] || null;

      //if user exist OR db password is NULL OR passwords don't match
      if (
        !getUser ||
        !getUser?.password ||
        !verifyPassword(getUser?.password, body?.password)
      )
        throw new ErrorHandler(statusCode.BAD_REQUEST, resMsg.USER_NOT_FOUND);

      if (getUser.active == false)
        throw new ErrorHandler(statusCode.UNAUTHORIZED, resMsg.INACTIVE_USER);

      delete getUser.password;
      getUser.authToken = createJWTToken(getUser);

      return getUser;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new AuthService();
