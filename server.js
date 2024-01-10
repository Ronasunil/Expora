const dotenv = require("dotenv");
const mongoose = require("mongoose");
const webSocketHandler = require("./wsManger.js");

mongoose.Promise = global.Promise;

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const startDB = async function () {
  try {
    console.log(process.env.LOCAL_DATABASE);
    await mongoose.connect(process.env.LOCAL_DATABASE);
    console.log("started db");
  } catch (err) {
    console.log(err);
  }
};

startDB();

const app = require("./app.js");

const port = process.env.PORT || 3000;

const server = app.listen(port);

webSocketHandler(server);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
