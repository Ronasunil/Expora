import axios from "axios";
import Swal from "sweetalert2";
import { routeChanger } from "./routeChanger";

// DOM elements
const reviewSection = document.querySelector(".customer-feedback-section");
const submitBtn = document.querySelector(".review-feedback-btn");
const sliderContainer = document.querySelector(".slider-container");
const slides = sliderContainer?.childNodes;
const testimonialHeading = document.querySelector(".testimonial-heading");

let starValue,
  currentSlide = 0;

const createStarMarkup = function (rating) {
  let markup = "";
  for (let i = 0; i < 5; i++) {
    const starClass = i <= rating ? "fa-solid green-text" : "fa-regular";
    markup += `<i class="${starClass} fa fa-star"></i>`;
  }
  return markup;
};

const createSliderMarkup = function (data, i) {
  const markup = `<div class="slide slide-${
    i + 1
  }" style="transform:translate(${i * 100}%,-50%)">
                    <div class="customer-info">
                        <img class="review-img" src=${
                          data.user.profileImg
                        } alt="User image">
                        <p>${data.user.name}
                    </div>
                    <div class="customer-saying">
                        <p class="customer-img-saying">${data.review}
                        <div class="star"> 
                            ${createStarMarkup(data.rating)}
                    </div>    
                  </div>`;

  return markup;
};

const toggleBookmark = (el) => {
  el.classList.toggle("fa-regular");
  el.classList.toggle("bookmark-icon");
  el.classList.toggle("fa-solid");
  el.classList.toggle("unbookmark-icon");
};

const getCurrentUser = async function () {
  const data = await axios({
    method: "GET",
    url: "/api/v1/users/account",
  });
  return data.data.data.user;
};

const addToBookmark = async function (tourId) {
  await axios({
    method: "PATCH",
    url: `/api/v1/users/bookmark/${tourId}`,
  });
};

const removeBookmark = async function (tourId) {
  await axios({
    method: "DELETE",
    url: `/api/v1/users/bookmark/${tourId}`,
  });
};

export const bookmark = async function () {
  const user = await getCurrentUser();
  const { tourId } = this.dataset;

  const bookmarkBtn = this.classList.contains("bookmark-icon");
  const unbBookmarkBtn = this.classList.contains("unbookmark-icon");
  if (bookmarkBtn) await addToBookmark(tourId);
  if (unbBookmarkBtn) await removeBookmark(tourId);

  toggleBookmark(this);
};

export const renderBookmarkStatus = async function () {
  const user = await getCurrentUser();

  const bookmarkIcon = document.querySelector(".bookmark-icon");
  if (!bookmarkIcon) return;
  const { tourId } = bookmarkIcon.dataset;

  const isBookmarked = user.bookmarks.some((tour) => tour._id === tourId);

  if (isBookmarked) toggleBookmark(bookmarkIcon);
};

export const updateStarRating = function (e) {
  const stars = Array.from(document.querySelectorAll(".star-size"));
  const star = e.target.classList.contains("star-size");
  starValue = +e.target.dataset.value;
  if (!star) return;
  stars.forEach((el) => {
    el.classList.add("fa-regular");
    el.classList.remove("fa-solid");
  });
  stars.some((el, i) => {
    if (i === starValue) return true;
    el.classList.remove("fa-regular");
    el.classList.add("fa-solid");
  });
  return starValue;
};

