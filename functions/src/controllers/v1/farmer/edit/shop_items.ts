import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { ShopItems } from "../../../../models/v1/farmer";

export const editFarmerShopItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    if (!itemId) return res.status(400).json({ message: "Item id is required" });

    const data = req.body;

    const item = await ShopItems.findByIdAndUpdate(itemId, { $set: {
      item: data.item,
      quantity: data.quantity,
      category: data.category,
      verified: data.verified,
    } }, { new: true }).lean();
    if (!item) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({ message: "Item updated", data: item });
  } catch (error) {
    return handleError(error, res, "Error updating item");
  }
};
