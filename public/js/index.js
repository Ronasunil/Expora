import { showMenu, requestPermission } from "./home";
import { validateFormAndSendData } from "./signup";
import { verifyOtp, resendOtp } from "./otp";
import { loginUser } from "./login";
import {
  searchTours,
  categorizeTour,
  renderTopTours,
  renderAllTours,
} from "./tours";

import {
  showUsers,
  adminAction,
  showTours,
  editTour,
  editPopup,
  createTour,
  showAllBookings,
  updateBooking,
  renderAnalytics,
  renderDatePicker,
  downloadSalesReport,
  renderCoupons,
  renderCouponEditPopup,
  renderGroupedBookings,
  renderNotificationMenu,
  sendNotification,
} from "./profile";

import {
  bookmark,
  renderBookmarkStatus,
  updateStarRating,
  submitReview,
  slideToLeft,
  slideToRight,
  displayChekout,
  renderBookingDates,
} from "./detail";

import { bookTour, cancelBooking } from "./stripe";

import { applyCoupon, checkout } from "./checkout";

import {
  renderBookings,
  renderFeedbackInputs,
  renderSecurityInputs,
  renderMemories,
  sendFeedback,
  resetPassword,
  renderBookmarks,
  renderCancellationWindow,
} from "./userProfile";

import { renderAllMarkers } from "./map";

import { renderMap, addMemories } from "./memories";

import { sendRestPasswordLink } from "./forgetPassword";

import { updatePassword } from "./resetPassword";

import { addCoupon, editCoupon, deleteCoupon } from "./coupon";

import { routeChanger } from "./routeChanger";

import {
  previewImage,
  renderProfile,
  updateProfileDetails,
} from "./renderProfile";

let editFormvalid;

const signupBtn = document.querySelector(".signup-btn");
const otpBtn = document.querySelector(".btn-otp");
const loginForm = document.querySelector(".login-form");
const toursSearchBtn = document.querySelector(".search-bar");
const categoreyOptions = document.querySelector(".options");
const topToursBtn = document.querySelector(".top-tours ");
const allToursBtn = document.querySelector(".all-tours");
const resendOtpLink = document.querySelector(".resend-otp");
const addTourBtn = document.querySelector(".fa-plus");
const purchaseBtn = document.querySelector(".purchase-btn");
const couponBtn = document.querySelector(".coupon-apply");
const checkoutBtn = document.querySelector(".checkout-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const userBookingsBtn = document.querySelector(".bookings-btn");
const adminBookingsBtn = document.querySelector(".admin-bookings-btn");
const bookmarkBtn = document.querySelector(".bookmark-icon");
const feedbackBtn = document.querySelector(".feedback-btn");
const securityBtn = document.querySelector(".security-btn");
const memoriesSubmitBtn = document.querySelector(".memories-submit-btn");
const memoriesBtn = document.querySelector(".memories-btn");
const resetPasswordSubmitBtn = document.querySelector(".reset-password-btn");
const forgetPasswordLabel = document.querySelector(".label-forget-password");
const recoveryBtn = document.querySelector(".recovery-btn");
const allBookmarkBtn = document.querySelector(".bookmark-user-btn");
const reviewStars = document.querySelector(".stars");
const reviewsSubmitBtn = document.querySelector(".review-feedback-btn");
const slideLeft = document.querySelector(".slide-left");
const slideRight = document.querySelector(".slide-right");
const analyticsBtn = document.querySelector(".analytics-btn");
const menuBtn = document.querySelector(".btn-mobile-nav");
const couponsBtn = document.querySelector(".coupon-btn");
const addCouponsBtn = document.querySelector(".add-coupon-btn");
const notificationBtn = document.querySelector(".notification-btn");
const profileBtn = document.querySelector(".user-profile-btn");
const moreToursLink = document.querySelector(".more-tours");

// map container
const mapContainer = document.getElementById("map");

// container
const itemsContainer = document.querySelector(".dash-board-items");

// admin panel btns
const usersBtn = document.querySelector(".users-btn");
const toursBtn = document.querySelector(".tours-btn");

// menu btn in home page
menuBtn?.addEventListener("click", showMenu);

signupBtn?.addEventListener("click", validateFormAndSendData);
otpBtn?.addEventListener("click", verifyOtp);

loginForm?.addEventListener("submit", loginUser);

toursSearchBtn?.addEventListener("keyup", searchTours);

categoreyOptions?.addEventListener("change", categorizeTour);

topToursBtn?.addEventListener("click", renderTopTours);

allToursBtn?.addEventListener("click", renderAllTours);

moreToursLink?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  location.assign("/tours");
});

resendOtpLink?.addEventListener("click", resendOtp);

usersBtn?.addEventListener("click", showUsers);

