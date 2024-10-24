const Admin = require("../Modals/admin");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs"); // For hashing the new password (if not already included)

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  console.log(token);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // 2) Check if user exists && password is correct
  const user = await Admin.findOne({ username }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    console.log("email or password don't match");
    return res.status(200).json({ message: "Invalid username or password" });
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
  console.log("everything ok !!!");

  next();
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await Admin.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    let message = "An error occurred.";

    // Handle duplicate email error (Mongoose Error Code 11000)
    if (err.code === 11000) {
      message = "Email address is already in use.";
    }

    // Handle validation errors (like password length)
    if (err.errors) {
      if (err.errors.password) {
        message = "Password length can't be shorter than 8"; // Password validation message
      }
    }

    res.status(400).json({
      status: "fail",
      message,
    });
  }

  next();
};

exports.forgetPassword = async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await Admin.findOne({ email: req.body.email });

  if (!user) {
    console.log("There is no user with that email address");
  }

  // 2. Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 3. Hash the reset token and set it on the user model
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

  await user.save({ validateBeforeSave: false });

  // 4. Send it to user's email
  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log(transporter);
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: "Your password reset token (valid for 10 minutes)",
    text: message,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1. Get the hashed token from the URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.body.Token)
      .digest("hex");

    // 2. Find user by the hashed token and ensure the token is still valid (not expired)
    const user = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    // 3. If no user or token has expired, return an error
    if (!user) {
      return res.status(200).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    // 4. If user exists and token is valid, update the password
    user.password = req.body.password; // Hash the new password

    // 5. Clear the reset token and expiration date
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // 6. Save the updated user with the new password
    await user.save();

    // 7. Optionally: Log the user in automatically after resetting password
    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while resetting the password",
    });
  }
};
