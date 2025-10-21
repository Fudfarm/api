import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { ShopLocation } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerShopLocationList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const shopLocation = await ShopLocation.find({ recordID: id }).lean();
    if (!shopLocation || shopLocation.length === 0)
      return res.status(404).json({ message: "Farmer shop location not found" });

    return res.status(200).json({
      message: "Shop location retrieved",
      data: {
        userId: id,
        shops: shopLocation.map((location) => ({
          shopId: location._id,
          state: location.state,
          lga: location.lga,
          town: location.town,
          district: location.district,
          landmark: location.landmark,
          goodsCount: location.goodsCount,
          verified: location.verified,
          createdAt: location.createdAt
            ? formatDateToShort(location.createdAt.toISOString(), { includeTime: true })
            : undefined,
          updatedAt: location.updatedAt
            ? formatDateToShort(location.updatedAt.toISOString(), { includeTime: true })
            : undefined,
        })),
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving shop location");
  }
};
