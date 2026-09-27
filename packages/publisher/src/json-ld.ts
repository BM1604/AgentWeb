import type { BusinessOffer, DayHours } from "@agentweb/core";

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dayHoursToSpec(d: DayHours): Record<string, string>[] {
  const day = SCHEMA_DAYS[d.dayOfWeek];
  if (d.closed) {
    return [];
  }
  const specs: Record<string, string>[] = [];
  if (d.opens && d.closes) {
    specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: day, opens: d.opens, closes: d.closes });
  }
  if (d.opens2 && d.closes2) {
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day,
      opens: d.opens2,
      closes: d.closes2,
    });
  }
  return specs;
}

function primarySchemaType(sectorHint?: string): string {
  if (sectorHint === "auto_repair") {
    return "AutoRepair";
  }
  return "LocalBusiness";
}

export function generateJsonLd(offer: BusinessOffer): Record<string, unknown> {
  const type = primarySchemaType(offer.identity.sectorHint);
  const openingHoursSpecification =
    offer.openingHours?.schedule.flatMap(dayHoursToSpec) ?? [];

  const entity: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name: offer.identity.name,
    url: offer.identity.websiteUrl,
    description: offer.identity.description,
    telephone: offer.contact.phone?.[0],
    email: offer.contact.email?.[0],
  };

  if (offer.contact.address) {
    entity.address = {
      "@type": "PostalAddress",
      ...offer.contact.address,
    };
  }

  if (openingHoursSpecification.length) {
    entity.openingHoursSpecification = openingHoursSpecification;
  }

  if (offer.offers.length) {
    entity.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: offer.offers.map((o) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: o.name,
          description: o.description,
        },
        price: o.price?.value,
        priceCurrency: o.price?.currency,
      })),
    };
  }

  if (offer.faq.length) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        entity,
        {
          "@type": "FAQPage",
          mainEntity: offer.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        },
      ],
    };
  }

  return entity;
}
