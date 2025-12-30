import crypto from "crypto";

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");
