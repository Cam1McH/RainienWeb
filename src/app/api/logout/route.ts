import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;

    if (token) {
      await db.execute("DELETE FROM sessions WHERE token = ?", [token]);
    }

    const response = NextResponse.redirect(new URL("/", req.url)); // Redirect to home

    // Clear the cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/?logout=failed", req.url)); // Optional fallback redirect on failure
  }
}
