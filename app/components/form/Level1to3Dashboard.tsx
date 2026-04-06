"use client";
import { useState } from "react";
import { AdminCredential } from "../../models/authModel";
import { useSubmissions, SubmissionRecord } from "../../hooks/useSubmissions";

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

  const { submissions, pendingForMe, stats, loading, approve, reject } =
    useSubmissions(admin.level);

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
            {/* ── OVERVIEW + FILTER ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Overview
              </h2>
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
            </div>

            {/* ── STAT CARDS ── */}
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

            {/* ── PENDING TABLE ── */}
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
                }}
              >
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  ⏳ Pending — Awaiting Your Approval
                </span>
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

            {/* ── APPROVAL CHAIN LEGEND ── */}
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
              <div style={{ display: "flex", gap: 24 }}>
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        display: "inline-block",
                        backgroundColor:
                          lvl === admin.level
                            ? "#2563eb"
                            : lvl < admin.level
                              ? "#16a34a"
                              : "#d1d5db",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: lvl === admin.level ? "#1d4ed8" : "#6b7280",
                        fontWeight: lvl === admin.level ? 600 : 400,
                      }}
                    >
                      Level {lvl}
                      {lvl === 4 ? " (Implementor)" : " Approver"}
                      {lvl === admin.level ? " ← You" : ""}
                    </span>
                  </div>
                ))}
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
              padding: 48,
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📊</div>
            <div style={{ fontWeight: 500 }}>Reports coming soon</div>
          </div>
        )}
      </main>

      {/* ── VIEW MODAL ── */}
      {viewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
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
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              width: "100%",
              maxWidth: 500,
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, color: "#111827" }}>
                Request Details
              </span>
              <button
                onClick={() => setViewModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "#9ca3af",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {(() => {
                const userInfo = viewModal.uaa_user_info[0];
                const sysAccess = viewModal.uaa_system_access[0];
                const modules = viewModal.uaa_modules[0];
                const fullName = userInfo
                  ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
                  : "—";
                return (
                  <>
                    <ModalRow
                      label="Tracking ID"
                      value={viewModal.tracking_id}
                    />
                    <ModalRow label="Applicant" value={fullName} />
                    <ModalRow
                      label="Position"
                      value={`${userInfo?.designation ?? "—"} • ${userInfo?.employee_id ?? "—"}`}
                    />
                    <ModalRow
                      label="Office Code"
                      value={viewModal.office_code ?? "—"}
                    />
                    <ModalRow
                      label="Account Type"
                      value={sysAccess?.account_type ?? "—"}
                    />
                    <ModalRow
                      label="User Type"
                      value={sysAccess?.user_type ?? "—"}
                    />
                    <ModalRow
                      label="Login Mode"
                      value={sysAccess?.login_mode ?? "—"}
                    />
                    <ModalRow
                      label="Date Submitted"
                      value={
                        viewModal.submitted_at
                          ? new Date(
                              viewModal.submitted_at,
                            ).toLocaleDateString()
                          : "—"
                      }
                    />
                    {modules?.selected_modules?.length > 0 && (
                      <ModalRow
                        label="Modules"
                        value={modules.selected_modules.join(", ")}
                      />
                    )}
                    <div
                      style={{
                        borderTop: "1px solid #f3f4f6",
                        marginTop: 12,
                        paddingTop: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 8,
                        }}
                      >
                        Approval Chain
                      </div>
                      {[
                        { lvl: 1, approved: viewModal.approved_by_l1 },
                        { lvl: 2, approved: viewModal.approved_by_l2 },
                        { lvl: 3, approved: viewModal.approved_by_l3 },
                        { lvl: 4, approved: viewModal.approved_by_l4 },
                      ].map(({ lvl, approved }) => {
                        const isRejected = viewModal.status === "Rejected";
                        const color = isRejected
                          ? "#ef4444"
                          : approved
                            ? "#16a34a"
                            : "#f97316";
                        const bg = isRejected
                          ? "#fee2e2"
                          : approved
                            ? "#dcfce7"
                            : "#f3f4f6";
                        const label = isRejected
                          ? "Rejected"
                          : approved
                            ? "Approved"
                            : "Pending";
                        return (
                          <div
                            key={lvl}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                                width: 110,
                              }}
                            >
                              Level {lvl}
                              {lvl === 4 ? " (Impl.)" : ""}:
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                padding: "2px 10px",
                                borderRadius: 999,
                                backgroundColor: bg,
                                color,
                              }}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
            <div
              style={{
                padding: "12px 24px",
                backgroundColor: "#f9fafb",
                borderRadius: "0 0 16px 16px",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {viewModal.status !== "Rejected" &&
                !viewModal.approved_by_l1 &&
                admin.level === 1 && (
                  <>
                    <button
                      onClick={() => handleReject(viewModal.id)}
                      style={{
                        fontSize: "0.875rem",
                        padding: "8px 16px",
                        border: "1px solid #f87171",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "#fff",
                        color: "#ef4444",
                      }}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => handleApprove(viewModal.id)}
                      style={{
                        fontSize: "0.875rem",
                        padding: "8px 16px",
                        border: "1px solid #4ade80",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "#fff",
                        color: "#16a34a",
                      }}
                    >
                      ✅ Approve
                    </button>
                  </>
                )}
              <button
                onClick={() => setViewModal(null)}
                style={{
                  fontSize: "0.875rem",
                  padding: "8px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "#fff",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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

function ModalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
      <span
        style={{
          fontSize: "0.75rem",
          color: "#9ca3af",
          width: 120,
          flexShrink: 0,
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "0.875rem", color: "#111827" }}>{value}</span>
    </div>
  );
}
