export function normalizeUrl(base: string, href: string): string | null {
  try {
    const u = new URL(href, base);
    if (!["http:", "https:"].includes(u.protocol)) {
      return null;
    }
    u.hash = "";
    return u.toString().replace(/\/$/, "") || u.toString();
  } catch {
    return null;
  }
}

export function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function isLikelyAsset(url: string): boolean {
  return /\.(pdf|jpg|jpeg|png|gif|webp|svg|zip|css|js|woff2?)(\?|$)/i.test(url);
}
