const reviewModel = require("../model/reviewModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// get all reviews
exports.getReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params) filter = { tour: req.params.tourId };
  const reviews = await reviewModel.find(filter);

  res.status(200).json({
    status: "Success",
    totalReviews: reviews.length,
    data: { reviews },
  });
});

// get specific review of tour
exports.getTourReview = catchAsync(async (req, res) => {
  const { tourId } = req.params;

  const tourReviews = await reviewModel.find({ tour: tourId });

  if (!tourReviews) throw new AppError("No review found ", 404);

  res.status(200).json({
    status: "Success",
    totalReviews: tourReviews.length,
    data: { tourReviews },
  });
});

// create a review
exports.createReview = catchAsync(async (req, res) => {
  const { review, rating } = req.body;
  const { _id: userId } = req.user;
  const { tourId } = req.params;
  console.log(tourId, userId, req.params.tourId);
  const newReview = await reviewModel.create({
    user: userId,
    tour: tourId,
    review,
    rating,
  });

  res.status(200).json({
    status: "Success",
    message: "Thanks for your review",
    data: { newReview },
  });
});
