import type { DateItem, Planner } from "./types";
import { DAYS_IN_MONTH, dateOf } from "./format";

export const sortedDates = (p: Planner) => [...p.dates].sort((a, b) => a.day - b.day);

/** The date on a given day, including day 2 of an overnight trip. */
export const dateOnDay = (p: Planner, day: number): DateItem | undefined =>
  p.dates.find((d) => d.day === day) ?? p.dates.find((d) => d.span > 1 && day > d.day && day < d.day + d.span);

/** First Saturday/Sunday with nothing planned (falls back to any free day). */
export function nextFreeWeekend(p: Planner): number {
  const taken = new Set(p.dates.map((d) => d.day));
  for (let i = 1; i <= DAYS_IN_MONTH; i++) if (!taken.has(i) && [0, 6].includes(dateOf(i).getDay())) return i;
  for (let i = 1; i <= DAYS_IN_MONTH; i++) if (!taken.has(i)) return i;
  return 1;
}

export const hasDemo = (p: Planner) => p.contribs.some((c) => c.demo) || p.dates.some((d) => d.demoP);

export function clearDemo(p: Planner) {
  p.contribs = p.contribs.filter((c) => !c.demo);
  for (const d of p.dates) {
    if (d.demoP) { d.status = "Planned"; d.actual = null; d.notes = ""; d.rating = 0; delete d.demoP; }
  }
  p.demo = false;
}
