export type DetectedLink = {
  url: string;
  host: string;
  title: string;
};

export function detectLink(content: string): DetectedLink | null {
  const trimmed = content.trim();

  if (!trimmed || /\s/.test(trimmed) || trimmed.length > 2048) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (!parsed.hostname.includes(".")) return null;

  const host = parsed.hostname.replace(/^www\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean);
  const last = segments.at(-1);

  const title = last
    ? decodeURIComponent(last)
        .replace(/\.[a-z0-9]{1,5}$/i, "")
        .replace(/[-_+]/g, " ")
        .trim() || host
    : host;

  return { url: parsed.toString(), host, title };
}
