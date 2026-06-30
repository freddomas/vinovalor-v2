import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getListingById, toCents, validateBid } from "@/lib/domain";
import { checkRateLimit } from "@/lib/rate-limit";
import { hashIp, securityHeaders } from "@/lib/security";

const bidSchema = z.object({
  amount: z.coerce.number().positive()
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Connexion requise pour encherir." }, { status: 401, headers: securityHeaders() });
  }

  const { id } = await context.params;
  const listing = getListingById(id);
  if (!listing || listing.saleMode !== "AUCTION") {
    return NextResponse.json({ message: "Enchere introuvable." }, { status: 404, headers: securityHeaders() });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ message: "Un vendeur ne peut pas encherir sur son propre lot." }, { status: 403, headers: securityHeaders() });
  }
  const key = `bid:${hashIp(request.headers.get("x-forwarded-for"))}:${session.user.id}`;
  if (!checkRateLimit(key, 30, 900)) {
    return NextResponse.json({ message: "Trop de tentatives d'enchere." }, { status: 429, headers: securityHeaders() });
  }
  const parsed = bidSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Montant invalide.", issues: parsed.error.flatten() }, { status: 400, headers: securityHeaders() });
  }
  validateBid(listing.priceCents, toCents(parsed.data.amount), session.user.role);
  return NextResponse.json(
    {
      message: "Enchere validee. L'enregistrement durable exige une transaction Postgres atomique.",
      status: "validated",
      serverTime: new Date().toISOString()
    },
    { status: 202, headers: securityHeaders() }
  );
}
