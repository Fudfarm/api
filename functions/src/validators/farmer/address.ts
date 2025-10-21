import { z } from "zod";

const nonEmpty = (name: string) =>
  z.string({ required_error: `${name} is required` }).trim().min(1, `${name} is required`);

export const addressSchema = z.object({
  resState: nonEmpty("resState"),
  resLga: nonEmpty("resLga"),
  resTown: nonEmpty("resTown"),
  resDistrict: nonEmpty("resDistrict"),
  resStreet: z.string().trim().optional(),
  resLandmark: nonEmpty("resLandmark"),
  resHouseNumber: z.string().trim().optional(),
  resHouseName: z.string().trim().optional(),
  resFloorNumber: z.string().trim().optional(),
  resFlatRoom: z.string().trim().optional(),

  permState: nonEmpty("permState"),
  permLga: nonEmpty("permLga"),
  permTown: nonEmpty("permTown"),
  permDistrict: nonEmpty("permDistrict"),
  permStreet: z.string().trim().optional(),
  permLandmark: nonEmpty("permLandmark"),
  permHouseNumber: z.string().trim().optional(),
  permHouseName: z.string().trim().optional(),
  permFloorNumber: z.string().trim().optional(),
  permFlatRoom: z.string().trim().optional(),
});
