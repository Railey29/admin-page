import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/controllers/dbClient";

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("[requests/[id]/priority] received id:", id);

    const submissionId = Number(id);
    if (!Number.isFinite(submissionId) || submissionId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request id" },
        { status: 400 },
      );
    }

    await prisma.$executeRaw`
      UPDATE "uaa_submissions"
      SET "isPriority" = NOT "isPriority"
      WHERE id = ${submissionId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[requests/[id]/priority] Priority toggle error:", error);
    console.error("[requests/[id]/priority] Priority toggle error message:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
