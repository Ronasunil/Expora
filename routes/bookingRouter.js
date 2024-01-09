const express = require("express");

const bookingController = require("./../controller/bookingController");
const authController = require("./../controller/authController");

const router = express.Router();

router
  .route("/checkout/:tourId")
  .post(authController.protect, bookingController.checkOut);

// getting all bookings admin only
router.route("/").get(authController.protect, bookingController.getAllBookings);

// aggregtion stats and sales report
router.route("/stats/:dateCriteria").get(bookingController.getStats);
router.route("/sales-revenue").post(bookingController.getSalesReport);

// route for getting bookings by user and deleting tour
router
  .route("/:userId") //so userId in get user booking and deleteBooking userId will be converted to BookingId
  .get(authController.protect, bookingController.getUserBookings)
  .delete(authController.protect, bookingController.deleteBooking);

// route for getting a certain booking

// route for getting bookings by tour
router
  .route("/tour/:tourId")
  .get(
    authController.protect,
    authController.restrictAccessTo("admin"),
    bookingController.getBookingByTourId
  );

// route for updating booking admin only
router
  .route("/:bookingId")
  .patch(
    authController.protect,
    authController.restrictAccessTo("admin"),
    bookingController.updateBookings
  );

//route for downloading invoice
router.route("/:bookingId/invoice").get(bookingController.downloadInvoice);

module.exports = router;
