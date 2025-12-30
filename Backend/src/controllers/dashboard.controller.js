import Medication from "../DataModels/medication.model.js";
import DoseLog from "../DataModels/doselog.model.js";
import asyncCreator from "../utils/aysncCreator.js";
import { ok } from "../utils/resHandler.js";

export const getDashboardData = asyncCreator(async (req, res) => {
  const medications = await Medication.find({ user: req.user._id });
  const logs = await DoseLog.find({ user: req.user._id });

  const total = logs.length;
  const taken = logs.filter((log) => log.status === "taken").length;
  const missed = logs.filter((log) => log.status === "missed").length;

  const adherenceRate = total > 0 ? ((taken / total) * 100).toFixed(2) : 0;

  const summary = {
    totalMedications: medications.length,
    totalLogs: total,
    taken,
    missed,
    adherenceRate,
  };

  return ok(res, summary, "Dashboard data fetched successfully");
});
