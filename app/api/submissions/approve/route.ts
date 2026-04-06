import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../controllers/dbClient";

export async function POST(req: NextRequest) {
  try {
    const { id, level } = await req.json();

    const levelMap: Record<number, object> = {
      1: { approved_by_l1: true, status: "Approved by L1" },
      2: { approved_by_l2: true, status: "Approved by L2" },
      3: { approved_by_l3: true, status: "Approved by L3" },
      4: { approved_by_l4: true, status: "Fully Approved" },
    };

    const updates = levelMap[level];
    if (!updates) {
      return NextResponse.json(
        { success: false, error: "Invalid level" },
        { status: 400 },
      );
    }

    const updated = await prisma.uaa_submissions.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Approve error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
