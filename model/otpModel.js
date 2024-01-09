const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: [validator.isEmail, "Please provide a valid email"],
    required: true,
  },

  otp: {
    type: String,
    required: true,
    maxLength: [4, "Please provide a valid otp"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    index: { expires: "5m" },
  },
});

// otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 * 60 });

otpSchema.pre("save", function (next) {
  this.otp = crypto.createHash("sha256").update(this.otp).digest("hex");
  next();
});

const otpModel = mongoose.model("Otp", otpSchema);

module.exports = otpModel;
