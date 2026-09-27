import { AGENTWEB_USER_AGENT } from "./constants.js";

export interface FetchedPage {
  url: string;
  html: string;
  fetchedAt: string;
}

export async function fetchHtml(
  url: string,
  options?: { playwright?: boolean },
): Promise<FetchedPage> {
  const fetchedAt = new Date().toISOString();
  if (options?.playwright) {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({
        userAgent: AGENTWEB_USER_AGENT,
      });
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      const html = await page.content();
      await browser.close();
      return { url, html, fetchedAt };
    } catch (err) {
      console.warn(`Playwright fetch failed for ${url}, falling back to fetch:`, err);
    }
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent": AGENTWEB_USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const html = await res.text();
  return { url, html, fetchedAt };
}

export function createFetchText(): (url: string) => Promise<string | null> {
  return async (url: string) => {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": AGENTWEB_USER_AGENT },
      });
      if (!res.ok) {
        return null;
      }
      return await res.text();
    } catch {
      return null;
    }
  };
}
