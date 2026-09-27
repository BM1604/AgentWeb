import type { BusinessOffer } from "@agentweb/core";
import { crawlSite, type CrawlOptions } from "./crawl.js";
import { buildBusinessOffer } from "./build-offer.js";

export type ExtractOptions = CrawlOptions;

export async function extractFromUrl(url: string, options: ExtractOptions = {}): Promise<BusinessOffer> {
  const startedAt = new Date().toISOString();
  const usePlaywright =
    options.usePlaywright ??
    (process.env.AGENTWEB_USE_PLAYWRIGHT === "1" ||
      process.env.AGENTWEB_USE_PLAYWRIGHT === "true");
  const pages = await crawlSite(url, { ...options, usePlaywright });
  if (pages.length === 0) {
    throw new Error(`No pages crawled from ${url}`);
  }
  return buildBusinessOffer(url, pages, { startedAt, usedPlaywright: !!usePlaywright });
}

export { crawlSite, type CrawlOptions } from "./crawl.js";
export { AGENTWEB_USER_AGENT, DEFAULT_DELAY_MS, DEFAULT_MAX_PAGES } from "./constants.js";
