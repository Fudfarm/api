import { Request, Response } from "express";
import { getOrCreateSystemInfo } from "./helper";
import { handleError } from "../../../function/error";

// 🟩 GET CONTACT INFO
export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const info = await getOrCreateSystemInfo();
    const data = {
      phone1: info.phone1,
      phone2: info.phone2,
      whatsappPhone: info.whatsappPhone,
      contactEmail: info.contactEmail,
    };
    return res.status(200).json({
      message: "Contact information retrieved successfully",
      data,
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving contact info");
  }
};

// 🟦 UPDATE CONTACT INFO
export const updateContactInfo = async (req: Request, res: Response) => {
  try {
    const { phone1, phone2, whatsappPhone, contactEmail } = req.body;

    const info = await getOrCreateSystemInfo();
    Object.assign(info, { phone1, phone2, whatsappPhone, contactEmail });
    await info.save();

    return res.status(200).json({
      message: "Contact information updated successfully",
      data: {
        phone1: info.phone1,
        phone2: info.phone2,
        whatsappPhone: info.whatsappPhone,
        contactEmail: info.contactEmail,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error updating contact info");
  }
};
