import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

/**
 * Optimized field officer enrollment statistics for large collections (~20M+ docs)
 *
 * Improvements:
 *  - Single aggregation pipeline scan (conditional sums instead of $facet)
 *  - $lookup to fetch officer details inside aggregation
 *  - Compound index creation (role, createdBy, createdAt) - run-once at startup
 *  - Optional pagination (limit, skip) to avoid huge payloads
 */

const ensureIndexes = async () => {
  try {
    // Creates the compound index if it doesn't exist. Safe to call repeatedly.
    await User.collection.createIndex(
      { role: 1, createdBy: 1, createdAt: 1 },
      { name: "role_createdBy_createdAt_idx", background: true }
    );
  } catch (err) {
    // fail quietly; index creation isn't critical at runtime but recommended
    // you may log this in your real app
    console.warn("Failed to create index role_createdBy_createdAt_idx:", err);
  }
};

const fieldOfficerEnrollmentGenStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure index (non-blocking)
    ensureIndexes().catch(console.warn);

    // Pagination (optional)
    const limit = 1000;
    const skip = Math.max(0, Number(req.query.skip) || 0);

    const now = new Date();

    // Date ranges (UTC-local interpretation depends on your app; adjust if you want timezone-specific)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday as start-of-week
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Aggregation pipeline:
    // 1) Match only Farmer role with createdBy present (use index)
    // 2) Group by createdBy and compute conditional counts in one pass
    // 3) Lookup officer details from users collection
    // 4) Project and sort
    const pipeline: any[] = [
      {
        $match: {
          role: "Farmer",
          createdBy: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$createdBy",
          totalRegistered: { $sum: 1 },
          registeredToday: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$createdAt", todayStart] }, { $lte: ["$createdAt", todayEnd] }] },
                1,
                0,
              ],
            },
          },
          registeredThisWeek: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$createdAt", weekStart] }, { $lte: ["$createdAt", weekEnd] }] },
                1,
                0,
              ],
            },
          },
          registeredThisMonth: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$createdAt", monthStart] }, { $lte: ["$createdAt", monthEnd] }] },
                1,
                0,
              ],
            },
          },
          registeredThisYear: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$createdAt", yearStart] }, { $lte: ["$createdAt", yearEnd] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      // Optionally, filter out createdBy null or invalid ObjectId (shouldn't be necessary)
      {
        $match: { _id: { $ne: null } },
      },
      // Lookup officer details from users collection (same collection) - in MongoDB the from name is the collection name
      {
        $lookup: {
          from: User.collection.name, // same collection "users"
          localField: "_id",
          foreignField: "_id",
          as: "officer",
        },
      },
      { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
      // Optionally ensure officer role is FieldOfficer; if not present we still include but mark as unknown
      {
        $addFields: {
          officerRole: "$officer.role",
        },
      },
      {
        $project: {
          _id: 0,
          fieldOfficerId: { $toString: "$_id" },
          name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$officer.firstname", ""] },
                  " ",
                  { $ifNull: ["$officer.othernames", ""] },
                  " ",
                  { $ifNull: ["$officer.surname", ""] },
                ],
              },
            },
          },
          totalRegistered: 1,
          registeredToday: 1,
          registeredThisWeek: 1,
          registeredThisMonth: 1,
          registeredThisYear: 1,
        },
      },
      // Filter to only officers with role FieldOfficer if you want:
      // { $match: { "officer.role": "FieldOfficer" } } // moved before $project if used
      {
        $sort: { totalRegistered: -1 },
      },
      // Pagination
      { $skip: skip },
      { $limit: limit },
    ];

    const aggResult: Array<any> = await User.aggregate(pipeline).exec();

    // Normalize names and ensure unknown placeholders
    const data = aggResult.map((item) => ({
      fieldOfficerId: item.fieldOfficerId,
      name: item.name && item.name.trim().length > 0 ? item.name.trim() : "Unknown",
      totalRegistered: item.totalRegistered || 0,
      registeredToday: item.registeredToday || 0,
      registeredThisWeek: item.registeredThisWeek || 0,
      registeredThisMonth: item.registeredThisMonth || 0,
      registeredThisYear: item.registeredThisYear || 0,
    }));

    return res.status(200).json({
      message: "Field officer enrollment statistics retrieved successfully",
      meta: {
        limit,
        skip,
        generatedAt: new Date().toISOString(),
      },
      data,
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving field officer enrollment statistics");
  }
};

export default fieldOfficerEnrollmentGenStats;
