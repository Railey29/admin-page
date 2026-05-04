import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../controllers/dbClient";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const {
      ltoEmployeeNumber,
      firstName,
      middleName,
      lastName,
      office,
      designation,
      level,
      username,
      password,
    } = await req.json();

    if (
      !ltoEmployeeNumber ||
      !firstName ||
      !lastName ||
      !office ||
      !designation ||
      !level ||
      !username ||
      !password
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (![1, 2, 3].includes(Number(level))) {
      return NextResponse.json(
        { error: "Only Level 1 to Level 3 accounts can be registered here." },
        { status: 400 },
      );
    }

    // Check duplicate username
    const existingUsername = await prisma.admin_accounts.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken. Please choose another." },
        { status: 409 },
      );
    }

    // Check duplicate employee_id
    const existingEmployee = await prisma.admin_accounts.findUnique({
      where: { employee_id: ltoEmployeeNumber },
    });
    if (existingEmployee) {
      return NextResponse.json(
        { error: "An account with this Employee ID already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await prisma.admin_accounts.create({
      data: {
        employee_id: ltoEmployeeNumber,
        username,
        password: hashedPassword,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        office,
        level: Number(level),
        role: designation,
        is_active: true, // no approval needed, auto-active on register
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful. You can now log in.",
        id: newAccount.id,
        username: newAccount.username,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
