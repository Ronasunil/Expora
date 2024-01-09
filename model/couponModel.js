const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    min: 4,
    max: 6,
    required: [true, "Coupon must have code"],
    unique: [true, "Coupon already exist"],
    trim: true,
  },

  isValid: {
    type: Boolean,
    default: true,
    required: [true, "Coupon must be valid or not"],
  },

  discountPercentage: {
    type: Number,
    required: [true, "Coupon must have a discount rate"],
    min: 1,
    max: 50,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
