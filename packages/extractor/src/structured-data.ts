import * as cheerio from "cheerio";
import type {
  ActionLink,
  ContactInfo,
  DayHours,
  FaqItem,
  MoneyAmount,
  OfferItem,
  PostalAddress,
} from "@agentweb/core";
import { slugifyId } from "@agentweb/core";

export interface ParsedStructured {
  name?: string;
  description?: string;
  telephone?: string[];
  email?: string[];
  address?: PostalAddress;
  openingHours?: DayHours[];
  offers?: OfferItem[];
  faq?: FaqItem[];
  sectorType?: string;
  sameAs?: string[];
}

function parsePrice(text: string): MoneyAmount | undefined {
  const m = text.match(/(\d+(?:[.,]\d{1,2})?)\s*(€|EUR|euros?)/i);
  if (!m) {
    return undefined;
  }
  const value = parseFloat(m[1].replace(",", "."));
  return { value, currency: "EUR", displayText: text.trim() };
}

function schemaDayToNumber(day: string): number | null {
  const map: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return map[day.toLowerCase()] ?? null;
}

function parseOpeningHoursSpecification(specs: unknown): DayHours[] {
  if (!Array.isArray(specs)) {
    specs = specs ? [specs] : [];
  }
  const byDay = new Map<number, DayHours>();
  for (const s of specs as Record<string, string>[]) {
    const day = schemaDayToNumber(String(s.dayOfWeek ?? ""));
    if (day === null) {
      continue;
    }
    const opens = s.opens;
    const closes = s.closes;
    const existing = byDay.get(day);
    if (!existing) {
      byDay.set(day, { dayOfWeek: day, opens, closes });
    } else if (!existing.opens2 && opens && closes) {
      existing.opens2 = opens;
      existing.closes2 = closes;
    }
  }
  return [...byDay.values()].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

function collectOffersFromEntity(entity: Record<string, unknown>, sourceUrl: string): OfferItem[] {
  const items: OfferItem[] = [];
  const catalog = entity.hasOfferCatalog as Record<string, unknown> | undefined;
  const itemList = catalog?.itemListElement;
  const list = Array.isArray(itemList) ? itemList : itemList ? [itemList] : [];
  let i = 0;
  for (const raw of list) {
    const el = raw as Record<string, unknown>;
    const item = (el.itemOffered ?? el) as Record<string, unknown>;
    const name = String(item.name ?? el.name ?? "").trim();
    if (!name) {
      continue;
    }
    const priceSpec = (el.priceSpecification ?? item.priceSpecification) as Record<string, unknown>;
    const priceVal = el.price ?? priceSpec?.price ?? item.price;
    let price: MoneyAmount | undefined;
    if (priceVal != null) {
      const num = typeof priceVal === "number" ? priceVal : parseFloat(String(priceVal));
      if (Number.isFinite(num)) {
        price = {
          value: num,
          currency: String(priceSpec?.priceCurrency ?? el.priceCurrency ?? "EUR"),
        };
      }
    }
    items.push({
      id: slugifyId(name, `offer-${i}`),
      name,
      description: item.description ? String(item.description) : undefined,
      price,
      sourceUrl,
    });
    i += 1;
  }
  return items;
}

function mergeEntity(entity: Record<string, unknown>, sourceUrl: string, out: ParsedStructured): void {
  const type = entity["@type"];
  const types = Array.isArray(type) ? type.map(String) : type ? [String(type)] : [];
  if (types.some((t) => /AutoRepair|LocalBusiness|Store|ProfessionalService/i.test(t))) {
    out.sectorType = types.find((t) => t !== "LocalBusiness") ?? types[0];
  }
  if (entity.name && !out.name) {
    out.name = String(entity.name);
  }
  if (entity.description && !out.description) {
    out.description = String(entity.description);
  }
  if (entity.telephone) {
    const tels = Array.isArray(entity.telephone) ? entity.telephone : [entity.telephone];
    out.telephone = [...(out.telephone ?? []), ...tels.map(String)];
  }
  if (entity.email) {
    const emails = Array.isArray(entity.email) ? entity.email : [entity.email];
    out.email = [...(out.email ?? []), ...emails.map(String)];
  }
  const addr = entity.address as Record<string, string> | string | undefined;
  if (addr && typeof addr === "object") {
    out.address = {
      streetAddress: addr.streetAddress,
      addressLocality: addr.addressLocality,
      postalCode: addr.postalCode,
      addressRegion: addr.addressRegion,
      addressCountry: addr.addressCountry,
    };
  }
  if (entity.openingHoursSpecification) {
    out.openingHours = parseOpeningHoursSpecification(entity.openingHoursSpecification);
  }
  const offers = collectOffersFromEntity(entity, sourceUrl);
  if (offers.length) {
    out.offers = [...(out.offers ?? []), ...offers];
  }
  if (entity.mainEntity && Array.isArray(entity.mainEntity)) {
    for (const q of entity.mainEntity as Record<string, unknown>[]) {
      if (String(q["@type"]) === "Question" && q.name && q.acceptedAnswer) {
        const ans = (q.acceptedAnswer as Record<string, unknown>).text;
        out.faq = [
          ...(out.faq ?? []),
          { question: String(q.name), answer: String(ans ?? ""), sourceUrl },
        ];
      }
    }
  }
}

export function parseSiteNameFromHtml(html: string): string | undefined {
  const $ = cheerio.load(html);
  const og =
    $('meta[property="og:site_name"]').attr("content") ??
    $('meta[name="application-name"]').attr("content");
  return og?.trim() || undefined;
}

export function parseJsonLdFromHtml(html: string, pageUrl: string): ParsedStructured {
  const $ = cheerio.load(html);
  const out: ParsedStructured = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html();
    if (!raw) {
      return;
    }
    try {
      const data = JSON.parse(raw) as unknown;
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (!node || typeof node !== "object") {
          continue;
        }
        const obj = node as Record<string, unknown>;
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          for (const g of obj["@graph"] as Record<string, unknown>[]) {
            mergeEntity(g, pageUrl, out);
          }
        } else {
          mergeEntity(obj, pageUrl, out);
        }
      }
    } catch {
      /* ignore invalid JSON-LD */
    }
  });
  return out;
}

