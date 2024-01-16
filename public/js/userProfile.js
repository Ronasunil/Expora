import axios from "axios";
import Swal from "sweetalert2";
import { routeChanger } from "./routeChanger";
import catchAsync from "../../utils/catchAsync";

const itemsContainer = document.querySelector(".dash-board-commodity");
const dashboardHeading = document.querySelector(".dashboard-heading");
const dashboardActions = document.querySelector(".dash-board-actions");

const getCurrentUser = async function () {
  const data = await axios({
    method: "GET",
    url: "/api/v1/users/account",
  });
  return data.data.data.user;
};

// markup rendering in profile page
const renderMarkup = function (markup, sectionName) {
  dashboardHeading.textContent = sectionName;
  itemsContainer.innerHTML = "";
  itemsContainer.insertAdjacentHTML("beforeend", markup);
};

// creating Tour markup
const generateTourMarkup = function (data, bookingId = null) {
  const invoiceBtn =
    bookingId !== null
      ? `<a href=/api/v1/bookings/${bookingId}/invoice class="invoice-btn" id="light-blue">Invoice</a>`
      : "";
  return ` <div class="item" data-slug="${data.slug}">
                  <div class="contents">
                      <img class="item-img" src=${data.coverImg}>
                      <p class="item-name">${data.tourName}</p>
                      <div class="booking-btns">
                        <a class="more-btn" id="light-green" href="/tour/${data.slug}">More</a> 
                        ${invoiceBtn}
                      </div>   
                  </div>
           </div>`;
};

// creating wallet markup
const generateWalletMarkup = function (booking) {
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
  console.log(booking);
  return `<div class="tour">
            <img class="booking-tour-img" src=${booking.tour.coverImg} alt="Tour image" />
            <p class="booking-tour-date">${bookingMonth}</p>
            <p class="booking-tour-price">${booking.tour.price}</p>
            <a class="more-btn" id="light-green" href="/tour/${booking.tour.slug}">Info</a> 
          </div>`;
};

const renderWalletBar = function () {
  const markup = `<div class="booking-heading">
                    <p class="boooking-tour-name">Tour </p>
                    <p class="boooking-Date">Date </p>
                    <p class="booking-user-name">Customer </p>
                    <p class="booking-price">Price</p>
                  </div>`;
  itemsContainer.insertAdjacentHTML("beforeend", markup);
};

// creating memories markup
const generateMemoriesMarkup = function (data) {
  const date = new Date(data.date).toLocaleDateString();
  return ` <div class="item" data-slug="${data._id}">
                  <div class="contents">
                      <img class="item-img" src=${data.photo}>
                      <p class="item-name">${date}</p>
                      <a class="btn" id="light-green" href="/memories/${data.id}">More</a></div>  
                  </div>
                
           </div>`;
};

{
  /* <div class="btns">
<button class="edit-btn green admin-tour-edit-btn">verify</button>
<button class="edit-btn red admin-tour-delete-btn">reject</button>
</div>  */
}

// rendering items
const renderTour = function (bookings) {
  bookings.forEach((booking) => {
    const html = generateTourMarkup(booking.tour, booking._id);
    itemsContainer.insertAdjacentHTML("beforeend", html);
  });
};

// rendering bookings page
export const renderBookings = async function () {
  itemsContainer.innerHTML = "";
  dashboardActions.innerHTML = "";
  dashboardHeading.textContent = "bookings";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  try {
    let response = await axios({
      method: "GET",
      url: "api/v1/users/account",
    });

    const userId = response.data.data.user._id;
    response = await axios({
      method: "GET",
      url: `api/v1/bookings/${userId}`,
    });

    const { bookings } = response.data.data;

    renderTour(bookings);
  } catch (err) {
    console.log(err);
  }
};

// rendering wallet page
export const renderWallet = async function () {
  itemsContainer.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("grouped-booking");
  dashboardHeading.textContent = "wallet";

  // get wallet of user
  const res = await axios({
    method: "GET",
    url: "/api/v1/users/wallet",
  });

  const { userWallet } = res.data.data;
  console.log(res.data.data);
  // render the top bar heading
  renderWalletBar();

  // render the items in wallet
  userWallet[0].forEach((tour) => {
    const Walletmarkup = generateWalletMarkup(tour);
    itemsContainer.insertAdjacentHTML("beforeend", Walletmarkup);
  });

  const total = userWallet[0].reduce(
    (acc, booking) => Math.round(acc + booking.price),
    0
  );

  console.log(total);

  dashboardActions.innerHTML = `<h3>Total:${total}</h3>`;
};

// rendering feedback page
export const renderFeedbackInputs = function () {
  dashboardActions.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity-feedback");
  const feedbackMarkup = `<div class="feedback">
                            <form class="feedback-form">
                              <input class="input-subject" type="text" placeholder="subject" required minlength=4 pattern="[a-zA-Z]*"/>
                              <textarea class="message-area" placeholder="Describe yourself issue or anything" required minlength=20 pattern="[a-zA-Z]*"></textarea>
                              <button class="btn center feedback-submit-btn">submit</button>
                            </form>
                          </div>`;

  renderMarkup(feedbackMarkup, "Feedback");
};

