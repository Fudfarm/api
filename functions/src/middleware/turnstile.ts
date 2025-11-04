import { NextFunction, Request, Response } from "express";
import { handleError } from "../function/error";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Middleware to verify Cloudflare Turnstile captcha token
 * Expects the token in req.body.turnstileToken
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { turnstileToken } = req.body;

    if (!turnstileToken) {
      return res.status(400).json({
        message: "Captcha token is required",
      });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error("TURNSTILE_SECRET_KEY is not configured");
      return res.status(500).json({
        message: "Captcha service not configured",
      });
    }

    // Verify the token with Cloudflare
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", turnstileToken);

    // Optional: Add remote IP for additional validation
    const remoteIp = req.ip || req.socket.remoteAddress;
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const result: TurnstileResponse = await verifyResponse.json();

    if (!result.success) {
      console.error("Turnstile verification failed:", result["error-codes"]);
      return res.status(400).json({
        message: "Invalid captcha token",
        details: result["error-codes"],
      });
    }

    // Verification successful, proceed to next middleware
    next();
    return;
  } catch (error: any) {
    return handleError(error, res, "Captcha verification failed");
  }
};
