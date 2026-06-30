import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { securityHeaders } from "@/lib/security";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: securityHeaders() });
  }
  return NextResponse.json({ authenticated: true, user: session.user }, { headers: securityHeaders() });
}
