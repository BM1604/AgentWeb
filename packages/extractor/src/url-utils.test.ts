import { describe, expect, it } from "vitest";
import { normalizeUrl, sameOrigin } from "./url-utils.js";

describe("normalizeUrl", () => {
  it("resolves relative paths", () => {
    expect(normalizeUrl("https://example.com/a/", "/b")).toBe("https://example.com/b");
  });
});

describe("sameOrigin", () => {
  it("matches same host", () => {
    expect(sameOrigin("https://example.com/x", "https://example.com/y")).toBe(true);
  });
});
