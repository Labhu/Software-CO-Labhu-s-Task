const { getArrayChanges, parse } = require("../helpers/common");
const { MASTER_DATA } = require("../helpers/constant");
const { UserModel, RoleModel, ModulesModel } = require("../models");
const mongoose = require("mongoose");
const { checkRoleExist } = require("./roles");

class MasterService {
  checkDefaultDataForApp = async () => {
    await Promise.all([
      this.handleDefaultRole(),
      this.handleSuperUserData(),
      this.handleAppModules(),
    ]);
    return;
  };

  addNewRole = async (roleName) => {
    const isExist = await checkRoleExist(roleName);
    if (!isExist) {
      const newRole = new RoleModel({ name: roleName, isSystemRole: true });
      await newRole.save();
    }
    return;
  };

  getSuperAdmin = async () => {
    const query = [
      {
        $match: {
          isDeleted: false,
          active: true,
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
                    { $eq: ["$name", MASTER_DATA.SYSTEM_ROLE.SUPER_ADMIN] },
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
    ];

    const superAdmin = await UserModel.aggregate(query);
    return superAdmin.length > 0 ? superAdmin[0] : null;
  };

  //  system have default role 1. super admin for manage user and 2. user for new added..
  handleDefaultRole = async () => {
    try {
      const getRoles = await RoleModel.find({
        isDeleted: false,
        isSystemRole: true,
      });
      const systemData = MASTER_DATA.SYSTEM_ROLE;

      // check system role are added or not..
      if (getRoles && getRoles.length > 0) {
        const dbRoles = getRoles.map((r) => r.name);

        // check super admin role exist..
        if (!dbRoles.includes(systemData.SUPER_ADMIN)) {
          await this.addNewRole(systemData.SUPER_ADMIN);
        }

        // check user role exist..
        if (!dbRoles.includes(systemData.USER)) {
          await this.addNewRole(systemData.USER);
        }
      } else {
        const systemRole = Object.values(systemData);
        for (let i = 0; i < systemRole.length; i++) {
          const role = systemRole[i];
          await this.addNewRole(role);
        }
      }
      return;
    } catch (error) {
      console.log("🚀 ~ MasterService ~ handleDefaultRole= ~ error:", error);
    }
  };

  // one user add as super admin for handle system..
  handleSuperUserData = async () => {
    try {
      if (!(await this.getSuperAdmin())) {
        const systemData = MASTER_DATA.SYSTEM_ROLE;

        const getRoles = await RoleModel.findOne({
          isDeleted: false,
          isSystemRole: true,
          name: systemData.SUPER_ADMIN,
        });

        //  create super admin...
        let data = new UserModel({
          first_name: "Super",
          last_name: "Admin",
          contact: "9989906554",
          email: "superadmin@gmail.com",
          password: "Test@123",
          role_id: getRoles._id,
        });
        await data.save();
      }
      return;
    } catch (error) {
      console.log("🚀 ~ MasterService ~ handleSuperUserData= ~ error:", error);
    }
  };

  //   system have per-define module as master data..
  handleAppModules = async () => {
    try {
      const systemData = Object.values(MASTER_DATA.MODULES);
      const superAdmin = await this.getSuperAdmin();

      // Module master data sync with database...
      for (let i = 0; i < systemData.length; i++) {
        const moduleName = systemData[i];
        const moduleSlug = moduleName.toLowerCase().trim().replace(/\s+/g, "-");

        const isExist = await ModulesModel.findOne({
          slug: {
            $regex: moduleSlug,
            $options: "i",
          },
          isDeleted: false,
        });

        if (!isExist) {
          let newData = new ModulesModel({
            name: moduleName,
            slug: moduleSlug,
            createdBy: superAdmin._id,
            updatedBy: superAdmin._id,
          });
          await newData.save();
        }
      }

      // module not exits in master data so need to delete it from db to manage delete chain...
      await this.handleDeleteChainOfModule();

      return;
    } catch (error) {
      console.log("🚀 ~ MasterService ~ handleAppModules= ~ error:", error);
    }
  };

  handleDeleteChainOfModule = async () => {
    const systemModules = Object.values(MASTER_DATA.MODULES).map((module) =>
      module.toLowerCase().trim().replace(/\s+/g, "-")
    );

    //  get modules from db..
    const dbData = parse(await ModulesModel.find({ isDeleted: false }));
    const dbModules = dbData.map((m) => m.slug);

    // get a module which are deleted from MATER DATA...
    const { addedElements } = getArrayChanges(systemModules, dbModules);

    // module not exits in master data so need to delete it from db to manage delete chain...
    if (addedElements.length > 0) {
      //  delete access module from role..
      const moduleIds = dbData
        .filter((d) => addedElements.includes(d.slug))
        .map((t) => new mongoose.Types.ObjectId(t._id));

      await RoleModel.updateMany(
        {},
        {
          $pull: { access_modules: { $in: moduleIds } },
        }
      );

      // delete module from modules model..
      await ModulesModel.deleteMany({
        slug: {
          $in: addedElements,
        },
      });
    }
    return;
  };

  getRolesForDropdown = async ({ user }) => {
    try {
      return await RoleModel.find({
        isDeleted: false,
        active: true,
        name: {
          $ne: MASTER_DATA.SYSTEM_ROLE.SUPER_ADMIN,
        },
      })
        .select("name isSystemRole")
        .sort({ isSystemRole: -1, name: 1 });
    } catch (error) {
      throw error;
    }
  };

  getModulesForDropdown = async ({ user }) => {
    try {
      return await ModulesModel.find({
        isDeleted: false,
        active: true,
      })
        .select("name")
        .sort({ name: 1 });
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new MasterService();
