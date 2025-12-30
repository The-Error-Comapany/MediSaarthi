import asyncCreator from "../utils/aysncCreator.js";
import errorHandler from "../utils/errorHandler.js";
import User from "../DataModels/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { resHandler } from "../utils/resHandler.js";
import { generateAccessAndRefreshTokens } from "./user.controller.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = asyncCreator(async (req, res) => {
  const { credential } = req.body; // ID token from frontend

  if (!credential) {
    throw new errorHandler(400, "Google credential missing");
  }

  // Verify token with Google
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, email_verified } = payload;

  if (!email_verified) {
    throw new errorHandler(403, "Google email not verified");
  }

  let user = await User.findOne({ email });

  // If user does not exist-create
  if (!user) {
    user = await User.create({
      name,
      email,
      password: "GOOGLE_AUTH",
      isVerified: true,
      authProvider: "google",
    });
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

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
        "Google login successful"
      )
    );
});
