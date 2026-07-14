import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const ok = typeof password === "string" && password === process.env.ADMIN_PASSWORD;
  return NextResponse.json({ ok });
}
