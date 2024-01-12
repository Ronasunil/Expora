const tourContainer = document.querySelector(".tour-cards");
const heading = document.querySelector(".tertiary-heading");
const selectOptions = document.querySelector(".options");

let allTours;

const getTours = async function () {
  if (allTours) return allTours;

  const response = await (await fetch("/api/v1/tours")).json();
  const tours = response.data.tours;

  allTours = tours;

  return allTours;
};

const setLocalStorage = function (item, index) {
  localStorage.setItem("selectValue", JSON.stringify(item));
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
  console.log(tours);
  tourContainer.innerHTML = "";
  tours.forEach((tour) => {
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
  renderTour(searchedTour);
};

export const categorizeTour = async function (e) {
  tourContainer.innerHTML = "";
  const selectedOption = this.options[this.selectedIndex];

  setLocalStorage(selectedOption.value);

  const response = await (
    await fetch(`api/v1/tours?${selectedOption.value}`)
  ).json();
  const tours = response.data.tours;

  if (tours.length === 0) return (heading.textContent = "No tour found");

  renderTour(tours);
};

export const renderTopTours = async function () {
  tourContainer.innerHTML = "";
  const response = await (
    await fetch("/api/v1/tours?rating[gt]=4.5&&sort=price&limit=5")
  ).json();

  const tours = response.data.tours;
  if (tours.length === 0) return (heading.textContent = "No tour found");
  renderTour(tours);
};

export const renderAllTours = async function () {
  console.log(selectOptions.value);
  const selectVal = getLocalStorage("selectValue");
  const url = selectVal ? `/api/v1/tours?${selectVal}` : `/api/v1/tours`;
  if (!tourContainer) return;
  tourContainer.innerHTML = "";

  const response = await (await fetch(url)).json();

  const tours = response.data.tours;
  if (tours.length === 0) return (heading.textContent = "No tour found");
  renderTour(tours);
};

renderAllTours();
