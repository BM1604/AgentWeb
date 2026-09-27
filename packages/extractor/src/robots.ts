import robotsParserImport from "robots-parser";
import { AGENTWEB_USER_AGENT } from "./constants.js";

const robotsParser = robotsParserImport as unknown as (url: string, robotstxt: string) => {
  isAllowed: (url: string, ua?: string) => boolean | undefined;
  getCrawlDelay: (ua?: string) => number | undefined;
};

export interface RobotsPolicy {
  allowed: (url: string) => boolean;
  crawlDelayMs: number;
}

export async function loadRobots(
  origin: string,
  fetchText: (url: string) => Promise<string | null>,
): Promise<RobotsPolicy> {
  const robotsUrl = `${origin}/robots.txt`;
  const text = await fetchText(robotsUrl);
  if (!text) {
    return { allowed: () => true, crawlDelayMs: 0 };
  }
  const parser = robotsParser(robotsUrl, text);
  const delaySec = parser.getCrawlDelay(AGENTWEB_USER_AGENT) ?? parser.getCrawlDelay("*") ?? 0;
  return {
    allowed: (url: string) => parser.isAllowed(url, AGENTWEB_USER_AGENT) ?? true,
    crawlDelayMs: Math.max(0, delaySec * 1000),
  };
}
