import { Response } from "express";
import { handleError } from "../../../function/error";
import { formatDateToShort } from "../../../function/function3";
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
export const webDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();

    // Optional query params
    const yearParam = req.query.year ? Number(req.query.year) : now.getFullYear();
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getFullYear();

    // Role totals
    const [totalFieldOfficers, totalAdmins, totalFarmers] = await Promise.all([
      User.countDocuments({ role: "Field Officer" }),
      User.countDocuments({ role: "Admin" }),
      User.countDocuments({ role: "Farmer" }),
    ]);

    // Registered counts for farmers: this year, this month, this week
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const [registeredThisYear, registeredThisMonth, registeredThisWeek] = await Promise.all([
      User.countDocuments({ role: "Farmer", createdAt: { $gte: startOfYear, $lte: now } }),
      User.countDocuments({ role: "Farmer", createdAt: { $gte: startOfMonth, $lte: now } }),
      User.countDocuments({ role: "Farmer", createdAt: { $gte: startOfWeek, $lte: now } }),
    ]);

    // Monthly counts for the specified year (Jan..Dec)
    const startOfRequestedYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfRequestedYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthlyAgg = await User.aggregate([
      {
        $match: {
          role: "Farmer",
          createdAt: { $gte: startOfRequestedYear, $lte: endOfRequestedYear },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
    ]).exec();

    // Map aggregation results into an array of 12 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = monthNames.map((m, idx) => {
      const monthNumber = idx + 1;
      const found = monthlyAgg.find((a: any) => Number(a._id) === monthNumber);
      return {
        label: `${m} ${year}`,
        month: monthNumber,
        year,
        count: found ? found.count : 0,
      };
    });

    // Quarterly aggregates derived from monthly
    const quarterly = [
      { quarter: "Q1", months: [1, 2, 3] },
      { quarter: "Q2", months: [4, 5, 6] },
      { quarter: "Q3", months: [7, 8, 9] },
      { quarter: "Q4", months: [10, 11, 12] },
    ].map((q) => {
      const qCount = monthly
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
          role: "Farmer",
          createdAt: { $gte: annualRangeStart, $lte: annualRangeEnd },
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

    // Last 10 updated farmer records
    const lastUpdatedFarmers = await User.find({ role: "Farmer" })
      .select("_id surname firstname othernames email phone updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const lastUpdated = lastUpdatedFarmers.map((u: any) => ({
      id: u._id,
      name: `${u.surname} ${u.firstname} ${u.othernames || ""}`.trim(),
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt ? formatDateToShort(u.createdAt?.toISOString()) : "N/A",
      updatedAt: u.updatedAt ? formatDateToShort(u.updatedAt?.toISOString(), { includeTime: true }) : "N/A",
      profileLink: `/admin/farmer/${u._id}`,
    }));

    return res.status(200).json({
      message: "Web dashboard statistics retrieved",
      data: {
        totals: {
          fieldOfficers: totalFieldOfficers,
          admins: totalAdmins,
          farmers: totalFarmers,
        },
        registered: {
          thisYear: registeredThisYear,
          thisMonth: registeredThisMonth,
          thisWeek: registeredThisWeek,
        },
        series: {
          monthly,
          quarterly,
          annual,
        },
        lastUpdated,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving dashboard statistics");
  }
};

export default webDashboardStats;
