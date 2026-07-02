import { expect, test } from "@playwright/test";

test("navigation principale et catalogue", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Vinovalor" })).toBeVisible();
  const desktopNav = page.getByLabel("Navigation principale");
  const navigationTarget = (await desktopNav.isVisible())
    ? desktopNav.getByRole("link", { name: "Acheter" })
    : page.locator(".topbar__actions").getByRole("link", { name: /Rechercher/i });
  await Promise.all([page.waitForURL(/\/catalogue/), navigationTarget.click()]);
  await expect(page.getByRole("heading", { name: /lots vérifiés/i })).toBeVisible();
  await page.getByLabel("Type").selectOption("RED");
  await page.getByRole("button", { name: /filtrer/i }).click();
  await expect(page.getByRole("heading", { name: /17 lots vérifiés/i })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Rouge" }).first()).toBeVisible();
});

test("fiche annonce expose prix, preuve et actions", async ({ page }) => {
  await page.goto("/catalogue", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: /^Voir$/ }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByText(/Score de confiance/i)).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Acheter" })).toBeVisible();
});

test("routes protégées contextualisent la connexion", async ({ page }) => {
  await page.goto("/vendre", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Connexion requise/i)).toBeVisible();
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Administration protégée/i)).toBeVisible();
});

test("la navigation basse reste mobile uniquement sur desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".mobile-nav")).toBeHidden();
});
