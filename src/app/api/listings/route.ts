import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertListingCanBePublished, can, getListings } from "@/lib/domain";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { hashIp, securityHeaders } from "@/lib/security";

const createListingSchema = z.object({
  wineName: z.string().min(2).max(160),
  wineType: z.enum(["RED", "WHITE", "ROSE", "SPARKLING", "COGNAC", "WHISKY", "SAKE"]),
  vintage: z.coerce.number().int().min(1800).max(2026).optional().or(z.literal("")),
  appellation: z.string().max(120).optional(),
  price: z.coerce.number().positive(),
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
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "guest";
  if (!session?.user || !can(role, "sell")) {
    return NextResponse.json({ message: "Publication interdite pour ce compte." }, { status: 403, headers: securityHeaders() });
  }

  const key = `listing:${hashIp(request.headers.get("x-forwarded-for"))}:${session.user.id}`;
  if (!checkRateLimit(key, 12, 900)) {
    return NextResponse.json({ message: "Trop de tentatives. Reessayez plus tard." }, { status: 429, headers: securityHeaders() });
  }

  const parsed = createListingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Annonce invalide.", issues: parsed.error.flatten() }, { status: 400, headers: securityHeaders() });
  }

  assertListingCanBePublished({
    wineName: parsed.data.wineName,
    wineType: parsed.data.wineType,
    price: parsed.data.price,
    quantity: parsed.data.quantity,
    condition: parsed.data.condition,
    saleMode: parsed.data.saleMode,
    evinMessage: parsed.data.evinMessage
  });

  return NextResponse.json(
    {
      message: "Annonce validee cote serveur. Persistance Postgres requise pour publication durable.",
      status: "validated",
      requires: ["photos_preuve", "moderation_images", "controle_conformite"]
    },
    { status: 202, headers: securityHeaders() }
  );
}
