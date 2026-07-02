import { describe, expect, it } from "vitest";
import {
  assertListingCanBePublished,
  can,
  getAuctions,
  getDashboardMetrics,
  getListingById,
  getListings,
  toCents,
  validateBid
} from "@/lib/domain";
import { hashPassword, verifyPassword } from "@/lib/security";

describe("domaine Vinovalor", () => {
  it("conserve les volumes vérifiés de la capture", () => {
    const metrics = getDashboardMetrics();
    expect(metrics.listings).toBe(41);
    expect(metrics.restaurants).toBe(6);
    expect(metrics.auctions).toBe(4);
    expect(metrics.fixed).toBe(37);
  });

  it("filtre le catalogue par type, region et mode", () => {
    const results = getListings({ type: "RED", region: "bordeaux", mode: "FIXED" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((listing) => listing.wineType === "RED")).toBe(true);
    expect(results.every((listing) => listing.region === "bordeaux")).toBe(true);
    expect(results.every((listing) => listing.saleMode === "FIXED")).toBe(true);
  });

  it("refuse les annonces sans prix ou quantité positive", () => {
    expect(() =>
      assertListingCanBePublished({
        wineName: "Test",
        wineType: "RED",
        price: 0,
        quantity: 1,
        condition: "EXCELLENT",
        saleMode: "FIXED",
        evinMessage: "Message sanitaire obligatoire pour la vente alcool."
      })
    ).toThrow(/prix/i);

    expect(() =>
      assertListingCanBePublished({
        wineName: "Test",
        wineType: "RED",
        price: 12,
        quantity: -1,
        condition: "EXCELLENT",
        saleMode: "FIXED",
        evinMessage: "Message sanitaire obligatoire pour la vente alcool."
      })
    ).toThrow(/quantité/i);
  });

  it("valide une annonce minimale publiable", () => {
    expect(
      assertListingCanBePublished({
        wineName: "Chateau test",
        wineType: "RED",
        price: 120,
        quantity: 2,
        condition: "EXCELLENT",
        saleMode: "FIXED",
        evinMessage: "Message sanitaire obligatoire pour la vente alcool."
      })
    ).toBe(true);
  });

  it("protege les permissions serveur", () => {
    expect(can("guest", "buy")).toBe(false);
    expect(can("buyer", "sell")).toBe(false);
    expect(can("seller", "sell")).toBe(true);
    expect(can("admin", "admin")).toBe(true);
  });

  it("exige une enchère strictement supérieure", () => {
    const auction = getAuctions()[0];
    expect(auction).toBeDefined();
    expect(() => validateBid(auction.priceCents, auction.priceCents, "buyer")).toThrow(/supérieure/i);
    expect(validateBid(auction.priceCents, auction.priceCents + 100, "buyer")).toBe(true);
  });

  it("formate les prix en centimes sans perte", () => {
    expect(toCents("199.99")).toBe(19_999);
    expect(toCents(200)).toBe(20_000);
  });

  it("verifie les mots de passe locaux par comparaison constante", () => {
    const hash = hashPassword("demo2026!", "test-salt");
    expect(verifyPassword("demo2026!", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("retrouve une annonce par identifiant", () => {
    const listing = getListings()[0];
    expect(getListingById(listing.id)?.id).toBe(listing.id);
  });
});
