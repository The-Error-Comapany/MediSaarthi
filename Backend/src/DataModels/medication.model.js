import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String },
  times: { type: [String], required: true },
  frequency: { type: String, default: "daily" },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  active: { type: Boolean, default: true },
  googleEventIds: [{type: String}],
  createdAt: { type: Date, default: Date.now },
    sentReminders: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model("Medication", medicationSchema);
