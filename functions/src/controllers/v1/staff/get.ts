import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { cleanStr } from "../../../function/function1";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";

export const staffInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // extract this id staffRouter.get("/onboard/:id", staffInfo);
    const userId = cleanStr(req.params.id);

    const user = await User.findOne({ _id: userId });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const createdByUser = await User.findOne({ _id: user.createdBy });

    return res.status(201).json({
      message: "User retrieved successfully",
      data: {
        id: user.id,
        surname: user.surname,
        firstname: user.firstname,
        othernames: user.othernames,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
        birthdate: user.birthdate,
        email: user.email,
        phone: user.phone,
        otherInfo: user.otherInfo,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        isVerified: user.isVerified,
        createdBy: {
          id: createdByUser?.id,
          surname: createdByUser?.surname,
          firstname: createdByUser?.firstname,
          othernames: createdByUser?.othernames,
          email: createdByUser?.email,
          phone: createdByUser?.phone,
          status: createdByUser?.status,
        },
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving user data");
  }
};
