import type { BusinessOffer, DayHours, OfferItem } from "./types.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateDayHours(day: DayHours): void {
  if (!Number.isInteger(day.dayOfWeek) || day.dayOfWeek < 0 || day.dayOfWeek > 6) {
    throw new ValidationError(`Invalid dayOfWeek: ${day.dayOfWeek}`);
  }
}

export function validateOfferItem(item: OfferItem): void {
  if (!isNonEmptyString(item.id)) {
    throw new ValidationError("OfferItem.id is required");
  }
  if (!isNonEmptyString(item.name)) {
    throw new ValidationError("OfferItem.name is required");
  }
  if (item.price) {
    if (!Number.isFinite(item.price.value) || item.price.value < 0) {
      throw new ValidationError("OfferItem.price.value must be a non-negative number");
    }
    if (!isNonEmptyString(item.price.currency)) {
      throw new ValidationError("OfferItem.price.currency is required when price is set");
    }
  }
}

export function validateBusinessOffer(offer: BusinessOffer): void {
  if (offer.schemaVersion !== "1.0") {
    throw new ValidationError(`Unsupported schemaVersion: ${offer.schemaVersion}`);
  }
  if (!isNonEmptyString(offer.identity.name)) {
    throw new ValidationError("identity.name is required");
  }
  if (!isNonEmptyString(offer.identity.websiteUrl)) {
    throw new ValidationError("identity.websiteUrl is required");
  }
  for (const item of offer.offers) {
    validateOfferItem(item);
  }
  if (offer.openingHours) {
    for (const d of offer.openingHours.schedule) {
      validateDayHours(d);
    }
  }
  for (const link of offer.actionLinks) {
    if (!isNonEmptyString(link.url)) {
      throw new ValidationError("actionLinks[].url is required");
    }
  }
}
