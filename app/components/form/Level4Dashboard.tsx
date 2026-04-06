"use client";
import { useState } from "react";
import { AdminCredential } from "../../models/authModel";
import { useSubmissions, SubmissionRecord } from "../../hooks/useSubmissions";

interface Props {
  admin: AdminCredential;
  onLogout: () => void;
}

type Tab = "toProcess" | "done" | "issues";

export default function Level4Dashboard({ admin, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("toProcess");
  const [viewModal, setViewModal] = useState<SubmissionRecord | null>(null);

  const { submissions, loading, approve, reject } = useSubmissions(4);

  const toProcess = submissions.filter(
    (r) => r.approved_by_l3 && !r.approved_by_l4 && r.status !== "Rejected",
  );
  const done = submissions.filter((r) => r.approved_by_l4);
  const issues = submissions.filter((r) => r.status === "Rejected");

  const handleProcess = async (id: number) => {
    await approve(id);
    setViewModal(null);
  };

  const handleIssue = async (id: number) => {
    await reject(id);
    setViewModal(null);
  };

  const currentList =
    tab === "toProcess" ? toProcess : tab === "done" ? done : issues;

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "toProcess", icon: "📋", label: "To Process" },
    { key: "done", icon: "✅", label: "Done" },
    { key: "issues", icon: "❌", label: "Issues" },
  ];

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
            Request Processing Dashboard
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: "0.7rem",
              backgroundColor: "#1e40af",
              border: "1px solid #3b82f6",
              padding: "4px 12px",
              borderRadius: 999,
              fontWeight: 600,
              color: "#fff",
            }}
          >
            LEVEL 4 — IMPLEMENTOR
          </span>
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
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "12px 4px",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              borderBottom:
                tab === t.key ? "2px solid #1e3a8a" : "2px solid transparent",
              color: tab === t.key ? "#1e3a8a" : "#6b7280",
              background: "transparent",
              cursor: "pointer",
              marginRight: 16,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <main style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* ── STAT CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard
            value={toProcess.length}
            label="TO PROCESS"
            borderColor="#f97316"
            bgColor="#fff7ed"
            numColor="#f97316"
            icon="📋"
          />
          <StatCard
            value={done.length}
            label="DONE"
            borderColor="#16a34a"
            bgColor="#f0fdf4"
            numColor="#16a34a"
            icon="✅"
          />
          <StatCard
            value={issues.length}
            label="ISSUES"
            borderColor="#ef4444"
            bgColor="#fef2f2"
            numColor="#ef4444"
            icon="❌"
          />
        </div>

        {/* ── TABLE CARD ── */}
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
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 600, color: "#111827" }}>
              {tab === "toProcess" && "📋 Requests to Process"}
              {tab === "done" && "✅ Processed Requests"}
              {tab === "issues" && "❌ Rejected / Issues"}
            </span>
            {tab === "toProcess" && toProcess.length > 0 && (
              <span
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "#ffedd5",
                  color: "#c2410c",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {toProcess.length}
              </span>
            )}
          </div>
          {tab === "toProcess" && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                padding: "8px 20px",
                borderBottom: "1px solid #f9fafb",
              }}
            >
              These requests have been fully approved and are now waiting to be
              processed.
            </div>
          )}

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
          ) : currentList.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "0.875rem",
              }}
            >
              {tab === "toProcess"
                ? "No requests waiting to be processed."
                : tab === "done"
                  ? "No processed requests yet."
                  : "No issues found."}
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
                    tab === "toProcess" ? "DATE APPROVED" : "DATE",
                    "OFFICE CODE",
                    "ACCOUNT TYPE",
                    "MODULES",
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
                {currentList.map((req, i) => {
                  const userInfo = req.uaa_user_info[0];
                  const sysAccess = req.uaa_system_access[0];
                  const modules = req.uaa_modules[0];
                  const fullName = userInfo
                    ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
                    : "—";
                  const moduleList = modules?.selected_modules ?? [];

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
                      <td style={{ padding: "14px 20px", color: "#4b5563" }}>
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
                      <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                        {req.office_code ?? "—"}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#4b5563" }}>
                        {sysAccess?.account_type ?? "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {moduleList.length > 0 ? (
                          <span
                            style={{ fontSize: "0.75rem", color: "#6b7280" }}
                          >
                            {moduleList.slice(0, 2).join(", ")}
                            {moduleList.length > 2 && (
                              <span style={{ color: "#3b82f6" }}>
                                {" "}
                                +{moduleList.length - 2} more
                              </span>
                            )}
                          </span>
                        ) : (
                          <span
                            style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <ActionBtn
                            onClick={() => setViewModal(req)}
                            color="#6b7280"
                            borderColor="#d1d5db"
                            label="👁 View"
                          />
                          {tab === "toProcess" && (
                            <>
                              <ActionBtn
                                onClick={() => handleProcess(req.id)}
                                color="#16a34a"
                                borderColor="#4ade80"
                                label="✅ Mark Done"
                              />
                              <ActionBtn
                                onClick={() => handleIssue(req.id)}
                                color="#ef4444"
                                borderColor="#f87171"
                                label="❌ Flag Issue"
                              />
                            </>
                          )}
                          {tab === "done" && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#16a34a",
                                fontWeight: 500,
                                backgroundColor: "#f0fdf4",
                                padding: "4px 10px",
                                borderRadius: 8,
                              }}
                            >
                              ✅ Processed
                            </span>
                          )}
                          {tab === "issues" && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#ef4444",
                                fontWeight: 500,
                                backgroundColor: "#fef2f2",
                                padding: "4px 10px",
                                borderRadius: 8,
                              }}
                            >
                              ❌ Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── INFO BOX ── */}
        <div
          style={{
            marginTop: 16,
            backgroundColor: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: 12,
            padding: "12px 20px",
          }}
        >
          <span
            style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 500 }}
          >
            ℹ️ As Level 4 Implementor, you process requests that have been fully
            approved by all three approval levels.
          </span>
        </div>
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
                            : "#9ca3af";
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
              {tab === "toProcess" && (
                <>
                  <button
                    onClick={() => handleIssue(viewModal.id)}
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
                    ❌ Flag Issue
                  </button>
                  <button
                    onClick={() => handleProcess(viewModal.id)}
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
                    ✅ Mark Done
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
  borderColor,
  bgColor,
  numColor,
  icon,
}: {
  value: number;
  label: string;
  borderColor: string;
  bgColor: string;
  numColor: string;
  icon: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `2px solid ${borderColor}`,
        backgroundColor: bgColor,
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
      <span style={{ fontSize: "1.5rem", opacity: 0.25 }}>{icon}</span>
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
