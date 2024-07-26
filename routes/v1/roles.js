const express = require("express");
const router = express.Router();
const {
  addEditRoleValidator,
  getRoleValidator,
} = require("../../middlewares/validator/roles");
const {
  addRole,
  getAllRoles,
  editRole,
  deleteRole,
} = require("../../controllers/roles");

router.post("/getAll", getRoleValidator, getAllRoles);
router.post("/add", addEditRoleValidator, addRole);
router.put("/update/:id", addEditRoleValidator, editRole);
router.delete("/delete/:id", deleteRole);

module.exports = router;
