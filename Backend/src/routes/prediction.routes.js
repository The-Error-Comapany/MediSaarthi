import express from "express";
import {
  getDosePrediction,
  getAiSummary,
  getFullAiReport,
} from "../controllers/prediction.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", verifyJWT, getAiSummary);
router.get("/full-report", verifyJWT, getFullAiReport);
router.get("/:medicationId/:time", verifyJWT, getDosePrediction);

export default router;
