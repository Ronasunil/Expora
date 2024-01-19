const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
const AppError = require("../utils/AppError");

mongoose.plugin(slug);
const tourSchema = new mongoose.Schema(
  {
    tourName: {
      type: String,
      maxLength: [35, "Tour name must be less than 35 characters"],
      minLength: [4, "Tour name must have 4 characters"],
      unique: true,
      required: [true, "missing the field tour name"],
    },

    catagory: {
      type: String,
      lowercase: true,
      enum: {
        values: ["adventure", "romantic", "forest", "budget tour"],
      },

      required: [true, "missing the field categorey"],
    },

    description: {
      type: String,
      required: [true, "missing the field description"],
    },

    rating: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },

    numRatings: {
      type: Number,
      default: 0,
    },

    maxPeople: {
      type: Number,
      required: [true, "missing the field people limit"],
    },

    difficulty: {
      type: String,
      lowercase: true,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "missing the field difficulty",
      },
    },

    location: {
      type: String,
      required: [true, "missing field location"],
    },

    coordinates: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        latLng: [Number],
        description: String,
      },
    ],

    duration: {
      type: String,
      required: [true, "missing the field duration"],
    },

    tourDates: {
      type: [Date],
      required: [true, "tour must need a tour date"],
    },

    stops: {
      type: Number,
      required: [true, "missing the field stops"],
    },

    coverImg: {
      type: String,
    },

    tourImgs: [String],

    price: {
      type: Number,
      required: [true, "missing the field price"],
    },

    finalPrice: {
      type: Number,
    },

    slug: {
      type: String,
      slug: "tourName",
      unique: true,
      slugPaddingSize: 4,
    },
    features: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("bookings", {
  ref: "Bookings",
  localField: "_id",
  foreignField: "tour",
});

tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
});

// getting a certain tour by id
tourSchema.statics.getTour = async function (id) {
  const tour = await this.findOne({ _id: id });
  if (!tour) throw new AppError("Tour not found in the database", 404);
  return tour;
};

// getting a certain tour by slug
tourSchema.statics.getTourWithSlug = async function (slug) {
  const tour = await this.findOne({ slug: slug });

  if (!tour) throw new AppError("Tour not found in database", 404);

  return tour;
};

// delete tour
tourSchema.statics.deleteTour = async function (id) {
  const tour = await this.findByIdAndDelete(id);
  if (!tour) throw new AppError("Tour not found in the database", 404);
};

// update tour
tourSchema.statics.updateTour = async function (slug, body) {
  console.log(slug);
  const updatedTour = await this.findOneAndUpdate({ slug: slug }, body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) throw new AppError("Tour not found in database", 404);
  return updatedTour;
};

const tourModel = mongoose.model("Tour", tourSchema);

module.exports = tourModel;
