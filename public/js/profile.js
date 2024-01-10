import axios from "axios";
import Swal from "sweetalert2";

import { Chart } from "chart.js/auto";
import { saveAs } from "file-saver";

// DOM ELEMENTS
const itemsContainer = document.querySelector(".dash-board-commodity");

const dashboardHeading = document.querySelector(".dashboard-heading");
const dashBoardRightItem = document.querySelector(".dash-board-actions");
const date = document.querySelector(".date");
const addTourIcon = document.querySelector(".fa-plus");
const bookingBtn = document.querySelector(".admin-bookings-btn");
const ws = new WebSocket("wss://expora-75fa4c861fb7.herokuapp.com/");

ws.addEventListener("open", () => {
  console.log("WebSocket connection opened");
});

ws.addEventListener("message", (e) => {
  const data = JSON.parse(e.data);
  const msg = data;

  // sending notification with notification pi
  showNotification(msg);
});

ws.addEventListener("close", () => {
  console.log("server closed");
});

// displaying current date
const now = new Date();
if (date)
  date.textContent = `${now.getDate()}/${
    now.getMonth() + 1
  }/${now.getFullYear()}`;

// creating user  markup
const generateUserMarkup = function (data) {
  return ` <div class="item" data-slug="${data.slug}">
                    <div class="contents">
                        <img class="item-img" src=${data.profileImg}>
                        <p class="item-name">${data.name}</p>
                        <div class="btns">
                            <button class="edit-btn orange admin-user-block-btn">block</button>
                            <button class="edit-btn green admin-user-unblock-btn">unblock</button>
                            <button class="edit-btn red admin-user-delete-btn">delete</button>
                        </div> 
                    </div>
                </div>`;
};

const generateCouponMarkup = function (data) {
  return `<div class="coupon-container border-green">
              <p class="coupon-code">COUPON CODE: ${data.couponCode}</p>
              <p class="coupon-valid">VALID: ${
                data.isValid === true ? "Yes" : "No"
              }</p>
              <div class="btns">
                <button class="edit-btn orange admin-coupon-delete-btn" data-coupon-id=${
                  data._id
                }>delete</button>
                <button class="edit-btn green admin-coupon-edit-btn" data-coupon-id=${
                  data._id
                }>edit</button>
              </div>
          </div>`;
};

// creating Tour markup
const generateBookingMarkup = function (data) {
  const hideVerifyBtn = data.status === "confirmed" ? "hide" : "";
  const hideRejectBtn = data.status === "cancelled" ? "hide" : "";

  return ` <div class="item" data-slug="${data?._id}">
                <div class="contents">
                    <img class="item-img" src=${data.tour?.coverImg}>
                    <p class="item-name">${data.tour?.tourName}</p>
                    <div class="btns">
                        <button class="edit-btn red admin-tour-reject-btn ${hideRejectBtn}">reject</button>
                        <button class="edit-btn green admin-tour-verify-btn ${hideVerifyBtn}">verify</button>
                        <a href="/booking-info/${data._id}" id="light-blue" class="edit-btn admin-info-btn" data-booking-code=${data.bookingId}>info</a>
                    </div> 
                </div>
            </div>`;
};

// creating a sending notification markup
const generateNotificationMarkup = function () {
  const notificationMarkup = `<div class="notification">
                            <form class="notification-form">
                              <input class="input-notification-subject" type="text" placeholder="Heading" required minlength=4 pattern="[a-zA-Z]*"/>
                              <textarea class="message-area notification-text" placeholder="content" required minlength=10 pattern="[a-zA-Z]*"></textarea>
                              <button class="btn center notification-btn">Send notification</button>
                            </form>
                          </div>`;
  return notificationMarkup;
};

const generateTourMarkup = function (data) {
  return ` <div class="item" data-slug="${data.slug}">
              <div class="contents">
                  <img class="item-img" src=${data.coverImg}>
                  <p class="item-name">${data.tourName}</p>
                  <div class="btns">
                      <button class="edit-btn green admin-tour-edit-btn }">edit</button>
                      <button class="edit-btn red admin-tour-delete-btn">delete</button>
                  </div> 
              </div>
           </div>`;
};

