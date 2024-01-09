//const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const webSocketHandler = require(`${path.join(__dirname, wsManger.js)}`);

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

//dotenv.config({ path: "./config.env" });

mongoose.connect(process.env.LOCAL_DATABASE);

const app = require(`${path.join(__dirname, app.js)}`);

const port = process.env.PORT || 3000;

const server = app.listen(port);

webSocketHandler(server);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
