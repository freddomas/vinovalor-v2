import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertListingCanBePublished, can, getListings } from "@/lib/domain";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, forbidden, hashIp, safeJson, securityHeaders } from "@/lib/security";
import { getVinovalorSession } from "@/lib/session";

const createListingSchema = z.object({
  wineName: z.string().min(2).max(160),
  wineType: z.enum(["RED", "WHITE", "ROSE", "SPARKLING", "COGNAC", "WHISKY", "SAKE"]),
  vintage: z.coerce.number().int().min(1800).max(2026).optional().or(z.literal("")),
  appellation: z.string().max(120).optional(),
  price: z.coerce.number().finite().positive(),
  quantity: z.coerce.number().int().positive(),
  condition: z.enum(["GOOD", "EXCELLENT"]),
  saleMode: z.enum(["FIXED", "AUCTION"]),
  storageConditions: z.string().max(1000).optional(),
  evinMessage: z.string().min(20)
});

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const data = getListings({
    q: params.get("q") ?? undefined,
    type: params.get("type") ?? undefined,
    region: params.get("region") ?? undefined,
    mode: params.get("mode") ?? undefined,
    certified: params.get("certified") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined
  });
  return NextResponse.json({ data, count: data.length }, { headers: securityHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
  } catch {
    return forbidden("Origine non autorisée.");
  }

  const session = await getVinovalorSession();
  const role = session?.user?.role ?? "guest";
  if (!session?.user || !can(role, "sell")) {
    return NextResponse.json({ message: "Publication interdite pour ce compte." }, { status: 403, headers: securityHeaders() });
  }

  const key = `listing:${hashIp(request.headers.get("x-forwarded-for"))}:${session.user.id}`;
  if (!checkRateLimit(key, 12, 900)) {
    return NextResponse.json({ message: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: securityHeaders() });
  }

  let payload: unknown;
  try {
    payload = await safeJson(request);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "JSON invalide." }, { status: 400, headers: securityHeaders() });
  }

  const parsed = createListingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Annonce invalide.", issues: parsed.error.flatten() }, { status: 400, headers: securityHeaders() });
  }

  try {
    assertListingCanBePublished({
      wineName: parsed.data.wineName,
      wineType: parsed.data.wineType,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      saleMode: parsed.data.saleMode,
      evinMessage: parsed.data.evinMessage
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Validation métier impossible." },
      { status: 422, headers: securityHeaders() }
    );
  }

  return NextResponse.json(
    {
      message: "Annonce validée côté serveur. Persistance Postgres requise pour publication durable.",
      status: "validated",
      requires: ["photos_preuve", "modération_images", "contrôle_conformité"]
    },
    { status: 202, headers: securityHeaders() }
  );
}
