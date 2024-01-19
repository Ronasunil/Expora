import axios from "axios";

const tourContainer = document.querySelector(".tour-cards");
const heading = document.querySelector(".tertiary-heading");
const pageCount = document.querySelector(".page-number");
const iconRight = document.querySelector(".icon-right");
const iconLeft = document.querySelector(".icon-left");
const checkBoxes = document.querySelectorAll(".checkbox-default");
let page = 1;
let skip = 7;

let allTours, currentTour;

const resetPagination = function (tours) {
  page = 1;
  pageCount.textContent = page;

  iconLeft.classList.add("hide");
  iconRight.classList.add("hide");

  if (tours.length > 7) iconRight.classList.remove("hide");
  if (page > 1) iconLeft.classList.remove("hide");
  console.log(page, page > 1);
};
const getTours = async function () {
  if (allTours) return allTours;

  const response = await (await fetch("/api/v1/tours")).json();
  const tours = response.data.tours;

  allTours = tours;

  return allTours;
};

const setCatogreyValue = function (item) {
  localStorage.setItem("selectValue", JSON.stringify(item));
};

const setFilterValue = function (item) {
  localStorage.setItem("filterValue", JSON.stringify(item));
};

const getLocalStorage = function (key) {
  const value = JSON.parse(localStorage.getItem(key));
  return value;
};

const createMarkup = function (data) {
  const markup = `<div class="tour-card">
                    <img class="card-img" src=${data.coverImg} alt="Tour image">
                    <p class="brand-heading"><span class="upper-part">${data.tourName}</span></p>
                    <div class="icons">
                        <div class="row">
                        <p><i class="tour-icon fa-solid fa-location-dot"></i> ${data.location}</p>
                        <p><i class="tour-icon fa-solid fa-calendar-days"></i> ${data.duration}</p>
                    </div>
                        <div class="row">
                        <p><i class="tour-icon fa-regular fa-flag"></i> ${data.stops}</p>
                        <p><i class="tour-icon fa-regular fa-user"></i> ${data.maxPeople} </p>
                        </div>
                    </div>
                    <a class="btn" id="light-green" href="/tour/${data.slug}">More</a></div>`;

  return markup;
};

const renderTour = function (tours) {
  tourContainer.innerHTML = "";
  tours.length === 0
    ? (heading.textContent = "No tour found")
    : (heading.textContent = "Explore all the tours");
  const cloneTours = tours.slice(skip * page - skip, skip * page);
  console.log(cloneTours.length);
  if (cloneTours.length !== skip) iconRight.classList.add("hide");
  cloneTours.forEach((tour) => {
    const html = createMarkup(tour);
    tourContainer.insertAdjacentHTML("beforeend", html);
  });
};

export const searchTours = async function (e) {
  tourContainer.innerHTML = "";
  const searchValue = this.value.trim();
  const tours = await getTours();

  const regex = new RegExp(`^${searchValue}`, "i");
  const searchedTour = tours.filter((tour) => {
    return regex.test(tour.tourName.toLowerCase());
  });

  if (searchedTour.length === 0) return (heading.textContent = "No tour found");

  heading.textContent = "Explore all the tours";
  currentTour = searchedTour;

  resetPagination(searchedTour);

  renderTour(searchedTour);
};

export const categorizeTour = async function (e) {
  tourContainer.innerHTML = "";
  const selectedOption = this.options[this.selectedIndex];
  const filterValue = getLocalStorage("filterValue");

  setCatogreyValue(selectedOption.value);
  if (selectedOption.value === "All") {
    // clear all filter option
    checkBoxes.forEach((el) => (el.checked = false));

    // clearing localStorage
    localStorage.clear();

    // display every tour
    const response = await (await fetch(`api/v1/tours`)).json();
    const { tours } = response.data;

    return renderTour(tours);
  }
  const response = await (
    await fetch(
      `api/v1/tours?${selectedOption.value}${
        filterValue ? "&" + filterValue : "&"
      }`
    )
  ).json();
  const { tours } = response.data;

  if (tours.length === 0) return (heading.textContent = "No tour found");
  currentTour = tours;

  resetPagination(tours);

  renderTour(tours);
};

export const renderTopTours = async function () {
  tourContainer.innerHTML = "";
  const response = await (
    await fetch("/api/v1/tours?rating[gt]=4.5&&sort=price&limit=5")
  ).json();

  const tours = response.data.tours;
  if (tours.length === 0) return (heading.textContent = "No tour found");
  currentTour = tours;
  resetPagination(tours);
  renderTour(tours);
};

export const renderAllTours = async function () {
  const selectVal = getLocalStorage("selectValue");
  const filterValue = getLocalStorage("filterValue");
  const url = selectVal
    ? `/api/v1/tours?${selectVal}${filterValue ? "&" + filterValue : "&"}`
    : `/api/v1/tours`;
  if (!tourContainer) return;
  tourContainer.innerHTML = "";

  const response = await (await fetch(url)).json();

  const tours = response.data.tours;
  if (tours.length === 0) return (heading.textContent = "No tour found");
  currentTour = tours;

  resetPagination(tours);

  renderTour(tours);
};

export const renderFilterTour = async function (e) {
  // Elements
  const isEl = e.target.classList.contains("checkbox-default");

  const catogrey = getLocalStorage("selectValue");

  const catogreyValue = catogrey ? `&${catogrey}` : "&";
  if (!isEl) return;

  //current checkbox
  const el = e.target;

  // clearing all other checkbox
  checkBoxes.forEach((item) => {
    if (el !== item) item.checked = false;
  });

  setFilterValue(el.value);

  console.log(`api/v1/tours?${el.value}${catogreyValue}`);

  // sending req to database
  const res = await axios({
    method: "GET",
    url: `api/v1/tours?${el.value}${catogreyValue}`,
  });

  const { tours } = res.data.data;
  currentTour = tours;

  resetPagination(tours);

  // rendering filtered tours
  renderTour(tours);
};

renderAllTours();

export const paginateRight = function () {
  page++;
  console.log(page);
  pageCount.textContent = page;
  if (page > 1) iconLeft.classList.remove("hide");
  renderTour(currentTour);
};
export const paginateLeft = function () {
  page--;
  pageCount.textContent = page;
  iconRight.classList.remove("hide");
  if (page <= 1) iconLeft.classList.add("hide");
  renderTour(currentTour);
};
