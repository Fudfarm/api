import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../utils/token";
import User from "../models/v1/User";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const AuthGuard = (allowedRoles: string[] = []): RequestHandler => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      // 1. Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // 2. Or from cookies
      if (!token && req.cookies?.authorization) {
        token = req.cookies.authorization;
      }

      // 3. No token
      if (!token) {
        return res
          .status(401)
          .json({ message: "Access denied. No token provided." });
      }

      // 4. Verify token
      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      // 5. Fetch user role from DB
      const user = await User.findById(decoded.id).select("role email");
      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      // 6. Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log("User role:", user.role);
        console.log("Allowed roles:", allowedRoles);
        console.log("email:", user.email);
        console.log("User ID:", user.id);
        return res
          .status(403)
          .json({ message: "Access forbidden. Insufficient permissions." });
      }

      // 7. Attach user to request
      req.user = { id: decoded.id, role: user.role, email: user.email };

      next();
      return;
    } catch (err) {
      console.error("AuthGuard error:", err);
      res.status(401).json({ message: "Invalid or expired token." });
      return;
    }
  };
};
