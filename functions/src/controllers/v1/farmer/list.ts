import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { cleanStr } from "../../../function/function1";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";
import { formatDateToShort } from "../../../function/function3";

export const farmersList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      firstname,
      othernames,
      surname,
      id,
      status = "Active",
      createdAtStart,
      createdAtEnd,
      birthdateFrom,
      birthdateTo,
      maritalStatus,
      gender,
      email,
      businessType = "All",
      page = "1",
      limit = "100",
    } = req.query;

    const filter: any = {};

    // Default status = Active
    if (status && status !== "All") filter.status = cleanStr(String(status));
    filter.role = cleanStr(String("Farmer")); // Only farmers

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

    // Build aggregation pipeline so we can join BusinessType collection and filter in one query
    const pipeline: any[] = [];

    // Initial match from user filters
    pipeline.push({ $match: filter });

    // Lookup business type document by recordID (user._id)
    pipeline.push({
      $lookup: {
        from: "businesstypes", // collection name for BusinessType model (mongoose pluralizes)
        localField: "_id",
        foreignField: "recordID",
        as: "businessTypeDocs",
      },
    });

    // Unwind so we can filter; keep empty if none
    pipeline.push({ $unwind: { path: "$businessTypeDocs", preserveNullAndEmptyArrays: true } });

    // If businessType is Farmer or Seller, add a match stage
    if (businessType && businessType !== "All") {
      const isFarmer = businessType === "Farmer";
      if (isFarmer) {
        pipeline.push({ $match: { "businessTypeDocs.isFarmer": true } });
      } else {
        // Seller
        pipeline.push({ $match: { "businessTypeDocs.isSeller": true } });
      }
    }

    // Project the fields we need (include createdAt for sorting)
    pipeline.push({
      $project: {
        firstname: 1,
        othernames: 1,
        surname: 1,
        phone: 1,
        email: 1,
        gender: 1,
        maritalStatus: 1,
        birthdate: 1,
        role: 1,
        status: 1,
        createdAt: 1,
      },
    });

    // Facet to get total count and paginated results in one trip
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limitNum },
        ],
      },
    });

    const aggResult = await User.aggregate(pipeline).allowDiskUse(true);
    const total = (aggResult[0]?.metadata?.[0]?.total) || 0;
    const users = aggResult[0]?.data || [];

    const formattedUsers = users.map((user: any) => ({
      id: user._id,
      firstname: user.firstname,
      othernames: user.othernames,
      surname: user.surname,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      birthdate: user.birthdate
        ? formatDateToShort(new Date(user.birthdate).toISOString())
        : undefined,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
        ? formatDateToShort(new Date(user.createdAt).toISOString())
        : undefined,
    }));

    // Prepare search parameters summary
    const searchParams = {
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
