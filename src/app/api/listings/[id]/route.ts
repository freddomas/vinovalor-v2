import { NextResponse } from "next/server";
import { getListingById } from "@/lib/domain";
import { securityHeaders } from "@/lib/security";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const listing = getListingById(id);
  if (!listing) {
    return NextResponse.json({ message: "Annonce introuvable." }, { status: 404, headers: securityHeaders() });
  }
  return NextResponse.json({ data: listing }, { headers: securityHeaders() });
}
