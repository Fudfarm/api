// download farmer update changes report
import ExcelJS from "exceljs";
import { Response } from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
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
 * Download farmer updates report in various formats (PDF, CSV, XLSX)
 * @param {AuthenticatedRequest} req - Express authenticated request
 * @param {Response} res - Express response
 * @return {Promise<Response>} File download response
 */
export const downloadFarmerUpdatesReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { updatedFrom, updatedTo, reportFormat = "PDF" } = req.query;

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
      parentId: string;
    }

    interface TableUpdate {
      tableName: string;
      updatedCount: number;
      records: RecordData[];
    }

    // Query each table for updates within the date range
    const updatePromises = farmerTables.map(async (table): Promise<TableUpdate> => {
      try {
        // For ShopItems, we need to also select shopLocationID
        const selectFields = table.name === "ShopItems"
          ? "_id recordID updatedAt shopLocationID"
          : "_id recordID updatedAt";

        const records = await (table.model as any)
          .find({
            updatedAt: { $gte: fromDate, $lte: toDate },
          })
          .select(selectFields)
          .lean()
          .exec();

        return {
          tableName: table.name,
          updatedCount: records.length,
          records: records.map((record: any) => ({
            recordId: record._id,
            userId: record.recordID,
            updatedAt: formatDateToShort(record.updatedAt.toISOString(), { includeTime: true }),
            parentId: table.name === "ShopItems" ? (record.shopLocationID || "") : "",
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
              parentId: record.parentId,
              updatedAt: record.updatedAt,
            });
            userUpdate.totalUpdates += 1;
          }
        }
      });
    });

    const farmerUpdates = Array.from(updatesByUser.values());

    // Calculate summary
    const totalUpdates = tablesWithUpdates.reduce((sum, table) => sum + table.updatedCount, 0);
    const totalFarmersAffected = allUserIds.size;

    const summary = {
      totalUpdates,
      totalFarmersAffected,
      tablesAffected: tablesWithUpdates.length,
      dateRange: {
        from: formatDateToShort(fromDate.toISOString(), { includeTime: true }),
        to: formatDateToShort(toDate.toISOString(), { includeTime: true }),
      },
    };

    // Flatten data for export - one row per table update per farmer
    // Only include farmers with valid user data
    const exportData: any[] = [];
    farmerUpdates.forEach((farmer) => {
      // Skip farmers whose user data wasn't found
      if (!farmer.user) {
        return;
      }

      const user = farmer.user;
      farmer.affectedTables.forEach((table: any) => {
        exportData.push({
          "Farmer ID": farmer.userId,
          "Surname": user.surname || "",
          "Firstname": user.firstname || "",
          "Othernames": user.othernames || "",
          "Email": user.email || "",
          "Phone": user.phone || "",
          "Table Updated": table.tableName,
          "Record ID": table.recordId,
          "Parent ID": table.parentId || "",
          "Updated At": table.updatedAt,
          "Farmer Total Updates": farmer.totalUpdates,
        });
      });
    });

    const format = String(reportFormat).toUpperCase();

    // Generate report based on format
    switch (format) {
      case "PDF":
        return generatePDFReport(res, exportData, summary);

      case "CSV":
        return generateCSVReport(res, exportData);

      case "XLSX":
        return generateXLSXReport(res, exportData, summary);

      default:
        return res.status(400).json({
          message: "Invalid report format. Use: PDF, CSV, or XLSX",
        });
    }
  } catch (error) {
    return handleError(error, res, "Error generating farmer updates report");
  }
};

/**
 * Generate PDF report for farmer updates
 * @param {Response} res - Express response
 * @param {any[]} data - Array of formatted update data
 * @param {any} summary - Summary statistics
 */
