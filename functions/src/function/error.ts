import { Response } from "express";

/**
 * Handles errors that occur during the request lifecycle.
 * @param {any} error The error object.
 * @param {Response} res The Express response object.
 * @param {string} message A custom error message to return in the response.
 * @return {Response} A JSON response with the error details.
 */
export function handleError(
  error: any,
  res: Response,
  message: string
): Response {
  console.error(`${message}:`, error);
  return res.status(500).json({ message, error });
}
