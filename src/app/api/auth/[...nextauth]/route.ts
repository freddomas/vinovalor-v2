import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, hasAuthSecret } from "@/lib/auth";
import { securityHeaders } from "@/lib/security";

const handler = NextAuth(authOptions);

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

function authNotConfiguredResponse() {
  return NextResponse.json(
    {
      code: "AUTH_NOT_CONFIGURED",
      message: "Authentification serveur non configurée. Renseigner NEXTAUTH_SECRET ou AUTH_SECRET sur Vercel."
    },
    { status: 503, headers: securityHeaders() }
  );
}

export function GET(request: NextRequest, context: AuthRouteContext) {
  if (!hasAuthSecret()) return authNotConfiguredResponse();
  return handler(request, context);
}

export function POST(request: NextRequest, context: AuthRouteContext) {
  if (!hasAuthSecret()) return authNotConfiguredResponse();
  return handler(request, context);
}
