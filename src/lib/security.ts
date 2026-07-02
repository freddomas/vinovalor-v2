import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const iterations = 210_000;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const digest = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${digest}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, iterationText, salt, digest] = stored.split("$");
  if (scheme !== "pbkdf2_sha256" || !iterationText || !salt || !digest) return false;
  const candidate = pbkdf2Sync(password, salt, Number(iterationText), 32, "sha256");
  const storedBuffer = Buffer.from(digest, "hex");
  return storedBuffer.length === candidate.length && timingSafeEqual(storedBuffer, candidate);
}

export function hashIp(value: string | null): string {
  const firstForwardedIp = value?.split(",")[0]?.trim();
  return createHash("sha256").update(firstForwardedIp || "unknown").digest("hex");
}

export function securityHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off"
  };
}

export function assertSameOrigin(request: Request): void {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site" && secFetchSite !== "none") {
    throw new Error("Requête cross-site refusée.");
  }

  const origin = request.headers.get("origin");
  if (!origin) return;

  const expectedOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).origin : expectedOrigin;
  if (origin !== expectedOrigin && origin !== configuredOrigin) {
    throw new Error("Origine non autorisée.");
  }
}

export async function safeJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("JSON invalide.");
  }
}

export function forbidden(message: string) {
  return NextResponse.json({ message }, { status: 403, headers: securityHeaders() });
}