const createAnalyticsMarkup = function () {
  return `<canvas id="myChart" class="grap-chart"></canvas>`;
};

export const renderNotificationMenu = function () {
  // clearing item in container
  itemsContainer.innerHTML = "";
  dashBoardRightItem.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity-feedback");
  const markup = generateNotificationMarkup();

  itemsContainer.insertAdjacentHTML("beforeend", markup);
};

const renderDropDown = function () {
  dashBoardRightItem.innerHTML = "";
  const optionMarkup = `<select class="analytics-dropdown">
                          <option value="2023">Monthly</option>
                          <option value="all"> Yearly</option>
                        </select> 
                        
                        <button class="download-btn">Download </button>
                        `;
  dashBoardRightItem.insertAdjacentHTML("beforeend", optionMarkup);
};

// top bar for  grouped tour headings
const renderGroupedTourBar = function () {
  const markup = `<div class="booking-heading">
                    <p class="boooking-tour-name">Tour </p>
                    <p class="booking-user-name">Customer </p>
                    <p class="booking-date">Month</p>
                    <p class="booking-price">Price</p>
                  </div>`;
  itemsContainer.insertAdjacentHTML("beforeend", markup);
};

const createBookingsMarkup = function (booking) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const bookingMonth = months[new Date(booking.createdAt).getMonth()];
  return `<div class="tour">
            <img class="booking-tour-img" src=${booking.tour.coverImg} alt="Tour image" />
            <p class="booking-cutomer-name">${booking.user.name}</p>
            <p class="booking-tour-date">${bookingMonth}</p>
            <p class="booking-tour-price">${booking.tour.price}</p>
          </div>`;
};

const renderBookingSelect = function (bookings) {
  let options = "";

  bookings.forEach((booking) => {
    if (options.includes(booking.tour.tourName));
    else
      options += `<option value=${booking.tour._id}>${booking.tour.tourName}</option>`;
  });

  const tourOptionMarkup = `<select class="booking-select">${options}</select>`;
  dashBoardRightItem.insertAdjacentHTML("beforeend", tourOptionMarkup);
};

