const AppError = require("./../utils/AppError");
// const loadash = require("loadash");

const getErrorInfo = function (err) {
  return Object.values(err.errors).map(({ path, message }) => ({
    path,
    message,
  }));
};

const handleValidationErrDB = function (err) {
  const errors = Object.values(err.errors).map((err) => err.message);
  const msg = `${errors.join(" .")}`;
  // some deatiled info about error like path and message to print error according to field
  const errorInfo = getErrorInfo(err);
  return new AppError(msg, 400)._addErrInfo(errorInfo);
};

const handleDuplicateError = function (err) {
  if (err.message.includes("ObjectId"))
    return new AppError("You have already written a tour", 409, "review");

  const value = err.message.match(/"([^"]*)"/);
  const key = Object.keys(err.keyValue);

  const msg = `${value[1]} ${key} already exist`;

  return new AppError(msg, 409, "email");
};

const handleCastError = function (err) {
  const msg = `Invalid  ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};

const handleTokenError = function () {
  return new AppError("Please login");
};
const devErrMode = function (res, err) {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err.errors,
    stack: err.stack,
  });
};

const prodErrMode = function (res, err) {
  const errInfo = err?.errInfo ?? undefined;

  if (err.isOperational) {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errInfo,
      type: err.field,
    });
  } else {
    console.log(err);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler = function (err, req, res, next) {
  if (process.env.NODE_ENV === "development") {
    devErrMode(res, err);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    error.message = err.message;
    error.type = err.field;

    if (err.code === 11000) error = handleDuplicateError(err);
    if (err.name === "ValidationError") error = handleValidationErrDB(err);
    if (err.name === "CastError") error = handleCastError(err);
    if (err.name === "JsonWebTokenError") error = handleTokenError();
    prodErrMode(res, error);
  }
};

module.exports = globalErrorHandler;

// { tour: ObjectId('6576bc604b0efacafd3c1ae3'), user: ObjectId('655fa8ca16e09df0d91f7c9c') }
