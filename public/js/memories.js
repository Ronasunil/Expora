import L from "leaflet";
import axios from "axios";
import { routeChanger } from "./routeChanger";
import Swal from "sweetalert2";

let map, reversedCoordinates;

// inputs
const memoriesForm = document.querySelector(".memories-inputs");
const inputLocation = document.querySelector(".memories-location");
const inputDescription = document.querySelector(".memories-description");
const inputDate = document.querySelector(".memories-date");
const inputImages = document.getElementById("file");

// error labels
const errorLocationLabel = document.querySelector(".err-message-location");
const errorDescriptionlabel = document.querySelector(
  ".err-message-description"
);

const errImgLabel = document.querySelector(".err-message-photo");
const errorDateLabel = document.querySelector(".err-message-date.message");

const clearingErrors = function () {
  errorDateLabel.textContent =
    errorDescriptionlabel.textContent =
    errorLocationLabel.textContent =
      "";
};

// adding marker to map according to location(encapsulated function)
const addMarker = async function (locationValue) {
  try {
    // get longitude and lattitude according to city
    const data = await axios(
      `https://api.geoapify.com/v1/geocode/search?city=${locationValue}&apiKey=857d4394470d41e5a3577c123b68b803`
    );

    const coordinates = data.data.features[0]?.geometry?.coordinates ?? null;
    if (!coordinates)
      return (errorLocationLabel.textContent = "Please enter a valid city");
    reversedCoordinates = [...coordinates].reverse();

    // render lat and lng to map
    map.setView(reversedCoordinates, 13, { animate: true });

    L.marker(reversedCoordinates).addTo(map);
  } catch (err) {
    throw err;
  }
};

const showError = function (err) {
  console.log(err);
  err.forEach((err) => {
    if (err.path === "photo") errImgLabel.textContent = err.message;
    if (err.path === "location") errorLocationLabel.textContent = err.message;

    if (err.path === "description")
      errorDescriptionlabel.textContent = err.message;

    if (err.path === "date") errorDateLabel.textContent = err.message;
  });
};

export const renderMap = function () {
  // creating map object
  map = L.map("map", {
    zoomControl: false,
    attributionControl: false,
  }).setView([51.505, -0.09], 13);

  //   setting tile layer for map
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
};

export const addMemories = async function (e) {
  // check inputs are valid
  const locationValue = inputLocation.value.toLowerCase();
  const descriptionValue = inputDescription.value;
  const dateValue = inputDate.value;
  const image = inputImages.files[0];

  console.log(locationValue, descriptionValue, dateValue, image);

  if (!memoriesForm.checkValidity()) return;

  e.preventDefault();

  try {
    // adding marker to location
    await addMarker(locationValue);

    // save to database
    const form = new FormData();
    form.append("location", locationValue);
    form.append("description", descriptionValue);
    form.append("date", dateValue);
    form.append("profileImg", image);

    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/memories",
      data: form,
    });

    console.log(res);

    //clearing all errors if succesfull
    clearingErrors();

    // alert for success
    Swal.fire("Memories succesfully added");

    // changing route
    routeChanger("/profile");
  } catch (err) {
    console.log(err.response.data);
    // clearingErrors;
    clearingErrors();

    const error = err?.response?.data?.errInfo;

    showError(error);
  }
};
