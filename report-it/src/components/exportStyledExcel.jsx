// src/components/exportStyledExcel.jsx
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export function useStyledExport(data) {
  const exportStyledExcel = async () => {
    if (!data.length) {
      return alert("No reports to export! 📭");
    }

    // 1️⃣ Create workbook & worksheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Reports");

    // 2️⃣ Define columns (incl. Created By, Status, Images)
    ws.columns = [
        { header: "Created By", key: "createdBy", width: 20 },
      { header: "Project #", key: "projectNumber", width: 15 },
      { header: "Customer", key: "customer", width: 20 },
      { header: "Work Done", key: "workDone", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Priority", key: "priority", width: 12 },
      { header: "Images", key: "imagesCount", width: 10 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // 3️⃣ Style header row
    ws.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1D4ED8" }, // Indigo 600
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // 4️⃣ Helper for workDone join
    const joinWork = (wd) => (Array.isArray(wd) ? wd.join("; ") : wd || "-");

    // 5️⃣ Populate rows
    data.forEach((r) => {
      ws.addRow({
        createdBy: r.createdBy || "-",
        projectNumber: r.projectNumber,
        customer: r.customer,
        workDone: joinWork(r.workDone),
        status: r.status || "-",
        priority: r.priority,
        imagesCount: r.imagesCount ?? 0,
        createdAt: new Date(r.createdAt).toLocaleString(),
      });
    });

    // 6️⃣ Auto-filter & freeze header
    ws.autoFilter = "A1:I1";
    ws.views = [{ state: "frozen", ySplit: 1 }];

    // 7️⃣ Generate & download
    const buf = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `Reports_${Date.now()}.xlsx`
    );
  };

  return exportStyledExcel;
}
