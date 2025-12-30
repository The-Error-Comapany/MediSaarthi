import DoseLog from "../DataModels/doselog.model.js";
import Medication from "../DataModels/medication.model.js";

export const predictDoseRisk = async ({ userId, medicationId, time }) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const logs = await DoseLog.find({
    user: userId,
    medicationId,
    time,
    createdAt: { $gte: since },
  });

  if (!logs.length) {
    return {
      riskScore: 10,
      riskLevel: "low",
      reasons: ["No missed doses recently"],
    };
  }

  const missed = logs.filter(l => l.status === "missed").length;
  const taken = logs.filter(l => l.status === "taken").length;

  const adherenceRate = (taken / logs.length) * 100;

  // streak
  const sorted = logs.sort((a, b) => b.createdAt - a.createdAt);
  let streak = 0;
  for (let log of sorted) {
    if (log.status === "taken") streak++;
    else break;
  }

  const medication = await Medication.findById(medicationId);
  const reminderDependent =
    medication.sentReminders.length > logs.length * 0.7;

  let riskScore = 0;
  let reasons = [];

  if (missed >= 2) {
    riskScore += 35;
    reasons.push(`Missed ${missed} recent doses`);
  }

  if (adherenceRate < 60) {
    riskScore += 30;
    reasons.push(`Low adherence (${Math.round(adherenceRate)}%)`);
  }

  if (streak === 0) {
    riskScore += 15;
    reasons.push("No active streak");
  }

  if (reminderDependent) {
    riskScore += 10;
    reasons.push("Often depends on reminders");
  }

  riskScore = Math.min(95, riskScore);

  let riskLevel = "low";
  if (riskScore >= 70) riskLevel = "high";
  else if (riskScore >= 40) riskLevel = "medium";

  return {
    riskScore,
    riskLevel,
    reasons,
  };
};
