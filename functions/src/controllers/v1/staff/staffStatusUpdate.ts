import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { cleanStr } from "../../../function/function1";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";
import { IUserStatus } from "../../../interface/user";
import { formatDateToShort } from "../../../function/function3";

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate inputs
    if (!id || !status) {
      return res.status(400).json({ message: "User ID and status are required." });
    }

    const cleanId = cleanStr(String(id));
    const cleanStatus = cleanStr(String(status));

    // 2. Find user
    const user = await User.findById(cleanId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Update status
    user.status = cleanStatus as IUserStatus;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "User status updated successfully",
      data: {
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        role: user.role,
        oldStatus: user.status !== cleanStatus ? user.status : undefined,
        newStatus: cleanStatus,
        updatedAt: user.updatedAt ? formatDateToShort(user.updatedAt.toISOString()) : undefined,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error updating user status");
  }
};
