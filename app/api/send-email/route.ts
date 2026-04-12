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
      ? `✅ Your UAA Request Has Been Processed — ${trackingId}`
      : `❌ Your UAA Request Was Rejected — ${trackingId}`;

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #1e3a8a; padding: 20px 28px;">
          <div style="color: #fff; font-size: 1.1rem; font-weight: 700;">LTO MID 2026 — Admin Portal</div>
          <div style="color: #bfdbfe; font-size: 0.8rem; margin-top: 4px;">User Access Administration (UAA)</div>
        </div>

        <!-- Body -->
        <div style="padding: 28px;">
          <p style="margin: 0 0 16px; color: #111827; font-size: 0.95rem;">
            Dear <strong>${applicantName}</strong>,
          </p>

          ${
            isApproved
              ? `<div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
                   <div style="color: #16a34a; font-weight: 700; font-size: 1rem;">✅ Request Processed</div>
                   <p style="color: #166534; margin: 8px 0 0; font-size: 0.875rem;">
                     Your UAA request (Tracking ID: <strong>${trackingId}</strong>) has been successfully processed.
                     Your system access will be activated shortly.
                   </p>
                 </div>`
              : `<div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
                   <div style="color: #dc2626; font-weight: 700; font-size: 1rem;">❌ Request Rejected</div>
                   <p style="color: #991b1b; margin: 8px 0 0; font-size: 0.875rem;">
                     Your UAA request (Tracking ID: <strong>${trackingId}</strong>) has been rejected.
                   </p>
                   ${
                     comment
                       ? `<div style="margin-top: 12px; background: #fff; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px;">
                            <div style="font-size: 0.7rem; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Reason / Comment</div>
                            <div style="color: #374151; font-size: 0.875rem;">${comment}</div>
                          </div>`
                       : ""
                   }
                 </div>`
          }

          <p style="color: #6b7280; font-size: 0.8rem; margin: 0;">
            If you have questions, please contact your regional administrator or visit the LTO Admin Portal.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 14px 28px; border-top: 1px solid #f3f4f6;">
          <p style="margin: 0; font-size: 0.7rem; color: #9ca3af;">
            This is an automated message from LTO MID 2026 Admin Portal. Do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"LTO MID 2026 Admin Portal" <${process.env.SMTP_USER}>`,
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
