import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";

export interface AuthenticatedRequest extends Request {
  user?: any; // Attach user to request after token verification
}

export const AuthGuard = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // 1. Try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. If not found, check cookie
  if (!token && req.cookies && req.cookies.authorization) {
    token = req.cookies.authorization;
  }

  // 3. No token found
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // 4. Verify token
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Optional: you can type `req.user` if desired
    next();
    return;
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
