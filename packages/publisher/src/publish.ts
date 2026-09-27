import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BusinessOffer } from "@agentweb/core";
import { generateJsonLd } from "./json-ld.js";
import { generateLlmsTxt } from "./llms-txt.js";
import { generateMarkdownPages } from "./markdown-pages.js";

export interface PublishResult {
  outputDir: string;
  files: string[];
}

export async function publishOffer(offer: BusinessOffer, outputDir: string): Promise<PublishResult> {
  await mkdir(outputDir, { recursive: true });
  const files: string[] = [];

  const modelPath = join(outputDir, "business-offer.json");
  await writeFile(modelPath, JSON.stringify(offer, null, 2), "utf-8");
  files.push(modelPath);

  const llmsPath = join(outputDir, "llms.txt");
  await writeFile(llmsPath, generateLlmsTxt(offer), "utf-8");
  files.push(llmsPath);

  const jsonLdPath = join(outputDir, "schema.jsonld");
  await writeFile(jsonLdPath, JSON.stringify(generateJsonLd(offer), null, 2), "utf-8");
  files.push(jsonLdPath);

  const pagesDir = join(outputDir, "pages");
  await mkdir(pagesDir, { recursive: true });
  for (const page of generateMarkdownPages(offer)) {
    const fp = join(pagesDir, page.filename);
    await writeFile(fp, page.content, "utf-8");
    files.push(fp);
  }

  return { outputDir, files };
}
