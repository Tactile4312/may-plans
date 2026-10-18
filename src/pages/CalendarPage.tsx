import { useState } from "react";
import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { CatDot, CheckIcon, Chips, Empty, Hearts, StatusPill } from "../components/ui";
import { DateSheet } from "../sheets/DateSheet";
import { DateForm } from "../sheets/DateForm";
import { DAYS_IN_MONTH, MONTH_NAME, catColor, dateOf, dow, fmtDay, peso } from "../lib/format";
import { sortedDates } from "../lib/plan";
import { STATUSES, type Status } from "../lib/types";
import { MONTH, YEAR } from "../config";

type Filter = "All" | Status;

export function CalendarPage() {
  const { plan } = usePlanner();
  const { open } = useSheet();
  const [filter, setFilter] = useState<Filter>("All");
  const today = new Date();
  const lead = dateOf(1).getDay();
  const usedCats = new Set<string>();

  const cells = Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
    const day = i + 1;
    const own = plan.dates.filter((d) => d.day === day);
    const cont = own.length ? undefined : plan.dates.find((d) => d.span > 1 && day > d.day && day < d.day + d.span);
    const all = own.length ? own : cont ? [cont] : [];
    all.forEach((d) => usedCats.add(d.cat));
    const done = all.length > 0 && all.every((d) => d.status === "Completed");
    const isToday = today.getFullYear() === YEAR && today.getMonth() === MONTH && today.getDate() === day;
    return { day, all, cont: !!cont, done, isToday };
  });

  const rows = sortedDates(plan).filter((d) => filter === "All" || d.status === filter);

  return (
    <>
      <div className="sec-title"><h2>{MONTH_NAME} {YEAR}</h2><span className="text-muted text-[13px]">Tap a day to see or add a date</span></div>
      <div className="cal">
        {["S", "M", "T", "W", "T", "F", "S"].map((x, i) => <div key={i} className="dow">{x}</div>)}
        {Array.from({ length: lead }, (_, i) => <div key={`b${i}`} aria-hidden="true" />)}
        {cells.map((c) => (
          <button
            key={c.day}
            className={`day ${c.all.length ? "has" : ""} ${c.done ? "done" : ""} ${c.isToday ? "today" : ""}`}
            aria-label={`${fmtDay(c.day)}${c.all.length ? ": " + c.all.map((d) => d.title).join(", ") : ", free day"}`}
            onClick={() => (c.all[0] ? open(<DateSheet id={c.all[0].id} />, c.all[0].title) : open(<DateForm day={c.day} />, "Plan a date"))}
          >
            <span className="n">{c.day}{c.done && <CheckIcon />}</span>
            {c.all.map((d) => <span key={d.id} className="ev">{d.title}{c.cont ? " (2)" : ""}</span>)}
            <span className="dots">{c.all.map((d) => <span key={d.id} className="cdot" style={{ background: catColor(d.cat) }} />)}</span>
          </button>
        ))}
      </div>
      <div className="legend">{[...usedCats].map((c) => <span key={c}><CatDot cat={c} />{c}</span>)}</div>

      <div className="sec-title"><h2>Date tracker</h2></div>
      <Chips<Filter>
        label="Filter dates"
        value={filter}
        onChange={setFilter}
        options={(["All", ...STATUSES] as Filter[]).map((f) => ({ key: f, label: `${f} ${f === "All" ? plan.dates.length : plan.dates.filter((d) => d.status === f).length}` }))}
      />
      <div className="grid gap-2 mt-2.5 md:grid-cols-2">
        {rows.length ? rows.map((d) => (
          <button key={d.id} className="card tap li" onClick={() => open(<DateSheet id={d.id} />, d.title)}>
            <span className="datebox"><small>{dow(d.day)}</small><b>{d.day}</b></span>
            <span className="mid"><b>{d.title}</b><small>{d.planned ? `${peso(d.planned)} planned` : "No-spend"}{d.actual != null ? ` · spent ${peso(d.actual)}` : ""}</small></span>
            <span className="end"><StatusPill status={d.status} />{d.rating > 0 && <Hearts value={d.rating} />}</span>
          </button>
        )) : <Empty>No {filter.toLowerCase()} dates right now.</Empty>}
      </div>
      <p className="text-muted text-[13px] mt-2.5">A Completed date only counts as spending once you enter the actual amount.</p>
    </>
  );
}
