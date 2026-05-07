import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../controllers/dbClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const submissionId = Number(body.submissionId ?? body.id);
    const level = Number(body.level);

    if (!submissionId || !level) {
      return NextResponse.json(
        { success: false, error: "submissionId and level are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.priority_requests.findFirst({
      where: { submission_id: submissionId, level },
      select: { id: true },
    });

    if (existing) {
      await prisma.priority_requests.deleteMany({
        where: { submission_id: submissionId, level },
      });
      return NextResponse.json({
        success: true,
        data: { submissionId, level, is_priority: false },
      });
    }

    const created = await prisma.priority_requests.create({
      data: {
        submission_id: submissionId,
        level,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        submissionId: created.submission_id,
        level: created.level,
        is_priority: true,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Priority toggle error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
