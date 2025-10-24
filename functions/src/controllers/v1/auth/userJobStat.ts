// statistics page
import { Response } from "express";
import { handleError } from "../../../function/error";
import { formatDateToShort } from "../../../function/function3";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";
import {
  Address,
  AnimalInfo,
  Bank,
  BusinessType,
  Contact,
  CropInfo,
  FarmInfo,
  Occupation,
  OtherFarmInfo,
  ShopItems,
  ShopLocation,
  SubmissionStatus,
  Verification,
  Workforce,
} from "../../../models/v1/farmer";

/**
 * Get farmer enrollment statistics filtered by time period
 * @param {AuthenticatedRequest} req - Express authenticated request with query params
 * @param {Response} res - Express response
 * @return {Promise<Response>} JSON response with enrollment statistics
 */
export const getFarmerEnrollmentStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = "this_month", from, to } = req.query;
    const rawCreatedBy = req.query.createdBy;
    let createdBy: string | undefined;
    if (typeof rawCreatedBy === "string") {
      createdBy = rawCreatedBy;
    } else if (Array.isArray(rawCreatedBy)) {
      createdBy = rawCreatedBy[0] as string;
    } else {
      createdBy = undefined;
    }

    // 1. Calculate date range based on custom range or period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    let periodType: string;

    // Check if custom date range is provided
    if (from || to) {
      // Custom date range takes priority
      if (!from || !to) {
        return res.status(400).json({
          message: "Both 'from' and 'to' dates are required for custom date range",
        });
      }

      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date format. Use ISO 8601 format (e.g., 2024-01-01 or 2024-01-01T00:00:00Z)",
        });
      }

      if (fromDate > toDate) {
        return res.status(400).json({
          message: "'from' date must be before or equal to 'to' date",
        });
      }

      // Normalize range: include entire 'from' day and entire 'to' day.
      const fromStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
      const toEnd = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);

      startDate = fromStart;
      endDate = toEnd;
      periodType = "custom_range";
    } else {
      // Use period parameter
      // Check if period is a year (numeric string)
      const yearMatch = /^\d{4}$/.test(period as string);

      if (yearMatch) {
        // Period is a specific year like "2021", "2022", etc.
        const specificYear = parseInt(period as string, 10);
        if (specificYear < 1900 || specificYear > 2100) {
          return res.status(400).json({ message: "Invalid year. Must be between 1900 and 2100" });
        }
        startDate = new Date(specificYear, 0, 1, 0, 0, 0);
        endDate = new Date(specificYear, 11, 31, 23, 59, 59);
        periodType = specificYear.toString();
      } else {
        // Period is a predefined time range
        periodType = period as string;
        switch (period) {
          case "today": {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            break;
          }

          case "this_week": {
            const dayOfWeek = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek); // Start from Sunday
            startDate.setHours(0, 0, 0, 0);
            break;
          }

          case "this_month": {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            break;
          }

          case "this_year": {
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            break;
          }

          default:
            return res.status(400).json({
              message: "Invalid period. Use: today, this_week, this_month, this_year, or a valid year (e.g., 2021, 2022)",
            });
        }
      }
    }

    let createdFilter: { role: string; createdAt?: { $gte: Date; $lte: Date }; createdBy?: string } = {
      role: "Farmer",
    };
    if (from && to) {
      createdFilter = {
        ...createdFilter,
        createdAt: { $gte: startDate, $lte: endDate },
      };
    }
    if (createdBy) {
      createdFilter = {
        ...createdFilter,
        createdBy: createdBy,
      };
    }

    // 2. Query Users table for farmers created in date range
    const farmers = await User.find(createdFilter)
      .select("_id surname firstname othernames email phone createdAt")
      .lean();

    const farmerIds = farmers.map((f) => f._id);

    // 3. Query SubmissionStatus for these farmers
    const submissions = await SubmissionStatus.find({
      recordID: { $in: farmerIds },
    }).lean();

    // Create a map for quick lookup
    const submissionMap = new Map();
    submissions.forEach((sub) => {
      submissionMap.set(sub.recordID, sub);
    });

    // 4. Query User info for approvers/rejectors
    const approverIds = new Set<string>();
    const rejectorIds = new Set<string>();

    submissions.forEach((sub) => {
      if (sub.approvedBy) approverIds.add(sub.approvedBy);
      if (sub.rejectedBy) rejectorIds.add(sub.rejectedBy);
    });

    const allUserIds = [...approverIds, ...rejectorIds];
    const users = await User.find({ _id: { $in: allUserIds } })
      .select("_id surname firstname othernames")
      .lean();

    const userMap = new Map();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        id: u._id,
        name: `${u.surname} ${u.firstname} ${u.othernames || ""}`.trim(),
      });
    });

    // 5. Combine data
    const enrollmentData = farmers.map((farmer) => {
      const submission = submissionMap.get(farmer._id);

      return {
        id: farmer._id,
        surname: farmer.surname,
        firstname: farmer.firstname,
        othernames: farmer.othernames,
        email: farmer.email,
        phone: farmer.phone,
        enrolledDate: farmer.createdAt ? formatDateToShort(farmer.createdAt.toISOString(), { includeTime: true }) : "",

        // Submission details
        status: submission?.status || "Pending",
        comments: submission?.comments || "",
        isSubmitted: submission?.isSubmitted || false,
        isImage: submission?.isImage || false,
        isConsent: submission?.isConsent || false,
        isUpdated: submission?.isUpdated || false,

        // Approver/Rejector info
        approvedBy: submission?.approvedBy
          ? userMap.get(submission.approvedBy.toString())
          : null,
        rejectedBy: submission?.rejectedBy
          ? userMap.get(submission.rejectedBy.toString())
          : null,
      };
    });

    // 6. Calculate statistics
    const stats = {
      totalEnrolled: farmers.length,

      // Breakdown by status
      statusBreakdown: {
        pending: enrollmentData.filter((f) => f.status === "Pending").length,
        approved: enrollmentData.filter((f) => f.status === "Approved").length,
        rejected: enrollmentData.filter((f) => f.status === "Rejected").length,
      },

      // Breakdown by completion
      completionStats: {
        submitted: enrollmentData.filter((f) => f.isSubmitted).length,
        withImage: enrollmentData.filter((f) => f.isImage).length,
        withConsent: enrollmentData.filter((f) => f.isConsent).length,
      },

      // List of farmers
      farmers: enrollmentData,

      // Period info
      period: {
        type: periodType,
        startDate: formatDateToShort(startDate.toISOString(), { includeTime: true }),
        endDate: formatDateToShort(endDate.toISOString(), { includeTime: true }),
      },
    };

    return res.status(200).json({
      message: "Farmer enrollment statistics retrieved",
      data: stats,
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving farmer enrollment statistics");
  }
};

