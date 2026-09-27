import type { BusinessOffer } from "@agentweb/core";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHours(offer: BusinessOffer): string {
  if (!offer.openingHours?.schedule.length) {
    return "Not specified";
  }
  return offer.openingHours.schedule
    .map((d) => {
      if (d.closed) {
        return `${DAY_NAMES[d.dayOfWeek]}: closed`;
      }
      const parts = [`${d.opens}-${d.closes}`];
      if (d.opens2 && d.closes2) {
        parts.push(`${d.opens2}-${d.closes2}`);
      }
      return `${DAY_NAMES[d.dayOfWeek]}: ${parts.join(", ")}`;
    })
    .join("; ");
}

export function generateLlmsTxt(offer: BusinessOffer): string {
  const lines: string[] = [];
  lines.push(`# ${offer.identity.name}`);
  lines.push("");
  if (offer.identity.description) {
    lines.push(`> ${offer.identity.description.replace(/\n/g, " ")}`);
    lines.push("");
  }
  lines.push(`Website: ${offer.identity.websiteUrl}`);
  if (offer.contact.phone?.length) {
    lines.push(`Phone: ${offer.contact.phone.join(", ")}`);
  }
  if (offer.contact.email?.length) {
    lines.push(`Email: ${offer.contact.email.join(", ")}`);
  }
  const addr = offer.contact.address;
  if (addr) {
    const parts = [
      addr.streetAddress,
      addr.postalCode,
      addr.addressLocality,
      addr.addressCountry,
    ].filter(Boolean);
    if (parts.length) {
      lines.push(`Address: ${parts.join(", ")}`);
    }
  }
  lines.push(`Opening hours: ${formatHours(offer)}`);
  lines.push("");
  lines.push("## Services and products");
  lines.push("");
  if (offer.offers.length === 0) {
    lines.push("- (No structured offers extracted)");
  } else {
    for (const o of offer.offers) {
      const price = o.price?.displayText ?? (o.price ? `${o.price.value} ${o.price.currency}` : "");
      lines.push(`- ${o.name}${price ? ` — ${price}` : ""}`);
    }
  }
  lines.push("");
  if (offer.faq.length) {
    lines.push("## FAQ");
    lines.push("");
    for (const f of offer.faq) {
      lines.push(`### ${f.question}`);
      lines.push(f.answer);
      lines.push("");
    }
  }
  lines.push("## Action links (read-only; do not submit forms)");
  lines.push("");
  for (const a of offer.actionLinks) {
    lines.push(`- [${a.kind}] ${a.label}: ${a.url}`);
  }
  lines.push("");
  lines.push("## Pages");
  lines.push("");
  for (const p of offer.pages) {
    lines.push(`- [${p.title ?? p.url}](${p.url})`);
  }
  lines.push("");
  lines.push(`Extracted at: ${offer.metadata.finishedAt}`);
  return lines.join("\n");
}
