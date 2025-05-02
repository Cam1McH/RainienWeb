import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import qrcode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("Login attempt:", { email, passwordPresent: !!password });

    // Validate required fields
    if (!email || !password) {
      console.warn("Missing required fields.");
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Fetch user from database
    const userResult = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!userResult.length) {
      console.warn("User not found:", email);
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);

if (!rows.length) {
  console.warn("User not found:", email);
  return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
}

const user = rows[0];


    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn("Invalid password for user:", email);
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check if 2FA is already enabled
    if (user.two_factor_enabled === 1) {
      console.log("2FA is enabled. Skipping QR code.");
      return NextResponse.json({
        requires2FA: true,
        twoFactorEnabled: true,
        userId: user.id,
      });
    }

    // Generate 2FA secret and QR code
    console.log("2FA is NOT enabled. Generating secret.");
    const secret = authenticator.generateSecret();
    console.log("Generated secret:", secret);

    const otpAuthUrl = authenticator.keyuri(email, "Ventra", secret);
    console.log("OTP Auth URL:", otpAuthUrl);

    const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);
    console.log("Generated QR code data URL length:", qrCodeDataURL.length);

    // Store the secret in the database
    await db.query("UPDATE users SET two_factor_secret = ? WHERE id = ?", [secret, user.id]);
    console.log("Updated user with new 2FA secret.");

    // Respond with QR code for user to scan
    return NextResponse.json({
      requires2FA: true,
      twoFactorEnabled: false,
      userId: user.id,
      qrCode: qrCodeDataURL,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}