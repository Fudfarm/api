import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { ShopLocation } from "../../../../models/v1/farmer";
import User from "../../../../models/v1/User";
import { ShopLocationResponse } from "../details/shop_location";

export const addFarmerShopLocation = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: "User id is required" });

    // check if user exists
    const user = await User.findById(userId).select("_id").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const data = req.body;

    const shopDoc = new ShopLocation({
      recordID: userId,
      state: data.state,
      lga: data.lga,
      town: data.town,
      district: data.district,
      landmark: data.landmark,
      verified: data.verified ?? false,
    });

    const saved = await shopDoc.save();

    return res.status(201).json({
      message: "Shop created",
      data: await ShopLocationResponse(saved),
    });
  } catch (error) {
    return handleError(error, res, "Error creating shop");
  }
};

export const editFarmerShopLocation = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { shopId } = req.params;
    if (!shopId)
      return res.status(400).json({ message: "Shop id is required" });

    const data = req.body;

    const shop = await ShopLocation.findByIdAndUpdate(
      shopId,
      {
        $set: {
          state: data.state,
          lga: data.lga,
          town: data.town,
          district: data.district,
          landmark: data.landmark,
          verified: data.verified,
        },
      },
      { new: true },
    ).lean();
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    return res.status(200).json({
      message: "Shop updated",
      data: await ShopLocationResponse(shop),
    });
  } catch (error) {
    return handleError(error, res, "Error updating shop");
  }
};

export const destroyFarmerShopLocation = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { shopId } = req.params;
    if (!shopId)
      return res.status(400).json({ message: "Shop id is required" });

    const shop = await ShopLocation.findByIdAndDelete(shopId).lean();
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    return res.status(200).json({
      message: "Shop deleted",
      data: await ShopLocationResponse(shop),
    });
  } catch (error) {
    return handleError(error, res, "Error deleting shop");
  }
};
