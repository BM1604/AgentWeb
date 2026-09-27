import type { BusinessOffer, ActionLink, OfferItem, OpeningHours } from "@agentweb/core";
import { slugifyId, validateBusinessOffer } from "@agentweb/core";
import type { CrawledPage } from "./crawl.js";
import {
  extractActionLinksFromHtml,
  extractContactFromHtml,
  extractOffersFromMarkdown,
  extractServiceHeadingsFromMarkdown,
  parseFrenchOpeningHoursText,
  parseJsonLdFromHtml,
  parseSiteNameFromHtml,
  type ParsedStructured,
} from "./structured-data.js";
import { AGENTWEB_USER_AGENT } from "./constants.js";
import { maybeEnrichWithLlm } from "./llm-structurer.js";

function mergeStructured(acc: ParsedStructured, part: ParsedStructured): ParsedStructured {
  return {
    name: acc.name ?? part.name,
    description: acc.description ?? part.description,
    telephone: [...(acc.telephone ?? []), ...(part.telephone ?? [])],
    email: [...(acc.email ?? []), ...(part.email ?? [])],
    address: acc.address ?? part.address,
    openingHours: acc.openingHours ?? part.openingHours,
    offers: [...(acc.offers ?? []), ...(part.offers ?? [])],
    faq: [...(acc.faq ?? []), ...(part.faq ?? [])],
    sectorType: acc.sectorType ?? part.sectorType,
  };
}

function dedupeOffers(items: OfferItem[]): OfferItem[] {
  const seen = new Map<string, OfferItem>();
  for (const item of items) {
    const key = slugifyId(item.name);
    const existing = seen.get(key);
    if (!existing || (item.price && !existing.price)) {
      seen.set(key, item);
    }
  }
  return [...seen.values()];
}

function dedupeActions(links: ActionLink[]): ActionLink[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.url)) {
      return false;
    }
    seen.add(l.url);
    return true;
  });
}

function inferSectorHint(structured: ParsedStructured, pages: CrawledPage[]): string | undefined {
  if (structured.sectorType) {
    if (/AutoRepair/i.test(structured.sectorType)) {
      return "auto_repair";
    }
    return structured.sectorType;
  }
  const blob = pages.map((p) => p.markdown).join("\n").toLowerCase();
  if (/garage|carrosserie|mécanique|mecanique|vidange|pneu/.test(blob)) {
    return "auto_repair";
  }
  return undefined;
}

export async function buildBusinessOffer(
  startUrl: string,
  pages: CrawledPage[],
  meta: { startedAt: string; usedPlaywright: boolean },
): Promise<BusinessOffer> {
  let structured: ParsedStructured = {};
  const allActions: ActionLink[] = [];
  let contact = {};
  const markdownOffers: OfferItem[] = [];

  for (const page of pages) {
    structured = mergeStructured(structured, parseJsonLdFromHtml(page.html, page.url));
    contact = { ...contact, ...extractContactFromHtml(page.html) };
    allActions.push(...extractActionLinksFromHtml(page.html, page.url));
    markdownOffers.push(...extractOffersFromMarkdown(page.markdown, page.url));
    markdownOffers.push(...extractServiceHeadingsFromMarkdown(page.markdown, page.url));
  }

  const home = pages.find((p) => p.url.replace(/\/$/, "") === startUrl.replace(/\/$/, "")) ?? pages[0];
  let name =
    structured.name ??
    home?.title?.split("|")[0]?.trim() ??
    new URL(startUrl).hostname;
  if (name.length > 70) {
    for (const page of pages) {
      const siteName = parseSiteNameFromHtml(page.html);
      if (siteName && siteName.length <= 80) {
        name = siteName;
        break;
      }
    }
  }
  if (name.length > 70) {
    const tailNames = pages
      .map((p) => p.title?.split("|").pop()?.trim())
      .filter((t): t is string => Boolean(t && t.length > 2 && t.length < 60));
    if (tailNames.length) {
      const counts = new Map<string, number>();
      for (const t of tailNames) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (best) {
        name = best;
      }
    }
  }

  let schedule = structured.openingHours;
  if (!schedule?.length) {
    const hoursText = pages.map((p) => p.markdown).join("\n");
    schedule = parseFrenchOpeningHoursText(hoursText);
  }

  const openingHours: OpeningHours | undefined = schedule?.length
    ? { schedule, summary: undefined }
    : undefined;

  const offers = dedupeOffers([...(structured.offers ?? []), ...markdownOffers]);

  const finishedAt = new Date().toISOString();
  let offer: BusinessOffer = {
    schemaVersion: "1.0",
    identity: {
      name,
      description: structured.description,
      websiteUrl: startUrl,
      sectorHint: inferSectorHint(structured, pages),
    },
    contact: {
      phone: structured.telephone?.length
        ? [...new Set(structured.telephone)]
        : (contact as { phone?: string[] }).phone,
      email: structured.email?.length
        ? [...new Set(structured.email)]
        : (contact as { email?: string[] }).email,
      address: structured.address,
    },
    openingHours,
    offers,
    faq: structured.faq ?? [],
    actionLinks: dedupeActions(allActions),
    pages: pages.map((p) => ({
      url: p.url,
      title: p.title,
      markdown: p.markdown,
      fetchedAt: p.fetchedAt,
    })),
    sources: pages.map((p) => ({
      url: p.url,
      title: p.title,
      retrievedAt: p.fetchedAt,
    })),
    metadata: {
      startedAt: meta.startedAt,
      finishedAt,
      userAgent: AGENTWEB_USER_AGENT,
      pagesCrawled: pages.length,
      usedPlaywright: meta.usedPlaywright,
      robotsRespected: true,
    },
  };

  offer = await maybeEnrichWithLlm(offer, pages);
  validateBusinessOffer(offer);
  return offer;
}
