import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const port = Number(process.env.QA_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
const screenshotsDir = resolve("qa/screenshots");
mkdirSync(screenshotsDir, { recursive: true });

const stdout = createWriteStream("qa/visual-server.stdout.log");
const stderr = createWriteStream("qa/visual-server.stderr.log");

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
  env: {
    ...process.env,
    NEXTAUTH_URL: baseURL,
    NEXTAUTH_SECRET: "visual-qa-local-secret"
  },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true
});

server.stdout.pipe(stdout);
server.stderr.pipe(stderr);

let serverExited = false;
server.on("exit", () => {
  serverExited = true;
});

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    if (serverExited) throw new Error("Le serveur Next s'est arrete avant la QA.");
    try {
      const response = await fetch(`${baseURL}/api/health`);
      if (response.ok) return;
    } catch {
      // Retry until server is ready.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 750));
  }
  throw new Error("Le serveur Next n'a pas repondu a temps.");
}

const checks = [];

async function capture(page, name, path, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded" });
  await page.locator("body").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const visibleImages = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
    });
    return visibleImages.every((image) => image.complete && image.naturalWidth > 0);
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 3) {
    throw new Error(`${name}: overflow horizontal de ${overflow}px`);
  }
  await page.screenshot({ path: `qa/screenshots/${name}.png`, fullPage: false });
  checks.push({ name, path, viewport, status: "ok" });
}

async function probe(page, name, path, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  const response = await page.goto(`${baseURL}${path}`, { waitUntil: "domcontentloaded" });
  if (!response?.ok()) {
    throw new Error(`${name}: HTTP ${response?.status() ?? "unknown"} sur ${path}`);
  }
  await page.locator("body").waitFor({ state: "visible" });
  const result = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const brokenImages = Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute("src") ?? "");
    const interactiveWithoutName = Array.from(document.querySelectorAll("a, button, input, select, textarea"))
      .filter((element) => {
        if ("labels" in element && element.labels?.length) return false;
        const label = element.getAttribute("aria-label") || element.textContent || element.getAttribute("placeholder") || element.getAttribute("title");
        return !String(label ?? "").trim();
      }).length;
    return { overflow, brokenImages, interactiveWithoutName };
  });
  if (result.overflow > 3) throw new Error(`${name}: overflow horizontal de ${result.overflow}px`);
  if (result.brokenImages.length) throw new Error(`${name}: image cassee ${result.brokenImages[0]}`);
  if (result.interactiveWithoutName) throw new Error(`${name}: ${result.interactiveWithoutName} controle(s) sans nom accessible`);
  checks.push({ name, path, viewport, status: "ok" });
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await capture(page, "desktop-1440x900", "/", { width: 1440, height: 900 });
  await capture(page, "laptop-1366x768", "/", { width: 1366, height: 768 });
  await capture(page, "tablet-1024x768", "/catalogue", { width: 1024, height: 768 });
  await capture(page, "tablet-768x1024", "/catalogue?certified=true", { width: 768, height: 1024 });
  await capture(page, "mobile-430x932", "/catalogue", { width: 430, height: 932 });
  await capture(page, "mobile-390x844", "/annonces/9064f9bc-cb7e-4d2d-8bb7-f08cd021aab4", { width: 390, height: 844 });
  await capture(page, "mobile-360x800", "/catalogue?mode=AUCTION", { width: 360, height: 800 });
  await capture(page, "mobile-320x568", "/connexion", { width: 320, height: 568 });
  await capture(page, "mobile-landscape-932x430", "/annonces/9064f9bc-cb7e-4d2d-8bb7-f08cd021aab4", { width: 932, height: 430 });
  await capture(page, "sell-desktop", "/vendre", { width: 1440, height: 900 });
  await capture(page, "auctions-desktop", "/encheres", { width: 1440, height: 900 });
  await capture(page, "restaurants-desktop", "/restaurants", { width: 1440, height: 900 });
  await capture(page, "listing-detail-desktop", "/annonces/9064f9bc-cb7e-4d2d-8bb7-f08cd021aab4", { width: 1440, height: 900 });
  await capture(page, "login-desktop", "/connexion", { width: 1440, height: 900 });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Navigation principale").getByRole("link", { name: "Acheter" }).click();
  await page.waitForURL(/\/catalogue/);
  await page.getByLabel("Type").selectOption("RED");
  await page.getByRole("button", { name: /Filtrer/i }).click();
  await page.getByRole("heading", { name: /17 lots verifies/i }).waitFor();
  checks.push({ name: "navigation-catalogue-filtre", path: "/catalogue?type=RED", status: "ok" });

  await page.goto(`${baseURL}/catalogue?mode=AUCTION&certified=true`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /lots verifies/i }).waitFor();
  checks.push({ name: "catalogue-filtres-combines", path: "/catalogue?mode=AUCTION&certified=true", status: "ok" });

  await page.goto(`${baseURL}/connexion`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill("admin@vinovalor.local");
  await page.getByLabel("Mot de passe").fill("wrong-password");
  await page.getByRole("button", { name: /Se connecter/i }).click();
  await page.getByRole("alert").waitFor();
  checks.push({ name: "login-erreur-accessible", path: "/connexion", status: "ok" });

  const matrixViewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "laptop", width: 1366, height: 768 },
    { name: "tablet-landscape", width: 1024, height: 768 },
    { name: "tablet-portrait", width: 768, height: 1024 },
    { name: "mobile-large", width: 430, height: 932 },
    { name: "mobile-regular", width: 390, height: 844 },
    { name: "mobile-small", width: 360, height: 800 },
    { name: "mobile-min", width: 320, height: 568 },
    { name: "mobile-landscape", width: 932, height: 430 }
  ];
  const matrixPaths = [
    "/",
    "/catalogue",
    "/catalogue?type=RED",
    "/catalogue?mode=AUCTION",
    "/catalogue?certified=true",
    "/catalogue?region=bordeaux",
    "/catalogue?maxPrice=100",
    "/catalogue?q=hennessy",
    "/catalogue?q=aucun-resultat-probable",
    "/annonces/9064f9bc-cb7e-4d2d-8bb7-f08cd021aab4",
    "/annonces/6129cefb-140a-4358-80c0-687e30210c35",
    "/restaurants",
    "/restaurants/138a09dd-1a12-4b06-b77c-d854319af8f5",
    "/encheres",
    "/vendre",
    "/connexion",
    "/espace",
    "/admin"
  ];

  for (const viewport of matrixViewports) {
    for (const path of matrixPaths) {
      await probe(page, `matrix-${viewport.name}-${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}`, path, viewport);
    }
  }

  await browser.close();
}

try {
  await run();
  writeFileSync(
    "qa/visual-qa.json",
    JSON.stringify(
      {
        status: "ok",
        generatedAt: new Date().toISOString(),
        baseURL,
        checks
      },
      null,
      2
    )
  );
} catch (error) {
  writeFileSync(
    "qa/visual-qa.json",
    JSON.stringify(
      {
        status: "failed",
        generatedAt: new Date().toISOString(),
        baseURL,
        error: error instanceof Error ? error.message : String(error),
        checks
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  server.kill();
  stdout.end();
  stderr.end();
}
