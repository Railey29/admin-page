// ── MODEL: emailModel.ts ──────────────────────────────────────────────
// Defines the shape of email payloads sent by Level 4 after processing.

export interface EmailPayload {
  to: string; // recipient email from uaa_user_info
  applicantName: string;
  trackingId: string;
  status: "Processed" | "Rejected";
  comment?: string; // required for Rejected, optional for Processed
}
