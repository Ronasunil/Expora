const mongoose = require("mongoose");
const Tour = require("./../../model/tourModel");
const fs = require("fs");

mongoose
  .connect("mongodb://localhost:27017/expora")
  .then(() => console.log("connected"));
const getData = async function () {
  const tours = await Tour.find();

  console.log(tours);
  const toursJson = JSON.stringify(tours);

  fs.writeFileSync("./simple-tour.json", toursJson, "utf-8");
};

getData();
