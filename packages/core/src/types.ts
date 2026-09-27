/** ISO 8601 date-time string */
export type IsoDateTime = string;

export type ActionKind =
  | "booking"
  | "quote"
  | "contact"
  | "order"
  | "other";

export interface ActionLink {
  kind: ActionKind;
  label: string;
  url: string;
  description?: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface PostalAddress {
  streetAddress?: string;
  addressLocality?: string;
  postalCode?: string;
  addressRegion?: string;
  addressCountry?: string;
}

export interface ContactInfo {
  phone?: string[];
  email?: string[];
  address?: PostalAddress;
  geo?: GeoCoordinates;
}

export interface BusinessIdentity {
  name: string;
  legalName?: string;
  description?: string;
  slogan?: string;
  logoUrl?: string;
  imageUrls?: string[];
  websiteUrl: string;
  /** Inferred or declared sector hint (e.g. auto_repair, restaurant) */
  sectorHint?: string;
}

export interface DayHours {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  opens?: string;
  closes?: string;
  /** Second interval (e.g. lunch break split) */
  opens2?: string;
  closes2?: string;
  closed?: boolean;
}

export interface OpeningHours {
  /** Human-readable summary lines */
  summary?: string[];
  schedule: DayHours[];
}

export interface MoneyAmount {
  value: number;
  currency: string;
  /** Display as on site (e.g. "à partir de 45 €") */
  displayText?: string;
}

export interface OfferItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: MoneyAmount;
  sourceUrl?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  sourceUrl?: string;
}

export interface PageRecord {
  url: string;
  title?: string;
  markdown: string;
  fetchedAt: IsoDateTime;
}

export interface SourceReference {
  url: string;
  title?: string;
  retrievedAt: IsoDateTime;
}

export interface ExtractionMetadata {
  startedAt: IsoDateTime;
  finishedAt: IsoDateTime;
  userAgent: string;
  pagesCrawled: number;
  usedPlaywright: boolean;
  robotsRespected: boolean;
}

/**
 * Generic merchant / small-business offer model (sector-agnostic).
 */
export interface BusinessOffer {
  schemaVersion: "1.0";
  identity: BusinessIdentity;
  contact: ContactInfo;
  openingHours?: OpeningHours;
  offers: OfferItem[];
  faq: FaqItem[];
  actionLinks: ActionLink[];
  pages: PageRecord[];
  sources: SourceReference[];
  metadata: ExtractionMetadata;
}
