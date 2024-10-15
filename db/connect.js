const mongoose = require("mongoose");
const connectDB = () => {
  console.log("process.env.MONGO_URL", process.env.MONGO_URL);
  mongoose.Promise = global.Promise;
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("MongoDB Databse Connected Successfully!!");
    })
    .catch((err) => {
      console.log("Could not connect to the database", err);
      process.exit();
    });
};

module.exports = connectDB;
