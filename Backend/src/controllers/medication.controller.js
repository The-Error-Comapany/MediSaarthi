import Medication from "../DataModels/medication.model.js";
import DoseLog from "../DataModels/doselog.model.js";
import asyncCreator from "../utils/aysncCreator.js";
import {
  getValidAccessToken,
  createMedicineEvents,
  deleteMedicineEvents,
} from "../controllers/calendar.controller.js";
import { sendEmail } from "../utils/mailer.js";

export const createMedication = asyncCreator(async (req, res) => {
  try {
    const {
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      description,
      user,
      userEmail,
    } = req.body;
    if (!user)
      return res.status(400).json({ success: false, message: "User ID required" });

    if (!Array.isArray(times) || times.length === 0)
      return res.status(400).json({ success: false, message: "Times required" });
    const newMed = await Medication.create({
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      description,
      user,
    });
    if (["daily", "weekly"].includes(frequency)) {
      const start = new Date(startDate || new Date());
      const end = new Date(endDate || start);
      const gap = frequency === "weekly" ? 7 : 1;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + gap)) {
        const dateOnly = new Date(d);
        dateOnly.setHours(0, 0, 0, 0);

        for (const time of times) {
          await DoseLog.findOneAndUpdate(
            {
              user,
              medicationId: newMed._id,
              date: dateOnly,
              time,
            },
            {
              $setOnInsert: { status: "pending" },
            },
            {
              upsert: true,
              runValidators: true,
            }
          );
        }
      }
    }
    const accessToken = await getValidAccessToken();
    let createdEvents = [];

    if (accessToken) {
      createdEvents = await createMedicineEvents({
        accessToken,
        name,
        dosage,
        description,
        times,
        startDate,
        endDate,
      });
    }

    newMed.googleEventIds = createdEvents;
    await newMed.save();

    res.status(201).json({ success: true, data: newMed });
  } catch (err) {
    console.error("Add medication error:", err);
    res.status(500).json({ success: false, message: "Failed to add medication" });
  }
});

export const getMedications = asyncCreator(async (req, res) => {
  try {
    const meds = await Medication.find({ user: req.user._id });
    res.status(200).json({ success: true, data: meds });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch medications" });
  }
});

export const updateMedication = asyncCreator(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, frequency, times, startDate, endDate, description, user, userEmail } = req.body;

    const med = await Medication.findById(id);
    if (!med)
      return res.status(404).json({ success: false, message: "Medication not found" });

    const accessToken = await getValidAccessToken();

    let newEventIds = [];

    if (accessToken) {
      await deleteMedicineEvents(accessToken, med.googleEventIds);

      newEventIds = await createMedicineEvents({
        accessToken,
        name,
        dosage,
        description,
        times,
        startDate,
        endDate,
      });
    }

    Object.assign(med, {
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      description,
      user,
      googleEventIds: newEventIds,
    });

    await med.save();

    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: `Medication Updated: ${name}`,
        text: `Your medication "${name}" (${dosage}) has been updated.`,
      });
    }

    res.status(200).json({ success: true, data: med });
  } catch (err) {
    console.error("Update medication error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update medication" });
  }
});

export const deleteMedication = asyncCreator(async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med)
      return res.status(404).json({ success: false, message: "Not found" });

    const accessToken = await getValidAccessToken();

    if (accessToken) {
      await deleteMedicineEvents(accessToken, med.googleEventIds);
    }

    await Medication.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete medication error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete medication" });
  }
});