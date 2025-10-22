import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Bank } from "../../../../models/v1/farmer";
import { BankResponse } from "../details/bank";

export const editFarmerBank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const bank = await Bank.findOneAndUpdate({ recordID: id }, { $set: {
      bank: data.bank,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
    } }, { new: true }).lean();
    if (!bank) return res.status(404).json({ message: "Bank record not found" });

    return res.status(200).json({
      message: "Bank updated",
      data: await BankResponse(bank),
    });
  } catch (error) {
    return handleError(error, res, "Error updating bank");
  }
};
