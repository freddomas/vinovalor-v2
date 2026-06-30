import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/security";

export async function POST() {
  return NextResponse.json(
    { message: "Utilisez /connexion ou le flux NextAuth credentials pour ouvrir une session." },
    { status: 400, headers: securityHeaders() }
  );
}
