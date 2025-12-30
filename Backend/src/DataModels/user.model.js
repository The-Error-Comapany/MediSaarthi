import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: [true, "Password is required"] },
    mobileNumber: { type: String }, 
    dob: { type: Date },
    coverImage: { type: String },
    preferences: {
      emailNotifications: { type: Boolean, default: true }
    },
    refreshToken: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    emailOtp: String,
    emailOtpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.isPassCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshTokens = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export default mongoose.model("User", userSchema);