export function extractContactFromHtml(html: string): ContactInfo {
  const $ = cheerio.load(html);
  const phones = new Set<string>();
  const emails = new Set<string>();
  $('a[href^="tel:"]').each((_, el) => {
    const t = $(el).attr("href")?.replace(/^tel:/i, "").trim();
    if (t) {
      phones.add(t);
    }
  });
  $('a[href^="mailto:"]').each((_, el) => {
    const e = $(el).attr("href")?.replace(/^mailto:/i, "").split("?")[0].trim();
    if (e) {
      emails.add(e);
    }
  });
  const bodyText = $("body").text();
  const phoneMatch = bodyText.match(/(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g);
  phoneMatch?.forEach((p) => phones.add(p.replace(/\s/g, " ").trim()));
  return {
    phone: phones.size ? [...phones] : undefined,
    email: emails.size ? [...emails] : undefined,
  };
}

const BOOKING_PATTERNS =
  /rendez-vous|rdv|booking|reservation|calendly|prendre-rendez-vous|devis|contact/i;

export function extractActionLinksFromHtml(html: string, baseUrl: string): ActionLink[] {
  const $ = cheerio.load(html);
  const links: ActionLink[] = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const label = $(el).text().trim();
    if (!href) {
      return;
    }
    let url: string;
    try {
      url = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    if (seen.has(url)) {
      return;
    }
    const combined = `${label} ${url}`;
    if (!BOOKING_PATTERNS.test(combined)) {
      return;
    }
    seen.add(url);
    let kind: ActionLink["kind"] = "other";
    if (/devis|quote/i.test(combined)) {
      kind = "quote";
    } else if (/rendez-vous|rdv|booking|calendly|reservation/i.test(combined)) {
      kind = "booking";
    } else if (/contact/i.test(combined)) {
      kind = "contact";
    }
    links.push({ kind, label: label || url, url });
  });
  return links;
}

const OFFER_SKIP_PATTERNS =
  /propriétaire|hébergeur|webmaster|responsable publication|mentions légales|OVH|dois-je|jusqu'à|où pourrai|quel type|quels frais/i;

export function extractOffersFromMarkdown(markdown: string, sourceUrl: string): OfferItem[] {
  const items: OfferItem[] = [];
  const lines = markdown.split("\n");
  let i = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("-") && !trimmed.startsWith("*")) {
      continue;
    }
    const text = trimmed.replace(/^[-*]\s+/, "").replace(/\*\*/g, "").trim();
    if (text.length < 3 || text.length > 120) {
      continue;
    }
    if (OFFER_SKIP_PATTERNS.test(text) || text.endsWith("?")) {
      continue;
    }
    const price = parsePrice(text);
    const name = text.replace(/(\d+(?:[.,]\d{1,2})?\s*(€|EUR|euros?)).*/i, "").trim() || text;
    if (name.length < 2 || name.length > 100) {
      continue;
    }
    items.push({
      id: slugifyId(name, `md-${i}`),
      name,
      price,
      sourceUrl,
    });
    i += 1;
  }
  return items;
}

