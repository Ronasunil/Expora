const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const Mailer = require("./../utils/mailer");

const catchAsync = require("./../utils/catchAsync");
const User = require("./../model/userModel");
const otpGenerator = require("./../utils/otp");
const otpModel = require("./../model/otpModel");
const sendEmail = require("./../utils/mailer");
const AppError = require("./../utils/AppError");

// siging token
const signToken = async function (payload) {
  return await jwt.sign({ id: payload }, process.env.SECRET, {
    expiresIn: process.env.EXPIRESIN,
  });
};

const setCookie = function (res, token) {
  const cookieOpt = {
    maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOpt.secure = true;
  console.log(cookieOpt);
  res.cookie("jwt", token, cookieOpt);
};

const sendOtp = async function (user, url) {
  // generate Otp
  const otp = otpGenerator();

  await otpModel.create({
    email: user.email,
    otp: otp,
  });

  // sending otp

  await new Mailer(user, url).sendOtp(otp);
};

exports.signUp = catchAsync(async (req, res) => {
  // creating user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get("host")}/otp-verification`;
  await sendOtp(user, url);

  res.status(200).json({
    status: "success",
    message: "Otp sent",
  });
});

exports.verifyOtp = catchAsync(async (req, res) => {
  const { resend } = req.query;

  // check if otp is avialable in db
  const realOtp = await otpModel.findOne().sort({ createdAt: -1 });

  if (!realOtp)
    throw new AppError("you must need to register to get otp", 400, "otp");

  // resending otp
  if (resend) {
    const user = User.findOne({ email: realOtp.email });
    const url = `${req.protocol}://${req.get("host")}/otp-verification`;
    sendOtp(user, url);

    return res.status(200).json({
      status: "success",
      message: "Otp sent",
    });
  }

  // check otp and user is avilable
  const { otp } = req.body;
  if (!otp) throw new AppError("Please enter the otp", 400);

  // check user exists
  const userEmail = realOtp.email;
  const user = await User.findOne({ email: userEmail });

  if (!user) throw new AppError("Please provide gmail to send otp", 400);

  // comparing otp's
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOtp !== realOtp.otp)
    throw new AppError("Please enter a valid otp", 401);

  //updating user valid property to true
  await User.findOneAndUpdate(
    { email: userEmail },
    { validUser: true },
    { new: true, runValidators: true }
  );

  // signing token
  const token = await signToken(user._id);

  // sending cookie
  setCookie(res, token);
  res.status(200).json({
    status: "success",
    message: "Account created",
    token: token,
    data: { user },
  });
});

// login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.login(email, password);

  // account is blocked
  if (user.isBlocked)
    throw new AppError("User account has been temoprarily blocked", 403);

  // account is softly deleted
  if (user.isDeleted) throw new AppError("Please create a account", 401);

  const token = await signToken(user._id);

  setCookie(res, token);
  res.status(200).json({
    status: "success",
    message: "Authenticated",
    role: user.role,
    data: { user, token },
  });
});

exports.protect = catchAsync(async function (req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("bearer")
      ? req.headers.authorization.split(" ").pop()
      : req.cookies.jwt;

  if (!token) throw new AppError("Please login", 401, "jwt");

  // verify jwt

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

  if (!decoded) throw new AppError("Invalid token");

  // check user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) throw new AppError("User not found in data base", 401);

  // account is blocked
  if (currentUser.isBlocked)
    throw new AppError("User account has been temoprarily blocked", 403);
  console.log(currentUser);
  // account is softly deleted
  if (currentUser.isDeleted) throw new AppError("Please login", 401);

  // check if password  changed
  const changedPassword = User.isPasswordChanged(currentUser._id, decoded.iat);

  if (changedPassword)
    throw new AppError(
      "Password has changed! please enter the new password",
      401
    );

  req.user = currentUser;

  next();
});

exports.restrictAccessTo = function (...roles) {
  return function (req, res, next) {
    console.log(roles);
    if (!roles.includes(req.user.role))
      throw new AppError("You can't access this route");

    next();
  };
};

exports.isLoggedIn = catchAsync(async function (req, res, next) {
  try {
    // check if user has jwt
    if (req.cookies.jwt) {
      // verify jwt
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.SECRET
      );

      if (!decoded) return next();

      // check user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // check if password  changed
      const changedPassword = User.isPasswordChanged(
        currentUser._id,
        decoded.iat
      );

      if (changedPassword) return next();

      res.locals.user = currentUser;
      req.user = req.user;

      return next();
    }

    next();
  } catch (error) {
    return next();
  }
});

// forget Password sending mail to user
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  // get email adress form user
  if (!email) throw new AppError("Please provide a email address", 404);

  // check if user exists with this email
  const user = await User.findOne({ email });

  if (!user)
    throw new AppError("Please provide a valid email address", 404, "email");

  // create token
  const resetToken = user.createResetToken();
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/users/reset-password/${resetToken}`;
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;
  user.save({ validateModifiedOnly: true });

  // send rest link to email

  await new Mailer(user, resetUrl).sendResetPassword(resetUrl);

  res.status(200).json({
    status: "Success",
    message: "Please check your email",
  });
});

// reset password
exports.resetPassword = catchAsync(async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  // creating a copy of hashed token to get user
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // getting user
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpiresin: { $gt: Date.now() },
  });

  if (!user) throw new AppError("invalid url please try again after sometime");

  // saving password
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.resetTokenExpiresin = undefined;
  user.passwordResetToken = undefined;

  user.save({ validateModifiedOnly: true });

  // signing token
  const token = await signToken(user._id);
  setCookie(res, token);

  res.status(200).json({
    status: "Success",
    message: "Your password has been changed successfully.",
    token,
  });
});

// updating current password
exports.updatePassword = catchAsync(async (req, res) => {
  const { _id } = req.user;
  const { password, newPassword, confirmPassword } = req.body;

  // get user
  const user = await User.findById(_id);

  if (!user)
    throw new AppError(
      "Please login or account maybe deleted or blocked !",
      401
    );

  // check if posted password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect)
    throw new AppError("Enter the correct password", 401, "password");

  // update password
  user.password = newPassword;
  user.confirmPassword = confirmPassword;

  user.save({ validateModifiedOnly: true });

  // send jwt,
  const token = await signToken(user._id);
  setCookie(res, token);

  res.status(200).json({
    status: "Success",
    message: "Password successfully changed",
  });
});

// logout
exports.logout = (req, res) => {
  res.cookie("jwt", "deleted", {
    maxAge: 4000,
    httpOnly: true,
  });
  res.redirect("/");
};
