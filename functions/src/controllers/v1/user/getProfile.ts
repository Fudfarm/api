import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";
import { ReturnedData } from "../auth/login";

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User profile retrieved successfully.",
      data: await ReturnedData(user),
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving user profile");
  }
};
