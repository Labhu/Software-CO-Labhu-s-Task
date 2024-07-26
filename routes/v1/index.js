const express = require("express");
const router = express.Router();
const {
  checkUserAuth,
  checkUserModuleAccess,
} = require("../../middlewares/userAuth");

const auth = require("./auth");
const role = require("./roles");
const master = require("./master");
const user = require("./users");

router.use("/authentication", auth);
router.use("/roles", checkUserAuth, checkUserModuleAccess, role);
router.use("/master", checkUserAuth, master);
router.use("/users", checkUserAuth, checkUserModuleAccess, user);

module.exports = router;
