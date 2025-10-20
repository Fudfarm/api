import { Response } from "express";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { formatDateToShort } from "../../../../function/function3";
import { handleError } from "../../../../function/error";
import { ShopLocation } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerShopLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const shopLocation = await ShopLocation.findOne({ recordID: id }).lean();
    if (!shopLocation) return res.status(404).json({ message: "Farmer shop location not found" });

    return res.status(200).json({
      message: "Shop location retrieved",
      data: {
        userId: shopLocation.recordID,
        state: shopLocation.state,
        lga: shopLocation.lga,
        town: shopLocation.town,
        district: shopLocation.district,
        landmark: shopLocation.landmark,
        goodsCount: shopLocation.goodsCount,
        verified: shopLocation.verified,
        createdAt: shopLocation.createdAt
          ? formatDateToShort(shopLocation.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: shopLocation.updatedAt
          ? formatDateToShort(shopLocation.updatedAt.toISOString(), { includeTime: true })
          : undefined,
        businessType: await farmerBusinessType(id), // determin buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving shop location");
  }
};
