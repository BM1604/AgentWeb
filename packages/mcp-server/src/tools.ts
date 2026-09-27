import type { BusinessOffer } from "@agentweb/core";

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function getBusinessInfo(offer: BusinessOffer): Record<string, unknown> {
  return {
    name: offer.identity.name,
    description: offer.identity.description,
    websiteUrl: offer.identity.websiteUrl,
    sectorHint: offer.identity.sectorHint,
    contact: offer.contact,
    extractedAt: offer.metadata.finishedAt,
  };
}

export function listServices(offer: BusinessOffer): { services: unknown[] } {
  return {
    services: offer.offers.map((o) => ({
      id: o.id,
      name: o.name,
      description: o.description,
      category: o.category,
      hasPrice: Boolean(o.price),
      sourceUrl: o.sourceUrl,
    })),
  };
}

export function getPrices(offer: BusinessOffer): { items: unknown[] } {
  return {
    items: offer.offers
      .filter((o) => o.price)
      .map((o) => ({
        id: o.id,
        name: o.name,
        price: o.price,
      })),
  };
}

export function getOpeningHours(offer: BusinessOffer): Record<string, unknown> {
  if (!offer.openingHours) {
    return { schedule: [], message: "Horaires non disponibles dans l'instantané." };
  }
  return {
    schedule: offer.openingHours.schedule.map((d) => ({
      day: DAY_LABELS[d.dayOfWeek],
      dayOfWeek: d.dayOfWeek,
      opens: d.opens,
      closes: d.closes,
      opens2: d.opens2,
      closes2: d.closes2,
      closed: d.closed ?? false,
    })),
    summary: offer.openingHours.summary,
  };
}

export function searchOffer(offer: BusinessOffer, query: string): { results: unknown[] } {
  const q = query.toLowerCase().trim();
  const results = offer.offers.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      (o.description?.toLowerCase().includes(q) ?? false) ||
      (o.category?.toLowerCase().includes(q) ?? false),
  );
  const pageHits = offer.pages
    .filter((p) => p.markdown.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({ url: p.url, title: p.title, excerpt: excerpt(p.markdown, q) }));

  return { results: [...results, ...pageHits] };
}

function excerpt(markdown: string, q: string, radius = 80): string {
  const idx = markdown.toLowerCase().indexOf(q);
  if (idx < 0) {
    return markdown.slice(0, 160);
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(markdown.length, idx + q.length + radius);
  return markdown.slice(start, end).replace(/\s+/g, " ");
}

export function getBookingOptions(offer: BusinessOffer): {
  options: unknown[];
  notice: string;
} {
  const booking = offer.actionLinks.filter((l) => l.kind === "booking" || l.kind === "quote");
  return {
    options: booking.map((l) => ({
      kind: l.kind,
      label: l.label,
      url: l.url,
      description: l.description,
    })),
    notice:
      "Lecture seule : ouvrir ces liens pour l'utilisateur final. Ne pas soumettre de formulaire via cet outil.",
  };
}
