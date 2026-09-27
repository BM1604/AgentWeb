import { readFile } from "node:fs/promises";

const path = process.argv[2];
const o = JSON.parse(await readFile(path, "utf-8"));
console.log(JSON.stringify({
  name: o.identity.name,
  sector: o.identity.sectorHint,
  pages: o.metadata.pagesCrawled,
  offers: o.offers.length,
  priced: o.offers.filter((x) => x.price).length,
  faq: o.faq.length,
  actions: o.actionLinks.length,
  hoursDays: o.openingHours?.schedule?.length ?? 0,
  phones: o.contact.phone?.length ?? 0,
}, null, 2));
