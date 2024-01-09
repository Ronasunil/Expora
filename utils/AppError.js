class AppError extends Error {
  constructor(msg, statusCode, field) {
    super(msg);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith(4) ? "fail" : "error";
    this.isOperational = true;
    this.field = field;
    Error.captureStackTrace(this, this.constructor);
  }

  _addErrInfo(obj) {
    this.errInfo = obj;
    return this;
  }
}

module.exports = AppError;
