import { Router } from "express";
import { chatHandler } from "../controllers/chatBot.controller.js";

const router = Router();

router.post("/", chatHandler);

export default router;
