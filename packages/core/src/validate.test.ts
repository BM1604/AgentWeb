import { describe, expect, it } from "vitest";
import { slugifyId, validateBusinessOffer, ValidationError } from "./index.js";
import type { BusinessOffer } from "./types.js";

function minimalOffer(overrides: Partial<BusinessOffer> = {}): BusinessOffer {
  const now = new Date().toISOString();
  return {
    schemaVersion: "1.0",
    identity: {
      name: "Test Garage",
      websiteUrl: "https://example.com",
    },
    contact: {},
    offers: [{ id: "svc-1", name: "Vidange" }],
    faq: [],
    actionLinks: [],
    pages: [],
    sources: [],
    metadata: {
      startedAt: now,
      finishedAt: now,
      userAgent: "AgentWeb/0.1",
      pagesCrawled: 1,
      usedPlaywright: false,
      robotsRespected: true,
    },
    ...overrides,
  };
}

describe("slugifyId", () => {
  it("normalizes French accents", () => {
    expect(slugifyId("Révision générale")).toBe("revision-generale");
  });
});

describe("validateBusinessOffer", () => {
  it("accepts minimal valid offer", () => {
    expect(() => validateBusinessOffer(minimalOffer())).not.toThrow();
  });

  it("rejects missing name", () => {
    const o = minimalOffer();
    o.identity.name = "";
    expect(() => validateBusinessOffer(o)).toThrow(ValidationError);
  });

  it("rejects invalid price", () => {
    const o = minimalOffer({
      offers: [{ id: "x", name: "A", price: { value: -1, currency: "EUR" } }],
    });
    expect(() => validateBusinessOffer(o)).toThrow(ValidationError);
  });
});
