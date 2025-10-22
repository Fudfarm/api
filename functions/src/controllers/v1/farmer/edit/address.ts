import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Address } from "../../../../models/v1/farmer";
import { AddressResponse } from "../details/address";

export const editFarmerAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const address = await Address.findOneAndUpdate({ recordID: id }, { $set: {
      resState: data.resState,
      resLga: data.resLga,
      resTown: data.resTown,
      resDistrict: data.resDistrict,
      resStreet: data.resStreet,
      resLandmark: data.resLandmark,
      resHouseNumber: data.resHouseNumber,
      resHouseName: data.resHouseName,
      resFloorNumber: data.resFloorNumber,
      resFlatRoom: data.resFlatRoom,

      permState: data.permState,
      permLga: data.permLga,
      permTown: data.permTown,
      permDistrict: data.permDistrict,
      permStreet: data.permStreet,
      permLandmark: data.permLandmark,
      permHouseNumber: data.permHouseNumber,
      permHouseName: data.permHouseName,
      permFloorNumber: data.permFloorNumber,
      permFlatRoom: data.permFlatRoom,
    } }, { new: true }).lean();
    if (!address) return res.status(404).json({ message: "Address not found" });

    return res.status(200).json({
      message: "Address updated",
      data: await AddressResponse(address),
    });
  } catch (error) {
    return handleError(error, res, "Error updating address");
  }
};
