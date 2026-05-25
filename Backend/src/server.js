import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config();

await connectDB();

// Start server for local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`⚙️ Server is running locally at: http://localhost:${PORT}`);
  });
}

export default app;