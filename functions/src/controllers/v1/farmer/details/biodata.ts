import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import User from "../../../../models/v1/User";
import { farmerBusinessType } from "./business_type";

export const getFarmerBiodata = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const biodata = await User.findById(id).lean();
    if (!biodata) return res.status(404).json({ message: "Farmer biodata not found" });

    return res.status(200).json({
      message: "Biodata retrieved",
      data: {
        id: biodata._id,
        surname: biodata.surname,
        firstname: biodata.firstname,
        othernames: biodata.othernames,
        gender: biodata.gender,
        maritalStatus: biodata.maritalStatus,
        birthdate: biodata.birthdate,
        noOfFamily: biodata.noOfFamily,
        disease: biodata.disease || undefined,
        role: biodata.role,
        status: biodata.status,
        createdBy: await getCreatedBy({ createdBy: biodata.createdBy }),
        createdAt: biodata.createdAt
          ? formatDateToShort(biodata.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: biodata.updatedAt
          ? formatDateToShort(biodata.updatedAt.toISOString(), { includeTime: true })
          : undefined,
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving biodata");
  }
};

/**
 * Get the user who created a given user (createdBy lookup).
 * @param {string} userId - The ID of the user whose creator is to be fetched
 * @param {string} createdBy - (Optional) Directly provide the createdBy ID to fetch the creator
 * @return {object} The createdBy information of the user
 */
export const getCreatedBy = async ({
  userId,
  createdBy,
}: {
  userId?: string;
  createdBy?: string;
}) => {
  try {
    if (!userId && !createdBy)
      return null;

    let creator;

    if (createdBy) {
      creator = await User.findById(createdBy)
        .select("id surname firstname othernames email phone status")
        .lean();
    } else {
      const user = await User.findById(userId).select("createdBy").lean();
      if (!user) return null;

      creator = await User.findById(user.createdBy)
        .select("id surname firstname othernames email phone status")
        .lean();
    }

    if (!creator)
      return null;

    return {
      id: creator._id,
      surname: creator.surname,
      firstname: creator.firstname,
      othernames: creator.othernames,
      email: creator.email,
      phone: creator.phone,
      status: creator.status,
    };
  } catch (error) {
    return null;
  }
};


