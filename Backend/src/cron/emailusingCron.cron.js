import cron from "node-cron";
import User from "../DataModels/user.model.js";
import Medication from "../DataModels/medication.model.js";
import { DateTime } from "luxon";
import { sendEmail } from '../utils/mailer.js';

cron.schedule("* * * * *", async () => {
  try {
    const now = DateTime.now().setZone("Asia/Kolkata");
    console.log(`[Cron] Checking reminders at ${now.toISO()}`);

    const meds = await Medication.find({ startDate: { $lte: now.toJSDate() } });

    for (const med of meds) {
      const user = await User.findById(med.user);
      if (!user?.email) continue;

      med.times.forEach(async (time) => {
        const medDateTime = DateTime.fromISO(`${now.toISODate()}T${time}`, { zone: "Asia/Kolkata" });
        const diffMinutes = Math.round(medDateTime.diff(now, "minutes").minutes);

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
          }
        }
      });
    }
  } catch (err) {
    console.error("Error in medication reminder cron:", err);
  }
});

