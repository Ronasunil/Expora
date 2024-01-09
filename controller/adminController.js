const { findOne } = require("../model/otpModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../model/userModel");

const filterObj = function (obj, ...fields) {
  const filteredObj = {};
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    if (!fields.includes(key)) filteredObj[key] = obj[key];
  });

  return filteredObj;
};

exports.updateUser = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const filteredObj = filterObj(
    req.body,
    "password",
    "confirmPassword",
    "role",
    "name",
    "email"
  );

  const updatedUser = await User.findOneAndUpdate({ slug: slug }, filteredObj, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) throw new AppError("User not found in database");

  res.status(200).json({
    status: "success",
    message: "Updated",
    data: { updatedUser },
  });
});
