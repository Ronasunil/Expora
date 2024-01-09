const AppError = require("../utils/AppError");

const handleJsonWebTokenError = function () {
  return new AppError("Please login again", 401);
};

const renderDevError = function (err, req, res) {
  err.message = err.message || "something went wrong";
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).render("error", {
    statusCode: err.statusCode,
    message: err,
  });
};

const renderProdError = function (err, req, res) {
  err.message = err.message || "something went wrong";
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
  return res.status(err.statusCode).render("error", {
    statusCode: err.statusCode,
    message: "Please try again later",
  });
};

const viewErrorHandler = function (err, req, res, next) {
  if (process.env.NODE_ENV === "development") {
    renderDevError(err, req, res);
  }
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);

    renderProdError(error, req, res);
  }
};

module.exports = viewErrorHandler;
