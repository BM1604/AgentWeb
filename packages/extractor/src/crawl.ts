import { DEFAULT_DELAY_MS, DEFAULT_MAX_PAGES } from "./constants.js";
import { extractLinks, htmlToMarkdown } from "./html-to-markdown.js";
import { fetchHtml, type FetchedPage } from "./fetch-page.js";
import { loadRobots } from "./robots.js";
import { createFetchText } from "./fetch-page.js";
import { discoverSitemapUrls, expandSitemapIndex } from "./sitemap.js";
import { isLikelyAsset, normalizeUrl, sameOrigin } from "./url-utils.js";

export interface CrawlOptions {
  maxPages?: number;
  delayMs?: number;
  usePlaywright?: boolean;
  respectRobots?: boolean;
}

export interface CrawledPage {
  url: string;
  title: string;
  markdown: string;
  html: string;
  fetchedAt: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function crawlSite(startUrl: string, options: CrawlOptions = {}): Promise<CrawledPage[]> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const respectRobots = options.respectRobots ?? true;
  const origin = new URL(startUrl).origin;
  const fetchText = createFetchText();
  const robots = respectRobots ? await loadRobots(origin, fetchText) : { allowed: () => true, crawlDelayMs: 0 };
  const effectiveDelay = Math.max(delayMs, robots.crawlDelayMs);

  let candidates: string[] = [];
  const sitemapRoots = await discoverSitemapUrls(startUrl, fetchText);
  if (sitemapRoots.length) {
    candidates = await expandSitemapIndex(sitemapRoots, fetchText, startUrl);
  }

  const visited = new Set<string>();
  const queue: string[] = [normalizeUrl(startUrl, startUrl)!];
  if (candidates.length) {
    queue.push(...candidates.slice(0, maxPages * 2));
  }
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const raw = queue.shift();
    if (!raw) {
      break;
    }
    const url = normalizeUrl(startUrl, raw);
    if (!url || visited.has(url) || !sameOrigin(startUrl, url) || isLikelyAsset(url)) {
      continue;
    }
    visited.add(url);
    if (respectRobots && !robots.allowed(url)) {
      continue;
    }
    if (pages.length > 0) {
      await sleep(effectiveDelay);
    }
    let fetched: FetchedPage;
    try {
      fetched = await fetchHtml(url, { playwright: options.usePlaywright });
    } catch {
      continue;
    }
    const { title, markdown } = htmlToMarkdown(fetched.html, url);
    pages.push({
      url,
      title,
      markdown,
      html: fetched.html,
      fetchedAt: fetched.fetchedAt,
    });
    if (!candidates.length) {
      for (const href of extractLinks(fetched.html, url)) {
        const n = normalizeUrl(url, href);
        if (n && !visited.has(n)) {
          queue.push(n);
        }
      }
    }
  }

  return pages;
}
