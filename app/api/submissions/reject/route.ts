import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../controllers/dbClient";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    const updated = await prisma.uaa_submissions.update({
      where: { id },
      data: { status: "Rejected" },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Reject error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