/**
 * Get recently updated farmer records across all farmer-related tables
 * @param {AuthenticatedRequest} req - Express authenticated request with query params
 * @param {Response} res - Express response
 * @return {Promise<Response>} JSON response with updated records information
 */
export const getRecentlyUpdatedFarmerRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { updatedFrom, updatedTo } = req.query;

    // Validate that both dates are provided
    if (!updatedFrom || !updatedTo) {
      return res.status(400).json({
        message: "Both 'updatedFrom' and 'updatedTo' dates are required",
      });
    }

    let fromDate = new Date(updatedFrom as string);
    let toDate = new Date(updatedTo as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use ISO 8601 format (e.g., 2024-01-01 or 2024-01-01T00:00:00Z)",
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        message: "'updatedFrom' date must be before or equal to 'updatedTo' date",
      });
    }

    // Normalize to include whole days: from 00:00:00.000 to 23:59:59.999
    const normalizedFrom = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
    const normalizedTo = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
    fromDate = normalizedFrom;
    toDate = normalizedTo;

    // Define all farmer-related tables to check
    const farmerTables = [
      { name: "Address", model: Address },
      { name: "AnimalInfo", model: AnimalInfo },
      { name: "Bank", model: Bank },
      { name: "BusinessType", model: BusinessType },
      { name: "Contact", model: Contact },
      { name: "CropInfo", model: CropInfo },
      { name: "FarmInfo", model: FarmInfo },
      { name: "Occupation", model: Occupation },
      { name: "OtherFarmInfo", model: OtherFarmInfo },
      { name: "ShopItems", model: ShopItems },
      { name: "ShopLocation", model: ShopLocation },
      { name: "SubmissionStatus", model: SubmissionStatus },
      { name: "Verification", model: Verification },
      { name: "Workforce", model: Workforce },
    ];

    // Define interface for record data
    interface RecordData {
      recordId: string;
      userId: string;
      updatedAt: string;
    }

    interface TableUpdate {
      tableName: string;
      updatedCount: number;
      records: RecordData[];
    }

    // Query each table for updates within the date range
    const updatePromises = farmerTables.map(async (table): Promise<TableUpdate> => {
      try {
        const records = await (table.model as any)
          .find({
            updatedAt: { $gte: fromDate, $lte: toDate },
          })
          .select("_id recordID updatedAt")
          .lean()
          .exec();

        return {
          tableName: table.name,
          updatedCount: records.length,
          records: records.map((record: any) => ({
            recordId: record._id,
            userId: record.recordID, // recordID is the userId reference
            updatedAt: formatDateToShort(record.updatedAt.toISOString(), { includeTime: true }),
          })),
        };
      } catch (error) {
        // If table doesn't have updatedAt field, return empty
        return {
          tableName: table.name,
          updatedCount: 0,
          records: [],
        };
      }
    });

    const tableUpdates = await Promise.all(updatePromises);

    // Filter out tables with no updates
    const tablesWithUpdates = tableUpdates.filter((table) => table.updatedCount > 0);

    // Collect all unique user IDs
    const allUserIds = new Set<string>();
    tablesWithUpdates.forEach((table) => {
      table.records.forEach((record: RecordData) => {
        if (record.userId) allUserIds.add(record.userId);
      });
    });

    // Fetch user information
    const users = await User.find({ _id: { $in: Array.from(allUserIds) } })
      .select("_id surname firstname othernames email phone")
      .lean();

    const userMap = new Map();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        id: u._id,
        surname: u.surname,
        firstname: u.firstname,
        othernames: u.othernames,
        email: u.email,
        phone: u.phone,
      });
    });

    // Group updates by user with table details
    const updatesByUser = new Map<string, any>();
    tablesWithUpdates.forEach((table) => {
      table.records.forEach((record: RecordData) => {
        if (record.userId) {
          if (!updatesByUser.has(record.userId)) {
            updatesByUser.set(record.userId, {
              userId: record.userId,
              user: userMap.get(record.userId),
              affectedTables: [],
              totalUpdates: 0,
              profileLink: `/admin/farmer/${record.userId}`,
            });
          }
          const userUpdate = updatesByUser.get(record.userId);
          if (userUpdate) {
            userUpdate.affectedTables.push({
              tableName: table.tableName,
              recordId: record.recordId,
              updatedAt: record.updatedAt,
            });
            userUpdate.totalUpdates += 1;
          }
        }
      });
    });

    const farmerUpdates = Array.from(updatesByUser.values());

    // Calculate summary statistics
    const totalUpdates = tablesWithUpdates.reduce((sum, table) => sum + table.updatedCount, 0);
    const totalFarmersAffected = allUserIds.size;

    return res.status(200).json({
      message: "Recently updated farmer records retrieved",
      data: {
        summary: {
          totalUpdates,
          totalFarmersAffected,
          tablesAffected: tablesWithUpdates.length,
          dateRange: {
            from: formatDateToShort(fromDate.toISOString(), { includeTime: true }),
            to: formatDateToShort(toDate.toISOString(), { includeTime: true }),
          },
        },
        farmers: farmerUpdates,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving recently updated farmer records");
  }
};
