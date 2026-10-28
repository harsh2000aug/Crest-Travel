import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { preview } from "vite";

const site = "https://www.cresttravelclub.com";
const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  new URL(match[1]).pathname,
);
assert(routes.length > 0, "Build the site before running SEO checks.");
const server = await preview({ preview: { host: "127.0.0.1", port: 0, open: false } });
const origin = "http://127.0.0.1:" + server.httpServer.address().port;
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PRERENDER_BROWSER_CHANNEL && { channel: process.env.PRERENDER_BROWSER_CHANNEL }),
  });
  const page = await browser.newPage();
  const expectedMetadata = new Map();
  // DOMParser inspects actual response HTML without executing its scripts.
  for (const path of routes) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const data = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      return {
        titles: [...doc.querySelectorAll("title")].map((node) => node.textContent),
        descriptions: [...doc.querySelectorAll('meta[name="description"]')].map((node) => node.content),
        canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((node) => node.href),
        schemas: [...doc.head.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent)),
        bodySchemas: doc.body.querySelectorAll('script[type="application/ld+json"]').length,
        content: doc.getElementById("root")?.textContent.trim(),
      };
    }, html);
    expectedMetadata.set(path, data);
    assert.equal(data.titles.length, 1, path + " title count");
    assert(data.titles[0].trim() && data.titles[0] !== "Crest Travel Club", path + " title");
    assert.equal(data.descriptions.length, 1, path + " description count");
    assert(data.descriptions[0].trim(), path + " description");
    assert.deepEqual(data.canonicals, [site + path], path + " canonical");
    assert(data.schemas.length > 0, path + " schema");
    assert.equal(data.bodySchemas, 0, path + " duplicate body schema");
    assert(data.content?.length > 100, path + " page content");
  }
  const fallback = await (await fetch(origin + "/login-page", {
    headers: { Accept: "text/html" },
  })).text();
  assert.deepEqual([...fallback.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => match[1]),
    ["Crest Travel Club"], "SPA fallback must have exactly one default title");

  const article = routes.find((path) => path.startsWith("/blogs/"));
  assert(article, "Expected at least one article to verify");
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const plain = await noJs.newPage();
  await plain.route("**/*", (route) => {
    const request = route.request();
    return request.resourceType() === "document" ? route.continue() : route.abort();
  });
  await plain.goto(origin + article, { waitUntil: "domcontentloaded" });
  assert((await plain.locator("h1").first().textContent())?.trim(), "Article readable without JavaScript");
  await noJs.close();

  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (["image", "font", "media"].includes(route.request().resourceType()) ||
        /googletagmanager\.com$|google-analytics\.com$|tawk\.to$/.test(url.hostname)) {
      return route.abort();
    }
    return route.continue();
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const checkLive = async (path) => {
    const metadata = expectedMetadata.get(path);
    await page.waitForFunction(({ expected, title, description }) =>
      location.pathname === expected &&
      document.head.querySelectorAll("title").length === 1 &&
      document.title === title &&
      document.head.querySelector('meta[name="description"]')?.content === description &&
      document.head.querySelector('link[rel="canonical"]')?.href === "https://www.cresttravelclub.com" + expected &&
      (!expected.startsWith("/blogs") || document.querySelector("[data-prerender-ready]")?.getAttribute("data-prerender-ready") === expected),
    { expected: path, title: metadata.titles[0], description: metadata.descriptions[0] }, { timeout: 45000 });
    assert.equal(await page.locator("title").count(), 1, path + " live title");
    assert.equal(await page.locator('meta[name="description"]').count(), 1, path + " live description");
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1, path + " live canonical");
    assert.equal(await page.locator("[data-prerender-head]").count(), 0, path + " snapshot cleanup");
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    assert.equal(schemas.length, metadata.schemas.length, path + " live schema count");
    schemas.forEach((schema) => JSON.parse(schema));
  };
  await page.goto(origin + article, { waitUntil: "domcontentloaded" });
  await checkLive(article);
  await page.locator('.luxFooter a[href="/about-us"]').click();
  await checkLive("/about-us");
  await page.locator('.luxFooter a[href="/blogs"]').click();
  await checkLive("/blogs");
  await page.locator('a[href="' + article + '"]').first().click();
  await checkLive(article);
  // A local test token exercises member routing; all backend calls stay mocked.
  await page.route("https://backend.tripoairllc.com/**", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({ success: true, benefits: [], data: {} }),
  }));
  await page.evaluate(() => localStorage.setItem("accessToken", "seo-title-test"));
  await page.goto(origin + "/benefits", { waitUntil: "domcontentloaded" });
  const checkDefaultTitle = async () => {
    await page.waitForFunction(() =>
      location.pathname === "/benefits" &&
      document.querySelector("h1")?.textContent.includes("Member Benefit") &&
      document.title === "Crest Travel Club" &&
      document.head.querySelectorAll("title").length === 1 &&
      !!document.head.querySelector("title[data-default-title]"),
    null, { timeout: 45000 });
  };
  await checkDefaultTitle();
  await page.locator('a[href="/home"]').first().click();
  await page.waitForFunction(() =>
    location.pathname === "/home" &&
    document.title === "Crest Travel Club | Save on Hotels, Flights & More" &&
    document.head.querySelectorAll("title").length === 1 &&
    !document.head.querySelector("title[data-default-title]"),
  null, { timeout: 45000 });
  await page.locator('a[href="/benefits"]').first().click();
  await checkDefaultTitle();
  await page.locator('.luxFooter a[href="/about-us"]').click();
  await checkLive("/about-us");
  assert.deepEqual(errors, [], "Client navigation errors");
  console.log("SEO checks passed: " + routes.length + " raw HTML responses, no-JavaScript article, default titles, and React navigation.");
} finally {
  await browser?.close();
  server.httpServer.closeAllConnections();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
