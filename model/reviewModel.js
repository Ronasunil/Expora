const mongoose = require("mongoose");
const Tour = require("./tourModel");
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Reviews must have a user"],
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must have a tour"],
    },

    review: {
      type: String,
      required: [true, "Review cannot be empty"],
      minlength: [20, "Review atleast need 20 characters"],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },

    {
      $project: {
        _id: 0,
      },
    },
  ]);

  await Tour.findByIdAndUpdate(
    tourId,
    {
      rating: stats[0].avgRating,
      numRatings: stats[0].numRatings,
    },
    { new: true, runValidators: true }
  );
};

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name profileImg" });
  next();
});

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
