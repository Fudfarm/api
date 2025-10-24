import User from "../../../models/v1/User";
import {
  ShopItems,
} from "../../../models/v1/farmer";

import ExcelJS from "exceljs";
import { Response } from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { handleError } from "../../../function/error";

/**
 * Download all farmers with flexible filtering and export options
 * @param {Request} req - Express request with query params
 * @param {Response} res - Express response
 */
export const downloadAllFarmers = async (req: any, res: Response) => {
  try {
    // Split query params into per-table filters
    const userFilter: any = {};
    const tableFilters: Record<string, any> = {};
    const userFields = [
      "surname",
      "firstname",
      "othernames",
      "email",
      "phone",
      "gender",
      "maritalStatus",
      "createdAt",
      "birthdate",
      "status",
      "role",
    ];
    // Farmer table fields (example, add more as needed)
    const farmerTableFields: Record<string, string[]> = {
      Address: ["state", "lga", "village", "address"],
      AnimalInfo: ["animalType", "animalCount"],
      Bank: ["bankName", "accountNumber"],
      BusinessType: ["type"],
      Contact: ["contactPerson", "contactPhone"],
      CropInfo: ["cropType", "cropArea"],
      FarmInfo: ["farmSize", "farmType"],
      Occupation: ["occupation"],
      OtherFarmInfo: ["otherInfo"],
      ShopItems: ["itemName"],
      ShopLocation: ["location"],
      SubmissionStatus: ["status"],
      Verification: ["verified"],
      Workforce: ["workerCount"],
    };

    // Build user filter - always filter by role=Farmer unless specified otherwise
    if (!req.query.role) {
      userFilter.role = "Farmer";
    }

    userFields.forEach((field) => {
      if (req.query[field]) {
        userFilter[field] = req.query[field];
      }
    });
    if (req.query.createdAtStart || req.query.createdAtEnd) {
      userFilter.createdAt = {};
      if (req.query.createdAtStart) {
        userFilter.createdAt.$gte = new Date(req.query.createdAtStart);
      }
      if (req.query.createdAtEnd) {
        userFilter.createdAt.$lte = new Date(req.query.createdAtEnd);
      }
    }

    // Build farmer table filters
    Object.entries(farmerTableFields).forEach(([table, fields]) => {
      fields.forEach((field) => {
        if (req.query[field]) {
          if (!tableFilters[table]) tableFilters[table] = {};
          tableFilters[table][field] = req.query[field];
        }
      });
    });

    // Query all users matching user filter
    const users = await User.find(userFilter).lean();

    // For each user, fetch related farmer tables and apply table filters
    const farmerRecords = [];
    for (const user of users) {
      const userId = user._id;
      let matchesAll = true;
      const farmerData: any = { ...user };
      // For each farmer table, fetch and filter
      for (const [table] of Object.entries(farmerTableFields)) {
        let record;
        if (table === "ShopItems") {
          record = await ShopItems.find({ recordID: userId, ...tableFilters[table] }).lean();
        } else {
          record = await eval(table).findOne({ recordID: userId, ...tableFilters[table] }).lean();
        }
        farmerData[table] = record;
        // If filter for this table exists and no record found, exclude user
        if (tableFilters[table] && !record) {
          matchesAll = false;
        }
      }
      if (matchesAll) {
        farmerRecords.push(farmerData);
      }
    }

    // Export logic (PDF, XLSX, CSV)
    const format = String(req.query.reportFormat || "PDF").toUpperCase();
    if (format === "CSV") {
      const fields = Object.keys(farmerRecords[0] || {});
      const parser = new Parser({ fields });
      const csv = parser.parse(farmerRecords);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=farmers-${Date.now()}.csv`);
      return res.status(200).send(csv);
    } else if (format === "XLSX") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Farmers");
      worksheet.columns = Object.keys(farmerRecords[0] || {}).map((key) => ({ header: key, key, width: 20 }));
      farmerRecords.forEach((row) => worksheet.addRow(row));
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=farmers-${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    } else {
      const doc = new PDFDocument({ margin: 25, size: "A4", layout: "landscape" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=farmers-${Date.now()}.pdf`);
      doc.pipe(res);
      doc.fontSize(14).text("Farmers Report", { align: "center" });
      doc.moveDown();
      farmerRecords.forEach((farmer, idx) => {
        doc.fontSize(10).text(`Farmer #${idx + 1}`);
        Object.entries(farmer).forEach(([key, value]) => {
          doc.fontSize(8).text(`${key}: ${JSON.stringify(value)}`);
        });
        doc.moveDown();
      });
      doc.end();
    }
    return;
  } catch (error) {
    handleError(error, res, "Error generating farmers report");
    return;
  }
};
