const express = require("express");
const router = express.Router();
const {
  addUserValidator,
  getUsersValidator,
  bulkEditSameDataValidator,
  bulkEditDifferentDataValidator,
} = require("../../middlewares/validator/users");
const {
  getAllUsers,
  addUser,
  bulkEditSameData,
  deleteUser,
  bulkEditDifferentData,
} = require("../../controllers/users");

router.post("/getAll", getUsersValidator, getAllUsers);
router.post("/add", addUserValidator, addUser);

router.post("/bulk-update/same", bulkEditSameDataValidator, bulkEditSameData);

router.post(
  "/bulk-update/different",
  bulkEditDifferentDataValidator,
  bulkEditDifferentData
);
router.delete("/delete/:id", deleteUser);

module.exports = router;
