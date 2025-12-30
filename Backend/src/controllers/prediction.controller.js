import Medication from "../DataModels/medication.model.js";
import { predictDoseRisk } from "../utils/predictDoseRisk.js";

export const getAiSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    const medications = await Medication.find({
      user: userId,
      active: true,
    });

    let high = 0;
    let medium = 0;

    for (let med of medications) {
      for (let time of med.times) {
        const prediction = await predictDoseRisk({
          userId,
          medicationId: med._id,
          time,
        });

        if (prediction.riskLevel === "high") high++;
        if (prediction.riskLevel === "medium") medium++;
      }
    }

    let overallRisk = "low";
    if (high > 0) overallRisk = "high";
    else if (medium > 0) overallRisk = "medium";

    res.json({
      overallRisk,
      highRiskCount: high,
      mediumRiskCount: medium,
      message:
        high > 0
          ? `You have ${high} high-risk doses today`
          : medium > 0
          ? `You have ${medium} doses at moderate risk`
          : "All doses look on track today",
    });
  } catch (err) {
    res.status(500).json({ message: "AI summary failed" });
  }
};

export const getFullAiReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const medications = await Medication.find({
      user: userId,
      active: true,
    });

    const report = [];

    for (let med of medications) {
      for (let time of med.times) {
        const prediction = await predictDoseRisk({
          userId,
          medicationId: med._id,
          time,
        });

        report.push({
          medication: med.name,
          dosage: med.dosage,
          time,
          ...prediction,
        });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "AI report failed" });
  }
};

export const getDosePrediction = async (req, res) => {
  try {
    const { medicationId, time } = req.params;
    const userId = req.user._id;

    const prediction = await predictDoseRisk({
      userId,
      medicationId,
      time,
    });

    res.status(200).json(prediction);
  } catch (err) {
    res.status(500).json({ message: "Prediction failed" });
  }
};
