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
    const priorityRows = await prisma.$queryRaw<
      { id: number; isPriority: boolean | null }[]
    >`SELECT id, "isPriority" FROM uaa_submissions`;
    const priorityMap = new Map(
      priorityRows.map((row) => [row.id, row.isPriority ?? false]),
    );
    const data = submissions.map((submission) => ({
      ...submission,
      isPriority: priorityMap.get(submission.id) ?? false,
    }));
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Fetch error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
