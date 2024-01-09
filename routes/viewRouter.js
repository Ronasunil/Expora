const express = require("express");

const viewHandler = require("./../controller/viewHandler");
const authController = require("./../controller/authController");
const bookingController = require("./../controller/bookingController");

const router = express.Router();

router
  .route("/")
  .get(
    authController.isLoggedIn,
    bookingController.addBooking,
    viewHandler.getHome
  );
router.route("/login").get(viewHandler.getLogin);
router.route("/signup").get(viewHandler.getSignup);
router.route("/tours").get(authController.protect, viewHandler.showAllTours);

router
  .route("/tour/:slug")
  .get(
    authController.protect,
    authController.isLoggedIn,
    viewHandler.getOverview
  );

router.route("/otp-verification").get(viewHandler.getOtpVerify);

router
  .route("/profile")
  .get(
    authController.protect,
    authController.isLoggedIn,
    viewHandler.getProfile
  );

router
  .route("/create-memory")
  .get(authController.protect, viewHandler.renderAddMemories);

router
  .route("/memories/:memoryId")
  .get(authController.protect, viewHandler.renderDetailMemories);

router.route("/forget-password").get(viewHandler.renderForgetPassword);

router
  .route("/reset-password/:resetToken")
  .get(viewHandler.renderResetPassword);
module.exports = router;

router
  .route("/booking-info/:bookingId")
  .get(viewHandler.renderBookingDetailPage);

router.route("/checkout/:tourSlug").get(viewHandler.renderCheckout);

router.route("/create-coupon").get(viewHandler.renderCreateCoupon);
