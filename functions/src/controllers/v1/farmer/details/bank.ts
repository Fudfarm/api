import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Bank } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerBank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const bank = await Bank.findOne({ recordID: id }).lean();
    if (!bank) return res.status(404).json({ message: "Farmer bank details not found" });

    return res.status(200).json({
      message: "Bank details retrieved",
      data: await BankResponse(bank),
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving bank details");
  }
};

/**
 * Format bank response for frontend consumption.
 * @param {any} bank - The bank document from the database.
 * @return {Promise<object>} Formatted bank response object.
 */
export async function BankResponse(bank: any): Promise<object> {
  return {
    userId: bank.recordID,
    accountName: bank.accountName,
    accountNumber: bank.accountNumber,
    bank: bank.bank,
    createdAt: bank.createdAt
      ? formatDateToShort(bank.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: bank.updatedAt
      ? formatDateToShort(bank.updatedAt.toISOString(), { includeTime: true })
      : undefined,
    businessType: await farmerBusinessType(bank.recordID), // determine buttons shown in frontend
  };
}
