import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, emailOrUsername } = body;

    // Use either explicit username or emailOrUsername field
    const loginIdentifier = username || emailOrUsername;

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try to find user by username or email
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${loginIdentifier},email.eq.${loginIdentifier}`)
      .limit(1);

    if (error) {
      console.error("Database error during login:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = users[0];

    // For demo purposes, we're storing plain text passwords
    // In production, you would hash passwords and compare hashes
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("Unexpected error during login:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
