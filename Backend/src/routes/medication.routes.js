import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { getMedications,createMedication,updateMedication,deleteMedication } from "../controllers/medication.controller.js";

const router = Router();

// GET all medications
router.get("/", verifyJWT,getMedications);

// ADD medication
router.post("/", verifyJWT,createMedication);

// UPDATE medication
router.put("/:id", verifyJWT,updateMedication);

// DELETE medication
router.delete("/:id", verifyJWT,deleteMedication);

export default router;
