const multer = require("multer");
const sharp = require("sharp");

const mailer = require("./../utils/mailer");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../model/userModel");
const Booking = require("../model/bookingModel");
const { findById } = require("../model/tourModel");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/img/users`);
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/").pop();

    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Only upload image"), false);
};

exports.resizeImage = catchAsync(async (req, res, next) => {
  // if there is not file then dont'update
  if (!req.file) return next();

  // creating file name for new file
  const randomInt = Math.random() * 1234342340000;

  const fileName = `/img/users/profile-pic${Date.now().toString()}-${randomInt.toString()}.jpeg`;
  console.log(fileName);
  // passing it to req.body to update
  req.body.profileImg = fileName;

  try {
    // resizing and saving
    await sharp(req.file.buffer)
      .resize(300, 300)
      .toFormat("jpeg")
      .jpeg({ quality: 70 })
      .toFile(`public${fileName}`);
  } catch (err) {
    console.log(err);
    throw new AppError("Something went wrong", 500);
  }

  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
});

exports.uploadPhoto = upload.single("profileImg");

exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await User.deleteUser(id);

  res.status(204).json({
    status: "success",
    message: "user Deleted",
  });
});

// all users
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    status: "success",
    totalUsers: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) throw new AppError("No user found in database with this id");

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.getMe = (req, res, next) => {
  const userId = req.user._id;
  req.params.id = userId;

  next();
};

exports.update = catchAsync(async (req, res) => {
  let updatedUser;

  // check if password and confirm password is there in the body
  if (req.body.password || req.body.confirmPassword)
    throw new AppError(
      "User password can't be updted here use reset or update password"
    );

  //update user
  // if (req.body.tourId) {
  // cancelling tour
  updatedUser = await User.updateUser(req.body, req.user.id, req.body.tourId);
  // } else {
  //   // else run as updating tour
  //   updatedUser = await User.updateUser(req.body, req.user.id);
  // }

  res.status(200).json({
    status: "Success",
    message: "Updated successfully",
  });
});

// updating user wallet
exports.updateWallet = catchAsync(async (req, res) => {
  const { _id: userId } = req.user;
  const wallet = req.body.wallet;

  User.updateUserWallet(wallet, userId);
});

// adding or updating profile pic
exports.updateProfilePic = catchAsync(async (req, res) => {
  const id = req.user._id;
  const filename = req.file.filename;
  const updatedUser = await User.updatePic(id, filename);

  res.status(200).json({
    status: "success",
    data: { updatedUser },
  });
});

// saving bookmark to user
exports.saveToBookmark = catchAsync(async (req, res) => {
  // essentials
  let isBookmarked = false;
  const userId = req.user._id;
  const { tourId } = req.params;

  const currentUser = await User.findById(userId);
  const bookmark = currentUser.bookmarks;

  // no user found
  if (!currentUser) throw new AppError("User not found in database", 404);

  // check if tour is already bookmarked
  if (bookmark.length > 0)
    isBookmarked = bookmark.find((tour) => tour._id.toString() === tourId);

  if (isBookmarked)
    throw new AppError(
      "You've already saved this tour to your bookmarks!",
      208
    );

  // pushing bookmarked(tour) to bookmark field in array
  currentUser.bookmarks.push(tourId);

  // saving the user
  currentUser.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: { currentUser },
  });
});

// unbookmarking the tour
exports.unBookmarkTour = async (req, res) => {
  const userId = req.user._id;
  const { tourId } = req.params;

  const currentUser = await User.findById(userId);

  const bookmarks = currentUser.bookmarks;
  // if no bookmark found
  if (!bookmarks) throw new AppError("No bookmark found", 404);

  // getting index of bookmarked tour
  const index = bookmarks.findIndex((tour) => tour._id.toString() === tourId);

  // removing tour from bookmark
  if (index > -1) bookmarks.splice(index, 1);

  // saving the tour
  currentUser.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "Success",
    data: { currentUser },
  });
};

// bookmark of certain user
exports.getBookmark = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // check if user exist
  const bookmarks = await User.findById(userId).select("bookmarks");

  if (!bookmarks) throw new AppError("User not found");

  // send bookmark
  res.status(200).json({
    status: "Success",
    data: { bookmarks },
  });
});

// send feedback to admin
exports.sendFeedback = catchAsync(async (req, res) => {
  req.body.adminEmail = "ronasunilcoc@gmail.com";
  const { adminEmail, subject, message } = req.body;
  const { email: userEmail } = req.user;

  // get all admins
  const admins = await User.find({ role: "admin" }, "email");
  const adminEmails = admins.map((admin) => admin.email);

  // select only valid admins
  if (!adminEmails.includes(adminEmail))
    throw new AppError("Please provide a valid email id of admin");

  // sending mail
  await mailer({ from: userEmail, email: adminEmail, message });

  res.status(200).json({
    status: "Success",
    message: "Thanks for your feedback",
  });
});

// getting memories
exports.getMemories = (req, res) => {
  const memories = req.user.memories;
  res.status(200).json({
    status: "Success",
    data: { memories },
  });
};

// adding memories
exports.addMemories = catchAsync(async (req, res) => {
  const { location, description, date, profileImg: memoriesPhoto } = req.body;
  const { _id } = req.user;

  console.log("kl, heyhh");

  // getting current user
  const user = await User.findById(_id);

  // adding location, description and photo from body to a object
  const memories = {
    location,
    description,
    date: new Date(date).getTime(),
    photo: memoriesPhoto,
  };

  // updating it
  const user1 = await User.findByIdAndUpdate(
    _id,
    { $push: { memories } },
    { new: true, runValidators: true }
  );

  if (!user1) throw new AppError("Can't find user", 404);

  res.status(200).json({
    status: "Success",
    memories: { user },
  });
});

// getting user wallet
exports.getUserWallet = catchAsync(async (req, res) => {
  const { _id: userId } = req.user;
  let userWallet = (await User.findById(userId).select("wallet")).wallet;

  if (!userWallet) throw new AppError("Can't find user", 404);

  res.status(200).json({
    status: "Success",
    size: userWallet.length,
    data: { userWallet },
  });
});
