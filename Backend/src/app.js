import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from "cors";
import express, { urlencoded } from 'express';

dotenv.config();

import userRoutes from "./routes/user.routes.js";
import doseLogRoutes from "./routes/doselog.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import medicationRouter from "./routes/medication.routes.js";
import chatBotRoutes from "./routes/chatBot.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import predictionRoutes from "./routes/prediction.routes.js";
import globalErrorHandler from './middleware/globalErrorHandler.middleware.js';
import authRoutes from "./routes/auth.routes.js";


const app = express();

app.use(express.json());
app.use(urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/medications", medicationRouter);
app.use("/api/v1/chat", chatBotRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/doselog", doseLogRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/prediction", predictionRoutes);

app.use(globalErrorHandler);

export default app;
