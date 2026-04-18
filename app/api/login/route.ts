import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../controllers/dbClient";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    const account = await prisma.admin_accounts.findUnique({
      where: { username },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    // No is_active check — registered accounts can log in immediately

    return NextResponse.json({
      id: account.id,
      username: account.username,
      level: account.level,
      displayName: `${account.first_name} ${account.last_name}`,
      role: account.role,
      office: account.office,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
