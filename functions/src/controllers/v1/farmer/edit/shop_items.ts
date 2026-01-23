import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { ShopItems, ShopLocation } from "../../../../models/v1/farmer";
import User from "../../../../models/v1/User";
import { ShopItemsResponse } from "../details/shop_items";

export const editFarmerShopItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { itemId } = req.params;
    if (!itemId)
      return res.status(400).json({ message: "Item id is required" });

    const data = req.body;

    const item = await ShopItems.findByIdAndUpdate(
      itemId,
      {
        $set: {
          item: data.item,
          quantity: data.quantity,
          category: data.category,
          verified: data.verified,
          unitId: data.unitId,
        },
      },
      { new: true },
    ).lean();
    if (!item) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({
      message: "Item updated",
      data: await ShopItemsResponse(item),
    });
  } catch (error) {
    return handleError(error, res, "Error updating item");
  }
};

export const addFarmerShopItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { shopId } = req.params;
    if (!shopId)
      return res.status(400).json({ message: "Shop id is required" });

    const shop = await ShopLocation.findById(shopId)
      .select("_id recordID")
      .lean();
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const user = await User.findById(shop.recordID).select("_id").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const data = req.body;

    const itemDoc = new ShopItems({
      shopLocationID: shopId,
      recordID: shop.recordID,
      item: data.item,
      quantity: data.quantity,
      category: data.category,
      verified: data.verified ?? false,
      unitId: data.unitId,
    });

    const saved = await itemDoc.save();

    return res.status(201).json({
      message: "Shop item created",
      data: await ShopItemsResponse(saved),
    });
  } catch (error) {
    return handleError(error, res, "Error creating shop item");
  }
};

export const destroyFarmerShopItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { itemId } = req.params;
    if (!itemId)
      return res.status(400).json({ message: "Item id is required" });

    const deleted = await ShopItems.findByIdAndDelete(itemId).lean();
    if (!deleted) return res.status(404).json({ message: "Item not found" });

    return res.status(200).json({
      message: "Item deleted",
      data: await ShopItemsResponse(deleted),
    });
  } catch (error) {
    return handleError(error, res, "Error deleting item");
  }
};
