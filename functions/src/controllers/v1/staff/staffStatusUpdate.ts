import { Response } from "express";
import { handleError } from "../../../function/error";
import { cleanStr } from "../../../function/function1";
import { formatDateToShort } from "../../../function/function3";
import { IUserStatus } from "../../../interface/user";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

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

    if (id == req.user?.id) {
      return res.status(400).json({ message: "You cannot update your own status to avoid locking yourself out." });
    }

    // count the account with admin role and active status
    const activeAdminCount = await User.countDocuments({ role: "Admin", status: "Active" });

    // If the user is trying to deactivate an admin account, ensure at least one active admin remains
    const userToUpdate = await User.findById(cleanId);
    if (userToUpdate?.role === "Admin" && userToUpdate.status === "Active" && cleanStatus !== "Active") {
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: "At least one active admin account must be maintained." });
      }
    }

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
