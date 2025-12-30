import mongoose from "mongoose";

const doseLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["pending", "notified", "taken","missed"], default: "pending" },
  },
  { timestamps: true }
);


export default mongoose.model("DoseLog", doseLogSchema);
