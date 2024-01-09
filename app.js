const express = require("express");
const pug = require("pug");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSantize = require("express-mongo-sanitize");
const WebSocket = require("ws");
const compression = require("compression");

const path = require("path");
const http = require("http");

const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRouter");
const adminRouter = require("./routes/adminRouter");
const bookingRouter = require("./routes/bookingRouter");
const reviewRouter = require("./routes/reviewRouter");
const couponRouter = require("./routes/couponRouter");

const apiErrorHandler = require("./controller/errorHandler");
const viewErrorHandler = require("./controller/viewErrorHandler");

const app = express();

app.set("trust proxy", 1);

// rate limiting security middleware
const limiter = rateLimit({
  limit: 3000,
  windowMs: 60 * 60 * 1000,
});

app.use(limiter);

// global middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  res.status(404).json({
    status: "fail",
    message: `Can't find the request url ${req.originalUrl} in the server`,
  });
});
module.exports = app;
