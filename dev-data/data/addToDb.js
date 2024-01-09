const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Tour = require("./../../model/tourModel");

dotenv.config({ path: `${__dirname}/../../config.env` });

mongoose.connect(process.env.LOCAL_DATABASE);

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/simple-tour.json`, "utf-8")
);
// console.log(toursData);
const saveToDb = async function () {
  try {
    console.log(Tour);
    const data = await Tour.create(toursData);
    console.log(data);
  } catch (err) {
    console.log(err.message);
  } finally {
    process.exit();
  }
};

const deleteFromDb = async function () {
  try {
    await Tour.deleteMany();
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};
console.log(process.argv);
if (process.argv[2] === "--savedata") saveToDb();
if (process.argv[2] === "--deletedata") deleteFromDb();
