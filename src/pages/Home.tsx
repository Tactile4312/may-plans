import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { AnimatedNumber, CatDot, Meter } from "../components/ui";
import { WeekChart } from "../components/Charts";
import { DateSheet } from "../sheets/DateSheet";
import { DateForm } from "../sheets/DateForm";
import { DateCard } from "./DateCard";
import { WEEKS, dateOf, daysUntil, dow, peso } from "../lib/format";
import { clearDemo, hasDemo, sortedDates } from "../lib/plan";
import { totals } from "../lib/totals";

export function Home() {
  const { plan, update } = usePlanner();
  const { open } = useSheet();
  const t = totals(plan);
  const over = t.remaining < 0;
  const openDate = (id: string, title: string) => open(<DateSheet id={id} />, title);

  const upcoming = sortedDates(plan).filter((d) => d.status !== "Completed" && daysUntil(d.day) >= 0);
  const next = upcoming[0];

  // Planned vs spent per category
  const cats = new Map<string, { p: number; a: number }>();
  for (const d of plan.dates) {
    const c = cats.get(d.cat) ?? { p: 0, a: 0 };
    c.p += d.planned || 0;
    c.a += d.actual ?? 0;
    cats.set(d.cat, c);
  }
  const catRows = [...cats].filter(([, v]) => v.p || v.a).sort((a, b) => b[1].p - a[1].p);
  const catMax = Math.max(1, ...catRows.map(([, v]) => Math.max(v.p, v.a)));

  return (
    <>
      <div className="grid gap-3.5">
        {hasDemo(plan) && (
          <div className="demo">
            <span><b>Demo data:</b> the first three dates and four savings entries are samples.</span>
            <button className="btn sm" onClick={() => update(clearDemo, { toast: "Demo data cleared", undo: true })}>Clear demo</button>
          </div>
        )}

        {next ? (
          <button className="next" onClick={() => openDate(next.id, next.title)}>
            <span className="daybox"><span><small>{dateOf(next.day).toLocaleDateString("en-US", { month: "short" })}</small><b className="text-2xl">{next.day}</b></span></span>
            <span className="flex-1 min-w-0">
              <span className="lab">Next date · {daysUntil(next.day) === 0 ? "today" : daysUntil(next.day) === 1 ? "tomorrow" : `in ${daysUntil(next.day).toLocaleString()} days`}</span>
              <span className="block font-display text-[19px] leading-tight">{next.title}</span>
              <span className="text-[13px] opacity-90">{dow(next.day)} · {next.planned ? `${peso(next.planned)} planned` : "No-spend"}</span>
            </span>
          </button>
        ) : (
          <div className="card text-muted">No upcoming dates left in May. Tap + to plan one.</div>
        )}

        <div className="kpis">
          <div className="kpi wide">
            <span className="lab">Remaining budget</span>
            <span className={`val num ${over ? "neg" : ""}`}><AnimatedNumber value={t.remaining} format={(v) => (v < 0 ? "−" + peso(-v) : peso(v))} /></span>
            <span className="sub">{peso(t.actual)} spent of {peso(t.budget)}{over ? " · over budget" : ""}</span>
            <Meter value={t.budget > 0 ? (t.actual / t.budget) * 100 : 0} tone={over ? "over" : "rose"} />
          </div>
          <BudgetInput />
          <Kpi label="Planned" value={t.planned} sub={t.planned > t.budget ? `${peso(t.planned - t.budget)} over` : `${peso(t.budget - t.planned)} buffer`} warn={t.planned > t.budget} />
          <Kpi label="Savings" value={t.combined} sub={`${peso(t.unspent)} not yet spent`} />
          <div className="kpi">
            <span className="lab">Dates done</span>
            <span className="val num"><AnimatedNumber value={t.completed} format={(v) => String(Math.round(v))} /><small className="text-muted text-sm"> / {plan.dates.length}</small></span>
            <span className="sub">{t.postponed} postponed</span>
          </div>
          <Kpi label="Avg per date" value={t.avg} sub="Spent ÷ done" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-3">
        <div className="card">
          <h3>Planned vs spent</h3>
          <div className="h-56 mt-2"><WeekChart plan={plan} /></div>
          <p className="text-[13px] mt-2">
            {over ? <><b className="neg">Over budget by {peso(-t.remaining)}.</b> Try swapping a paid date for a no-spend one.</>
              : t.planned > t.budget ? <b className="neg">Plans are {peso(t.planned - t.budget)} over budget.</b>
              : <><b className="pos">Within budget.</b> {peso(t.actual)} spent so far.</>}
          </p>
        </div>
        <div className="card">
          <h3>Where the money goes</h3>
          <p className="text-muted text-[13px] mt-0.5">Light bar = planned · dark line = spent</p>
          <div className="grid gap-2.5 mt-3">
            {catRows.map(([k, v]) => (
              <div key={k} className="cat-row">
                <span className="flex items-center gap-1.5 min-w-0"><CatDot cat={k} /><span className="truncate">{k}</span></span>
                <span className="track"><i style={{ width: `${(v.p / catMax) * 100}%` }} /><b style={{ width: `${(v.a / catMax) * 100}%` }} /></span>
                <span className="num text-right">{peso(v.p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sec-title"><h2>Week plans</h2><span className="text-muted text-[13px]">Tap a date to update it</span></div>
      <div className="grid gap-6">
        {WEEKS.map((w) => {
          const ds = sortedDates(plan).filter((d) => d.day >= w.from && d.day <= w.to);
          if (w.n === 5 && !ds.length) {
            return (
              <div key={w.n}>
                <div className="week-h"><h3>{w.theme}</h3><small>May {w.from}–{w.to}</small></div>
                <button className="card tap w-full text-left" onClick={() => open(<DateForm day={w.from} />, "Plan a date")}>
                  <b>+ Plan something for May {w.from}–{w.to}</b>
                  <span className="block text-muted text-[13px]">These days are free for whatever you feel like.</span>
                </button>
              </div>
            );
          }
          return (
            <div key={w.n}>
              <div className="week-h"><h3>{w.n < 5 ? `Week ${w.n} · ` : ""}{w.theme}</h3><small>May {w.from}–{w.to} · {peso(ds.reduce((s, d) => s + (d.planned || 0), 0))}</small></div>
              <div className="cards">{ds.map((d) => <DateCard key={d.id} d={d} onOpen={() => openDate(d.id, d.title)} />)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Kpi({ label, value, sub, warn }: { label: string; value: number; sub: string; warn?: boolean }) {
  return (
    <div className="kpi">
      <span className="lab">{label}</span>
      <span className="val num"><AnimatedNumber value={value} /></span>
      <span className={`sub ${warn ? "neg" : ""}`}>{sub}</span>
    </div>
  );
}

/** Budget box: edits locally while typing, saves when you leave the field. */
function BudgetInput() {
  const { plan, update } = usePlanner();
  return (
    <div className="kpi edit wide">
      <label className="lab" htmlFor="budgetIn">Monthly budget · tap to change</label>
      <span className="flex items-baseline gap-0.5">
        <span className="text-xl font-extrabold">₱</span>
        <input
          id="budgetIn"
          key={plan.budget}
          className="money-in num"
          type="number"
          min={0}
          step={100}
          inputMode="numeric"
          defaultValue={plan.budget}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (!Number.isFinite(v) || v < 0 || e.target.value === "") { e.target.value = String(plan.budget); return; }
            if (v !== plan.budget) update((p) => { p.budget = v; }, { toast: "Budget updated" });
          }}
        />
      </span>
      <span className="sub">What you allow for dates this month</span>
    </div>
  );
}
