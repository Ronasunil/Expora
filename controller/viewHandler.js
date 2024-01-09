const crypto = require("crypto");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Tour = require("./../model/tourModel");
const User = require("./../model/userModel");
const Booking = require("./../model/bookingModel");

exports.getHome = catchAsync(async (req, res) => {
  const tours = await Tour.find().limit(3);
  res.status(200).render("home", { tours: tours, title: "Home" });
});

exports.getLogin = (req, res) => {
  res.status(200).render("login", { title: "Login" });
};

exports.getSignup = (req, res) => {
  res.status(200).render("signup", { title: "Signup" });
};
exports.showAllTours = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("tours", { tours: tours, title: "Tours" });
});

exports.getOverview = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const { _id: userId } = req.user;

  // getting the tour need to render
  const tour = await Tour.findOne({ slug: slug })
    .populate({
      path: "bookings",
      select: "_id tour user status",
    })
    .populate({ path: "reviews", select: "_id user tour review rating" });

  if (!tour) throw new AppError("Can't find tour", 404);

  // getting userIds from booking
  const userIds = tour.bookings.map((booking) => booking.user.toString());

  //getting current tour booking id
  const booking = tour.bookings.find((booking) => booking.user.equals(userId));
  console.log(userIds, booking);
  res.status(200).render("overview", {
    tour: tour,
    title: "Overview",
    userIds,
    booking,
  });
});

exports.getOtpVerify = (req, res) => {
  res.status(200).render("otp", { title: "OTP" });
};

exports.getProfile = (req, res) => {
  const { user } = req;

  res.status(200).render("profile", { user, title: "Profile" });
};

exports.renderAddMemories = (req, res) => {
  res.render("memories");
};

exports.renderDetailMemories = (req, res) => {
  const { memoryId } = req.params;
  const { memories } = req.user;

  const selectedMemories = memories.find(
    (memory) => memory._id.toString() === memoryId
  );

  res.render("memoryDetail", { memories: selectedMemories });
};

exports.renderForgetPassword = (req, res) => {
  res.render("forget-password");
};

exports.renderResetPassword = catchAsync(async (req, res) => {
  const { resetToken } = req.params;
  // check  url is valid
  // hashing the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // check there is user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpiresin: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid url", 404);

  res.render("resetPassword", { token: resetToken });
});

exports.renderBookingDetailPage = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId)
    .populate({ path: "user", select: "name" })
    .populate({ path: "tour", select: "tourName price" });

  res.render("booking-detail", { booking });
});

exports.renderCheckout = catchAsync(async (req, res) => {
  const { tourSlug } = req.params;
  const { bookingDate } = req.query;
  console.log(bookingDate);
  const tour = await Tour.findOne({ slug: tourSlug });
  res.render("checkout", { tour, bookingDate });
});

exports.renderCreateCoupon = (req, res) => {
  res.render("create-coupon");
};
