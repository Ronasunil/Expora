const mongoose = require("mongoose");
const fs = require("fs");
const Tour = require("./../../model/tourModel");

mongoose
  .connect(
    "mongodb+srv://rona:xDDhJb3SbvXyI5AX@cluster0.gkbu53p.mongodb.net/expora"
  )
  .then(() => console.log("connected"));
const saveData = async function () {
  const toursJson = JSON.parse(fs.readFileSync("./simple-tour.json", "utf-8"));
  const tours = await Tour.create(toursJson);

  console.log(tours);
};

saveData();
