import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  try {
    const [rows] = await db.execute("SELECT id, fullName, email, role FROM users WHERE id = ?", [userId]);
    const user = (rows as any[])[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Unable to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const { fullName, email, role } = await req.json();
  try {
    await db.execute("UPDATE users SET fullName = ?, email = ?, role = ? WHERE id = ?", [fullName, email, role, userId]);
    return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  try {
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Unable to delete user" }, { status: 500 });
  }
}