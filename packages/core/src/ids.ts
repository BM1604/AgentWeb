/** Stable slug id from text (ASCII, lowercase, hyphenated). */
export function slugifyId(text: string, fallback = "item"): string {
  const base = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || fallback;
}

export function uniqueId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}
