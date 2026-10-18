import { useState } from "react";
import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { CatTag, Chips, Empty } from "../components/ui";
import { PlaceForm } from "../sheets/PlaceForm";
import { DateForm } from "../sheets/DateForm";
import { DateSheet } from "../sheets/DateSheet";
import { CATS, fmtDay, linkLabel, peso, safeLink } from "../lib/format";
import { nextFreeWeekend } from "../lib/plan";

type Filter = "All" | "Not yet" | "Been there";

export function Places() {
  const { plan, update, name } = usePlanner();
  const { open } = useSheet();
  const [filter, setFilter] = useState<Filter>("All");
  const notYet = plan.places.filter((p) => !p.visited).length;
  const rows = plan.places.filter((p) => filter === "All" || (filter === "Been there") === p.visited);

  return (
    <>
      <div className="sec-title"><div><h2>Places to go</h2><p className="text-muted text-[13px]">Save spots from TikTok, Maps or Facebook. Plan one to put it on the calendar.</p></div></div>
      <Chips<Filter> label="Filter places" value={filter} onChange={setFilter}
        options={[{ key: "All", label: `All ${plan.places.length}` }, { key: "Not yet", label: `Not yet ${notYet}` }, { key: "Been there", label: `Been there ${plan.places.length - notYet}` }]} />
      <div className="places">
        {rows.length ? rows.map((p) => {
          const link = safeLink(p.link);
          const dd = p.dateId ? plan.dates.find((d) => d.id === p.dateId) : undefined;
          return (
            <article key={p.id} className={`card pc ${p.visited ? "done" : ""}`}>
              <div className="flex justify-between items-start gap-2"><h3>{p.name}</h3><CatTag cat={p.cat || "Other"} /></div>
              <div className="meta"><span>{p.area || "Area not set"}</span><span>about <b className="num">{peso(p.cost)}</b> for two</span></div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`pill bg-chip ${p.who === "idea" ? "text-muted" : "text-rose-ink"}`}>{p.who === "idea" ? "Starter idea" : `Added by ${name(p.who)}`}</span>
                {dd && <span className="pill st-Planned">On {fmtDay(dd.day)}</span>}
              </div>
              {p.note && <p className="text-[13.5px]">{p.note}</p>}
              <div className="actions">
                <label className={`toggle ${p.visited ? "on" : ""}`}>
                  <input type="checkbox" checked={p.visited} onChange={(e) => {
                    const v = e.target.checked;
                    update((pl) => { const x = pl.places.find((y) => y.id === p.id); if (x) x.visited = v; }, { toast: v ? "Nice! Marked as visited" : "Moved back to Not yet" });
                  }} /> Been there
                </label>
                {link && <a className="tt" href={link} target="_blank" rel="noopener noreferrer">{linkLabel(link)} ↗</a>}
              </div>
              <div className="actions">
                {dd ? <button className="btn sm" onClick={() => open(<DateSheet id={dd.id} />, dd.title)}>Open date</button>
                  : <button className="btn sm pri" onClick={() => open(<DateForm day={nextFreeWeekend(plan)} placeId={p.id}
                      prefill={{ title: p.name, cat: CATS.includes(p.cat) ? p.cat : "Other", desc: p.note, place: p.area, planned: p.cost || 0, q: `${p.name} ${p.area}` }} />, "Plan this place")}>Plan it</button>}
                <button className="btn sm" onClick={() => open(<PlaceForm id={p.id} />, "Edit place")}>Edit</button>
              </div>
            </article>
          );
        }) : <Empty>{plan.places.length ? "Nothing here for this filter." : "No places yet. Tap + to save one."}</Empty>}
      </div>
    </>
  );
}
