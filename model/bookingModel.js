const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "booking must have a user"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "booking must have a tour"],
    },

    // booking created date
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    // user booked tour date
    tourBookingDate: {
      type: Date,
      required: [true, "Tour needs a booking date"],
    },

    price: {
      type: Number,
      required: [true, "booking must have price"],
    },

    paid: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      required: [true, "Booking must have a status"],
      default: "pending",
      lowercase: true,
    },

    peopleCount: {
      type: Number,
      required: [true, "Booking must need people count"],
      max: [10, "Maximum people can be included in the tour is 10"],
      min: [1, "Atleast one membet needed to book tour"],
    },

    discountPrice: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const filterObj = function (obj, ...values) {
  const filteredObj = {};
  const keys = Object.keys(obj);

  keys.forEach((key) => {
    if (!values.includes(key)) filteredObj[key] = obj[key];
  });
  return filteredObj;
};

// bookingSchema.pre(/^find/, function (next) {
//   this.populate("user").populate("tour");
//   next();
// });

bookingSchema.statics.updateBooking = async function (obj, bookingId) {
  const filteredObj = filterObj(
    obj,
    "price",
    "tour",
    "user",
    "createdAt",
    "bookingCode"
  );

  const updatedBooking = await this.findByIdAndUpdate(bookingId, filteredObj, {
    new: true,
    runValidators: true,
  });

  if (!updatedBooking) throw new AppError("Provide a valid user");

  return updatedBooking;
};

const bookingModel = mongoose.model("Bookings", bookingSchema);

module.exports = bookingModel;
