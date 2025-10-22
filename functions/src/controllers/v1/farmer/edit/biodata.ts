import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import User from "../../../../models/v1/User";
import { BiodataResponse } from "../details/biodata";

export const editFarmerBiodata = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const user = await User.findByIdAndUpdate(id, { $set: {
      surname: data.surname,
      firstname: data.firstname,
      othernames: data.othernames,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      birthdate: data.birthdate,
      noOfFamily: data.noOfFamily,
      disease: data.disease,
    } }, { new: true }).lean();
    if (!user) return res.status(404).json({ message: "Farmer not found" });

    return res.status(200).json({
      message: "Biodata updated",
      data: await BiodataResponse(user),
    });
  } catch (error) {
    return handleError(error, res, "Error updating biodata");
  }
};
