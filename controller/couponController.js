const Coupon = require("../model/couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Tour = require("../model/tourModel");
const tourModel = require("../model/tourModel");

// adding a coupon
exports.addCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.create(req.body);

  res.status(200).json({
    status: "Success",
    message: "Coupon added",
    data: { coupon },
  });
});

// gettting a specific coupon
exports.getCoupon = catchAsync(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) throw new AppError("Can't find coupon", 404);

  res.status(200).json({
    status: "Success",
    data: { coupon },
  });
});

// deleting coupon
exports.deleteCoupon = catchAsync(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);

  if (!coupon) throw new AppError("Can't find coupon", 404);

  res.status(204).json({
    status: "Success",
    message: "Coupon deleted",
  });
});

// getting all coupons
exports.getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.find();

  res.status(200).json({
    status: "Success",
    data: { coupons },
  });
});

// edit coupon
exports.editCoupon = catchAsync(async (req, res) => {
  const { couponId } = req.params;
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!updatedCoupon) throw new AppError("Can't find coupon", 404);

  res.status(200).json({
    status: "Success",
    data: { updatedCoupon },
    message: "Updated successfully",
  });
});

// get discounted price
exports.getDiscountedPrice = catchAsync(async (req, res) => {
  const { couponCode, tourId } = req.body;

  // getting corresponding tour according to the tourId
  const tour = await tourModel.findById(tourId).select("price");
  if (!tour) throw new AppError("Can't find a tour");

  // getting corresponding coupon according to coupon code
  const coupon = await Coupon.findOne({ couponCode, isValid: true });
  if (!coupon) throw new AppError("Please enter a valid coupon", 404, coupon);

  // making coupon invalid
  await Coupon.findOneAndUpdate(
    { couponCode },
    { $set: { isValid: false } },
    { new: true, runValidators: true }
  );

  // calculating percentage
  const { discountPercentage } = coupon;

  const discountedValue = (tour.price * discountPercentage) / 100;
  const finalPrice = Math.round(tour.price - discountedValue);

  // adding final price to tour
  await Tour.findByIdAndUpdate(
    tourId,
    { $set: { finalPrice } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    message: "Coupon applied succesfully",
    data: { finalPrice },
  });
});