const generatePDFReport = (res: Response, data: any[], summary: any) => {
  const doc = new PDFDocument({ margin: 25, size: "A4", layout: "landscape" });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=farmer-updates-report-${Date.now()}.pdf`);

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

  // Header
  doc.fontSize(18).text("Farmer Updates Report", margins + 60, margins + 10, { align: "left" });
  doc.fontSize(9);
  const generatedOn = formatDateToShort(new Date().toISOString(), { includeTime: true });
  doc.text(`Generated on: ${generatedOn}`, margins + 60, margins + 32);
  doc.text(`Period: ${summary.dateRange.from} to ${summary.dateRange.to}`, margins + 60, margins + 44);

  // Move down after header
  doc.y = margins + 65;

  // Summary section
  doc.fontSize(10).text("Summary", { underline: true });
  doc.fontSize(8);
  doc.text(`Total Updates: ${summary.totalUpdates}`);
  doc.text(`Farmers Affected: ${summary.totalFarmersAffected}`);
  doc.text(`Tables Affected: ${summary.tablesAffected}`);
  doc.y += 5;

  // Table header - full width table
  doc.fontSize(8).font("Helvetica-Bold");
  const startY = doc.y;
  const headers = ["#", "Surname", "Firstname", "Othernames", "Email", "Phone", "Total Updates", "Table", "Updated At"];

  // Calculate proportional column widths
  const totalParts = 30 + 70 + 70 + 70 + 105 + 75 + 55 + 85 + 95;
  const columnWidths = [
    (30 / totalParts) * pageWidth,
    (70 / totalParts) * pageWidth,
    (70 / totalParts) * pageWidth,
    (70 / totalParts) * pageWidth,
    (105 / totalParts) * pageWidth,
    (75 / totalParts) * pageWidth,
    (55 / totalParts) * pageWidth,
    (85 / totalParts) * pageWidth,
    (95 / totalParts) * pageWidth,
  ];
  const tableWidth = pageWidth;
  const rowHeight = 20;

  // Draw header background with faint border
  doc.strokeColor("#CCCCCC").lineWidth(0.5);
  doc.fillColor("#F5F5F5")
    .rect(margins, startY, tableWidth, rowHeight)
    .fillAndStroke();

  // Draw header text with vertical centering
  doc.fillColor("#000000");
  let xPos = margins;
  headers.forEach((header, i) => {
    const textY = startY + (rowHeight / 2) - 4;
    doc.text(header, xPos + 4, textY, { width: columnWidths[i] - 8, ellipsis: true });
    if (i < headers.length - 1) {
      doc.strokeColor("#CCCCCC").lineWidth(0.5);
      doc.moveTo(xPos + columnWidths[i], startY)
        .lineTo(xPos + columnWidths[i], startY + rowHeight)
        .stroke();
    }
    xPos += columnWidths[i];
  });

  doc.y = startY + rowHeight;
  doc.font("Helvetica");

  // Table rows
  data.forEach((item, index) => {
    const rowY = doc.y;
    const currentRowHeight = 18;

    // Check if we need a new page
    if (rowY + currentRowHeight > doc.page.height - 50) {
      doc.addPage();
      doc.y = margins;

      // Redraw table header on new page
      const newStartY = doc.y;
      doc.strokeColor("#CCCCCC").lineWidth(0.5);
      doc.fillColor("#F5F5F5")
        .rect(margins, newStartY, tableWidth, rowHeight)
        .fillAndStroke();

      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(8);
      let headerXPos = margins;
      headers.forEach((header, i) => {
        const textY = newStartY + (rowHeight / 2) - 4;
        doc.text(header, headerXPos + 4, textY, { width: columnWidths[i] - 8, ellipsis: true });
        if (i < headers.length - 1) {
          doc.strokeColor("#CCCCCC").lineWidth(0.5);
          doc.moveTo(headerXPos + columnWidths[i], newStartY)
            .lineTo(headerXPos + columnWidths[i], newStartY + rowHeight)
            .stroke();
        }
        headerXPos += columnWidths[i];
      });

      doc.y = newStartY + rowHeight;
      doc.font("Helvetica");
    }

    const finalRowY = doc.y;

    // Draw row background (alternating colors) with faint border
    doc.strokeColor("#CCCCCC").lineWidth(0.5);
    if (index % 2 === 0) {
      doc.fillColor("#FAFAFA").rect(margins, finalRowY, tableWidth, currentRowHeight).fillAndStroke();
    } else {
      doc.fillColor("#FFFFFF").rect(margins, finalRowY, tableWidth, currentRowHeight).fillAndStroke();
    }

    // Draw cell content with vertical centering
    doc.fillColor("#000000").fontSize(7);
    let colPos = margins;
    const textY = finalRowY + (currentRowHeight / 2) - 3;

    doc.text(String(index + 1), colPos + 4, textY, { width: columnWidths[0] - 8, ellipsis: true });
    colPos += columnWidths[0];
    doc.text(item.Surname || "", colPos + 4, textY, { width: columnWidths[1] - 8, ellipsis: true });
    colPos += columnWidths[1];
    doc.text(item.Firstname || "", colPos + 4, textY, { width: columnWidths[2] - 8, ellipsis: true });
    colPos += columnWidths[2];
    doc.text(item.Othernames || "", colPos + 4, textY, { width: columnWidths[3] - 8, ellipsis: true });
    colPos += columnWidths[3];
    doc.text(item.Email || "", colPos + 4, textY, { width: columnWidths[4] - 8, ellipsis: true });
    colPos += columnWidths[4];
    doc.text(item.Phone || "", colPos + 4, textY, { width: columnWidths[5] - 8, ellipsis: true });
    colPos += columnWidths[5];
    doc.text(String(item["Farmer Total Updates"] || ""), colPos + 4, textY, { width: columnWidths[6] - 8, ellipsis: true });
    colPos += columnWidths[6];
    doc.text(item["Table Updated"] || "", colPos + 4, textY, { width: columnWidths[7] - 8, ellipsis: true });
    colPos += columnWidths[7];
    doc.text(item["Updated At"] || "", colPos + 4, textY, { width: columnWidths[8] - 8, ellipsis: true });

    // Draw vertical lines between columns
    let linePos = margins;
    for (let i = 1; i < headers.length; i++) {
      linePos += columnWidths[i - 1];
      doc.strokeColor("#CCCCCC").lineWidth(0.5);
      doc.moveTo(linePos, finalRowY)
        .lineTo(linePos, finalRowY + currentRowHeight)
        .stroke();
    }

    doc.y = finalRowY + currentRowHeight;
  });

  // Footer
  const footerY = doc.page.height - 30;
  doc.fontSize(7).text(
    "Report generated from FudFarm System",
    margins,
    footerY,
    { align: "center", width: pageWidth },
  );

  doc.end();
};

/**
 * Generate CSV report for farmer updates
 * @param {Response} res - Express response
 * @param {any[]} data - Array of formatted update data
 * @return {Response} CSV file response
 */
const generateCSVReport = (res: Response, data: any[]) => {
  // Add serial numbers to data
  const dataWithSerial = data.map((item, index) => ({
    "#": index + 1,
    ...item,
  }));

  const fields = [
    "#",
    "Farmer ID",
    "Surname",
    "Firstname",
    "Othernames",
    "Email",
    "Phone",
    "Farmer Total Updates",
    "Table Updated",
    "Parent ID",
    "Updated At",
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(dataWithSerial);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=farmer-updates-report-${Date.now()}.csv`);

  return res.status(200).send(csv);
};

