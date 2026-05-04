import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../controllers/dbClient";
import bcrypt from "bcryptjs";
import { PREDEFINED_LEVEL4_ACCOUNT } from "../../models/authModel";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    if (
      username === PREDEFINED_LEVEL4_ACCOUNT.username &&
      password === PREDEFINED_LEVEL4_ACCOUNT.password
    ) {
      return NextResponse.json({
        id: PREDEFINED_LEVEL4_ACCOUNT.id,
        username: PREDEFINED_LEVEL4_ACCOUNT.username,
        level: PREDEFINED_LEVEL4_ACCOUNT.level,
        displayName: PREDEFINED_LEVEL4_ACCOUNT.displayName,
        role: PREDEFINED_LEVEL4_ACCOUNT.role,
        office: PREDEFINED_LEVEL4_ACCOUNT.office,
      });
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
