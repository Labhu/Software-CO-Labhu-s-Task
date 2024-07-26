const { model, Schema } = require("mongoose");
const { commonSchema } = require("../helpers/common");

const RoleSchema = new Schema({
  name: String,
  access_modules: [
    { type: Schema.Types.ObjectId, ref: "modules", default: [] },
  ],
  isSystemRole: {
    type: Boolean,
    default: false,
  },
  ...commonSchema(),
});

RoleSchema.index(
  {
    active: 1,
  },
  {
    name: "main",
  }
);

RoleSchema.index(
  {
    name: "text",
  },
  {
    name: "search",
  }
);

module.exports = model("roles", RoleSchema);
