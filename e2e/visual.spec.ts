import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop-1440x900", width: 1440, height: 900, path: "/" },
  { name: "laptop-1366x768", width: 1366, height: 768, path: "/" },
  { name: "tablet-1024x768", width: 1024, height: 768, path: "/catalogue" },
  { name: "mobile-430x932", width: 430, height: 932, path: "/catalogue" },
  { name: "mobile-390x844", width: 390, height: 844, path: "/annonces/9064f9bc-cb7e-4d2d-8bb7-f08cd021aab4" }
];

test("captures visuelles principales", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "chromium-desktop", "Captures centralisees sur le projet desktop.");

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(viewport.path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await page.screenshot({ path: `qa/screenshots/${viewport.name}.png`, fullPage: false });
  }

  for (const [name, path] of [
    ["sell-desktop", "/vendre"],
    ["auctions-desktop", "/encheres"],
    ["restaurants-desktop", "/restaurants"],
    ["login-desktop", "/connexion"]
  ] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await page.screenshot({ path: `qa/screenshots/${name}.png`, fullPage: false });
  }
});