// rendering security page
export const renderSecurityInputs = function () {
  dashboardActions.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  dashboardHeading.textContent = "Security";
  const securityMarkup = `<form class="security"> 
                              <div class="column"> 
                                <input class="password current-password" type="text" placeholder="Current password" required minlength=8 pattern='(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'  title='password must contain 8 character with atleast 1 lowercase character and 1 uppercase character' />
                                <label class="message label-current-password-err"></label>
                              </div>
                              <div class="column">  
                                <input class="password new-password" type="text" placeholder="New password" required minlength=8 pattern='(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'  title='password must contain 8 character with atleast 1 lowercase character and 1 uppercase character' />
                                <label class="message label-new-password-err"></label>
                              </div>  
                                <div class="column">
                                  <input class="password confirm-new-password" type="text" placeholder="Confirm new password" required minlength=8 pattern='(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'  title='Password must be same as new password'/>
                                  <label class="message label-confirm-password-err"></label>
                                </div>  
                                <button class="btn reset-btn">Submit</button>
                                <p class="forget-text">forget password?</p>
                          </form>`;

  renderMarkup(securityMarkup, "Security");
};

// widow for cancellation tour
export const renderCancellationWindow = function (fn, bookingId) {
  const cancellationMarkup = `
  <form class="cancellationForm">
      <div style="margin-bottom:10px" class="reason">
          <label>
              <input type="radio" name="cancellationReason" value="not_satisfied">
              Not Satisfied
          </label>
      </div>

      <div style="margin-bottom:10px" class="reason">
          <label>
              <input type="radio" name="cancellationReason" value="change_of_plans">
              Change of Plans
          </label>
      </div>

      <div style="margin-bottom:10px" class="reason">
          <label>
              <input type="radio" name="cancellationReason" value="other">
              Other
          </label>
      </div>

      <div style="margin-bottom:10px" class="reason">
          <label>
              <input type="radio" name="cancellationReason" value="family_emergency">
              Family Emergency
              
          </label>
      </div>

      <div style="margin-bottom:10px" class="reason">
          <label>
              <input type="radio" name="cancellationReason" value="weather_conditions">
              Weather Conditions
             
          </label>
      </div>

      <div style="margin-bottom:10px" class="reason">
          <label>
              <input type="radio" name="cancellationReason" value="displeasure_with_itinerary">
              Displeasure with Itinerary
             
          </label>
      </div>
  </form>
`;
  Swal.fire({
    title: "Reason for Cancellation",
    html: cancellationMarkup,
    preConfirm: () => {
      const form = document.querySelector(".cancellationForm");
      const selectedReason = form.querySelector(
        'input[name="cancellationReason"]:checked'
      );

      if (!selectedReason)
        return Swal.showValidationMessage("Please select any of those");

      fn(bookingId);
    },
  });
};

// rendering memories page
export const renderMemories = async function () {
  // memories page setup
  dashboardActions.innerHTML = "";
  itemsContainer.innerHTML = "";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  dashboardHeading.textContent = "Memories";
  const addIcon =
    '<a href="/create-memory"><i class="fa fa-plus add-icon"></i></a>';
  dashboardActions.insertAdjacentHTML("beforeend", addIcon);

  // rendering memories
  try {
    const data = await axios({
      method: "GET",
      url: "/api/v1/users/memories",
    });
    const memories = data.data.data.memories;

    memories.forEach((memory) => {
      const html = generateMemoriesMarkup(memory);
      itemsContainer.insertAdjacentHTML("beforeend", html);
    });
  } catch (err) {
    console.log(err);
  }
};

export const renderBookmarks = catchAsync(async function () {
  itemsContainer.innerHTML = "";
  dashboardHeading.textContent = "Bookmarks";
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  dashboardActions.innerHTML = "";
  const user = await getCurrentUser();
  try {
    const data = await axios({
      method: "GET",
      url: `/api/v1/users/bookmark/${user._id}`,
    });

    const bookmarks = data.data.data.bookmarks.bookmarks;
    bookmarks.forEach((tour) => {
      const markup = generateTourMarkup(tour);
      itemsContainer.insertAdjacentHTML("beforeend", markup);
    });
  } catch (err) {
    console.log(err);
  }
});

// send feedback
export const sendFeedback = async function (e) {
  const inputSubject = document.querySelector(".input-subject").value;
  const inputMessage = document.querySelector(".message-area").value;
  const form = document.querySelector(".feedback-form");

  if (!form.checkValidity()) return e.preventDefault();

  e.preventDefault();

  try {
    const data = await axios({
      url: "api/v1/users/submit-feedback",
      method: "POST",
      data: {
        subject: inputSubject,
        message: inputMessage,
      },
    });

    // const message
    const message = data.data.message;
    Swal.fire(message);
    routeChanger("/profile");
  } catch (err) {
    console.log(err);
    const message = err.data.data.message;
    Swal.fire(message);
  }
};

// reset password
export const resetPassword = async function (e) {
  const form = document.querySelector(".security");
  // inputs
  const password = document.querySelector(".current-password").value;
  const newPassword = document.querySelector(".new-password").value;
  const confirmPassword = document.querySelector(".confirm-new-password").value;

  // error labels
  const newPasswordErrLabel = document.querySelector(".label-new-password-err");
  const currentPasswordErrLabel = document.querySelector(
    ".label-current-password-err"
  );
  const confirmErrPasswordLabel = document.querySelector(
    ".label-confirm-password-err"
  );

  if (newPassword !== confirmPassword) {
    e.preventDefault();
    return (confirmErrPasswordLabel.textContent =
      "New password and confrim password are not same");
  }

  if (!form.checkValidity()) return;
  e.preventDefault();
  try {
    const data = await axios({
      method: "PATCH",
      url: "api/v1/users/password",
      data: {
        password,
        newPassword,
        confirmPassword,
      },
    });
    const { message } = data.data;
    newPasswordErrLabel.textContent =
      currentPasswordErrLabel.textContent =
      confirmErrPasswordLabel.textContent =
        "";
    Swal.fire(message);
  } catch (err) {
    const message = err.response.data.message;
    currentPasswordErrLabel.textContent = message;
  }
};
