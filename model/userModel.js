const mongoose = require("mongoose");
const validator = require("validator");
const schedule = require("node-schedule");
const bcrypt = require("bcrypt");
const slug = require("mongoose-slug-updater");

const crypto = require("crypto");

const AppError = require("./../utils/AppError");
const filterObj = require("./../utils/filterObj");

// validate function for validating cities
const validateCity = async function (cityName) {
  const url = `https://api.geoapify.com/v1/geocode/search?city=${cityName}&apiKey=857d4394470d41e5a3577c123b68b803`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
  const isValidCIty = data?.features[0]?.properties?.city ?? null;
  if (isValidCIty) return true;
  return false;
};
// model
const Tour = require("./../model/tourModel");

mongoose.plugin(slug);
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Missing th name field"],
      maxLength: [30, "name must be less than 30 characters"],
      minlength: [3, "name must have 3 characters"],
      trim: true,
    },

    role: {
      type: String,
      required: [true, "Missing the role field"],
      enum: {
        values: ["user", "admin"],
        message: "provide user or admin role only",
      },

      default: "user",
    },

    email: {
      type: String,
      required: [true, "Missing the email field"],
      validate: {
        validator: validator.isEmail,
        message: "please provide a valid email",
      },
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Missing the password field"],
      maxLength: [32, "password must be be less than 32 characters"],
      trim: true,
      validate: {
        validator: function (password) {
          const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
          return regex.test(password);
        },

        message:
          "Password must have 8 characters with 1 character atleast uppercase, 1 character number",
      },
    },

    confirmPassword: {
      type: String,
      required: [true, "please confirm the password"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "passwords are not same",
      },
      trim: true,
    },

    passwordChangedAt: {
      type: Date,
    },

    validUser: {
      type: Boolean,
      default: false,
    },

    profileImg: {
      type: String,
      default: "/img/users/default.jpg",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    bookmarks: Array,

    memories: [
      {
        photo: {
          type: String,
          required: [true, "Please provide a image for your memories"],
        },
        location: {
          type: String,
          required: [true, "Please include location"],
          validate: {
            validator: async function (location) {
              return await validateCity(location);
            },
            message: "Provide a valid city",
          },
        },

        description: {
          type: String,
          required: [true, "Please include description"],
          minlength: [
            20,
            "Description must have 20 characters minimum and 100 charaters maximum",
          ],
          maxlength: [
            100,
            "Description must have 20 characters minimum and 100 charaters maximum",
          ],
        },

        date: {
          type: Date,
          required: [true, "Please include the date"],
        },
      },
    ],

    about: {
      type: String,
      default: "",
      maxLength: 100,
    },

    slug: {
      type: String,
      slug: "name",
      slugPaddingSize: 4,
      unique: true,
    },
    wallet: [Array],

    passwordResetToken: {
      type: String,
    },

    resetTokenExpiresin: {
      type: Date,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("bookings", {
  ref: "Bookings",
  localField: "_id",
  foreignField: "user",
});

// pre save middleware for bookmark to embedd data
userSchema.pre("save", async function (next) {
  if (!this.isModified("bookmarks")) return next();

  const toursPromise = this.bookmarks.map(
    async (id) => await Tour.findById(id)
  );

  this.bookmarks = await Promise.all(toursPromise);

  next();
});

// pre save middleware for changing passwordChangedAt property
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.confirmPassword = undefined;
  this.password = await bcrypt.hash(this.password, 13);
  next();
});

// for creating random token for reset email
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiresin = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.statics.login = async function (email, password) {
  // check if email and password exist

  if (!email || !password)
    throw new AppError("please provide email and password", 404, "email");

  // check if email is valid or not
  const user = await this.findOne({ email: email, validUser: true });

  if (!user) throw new AppError("Password or email is invalid", 401, "email");

  // checking the password is correct or not
  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect)
    throw new AppError("Password or email is invalid", 401, "password");

  //  returning the user
  return user;
};

userSchema.statics.isPasswordChanged = function (id, jwtIssuedTime) {
  if (!this.passwordChangedAt) return false;
  const user = this.findById(id);
  const passwordChangedAt = new Date(user.passwordChangedAt).getTime() / 1000;
  return passwordChangedAt > jwtIssuedTime;
};

userSchema.statics.deleteUser = async function (id) {
  const user = await this.findByIdAndDelete(id);
  if (!user) throw new AppError("Id not found in the database", 401);
};

userSchema.statics.updateUser = async function (obj, id) {
  const filteredObj = filterObj(obj, "role", "validUser");

  const updatedUser = await this.findByIdAndUpdate(id, filteredObj, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) throw new AppError("user not found");
  return updatedUser;
};

userSchema.statics.updateUserWallet = async function (obj, id) {
  const updatedUser = await this.findByIdAndUpdate(id, {
    $push: { wallet: obj },
  });

  if (!updatedUser) throw new AppError("User not found");

  return updatedUser;
};

userSchema.statics.updatePic = async function (id, image) {
  const updatedUser = await this.findByIdAndUpdate(
    id,
    { profileImg: `img/users/${image}` },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) throw new AppError("User not found");
  return updatedUser;
};

const job = schedule.scheduleJob("0 0 * * *", async function () {
  await User.deleteMany({ validUser: false });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
