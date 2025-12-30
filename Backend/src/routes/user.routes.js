import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  verifyEmailOtp,
  resendEmailOtp
} from "../controllers/user.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { resHandler } from "../utils/resHandler.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/verify-otp").post(verifyEmailOtp);
router.route("/resend-otp").post(resendEmailOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.route("/me").get(verifyJWT, (req, res) => {
  res.status(200).json(
    new resHandler(200, { user: req.user }, "User fetched successfully")
  );
});

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update").put(verifyJWT, updateUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
