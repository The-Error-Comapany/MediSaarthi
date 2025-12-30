import { resHandler } from "../utils/resHandler.js";

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const errors = err.errors || [];

  // Construct a consistent response using your resHandler
  const response = new resHandler(statusCode, null, message);
  response.success = false;
  response.errors = errors;

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  // Log error on server for debugging
  console.error(`[${statusCode}] ${message}`);

  return res.status(statusCode).json(response);
};

export default globalErrorHandler;
