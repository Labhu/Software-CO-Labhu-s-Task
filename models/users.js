const { model, Schema } = require("mongoose");
const { commonSchema } = require("../helpers/common");
const { hashPassword } = require("../helpers/hash");

const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: String,
  role_id: { type: Schema.Types.ObjectId, ref: "roles", required: true },
  address: {
    type: String,
    default: "",
  },
  ...commonSchema(),
});

UserSchema.index(
  {
    active: 1,
    contact: 1,
    email: 1,
  },
  {
    name: "main",
  }
);

UserSchema.index(
  {
    first_name: "text",
    last_name: "text",
  },
  {
    name: "search",
  }
);

UserSchema.pre("save", function (next) {
  if (typeof this.password !== "undefined" && this.password !== "") {
    if (!this.isModified("password")) {
      return next();
    }

    this.password = hashPassword(this.password);
    next();
  } else {
    next();
  }
});

module.exports = model("users", UserSchema);
