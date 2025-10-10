import { Response } from "express";

/**
 * Sanitizes error messages to remove sensitive database information
 * @param {any} error The raw error object
 * @return {string} A sanitized error message safe for client consumption
 */
function sanitizeErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred";

  let errorMessage = error.message || error.toString() || "An unexpected error occurred";

  // Remove MongoDB/Mongoose specific information
  const sensitivePatterns = [
    // Database connection strings
    /mongodb:\/\/[^\s]+/gi,
    /mongodb\+srv:\/\/[^\s]+/gi,

    // Database and collection names
    /database\s+[`"']?[\w-]+[`"']?/gi,
    /collection\s+[`"']?[\w-]+[`"']?/gi,
    /Collection\s+[`"']?[\w-]+[`"']?/gi,

    // MongoDB error codes and paths
    /E11000\s+duplicate\s+key\s+error\s+collection:\s*[\w.-]+/gi,
    /index:\s*[\w.-]+\.\$[\w_]+/gi,
    /dup\s+key:\s*\{[^}]+\}/gi,

    // Mongoose model paths
    /model\s+[`"']?[\w-]+[`"']?/gi,
    /Model\s+[`"']?[\w-]+[`"']?/gi,

    // File paths that might expose system structure
    /\/[\w/.-]*node_modules[\w/.-]*/gi,
    /\/[\w/.-]*src[\w/.-]*\.ts/gi,
    /\/[\w/.-]*dist[\w/.-]*\.js/gi,

    // IP addresses and ports
    /\b(?:\d{1,3}\.){3}\d{1,3}:\d+\b/gi,
    /localhost:\d+/gi,

    // Stack trace line references
    /at\s+[\w$./:-]+\s+\([^)]+\)/gi,
  ];

  // Replace sensitive information with generic messages
  sensitivePatterns.forEach((pattern) => {
    errorMessage = errorMessage.replace(pattern, "[REDACTED]");
  });

  // Handle specific MongoDB error types with user-friendly messages
  if (errorMessage.includes("E11000") || errorMessage.includes("duplicate key")) {
    return "This record already exists in the system";
  }

  if (errorMessage.includes("ValidationError")) {
    return "The provided data does not meet the required format";
  }

  if (errorMessage.includes("CastError")) {
    return "Invalid data format provided";
  }

  if (errorMessage.includes("MongoTimeoutError") || errorMessage.includes("timeout")) {
    return "Request timed out. Please try again";
  }

  if (errorMessage.includes("MongoNetworkError") || errorMessage.includes("connection")) {
    return "Database connection error. Please try again later";
  }

  // Remove any remaining technical jargon
  const technicalTerms = [
    /mongodb/gi,
    /mongoose/gi,
    /\[REDACTED\]/gi,
  ];

  technicalTerms.forEach((term) => {
    errorMessage = errorMessage.replace(term, "");
  });

  // Clean up extra spaces and return
  errorMessage = errorMessage.replace(/\s+/g, " ").trim();

  // If the message is empty or too technical, return a generic message
  if (!errorMessage || errorMessage.length < 10) {
    return "An error occurred while processing your request";
  }

  return errorMessage;
}

/**
 * Handles errors that occur during the request lifecycle with security sanitization.
 * @param {any} error The error object.
 * @param {Response} res The Express response object.
 * @param {string} message A custom error message to return in the response.
 * @return {Response} A JSON response with the sanitized error details.
 */
export function handleError(
  error: any,
  res: Response,
  message: string
): Response {
  // Log the full error for debugging (server-side only)
  console.error(`${message}:`, error);

  // Return sanitized error to client
  const sanitizedError = sanitizeErrorMessage(error);

  return res.status(500).json({
    message,
    error: sanitizedError,
  });
}
