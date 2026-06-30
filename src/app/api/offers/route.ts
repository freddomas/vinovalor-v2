import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { can, getListingById, toCents } from "@/lib/domain";
import { checkRateLimit } from "@/lib/rate-limit";
import { hashIp, securityHeaders } from "@/lib/security";
import { getVinovalorSession } from "@/lib/session";

const offerSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  message: z.string().max(600).optional()
});

export async function POST(request: NextRequest) {
  const session = await getVinovalorSession();
  const role = session?.user?.role ?? "guest";
  if (!session?.user || !can(role, "buy")) {
    return NextResponse.json({ message: "Vous devez etre connecte pour faire une offre." }, { status: 401, headers: securityHeaders() });
  }

  const key = `offer:${hashIp(request.headers.get("x-forwarded-for"))}:${session.user.id}`;
  if (!checkRateLimit(key, 20, 900)) {
    return NextResponse.json({ message: "Trop d'offres envoyees. Reessayez plus tard." }, { status: 429, headers: securityHeaders() });
  }

  const parsed = offerSchema.safeParse(await request.json());
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
  const amountCents = toCents(parsed.data.amount);
  if (amountCents < Math.round(listing.priceCents * 0.5)) {
    return NextResponse.json({ message: "Offre trop basse pour etre transmise au vendeur." }, { status: 422, headers: securityHeaders() });
  }
  return NextResponse.json(
    {
      message: "Offre validee et prete a etre enregistree par la couche Postgres.",
      status: "validated",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
    },
    { status: 202, headers: securityHeaders() }
  );
}
