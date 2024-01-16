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

  expiryDate: {
    type: Date,
    required: [true, "Coupon must have a expiry date"],
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);
couponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

module.exports = Coupon;
