// ── UTILITY: utils/exportSubmissions.ts ──────────────────────────────
// Handles PDF and Excel export of submission records.
// Used by both Level1to3Dashboard and Level4Dashboard.

import { SubmissionRecord } from "../hooks/useSubmissions";

// ── Flatten a record into a plain row object ──────────────────────────
function flattenRecord(r: SubmissionRecord) {
  const u = r.uaa_user_info[0];
  const s = r.uaa_system_access[0];
  const m = r.uaa_modules[0];

  return {
    "Tracking ID": r.tracking_id ?? "—",
    "Control No": r.control_no ?? "—",
    "Office Code": r.office_code ?? "—",
    Status: r.status ?? "—",
    "Date Submitted": r.submitted_at
      ? new Date(r.submitted_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    "Effective Date": r.effective_date ?? "—",
    // User Info
    "Last Name": u?.last_name ?? "—",
    "First Name": u?.first_name ?? "—",
    "Middle Name": u?.middle_name ?? "—",
    Designation: u?.designation ?? "—",
    "Employee ID": u?.employee_id ?? "—",
    "Contact No": u?.contact_no ?? "—",
    Email: u?.email ?? "—",
    // System Access
    "Account Type": s?.account_type ?? "—",
    "User Type": s?.user_type ?? "—",
    "Login Mode": s?.login_mode ?? "—",
    "Existing Sub": s?.existing_sub ?? "—",
    "From Office": s?.from_office_code ?? "—",
    "To Office": s?.to_office_code ?? "—",
    // Modules
    Modules: m?.selected_modules?.join(", ") ?? "—",
    "Others (Modules)": m?.others_text ?? "—",
    // Approval Chain
    "L1 Approved": r.approved_by_l1 ? "Yes" : "No",
    "L2 Approved": r.approved_by_l2 ? "Yes" : "No",
    "L3 Approved": r.approved_by_l3 ? "Yes" : "No",
    "L4 Processed": r.approved_by_l4 ? "Yes" : "No",
  };
}

// ── EXCEL EXPORT ─────────────────────────────────────────────────────
export async function exportToExcel(
  records: SubmissionRecord[],
  filename = "submissions",
) {
  const XLSX = await import("xlsx");

  const rows = records.map(flattenRecord);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto column widths
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length),
    ),
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// ── PDF EXPORT ───────────────────────────────────────────────────────
export async function exportToPdf(
  records: SubmissionRecord[],
  title = "UAA Submissions Report",
  filename = "submissions",
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("LTO MID 2026 — Admin Portal", 14, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 17);
  doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 297 - 14, 17, {
    align: "right",
  });

  // Table columns — split into two groups for readability
  const columns = [
    { header: "Tracking ID", dataKey: "Tracking ID" },
    { header: "Control No", dataKey: "Control No" },
    { header: "Office Code", dataKey: "Office Code" },
    { header: "Status", dataKey: "Status" },
    { header: "Date Submitted", dataKey: "Date Submitted" },
    { header: "Last Name", dataKey: "Last Name" },
    { header: "First Name", dataKey: "First Name" },
    { header: "Designation", dataKey: "Designation" },
    { header: "Employee ID", dataKey: "Employee ID" },
    { header: "Email", dataKey: "Email" },
    { header: "Account Type", dataKey: "Account Type" },
    { header: "User Type", dataKey: "User Type" },
    { header: "Login Mode", dataKey: "Login Mode" },
    { header: "Modules", dataKey: "Modules" },
    { header: "L1", dataKey: "L1 Approved" },
    { header: "L2", dataKey: "L2 Approved" },
    { header: "L3", dataKey: "L3 Approved" },
    { header: "L4", dataKey: "L4 Processed" },
  ];

  const rows = records.map(flattenRecord);

  autoTable(doc, {
    startY: 26,
    columns,
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 6.5,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    didDrawCell: (data) => {
      // Color-code Status column
      if (data.column.dataKey === "Status" && data.section === "body") {
        const val = String(data.cell.raw ?? "");
        if (val === "Rejected") {
          doc.setFillColor(254, 226, 226);
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            "F",
          );
          doc.setTextColor(220, 38, 38);
          doc.setFontSize(6.5);
          doc.text(val, data.cell.x + 1, data.cell.y + 3.5);
        } else if (val === "Approved" || val === "Processed") {
          doc.setFillColor(220, 252, 231);
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            "F",
          );
          doc.setTextColor(22, 163, 74);
          doc.setFontSize(6.5);
          doc.text(val, data.cell.x + 1, data.cell.y + 3.5);
        }
        doc.setTextColor(0, 0, 0);
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      297 / 2,
      doc.internal.pageSize.height - 5,
      { align: "center" },
    );
  }

  doc.save(`${filename}.pdf`);
}
