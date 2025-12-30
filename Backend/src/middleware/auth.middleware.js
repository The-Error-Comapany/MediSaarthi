import jwt from "jsonwebtoken";
import User from "../DataModels/user.model.js";
import asyncCreator from "../utils/aysncCreator.js";
import errorHandler from "../utils/errorHandler.js";

const verifyJWT = asyncCreator(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new errorHandler(401, "Unauthorized access"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    return next(new errorHandler(401, "Invalid or expired access token"));
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    return next(new errorHandler(401, "User no longer exists"));
  }

  req.user = user;
  next();
});

export default verifyJWT;
