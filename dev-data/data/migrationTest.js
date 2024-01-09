const mongoose = require("mongoose");
const Tour = require("./../../model/tourModel");

mongoose.connect("mongodb://localhost:27017/expora");

const generateTourDates = function () {
  const tourDates = [];
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`January 1 ${currentYear}`);
  const endDate = new Date(`December 31 ${currentYear}`);

  for (let i = 0; i < 5; i++) {
    const randomDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime()) +
        1
    );

    tourDates.push(randomDate);
  }

  return tourDates;
};

const addTourDates = async function () {
  const allTours = await Tour.find();

  for (const tour of allTours) {
    tour.tourDates = generateTourDates();
    await tour.save({ validateModifiedOnly: true });
    console.log(tour);
  }
};

const closeProcess = async function () {
  await addTourDates();

  process.exit();
};

closeProcess();
