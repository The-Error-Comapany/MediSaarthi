import { Router } from "express";
import {
  sendMedicationReminders,
  cleanupUnverifiedUsers,
  markMissedDoses,
} from "../cron/cronHandlers.js";

const router = Router();

/**
 * All cron endpoints are protected with a secret header so only
 * Vercel Cron (or you) can call them — not the public internet.
 */
const cronAuth = (req, res, next) => {
  const secret = req.headers["x-cron-secret"];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Vercel Cron: every 1 minute
router.get("/medication-reminders", cronAuth, sendMedicationReminders);

// Vercel Cron: every 6 hours
router.get("/cleanup-users", cronAuth, cleanupUnverifiedUsers);

// Vercel Cron: daily at 00:05 UTC
router.get("/mark-missed-doses", cronAuth, markMissedDoses);

export default router;
