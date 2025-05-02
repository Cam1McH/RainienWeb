import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    console.log("🔍 Incoming 2FA POST:", { email, token });

    if (!email || !token) {
      console.warn("⚠️ Missing email or token");
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Lookup user by email
    const [rows] = await db.query(
      "SELECT id, two_factor_secret FROM users WHERE email = ?",
      [email]
    );
    const user = (rows as any[])[0];

    if (!user || !user.two_factor_secret) {
      console.warn("❌ User or 2FA secret not found for email:", email);
      return NextResponse.json({ error: "2FA secret not found." }, { status: 404 });
    }

    // Verify token using otplib
    const isValid = authenticator.check(token, user.two_factor_secret);

    if (!isValid) {
      console.warn("🚫 Invalid 2FA token");
      return NextResponse.json({ error: "Invalid 2FA token." }, { status: 401 });
    }

    // Mark user as verified
    await db.query(
      "UPDATE users SET two_factor_verified = 1 WHERE email = ?",
      [email]
    );

    console.log("✅ 2FA verification successful for:", email);
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("💥 Server error during 2FA verification:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
