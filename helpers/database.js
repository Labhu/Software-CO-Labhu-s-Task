const mongoose = require("mongoose");
const path = require("path");

class Database {
  dbConnect = async () => {
    try {
      await mongoose.connect(process.env.DB_URL);
      console.log("MongoDB Connected :", process.env.DB_URL);
      return;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    }
  };

  initModels = () => {
    require(path.join(__dirname, "../models"));
    return;
  };
}

module.exports = new Database();
