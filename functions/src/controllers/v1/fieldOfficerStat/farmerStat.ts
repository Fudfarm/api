import { Response } from "express";
import { PipelineStage } from "mongoose";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";

import { Address } from "../../../models/v1/farmer/Address";
import { AnimalInfo } from "../../../models/v1/farmer/AnimalInfo";
import { Biodata } from "../../../models/v1/farmer/Biodata";
import { CropInfo } from "../../../models/v1/farmer/CropInfo";
import { FarmInfo } from "../../../models/v1/farmer/FarmInfo";
import { ShopLocation } from "../../../models/v1/farmer/ShopLocation";

const parseDate = (value: any): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const dayEnd = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const ensureIndexes = async () => {
  try {
    await Biodata.collection.createIndex(
      { createdAt: 1 },
      { name: "biodata_createdAt_idx", background: true }
    );
  } catch (err) {
    console.warn("Failed creating biodata index:", err);
  }
};

const farmerDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    ensureIndexes().catch(console.warn);

    const limit = 1000;
    const skip = Math.max(0, Number(req.query.skip) || 0);

    const { fromDate, toDate } = (req.query as any) || req.body || {};

    let start = parseDate(fromDate);
    let end = parseDate(toDate);

    if (start && end && start > end) [start, end] = [end, start];
    if (start) start = dayStart(start);
    if (end) end = dayEnd(end);

    const match: Record<string, any> = {};
    if (start && end) match.createdAt = { $gte: start, $lte: end };
    else if (start) match.createdAt = { $gte: start };
    else if (end) match.createdAt = { $lte: end };

    const format = (d: Date | null) =>
      d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null;

    const yearMs = 31557600000;

    const pipeline: PipelineStage[] = [
      { $match: match },

      {
        $facet: {
          totals: [{ $count: "totalFarmers" }],

          gender: [
            {
              $group: {
                _id: { $ifNull: ["$gender", "Unknown"] },
                count: { $sum: 1 },
              },
            },
            { $project: { _id: 0, gender: "$_id", count: 1 } },
            { $sort: { count: -1 } },
          ],

          ageGroups: [
            {
              $project: {
                age: {
                  $divide: [
                    { $subtract: ["$$NOW", { $toDate: "$birthDate" }] },
                    yearMs,
                  ],
                },
              },
            },
            {
              $bucket: {
                groupBy: "$age",
                boundaries: [0, 18, 26, 36, 46, 61, 150],
                default: "Unknown",
                output: { count: { $sum: 1 } },
              },
            },
            {
              $project: {
                _id: 0,
                group: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$_id", 0] }, then: "0-17" },
                      { case: { $eq: ["$_id", 18] }, then: "18-25" },
                      { case: { $eq: ["$_id", 26] }, then: "26-35" },
                      { case: { $eq: ["$_id", 36] }, then: "36-45" },
                      { case: { $eq: ["$_id", 46] }, then: "46-60" },
                      { case: { $eq: ["$_id", 61] }, then: "60+" },
                    ],
                    default: "Unknown",
                  },
                },
                count: 1,
              },
            },
            { $sort: { group: 1 } },
          ],

          productType: [
            {
              $lookup: {
                from: CropInfo.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "crops",
              },
            },
            {
              $lookup: {
                from: AnimalInfo.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "animals",
              },
            },
            {
              $group: {
                _id: null,
                crop: { $sum: { $cond: [{ $gt: [{ $size: "$crops" }, 0] }, 1, 0] } },
                animal: { $sum: { $cond: [{ $gt: [{ $size: "$animals" }, 0] }, 1, 0] } },
              },
            },
            { $project: { _id: 0 } },
          ],

          cropGroup: [
            {
              $lookup: {
                from: CropInfo.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "crops",
              },
            },
            { $unwind: "$crops" },
            {
              $match: {
                "crops.crop": { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: "$crops.crop",
                count: { $sum: 1 },
              },
            },
            { $project: { _id: 0, crop: "$_id", count: 1 } },
            { $sort: { count: -1 } },
          ],

          animalGroup: [
            {
              $lookup: {
                from: AnimalInfo.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "animals",
              },
            },
            { $unwind: "$animals" },
            {
              $match: {
                "animals.animal": { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: "$animals.animal",
                count: { $sum: 1 },
              },
            },
            { $project: { _id: 0, animal: "$_id", count: 1 } },
            { $sort: { count: -1 } },
          ],

          residential: [
            {
              $lookup: {
                from: Address.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "addr",
              },
            },
            { $unwind: "$addr" },
            {
              $match: {
                "addr.resState": { $nin: [null, ""] },
                "addr.resLga": { $nin: [null, ""] },
                "addr.resTown": { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: {
                  state: "$addr.resState",
                  lga: "$addr.resLga",
                  town: "$addr.resTown",
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                state: "$_id.state",
                lga: "$_id.lga",
                town: "$_id.town",
                count: 1,
              },
            },
            { $sort: { count: -1 } },
          ],

          permanent: [
            {
              $lookup: {
                from: Address.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "addr",
              },
            },
            { $unwind: "$addr" },
            {
              $match: {
                "addr.permState": { $nin: [null, ""] },
                "addr.permLga": { $nin: [null, ""] },
                "addr.permTown": { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: {
                  state: "$addr.permState",
                  lga: "$addr.permLga",
                  town: "$addr.permTown",
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                state: "$_id.state",
                lga: "$_id.lga",
                town: "$_id.town",
                count: 1,
              },
            },
            { $sort: { count: -1 } },
          ],

          farmLocation: [
            {
              $lookup: {
                from: FarmInfo.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "farm",
              },
            },
            { $unwind: "$farm" },
            {
              $match: {
                "farm.state": { $nin: [null, ""] },
                "farm.lga": { $nin: [null, ""] },
                "farm.town": { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: {
                  state: "$farm.state",
                  lga: "$farm.lga",
                  town: "$farm.town",
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                state: "$_id.state",
                lga: "$_id.lga",
                town: "$_id.town",
                count: 1,
              },
            },
            { $sort: { count: -1 } },
          ],

          shopLocation: [
            {
              $lookup: {
                from: ShopLocation.collection.name,
                localField: "_id",
                foreignField: "recordID",
                as: "shop",
              },
            },
            { $unwind: "$shop" },
            {
              $match: {
                "shop.state": { $nin: [null, ""] },
                "shop.lga": { $nin: [null, ""] },
                "shop.town": { $nin: [null, ""] },
              },
            },
            {
              $group: {
                _id: {
                  state: "$shop.state",
                  lga: "$shop.lga",
                  town: "$shop.town",
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                state: "$_id.state",
                lga: "$_id.lga",
                town: "$_id.town",
                count: 1,
              },
            },
            { $sort: { count: -1 } },
          ],
        },
      },
    ];

    const [r] = await Biodata.aggregate(pipeline).exec();

    return res.status(200).json({
      message: "Farmer dashboard statistics retrieved successfully",
      meta: {
        limit,
        skip,
        fromDate: format(start),
        toDate: format(end),
        generatedAt: new Date().toISOString(),
      },
      data: {
        totalFarmers: r?.totals?.[0]?.totalFarmers || 0,
        gender: r?.gender || [],
        ageGroups: r?.ageGroups || [],
        productType: r?.productType?.[0] || { crop: 0, animal: 0 },
        cropGroup: r?.cropGroup || [],
        animalGroup: r?.animalGroup || [],
        location: {
          residential: r?.residential || [],
          permanent: r?.permanent || [],
          farm: r?.farmLocation || [],
          shop: r?.shopLocation || [],
        },
      },
    });
  } catch (err) {
    return handleError(err, res, "Error retrieving farmer dashboard statistics");
  }
};

export default farmerDashboardStats;