/**
 * Generate XLSX report for farmer updates
 * @param {Response} res - Express response
 * @param {any[]} data - Array of formatted update data
 * @param {any} summary - Summary statistics
 * @return {Promise<void>} XLSX file response
 */
const generateXLSXReport = async (res: Response, data: any[], summary: any) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Farmer Updates");

  // Add summary section
  worksheet.addRow(["Farmer Updates Report"]).font = { bold: true, size: 14 };
  worksheet.addRow([]);
  worksheet.addRow(["Summary"]).font = { bold: true };
  worksheet.addRow(["Total Updates:", summary.totalUpdates]);
  worksheet.addRow(["Farmers Affected:", summary.totalFarmersAffected]);
  worksheet.addRow(["Tables Affected:", summary.tablesAffected]);
  worksheet.addRow(["Date Range:", `${summary.dateRange.from} to ${summary.dateRange.to}`]);
  worksheet.addRow([]);

  // Define columns for data table
  const headerRow = worksheet.addRow([
    "#",
    "Farmer ID",
    "Surname",
    "Firstname",
    "Othernames",
    "Email",
    "Phone",
    "Farmer Total Updates",
    "Table Updated",
    "Parent ID",
    "Updated At",
  ]);

  // Style header row
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  // Set column widths
  worksheet.columns = [
    { width: 8 }, // #
    { width: 25 }, // Farmer ID
    { width: 20 }, // Surname
    { width: 20 }, // Firstname
    { width: 20 }, // Othernames
    { width: 30 }, // Email
    { width: 15 }, // Phone
    { width: 18 }, // Farmer Total Updates
    { width: 20 }, // Table Updated
    { width: 20 }, // Parent ID
    { width: 20 }, // Updated At
  ];

  // Add data rows with serial numbers
  data.forEach((item, index) => {
    worksheet.addRow([
      index + 1,
      item["Farmer ID"],
      item.Surname,
      item.Firstname,
      item.Othernames,
      item.Email,
      item.Phone,
      item["Farmer Total Updates"],
      item["Table Updated"],
      item["Parent ID"],
      item["Updated At"],
    ]);
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=farmer-updates-report-${Date.now()}.xlsx`,
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
};
