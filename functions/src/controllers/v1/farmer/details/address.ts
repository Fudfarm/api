import { Response } from "express";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { formatDateToShort } from "../../../../function/function3";
import { handleError } from "../../../../function/error";
import { Address } from "../../../../models/v1/farmer";

export const getFarmerAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const address = await Address.findOne({ recordID: id }).lean();
    if (!address) return res.status(404).json({ message: "Farmer address not found" });

    return res.status(200).json({
      message: "Address retrieved",
      data: {
        userId: address.recordID,
        resState: address.resState,
        resLga: address.resLga,
        resTown: address.resTown,
        resDistrict: address.resDistrict,
        resStreet: address.resStreet,
        resLandmark: address.resLandmark,
        resHouseNumber: address.resHouseNumber,
        resHouseName: address.resHouseName,
        resFloorNumber: address.resFloorNumber,
        resFlatRoom: address.resFlatRoom,
        permState: address.permState,
        permLga: address.permLga,
        permTown: address.permTown,
        permDistrict: address.permDistrict,
        permStreet: address.permStreet,
        permLandmark: address.permLandmark,
        permHouseNumber: address.permHouseNumber,
        permHouseName: address.permHouseName,
        permFloorNumber: address.permFloorNumber,
        permFlatRoom: address.permFlatRoom,
        createdAt: address.createdAt
          ? formatDateToShort(address.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: address.updatedAt
          ? formatDateToShort(address.updatedAt.toISOString(), { includeTime: true })
          : undefined,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving address");
  }
};
