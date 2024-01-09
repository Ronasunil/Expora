const express = require("express");

const couponController = require("../controller/couponController");

const router = express.Router();

// getting all coupons route for get and post for adding coupon for post route
router
  .route("/")
  .get(couponController.getAllCoupons)
  .post(couponController.addCoupon);

// getting a specific coupon for get route, deleting a a specific coupon for delete route
router
  .route("/:couponId")
  .get(couponController.getCoupon)
  .delete(couponController.deleteCoupon)
  .patch(couponController.editCoupon);

// getting discounted price route
router.route("/discount").post(couponController.getDiscountedPrice);

module.exports = router;
