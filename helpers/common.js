const { Schema } = require("mongoose");
const moment = require("moment");

class CommonHelpers {
  catchAsync = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch((err) => {
      next(err);
    });
  };

  utcDefault() {
    let date = new Date();
    return moment.utc(date).format();
  }

  commonSchema = (addExpiry = false) => {
    try {
      return {
        // Create..
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: "users",
          default: null,
        },
        createdAt: {
          type: Date,
          default: this.utcDefault(),
          ...(addExpiry && { expires: "10d", index: true }), // if need to remove/delete data automatic from db..
        },

        // Update...
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "users",
          default: null,
        },
        updatedAt: { type: Date, default: this.utcDefault() },

        // Delete.. (For soft delete data..)
        deletedBy: {
          type: Schema.Types.ObjectId,
          ref: "users",
          default: null,
        },
        deletedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false },

        // Active/in-active data...
        active: { type: Boolean, default: true },
      };
    } catch (error) {
      console.log("🚀 ~ CommonHelpers ~ commonSchema ~ error:", error);
    }
  };

  getArrayChanges(originalArray, updatedArray) {
    const sortedArr1 = originalArray?.slice().sort();
    const sortedArr2 = updatedArray?.slice().sort();

    const addedValues = sortedArr2?.filter(
      (value) => !sortedArr1?.includes(value)
    );
    const removedValues = sortedArr1?.filter(
      (value) => !sortedArr2?.includes(value)
    );

    return {
      addedElements: addedValues || [],
      removedElements: removedValues || [],
    };
  }

  parse(data) {
    return JSON.parse(JSON.stringify(data));
  }

  generatePassword(length = 10) {
    try {
      const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      let password = "";
      for (let i = 0; i < length; ++i) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
    } catch (error) {
      console.log("🚀 ~ CommonHelpers ~ generatePassword ~ error:", error);
    }
  }
}

module.exports = new CommonHelpers();
