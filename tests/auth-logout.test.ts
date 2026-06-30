import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/auth/logout/route";

const logoutUrl = "https://vinovalor-v2.vercel.app/api/auth/logout";

describe("logout Vinovalor", () => {
  it("redirige vers la connexion en GET et POST", async () => {
    const getResponse = await GET(new NextRequest(logoutUrl, { method: "GET" }));
    const postResponse = await POST(new NextRequest(logoutUrl, { method: "POST" }));

    expect(getResponse.status).toBe(303);
    expect(postResponse.status).toBe(303);
    expect(getResponse.headers.get("location")).toBe("https://vinovalor-v2.vercel.app/connexion");
    expect(postResponse.headers.get("location")).toBe("https://vinovalor-v2.vercel.app/connexion");
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