toursBtn?.addEventListener("click", showTours);

purchaseBtn?.addEventListener("click", renderBookingDates);

couponBtn?.addEventListener("click", applyCoupon);

checkoutBtn?.addEventListener("click", checkout(bookTour));

cancelBtn?.addEventListener("click", function () {
  const { bookingId } = this.dataset;
  renderCancellationWindow(cancelBooking, bookingId);
});

userBookingsBtn?.addEventListener("click", renderBookings);

adminBookingsBtn?.addEventListener("click", showAllBookings);

bookmarkBtn?.addEventListener("click", bookmark);

allBookmarkBtn?.addEventListener("click", renderBookmarks);

notificationBtn?.addEventListener("click", renderNotificationMenu);

profileBtn?.addEventListener("click", renderProfile);

// DOM TRAVERSING
itemsContainer?.addEventListener("click", async function (e) {
  if (e.target.classList.contains("admin-user-delete-btn")) {
    const slug = e.target.closest(".item").dataset.slug;
    adminAction(slug, { isDeleted: true }, "User is deleted");
  }

  // Dom traversing for unblock-btn user (Admin only)
  if (e.target.classList.contains("admin-user-unblock-btn")) {
    const slug = e.target.closest(".item").dataset.slug;
    adminAction(slug, { isBlocked: false }, "User is unblocked");
  }

  // Dom traversing for block-btn user (Admin only)
  if (e.target.classList.contains("admin-user-block-btn")) {
    const slug = e.target.closest(".item").dataset.slug;
    adminAction(slug, { isBlocked: true }, "User is blocked");
  }

  // Dom traversing for edit popup user (Admin only)
  if (e.target.classList.contains("admin-tour-edit-btn")) {
    const slug = e.target.closest(".item").dataset.slug;
    editFormvalid = await editPopup(slug);
  }

  // Dom traversing for tour verifying or proccesing btn (Admin only)
  if (e.target.classList.contains("admin-tour-verify-btn")) {
    // bookingCode for identifying tour from db
    const bookingId = e.target.closest(".item").dataset.slug;

    // updating status in booking
    updateBooking(bookingId, "confirmed", "Booking verified");
  }

  // Dom traversing for booked tour rejecting btn (Admin only)
  if (e.target.classList.contains("admin-tour-reject-btn")) {
    // bookingCode for identifying tour from db
    const bookingUUID = e.target.closest(".item").dataset.slug;

    // updating status in booking
    updateBooking(bookingUUID, "cancelled", "Booking rejected");
  }

  //Dom traversing for download btn
  if (e.target.classList.contains("download-btn")) {
    renderDatePicker(function (obj) {
      if (!obj) return;
      downloadSalesReport(obj);
    });
  }

  // Dom traversing for edit btn of coupon
  if (e.target.classList.contains("admin-coupon-edit-btn")) {
    renderCouponEditPopup(e, editCoupon);
  }

  // Dom traversing for delete btn of coupon
  if (e.target.classList.contains("admin-coupon-delete-btn")) {
    const { couponId } = e.target.dataset;
    deleteCoupon(couponId);
  }

  // Dom traversing for select button for group tour
  if (e.target.classList.contains("booking-select")) {
    const selectEl = e.target;
    const bookingId = selectEl.value;
    renderGroupedBookings(bookingId);
  }

  // Dom traversing for send notification button
  if (e.target.classList.contains("notification-btn")) {
    sendNotification(e);
  }

  // Dom traversing for profile editing
  if (e.target.classList.contains("profile-img")) {
    previewImage();
  }

  // Dom traversing for updating profile or save btn

  if (e.target.classList.contains("profile-form-btn")) {
    updateProfileDetails(e);
  }
});

// edit tour submit button
document.addEventListener("click", function (e) {
  if (!editFormvalid?.value) return;
  if (e.target.classList.contains("swal2-confirm")) {
    const inputTourName = document.querySelector(".input-tour-name");
    const inputCatagorey = document.querySelector(".input-catagorey");
    const inputDifficulty = document.querySelector(".input-difficulty");
    const inputMaxPeople = document.querySelector(".input-max-people");
    const inputLocation = document.querySelector(".input-location");
    const inputDuration = document.querySelector(".input-duration");
    const inputPrice = document.querySelector(".input-price");
    const inputDescription = document.querySelector(".input-description");
    const inputFeatures = document.querySelector(".input-features");
    const inputStops = document.querySelector(".input-stop");
    const coverImg = document.getElementById("input-cover-image");
    const tourImg_1 = document.querySelector(".input-cover-img-1");
    const tourImg_2 = document.querySelector(".input-cover-img-2");
    const tourImg_3 = document.querySelector(".input-cover-img-3");

    const inputFields = {
      inputTourName,
      inputDifficulty,
      inputCatagorey,
      inputMaxPeople,
      inputPrice,
      inputDescription,
      inputLocation,
      inputDuration,
      inputFeatures,
      inputStops,
      tourImg_1,
      tourImg_2,
      tourImg_3,
      coverImg,
    };
    const slug = document.querySelector(".update-form").dataset.slug;

    if (!slug) return createTour(inputFields);
    editTour(slug, inputFields);
  }
});

