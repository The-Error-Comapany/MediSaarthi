import cron from "node-cron";
import User from "../DataModels/user.model.js";

cron.schedule("0 */6 * * *", async () => {
  try {
    const expiry = Date.now() - 24 * 60 * 60 * 1000;

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: expiry },
    });

    console.log(
      `[CRON] Deleted ${result.deletedCount} unverified users`
    );
  } catch (error) {
    console.error("[CRON] Cleanup failed:", error);
  }
});
