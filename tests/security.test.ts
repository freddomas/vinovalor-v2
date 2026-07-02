import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSameOrigin, securityHeaders } from "@/lib/security";

describe("sécurité applicative", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("pose les headers de sécurité minimaux", () => {
    expect(securityHeaders()).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
  });

  it("bloque les mutations cross-site", () => {
    const request = new Request("https://vinovalor-v2.vercel.app/api/offers", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site"
      }
    });

    expect(() => assertSameOrigin(request)).toThrow(/cross-site|Origine/i);
  });

  it("désactive les comptes credentials démo en production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    const { authOptions } = await import("@/lib/auth");

    expect(authOptions.providers.some((provider) => provider.id === "credentials")).toBe(false);
  });

  it("n'accorde pas un rôle acheteur implicite à un nouvel OAuth", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    const { authOptions } = await import("@/lib/auth");
    const jwt = authOptions.callbacks?.jwt;
    expect(jwt).toBeDefined();
    type JwtCallback = NonNullable<typeof jwt>;

    const args: Parameters<JwtCallback>[0] = {
      token: {},
      user: { id: "oauth-user", name: "OAuth User", email: "oauth@example.com" },
      account: null,
      profile: undefined,
      trigger: "signIn",
      session: undefined
    } as Parameters<JwtCallback>[0];

    const token = await jwt!(args);

    expect(token.role).toBe("guest");
  });
});
