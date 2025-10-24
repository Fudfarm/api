

import ExcelJS from "exceljs";
import { Response } from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { fetchRecentlyUpdatedFarmerData } from "../../v1/auth/userJobStat";

/**
 * Download recently updated farmer data as PDF, XLSX, or CSV
 * @route GET /api/v1/download/farmer-update?updatedFrom=YYYY-MM-DD&updatedTo=YYYY-MM-DD&type=pdf|xlsx|csv
 * @param {AuthenticatedRequest} req
 * @param {Response} res
 */
export const downloadFarmerUpdatesReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { updatedFrom, updatedTo, type = "xlsx" } = req.query;
    if (!updatedFrom || !updatedTo) {
      return res.status(400).json({ message: "Both 'updatedFrom' and 'updatedTo' are required" });
    }

    const data = await fetchRecentlyUpdatedFarmerData(updatedFrom as string, updatedTo as string);
    const farmers = data.farmers || [];
    const summary = data.summary || {};

    // Flatten data for export
    const exportRows = farmers.map((f: any) => {
      return {
        userId: f.userId,
        surname: f.user?.surname || "",
        firstname: f.user?.firstname || "",
        othernames: f.user?.othernames || "",
        email: f.user?.email || "",
        phone: f.user?.phone || "",
        totalUpdates: f.totalUpdates,
        affectedTables: f.affectedTables.map((t: any) => t.tableName).join(", "),
        lastUpdate: f.affectedTables.length > 0 ? f.affectedTables[0].updatedAt : "",
        profileLink: f.profileLink,
      };
    });

    if (type === "csv") {
      // CSV
      const parser = new Parser();
      const csv = parser.parse(exportRows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=farmer-updates-${updatedFrom}-${updatedTo}.csv`);
      return res.send(csv);
    } else if (type === "xlsx") {
      // XLSX
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Farmer Updates");
      sheet.columns = [
        { header: "User ID", key: "userId", width: 24 },
        { header: "Surname", key: "surname", width: 16 },
        { header: "Firstname", key: "firstname", width: 16 },
        { header: "Othernames", key: "othernames", width: 16 },
        { header: "Email", key: "email", width: 24 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Total Updates", key: "totalUpdates", width: 14 },
        { header: "Affected Tables", key: "affectedTables", width: 32 },
        { header: "Last Update", key: "lastUpdate", width: 20 },
        { header: "Profile Link", key: "profileLink", width: 32 },
      ];
      exportRows.forEach((row) => sheet.addRow(row));
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=farmer-updates-${updatedFrom}-${updatedTo}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
      return;
    } else if (type === "pdf") {
      // PDF
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=farmer-updates-${updatedFrom}-${updatedTo}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).text("Farmer Update Changes Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(10).text(`Date Range: ${summary.dateRange?.from || ""} - ${summary.dateRange?.to || ""}`);
      doc.text(`Total Updates: ${summary.totalUpdates || 0}`);
      doc.text(`Total Farmers Affected: ${summary.totalFarmersAffected || 0}`);
      doc.moveDown();

      // Table header
      doc.fontSize(11).text(
        [
          "Surname",
          "Firstname",
          "Othernames",
          "Email",
          "Phone",
          "Total Updates",
          "Affected Tables",
          "Last Update",
        ].join(" | ")
      );
      doc.moveDown(0.5);

      // Table rows
      exportRows.forEach((row) => {
        doc.fontSize(10).text(
          [
            row.surname,
            row.firstname,
            row.othernames,
            row.email,
            row.phone,
            row.totalUpdates,
            row.affectedTables,
            row.lastUpdate,
          ].join(" | ")
        );
      });

      doc.end();
      return;
    } else {
      return res.status(400).json({ message: "Invalid type. Use one of: pdf, xlsx, csv" });
    }
  } catch (error) {
    return handleError(error, res, "Error generating farmer update download");
  }
};