const renderGraph = async function (value) {
  let chart;
  itemsContainer.innerHTML = "";
  const markup = createAnalyticsMarkup();
  itemsContainer.insertAdjacentHTML("beforeend", markup);
  try {
    const data = await axios({
      method: "GET",
      url: `/api/v1/bookings/stats/${value}`,
    });

    const analytics = data.data.data.stat;
    const stats = analytics.map((stat) => stat.count);
    const labelArr = analytics.map((stat) => stat.dateInfo);

    // render graphs
    const ctx = document.getElementById("myChart");
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labelArr,
        datasets: [
          {
            label: `Analytics of  ${value}`,
            data: stats,
            borderWidth: 1,
          },
        ],
      },
      options: {
        onClick: function (ev, el) {
          const labelIndex = el[0].index;
          const labelValue = chart.data.labels[labelIndex];
          if (typeof labelValue !== "number") return;
          renderGraph(labelValue);
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const dropdownAction = async function () {
  await renderGraph(this.value);
};

export const renderGroupedBookings = async function (tourId) {
  // clear everything
  itemsContainer.innerHTML = "";
  itemsContainer.classList = "";
  dashBoardRightItem.innerHTML = "";
  dashboardHeading.textContent = "Bookings";
  itemsContainer.classList.add("grouped-booking");

  try {
    // making req to get data
    const res = await axios({
      method: "GET",
      url: `/api/v1/bookings/tour/${tourId}`,
    });

    // taking boking from response
    const bookings = res.data.data.booking;

    // rendering a top bar to show title of each items
    renderGroupedTourBar();

    // rendering every tours
    bookings.forEach((booking) => {
      const html = createBookingsMarkup(booking);
      itemsContainer.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    console.log(err);
  }
};

// rendering items
const renderItems = function (data) {
  itemsContainer.insertAdjacentHTML("beforeend", data);
};

export const renderAnalytics = async function () {
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity-graph");
  const markup = createAnalyticsMarkup();
  itemsContainer.insertAdjacentHTML("beforeend", markup);

  // rendering dropdown for monthly and year wise result
  renderDropDown();
  await renderGraph(2023);

  // adding eventListner to dropdown
  document
    .querySelector(".analytics-dropdown")
    .addEventListener("change", dropdownAction);

  dashboardHeading.textContent = "Analytics";
};

// updating tour
const updateTour = async function (slug, inputs) {
  const form = new FormData();

  const tourFeatures = inputs.inputFeatures.value.split(",");

  form.append("tourName", inputs.inputTourName.value);
  form.append("catagory", inputs.inputCatagorey.value);
  form.append("difficulty", inputs.inputDifficulty.value);
  form.append("maxPeople", inputs.inputMaxPeople.value);
  form.append("location", inputs.inputLocation.value);
  form.append("duration", inputs.inputDuration.value);
  form.append("price", inputs.inputPrice.value);
  form.append("description", inputs.inputDescription.value);
  tourFeatures.forEach((feature, i) => {
    form.append(`features[${i}]`, feature);
  });

  form.append("stops", Number.parseInt(inputs.inputStops.value));

  if (inputs.coverImg.files.length > 0)
    form.append("coverImg", inputs.coverImg.files[0]);

  // Assuming inputs.tourImg_1, inputs.tourImg_2, inputs.tourImg_3 are input fields for tour images
  if (inputs.tourImg_1.files.length > 0)
    form.append("tourImgs", inputs.tourImg_1.files[0]);

  if (inputs.tourImg_2.files.length > 0)
    form.append("tourImgs", inputs.tourImg_2.files[0]);

  if (inputs.tourImg_3.files.length > 0)
    form.append("tourImgs", inputs.tourImg_3.files[0]);

  //sending data
  try {
    const response = await axios({
      method: "PATCH",
      url: `/api/v1/tours/slug/${slug}`,
      data: form,
    });
    showTours();
  } catch (err) {
    console.log(err);
  }
};

// displaying all users
export const showUsers = async function () {
  itemsContainer.innerHTML = "";
  itemsContainer.classList = "";
  dashBoardRightItem.innerHTML = "";
  dashboardHeading.textContent = "Users";
  itemsContainer.classList.add("dash-board-commodity");
  try {
    const response = await axios({
      method: "GET",
      url: "/api/v1/users",
    });

    const users = response.data.data.users;
    users.forEach(function (user) {
      const userMarkup = generateUserMarkup(user);
      renderItems(userMarkup);
      dashboardHeading.textContent = "users";
    });
  } catch (err) {
    console.log(err);
  }
};

// users admin action like block unblock and delete
export const adminAction = async function (id, updateObj, text) {
  try {
    const response = await axios({
      method: "PATCH",
      url: `api/v1/admins/user/${id}`,
      data: updateObj,
    });
    const message = response.data.message;
    Swal.fire({
      icon: "success",
      title: message,
      text,
      confirmButtonColor: "#71C34E",
    });
  } catch (err) {
    console.log(err);
  }
};

// displaying all Tours
export const showTours = async function () {
  // addTourIcon.classList.remove("hide");
  itemsContainer.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  dashboardHeading.textContent = "Tours";

  const response = await axios({
    method: "GET",
    url: "/api/v1/tours",
  });
  const tours = response.data.data.tours;

  tours.forEach(function (tour) {
    const markup = generateTourMarkup(tour);
    renderItems(markup);
    dashboardHeading.textContent = "tours";
  });
};

// popup and sending data
export const editPopup = async function (slug) {
  // default tour value mainly used to create tour
  let tour = {
    slug: "",
    coverImg: "/img/tours/select-tour.png",
    tourName: "",
    catagory: "",
    difficulty: "",
    maxPeople: "",
    location: "",
    duration: "",
    price: "",
    stops: "",
    tourImgs: [
      "/img/tours/select-tour.png",
      "/img/tours/select-tour.png",
      "/img/tours/select-tour.png",
    ],
    features: [],
    description: "",
  };

  //check slug if there is slug it will update existing document mainly for updating
  if (slug) {
    const response = await axios({
      method: "get",
      url: `api/v1/tours/slug/${slug}`,
    });

    tour = response.data.data.tour;
  }

  // edit or create popup
  return Swal.fire({
    html:
      `<form class="update-form" data-slug="${tour.slug || ""}">` +
      `<input type="file" accept="image/*" id="input-cover-image"  name="coverImg">` +
      `<label for="input-cover-image"><img src="${
        tour.coverImg || ""
      }" alt="Image" class="img-update-box" /></label>` +
      `<input type="text" id="input1" class="swal2-input edit-input visible " value="rona"  >` +
      `<div class='swal-input-row'>` +
      `<input type="text" id="input1" class="swal2-input edit-input input-tour-name swal-input-edit" required minlength="6" placeholder="Tour name" value="${
        tour.tourName || ""
      }">` +
      `<input type="text" id="input2" class="swal2-input edit-input input-catagorey swal-input-edit" required minlength="4" placeholder="Catagory" value="${
        tour.catagory || ""
      }">` +
      `</div>` +
      `<div class='swal-input-row'>` +
      `<input type="text" id="input1" class="swal2-input edit-input input-difficulty swal-input-edit" required minlength="4" placeholder="Difficulty" value="${
        tour.difficulty || ""
      }">` +
      `<input type="text" id="input2" class="swal2-input edit-input input-max-people swal-input-edit" required minlength="1" placeholder="Max people" value="${
        tour.maxPeople || ""
      }">` +
      `</div>` +
      `<div class='swal-input-row'>` +
      `<input type="text" id="input2" class="swal2-input edit-input input-location swal-input-edit" required minlength="3" placeholder="Location" value="${
        tour.location || ""
      }">` +
      `<input type="text" id="input1" class="swal2-input edit-input input-duration swal-input-edit" required minlength="1" placeholder="Duration" value="${
        tour.duration || ""
      }">` +
      `</div>` +
      `<div class='swal-input-row'>` +
      `<input type="text" id="input2" class="swal2-input edit-input input-price swal-input-edit" required minlength="1" placeholder="Price" value="${
        tour.price || ""
      }">` +
      `<input type="text" id="input2" class="swal2-input edit-input input-stop swal-input-edit" required minlength="1" placeholder="Stops" value="${
        tour.stops || ""
      }">` +
      `</div>` +
      `<div class="swal-input-row">` +
      `<label for="input-images-1"><img class="select-img" src="${tour.tourImgs[0]}"></label>` +
      `<input class="input-cover-img-1" id="input-images-1" type="file" accept="image/*" name="tourImgs">` +
      `<label for="input-images-2"><img class="select-img" src="${tour.tourImgs[1]}"></label>` +
      `<input class="input-cover-img-2" id="input-images-2" type="file" accept="image/*" name="tourImgs">` +
      `<label for="input-images-3"><img class="select-img" src="${tour.tourImgs[2]}"></label>` +
      `<input class="input-cover-img-3" id="input-images-3" type="file" accept="image/*" name="tourImgs">` +
      `</div>` +
      `<textarea id="txtArea" rows="20" cols="20" class="swal2-textarea input-features swal-input-edit" required minlength="10" placeholder="Features">${
        tour.features.join(",") || ""
      }</textarea>` +
      `<textarea id="txtArea" rows="10" cols="20" class="swal2-textarea input-description swal-input-edit" required minlength="40" placeholder="Tour description">${
        tour.description || ""
      }</textarea>` +
      `</form>`,
    confirmButtonText: "Submit",
    showCancelButton: true,
    preConfirm: async () => {
      // form
      const form = document.querySelector(".update-form");
      const inputFields = Array.from(
        document.querySelectorAll(".swal-input-edit")
      );

      // regex to check if any special charcater is included in input
      const regex = new RegExp(/[!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?~]/);

      // checking every input

      for (const input of inputFields) {
        if (regex.test(input.value) || input.value.trim().length === 0) {
          Swal.showValidationMessage(
            "check any field is empty or any field has special characters"
          );

          return false;
        }
      }

      // check form is valid
      if (!form.checkValidity()) {
        Swal.showValidationMessage(
          "check if any field is empty or you give any improper details"
        );
        return false;
      }

      return true;
    },
  });
};

// rendering edit coupon popup
export const renderCouponEditPopup = async function (e, fn) {
  let coupon;
  // Take coupon id for findig coupon
  const { couponId } = e.target?.dataset ?? null;

  if (!couponId) return;

  // api request to get info of coupon need to be updated
  try {
    const res = await axios({
      method: "GET",
      url: `/api/v1/coupons/${couponId}`,
    });
    coupon = res.data.data.coupon;
  } catch (err) {
    console.log(err);
  }
  Swal.fire({
    title: "Edit",
    html:
      '<form class="edit-coupon-form">' +
      '<div style="display: flex; flex-direction: column; gap: 10px;">' +
      '<label for="couponCode">Coupon Code</label>' +
      `<input id="couponCode" class="swal2-input input-coupon-code" value=${coupon.couponCode}  style="margin-top: 0;" placeholder="Enter Coupon Code" required minlength="4" maxlength="6">` +
      '<label for="valid">Valid</label>' +
      `<input id="valid" class="swal2-input input-coupon-valid" value=${
        coupon.isValid === true ? "Yes" : "No"
      }  style="margin-top: 0;" placeholder="Enter Valid" required title="value must be yes or no">` +
      '<label for="discount">Discount</label>' +
      `<input id="discount" class="swal2-input input-coupon-discount" value=${coupon.discountPercentage} style="margin-top: 0;" placeholder="Enter Discount" required>` +
      "</div>" +
      "</form>",

    preConfirm: () => {
      const form = document.querySelector(".edit-coupon-form");
      const coupon = document.querySelector(".input-coupon-code").value;
      const discount = document.querySelector(".input-coupon-discount").value;
      let tokenValidity = document.querySelector(".input-coupon-valid").value;

      if (
        tokenValidity.trim().toLowerCase() !== "yes" &&
        tokenValidity.trim().toLowerCase() !== "no"
      )
        return Swal.showValidationMessage("invalid input for valid field");
      if (!form.checkValidity())
        return Swal.showValidationMessage(
          "Please fill every input field in valid format"
        );
      tokenValidity =
        tokenValidity.trim().toLowerCase() === "yes" ? true : false;

      fn({ coupon, discount, tokenValidity, couponId: couponId });
    },
  });
};

// date picking for  sales report
export const renderDatePicker = function (fn) {
  Swal.fire({
    title: "Select Date Range",
    html:
      "<div>" +
      '<label for="start-date">Start Date:</label>' +
      '<input type="date" id="start-date" class="swal2-input start-date" />' +
      "</div>" +
      "<div>" +
      '<label for="end-date">End Date:</label>' +
      '<input type="date" id="end-date" class="swal2-input end-date" />' +
      "</div>" +
      // '<select id="format-select" class="download-selection" class="swal2-input">' +
      // '<option class="select-csv" value="pdf">PDF</option>' +
      // '<option class="select-pdf" value="csv">CSV</option>' +
      // "</select>" +
      "</div>",
    focusConfirm: false,
    preConfirm: () => {
      const startDate = document.getElementById("start-date").value;
      const endDate = document.getElementById("end-date").value;
      // const selectedFormat = document.getElementById("format-select").value;

      if (!startDate || !endDate) {
        Swal.showValidationMessage("Please select both start and end dates");
        return false;
      }

      fn({ startDate, endDate });
    },
  });
};

export const downloadSalesReport = async function (obj) {
  const { startDate, endDate } = obj;

  try {
    // making api request
    const data = await axios({
      method: "POST",
      url: "api/v1/bookings/sales-revenue",
      data: {
        startDate,
        endDate,
      },
      responseType: "arraybuffer",
    });

    // file name for downloading pdf
    const fileName = "sales-report.pdf";

    // creating a blob  for file to download
    const blob = new Blob([data.data], {
      type: data.headers["Content-Type"],
    });

    // downloading it
    saveAs(blob, fileName);
  } catch (err) {
    Swal.fire("Error downloading pdf try again later");
  }
};

// edit tour
export const editTour = async function (slug, inputFields) {
  updateTour(slug, inputFields);
  showTours();
};

// createTour
export const createTour = async function (inputs) {
  const form = new FormData();

  form.append("tourName", inputs.inputTourName.value);
  form.append("catagory", inputs.inputCatagorey.value);
  form.append("difficulty", inputs.inputDifficulty.value);
  form.append("maxPeople", inputs.inputMaxPeople.value);
  form.append("location", inputs.inputLocation.value);
  form.append("duration", inputs.inputDuration.value);
  form.append("price", inputs.inputPrice.value);
  form.append("description", inputs.inputDescription.value);
  form.append("features", inputs.inputFeatures.value.split(","));
  form.append("stops", Number.parseInt(inputs.inputStops.value));

  if (inputs.coverImg.files.length > 0)
    form.append("coverImg", inputs.coverImg.files[0]);

  // Assuming inputs.tourImg_1, inputs.tourImg_2, inputs.tourImg_3 are input fields for tour images
  if (inputs.tourImg_1.files.length > 0)
    form.append("tourImgs", inputs.tourImg_1.files[0]);

  if (inputs.tourImg_2.files.length > 0)
    form.append("tourImgs", inputs.tourImg_2.files[0]);

  if (inputs.tourImg_3.files.length > 0)
    form.append("tourImgs", inputs.tourImg_3.files[0]);

  try {
    const response = await axios({
      method: "POST",
      url: "/api/v1/tours",
      data: form,
    });
  } catch (err) {
    console.log(err);
  }
};

// display all bookings of all user

export const showAllBookings = async function () {
  // clear all items
  itemsContainer.innerHTML = "";
  dashBoardRightItem.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  dashboardHeading.textContent = "bookings";

  // get all bookings
  const response = await axios({
    method: "GET",
    url: "api/v1/bookings",
  });

  const bookings = response.data.data.bookings;

  // rendering a select with all booked tour
  renderBookingSelect(bookings);

  // rendering the booking
  bookings.forEach((booking) => {
    const markup = generateBookingMarkup(booking);
    renderItems(markup);
  });
};

//  accepting and rejecting user booked tour (Admin action)
export const updateBooking = async function (bookingId, status, text) {
  try {
    const booking = await axios({
      method: "PATCH",
      url: `api/v1/bookings/${bookingId}`,
      data: {
        status,
      },
    });

    Swal.fire({
      icon: "success",
      title: "Success",
      text,
      confirmButtonColor: "#71C34E",
    });
    showAllBookings();
  } catch (err) {
    console.log(err);
  }
};

// showing all coupons
export const renderCoupons = async function () {
  itemsContainer.innerHTML = "";
  dashBoardRightItem.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity-coupon");
  dashboardHeading.textContent = "Coupons";

  const addIconMarkup =
    '<a href="/create-coupon"><i class="fa fa-plus add-icon"></i></a>';

  dashBoardRightItem.insertAdjacentHTML("beforeend", addIconMarkup);
  try {
    const res = await axios({
      method: "GET",
      url: "api/v1/coupons",
    });

    const coupons = res.data.data.coupons;
    coupons.forEach((coupon) => {
      const html = generateCouponMarkup(coupon);
      itemsContainer.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    Swal.fire("Something went wrong");
  }
};

// showing notification with notification api
const showNotification = function (contentObj) {
  // getting data

  const { notificationContent, notificationSubject } = contentObj;
  // displaying notification
  new Notification(notificationSubject, {
    body: notificationContent,
    icon: "/img/Expora.png",
  });
};

// sending notification
export const sendNotification = function (e) {
  const form = document.querySelector(".notification-form");
  // prettier-ignore
  const notificationContent = document.querySelector('.notification-text').value;
  // prettier-ignore
  const notificationSubject = document.querySelector('.input-notification-subject').value;

  if (!form.checkValidity()) return;

  e.preventDefault();

  // sending notification content through ws

  if (ws.readyState === WebSocket.OPEN) {
    const data = { notificationContent, notificationSubject };

    ws.send(JSON.stringify(data));
  }
};
