import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getListingById, toCents, validateBid } from "@/lib/domain";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, forbidden, hashIp, safeJson, securityHeaders } from "@/lib/security";
import { getVinovalorSession } from "@/lib/session";

const bidSchema = z.object({
  amount: z.coerce.number().finite().positive()
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
  } catch {
    return forbidden("Origine non autorisée.");
  }

  const session = await getVinovalorSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Connexion requise pour enchérir." }, { status: 401, headers: securityHeaders() });
  }

  const { id } = await context.params;
  const listing = getListingById(id);
  if (!listing || listing.saleMode !== "AUCTION") {
    return NextResponse.json({ message: "Enchère introuvable." }, { status: 404, headers: securityHeaders() });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ message: "Un vendeur ne peut pas enchérir sur son propre lot." }, { status: 403, headers: securityHeaders() });
  }
  const key = `bid:${hashIp(request.headers.get("x-forwarded-for"))}:${session.user.id}`;
  if (!checkRateLimit(key, 30, 900)) {
    return NextResponse.json({ message: "Trop de tentatives d'enchère." }, { status: 429, headers: securityHeaders() });
  }
  let payload: unknown;
  try {
    payload = await safeJson(request);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "JSON invalide." }, { status: 400, headers: securityHeaders() });
  }

  const parsed = bidSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Montant invalide.", issues: parsed.error.flatten() }, { status: 400, headers: securityHeaders() });
  }
  try {
    validateBid(listing.priceCents, toCents(parsed.data.amount), session.user.role);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Enchère invalide." },
      { status: 422, headers: securityHeaders() }
    );
  }
  return NextResponse.json(
    {
      message: "Enchère validée. L'enregistrement durable exige une transaction Postgres atomique.",
      status: "validated",
      serverTime: new Date().toISOString()
    },
    { status: 202, headers: securityHeaders() }
  );
}
