import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { ShopItems } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerShopItemList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    if (!shopId) return res.status(400).json({ message: "Shop id is required" });

    const shopItems = await ShopItems.find({ shopLocationID: shopId }).lean();
    if (!shopItems || shopItems.length === 0)
      return res.status(404).json({ message: "Farmer shop items not found" });

    return res.status(200).json({
      message: "Shop items retrieved",
      data: {
        recordId: shopItems[0].recordID,
        shopId,
        items: await Promise.all(shopItems.map((item) => ShopItemsResponse(item))),
        businessType: await farmerBusinessType(shopItems[0].recordID), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving shop location");
  }
};

/**
 * Format shop item response
 * @param {any} item - Shop item document
 * @return {Promise<any>} Formatted shop item response
 */
export async function ShopItemsResponse(item: any): Promise<any> {
  return {
    id: item._id,
    item: item.item,
    quantity: item.quantity,
    category: item.category,
    verified: item.verified,
    createdAt: item.createdAt
      ? formatDateToShort(item.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: item.updatedAt
      ? formatDateToShort(item.updatedAt.toISOString(), { includeTime: true })
      : undefined,
  };
}
