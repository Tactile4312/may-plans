import { MONTH, YEAR } from "../config";

export const DAYS_IN_MONTH = new Date(YEAR, MONTH + 1, 0).getDate();
export const MONTH_NAME = new Date(YEAR, MONTH, 1).toLocaleDateString("en-US", { month: "long" });

export const WEEKS = [
  { n: 1, from: 1, to: 7, theme: "Simple & affordable" },
  { n: 2, from: 8, to: 14, theme: "Creative" },
  { n: 3, from: 15, to: 21, theme: "Outdoor & adventure" },
  { n: 4, from: 22, to: 28, theme: "Romantic & memorable" },
  { n: 5, from: 29, to: 31, theme: "Open days" },
];

export const CATS = ["Café", "Games", "Home", "Cooking", "Crafts", "Outdoor", "Food trip", "Staycation", "Dinner", "Other"];
const CAT_COLORS: Record<string, string> = {
  "Café": "#B07A4E", Games: "#8E6CCF", Home: "#E5739A", Cooking: "#E39B3A", Crafts: "#3F9EA3",
  Outdoor: "#5E9C76", "Food trip": "#D0603E", Staycation: "#C2185B", Dinner: "#A04876", Other: "#9A8C93",
};
export const catColor = (c: string) => CAT_COLORS[c] ?? CAT_COLORS.Other;

export const peso = (n: number | null | undefined) => "₱" + Math.round(n || 0).toLocaleString("en-PH");
export const dateOf = (day: number) => new Date(YEAR, MONTH, day);
export const fmtDay = (day: number) => dateOf(day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
export const dow = (day: number) => dateOf(day).toLocaleDateString("en-US", { weekday: "short" });
export const isoDay = (day: number) => `${YEAR}-${String(MONTH + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
export const shortDate = (iso: string) => new Date(iso + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const tiktokUrl = (q: string) => "https://www.tiktok.com/search?q=" + encodeURIComponent(q || "couple date ideas");
export const mapsUrl = (q: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
export const uid = (prefix: string) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Parses a money input. Returns null for empty, NaN for invalid. */
export function toMoney(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

/** Makes sure a pasted link is a real http(s) address. Returns "" if not. */
export function safeLink(u: string): string {
  let s = (u || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const x = new URL(s);
    return x.protocol === "http:" || x.protocol === "https:" ? x.href : "";
  } catch {
    return "";
  }
}

export function linkLabel(u: string): string {
  try {
    const h = new URL(u).hostname.replace(/^www\./, "");
    if (/tiktok/.test(h)) return "TikTok";
    if (/google|goo\.gl|maps\.app/.test(h)) return "Map";
    if (/facebook|fb\./.test(h)) return "Facebook";
    if (/instagram/.test(h)) return "Instagram";
    return h;
  } catch {
    return "Link";
  }
}

export const daysUntil = (day: number) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((dateOf(day).getTime() - now.getTime()) / 864e5);
};
