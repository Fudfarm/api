import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

export const mobileAdminDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();

    const yearParam = req.query.year ? Number(req.query.year) : now.getFullYear();
    const year = Number.isFinite(yearParam) && yearParam > 1900 ? yearParam : now.getFullYear();

    // Calculate reusable date ranges
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisMonthIndex = now.getMonth();
    const thisMonthYear = now.getFullYear();
    const lastMonthDate = new Date(thisMonthYear, thisMonthIndex - 1, 1);
    const lastMonthIndex = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const startOfThisMonth = new Date(thisMonthYear, thisMonthIndex, 1, 0, 0, 0, 0);
    const endOfThisMonth = new Date(thisMonthYear, thisMonthIndex + 1, 0, 23, 59, 59, 999);

    const startOfLastMonth = new Date(lastMonthYear, lastMonthIndex, 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(lastMonthYear, lastMonthIndex + 1, 0, 23, 59, 59, 999);

    // 3 years range for monthly
    const monthlyYears = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];
    const startOfMonthlyRange = new Date(monthlyYears[0], 0, 1);
    const endOfMonthlyRange = new Date(monthlyYears[2], 11, 31, 23, 59, 59, 999);

    // 5-year range for annual
    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 4 + i);
    const annualRangeStart = new Date(years[0], 0, 1);
    const annualRangeEnd = new Date(years[4], 11, 31, 23, 59, 59, 999);

    // Run independent queries in parallel (improves performance)
    const [
      monthlyAgg,
      dailyAggThis,
      dailyAggLast,
      weeklyAgg,
      annualAgg,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalFieldOfficers,
      totalAdmins,
      totalFarmers,
      inactiveFieldOfficers,
      inactiveAdmins,
    ] = await Promise.all([
      // Monthly aggregation
      User.aggregate([
        { $match: { role: "Farmer", createdAt: { $gte: startOfMonthlyRange, $lte: endOfMonthlyRange } } },
        { $project: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } } },
        { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
      ]).exec(),

      // Daily - this month
      User.aggregate([
        { $match: { role: "Farmer", createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth } } },
        { $project: { day: { $dayOfMonth: "$createdAt" } } },
        { $group: { _id: "$day", count: { $sum: 1 } } },
      ]).exec(),

      // Daily - last month
      User.aggregate([
        { $match: { role: "Farmer", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $project: { day: { $dayOfMonth: "$createdAt" } } },
        { $group: { _id: "$day", count: { $sum: 1 } } },
      ]).exec(),

      // Weekly - current week
      User.aggregate([
        { $match: { role: "Farmer", createdAt: { $gte: startOfWeek, $lte: endOfWeek } } },
        { $project: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
        { $group: { _id: { year: "$year", month: "$month", day: "$day" }, count: { $sum: 1 } } },
      ]).exec(),

      // Annual aggregation
      User.aggregate([
        { $match: { role: "Farmer", createdAt: { $gte: annualRangeStart, $lte: annualRangeEnd } } },
        { $project: { year: { $year: "$createdAt" } } },
        { $group: { _id: "$year", count: { $sum: 1 } } },
      ]).exec(),

      // Status counts (run in parallel)
      User.countDocuments({ "role": "Farmer", "SubmissionStatus.status": "Approved" }),
      User.countDocuments({ "role": "Farmer", "SubmissionStatus.status": "Pending" }),
      User.countDocuments({ "role": "Farmer", "SubmissionStatus.status": "Rejected" }),

      // Role counts
      User.countDocuments({ role: "Field Officer" }),
      User.countDocuments({ role: "Admin" }),
      User.countDocuments({ role: "Farmer" }),
      User.countDocuments({ role: "Field Officer", status: { $ne: "Active" } }),
      User.countDocuments({ role: "Admin", status: { $ne: "Active" } }),
    ]);

    // Map results back into same shape as before
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = monthlyYears.map((y) => ({
      year: y,
      months: monthNames.map((m, idx) => {
        const found = monthlyAgg.find((a) => Number(a._id.year) === y && Number(a._id.month) === idx + 1);
        return { label: m, month: idx + 1, year: y, count: found ? found.count : 0 };
      }),
    }));

    const daysArray = (agg: any[], year: number, monthIndex: number) =>
      Array.from({ length: new Date(year, monthIndex + 1, 0).getDate() }, (_, i) => {
        const day = i + 1;
        const found = agg.find((d: any) => Number(d._id) === day);
        const dateStr = new Date(year, monthIndex, day).toISOString().slice(0, 10);
        return { day, date: dateStr, count: found ? found.count : 0 };
      });

    const thisMonth = daysArray(dailyAggThis, thisMonthYear, thisMonthIndex);
    const lastMonth = daysArray(dailyAggLast, lastMonthYear, lastMonthIndex);

    const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const found = weeklyAgg.find(
        (a) =>
          Number(a._id.year) === d.getFullYear() &&
          Number(a._id.month) === d.getMonth() + 1 &&
          Number(a._id.day) === d.getDate()
      );
      return {
        weekday: weekDayNames[d.getDay()],
        day: d.getDate(),
        date: d.toISOString().slice(0, 10),
        count: found ? found.count : 0,
      };
    });

    const monthsForRequestedYear = monthly.find((m) => m.year === year)?.months ?? [];
    const quarterly = [
      { quarter: "Q1", months: [1, 2, 3] },
      { quarter: "Q2", months: [4, 5, 6] },
      { quarter: "Q3", months: [7, 8, 9] },
      { quarter: "Q4", months: [10, 11, 12] },
    ].map((q) => ({
      quarter: q.quarter,
      year,
      count: monthsForRequestedYear.filter((m) => q.months.includes(m.month)).reduce((s, m) => s + m.count, 0),
    }));

    const annual = years.map((y) => {
      const found = annualAgg.find((a: any) => Number(a._id) === y);
      return { year: y, count: found ? found.count : 0 };
    });

    // Return same JSON structure
    return res.status(200).json({
      message: "Web dashboard statistics retrieved",
      data: {
        fieldOfficers: totalFieldOfficers,
        admins: totalAdmins,
        farmers: totalFarmers,
        inactiveFieldOfficers,
        inactiveAdmins,
        totalActiveStaff: totalFieldOfficers + totalAdmins - inactiveFieldOfficers - inactiveAdmins,
        totalInactiveStaff: inactiveFieldOfficers + inactiveAdmins,
        pendingCount,
        approvedCount,
        rejectedCount,
        series: {
          lastMonth,
          thisMonth,
          thisWeek,
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

export default mobileAdminDashboard;
