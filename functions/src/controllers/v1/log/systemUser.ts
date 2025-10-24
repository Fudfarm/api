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
  const doc = new PDFDocument({ margin: 25, size: "A4", layout: "landscape" });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=system-users-report-${Date.now()}.pdf`);

  doc.pipe(res);

  const margins = 25;
  const pageWidth = doc.page.width - (margins * 2);

  // Logo - positioned at top left
  const logoUrl = "https://habideenibrahim.com.ng/images/logo/logo.png";
  try {
    doc.image(logoUrl, margins, margins, { width: 50, height: 50 });
  } catch (error) {
    // If logo fails to load, continue without it
  }

  // Header - account for logo space
  doc.fontSize(18).text("System Users Report", margins + 60, margins + 10, { align: "left" });
  doc.fontSize(9);
  const generatedOn = formatDateToShort(new Date().toISOString(), { includeTime: true });
  doc.text(`Generated on: ${generatedOn}`, margins + 60, margins + 32);
  doc.text(`Total Records: ${users.length}`, margins + 60, margins + 44);

  // Move down after header
  doc.y = margins + 65;

  // Filter summary
  if (Object.keys(filter).length > 0) {
    doc.fontSize(9).text("Filters Applied:", { underline: true });
    doc.fontSize(7);
    Object.entries(filter).forEach(([key, value]: [string, any]) => {
      if (typeof value === "object" && !value.$regex) {
        doc.text(`${key}: ${JSON.stringify(value)}`);
      } else if (value.$regex) {
        doc.text(`${key}: ${value.$regex}`);
      } else {
        doc.text(`${key}: ${value}`);
      }
    });
    doc.y += 5; // Small gap after filters
  }

  // Table header - full width table
  doc.fontSize(8).font("Helvetica-Bold");
  const startY = doc.y;
  const headers = ["Surname", "Firstname", "Othernames", "Email", "Phone", "Role", "Status", "Gender", "Created"];

  // Calculate proportional column widths to span full page width
  const totalParts = 70 + 70 + 70 + 120 + 70 + 60 + 55 + 50 + 80; // Sum of proportions
  const columnWidths = [
    (70 / totalParts) * pageWidth,
    (70 / totalParts) * pageWidth,
    (70 / totalParts) * pageWidth,
    (120 / totalParts) * pageWidth,
    (70 / totalParts) * pageWidth,
    (60 / totalParts) * pageWidth,
    (55 / totalParts) * pageWidth,
    (50 / totalParts) * pageWidth,
    (80 / totalParts) * pageWidth,
  ];
  const tableWidth = pageWidth;
  const rowHeight = 20; // Increased for better padding

  // Draw header background with faint border
  doc.strokeColor("#CCCCCC").lineWidth(0.5);
  doc.fillColor("#F5F5F5")
    .rect(margins, startY, tableWidth, rowHeight)
    .fillAndStroke();

  // Draw header text with vertical centering
  doc.fillColor("#000000");
  let xPos = margins;
  headers.forEach((header, i) => {
    const textY = startY + (rowHeight / 2) - 4; // Vertically center text
    doc.text(header, xPos + 4, textY, { width: columnWidths[i] - 8, ellipsis: true });
    // Draw vertical lines between columns
    if (i < headers.length - 1) {
      doc.strokeColor("#CCCCCC").lineWidth(0.5);
      doc.moveTo(xPos + columnWidths[i], startY)
        .lineTo(xPos + columnWidths[i], startY + rowHeight)
        .stroke();
    }
    xPos += columnWidths[i];
  });

  // Set position for first row (no gap)
  doc.y = startY + rowHeight;
  doc.font("Helvetica");

  // Table rows
  users.forEach((user, index) => {
    // Check if we need a new page
    if (doc.y > 530) {
      doc.addPage();
      doc.y = margins;
    }

    const rowY = doc.y;
    const currentRowHeight = 18; // Good padding top and bottom

    // Draw row background (alternating colors) with faint border
    doc.strokeColor("#CCCCCC").lineWidth(0.5);
    if (index % 2 === 0) {
      doc.fillColor("#FAFAFA").rect(margins, rowY, tableWidth, currentRowHeight).fillAndStroke();
    } else {
      doc.fillColor("#FFFFFF").rect(margins, rowY, tableWidth, currentRowHeight).fillAndStroke();
    }

    // Draw cell content with vertical centering
    doc.fillColor("#000000").fontSize(7);
    let colPos = margins;
    const textY = rowY + (currentRowHeight / 2) - 3; // Vertically center text

    doc.text(user.Surname || "", colPos + 4, textY, { width: columnWidths[0] - 8, ellipsis: true });
    colPos += columnWidths[0];
    doc.text(user.Firstname || "", colPos + 4, textY, { width: columnWidths[1] - 8, ellipsis: true });
    colPos += columnWidths[1];
    doc.text(user.Othernames || "", colPos + 4, textY, { width: columnWidths[2] - 8, ellipsis: true });
    colPos += columnWidths[2];
    doc.text(user.Email || "", colPos + 4, textY, { width: columnWidths[3] - 8, ellipsis: true });
    colPos += columnWidths[3];
    doc.text(user.Phone || "", colPos + 4, textY, { width: columnWidths[4] - 8, ellipsis: true });
    colPos += columnWidths[4];
    doc.text(user.Role || "", colPos + 4, textY, { width: columnWidths[5] - 8, ellipsis: true });
    colPos += columnWidths[5];
    doc.text(user.Status || "", colPos + 4, textY, { width: columnWidths[6] - 8, ellipsis: true });
    colPos += columnWidths[6];
    doc.text(user.Gender || "", colPos + 4, textY, { width: columnWidths[7] - 8, ellipsis: true });
    colPos += columnWidths[7];
    doc.text(user["Created At"] || "", colPos + 4, textY, { width: columnWidths[8] - 8, ellipsis: true });

    // Draw vertical lines between columns
    let linePos = margins;
    for (let i = 1; i < headers.length; i++) {
      linePos += columnWidths[i - 1];
      doc.strokeColor("#CCCCCC").lineWidth(0.5);
      doc.moveTo(linePos, rowY)
        .lineTo(linePos, rowY + currentRowHeight)
        .stroke();
    }

    // Move to next row (no gap)
    doc.y = rowY + currentRowHeight;
  });

  // Footer
  doc.fontSize(7).text(
    "Report generated from FudFarm System",
    margins,
    doc.page.height - 30,
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
