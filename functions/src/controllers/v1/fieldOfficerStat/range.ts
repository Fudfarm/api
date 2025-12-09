import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

/**
 * Parse date from string or use today as fallback
 * @param {any} dateStr - Date string (ISO format or valid date string)
 * @param {boolean} fallbackToToday - Whether to use today as fallback (default: true)
 * @return {Date} Parsed Date object
 */
const parseDate = (dateStr: any, fallbackToToday = true): Date => {
  if (!dateStr) {
    return fallbackToToday ? new Date() : new Date(0);
  }

  // Try parsing ISO string or date format
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return fallbackToToday ? new Date() : new Date(0);
};

/**
 * Get start of day (00:00:00)
 * @param {Date} date - Date object
 * @return {Date} Date at start of day (midnight)
 */
const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Get end of day (23:59:59.999)
 * @param {Date} date - Date object
 * @return {Date} Date at end of day
 */
const getEndOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const ensureIndexes = async () => {
  try {
    await User.collection.createIndex(
      { role: 1, createdBy: 1, createdAt: 1 },
      { name: "role_createdBy_createdAt_idx", background: true }
    );
  } catch (err) {
    console.warn("Failed to create index role_createdBy_createdAt_idx:", err);
  }
};

const fieldOfficerEnrollmentRangeStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure index (non-blocking)
    ensureIndexes().catch(console.warn);

    // Pagination
    const limit = 1000;
    const skip = Math.max(0, Number(req.query.skip) || 0);

    // Extract fromDate and toDate from request body
    const { fromDate, toDate } = req.body || {};

    console.log("Received fromDate:", fromDate, " toDate:", toDate);

    // Parse dates with fallback to today
    let rangeStart = parseDate(fromDate, true);
    let rangeEnd = parseDate(toDate, true);

    // Ensure rangeStart is before rangeEnd
    if (rangeStart > rangeEnd) {
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }

    // Set time boundaries
    rangeStart = getStartOfDay(rangeStart);
    rangeEnd = getEndOfDay(rangeEnd);

    // Format dates for response (YYYY-MM-DD)
    const formatDateForResponse = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const fromDateStr = formatDateForResponse(rangeStart);
    const toDateStr = formatDateForResponse(rangeEnd);

    // Aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          role: "Farmer",
          createdBy: { $exists: true, $ne: null },
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
        },
      },
      {
        $group: {
          _id: "$createdBy",
          registered: { $sum: 1 },
        },
      },
      {
        $match: { _id: { $ne: null } },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "officer",
        },
      },
      { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },
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
          registered: 1,
        },
      },
      {
        $sort: { registered: -1 },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const aggResult: Array<any> = await User.aggregate(pipeline).exec();

    // Normalize names
    const data = aggResult.map((item) => ({
      fieldOfficerId: item.fieldOfficerId,
      name: item.name && item.name.trim().length > 0 ? item.name.trim() : "Unknown",
      registered: item.registered || 0,
    }));

    return res.status(200).json({
      message: "Field officer enrollment statistics retrieved successfully",
      meta: {
        limit,
        skip,
        fromDate: fromDateStr,
        toDate: toDateStr,
      },
      data,
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving field officer enrollment statistics");
  }
};

export default fieldOfficerEnrollmentRangeStats;
