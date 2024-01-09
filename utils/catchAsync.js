const catchAsync = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.log(err);
      next(err);
    });
  };
};

module.exports = catchAsync;