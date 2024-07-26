require("dotenv").config();
const express = require("express");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();
const v1 = require("./routes/v1");
const { dbConnect, initModels } = require("./helpers/database");
const { errorResponse } = require("./helpers/response");
const { checkAPIKey } = require("./middlewares/userAuth");

// Limit request body size
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use("/public", express.static("public"));

// database connection...
(async () => {
  await dbConnect();
  initModels();

  const { checkDefaultDataForApp } = require("./services/master");
  await checkDefaultDataForApp();
})();

// API endpoint:
app.use("/v1", checkAPIKey, v1);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log("Error :: ", err);
  return errorResponse(res, err.status || 500, err.message);
});

module.exports = app;
