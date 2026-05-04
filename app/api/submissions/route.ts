import { NextResponse } from "next/server";
import { prisma } from "../../controllers/dbClient";

export async function GET() {
  try {
    const submissions = await prisma.uaa_submissions.findMany({
      include: {
        uaa_user_info: true,
        uaa_system_access: true,
        uaa_modules: true,
      },
      orderBy: { submitted_at: "asc" },
    });
    return NextResponse.json({ success: true, data: submissions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Fetch error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
