"use client";
import { useState } from "react";
import { AdminCredential } from "../../models/authModel";
import { useSubmissions, SubmissionRecord } from "../../hooks/useSubmissions";
import ExportButtons from "../ui/ExportButtons";

interface Props {
  admin: AdminCredential;
  onLogout: () => void;
}

type Tab = "dashboard" | "reports";

export default function Level1to3Dashboard({ admin, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [filter, setFilter] = useState<
    "thisWeek" | "thisMonth" | "thisYear" | "allTime"
  >("thisWeek");
  const [viewModal, setViewModal] = useState<SubmissionRecord | null>(null);

  const { submissions, stats, loading, approve, reject } = useSubmissions(
    admin.level,
  );

  const pendingForMe = submissions.filter((s) => {
    if (s.status === "Rejected") return false;
    if (admin.level === 1) return !s.approved_by_l1;
    if (admin.level === 2 || admin.level === 3) {
      return (
        s.approved_by_l1 &&
        !s.approved_by_l2 &&
        !s.approved_by_l3 &&
        !s.approved_by_l4
      );
    }
    return false;
  });

  const handleApprove = async (id: number) => {
    await approve(id);
    setViewModal(null);
  };

  const handleReject = async (id: number) => {
    await reject(id);
    setViewModal(null);
  };

  const filterLabels: Record<string, string> = {
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    allTime: "All Time",
  };

  const now = new Date();
  const filteredSubmissions = submissions.filter((s) => {
    if (!s.submitted_at || filter === "allTime") return true;
    const d = new Date(s.submitted_at);
    if (filter === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek;
    }
    if (filter === "thisMonth") {
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }
    if (filter === "thisYear") return d.getFullYear() === now.getFullYear();
    return true;
  });

  const canActOnRecord = (record: SubmissionRecord): boolean => {
    if (record.status === "Rejected") return false;
    if (admin.level === 1) return !record.approved_by_l1;
    if (admin.level === 2 || admin.level === 3) {
      return (
        !!record.approved_by_l1 &&
        !record.approved_by_l2 &&
        !record.approved_by_l3
      );
    }
    return false;
  };

  const handleExportPDF = (record: SubmissionRecord) => {
    const userInfo = record.uaa_user_info[0];
    const sysAccess = record.uaa_system_access[0];
    const modules = record.uaa_modules[0];
    const fullName = userInfo
      ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
      : "—";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Application — ${fullName}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111;font-size:13px;}
        h2{color:#1e3a8a;margin-bottom:4px;}
        .st{font-size:11px;font-weight:700;color:#1e3a8a;text-transform:uppercase;letter-spacing:.08em;border-left:3px solid #1e3a8a;padding-left:8px;margin:20px 0 10px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin-bottom:8px;}
        .fl{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;}
        .fv{font-size:13px;font-weight:600;color:#111;margin-top:2px;}
        .tag{display:inline-block;border:1px solid #d1d5db;border-radius:4px;padding:3px 10px;font-size:12px;margin:3px 4px 3px 0;color:#374151;}
        .tr{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:6px;}
        .dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
        .tl{font-size:12px;color:#374151;flex:1;}
        .bw{background:#fff7ed;color:#f97316;font-size:11px;padding:2px 10px;border-radius:999px;font-weight:600;}
        .bo{background:#dcfce7;color:#16a34a;font-size:11px;padding:2px 10px;border-radius:999px;font-weight:600;}
      </style></head><body>
      <h2>📄 Application — ${fullName}</h2>
      <div class="st">Document Info</div>
      <div class="grid">
        <div><div class="fl">Control No.</div><div class="fv">${record.tracking_id}</div></div>
        <div><div class="fl">Effective Date</div><div class="fv">${record.submitted_at ? new Date(record.submitted_at).toLocaleDateString("en-CA") : "—"}</div></div>
        <div><div class="fl">Office Code</div><div class="fv">${record.office_code ?? "—"}</div></div>
        <div><div class="fl">Date Submitted</div><div class="fv">${record.submitted_at ? new Date(record.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div></div>
      </div>
      <div class="st">I. System Access</div>
      <div class="grid">
        <div><div class="fl">Account Action</div><div class="fv">${sysAccess?.account_type ?? "—"}</div></div>
        <div><div class="fl">Sub-Action</div><div class="fv">—</div></div>
        <div><div class="fl">User Type</div><div class="fv">${sysAccess?.user_type ?? "—"}</div></div>
        <div><div class="fl">Login Mode</div><div class="fv">${sysAccess?.login_mode ?? "—"}</div></div>
      </div>
      <div class="st">II. User Information</div>
      <div class="grid">
        <div><div class="fl">Last Name</div><div class="fv">${userInfo?.last_name ?? "—"}</div></div>
        <div><div class="fl">First Name</div><div class="fv">${userInfo?.first_name ?? "—"}</div></div>
        <div><div class="fl">Middle Name</div><div class="fv">${userInfo?.middle_name ?? "—"}</div></div>
        <div><div class="fl">Designation</div><div class="fv">${userInfo?.designation ?? "—"}</div></div>
        <div><div class="fl">Employee ID</div><div class="fv">${userInfo?.employee_id ?? "—"}</div></div>
        <div><div class="fl">Contact No.</div><div class="fv">${userInfo?.contact_no ?? "—"}</div></div>
      </div>
      <div class="grid"><div><div class="fl">Email</div><div class="fv">${userInfo?.email ?? "—"}</div></div></div>
      ${modules?.selected_modules?.length > 0 ? `<div class="st">III. Modules</div><div>${modules.selected_modules.map((m: string) => `<span class="tag">${m}</span>`).join("")}</div>` : ""}
      <div class="st">IV. Approval Trail</div>
      <div class="tr"><div class="dot" style="background:${record.approved_by_l1 ? "#16a34a" : "#d1d5db"}"></div><div class="tl">Level 1 — Chief of Office</div><span class="${record.approved_by_l1 ? "bo" : "bw"}">${record.approved_by_l1 ? "✅ Approved" : "⏳ Waiting"}</span></div>
      <div class="tr"><div class="dot" style="background:${record.approved_by_l2 ? "#16a34a" : "#d1d5db"}"></div><div class="tl">Level 2 (shared gate)</div><span class="${record.approved_by_l2 ? "bo" : "bw"}">${record.approved_by_l2 ? "✅ Approved" : "⏳ Waiting"}</span></div>
      <div class="tr"><div class="dot" style="background:${record.approved_by_l3 ? "#16a34a" : "#d1d5db"}"></div><div class="tl">Level 3 (shared gate)</div><span class="${record.approved_by_l3 ? "bo" : "bw"}">${record.approved_by_l3 ? "✅ Approved" : "⏳ Waiting"}</span></div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          backgroundColor: "#1e3a8a",
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
            LTO MID 2026 — Admin Portal
          </div>
          <div style={{ fontSize: "0.75rem", color: "#bfdbfe", marginTop: 2 }}>
            {admin.displayName} — {admin.role}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "0.85rem", color: "#dbeafe" }}>
            {admin.displayName}
          </span>
          <button
            onClick={onLogout}
            style={{
              border: "1px solid #fff",
              color: "#fff",
              background: "transparent",
              fontSize: "0.8rem",
              padding: "6px 16px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── TABS ── */}
      <div
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          display: "flex",
          gap: 8,
        }}
      >
        {(["dashboard", "reports"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 4px",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              borderBottom:
                tab === t ? "2px solid #1e3a8a" : "2px solid transparent",
              color: tab === t ? "#1e3a8a" : "#6b7280",
              background: "transparent",
              cursor: "pointer",
              marginRight: 16,
            }}
          >
            {t === "dashboard" ? "📋 Dashboard" : "📊 Reports"}
          </button>
        ))}
      </div>

      <main style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "dashboard" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Overview
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {(
                    ["thisWeek", "thisMonth", "thisYear", "allTime"] as const
                  ).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        border: "1px solid",
                        transition: "all 0.15s",
                        backgroundColor: filter === f ? "#1e3a8a" : "#fff",
                        color: filter === f ? "#fff" : "#6b7280",
                        borderColor: filter === f ? "#1e3a8a" : "#d1d5db",
                      }}
                    >
                      {filterLabels[f]}
                    </button>
                  ))}
                </div>
                <ExportButtons
                  records={filteredSubmissions}
                  filename={`submissions-level${admin.level}-${filter}`}
                  pdfTitle={`UAA Submissions — Level ${admin.level} (${filterLabels[filter]})`}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <StatCard
                value={stats.total}
                label="TOTAL REQUESTS"
                topColor="#1d4ed8"
                numColor="#1d4ed8"
                icon="📄"
              />
              <StatCard
                value={stats.pending}
                label="PENDING"
                topColor="#f97316"
                numColor="#f97316"
                icon="⏳"
              />
              <StatCard
                value={stats.approved}
                label="APPROVED"
                topColor="#16a34a"
                numColor="#16a34a"
                icon="✅"
              />
              <StatCard
                value={stats.rejected}
                label="REJECTED"
                topColor="#ef4444"
                numColor="#ef4444"
                icon="❌"
              />
            </div>

            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  ⏳ Pending — Awaiting Your Approval
                </span>
                {(admin.level === 2 || admin.level === 3) && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      padding: "2px 10px",
                      borderRadius: 999,
                      fontWeight: 500,
                    }}
                  >
                    Shared gate — Level 2 &amp; 3 (first to act wins)
                  </span>
                )}
              </div>
              {loading ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                  }}
                >
                  Loading submissions...
                </div>
              ) : pendingForMe.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                  }}
                >
                  No pending requests for your approval level.
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.875rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {[
                        "APPLICANT",
                        "DATE SUBMITTED",
                        "OFFICE CODE",
                        "ACCOUNT TYPE",
                        "ACTIONS",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 20px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: "#6b7280",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingForMe.map((req, i) => {
                      const userInfo = req.uaa_user_info[0];
                      const sysAccess = req.uaa_system_access[0];
                      const fullName = userInfo
                        ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
                        : "—";
                      return (
                        <tr
                          key={req.id}
                          style={{
                            borderBottom: "1px solid #f9fafb",
                            backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                          }}
                        >
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontWeight: 600, color: "#111827" }}>
                              {fullName}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                                marginTop: 2,
                              }}
                            >
                              {userInfo?.designation ?? "—"} •{" "}
                              {userInfo?.employee_id ?? "—"}
                            </div>
                          </td>
                          <td
                            style={{ padding: "14px 20px", color: "#4b5563" }}
                          >
                            {req.submitted_at
                              ? new Date(req.submitted_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </td>
                          <td
                            style={{ padding: "14px 20px", color: "#4b5563" }}
                          >
                            {req.office_code ?? "—"}
                          </td>
                          <td
                            style={{ padding: "14px 20px", color: "#4b5563" }}
                          >
                            {sysAccess?.account_type ?? "—"}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <ActionBtn
                                onClick={() => setViewModal(req)}
                                color="#6b7280"
                                borderColor="#d1d5db"
                                label="👁 View"
                              />
                              <ActionBtn
                                onClick={() => handleApprove(req.id)}
                                color="#16a34a"
                                borderColor="#4ade80"
                                label="✅ Approve"
                              />
                              <ActionBtn
                                onClick={() => handleReject(req.id)}
                                color="#ef4444"
                                borderColor="#f87171"
                                label="❌ Reject"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={{
                marginTop: 16,
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 12,
                padding: "12px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1d4ed8",
                  marginBottom: 8,
                }}
              >
                Approval Chain Status
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <ChainLevel
                  lvl={1}
                  label="Level 1 Approver"
                  adminLevel={admin.level}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: "1px dashed #bfdbfe",
                    borderRadius: 8,
                    padding: "4px 10px",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    Either:
                  </span>
                  <ChainLevel
                    lvl={2}
                    label="Level 2"
                    adminLevel={admin.level}
                  />
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    or
                  </span>
                  <ChainLevel
                    lvl={3}
                    label="Level 3"
                    adminLevel={admin.level}
                  />
                </div>
                <ChainLevel
                  lvl={4}
                  label="Level 4 (Implementor)"
                  adminLevel={admin.level}
                />
              </div>
            </div>
          </>
        )}

        {tab === "reports" && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, color: "#111827" }}>
                📊 All Submissions Report
              </span>
              <ExportButtons
                records={submissions}
                filename={`all-submissions-level${admin.level}`}
                pdfTitle={`All UAA Submissions — Level ${admin.level}`}
              />
            </div>
            {loading ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                }}
              >
                Loading...
              </div>
            ) : submissions.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                }}
              >
                No submissions found.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {[
                      "TRACKING ID",
                      "APPLICANT",
                      "OFFICE CODE",
                      "ACCOUNT TYPE",
                      "DATE SUBMITTED",
                      "STATUS",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 20px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#6b7280",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((req, i) => {
                    const userInfo = req.uaa_user_info[0];
                    const sysAccess = req.uaa_system_access[0];
                    const fullName = userInfo
                      ? `${userInfo.last_name}, ${userInfo.first_name}`.trim()
                      : "—";
                    const isRejected = req.status === "Rejected";
                    const isProcessed = req.approved_by_l4;
                    return (
                      <tr
                        key={req.id}
                        style={{
                          borderBottom: "1px solid #f9fafb",
                          backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 20px",
                            color: "#6b7280",
                            fontSize: "0.8rem",
                          }}
                        >
                          {req.tracking_id}
                        </td>
                        <td
                          style={{
                            padding: "12px 20px",
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {fullName}
                        </td>
                        <td style={{ padding: "12px 20px", color: "#4b5563" }}>
                          {req.office_code ?? "—"}
                        </td>
                        <td style={{ padding: "12px 20px", color: "#4b5563" }}>
                          {sysAccess?.account_type ?? "—"}
                        </td>
                        <td style={{ padding: "12px 20px", color: "#4b5563" }}>
                          {req.submitted_at
                            ? new Date(req.submitted_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              padding: "3px 10px",
                              borderRadius: 999,
                              backgroundColor: isRejected
                                ? "#fef2f2"
                                : isProcessed
                                  ? "#f0fdf4"
                                  : "#fff7ed",
                              color: isRejected
                                ? "#ef4444"
                                : isProcessed
                                  ? "#16a34a"
                                  : "#f97316",
                            }}
                          >
                            {isRejected
                              ? "❌ Rejected"
                              : isProcessed
                                ? "✅ Processed"
                                : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════
          VIEW MODAL — redesigned to match Image 1
      ══════════════════════════════════════════════════ */}
      {viewModal &&
        (() => {
          const userInfo = viewModal.uaa_user_info[0];
          const sysAccess = viewModal.uaa_system_access[0];
          const modules = viewModal.uaa_modules[0];
          const fullName = userInfo
            ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
            : "—";
          const isRejected = viewModal.status === "Rejected";

          const trailLevels = [
            {
              label: "Level 1 — Chief of Office",
              approved: viewModal.approved_by_l1,
              shared: false,
            },
            {
              label: "Level 2",
              approved: viewModal.approved_by_l2,
              shared: true,
            },
            {
              label: "Level 3",
              approved: viewModal.approved_by_l3,
              shared: true,
            },
          ];

          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                padding: 16,
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
                  width: "100%",
                  maxWidth: 680,
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Header — dark blue like Image 1 */}
                <div
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "#fff",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: "1rem" }}>📄</span>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      Application — {fullName}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewModal(null)}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      color: "#fff",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable body */}
                <div
                  style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}
                >
                  {/* DOCUMENT INFO */}
                  <SectionTitle label="Document Info" />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px 32px",
                      marginBottom: 4,
                    }}
                  >
                    <InfoField
                      label="Control No."
                      value={viewModal.tracking_id}
                    />
                    <InfoField
                      label="Effective Date"
                      value={
                        viewModal.submitted_at
                          ? new Date(viewModal.submitted_at).toLocaleDateString(
                              "en-CA",
                            )
                          : "—"
                      }
                    />
                    <InfoField
                      label="Office Code"
                      value={viewModal.office_code ?? "—"}
                    />
                    <InfoField
                      label="Date Submitted"
                      value={
                        viewModal.submitted_at
                          ? new Date(viewModal.submitted_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"
                      }
                    />
                  </div>

                  {/* I. SYSTEM ACCESS */}
                  <SectionTitle label="I. System Access" />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px 32px",
                      marginBottom: 4,
                    }}
                  >
                    <InfoField
                      label="Account Action"
                      value={sysAccess?.account_type ?? "—"}
                    />
                    <InfoField label="Sub-Action" value="—" />
                    <InfoField
                      label="User Type"
                      value={sysAccess?.user_type ?? "—"}
                    />
                    <InfoField
                      label="Login Mode"
                      value={sysAccess?.login_mode ?? "—"}
                    />
                  </div>

                  {/* II. USER INFORMATION */}
                  <SectionTitle label="II. User Information" />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px 32px",
                      marginBottom: 4,
                    }}
                  >
                    <InfoField
                      label="Last Name"
                      value={userInfo?.last_name ?? "—"}
                    />
                    <InfoField
                      label="First Name"
                      value={userInfo?.first_name ?? "—"}
                    />
                    <InfoField
                      label="Middle Name"
                      value={userInfo?.middle_name ?? "—"}
                    />
                    <InfoField
                      label="Designation"
                      value={userInfo?.designation ?? "—"}
                    />
                    <InfoField
                      label="Employee ID"
                      value={userInfo?.employee_id ?? "—"}
                    />
                    <InfoField
                      label="Contact No."
                      value={userInfo?.contact_no ?? "—"}
                    />
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <InfoField label="Email" value={userInfo?.email ?? "—"} />
                  </div>

                  {/* III. MODULES */}
                  {modules?.selected_modules?.length > 0 && (
                    <>
                      <SectionTitle label="III. Modules" />
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        {modules.selected_modules.map(
                          (m: string, idx: number) => (
                            <span
                              key={idx}
                              style={{
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                padding: "4px 12px",
                                fontSize: "0.75rem",
                                color: "#374151",
                                backgroundColor: "#f9fafb",
                              }}
                            >
                              {m}
                            </span>
                          ),
                        )}
                      </div>
                    </>
                  )}

                  {/* IV. APPROVAL TRAIL */}
                  <SectionTitle label="IV. Approval Trail" />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {trailLevels.map(({ label, approved, shared }, idx) => {
                      const gateClosedByOther =
                        shared &&
                        ((idx === 1 &&
                          !viewModal.approved_by_l2 &&
                          viewModal.approved_by_l3) ||
                          (idx === 2 &&
                            !viewModal.approved_by_l3 &&
                            viewModal.approved_by_l2));

                      let dotColor = "#d1d5db";
                      let badgeBg = "#fff7ed";
                      let badgeColor = "#f97316";
                      let badgeText = "⏳ Waiting";

                      if (isRejected) {
                        dotColor = "#ef4444";
                        badgeBg = "#fef2f2";
                        badgeColor = "#ef4444";
                        badgeText = "❌ Rejected";
                      } else if (approved) {
                        dotColor = "#16a34a";
                        badgeBg = "#dcfce7";
                        badgeColor = "#16a34a";
                        badgeText = "✅ Approved";
                      } else if (gateClosedByOther) {
                        dotColor = "#e5e7eb";
                        badgeBg = "#f3f4f6";
                        badgeColor = "#9ca3af";
                        badgeText = "— N/A";
                      }

                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: dotColor,
                              flexShrink: 0,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              flex: 1,
                              fontSize: "0.82rem",
                              color: "#374151",
                            }}
                          >
                            {label}
                            {shared && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#9ca3af",
                                  marginLeft: 6,
                                }}
                              >
                                (shared gate)
                              </span>
                            )}
                            {" — "}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              padding: "3px 12px",
                              borderRadius: 999,
                              backgroundColor: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {badgeText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: "12px 20px",
                    borderTop: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  {canActOnRecord(viewModal) && (
                    <>
                      <button
                        onClick={() => handleApprove(viewModal.id)}
                        style={{
                          fontSize: "0.875rem",
                          padding: "10px 24px",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "#16a34a",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(viewModal.id)}
                        style={{
                          fontSize: "0.875rem",
                          padding: "10px 24px",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "#ef4444",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleExportPDF(viewModal)}
                    style={{
                      fontSize: "0.875rem",
                      padding: "10px 18px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: "#fff",
                      color: "#374151",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    🖨 Export PDF
                  </button>
                  <button
                    onClick={() => setViewModal(null)}
                    style={{
                      fontSize: "0.875rem",
                      padding: "10px 18px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: "#fff",
                      color: "#6b7280",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "16px 0 10px",
      }}
    >
      <div
        style={{
          width: 3,
          height: 16,
          backgroundColor: "#1e3a8a",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "#1e3a8a",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}

function ChainLevel({
  lvl,
  label,
  adminLevel,
}: {
  lvl: number;
  label: string;
  adminLevel: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          display: "inline-block",
          backgroundColor:
            lvl === adminLevel
              ? "#2563eb"
              : lvl < adminLevel
                ? "#16a34a"
                : "#d1d5db",
        }}
      />
      <span
        style={{
          fontSize: "0.75rem",
          color: lvl === adminLevel ? "#1d4ed8" : "#6b7280",
          fontWeight: lvl === adminLevel ? 600 : 400,
        }}
      >
        {label}
        {lvl === adminLevel ? " ← You" : ""}
      </span>
    </div>
  );
}

function StatCard({
  value,
  label,
  topColor,
  numColor,
  icon,
}: {
  value: number;
  label: string;
  topColor: string;
  numColor: string;
  icon: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        borderTop: `4px solid ${topColor}`,
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: numColor,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginTop: 6,
          }}
        >
          {label}
        </div>
      </div>
      <span style={{ fontSize: "1.5rem", opacity: 0.15 }}>{icon}</span>
    </div>
  );
}

function ActionBtn({
  onClick,
  color,
  borderColor,
  label,
}: {
  onClick: () => void;
  color: string;
  borderColor: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.75rem",
        padding: "6px 12px",
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        color,
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
