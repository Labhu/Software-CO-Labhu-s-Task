const express = require("express");
const {
  getRolesForDropdown,
  getModulesForDropdown,
} = require("../../controllers/master");
const router = express.Router();

router.get("/roles/dropdown", getRolesForDropdown);
router.get("/modules/dropdown", getModulesForDropdown);

module.exports = router;
