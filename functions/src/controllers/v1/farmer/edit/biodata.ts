import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import User from "../../../../models/v1/User";

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

    return res.status(200).json({ message: "Biodata updated", data: {
      id: user._id,
      surname: user.surname,
      firstname: user.firstname,
      othernames: user.othernames,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      birthdate: user.birthdate,
      noOfFamily: user.noOfFamily,
      disease: user.disease,
    }});
  } catch (error) {
    return handleError(error, res, "Error updating biodata");
  }
};
