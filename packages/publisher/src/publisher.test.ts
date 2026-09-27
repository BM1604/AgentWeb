import { describe, expect, it } from "vitest";
import type { BusinessOffer } from "@agentweb/core";
import { generateJsonLd, generateLlmsTxt } from "./index.js";

function sampleOffer(): BusinessOffer {
  const now = new Date().toISOString();
  return {
    schemaVersion: "1.0",
    identity: {
      name: "Garage Test",
      description: "Réparation auto",
      websiteUrl: "https://example.com",
      sectorHint: "auto_repair",
    },
    contact: { phone: ["05 00 00 00 00"] },
    openingHours: {
      schedule: [
        { dayOfWeek: 1, opens: "08:00", closes: "12:00", opens2: "14:00", closes2: "18:00" },
      ],
    },
    offers: [{ id: "vidange", name: "Vidange", price: { value: 89, currency: "EUR" } }],
    faq: [{ question: "Acceptez-vous les cartes?", answer: "Oui." }],
    actionLinks: [{ kind: "booking", label: "RDV", url: "https://example.com/rdv" }],
    pages: [{ url: "https://example.com", title: "Home", markdown: "# Home", fetchedAt: now }],
    sources: [],
    metadata: {
      startedAt: now,
      finishedAt: now,
      userAgent: "test",
      pagesCrawled: 1,
      usedPlaywright: false,
      robotsRespected: true,
    },
  };
}

describe("generateLlmsTxt", () => {
  it("includes business name and services", () => {
    const txt = generateLlmsTxt(sampleOffer());
    expect(txt).toContain("# Garage Test");
    expect(txt).toContain("Vidange");
    expect(txt).toContain("read-only");
  });
});

describe("generateJsonLd", () => {
  it("uses AutoRepair type for auto sector", () => {
    const ld = generateJsonLd(sampleOffer());
    const graph = ld["@graph"] as unknown[] | undefined;
    const entity = graph ? (graph[0] as Record<string, unknown>) : ld;
    expect(entity["@type"]).toBe("AutoRepair");
    expect(entity.hasOfferCatalog).toBeDefined();
  });
});
