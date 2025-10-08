import { Response } from "express";
import User from "../../../models/v1/User";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { fields } from "./onboard";

export const userEdit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = fields(req);

    // Ensure user exists
    const exists = await User.exists({ _id: data.id });
    if (!exists) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Prevent duplicate email (excluding current user)
    const emailExists = await User.exists({
      email: data.email,
      _id: { $ne: data.id },
    });
    if (emailExists) {
      return res.status(409).json({
        message: "Another user with this email already exists.",
      });
    }

    // Update user fields
    await User.updateOne(
      { _id: data.id },
      {
        surname: data.surname,
        firstname: data.firstname,
        othername: data.othername,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        birthdate: data.birthdate,
        email: data.email,
        phone: data.phone,
        otherInfo: data.otherInfo,
        role: data.role,
        updatedAt: new Date(),
        updatedBy: req.user.id,
      }
    );

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: data.id,
        surname: data.surname,
        firstname: data.firstname,
        othername: data.othername,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        birthdate: data.birthdate,
        email: data.email,
        phone: data.phone,
        otherInfo: data.otherInfo,
        role: data.role,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error updating user", error });
  }
};
