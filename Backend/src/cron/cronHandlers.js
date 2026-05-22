import User from "../DataModels/user.model.js";
import Medication from "../DataModels/medication.model.js";
import DoseLog from "../DataModels/doselog.model.js";
import { DateTime } from "luxon";
import { sendEmail } from "../utils/mailer.js";

/**
 * Sends email medication reminders for doses due in the next 0–5 minutes.
 * Called by Vercel Cron every minute via GET /api/v1/cron/medication-reminders
 */
export const sendMedicationReminders = async (req, res) => {
  try {
    const now = DateTime.now().setZone("Asia/Kolkata");
    console.log(`[Cron] Checking reminders at ${now.toISO()}`);

    const meds = await Medication.find({ startDate: { $lte: now.toJSDate() } });
    let sent = 0;

    for (const med of meds) {
      const user = await User.findById(med.user);
      if (!user?.email) continue;

      for (const time of med.times) {
        const medDateTime = DateTime.fromISO(`${now.toISODate()}T${time}`, {
          zone: "Asia/Kolkata",
        });
        const diffMinutes = Math.round(
          medDateTime.diff(now, "minutes").minutes
        );

        if (diffMinutes >= 0 && diffMinutes <= 5) {
          med.sentReminders = med.sentReminders || [];
          if (!med.sentReminders.includes(time)) {
            await sendEmail({
              to: user.email,
              subject: `💊 Upcoming Medication Reminder: ${med.name}`,
              text: `Your medication "${med.name}" (${med.dosage}) is scheduled in ${diffMinutes} minutes!`,
            });
            console.log(`[Reminder] Sent ${med.name} to ${user.email}`);
            med.sentReminders.push(time);
            await med.save();
            sent++;
          }
        }
      }
    }

    return res.json({ ok: true, sent });
  } catch (err) {
    console.error("Error in medication reminder cron:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * Deletes unverified users older than 24 hours.
 * Called by Vercel Cron every 6 hours via GET /api/v1/cron/cleanup-users
 */
export const cleanupUnverifiedUsers = async (req, res) => {
  try {
    const expiry = Date.now() - 24 * 60 * 60 * 1000;
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: expiry },
    });
    console.log(`[CRON] Deleted ${result.deletedCount} unverified users`);
    return res.json({ ok: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("[CRON] Cleanup failed:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Marks pending/notified doses from previous days as missed.
 * Called by Vercel Cron daily at 00:05 via GET /api/v1/cron/mark-missed-doses
 */
export const markMissedDoses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await DoseLog.updateMany(
      {
        date: { $lt: today },
        status: { $in: ["pending", "notified"] },
      },
      { $set: { status: "missed" } }
    );

    console.log(`Missed doses updated: ${result.modifiedCount}`);
    return res.json({ ok: true, updated: result.modifiedCount });
  } catch (err) {
    console.error("Error marking missed doses:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
