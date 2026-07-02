import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { can, getListingById, toCents } from "@/lib/domain";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, forbidden, hashIp, safeJson, securityHeaders } from "@/lib/security";
import { getVinovalorSession } from "@/lib/session";

const offerSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.coerce.number().finite().positive(),
  message: z.string().max(600).optional()
});

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
  } catch {
    return forbidden("Origine non autorisée.");
  }

  const session = await getVinovalorSession();
  const role = session?.user?.role ?? "guest";
  if (!session?.user || !can(role, "buy")) {
    return NextResponse.json({ message: "Vous devez être connecté pour faire une offre." }, { status: 401, headers: securityHeaders() });
  }

  const key = `offer:${hashIp(request.headers.get("x-forwarded-for"))}:${session.user.id}`;
  if (!checkRateLimit(key, 20, 900)) {
    return NextResponse.json({ message: "Trop d'offres envoyées. Réessayez plus tard." }, { status: 429, headers: securityHeaders() });
  }

  let payload: unknown;
  try {
    payload = await safeJson(request);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "JSON invalide." }, { status: 400, headers: securityHeaders() });
  }

  const parsed = offerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Offre invalide.", issues: parsed.error.flatten() }, { status: 400, headers: securityHeaders() });
  }
  const listing = getListingById(parsed.data.listingId);
  if (!listing || !listing.allowOffers) {
    return NextResponse.json({ message: "Cette annonce n'accepte pas d'offre." }, { status: 409, headers: securityHeaders() });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ message: "Un vendeur ne peut pas faire une offre sur sa propre annonce." }, { status: 403, headers: securityHeaders() });
  }
  let amountCents: number;
  try {
    amountCents = toCents(parsed.data.amount);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Montant invalide." }, { status: 422, headers: securityHeaders() });
  }
  if (amountCents < Math.round(listing.priceCents * 0.5)) {
    return NextResponse.json({ message: "Offre trop basse pour être transmise au vendeur." }, { status: 422, headers: securityHeaders() });
  }
  return NextResponse.json(
    {
      message: "Offre validée et prête à être enregistrée par la couche Postgres.",
      status: "validated",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
    },
    { status: 202, headers: securityHeaders() }
  );
}
