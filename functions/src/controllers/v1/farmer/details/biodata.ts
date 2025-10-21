import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { IUser } from "../../../../interface/user";
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
      data: await BiodataResponse(biodata, id),
      // {
      //   id: biodata._id,
      //   surname: biodata.surname,
      //   firstname: biodata.firstname,
      //   othernames: biodata.othernames,
      //   gender: biodata.gender,
      //   maritalStatus: biodata.maritalStatus,
      //   birthdate: biodata.birthdate,
      //   noOfFamily: biodata.noOfFamily,
      //   disease: biodata.disease || undefined,
      //   role: biodata.role,
      //   status: biodata.status,
      //   createdBy: await miniUserInfo({ userId: biodata.createdBy }),
      //   createdAt: biodata.createdAt
      //     ? formatDateToShort(biodata.createdAt.toISOString(), { includeTime: true })
      //     : undefined,
      //   updatedAt: biodata.updatedAt
      //     ? formatDateToShort(biodata.updatedAt.toISOString(), { includeTime: true })
      //     : undefined,
      //   businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      // },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving biodata");
  }
};

/**
 * Get a mini user information.
 * @param {string} userId - The ID of the user whose information is to be fetched
 * @return {object} The mini user information
 */
export const miniUserInfo = async ({
  userId,
}: {
  userId?: string;
}) => {
  try {
    if (!userId)
      return null;

    const user = await User.findById(userId)
      .select("id surname firstname othernames email phone status")
      .lean();

    if (!user)
      return null;

    return {
      id: user._id,
      surname: user.surname,
      firstname: user.firstname,
      othernames: user.othernames,
      email: user.email,
      phone: user.phone,
      status: user.status,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Formats and returns the biodata details for a farmer.
 * @param {IUser} biodata - The full biodata object of the farmer, including all biodata fields.
 * @param {string} userId - The ID of the user requesting the biodata.
 * @return {Promise<object>} Formatted biodata response object with all relevant fields for frontend display.
 */
export async function BiodataResponse(biodata: IUser, userId: string) {
  return {
    id: userId,
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
    createdBy: await miniUserInfo({ userId: biodata.createdBy }),
    createdAt: biodata.createdAt
      ? formatDateToShort(biodata.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: biodata.updatedAt
      ? formatDateToShort(biodata.updatedAt.toISOString(), { includeTime: true })
      : undefined,
    businessType: await farmerBusinessType(userId), // determine buttons shown in frontend
  };
}
