const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("../utils/catchAsync");
const Tour = require("./../model/tourModel");
const ApiFeature = require("./../utils/ApiFeatures");
const AppError = require("../utils/AppError");
const Booking = require("./../model/bookingModel");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please provide a image file"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.multerUpload = upload;

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new ApiFeature(Tour, req.query);

  const query = features._filter()._paginate()._sort()._limitFields()._limit();

  const tours = await query.query;
  // success message
  res.status(200).json({
    status: "success",
    totalTours: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const { id } = req.params;

  const tour = await Tour.getTour(id);

  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.getTourBySlug = async (req, res) => {
  const { slug } = req.params;

  const tour = await Tour.getTourWithSlug(slug);

  res.status(200).json({
    status: "success",
    data: { tour },
  });
};

exports.deleteTour = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Tour.deleteTour(id);
  res.status(204).json({
    status: "Deleted",
  });
});

const addTourImgs = function (array, item) {
  if (array.length === 3) {
    array.pop();
    array.push(item);
    return array;
  }
  array.push(item);
  return array;
};

exports.resizeAndUploadTourImages = catchAsync(async function (req, res, next) {
  if (req.files.coverImg) {
    // tour cover image
    req.body.coverImg = `/img/tours/tour-main-${
      req.params.slug
    }-${Date.now().toString()}.jpeg`;

    await sharp(req.files.coverImg[0].buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`public/${req.body.coverImg}`);
  }

  if (req.files.tourImgs) {
    // tour deatils image
    req.body.tourImgs =
      (await Tour.findOne({ slug: req.params.slug }).select("tourImgs"))
        ?.tourImgs ?? [];

    await Promise.all(
      req.files.tourImgs.map(async function (img, i) {
        // cearting file name
        const fileName = `/img/tours/tour-images-${i + 1}${
          req.params.slug
        }-${Date.now().toString()}.jpeg`;

        const newTour = addTourImgs(req.body.tourImgs, fileName);

        req.body.tourImgs = newTour;

        await sharp(img.buffer)
          .resize(500, 335)
          .toFormat("jpeg")
          .jpeg({ quality: 100 })
          .toFile(`public/${fileName}`);
      })
    );
  }

  next();
});

exports.updateTour = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updatedTour = await Tour.updateTour(id, req.body);

  console.log(req.body);

  res.status(200).json({
    status: "success",
    message: "Item updated",
    data: { updatedTour },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      newTour,
    },
  });
});

exports.getTourNames = catchAsync(async (req, res) => {
  const tourNames = await Tour.find().select("tourName");

  if (!tourNames) throw new AppError("No tour found", 404);

  res.status(200).json({
    status: "Success",
    data: { tourNames },
  });
});

// getting avialable booking dates of tour
exports.getAvilableBookings = catchAsync(async (req, res) => {
  const { tourId } = req.params;
  const bookings = await Booking.find({
    tour: tourId,
    status: "confirmed",
  }).select("tourBookingDate");

  let bookingDates = bookings.map((booking) => booking.tourBookingDate);
  bookingDates = bookingDates.filter((booking) => booking !== undefined);

  const tour = await Tour.findById({ _id: tourId }).select("tourDates");

  const tourDates = tour.tourDates;

  if (!bookings) throw new AppError("Can't find booking", 404);

  let bookingTourDates = tourDates.filter((date) => {
    return date !== undefined;
  });

  if (bookingTourDates.length === 0) bookingTourDates = tourDates.tourDates;

  bookingTourDates = bookingTourDates.filter(
    (date1) =>
      !bookingDates.some((date2) => date1.getTime() === date2.getTime())
  );

  res.status(200).json({
    status: "Success",
    data: { bookingTourDates },
  });
});

exports.getTourPrice = catchAsync(async (req, res) => {
  const { tourId } = req.params;

  const tourPrice = await Tour.findById(tourId).select("price -_id");

  if (!tourPrice) throw new AppError("Can't find tour", 404);

  res.status(200).json({
    status: "Success",
    data: { tourPrice },
  });
});
