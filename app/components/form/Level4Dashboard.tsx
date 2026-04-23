"use client";
import { useState } from "react";
import { AdminCredential } from "../../models/authModel";
import { useSubmissions, SubmissionRecord } from "../../hooks/useSubmissions";
import { EmailPayload } from "../../models/emailModel";
import ExportButtons from "../ui/ExportButtons";

interface Props {
  admin: AdminCredential;
  onLogout: () => void;
}

type Tab = "toProcess" | "done" | "issues";

async function sendStatusEmail(payload: EmailPayload) {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[Level4Dashboard] Failed to send email:", err);
  }
}

export default function Level4Dashboard({ admin, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("toProcess");
  const [viewModal, setViewModal] = useState<SubmissionRecord | null>(null);
  const [commentModal, setCommentModal] = useState<{
    record: SubmissionRecord;
    action: "done" | "issue";
  } | null>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const { submissions, loading, approve, reject } = useSubmissions(4);

  const toProcess = submissions.filter(
    (r) =>
      r.status !== "Rejected" &&
      r.approved_by_l1 &&
      (r.approved_by_l2 || r.approved_by_l3) &&
      !r.approved_by_l4,
  );

  const done = submissions.filter((r) => r.approved_by_l4);
  const issues = submissions.filter((r) => r.status === "Rejected");

  const openCommentModal = (
    record: SubmissionRecord,
    action: "done" | "issue",
  ) => {
    setComment("");
    setCommentModal({ record, action });
    setViewModal(null);
  };

  const handleConfirm = async () => {
    if (!commentModal) return;
    const { record, action } = commentModal;

    const userInfo = record.uaa_user_info[0];
    const fullName = userInfo
      ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
      : "Applicant";

    setSending(true);
    try {
      if (action === "done") {
        await approve(record.id);
        await sendStatusEmail({
          to: userInfo?.email ?? "",
          applicantName: fullName,
          trackingId: record.tracking_id,
          status: "Processed",
          comment: comment.trim() || undefined,
        });
      } else {
        await reject(record.id);
        await sendStatusEmail({
          to: userInfo?.email ?? "",
          applicantName: fullName,
          trackingId: record.tracking_id,
          status: "Rejected",
          comment: comment.trim() || undefined,
        });
      }
    } finally {
      setSending(false);
      setCommentModal(null);
    }
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
            LTO User Access Authorization Form
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
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <ExportButtons
              records={currentList}
              filename={`l4-${tab}`}
              pdfTitle={`Level 4 — ${tab === "toProcess" ? "To Process" : tab === "done" ? "Processed" : "Issues"}`}
            />
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
              Approved by Level 1 and at least one of Level 2 or Level 3 — ready
              for implementation.
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
                                onClick={() => openCommentModal(req, "done")}
                                color="#16a34a"
                                borderColor="#4ade80"
                                label="✅ Mark Done"
                              />
                              <ActionBtn
                                onClick={() => openCommentModal(req, "issue")}
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
            ℹ️ As Level 4 Implementor, you receive requests once Level 1 and at
            least one of Level 2 or Level 3 have approved. An email notification
            is sent to the applicant after each action.
          </span>
        </div>
      </main>

      {/* ── VIEW MODAL ── */}
      {viewModal && (
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
              borderRadius: 12,
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {(() => {
              const userInfo = viewModal.uaa_user_info[0];
              const sysAccess = viewModal.uaa_system_access[0];
              const modules = viewModal.uaa_modules[0];
              const fullName = userInfo
                ? `${userInfo.last_name}, ${userInfo.first_name} ${userInfo.middle_name ?? ""}`.trim()
                : "Applicant";
              const moduleList = modules?.selected_modules ?? [];
              const isRejected = viewModal.status === "Rejected";

              const approvalSteps = [
                {
                  label: "Level 1 — Chief of Office",
                  approved: viewModal.approved_by_l1,
                },
                { label: "Level 2", approved: viewModal.approved_by_l2 },
                { label: "Level 3", approved: viewModal.approved_by_l3 },
                {
                  label: "Level 4 (Implementor)",
                  approved: viewModal.approved_by_l4,
                },
              ];

              return (
                <>
                  {/* Dark blue header */}
                  <div
                    style={{
                      backgroundColor: "#1e3a8a",
                      color: "#fff",
                      padding: "16px 24px",
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
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Scrollable body */}
                  <div
                    style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}
                  >
                    {/* DOCUMENT INFO */}
                    <SectionHeader label="DOCUMENT INFO" />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px 24px",
                        marginBottom: 20,
                      }}
                    >
                      <FieldBlock
                        label="CONTROL NO."
                        value={viewModal.tracking_id}
                      />
                      <FieldBlock
                        label="EFFECTIVE DATE"
                        value={
                          viewModal.submitted_at
                            ? new Date(
                                viewModal.submitted_at,
                              ).toLocaleDateString("en-CA")
                            : "—"
                        }
                      />
                      <FieldBlock
                        label="OFFICE CODE"
                        value={viewModal.office_code ?? "—"}
                      />
                      <FieldBlock
                        label="DATE SUBMITTED"
                        value={
                          viewModal.submitted_at
                            ? new Date(
                                viewModal.submitted_at,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"
                        }
                      />
                    </div>

                    {/* I. SYSTEM ACCESS */}
                    <SectionHeader label="I. SYSTEM ACCESS" />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px 24px",
                        marginBottom: 20,
                      }}
                    >
                      <FieldBlock
                        label="ACCOUNT ACTION"
                        value={sysAccess?.account_type ?? "—"}
                      />
                      <FieldBlock
                        label="SUB-ACTION"
                        value={sysAccess?.existing_sub ?? "—"}
                      />
                      <FieldBlock
                        label="USER TYPE"
                        value={sysAccess?.user_type ?? "—"}
                      />
                      <FieldBlock
                        label="LOGIN MODE"
                        value={sysAccess?.login_mode ?? "—"}
                      />
                    </div>

                    {/* II. USER INFORMATION */}
                    <SectionHeader label="II. USER INFORMATION" />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px 24px",
                        marginBottom: 20,
                      }}
                    >
                      <FieldBlock
                        label="LAST NAME"
                        value={userInfo?.last_name ?? "—"}
                      />
                      <FieldBlock
                        label="FIRST NAME"
                        value={userInfo?.first_name ?? "—"}
                      />
                      <FieldBlock
                        label="MIDDLE NAME"
                        value={userInfo?.middle_name ?? "—"}
                      />
                      <FieldBlock
                        label="DESIGNATION"
                        value={userInfo?.designation ?? "—"}
                      />
                      <FieldBlock
                        label="EMPLOYEE ID"
                        value={userInfo?.employee_id ?? "—"}
                      />
                      <FieldBlock
                        label="CONTACT NO."
                        value={userInfo?.contact_no ?? "—"}
                      />
                      <div style={{ gridColumn: "1 / -1" }}>
                        <FieldBlock
                          label="EMAIL"
                          value={userInfo?.email ?? "—"}
                        />
                      </div>
                    </div>

                    {/* III. MODULES */}
                    {moduleList.length > 0 && (
                      <>
                        <SectionHeader label="III. MODULES" />
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginBottom: 20,
                          }}
                        >
                          {moduleList.map((mod: string, i: number) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "0.75rem",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                padding: "4px 12px",
                                borderRadius: 999,
                                fontWeight: 500,
                              }}
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {/* IV. APPROVAL TRAIL */}
                    <SectionHeader label="IV. APPROVAL TRAIL" />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      {approvalSteps.map((step, i) => {
                        const approved = step.approved;
                        const dotColor = isRejected
                          ? "#ef4444"
                          : approved
                            ? "#16a34a"
                            : "#d1d5db";
                        const statusLabel = isRejected
                          ? "Rejected"
                          : approved
                            ? "Approved"
                            : "Waiting";
                        const statusIcon = isRejected
                          ? "❌"
                          : approved
                            ? "✅"
                            : "⏳";
                        const statusColor = isRejected
                          ? "#ef4444"
                          : approved
                            ? "#16a34a"
                            : "#9ca3af";

                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              backgroundColor: "#f9fafb",
                              border: "1px solid #f3f4f6",
                              borderRadius: 8,
                              padding: "10px 14px",
                            }}
                          >
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: dotColor,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "#374151",
                                flex: 1,
                              }}
                            >
                              {step.label}
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: statusColor,
                                fontWeight: 500,
                              }}
                            >
                              {statusIcon} {statusLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div
                    style={{
                      padding: "12px 24px",
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                      flexShrink: 0,
                      backgroundColor: "#fff",
                    }}
                  >
                    {tab === "toProcess" && (
                      <>
                        <button
                          onClick={() => openCommentModal(viewModal, "done")}
                          style={{
                            fontSize: "0.875rem",
                            padding: "8px 18px",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "#16a34a",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => openCommentModal(viewModal, "issue")}
                          style={{
                            fontSize: "0.875rem",
                            padding: "8px 18px",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "#ef4444",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    <button
                      style={{
                        fontSize: "0.875rem",
                        padding: "8px 18px",
                        border: "1px solid #fbbf24",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "#fff",
                        color: "#92400e",
                        fontWeight: 500,
                      }}
                    >
                      🖨 Export PDF
                    </button>
                    <button
                      onClick={() => setViewModal(null)}
                      style={{
                        fontSize: "0.875rem",
                        padding: "8px 18px",
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
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── COMMENT MODAL ── */}
      {commentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              width: "100%",
              maxWidth: 460,
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {commentModal.action === "done" ? "✅" : "❌"}
              </span>
              <span style={{ fontWeight: 700, color: "#111827" }}>
                {commentModal.action === "done"
                  ? "Mark as Processed"
                  : "Flag as Issue / Reject"}
              </span>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {(() => {
                const userInfo = commentModal.record.uaa_user_info[0];
                const fullName = userInfo
                  ? `${userInfo.last_name}, ${userInfo.first_name}`.trim()
                  : "—";
                return (
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        marginBottom: 2,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Applicant
                    </div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {commentModal.record.tracking_id}
                    </div>
                  </div>
                );
              })()}

              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {commentModal.action === "issue"
                  ? "Reason / Comment *"
                  : "Comment (optional)"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder={
                  commentModal.action === "issue"
                    ? "Describe the issue or reason for rejection..."
                    : "Add an optional message for the applicant..."
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${commentModal.action === "issue" && !comment.trim() ? "#fca5a5" : "#d1d5db"}`,
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  color: "#111827",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "system-ui, sans-serif",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 6,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "0.8rem" }}>📧</span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  An email notification will be sent to the applicant&apos;s
                  registered email address.
                </span>
              </div>
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
              <button
                onClick={() => setCommentModal(null)}
                disabled={sending}
                style={{
                  fontSize: "0.875rem",
                  padding: "8px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: "#fff",
                  color: "#6b7280",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  sending ||
                  (commentModal.action === "issue" && !comment.trim())
                }
                style={{
                  fontSize: "0.875rem",
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: 8,
                  cursor:
                    sending ||
                    (commentModal.action === "issue" && !comment.trim())
                      ? "not-allowed"
                      : "pointer",
                  background:
                    commentModal.action === "done" ? "#16a34a" : "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                  opacity:
                    sending ||
                    (commentModal.action === "issue" && !comment.trim())
                      ? 0.6
                      : 1,
                }}
              >
                {sending
                  ? "Sending..."
                  : commentModal.action === "done"
                    ? "✅ Confirm & Notify"
                    : "❌ Reject & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
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
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 600,
          color: "#9ca3af",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

function ApprovalRow({
  label,
  approved,
  isRejected,
}: {
  label: string;
  approved: boolean | null | undefined;
  isRejected: boolean;
}) {
  const color = isRejected ? "#ef4444" : approved ? "#16a34a" : "#9ca3af";
  const bg = isRejected ? "#fee2e2" : approved ? "#dcfce7" : "#f3f4f6";
  const lbl = isRejected ? "Rejected" : approved ? "Approved" : "Pending";
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
    >
      <span style={{ fontSize: "0.75rem", color: "#9ca3af", width: 140 }}>
        {label}:
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
        {lbl}
      </span>
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
