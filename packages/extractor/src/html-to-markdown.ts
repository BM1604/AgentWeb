import TurndownService from "turndown";
import * as cheerio from "cheerio";

export function htmlToMarkdown(html: string, pageUrl: string): { title: string; markdown: string } {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe").remove();
  const title = $("title").first().text().trim() || $("h1").first().text().trim() || pageUrl;
  const main =
    $("main").first().html() ??
    $("[role=main]").first().html() ??
    $(".entry-content").first().html() ??
    $("article").first().html() ??
    $("body").html() ??
    "";

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  turndown.remove(["img", "svg"]);
  const markdown = turndown.turndown(main).replace(/\n{3,}/g, "\n\n").trim();
  return { title, markdown };
}

export function extractLinks(html: string, _baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("#")) {
      links.push(href);
    }
  });
  return links;
}
