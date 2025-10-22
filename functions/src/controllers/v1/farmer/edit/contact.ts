import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Contact } from "../../../../models/v1/farmer";
import { ContactResponse } from "../details/contact";

export const editFarmerContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const contact = await Contact.findOneAndUpdate({ recordID: id }, { $set: {
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      website: data.website,
      promoMeans1: data.promoMeans1,
      promoMeans2: data.promoMeans2,
      others: data.others,
    } }, { new: true }).lean();

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    return res.status(200).json({
      message: "Contact updated",
      data: await ContactResponse(contact),
    },);
  } catch (error) {
    return handleError(error, res, "Error updating contact");
  }
};
