import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { ShopLocation } from "../../../../models/v1/farmer";

export const editFarmerShopLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    if (!shopId) return res.status(400).json({ message: "Shop id is required" });

    const data = req.body;

    const shop = await ShopLocation.findByIdAndUpdate(shopId, { $set: {
      state: data.state,
      lga: data.lga,
      town: data.town,
      district: data.district,
      landmark: data.landmark,
    } }, { new: true }).lean();
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    return res.status(200).json({ message: "Shop updated", data: shop });
  } catch (error) {
    return handleError(error, res, "Error updating shop");
  }
};
