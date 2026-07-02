import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/auth/logout/route";

const logoutUrl = "https://vinovalor-v2.vercel.app/api/auth/logout";

describe("logout Vinovalor", () => {
  it("refuse GET et redirige vers la connexion en POST", async () => {
    const getResponse = await GET();
    const postResponse = await POST(new NextRequest(logoutUrl, { method: "POST" }));

    expect(getResponse.status).toBe(405);
    expect(postResponse.status).toBe(303);
    expect(postResponse.headers.get("location")).toBe("https://vinovalor-v2.vercel.app/connexion");
  });

  it("refuse un POST cross-site", async () => {
    const response = await POST(
      new NextRequest(logoutUrl, {
        method: "POST",
        headers: { origin: "https://attacker.example", "sec-fetch-site": "cross-site" }
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ message: "Origine non autorisée." });
  });

  it("expire les cookies de session connus", async () => {
    const response = await POST(new NextRequest(logoutUrl, { method: "POST" }));
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(setCookie).toContain("vinovalor.session-token=");
    expect(setCookie).toContain("__Secure-vinovalor.session-token=");
    expect(setCookie).toContain("next-auth.session-token=");
    expect(setCookie).toContain("__Secure-next-auth.session-token=");
    expect(setCookie).toContain("Max-Age=0");
  });
});
