const { model, Schema } = require("mongoose");
const { commonSchema } = require("../helpers/common");

const ModulesSchema = new Schema({
  name: String,
  slug: String,
  ...commonSchema(),
});

ModulesSchema.index(
  {
    active: 1,
  },
  {
    name: "main",
  }
);

ModulesSchema.index(
  {
    name: "text",
  },
  {
    name: "search",
  }
);

module.exports = model("modules", ModulesSchema);
