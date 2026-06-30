import { NextResponse } from "next/server";
import { restaurants } from "@/lib/domain";
import { securityHeaders } from "@/lib/security";

export async function GET() {
  return NextResponse.json({ data: restaurants, count: restaurants.length }, { headers: securityHeaders() });
}
