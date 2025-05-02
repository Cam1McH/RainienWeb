import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import qrcode from "qrcode";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = (rows as any[])[0];

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // If already verified, don't reset
    if (user.two_factor_verified) {
      return NextResponse.json({ error: "2FA already verified." }, { status: 400 });
    }

    const secret = authenticator.generateSecret();
    await db.query("UPDATE users SET two_factor_secret = ?, two_factor_verified = 0 WHERE email = ?", [secret, email]);

    const otpauth = authenticator.keyuri(email, "YourAppName", secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
