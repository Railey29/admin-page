"use client";
// ── COMPONENT: components/ui/ExportButtons.tsx ────────────────────────
// Reusable export buttons used by Level1to3Dashboard and Level4Dashboard.

import { useState } from "react";
import { SubmissionRecord } from "../../hooks/useSubmissions";
import { exportToExcel, exportToPdf } from "../../utils/exportSubmissions";

interface Props {
  records: SubmissionRecord[];
  filename?: string;
  pdfTitle?: string;
}

export default function ExportButtons({
  records,
  filename = "submissions",
  pdfTitle = "UAA Submissions Report",
}: Props) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingXlsx, setLoadingXlsx] = useState(false);

  const handlePdf = async () => {
    if (!records.length) return;
    setLoadingPdf(true);
    try {
      await exportToPdf(records, pdfTitle, filename);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleExcel = async () => {
    if (!records.length) return;
    setLoadingXlsx(true);
    try {
      await exportToExcel(records, filename);
    } finally {
      setLoadingXlsx(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={handleExcel}
        disabled={loadingXlsx || !records.length}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.78rem",
          padding: "7px 14px",
          borderRadius: 8,
          border: "1px solid #16a34a",
          color: "#16a34a",
          background: "#fff",
          cursor: loadingXlsx || !records.length ? "not-allowed" : "pointer",
          opacity: !records.length ? 0.5 : 1,
          fontWeight: 500,
        }}
      >
        {loadingXlsx ? "⏳" : "📊"} {loadingXlsx ? "Exporting..." : "Excel"}
      </button>
      <button
        onClick={handlePdf}
        disabled={loadingPdf || !records.length}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.78rem",
          padding: "7px 14px",
          borderRadius: 8,
          border: "1px solid #ef4444",
          color: "#ef4444",
          background: "#fff",
          cursor: loadingPdf || !records.length ? "not-allowed" : "pointer",
          opacity: !records.length ? 0.5 : 1,
          fontWeight: 500,
        }}
      >
        {loadingPdf ? "⏳" : "📄"} {loadingPdf ? "Exporting..." : "PDF"}
      </button>
    </div>
  );
}
