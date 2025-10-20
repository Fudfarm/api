import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Contact } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const contact = await Contact.findOne({ recordID: id }).lean();
    if (!contact) return res.status(404).json({ message: "Farmer contact not found" });

    return res.status(200).json({
      message: "Contact retrieved",
      data: {
        userId: contact.recordID,
        phone1: contact.phone1,
        phone2: contact.phone2,
        email: contact.email,
        website: contact.website,
        promoMeans1: contact.promoMeans1,
        promoMeans2: contact.promoMeans2,
        others: contact.others,
        createdAt: contact.createdAt
          ? formatDateToShort(contact.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: contact.updatedAt
          ? formatDateToShort(contact.updatedAt.toISOString(), { includeTime: true })
          : undefined,
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving contact");
  }
};
