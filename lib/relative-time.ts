const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["week", 604_800_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(iso: string, now: number = Date.now()) {
  const elapsed = new Date(iso).getTime() - now;
  const abs = Math.abs(elapsed);

  if (abs < 45_000) return "Just now";

  for (const [unit, ms] of UNITS) {
    if (abs >= ms) return formatter.format(Math.round(elapsed / ms), unit);
  }
  return "Just now";
}
