import { XMLParser } from "fast-xml-parser";
import { isLikelyAsset, normalizeUrl, sameOrigin } from "./url-utils.js";

export async function discoverSitemapUrls(
  startUrl: string,
  fetchText: (url: string) => Promise<string | null>,
): Promise<string[]> {
  const origin = new URL(startUrl).origin;
  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/wp-sitemap.xml`,
  ];
  const found: string[] = [];
  for (const c of candidates) {
    const xml = await fetchText(c);
    if (xml && (xml.includes("<urlset") || xml.includes("<sitemapindex"))) {
      found.push(...parseSitemapXml(xml, startUrl));
    }
  }
  return [...new Set(found)].filter((u) => sameOrigin(startUrl, u) && !isLikelyAsset(u));
}

function parseSitemapXml(xml: string, baseUrl: string): string[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const urls: string[] = [];

  const index = doc.sitemapindex?.sitemap;
  if (index) {
    const entries = Array.isArray(index) ? index : [index];
    for (const e of entries) {
      const loc = e.loc ?? e["#text"];
      if (typeof loc === "string") {
        urls.push(loc);
      }
    }
    return urls;
  }

  const urlset = doc.urlset?.url;
  if (!urlset) {
    return urls;
  }
  const entries = Array.isArray(urlset) ? urlset : [urlset];
  for (const e of entries) {
    const loc = e.loc;
    if (typeof loc === "string") {
      const n = normalizeUrl(baseUrl, loc);
      if (n) {
        urls.push(n);
      }
    }
  }
  return urls;
}

export async function expandSitemapIndex(
  sitemapUrls: string[],
  fetchText: (url: string) => Promise<string | null>,
  startUrl: string,
): Promise<string[]> {
  const pageUrls: string[] = [];
  for (const sm of sitemapUrls) {
    const xml = await fetchText(sm);
    if (!xml) {
      continue;
    }
    if (xml.includes("<sitemapindex")) {
      const nested = parseSitemapXml(xml, startUrl);
      pageUrls.push(...(await expandSitemapIndex(nested, fetchText, startUrl)));
    } else {
      pageUrls.push(...parseSitemapXml(xml, startUrl));
    }
  }
  return [...new Set(pageUrls)];
}
