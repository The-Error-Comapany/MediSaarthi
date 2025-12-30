import mongoose from "mongoose";

const calendarTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  scope: { type: String },
  tokenType: { type: String },
  expiryDate: { type: Number },
}, { timestamps: true });

const CalendarToken = mongoose.model("CalendarToken", calendarTokenSchema);
export default CalendarToken;
