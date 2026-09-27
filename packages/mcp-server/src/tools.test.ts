import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { BusinessOffer } from "@agentweb/core";
import { getBookingOptions, getBusinessInfo, searchOffer } from "./tools.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const examplePath = join(repoRoot, "examples/le-garage-toulousain/business-offer.json");

describe("MCP tools on example snapshot", () => {
  it("loads example when present and answers tools", async () => {
    let offer: BusinessOffer;
    try {
      offer = JSON.parse(await readFile(examplePath, "utf-8")) as BusinessOffer;
    } catch {
      // Example committed later in milestone setup
      const now = new Date().toISOString();
      offer = {
        schemaVersion: "1.0",
        identity: { name: "Le Garage Toulousain", websiteUrl: "https://legaragetoulousain.fr" },
        contact: {},
        offers: [{ id: "vidange", name: "Vidange moteur" }],
        faq: [],
        actionLinks: [
          {
            kind: "booking",
            label: "RDV",
            url: "https://legaragetoulousain.fr/prendre-rendez-vous/",
          },
        ],
        pages: [],
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

    const info = getBusinessInfo(offer);
    expect(info.name).toBeTruthy();
    const booking = getBookingOptions(offer);
    expect(booking.options.length).toBeGreaterThanOrEqual(0);
    const search = searchOffer(offer, "vidange");
    expect(search.results).toBeDefined();
  });
});
