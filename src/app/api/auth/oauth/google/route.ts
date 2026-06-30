import { NextRequest, NextResponse } from "next/server";
import { isGoogleAuthConfigured } from "@/lib/auth";
import { securityHeaders } from "@/lib/security";

export async function GET(request: NextRequest) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json(
      { message: "Google OAuth n'est pas configure dans cet environnement." },
      { status: 503, headers: securityHeaders() }
    );
  }
  return NextResponse.redirect(new URL("/api/auth/signin/google", request.url));
}
