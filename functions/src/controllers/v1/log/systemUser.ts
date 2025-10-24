import ExcelJS from "exceljs";
import { Response } from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { handleError } from "../../../function/error";
import { formatDateToShort } from "../../../function/function3";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

/**
 * Helper to clean and sanitize query strings
 * @param {string} str - String to clean
 * @return {string} Cleaned string
 */
const cleanStr = (str: string): string => {
  return str.trim();
};

/**
 * Download system users report in various formats (PDF, CSV, XLSX)
 * @param {AuthenticatedRequest} req - Express authenticated request
 * @param {Response} res - Express response
 * @return {Promise<Response>} File download response
 */
export const downloadSystemUsersReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      firstname,
      othernames,
      surname,
      status = "Active",
      role = "All",
      createdAtStart,
      createdAtEnd,
      birthdateFrom,
      birthdateTo,
      maritalStatus,
      gender,
      reportFormat = "PDF",
    } = req.query;

    // Build filter
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

    // Query users
    const users = await User.find(filter)
      .select("_id surname firstname othernames email phone role status gender maritalStatus birthdate createdAt")
      .lean();

    // Format data for export
    const formattedUsers = users.map((user: any) => ({
      "ID": user._id,
      "Surname": user.surname || "",
      "Firstname": user.firstname || "",
      "Othernames": user.othernames || "",
      "Email": user.email || "",
      "Phone": user.phone || "",
      "Role": user.role || "",
      "Status": user.status || "",
      "Gender": user.gender || "",
      "Marital Status": user.maritalStatus || "",
      "Birthdate": user.birthdate ? formatDateToShort(user.birthdate.toISOString(), { includeTime: false }) : "",
      "Created At": user.createdAt ? formatDateToShort(user.createdAt.toISOString(), { includeTime: true }) : "",
    }));

    const format = String(reportFormat).toUpperCase();

    // Generate report based on format
    switch (format) {
      case "PDF":
        return generatePDFReport(res, formattedUsers, filter);

      case "CSV":
        return generateCSVReport(res, formattedUsers);

      case "XLSX":
        return generateXLSXReport(res, formattedUsers);

      default:
        return res.status(400).json({
          message: "Invalid report format. Use: PDF, CSV, or XLSX",
        });
    }
  } catch (error) {
    return handleError(error, res, "Error generating system users report");
  }
};

/**
 * Generate PDF report
 * @param {Response} res - Express response
 * @param {any[]} users - Array of formatted user data
 * @param {any} filter - Applied filter object
 */
const generatePDFReport = (res: Response, users: any[], filter: any) => {
  const doc = new PDFDocument({ margin: 50, size: "A4", layout: "landscape" });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=system-users-report-${Date.now()}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).text("System Users Report", { align: "center" });
  doc.moveDown();
  const generatedOn = formatDateToShort(new Date().toISOString(), { includeTime: true });
  doc.fontSize(10).text(`Generated on: ${generatedOn}`, { align: "center" });
  doc.text(`Total Records: ${users.length}`, { align: "center" });
  doc.moveDown();

  // Filter summary
  if (Object.keys(filter).length > 0) {
    doc.fontSize(12).text("Filters Applied:", { underline: true });
    doc.fontSize(10);
    Object.entries(filter).forEach(([key, value]: [string, any]) => {
      if (typeof value === "object" && !value.$regex) {
        doc.text(`${key}: ${JSON.stringify(value)}`);
      } else if (value.$regex) {
        doc.text(`${key}: ${value.$regex}`);
      } else {
        doc.text(`${key}: ${value}`);
      }
    });
    doc.moveDown();
  }

  // Table header
  doc.fontSize(10).font("Helvetica-Bold");
  const startY = doc.y;
  const colWidth = 85;
  const headers = ["Surname", "Firstname", "Email", "Phone", "Role", "Status", "Gender", "Created At"];

  headers.forEach((header, i) => {
    doc.text(header, 50 + i * colWidth, startY, { width: colWidth - 5, ellipsis: true });
  });

  doc.moveDown();
  doc.font("Helvetica");

  // Table rows
  users.forEach((user) => {
    if (doc.y > 500) {
      doc.addPage();
    }

    const rowY = doc.y;
    doc.fontSize(8);
    doc.text(user.Surname, 50, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user.Firstname, 50 + colWidth, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user.Email, 50 + colWidth * 2, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user.Phone, 50 + colWidth * 3, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user.Role, 50 + colWidth * 4, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user.Status, 50 + colWidth * 5, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user.Gender, 50 + colWidth * 6, rowY, { width: colWidth - 5, ellipsis: true });
    doc.text(user["Created At"], 50 + colWidth * 7, rowY, { width: colWidth - 5, ellipsis: true });

    doc.moveDown(0.5);
  });

  // Footer
  doc.fontSize(8).text(
    "Report generated from FudFarm System",
    50,
    doc.page.height - 50,
    { align: "center" },
  );

  doc.end();
};

/**
 * Generate CSV report
 * @param {Response} res - Express response
 * @param {any[]} users - Array of formatted user data
 * @return {Response} CSV file response
 */
const generateCSVReport = (res: Response, users: any[]) => {
  const fields = [
    "ID",
    "Surname",
    "Firstname",
    "Othernames",
    "Email",
    "Phone",
    "Role",
    "Status",
    "Gender",
    "Marital Status",
    "Birthdate",
    "Created At",
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(users);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=system-users-report-${Date.now()}.csv`);

  return res.status(200).send(csv);
};

/**
 * Generate XLSX report
 * @param {Response} res - Express response
 * @param {any[]} users - Array of formatted user data
 * @return {Promise<void>} XLSX file response
 */
const generateXLSXReport = async (res: Response, users: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("System Users");

  // Define columns
  worksheet.columns = [
    { header: "ID", key: "ID", width: 25 },
    { header: "Surname", key: "Surname", width: 20 },
    { header: "Firstname", key: "Firstname", width: 20 },
    { header: "Othernames", key: "Othernames", width: 20 },
    { header: "Email", key: "Email", width: 30 },
    { header: "Phone", key: "Phone", width: 15 },
    { header: "Role", key: "Role", width: 15 },
    { header: "Status", key: "Status", width: 12 },
    { header: "Gender", key: "Gender", width: 12 },
    { header: "Marital Status", key: "Marital Status", width: 15 },
    { header: "Birthdate", key: "Birthdate", width: 15 },
    { header: "Created At", key: "Created At", width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  // Add data
  users.forEach((user) => {
    worksheet.addRow(user);
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=system-users-report-${Date.now()}.xlsx`,
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
};
