import {
  Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useThemeColors } from "./useThemeColors";
import { DAYS_IN_MONTH, WEEKS, peso } from "../lib/format";
import { MONTH, YEAR } from "../config";
import type { Planner } from "../lib/types";
import type { Totals } from "../lib/totals";

const axisTick = (color: string) => ({ fill: color, fontSize: 11 });
const compact = (v: number) => (v >= 1000 ? "₱" + (v / 1000).toFixed(v % 1000 ? 1 : 0) + "k" : "₱" + v);

function useTooltipStyle() {
  const c = useThemeColors();
  return {
    c,
    tooltip: {
      contentStyle: { background: c["--card"], border: `1px solid ${c["--line"]}`, borderRadius: 12, color: c["--ink"], fontSize: 13 },
      labelStyle: { color: c["--muted"], fontWeight: 700 },
      formatter: (v: unknown) => peso(Number(v)),
      cursor: { fill: c["--blush"], opacity: 0.5 },
    },
  };
}

/** Planned vs actually spent, per week. */
export function WeekChart({ plan }: { plan: Planner }) {
  const { c, tooltip } = useTooltipStyle();
  const weeks = WEEKS.filter((w) => w.n < 5 || plan.dates.some((d) => d.day >= w.from && d.day <= w.to));
  const data = weeks.map((w) => {
    const ds = plan.dates.filter((d) => d.day >= w.from && d.day <= w.to);
    return {
      name: w.n < 5 ? `Wk ${w.n}` : `${w.from}–${w.to}`,
      Planned: ds.reduce((s, d) => s + (d.planned || 0), 0),
      Spent: ds.reduce((s, d) => s + (d.actual ?? 0), 0),
    };
  });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c["--line"]} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick(c["--muted"])} />
        <YAxis tickLine={false} axisLine={false} tick={axisTick(c["--muted"])} tickFormatter={compact} width={48} />
        <Tooltip {...tooltip} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: c["--muted"] }} />
        <Bar dataKey="Planned" fill={c["--pink"]} radius={[7, 7, 0, 0]} maxBarSize={32} />
        <Bar dataKey="Spent" fill={c["--rose"]} radius={[7, 7, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Ring showing combined savings vs the target. */
export function ProgressRing({ t }: { t: Totals }) {
  const { c } = useTooltipStyle();
  const done = t.target > 0 ? Math.min(t.combined, t.target) : t.combined;
  const rest = t.target > 0 ? Math.max(0, t.target - t.combined) : 0;
  const data = done || rest ? [{ name: "Saved", value: done }, { name: "Still needed", value: rest }] : [{ name: "Empty", value: 1 }];
  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="70%" outerRadius="92%" startAngle={90} endAngle={-270} stroke="none">
            {data.map((d, i) => <Cell key={d.name} fill={i === 0 && d.name !== "Empty" ? c["--both"] : c["--blush"]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
        <div>
          <div className="text-[26px] font-extrabold leading-none">{t.target > 0 ? Math.round(t.progress) + "%" : "—"}</div>
          <div className="text-xs text-muted mt-1">of {peso(t.target)}</div>
        </div>
      </div>
    </div>
  );
}

/** Bar per partner. */
export function WhoChart({ t, names }: { t: Totals; names: [string, string] }) {
  const { c, tooltip } = useTooltipStyle();
  const data = [{ name: names[0], value: t.p1 }, { name: names[1], value: t.p2 }];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c["--line"]} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick(c["--muted"])} />
        <YAxis tickLine={false} axisLine={false} tick={axisTick(c["--muted"])} tickFormatter={compact} width={48} />
        <Tooltip {...tooltip} />
        <Bar dataKey="value" name="Saved" radius={[10, 10, 0, 0]} maxBarSize={70}>
          <Cell fill={c["--p1"]} />
          <Cell fill={c["--p2"]} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Running totals across the month, per partner and combined. */
export function SavingsOverTime({ plan, names }: { plan: Planner; names: [string, string] }) {
  const { c, tooltip } = useTooltipStyle();
  const byDay: Record<number, { p1: number; p2: number }> = {};
  for (const ct of plan.contribs) {
    const d = new Date(ct.date + "T00:00");
    let day: number;
    if (d.getFullYear() < YEAR || (d.getFullYear() === YEAR && d.getMonth() < MONTH)) day = 1; // earlier = counts from day 1
    else if (d.getFullYear() === YEAR && d.getMonth() === MONTH) day = d.getDate();
    else continue;
    byDay[day] ??= { p1: 0, p2: 0 };
    byDay[day][ct.who] += ct.amount || 0;
  }
  let a = 0, b = 0;
  const data = Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
    const day = i + 1;
    a += byDay[day]?.p1 ?? 0;
    b += byDay[day]?.p2 ?? 0;
    return { name: `May ${day}`, [names[0]]: a, [names[1]]: b, Combined: a + b };
  });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c["--line"]} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick(c["--muted"])} interval={6} />
        <YAxis tickLine={false} axisLine={false} tick={axisTick(c["--muted"])} tickFormatter={compact} width={48} />
        <Tooltip {...tooltip} cursor={{ stroke: c["--line"] }} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: c["--muted"] }} />
        <Area type="stepAfter" dataKey="Combined" stroke={c["--both"]} fill={c["--both"]} fillOpacity={0.15} strokeWidth={2.5} />
        <Line type="stepAfter" dataKey={names[0]} stroke={c["--p1"]} strokeWidth={2.5} dot={false} />
        <Line type="stepAfter" dataKey={names[1]} stroke={c["--p2"]} strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
