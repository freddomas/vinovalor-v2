import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, forbidden, securityHeaders } from "@/lib/security";

const logoutCookieNames = [
  "vinovalor.session-token",
  "__Secure-vinovalor.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token"
];

function clearAuthCookies(response: NextResponse) {
  for (const name of logoutCookieNames) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: name.includes("session-token") || name.includes("csrf-token"),
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: name.startsWith("__Secure-") || name.startsWith("__Host-")
    });
  }
}

function logoutResponse(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/connexion", request.url), 303);
  for (const [key, value] of Object.entries(securityHeaders())) {
    response.headers.set(key, value);
  }
  clearAuthCookies(response);
  return response;
}

export async function GET() {
  return NextResponse.json({ message: "Méthode non autorisée." }, { status: 405, headers: securityHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
  } catch {
    return forbidden("Origine non autorisée.");
  }
  return logoutResponse(request);
}