export function extractServiceHeadingsFromMarkdown(markdown: string, sourceUrl: string): OfferItem[] {
  const items: OfferItem[] = [];
  const block = markdown.split(/nos services/i)[1];
  if (!block) {
    return items;
  }
  const candidates = block.split("\n").map((l) => l.trim()).filter(Boolean);
  let i = 0;
  for (const line of candidates) {
    if (line.startsWith("#") || line.startsWith("!") || line.startsWith("[")) {
      continue;
    }
    if (line.length < 4 || line.length > 60) {
      continue;
    }
    if (/^[a-zàâçéèêëîïôùûü]/i.test(line) === false) {
      continue;
    }
    if (OFFER_SKIP_PATTERNS.test(line)) {
      continue;
    }
    items.push({ id: slugifyId(line, `svc-${i}`), name: line, sourceUrl });
    i += 1;
    if (i >= 12) {
      break;
    }
  }
  return items;
}

const FRENCH_DAYS: Record<string, number> = {
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
  dimanche: 0,
};

function expandDayRange(startDay: number, endDay: number): number[] {
  const days: number[] = [];
  if (startDay <= endDay) {
    for (let d = startDay; d <= endDay; d++) {
      days.push(d);
    }
  } else {
    for (let d = startDay; d <= 6; d++) {
      days.push(d);
    }
    for (let d = 0; d <= endDay; d++) {
      days.push(d);
    }
  }
  return days;
}

export function parseFrenchOpeningHoursText(text: string): DayHours[] {
  const schedule: DayHours[] = [];
  const normalized = text.replace(/\s+/g, " ");

  const splitDayRe =
    /de\s+(\d{1,2})h(?:\d{2})?\s*(?:à|a|-)\s*(\d{1,2})h(?:\d{2})?\s+et\s+de\s+(\d{1,2})h(?:\d{2})?\s*(?:à|a|-)\s*(\d{1,2})h(?:\d{2})?\s+du\s+(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?:\s+au\s+(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche))?/gi;
  let m: RegExpExecArray | null;
  while ((m = splitDayRe.exec(normalized)) !== null) {
    const startDay = FRENCH_DAYS[m[5].toLowerCase()];
    const endDay = m[6] ? FRENCH_DAYS[m[6].toLowerCase()] : startDay;
    if (startDay === undefined || endDay === undefined) {
      continue;
    }
    for (const d of expandDayRange(startDay, endDay)) {
      schedule.push({
        dayOfWeek: d,
        opens: `${m[1].padStart(2, "0")}:00`,
        closes: `${m[2].padStart(2, "0")}:00`,
        opens2: `${m[3].padStart(2, "0")}:00`,
        closes2: `${m[4].padStart(2, "0")}:00`,
      });
    }
  }

  const rangeRe =
    /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?:\s*[-–]\s*(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche))?[^:]*?:?\s*(\d{1,2})h(?:\d{2})?\s*[-–/]\s*(\d{1,2})h(?:\d{2})?(?:\s*\/\s*(\d{1,2})h(?:\d{2})?\s*[-–]\s*(\d{1,2})h(?:\d{2})?)?/gi;
  while ((m = rangeRe.exec(normalized)) !== null) {
    const startDay = FRENCH_DAYS[m[1].toLowerCase()];
    const endDay = m[2] ? FRENCH_DAYS[m[2].toLowerCase()] : startDay;
    if (startDay === undefined || endDay === undefined) {
      continue;
    }
    for (const d of expandDayRange(startDay, endDay)) {
      schedule.push({
        dayOfWeek: d,
        opens: `${m[3].padStart(2, "0")}:00`,
        closes: `${m[4].padStart(2, "0")}:00`,
        opens2: m[5] ? `${m[5].padStart(2, "0")}:00` : undefined,
        closes2: m[6] ? `${m[6].padStart(2, "0")}:00` : undefined,
      });
    }
  }

  const byDay = new Map<number, DayHours>();
  for (const s of schedule) {
    byDay.set(s.dayOfWeek, s);
  }
  return [...byDay.values()].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}
