import { db } from "@/lib/db"; // Assuming you're using a database helper
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const [rows] = await db.execute("SELECT id, fullName, email, role FROM users");
    return NextResponse.json({ users: rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Unable to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { fullName, email, role } = await req.json();
  try {
    await db.execute("INSERT INTO users (fullName, email, role) VALUES (?, ?, ?)", [fullName, email, role]);
    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Unable to create user" }, { status: 500 });
  }
}

// Additional functions for PUT and DELETE can be added in a similar structure