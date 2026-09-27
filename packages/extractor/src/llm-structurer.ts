import type { BusinessOffer } from "@agentweb/core";
import type { CrawledPage } from "./crawl.js";

/**
 * Optional LLM enrichment hook. Activated only when OPENAI_API_KEY or AGENTWEB_LLM_API_KEY is set.
 */
export async function maybeEnrichWithLlm(offer: BusinessOffer, _pages: CrawledPage[]): Promise<BusinessOffer> {
  const apiKey = process.env.AGENTWEB_LLM_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return offer;
  }
  // Extension point: call an LLM to refine offers/FAQ. Not used in POC by default.
  return offer;
}
