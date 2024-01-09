const express = require("express");

const adminController = require("./../controller/adminController");
const authController = require("./../controller/authController");
const tourController = require("./../controller/tourController");

const router = express.Router();

router
  .route("/user/:slug")
  .patch(
    authController.protect,
    authController.restrictAccessTo("admin"),
    adminController.updateUser
  );

// router
//   .route("/tours/:slug")
//   .patch(
//     authController.protect,
//     authController.restrictAccessTo("admin"),
//     tourController.updateTour
//   );
module.exports = router;
