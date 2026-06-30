import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/domain";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "vinovalor-v2",
    generatedAt: new Date().toISOString(),
    metrics: getDashboardMetrics()
  });
}
