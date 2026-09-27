import type { BusinessOffer } from "@agentweb/core";
import { slugifyId } from "@agentweb/core";

export interface MarkdownPageOutput {
  filename: string;
  content: string;
}

export function generateMarkdownPages(offer: BusinessOffer): MarkdownPageOutput[] {
  return offer.pages.map((p, index) => {
    const slug = slugifyId(p.title ?? `page-${index}`, `page-${index}`);
    const header = `# ${p.title ?? p.url}\n\nSource: ${p.url}\n\n---\n\n`;
    return {
      filename: `${slug}.md`,
      content: header + p.markdown,
    };
  });
}
