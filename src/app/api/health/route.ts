import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/domain";
import { securityHeaders } from "@/lib/security";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "vinovalor-v2",
      generatedAt: new Date().toISOString(),
      metrics: getDashboardMetrics()
    },
    { headers: securityHeaders() }
  );
}
