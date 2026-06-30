import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

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
  return createHash("sha256").update(value ?? "unknown").digest("hex");
}

export function securityHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };
}
