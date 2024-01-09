const express = require("express");

const tourController = require("./../controller/tourController");
const authController = require("./../controller/authController");

// router
const reviewRouter = require("../routes/reviewRouter");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

// getting all tour and creating new tour route
router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictAccessTo("admin"),
    tourController.multerUpload.fields([
      { name: "tourImgs", maxCount: 3 },
      { name: "coverImg", maxCount: 1 },
    ]),
    tourController.resizeAndUploadTourImages,
    tourController.createTour
  );

// getting  deleting and updating tour by id  route
router
  .route("/:id")
  .get(authController.protect, tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictAccessTo("admin"),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    authController.restrictAccessTo("admin"),
    tourController.updateTour
  );

// getting updating tour by slug route
router
  .route("/slug/:slug")
  .get(authController.protect, tourController.getTourBySlug)
  .patch(
    authController.protect,
    authController.restrictAccessTo("admin"),
    tourController.multerUpload.fields([
      { name: "tourImgs", maxCount: 3 },
      { name: "coverImg", maxCount: 1 },
    ]),
    tourController.resizeAndUploadTourImages,
    tourController.updateTour
  );

//getting all tour names route
router
  .route("/tournames")
  .get(authController.protect, tourController.getTourNames);

// route for avialable bookings of a tour
router
  .route("/:tourId/avialable-bookings")
  .get(authController.protect, tourController.getAvilableBookings);

module.exports = router;