// updating testimonial section
const updateTestimonials = async function () {
  if (sliderContainer) sliderContainer.innerHTML = "";

  const { tourId } = submitBtn.dataset;
  try {
    const data = await axios({
      method: "GET",
      url: `/api/v1/tours/${tourId}/reviews`,
    });

    testimonialHeading.textContent = `TESTIMONIALS(${data.data.totalReviews})`;
    const { reviews } = data.data.data;
    reviews.forEach((review, i) => {
      const html = createSliderMarkup(review, i);
      sliderContainer.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    console.log(err);
  }
};

export const submitReview = async function () {
  // get inputs
  const rating = +starValue;
  const review = document.querySelector(".input-customer-feedback").value;
  const { tourId } = this.dataset;

  // validate inputs
  const reviewErr = document.querySelector(".feeedback-err");

  if (!rating) return (reviewErr.textContent = "Review needs rating");

  if (review.trim().length < 20)
    return (reviewErr.textContent = "Review atleast need 20 charcters");

  // sending data to api
  try {
    const data = await axios({
      url: `/api/v1/tours/${tourId}/reviews`,
      method: "POST",
      data: {
        review,
        rating,
      },
    });
    reviewErr.textContent = "";
    const message = data.data.message;
    Swal.fire(message);

    // update testimonials
    await updateTestimonials();
  } catch (err) {
    console.log(err);
    const message = err.response.data.message;
    reviewErr.textContent = message;
  }
};

// slider

const goToSlide = function (slide) {
  slides.forEach((el, i) => {
    el.style.transform = `translate(${100 * (i - slide)}%, -50%)`;
  });
};

// slide left
export const slideToLeft = function () {
  const maxSlide = sliderContainer.childNodes.length - 1;
  currentSlide--;

  if (currentSlide < 0) currentSlide = maxSlide;

  goToSlide(currentSlide);
};

export const slideToRight = function () {
  const maxSlide = sliderContainer.childNodes.length;

  currentSlide++;

  if (currentSlide === maxSlide) currentSlide = 0;

  goToSlide(currentSlide);
};

const validatePeople = function (input) {
  const maxLength = 10;
  const minLength = 1;
  const value = Number.parseInt(input);
  const errLabel = document.querySelector(".people-err-label");

  console.log(input);

  if (value < minLength || value > maxLength) {
    errLabel.textContent =
      "Value should be greater than 0 and less than or equal to 10";
    return false;
  }

  errLabel.textContent = "";
  return true;
};

export const displayChekout = function (e) {
  const { tourId, tourSlug, bookingDate } = e.target.dataset;
  const peopleCount = document.getElementById("numberOfPeople").value;
  console.log(peopleCount);
  const isValid = validatePeople(peopleCount);

  if (!isValid) return;

  routeChanger(
    `/checkout/${tourSlug}?bookingDate=${bookingDate}&size=${peopleCount}`
  );
};

export const renderBookingDates = async function () {
  const { tourId, tourSlug } = this.dataset;
  const res = await axios({
    method: "GET",
    url: `/api/v1/tours/${tourId}/avialable-bookings`,
  });

  let { bookingTourDates } = res.data.data;

  bookingTourDates = bookingTourDates.filter(
    (booking) => new Date(booking) > Date.now()
  );

  const bookingMarkup = `<div style="display: flex; flex-direction: column;">
  ${bookingTourDates
    .map(
      (date, index) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;">
      <div>
        <h3>BOOKING ${index + 1}:</h3>
        <p>Booking Date: ${new Date(date).toDateString()}</p>
      </div>
      <div>
        <button id="purchaseBtn${index}" class="btn bookingBtn green" data-tour-id=${tourId} data-tour-slug=${tourSlug} data-booking-date=${date} >Purchase</button>
      </div>
    </div>
  `
    )
    .join("")}
  
  <div style="display: flex; justify-content: center; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;">
    <div>
      <h3>Number of People:</h3>
      <input  type="number" min="1" max="10" id="numberOfPeople" class="input-max-people"  value="1" placeholder="size" />
      <p style=" color: red"; font-size: "15px"; " class="people-err-label"><p/>
    </div>
  </div>
</div>`;

  const htmlContent =
    bookingTourDates.length === 0
      ? `<h3>Bookings has filled out </h3>`
      : bookingMarkup;

  Swal.fire({
    title: "Bookings",
    html: htmlContent,
    showCancelButton: false,
    showConfirmButton: false,
    preConfirm: () => {},
  });
};
