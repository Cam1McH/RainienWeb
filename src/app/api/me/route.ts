

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    console.log("🔍 Incoming 2FA POST:", { userId, token });

    if (!userId || !token) {
      console.warn("⚠️ Missing userId or token");
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const [rows] = await db.query(
      "SELECT id, email, two_factor_secret FROM users WHERE id = ?",
      [userId]
    );
    const user = (rows as any[])[0];

    if (!user || !user.two_factor_secret) {
      console.warn("❌ User or 2FA secret not found");
      return NextResponse.json({ error: "2FA secret not found." }, { status: 404 });
    }

    const isValid = authenticator.check(token, user.two_factor_secret);

    if (!isValid) {
      console.warn("❌ Invalid 2FA token");
      return NextResponse.json({ error: "Invalid 2FA token." }, { status: 401 });
    }

    await db.query("UPDATE users SET two_factor_verified = 1 WHERE id = ?", [userId]);

    const sessionToken = crypto.randomBytes(32).toString("hex");
    await db.query(
      "INSERT INTO sessions (userId, token, createdAt) VALUES (?, ?, NOW())",
      [user.id, sessionToken]
    );

    (await cookies()).set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("✅ 2FA verification + session created");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Server error during 2FA verification:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessionToken = (await cookies()).get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    const [rows] = await db.query(
      `SELECT users.id, users.fullName, users.email, users.accountType, users.role
       FROM users
       JOIN sessions ON sessions.userId = users.id
       WHERE sessions.token = ? AND sessions.createdAt >= NOW() - INTERVAL 7 DAY
       LIMIT 1`,
      [sessionToken]
    );

    const user = (rows as any[])[0];
    if (!user) return NextResponse.json({ loggedIn: false }, { status: 200 });

    return NextResponse.json({ loggedIn: true, user });
  } catch (error) {
    console.error("[ME ROUTE ERROR]", error);
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}