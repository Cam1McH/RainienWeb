import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export async function POST(req: NextRequest) {
  const { fullName, email, password, businessName, businessType, accountType } = await req.json();

  if (!fullName || !email || !password || !accountType) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = authenticator.generateSecret();

    const [result] = await db.query(
      `INSERT INTO users (fullName, email, password, businessName, businessType, accountType, two_factor_secret, two_factor_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [fullName, email, hashedPassword, businessName, businessType, accountType, secret]
    );

    const userId = (result as any).insertId;
    const otpauth = authenticator.keyuri(email, 'YourAppName', secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    return NextResponse.json({ success: true, userId, qrCode });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
