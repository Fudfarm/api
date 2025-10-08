import { Response } from "express";
import { handleError } from "../error";
import User from "../../models/v1/User";

/**
 * Checks if a user exists.
 * @param {Response} res - The response object.
 * @param {string} userId - The ID of the user to check.
 */
export async function IsUserExist(
  res: Response,
  userId: string
): Promise<void> {
  try {
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ message: "User id is required" });
      throw new Error("User id is required");
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      throw new Error("User does not exist");
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking user existence" });
    handleError(error, res, "Error checking user existence");
    throw new Error("Error checking user existence");
  }
}
