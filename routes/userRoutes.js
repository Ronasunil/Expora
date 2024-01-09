const express = require("express");

const authController = require("./../controller/authController");
const userController = require("./../controller/userController");

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/otp-verification").post(authController.verifyOtp);
router.route("/login").post(authController.login);

router
  .route("/update")
  .patch(
    authController.protect,
    userController.uploadPhoto,
    userController.resizeImage,
    userController.update
  );
router
  .route("/update-profile")
  .patch(
    authController.protect,
    userController.uploadPhoto,
    userController.updateProfilePic
  );

router
  .route("/account")
  .get(authController.protect, userController.getMe, userController.getUser);

router.route("/logout").get(authController.protect, authController.logout);

// bookmark route
router
  .route("/bookmark/:tourId")
  .patch(authController.protect, userController.saveToBookmark)
  .delete(authController.protect, userController.unBookmarkTour);

// get bookmark for certain user
router
  .route("/bookmark/:userId")
  .get(authController.protect, userController.getBookmark);

// forget password route
router.route("/forget-password").post(authController.forgotPassword);
// reset password
router.route("/reset-password/:resetToken").patch(authController.resetPassword);

// update password route
router
  .route("/password")
  .patch(authController.protect, authController.updatePassword);

// sending  feedback route
router
  .route("/submit-feedback")
  .post(authController.protect, userController.sendFeedback);

//memories route
router
  .route("/memories")
  .patch(
    authController.protect,
    userController.uploadPhoto,
    userController.addMemories
  );

router
  .route("/memories")
  .get(authController.protect, userController.getMemories);

//  admin routes

// get user by id route
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictAccessTo("admin"),
    userController.getUser
  );

// delete user by id route
router
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrictAccessTo("admin"),
    userController.deleteUser
  );

// get all users route
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictAccessTo("admin"),
    userController.getAllUsers
  );

module.exports = router;
