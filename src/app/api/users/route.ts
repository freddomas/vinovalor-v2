import { NextResponse } from "next/server";
import { users } from "@/lib/domain";
import { securityHeaders } from "@/lib/security";

export async function GET() {
  const data = users.map(({ id, firstName, lastName, isCertified, listingCount, createdAt }) => ({
    id,
    firstName,
    lastName,
    isCertified,
    listingCount,
    createdAt
  }));
  return NextResponse.json({ data, count: data.length }, { headers: securityHeaders() });
}
