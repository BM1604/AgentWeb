#!/usr/bin/env node
import { Command } from "commander";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { extractFromUrl } from "@agentweb/extractor";
import { publishOffer } from "@agentweb/publisher";
import { loadBusinessOfferFromFile, serveMcpHttp, serveMcpStdio } from "@agentweb/mcp-server";

const DEFAULT_OUTPUT = ".agentweb/output";
const DEFAULT_MODEL = ".agentweb/business-offer.json";

const program = new Command();
program.name("agentweb").description("AgentWeb — extraction et publication agent-ready").version("0.1.0");

program
  .command("extract")
  .description("Extraire un site web vers le modèle BusinessOffer")
  .argument("<url>", "URL de départ")
  .option("-o, --output <dir>", "Répertoire de sortie", DEFAULT_OUTPUT)
  .option("--max-pages <n>", "Nombre max de pages", "30")
  .option("--delay-ms <ms>", "Délai entre requêtes", "1500")
  .option("--playwright", "Rendu headless Playwright")
  .action(async (url: string, opts) => {
    const outputDir = resolve(opts.output);
    await mkdir(outputDir, { recursive: true });
    console.log(`Extraction de ${url} (polie, lecture seule)...`);
    const offer = await extractFromUrl(url, {
      maxPages: parseInt(opts.maxPages, 10),
      delayMs: parseInt(opts.delayMs, 10),
      usePlaywright: Boolean(opts.playwright),
    });
    const modelPath = join(outputDir, "business-offer.json");
    await writeFile(modelPath, JSON.stringify(offer, null, 2), "utf-8");
    await publishOffer(offer, outputDir);
    console.log(`Terminé : ${offer.metadata.pagesCrawled} pages → ${outputDir}`);
  });

program
  .command("publish")
  .description("Publier llms.txt, JSON-LD et pages Markdown depuis un modèle JSON")
  .option("-i, --input <file>", "Fichier business-offer.json", DEFAULT_MODEL)
  .option("-o, --output <dir>", "Répertoire de sortie", DEFAULT_OUTPUT)
  .action(async (opts) => {
    const input = resolve(opts.input);
    const outputDir = resolve(opts.output);
    const offer = await loadBusinessOfferFromFile(input);
    const result = await publishOffer(offer, outputDir);
    console.log(`Publié ${result.files.length} fichiers dans ${result.outputDir}`);
  });

program
  .command("serve-mcp")
  .description("Démarrer le serveur MCP en lecture seule")
  .option("-i, --input <file>", "Fichier business-offer.json", DEFAULT_MODEL)
  .option("--stdio", "Transport stdio (défaut pour clients MCP desktop)")
  .option("--http", "Transport HTTP local")
  .option("--port <port>", "Port HTTP", "3847")
  .action(async (opts) => {
    const input = resolve(opts.input);
    const offer = await loadBusinessOfferFromFile(input);
    if (opts.http) {
      await serveMcpHttp(offer, parseInt(opts.port, 10));
    } else {
      await serveMcpStdio(offer);
    }
  });

program.parse();
