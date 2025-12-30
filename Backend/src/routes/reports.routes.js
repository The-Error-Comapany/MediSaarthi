import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";

import {
  getWeeklyReport,
  getMonthlyReport,
  getHistoryReport
} from "../controllers/reports.controller.js";

const router = Router();
router.get("/weekly", verifyJWT, getWeeklyReport);

router.get("/monthly", verifyJWT, getMonthlyReport);

router.get("/history", verifyJWT, getHistoryReport);

export default router;