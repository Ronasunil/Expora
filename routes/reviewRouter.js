const express = require("express");

const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, reviewController.getReviews)
  .post(
    authController.protect,
    authController.restrictAccessTo("user"),
    reviewController.createReview
  );

module.exports = router;
