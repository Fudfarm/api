import { Request as ExpressRequest } from "express";

/**
 * Gets the client's IP address from the request.
 * @param {ExpressRequest} req - The Express request object.
 * @return {string} The client's IP address as a string.
 */
export function getClientIp(req: ExpressRequest): string {
  const forwarded = req.headers["x-forwarded-for"];

  let ip: string | undefined;

  if (typeof forwarded === "string") {
    ip = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded)) {
    ip = (forwarded[0] as string).trim();
  } else {
    ip = req.ip;
  }

  if (ip?.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  return ip || "";
}
