import { expect, test } from "@playwright/test";

test("admin local peut quitter la session et changer d'utilisateur", async ({ page }) => {
  await page.goto("/connexion", { waitUntil: "domcontentloaded" });

  await page.getByLabel("Email").fill("admin@vinovalor.local");
  await page.getByLabel("Mot de passe").fill("demo2026!");
  const loginButton = page.getByRole("button", { name: /se connecter/i });
  await expect(loginButton).toBeEnabled();
  await Promise.all([
    page.waitForURL(/\/espace/),
    loginButton.click()
  ]);

  await expect(page.getByRole("link", { name: "Mon compte" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Déconnexion" })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/connexion/),
    page.getByRole("button", { name: "Déconnexion" }).click()
  ]);

  await expect(page.getByRole("link", { name: "Connexion" })).toBeVisible();

  const sessionResponse = await page.request.get("/api/auth/me");
  expect(sessionResponse.status()).toBe(401);
  await expect(sessionResponse.json()).resolves.toMatchObject({ authenticated: false });
});
