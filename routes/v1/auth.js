const express = require("express");
const router = express.Router();
const {
  signUpValidator,
  loginValidator,
} = require("../../middlewares/validator/auth");
const { signUp, login } = require("../../controllers/auth");

router.post("/signup", signUpValidator, signUp);
router.post("/login", loginValidator, login);

module.exports = router;
