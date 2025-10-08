import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";

export const updateNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { allowNotifications } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (typeof allowNotifications !== "boolean") {
      return res.status(400).json({
        message: "It must be a boolean must be a boolean value (true or false).",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { allowNotifications },
      { new: true, select: "id firstname surname allowNotifications" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Notification preference updated successfully.",
      data: {
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        allowNotifications: user.allowNotifications,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error updating notification preference");
  }
};
