import { readFile } from "node:fs/promises";
import type { BusinessOffer } from "@agentweb/core";
import { validateBusinessOffer } from "@agentweb/core";

export async function loadBusinessOfferFromFile(path: string): Promise<BusinessOffer> {
  const raw = await readFile(path, "utf-8");
  const offer = JSON.parse(raw) as BusinessOffer;
  validateBusinessOffer(offer);
  return offer;
}
