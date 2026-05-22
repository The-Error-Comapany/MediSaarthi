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
import cronRoutes from "./routes/cron.routes.js";


const app = express();

app.use(express.json());
app.use(urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Parse comma-separated FRONTEND_URL list, e.g.:
// FRONTEND_URL=https://medisaarthi.vercel.app,https://medisaarthi-six.vercel.app
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Allow any Vercel preview URL for this project
      const isVercelPreview = /^https:\/\/medisaarthi.*\.vercel\.app$/.test(origin);

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/medications", medicationRouter);
app.use("/api/v1/chat", chatBotRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/doselog", doseLogRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/prediction", predictionRoutes);
app.use("/api/v1/cron", cronRoutes);

app.use(globalErrorHandler);

export default app;
