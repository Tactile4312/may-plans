import type { Planner } from "./types";

/** All the numbers the dashboard shows, computed from the plan. */
export function totals(p: Planner) {
  const planned = p.dates.reduce((s, d) => s + (d.planned || 0), 0);
  const actual = p.dates.reduce((s, d) => s + (d.actual ?? 0), 0);
  const completed = p.dates.filter((d) => d.status === "Completed").length;
  const postponed = p.dates.filter((d) => d.status === "Postponed").length;
  const p1 = p.contribs.filter((c) => c.who === "p1").reduce((s, c) => s + (c.amount || 0), 0);
  const p2 = p.contribs.filter((c) => c.who === "p2").reduce((s, c) => s + (c.amount || 0), 0);
  const combined = p1 + p2;
  const budget = p.budget || 0;
  const target = p.target || 0;
  return {
    planned, actual, completed, postponed, p1, p2, combined, budget, target,
    remaining: budget - actual,
    avg: completed > 0 ? actual / completed : 0, // no divide-by-zero
    unspent: Math.max(0, combined - actual),
    progress: target > 0 ? (combined / target) * 100 : 0,
    left: Math.max(0, target - combined),
    share1: combined > 0 ? (p1 / combined) * 100 : 0,
    share2: combined > 0 ? (p2 / combined) * 100 : 0,
  };
}
export type Totals = ReturnType<typeof totals>;
