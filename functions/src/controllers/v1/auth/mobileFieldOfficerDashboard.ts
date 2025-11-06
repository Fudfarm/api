import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { SubmissionStatus } from "../../../models/v1/farmer";
import User from "../../../models/v1/User";
import { formatRecentUpdatedFarmers } from "./mobileAdminDashboard";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Utility to build date ranges
const buildRange = (start: Date, end: Date) => ({
  $gte: start,
  $lte: end,
});

// Optimized Field Officer Dashboard
export const mobileFieldOfficerDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const userId = req.user?.id;
    const yearParam = Number(req.query.year);
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getFullYear();

    // === DATE RANGES ===
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const monthlyYears = Array.from({ length: 3 }, (_, i) => now.getFullYear() - (2 - i));
    const monthlyStart = new Date(monthlyYears[0], 0, 1);
    const monthlyEnd = new Date(monthlyYears[2], 11, 31, 23, 59, 59, 999);

    const annualYears = Array.from({ length: 5 }, (_, i) => now.getFullYear() - (4 - i));
    const annualStart = new Date(annualYears[0], 0, 1);
    const annualEnd = new Date(annualYears[4], 11, 31, 23, 59, 59, 999);

    // === SHARED MATCH ===
    const baseMatch = { role: "Farmer", createdBy: userId };

    // === RUN AGGREGATIONS IN PARALLEL ===
    const [
      recentUpdatedFarmers,
      monthlyAgg,
      dailyAggThis,
      dailyAggLast,
      weeklyAgg,
      annualAgg,
      approvedCount,
      pendingCount,
      rejectedCount,
    ] = await Promise.all([
      // recent updated farmers (limit 10)
      User.aggregate([
        { $match: { ...baseMatch } },
        {
          $lookup: {
            from: "businesstypes",
            localField: "_id",
            foreignField: "recordID",
            as: "businessTypeDocs",
          },
        },
        {
          $lookup: {
            from: "submissionstatuses",
            localField: "_id",
            foreignField: "recordID",
            as: "submissionDocs",
          },
        },
        {
          $project: {
            offlineID: 1,
            firstname: 1,
            othernames: 1,
            surname: 1,
            phone: 1,
            status: 1,
            updatedAt: 1,
            businessTypeDocs: { $first: "$businessTypeDocs" },
            submissionStatus: { $ifNull: [{ $first: "$submissionDocs.status" }, "Pending"] },
          },
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 10 },
      ]).exec(),
      // Monthly aggregation (3 years)
      User.aggregate([
        { $match: { ...baseMatch, createdAt: buildRange(monthlyStart, monthlyEnd) } },
        { $project: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } } },
        { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
      ]).exec(),

      // Daily - this month
      User.aggregate([
        { $match: { ...baseMatch, createdAt: buildRange(thisMonthStart, thisMonthEnd) } },
        { $project: { day: { $dayOfMonth: "$createdAt" } } },
        { $group: { _id: "$day", count: { $sum: 1 } } },
      ]).exec(),

      // Daily - last month
      User.aggregate([
        { $match: { ...baseMatch, createdAt: buildRange(lastMonthStart, lastMonthEnd) } },
        { $project: { day: { $dayOfMonth: "$createdAt" } } },
        { $group: { _id: "$day", count: { $sum: 1 } } },
      ]).exec(),

      // Weekly (this week)
      User.aggregate([
        { $match: { ...baseMatch, createdAt: buildRange(startOfWeek, endOfWeek) } },
        {
          $project: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
        },
        { $group: { _id: { year: "$year", month: "$month", day: "$day" }, count: { $sum: 1 } } },
      ]).exec(),

      // Annual (5 years)
      User.aggregate([
        { $match: { ...baseMatch, createdAt: buildRange(annualStart, annualEnd) } },
        { $project: { year: { $year: "$createdAt" } } },
        { $group: { _id: "$year", count: { $sum: 1 } } },
      ]).exec(),

      // Counts by status (from SubmissionStatus collection; join to users to ensure role=Farmer and createdBy)
      SubmissionStatus.aggregate([
        { $match: { status: "Approved" } },
        { $lookup: { from: "users", localField: "recordID", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $match: { "user.role": "Farmer", "user.createdBy": userId } },
        { $count: "count" },
      ]).exec().then((r: any[]) => (r[0]?.count) || 0),
      SubmissionStatus.aggregate([
        { $match: { status: "Pending" } },
        { $lookup: { from: "users", localField: "recordID", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $match: { "user.role": "Farmer", "user.createdBy": userId } },
        { $count: "count" },
      ]).exec().then((r: any[]) => (r[0]?.count) || 0),
      SubmissionStatus.aggregate([
        { $match: { status: "Rejected" } },
        { $lookup: { from: "users", localField: "recordID", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $match: { "user.role": "Farmer", "user.createdBy": userId } },
        { $count: "count" },
      ]).exec().then((r: any[]) => (r[0]?.count) || 0),
    ]);

    // === FORMAT RESULTS ===

    const monthly = monthlyYears.map((y) => ({
      year: y,
      months: MONTH_NAMES.map((m, i) => {
        const found = monthlyAgg.find((a) => a._id.year === y && a._id.month === i + 1);
        return { label: m, month: i + 1, year: y, count: found?.count || 0 };
      }),
    }));

    const thisMonth = Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }, (_, i) => {
      const day = i + 1;
      const found = dailyAggThis.find((d) => d._id === day);
      return { day, date: new Date(now.getFullYear(), now.getMonth(), day).toISOString().slice(0, 10), count: found?.count || 0 };
    });

    const lastMonth = Array.from({
      length: new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0).getDate(),
    }, (_, i) => {
      const day = i + 1;
      const found = dailyAggLast.find((d) => d._id === day);
      return { day, date: new Date(
        lastMonthStart.getFullYear(),
        lastMonthStart.getMonth(),
        day).toISOString().slice(0, 10),
      count: found?.count || 0 };
    });

    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const found = weeklyAgg.find((a) => a._id.year === y && a._id.month === m && a._id.day === day);
      return { weekday: WEEK_DAYS[d.getDay()], day, date: d.toISOString().slice(0, 10), count: found?.count || 0 };
    });

    const monthsForYear = monthly.find((m) => m.year === year)?.months ?? [];
    const quarterly = [
      { quarter: "Q1", months: [1, 2, 3] },
      { quarter: "Q2", months: [4, 5, 6] },
      { quarter: "Q3", months: [7, 8, 9] },
      { quarter: "Q4", months: [10, 11, 12] },
    ].map((q) => ({
      quarter: q.quarter,
      year,
      count: q.months.reduce((sum, m) => sum + (monthsForYear.find((mm) => mm.month === m)?.count || 0), 0),
    }));

    const annual = annualYears.map((y) => ({
      year: y,
      count: annualAgg.find((a) => a._id === y)?.count || 0,
    }));

    // Format recent updated farmers
    const formattedRecentUpdatedFarmers = formatRecentUpdatedFarmers(recentUpdatedFarmers);

    return res.status(200).json({
      message: "Web dashboard statistics retrieved",
      data: {
        pendingCount,
        approvedCount,
        rejectedCount,
        recentUpdatedFarmers: formattedRecentUpdatedFarmers,
        series: { lastMonth, thisMonth, thisWeek, monthly, quarterly, annual },
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving dashboard statistics");
  }
};

export default mobileFieldOfficerDashboard;
