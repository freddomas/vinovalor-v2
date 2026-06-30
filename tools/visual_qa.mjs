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
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 3) {
    throw new Error(`${name}: overflow horizontal de ${overflow}px`);
  }
  await page.screenshot({ path: `qa/screenshots/${name}.png`, fullPage: false });
  checks.push({ name, path, viewport, status: "ok" });
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await capture(page, "desktop-1440x900", "/", { width: 1440, height: 900 });
  await capture(page, "laptop-1366x768", "/", { width: 1366, height: 768 });
  await capture(page, "tablet-1024x768", "/catalogue", { width: 1024, height: 768 });
  await capture(page, "mobile-430x932", "/catalogue", { width: 430, height: 932 });
  await capture(page, "mobile-390x844", "/annonces/9064f9bc-cb7e-4d2d-8bb7-f08cd021aab4", { width: 390, height: 844 });
  await capture(page, "sell-desktop", "/vendre", { width: 1440, height: 900 });
  await capture(page, "auctions-desktop", "/encheres", { width: 1440, height: 900 });
  await capture(page, "restaurants-desktop", "/restaurants", { width: 1440, height: 900 });
  await capture(page, "login-desktop", "/connexion", { width: 1440, height: 900 });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Navigation principale").getByRole("link", { name: "Acheter" }).click();
  await page.waitForURL(/\/catalogue/);
  await page.getByLabel("Type").selectOption("RED");
  await page.getByRole("button", { name: /Filtrer/i }).click();
  await page.getByRole("heading", { name: /17 bouteilles/i }).waitFor();
  checks.push({ name: "navigation-catalogue-filtre", path: "/catalogue?type=RED", status: "ok" });

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
