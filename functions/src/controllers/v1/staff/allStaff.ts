import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { cleanStr } from "../../../function/function1";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";
import { formatDateToShort } from "../../../function/function3";

export const staffList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      firstname,
      othernames,
      surname,
      id,
      status = "Active",
      role = "All",
      createdAtStart,
      createdAtEnd,
      birthdateFrom,
      birthdateTo,
      maritalStatus,
      gender,
      email,
      page = "1",
      limit = "50",
    } = req.query;

    const filter: any = {};

    // Default status = Active
    if (status && status !== "All") filter.status = cleanStr(String(status));
    if (role && role !== "All") filter.role = cleanStr(String(role));

    if (firstname)
      filter.firstname = { $regex: cleanStr(String(firstname)), $options: "i" };
    if (othernames)
      filter.othernames = { $regex: cleanStr(String(othernames)), $options: "i" };
    if (surname)
      filter.surname = { $regex: cleanStr(String(surname)), $options: "i" };
    if (id) filter._id = cleanStr(String(id));

    if (createdAtStart || createdAtEnd) {
      filter.createdAt = {};
      if (createdAtStart)
        filter.createdAt.$gte = new Date(cleanStr(String(createdAtStart)));
      if (createdAtEnd) {
        // Set end date to 23:59:59.999 to include all records from that day
        const endDate = new Date(cleanStr(String(createdAtEnd)));
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }
    if (birthdateFrom || birthdateTo) {
      filter.birthdate = {};
      if (birthdateFrom)
        filter.birthdate.$gte = new Date(cleanStr(String(birthdateFrom)));
      if (birthdateTo) {
        // Set end date to 23:59:59.999 to include all records from that day
        const endDate = new Date(cleanStr(String(birthdateTo)));
        endDate.setHours(23, 59, 59, 999);
        filter.birthdate.$lte = endDate;
      }
    }
    if (gender && gender !== "All") {
      filter.gender = cleanStr(String(gender));
    }
    if (maritalStatus && maritalStatus !== "All") {
      filter.maritalStatus = cleanStr(String(maritalStatus));
    }
    if (email) {
      filter.email = { $regex: cleanStr(String(email)), $options: "i" };
    }

    const pageNum = Math.max(parseInt(String(page)), 1);
    const limitNum = Math.min(parseInt(String(limit)) || 50, 200);
    const skip = (pageNum - 1) * limitNum;

    // Fetch users with filter
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("firstname othernames surname phone role status email gender " +
          " maritalStatus birthdate createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      firstname: user.firstname,
      othernames: user.othernames,
      surname: user.surname,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      birthdate: user.birthdate
        ? formatDateToShort(user.birthdate.toISOString())
        : undefined,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
        ? formatDateToShort(user.createdAt.toISOString())
        : undefined,
    }));

    // Prepare search parameters summary
    const searchParams = {
      role: role ? cleanStr(String(role)) : undefined,
      firstname: firstname ? cleanStr(String(firstname)) : undefined,
      othernames: othernames ? cleanStr(String(othernames)) : undefined,
      surname: surname ? cleanStr(String(surname)) : undefined,
      id: id ? cleanStr(String(id)) : undefined,
      status,
      createdAtStart: createdAtStart
        ? cleanStr(formatDateToShort(String(createdAtStart)))
        : undefined,
      createdAtEnd: createdAtEnd ? cleanStr(formatDateToShort(String(createdAtEnd))) : undefined,
      page: pageNum,
      limit: limitNum,
    };

    return res.status(200).json({
      message: "Users retrieved successfully",
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      searchParams, // ✅ include this
      data: formattedUsers,
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving users list");
  }
};
