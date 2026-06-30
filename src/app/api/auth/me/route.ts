import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security";
import { getVinovalorSession } from "@/lib/session";

export async function GET() {
  const session = await getVinovalorSession();
  if (!session?.user) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: securityHeaders() });
  }
  return NextResponse.json({ authenticated: true, user: session.user }, { headers: securityHeaders() });
}