addTourBtn?.addEventListener("click", async () => {
  editFormvalid = await editPopup();
});

// swal2 - styled;

// edit tour submit button
document.addEventListener("click", function (e) {
  // Dom traversing for send feedback btn
  const feedbackSubmitBtn = e.target.classList.contains("feedback-submit-btn");
  if (feedbackSubmitBtn) sendFeedback(e);

  // Dom traversing for send reset password btn
  const resetPasswordBtn = e.target.classList.contains("reset-btn");
  if (resetPasswordBtn) resetPassword(e);

  // forget password in user profile
  const forgetLabel = e.target.classList.contains("forget-text");

  if (forgetLabel) routeChanger("/forget-password");

  if (e.target.classList.contains("bookingBtn")) {
    displayChekout(e);
  }

  if (!editFormvalid?.value) return;
  if (e.target.classList.contains("swal2-confirm")) {
    const inputTourName = document.querySelector(".input-tour-name");
    const inputCatagorey = document.querySelector(".input-catagorey");
    const inputDifficulty = document.querySelector(".input-difficulty");
    const inputMaxPeople = document.querySelector(".input-max-people");
    const inputLocation = document.querySelector(".input-location");
    const inputDuration = document.querySelector(".input-duration");
    const inputPrice = document.querySelector(".input-price");
    const inputDescription = document.querySelector(".input-description");
    const inputFeatures = document.querySelector(".input-features");
    const inputStops = document.querySelector(".input-stop");
    const coverImg = document.getElementById("input-cover-image");
    const tourImg_1 = document.querySelector(".input-cover-img-1");
    const tourImg_2 = document.querySelector(".input-cover-img-2");
    const tourImg_3 = document.querySelector(".input-cover-img-3");

    const inputFields = {
      inputTourName,
      inputDifficulty,
      inputCatagorey,
      inputMaxPeople,
      inputPrice,
      inputDescription,
      inputLocation,
      inputDuration,
      inputFeatures,
      inputStops,
      tourImg_1,
      tourImg_2,
      tourImg_3,
      coverImg,
    };
    const slug = document.querySelector(".update-form").dataset.slug;

    if (!slug) return createTour(inputFields);
    editTour(slug, inputFields);
  }
});

// feedback button
feedbackBtn?.addEventListener("click", renderFeedbackInputs);

// security button
securityBtn?.addEventListener("click", renderSecurityInputs);

// memories btn
memoriesBtn?.addEventListener("click", renderMemories);

// memories submit btn
memoriesSubmitBtn?.addEventListener("click", addMemories);

// reset password submit btn
resetPasswordSubmitBtn?.addEventListener("click", updatePassword);

// forgetPassword link like label action
forgetPasswordLabel?.addEventListener("click", () =>
  routeChanger("/forget-password")
);

// recovery btn for forget password gmail
recoveryBtn?.addEventListener("click", sendRestPasswordLink);

window.addEventListener("load", () => {
  const memoriesContainer = document.body.classList.contains("memories-body");
  const detailPageContainer = document.body.classList.contains("details-body");
  const homePageContainer = document.body.classList.contains("home");
  const slides = document.querySelector(".slider-container")?.childNodes;
  // rendering map when the memories page loaded
  if (memoriesContainer) renderMap();

  // rendering map with markers when the tour detail page loaded
  if (detailPageContainer) {
    const coordinates = JSON.parse(mapContainer.dataset.locations);
    renderAllMarkers(coordinates);
    renderBookmarkStatus();

    slides?.forEach((el, i) => {
      el.style.transform = `translate(${100 * i}%, -50%)`;
    });
  }
  // asking for permission when home page is loaded
  if (homePageContainer) requestPermission();
});

//making review Star dynamic
reviewStars?.addEventListener("click", updateStarRating);

// review submit btn
reviewsSubmitBtn?.addEventListener("click", submitReview);

// slider right btn
slideRight?.addEventListener("click", slideToRight);

// slider left btn
slideLeft?.addEventListener("click", slideToLeft);

// analytics btn
analyticsBtn?.addEventListener("click", renderAnalytics);

// admin dashboard coupons btn
couponsBtn?.addEventListener("click", renderCoupons);

// adding new coupon btn
addCouponsBtn?.addEventListener("click", addCoupon);
