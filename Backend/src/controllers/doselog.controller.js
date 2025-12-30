import DoseLog from "../DataModels/doselog.model.js";
import asyncCreator from "../utils/aysncCreator.js";
import { ok, created } from "../utils/resHandler.js";

export const logDose = async (req, res) => {
  try {
    const { medicationId, date, time, status } = req.body;
    const userId = req.user.id;

    if (!medicationId || !date || !time || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const validStatuses = ["pending", "notified", "taken", "missed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const existing = await DoseLog.findOne({
      user: userId,
      medicationId,
      date: dateOnly,
      time,
    });

    if (existing) {
      existing.status = status;
      await existing.save();
      return ok(res, existing, "Dose log updated successfully");
    }

    const log = await DoseLog.create({
      user: userId,
      medicationId,
      date: dateOnly,
      time,
      status,
    });

    return created(res, log, "Dose logged successfully");
  } catch (err) {
    console.error("Error logging dose:", err);
    res.status(500).json({ message: "Server error while logging dose" });
  }
};


export const getDoseLogs = async (req, res) => {
  try {
    const logs = await DoseLog.find({ user: req.user.id }).sort({ date: -1 });
    return ok(res, logs, "Dose logs fetched successfully");
  } catch (err) {
    console.error("Error fetching dose logs:", err);
    res.status(500).json({ message: "Error fetching logs" });
  }
};

export const getUserStats = asyncCreator(async (req, res) => {
  const userId = req.user._id;

  if (!req.query.start) {
    return res.status(400).json({ message: "start date required" });
  }

  const start = new Date(req.query.start);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

    const logs = await DoseLog.find({
      user: userId,
      date: { $gte: start, $lte: end },
      status: { $in: ["taken", "missed"] }
    }).populate("medicationId", "name") 
    let taken = 0, missed = 0;
    const daily = {}  
    logs.forEach(l => {
      const day = new Date(l.date).toLocaleDateString("en-CA");
      if (!daily[day]) daily[day] = { taken: [], missed: [] } 
      if (l.status === "taken") {
        taken++;
        daily[day].taken.push({ name: l.medicationId?.name, time: l.time });
      } else {
        missed++;
        daily[day].missed.push({ name: l.medicationId?.name, time: l.time });
      }
    });
  const total = taken + missed;

  const adherence = total > 0
    ? Math.round((taken / total) * 100)
    : 0;

  return ok(res, {
    taken,
    missed,
    total,
    adherence,
    start,
    end
  }, "Weekly stats fetched successfully");
});


export const updateDoseLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "notified", "taken", "missed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedLog = await DoseLog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLog) {
      return res.status(404).json({ success: false, message: "Dose log not found" });
    }

    return ok(res, updatedLog, "Dose log status updated successfully");
  } catch (error) {
    console.error("Error updating dose log:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating dose log",
    });
  }
};