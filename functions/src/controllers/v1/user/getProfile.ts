import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
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

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { firstname, surname, othername, phone, maritalStatus, otherInfo } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const update = User.findOneAndUpdate({ _id: userId }, {
      firstname: firstname || user.firstname,
      surname: surname || user.surname,
      othernames: othername || user.othernames,
      phone: phone || user.phone,
      maritalStatus: maritalStatus || user.maritalStatus,
      otherInfo: otherInfo || user.otherInfo,
    });


    if (!update) {
      return res.status(500).json({ message: "Failed to update user profile." });
    }

    return res.status(200).json({
      message: "User profile updated successfully.",
      data: await ReturnedData(user),
    });
  } catch (error) {
    return handleError(error, res, "Error updating user profile ");
  }
};
