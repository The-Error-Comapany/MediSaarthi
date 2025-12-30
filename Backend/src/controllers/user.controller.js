import asyncCreator from "../utils/aysncCreator.js";
import errorHandler from "../utils/errorHandler.js";
import User from "../DataModels/user.model.js";
import { resHandler, ok, badRequest } from "../utils/resHandler.js";
import jwt from "jsonwebtoken";
import { sendOtpMail } from "../utils/mailer.js";
import { generateOtp, hashOtp } from "../utils/otp.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new errorHandler(404, "User not found while generating tokens");

    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw new errorHandler(500, "Error generating tokens");
  }
};

const registerUser = asyncCreator(async (req, res) => {
  const { name, email, password } = req.body;

  const emailLower = email.toLowerCase();

  const existingUser = await User.findOne({ email: emailLower });
  if (existingUser) {
    throw new errorHandler(409, "User already exists");
  }

  const otp = generateOtp();

  await User.create({
    name,
    email: emailLower,
    password,
    emailOtp: hashOtp(otp),
    emailOtpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false,
  });

  await sendOtpMail(emailLower, name, otp);

  return ok(res, { email: emailLower }, "OTP sent to email");
});

const verifyEmailOtp = asyncCreator(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new errorHandler(404, "User not found");

  if (user.isVerified) {
    throw new errorHandler(400, "User already verified");
  }

  if (
    user.emailOtpExpires < Date.now() ||
    user.emailOtp !== hashOtp(otp)
  ) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    throw new errorHandler(400, "Invalid or expired OTP");
  }

  user.isVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: false,    
    sameSite: "lax",   
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new resHandler(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Email verified and logged in successfully"
      )
    );
});


const resendEmailOtp = asyncCreator(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new errorHandler(404, "User not found");
  if (user.isVerified) throw new errorHandler(400, "Already verified");

  const otp = generateOtp();

  user.emailOtp = hashOtp(otp);
  user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
  user.otpAttempts = 0;

  await user.save({ validateBeforeSave: false });

  await sendOtpMail(user.email, user.name, otp);

  return ok(res, {}, "OTP resent successfully");
});


const loginUser = asyncCreator(async (req, res) => {
  const { email, password } = req.body;
  const emailTrimmed = email?.trim().toLowerCase();

  if (!emailTrimmed) throw new errorHandler(400, "Enter your email id");

  const user = await User.findOne({ email: emailTrimmed });
  if (!user) throw new errorHandler(404, "User does not exist! Please register");

  const isValid = await user.isPassCorrect(password);
  if (!isValid) throw new errorHandler(401, "Please enter the correct password");

  if (!user.isVerified) {
    throw new errorHandler(403, "Please verify your email before logging in");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // utils/cookieOptions.js
  const options = {
    httpOnly: true,
    secure: false,    
    sameSite: "lax",  
  };


  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new resHandler(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export const forgotPassword = asyncCreator(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Do NOT reveal user existence
    return ok(res, {}, "If the email exists, OTP has been sent");
  }

  if (user.authProvider === "google") {
    throw new errorHandler(
      400,
      "Password reset not available for Google accounts"
    );
  }

  const otp = generateOtp();

  user.resetPasswordOtp = hashOtp(otp);
  user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendOtpMail(user.email, user.name, otp, "password-reset");

  return ok(res, {}, "OTP sent to email");
});

export const resetPassword = asyncCreator(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new errorHandler(400, "Invalid request");

  if (
    !user.resetPasswordOtp ||
    user.resetPasswordOtpExpires < Date.now() ||
    user.resetPasswordOtp !== hashOtp(otp)
  ) {
    throw new errorHandler(400, "Invalid or expired OTP");
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpires = undefined;
  user.refreshToken = undefined; // logout all sessions

  await user.save();

  return ok(res, {}, "Password reset successfully. Please sign in.");
});

const logoutUser = asyncCreator(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: false,    
    sameSite: "lax",  
  };


  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new resHandler(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncCreator(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken || incomingRefreshToken === "undefined") {
    throw new errorHandler(401, "No refresh token provided");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new errorHandler(401, "User not found");

    if (incomingRefreshToken !== user.refreshToken) {
      throw new errorHandler(401, "Invalid or expired refresh token");
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new resHandler(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (err) {
    console.error("Refresh token error:", err);
    throw new errorHandler(401, "Invalid refresh token");
  }
});

export const updateUser = asyncCreator(async (req, res) => {
  const userId = req.user._id;
  const {
    name,
    mobileNumber,
    dob,
    preferences,
  } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(mobileNumber && { mobileNumber }),
    ...(dob && { dob }),
    ...(preferences && { preferences }),
  };

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password -refreshToken"); 

  if (!updatedUser) return badRequest(res, "User not found");

  return ok(res, { user: updatedUser }, "Profile updated successfully");
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmailOtp,
  generateAccessAndRefreshTokens,
  resendEmailOtp
};
