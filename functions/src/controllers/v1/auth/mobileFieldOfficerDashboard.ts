import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

/**
 * Returns dashboard statistics including role counts, period counts (year/month/week),
 * monthly series for a year, quarterly aggregates and annual aggregates (last 5 years),
 * and the last 10 farmers ordered by updatedAt.
 *
 * @param {AuthenticatedRequest} req - Authenticated Express request (optional query: year)
 * @param {Response} res - Express response
 */
export const mobileFieldOfficerDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();

    // Optional query params
    const yearParam = req.query.year ? Number(req.query.year) : now.getFullYear();
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getFullYear();

    // Registered counts for farmers: this year, this month, this week
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // Monthly counts for the present year and two years backward (Jan..Dec per year)
    // Build years array: [currentYear-2, currentYear-1, currentYear]
    const monthlyYears: number[] = [];
    for (let i = 2; i >= 0; i--) {
      monthlyYears.push(now.getFullYear() - i);
    }

    const startOfMonthlyRange = new Date(monthlyYears[0], 0, 1, 0, 0, 0, 0);
    const endOfMonthlyRange = new Date(monthlyYears[monthlyYears.length - 1], 11, 31, 23, 59, 59, 999);

    // Aggregate by year and month across the 3-year range
    const monthlyAgg = await User.aggregate([
      {
        $match: {
          "role": "Farmer",
          "createdBy": req.user?.id,
          "createdAt": { $gte: startOfMonthlyRange, $lte: endOfMonthlyRange },
        },
      },
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    // Map aggregation results into an array of years each containing 12 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = monthlyYears.map((y) => {
      const months = monthNames.map((m, idx) => {
        const monthNumber = idx + 1;
        const found = monthlyAgg.find((a: any) => Number(a._id.year) === y && Number(a._id.month) === monthNumber);
        return {
          label: `${m}`,
          month: monthNumber,
          year: y,
          count: found ? found.count : 0,
        };
      });
      return { year: y, months };
    });

    // Quarterly aggregates derived from the months of the requested year
    const monthsForRequestedYear = monthly.find((m) => m.year === year)?.months ?? [];
    const quarterly = [
      { quarter: "Q1", months: [1, 2, 3] },
      { quarter: "Q2", months: [4, 5, 6] },
      { quarter: "Q3", months: [7, 8, 9] },
      { quarter: "Q4", months: [10, 11, 12] },
    ].map((q) => {
      const qCount = monthsForRequestedYear
        .filter((m) => q.months.includes(m.month))
        .reduce((s, m) => s + m.count, 0);
      return { quarter: q.quarter, year, count: qCount };
    });

    // Annual counts for the last 5 years (including current)
    const years: number[] = [];
    for (let i = 4; i >= 0; i--) {
      years.push(now.getFullYear() - i);
    }

    const annualRangeStart = new Date(years[0], 0, 1, 0, 0, 0, 0);
    const annualRangeEnd = new Date(years[years.length - 1], 11, 31, 23, 59, 59, 999);

    const annualAgg = await User.aggregate([
      {
        $match: {
          "role": "Farmer",
          "createdBy": req.user?.id,
          "createdAt": { $gte: annualRangeStart, $lte: annualRangeEnd },
        },
      },
      {
        $project: { year: { $year: "$createdAt" } },
      },
      {
        $group: { _id: "$year", count: { $sum: 1 } },
      },
    ]).exec();

    const annual = years.map((y) => {
      const found = annualAgg.find((a: any) => Number(a._id) === y);
      return { year: y, count: found ? found.count : 0 };
    });

    const approvedCount = await User.countDocuments({
      "role": "Farmer",
      "createdBy": req.user?.id,
      "SubmissionStatus.status": "Approved",
    });

    const pendingCount = await User.countDocuments({
      "role": "Farmer",
      "createdBy": req.user?.id,
      "SubmissionStatus.status": "Pending",
    });

    const rejectedCount = await User.countDocuments({
      "role": "Farmer",
      "createdBy": req.user?.id,
      "SubmissionStatus.status": "Rejected",
    });

    return res.status(200).json({
      message: "Web dashboard statistics retrieved",
      data: {
        pendingCount,
        approvedCount,
        rejectedCount,
        series: {
          monthly,
          quarterly,
          annual,
        },
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving dashboard statistics");
  }
};

export default mobileFieldOfficerDashboard;
