const express = require("express");
const pug = require("pug");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSantize = require("express-mongo-sanitize");
const WebSocket = require("ws");
const compression = require("compression");

const path = require("path");

const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRouter");
const adminRouter = require("./routes/adminRouter");
const bookingRouter = require("./routes/bookingRouter");
const reviewRouter = require("./routes/reviewRouter");
const couponRouter = require("./routes/couponRouter");

const apiErrorHandler = require("./controller/errorHandler");
const viewErrorHandler = require("./controller/viewErrorHandler");
const bookingController = require("./controller/bookingController");

const app = express();

app.enable("trust proxy");

// rate limiting security middleware
// const limiter = rateLimit({
//   limit: 3000,
//   windowMs: 60 * 60 * 1000,
// });

// app.use(limiter);

// app.post("/webhook-checkout", express.raw(), bookingController.webhookCheckout);

// global middlewares
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// data sanitizing against nosql query injection (middleware)
app.use(mongoSantize());
app.use(compression());

// router middleware
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/coupons", couponRouter);

// view middlewares
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// api error handler middleware
app.use("/api", apiErrorHandler);

// app error handler middleware
app.use("/", viewErrorHandler);

// for all unspecified routes
app.all("*", (req, res) => {
  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    return res.render("error", {
      statusCode: 404,
      message: `Can't find the requested url ${req.originalUrl} in the server`,
    });
  }

  res.status(404).json({
    status: "fail",
    message: `Can't find the requested url ${req.originalUrl} in the server`,
  });
});
module.exports = app;
