// ── CONTROLLER: app/api/send-email/route.ts ──────────────────────────
// Handles POST /api/send-email
// Reads the EmailPayload from the request body, then sends an email
// via Nodemailer using your Gmail SMTP credentials.
//
// Required .env variables:
//   SMTP_USER=your-gmail@gmail.com
//   SMTP_PASS=your-app-password   (Gmail App Password, NOT your account password)

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { EmailPayload } from "@/app/models/emailModel";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body: EmailPayload = await req.json();
    const { to, applicantName, trackingId, status, comment } = body;

    const isApproved = status === "Processed";

    const subject = isApproved
      ? `LTO MID 2026 - Access Request Approved (${trackingId})`
      : `LTO MID 2026 - Access Request Disapproved (${trackingId})`;

    // Generate email content based on status
    const html = isApproved
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <div style="padding: 20px;">
          <p>Good day.</p>

          <p>We are pleased to inform you that your request for user access authorization to the Land Transportation Management System has been approved.</p>

          <p>The corresponding access privileges have been successfully configured based on the details provided in your request. You may now log in to the system using your assigned credentials.</p>

          <p>Please be reminded to strictly adhere to all applicable policies, security protocols, and data privacy regulations in the use of the system.</p>

          <p>For any technical concerns or assistance, you may coordinate with the Management Information Division (MID) through <a href="mailto:mid-centraloffice@lto.gov.ph">mid-centraloffice@lto.gov.ph</a></p>

          <p>Thank you.</p>

          <p style="margin-top: 30px;">
            Respectfully,<br />
            <strong>Management Information Division (MID)</strong><br />
            Land Transportation Office (LTO)
          </p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="font-size: 0.75rem; color: #9ca3af;">
            Reference: Tracking ID <strong>${trackingId}</strong><br />
            This is an automated message from LTO MID 2026 Admin Portal.
          </p>
        </div>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <div style="padding: 20px;">
          <p>Good day.</p>

          <p>We regret to inform you that your request for user access authorization to the Land Transportation Management System has been disapproved.</p>

          <p>This action was taken due to incomplete requirements, insufficient justification, or non-compliance with existing policies.</p>

          ${comment ? `<p><strong>Reason(s):</strong> ${comment}</p>` : ""}

          <p>You may review and address the noted concern(s) and submit a new request for evaluation.</p>

          <p>For further clarification or assistance, you may contact the Management Information Division (MID) through <a href="mailto:mid-centraloffice@lto.gov.ph">mid-centraloffice@lto.gov.ph</a></p>

          <p>Thank you for your understanding.</p>

          <p style="margin-top: 30px;">
            Respectfully,<br />
            <strong>Management Information Division (MID)</strong><br />
            Land Transportation Office (LTO)
          </p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="font-size: 0.75rem; color: #9ca3af;">
            Reference: Tracking ID <strong>${trackingId}</strong><br />
            This is an automated message from LTO MID 2026 Admin Portal.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"LTO Management Information Division" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-email] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
