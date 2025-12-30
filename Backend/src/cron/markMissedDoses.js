import cron from "node-cron";
import DoseLog from "../DataModels/doselog.model.js";

cron.schedule("5 0 * * *", async () => {
  try {
    console.log("Running missed dose checker");

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const result = await DoseLog.updateMany(
      {
        date: { $lt: today },
        status: { $in: ["pending", "notified"] },
      },
      {
        $set: { status: "missed" },
      }
    );

    console.log(
      `Missed doses updated: ${result.modifiedCount}`
    );
  } catch (err) {
    console.error("Error marking missed doses:", err);
  }
});
