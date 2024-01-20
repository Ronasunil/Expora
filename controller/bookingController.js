const stripe = require("stripe")(process.env.STRIPE_SECRET);
const PDFDocument = require("pdfkit-table");
const easyinvoice = require("easyinvoice");

const fs = require("fs");
const path = require("path");

const catchAsync = require("./../utils/catchAsync");
const Tour = require("./../model/tourModel");
const Booking = require("./../model/bookingModel");
const User = require("./../model/userModel");
const AppError = require("../utils/AppError");

exports.checkOut = catchAsync(async (req, res) => {
  const { tourId } = req.params;
  const { bookingDate, peopleCount, couponCode } = req.body;

  // const get tour
  const tour = await Tour.findById(tourId);
  let tourPrice = tour.finalPrice || tour.price;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}?tourId=${
      tour._id
    }&price=${tourPrice}&userId=${
      req.user._id
    }&bookingDate=${bookingDate}&peopleCount=${peopleCount}&couponCode=${couponCode}`,
    cancel_url: `${req.protocol}://${req.get("host")}/`,
    customer_email: req.user.email,
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 100 * Math.round(tourPrice),
          product_data: {
            name: tour.tourName,
            description: tour.description,
            images: [
              `https://expora-75fa4c861fb7.herokuapp.com${tour.coverImg}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // removing the final price field
  await Tour.findByIdAndUpdate(
    tourId,
    { $unset: { finalPrice: 1 } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "succes",
    data: session,
  });
});

exports.addBooking = catchAsync(async (req, res, next) => {
  const { price, tourId, userId, bookingDate, peopleCount, couponCode } =
    req.query;

  // check if  price tour id and user id exists
  if (!price && !tourId && !userId) return next();

  const tour = await Booking.findOne({ tour: tourId, user: userId });

  // checking if tour exist
  if (tour)
    throw new AppError(
      "You have already booked this tour please wait for the confirmation of admin",
      403
    );

  // creating tour
  await Booking.create({
    tour: tourId,
    user: userId,
    price: price,
    tourBookingDate: bookingDate,
    couponCode,
    peopleCount,
  });

  // // adding id to booked tour in user for reference
  // const status = await Booking.findOne({ user: userId, status: "confirmed" });

  // if (status) {
  //   await User.updateOne(
  //     { _id: userId },
  //     { $addToSet: { idOfBookedTour: tourId } },
  //     { new: true, runValidators: true }
  //   );
  // }

  next();

  res.redirect("/");
});

// get all bookings
exports.getAllBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find().populate("tour").populate("user");

  res.status(200).json({
    status: "success",
    data: { bookings },
  });
});

// get certain booking with specific id
exports.getBooking = catchAsync(async (req, res) => {
  const { tourId } = req.params;

  const booking = await Booking.find({ tour: tourId });

  if (!booking) throw new AppError("No booking found", 404);

  res.status(200).json({
    status: "Success",
    data: { booking },
  });
});

// booking of specific user
// exports.getUserBookings = catchAsync(async (req, res) => {
//   const { userId } = req.params;
//   const userBookings = await Booking.find({
//     user: userId,
//     status: "confirmed",
//   });
//   if (!userBookings || userBookings.length === 0)
//     throw new AppError("No tour found", 404);
//   console.log(userBookings);
//   const tourIds = userBookings.map((booking) => booking.tour);

//   const tours = await Tour.find({ _id: { $in: tourIds } });

//   res.status(200).json({
//     status: "success",
//     totalTours: tours.length,
//     data: { tours },
//   });
// });

exports.getUserBookings = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const bookings = await Booking.find({ user: userId, status: "confirmed" })
    .populate("tour")
    .populate("user");

  if (!bookings) throw new AppError("Can't find booking");

  res.status(200).json({
    status: "Success",
    data: { bookings },
  });
});

// booking of specific tour
exports.getBookingByTourId = catchAsync(async (req, res) => {
  const { tourId } = req.params;

  const booking = await Booking.find({ tour: tourId, status: "confirmed" })
    .populate({
      path: "tour",
      select: "coverImg price",
    })
    .populate({
      path: "user",
      select: "name",
    });
  if (!booking) throw new AppError("No booking found", 404);

  res.status(200).json({
    status: "Success",
    data: { booking },
  });
});

// update booking
exports.updateBookings = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const updatedBooking = await Booking.updateBooking(req.body, bookingId);
  // // adding id to booked tour in user for reference
  // const status = await Booking.findOne({ user: userId, status: "confirmed" });

  // if (status) {
  //   await User.updateOne(
  //     { _id: userId },
  //     { $addToSet: { idOfBookedTour: tourId } },
  //     { new: true, runValidators: true }
  //   );
  // }
  res.status(200).json({
    status: "success",
    data: { updatedBooking },
  });
});

// deleting booking
exports.deleteBooking = catchAsync(async (req, res) => {
  const { userId: bookingId } = req.params;

  const booking = await Booking.findByIdAndDelete(bookingId)
    .populate("tour")
    .populate("user");

  if (!booking) throw new AppError("Cannot find booking with this id");

  res.status(200).json({
    status: "Success",
    data: { booking },
  });
});

// getting analytics of app
exports.getStats = catchAsync(async (req, res) => {
  const dateCriteria = req.params.dateCriteria;

  const criteria =
    dateCriteria === "all"
      ? {}
      : {
          $expr: {
            $eq: [{ $year: "$createdAt" }, +dateCriteria],
          },
        };

  const stat = await Booking.aggregate([
    {
      $match: criteria,
    },

    {
      $project: {
        year: dateCriteria === "all" ? { $year: "$createdAt" } : null,
        monthNum: { $month: "$createdAt" },
        month: {
          $dateToString: {
            format: "%m-%Y",
            date: "$createdAt",
          },
        },
      },
    },

    {
      $group: {
        _id: dateCriteria === "all" ? "$year" : "$month",
        count: { $sum: 1 },
        monthNum:
          dateCriteria === "all" ? { $first: 0 } : { $first: "$monthNum" },
      },
    },

    {
      $set: {
        dateInfo: "$_id",
      },
    },

    {
      $sort: dateCriteria === "all" ? { dateInfo: 1 } : { monthNum: 1 },
    },

    {
      $project: { _id: 0 },
    },
  ]);

  res.status(200).json({
    status: "Success",
    data: { stat },
  });
});

// download sales report  func
exports.getSalesReport = catchAsync(async (req, res) => {
  let { startDate, endDate } = req.body;

  const result = await Booking.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $gte: ["$createdAt", new Date(startDate)] },
            { $lte: ["$createdAt", new Date(endDate)] },
          ],
        },
      },
    },

    {
      $group: {
        _id: null,
        total: { $sum: "$price" },
        tours: {
          $push: {
            tour: "$tour",
            user: "$user",
            total: "$total",
            createdAt: "$createdAt",
            price: "$price",
          },
        },
      },
    },
  ]);

  await Booking.populate(result[0].tours, {
    path: "user tour",
    select: "name email tourName",
  });

  // adding values to table
  const row = result[0].tours.map(function (val, i) {
    const date = new Date(val.createdAt).toLocaleDateString();
    return [
      i + 1,
      val.user.name,
      val.user.email,
      date,
      val.tour.tourName,
      val.price,
    ];
  });

  row.push([result[0].tours.length + 1, "Total", "", "", "", result[0].total]);

  let doc = new PDFDocument({ margin: 30, size: "A4" });

  //  creating table for pdf
  const table = {
    title: "Sales report",
    headers: [
      "No",
      "Name",
      "Email",
      "Purchase Date",
      "Purchased tour",
      "Price",
    ],
    rows: row,
  };
  await doc.table(table);

  // Set the response headers for PDF download
  res.setHeader("Content-disposition", "attachment; filename=sales-report.pdf");
  res.setHeader("Content-type", "application/pdf");

  // Pipe the PDF content to the response
  doc.pipe(res);

  // End the PDF document
  doc.end();
});

const createInvoice = async function (booking) {
  const imgPath = path.join(__dirname, "../public/img", "Expora.png");
  const imgBase64 = fs.readFileSync(imgPath, "base64");
  // Product booked date
  const date = new Date(booking.createdAt).toLocaleDateString();

  const data = {
    // If not using the free version, set your API key
    // "apiKey": "123abc", // Get apiKey through: https://app.budgetinvoice.com/register

    // Customize enables you to provide your own templates
    // Please review the documentation for instructions and examples
    customize: {
      //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
    },
    images: {
      // The logo on top of your invoice
      logo: imgBase64,
      // The invoice background
      background: "https://public.budgetinvoice.com/img/watermark-draft.jpg",
    },
    // Your own data
    sender: {
      company: "Expora",
      address: "New villa street",
      zip: "65345 Ex",
      city: "New york",
      country: "USA",
    },
    // Your recipient
    client: {
      company: booking.user.name,
      address: booking.user.email,
    },
    information: {
      // Invoice number
      number: String(Date.now()),
      // Invoice data
      date: date,
    },

    products: [
      {
        quantity: 1,
        description: booking.tour.tourName,
        "tax-rate": 0,
        price: booking.price,
      },
    ],

    settings: {
      currency: "USD",
    },
  };
  // Create your invoice
  const result = await easyinvoice.createInvoice(data);
  if (!result) new AppError("Something went wrong", 500);
  return result;
};

// download invoice func
exports.downloadInvoice = async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) throw new AppError("Provide a booking");

  const booking = await Booking.findById(bookingId)
    .populate("tour")
    .populate("user");

  // if no booking
  if (!booking) throw new AppError("Can't find booking", 404);

  // creating invoice structure
  const invoice = await createInvoice(booking);
  const bufferInvoice = Buffer.from(invoice.pdf, "base64");
  res.setHeader("Content-type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

  res.send(bufferInvoice);
};
