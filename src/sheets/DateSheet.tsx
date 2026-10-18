import { useEffect, useRef, useState } from "react";
import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { useToast } from "../components/Toast";
import { CatTag, HEART_PATH, PlayIcon, Segmented } from "../components/ui";
import { fmtDay, peso, tiktokUrl, toMoney } from "../lib/format";
import { STATUSES, type DateItem, type Status } from "../lib/types";
import { DateForm } from "./DateForm";

/** Quick view of one date: change status, log spending, rate it, write memories. */
export function DateSheet({ id }: { id: string }) {
  const { plan, update } = usePlanner();
  const { open, close } = useSheet();
  const toast = useToast();
  const d = plan.dates.find((x) => x.id === id);
  const [actual, setActual] = useState(d?.actual != null ? String(d.actual) : "");
  const [notes, setNotes] = useState(d?.notes ?? "");
  const [err, setErr] = useState("");
  const notesTimer = useRef<number | undefined>(undefined);

  // If the other person edits this date while it's open, show their notes.
  useEffect(() => { if (d && document.activeElement?.id !== "shNotes") setNotes(d.notes); }, [d?.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d) return <div className="sh-body"><p className="text-muted">This date was removed.</p></div>;
  const free = !d.planned;

  const setField = (fn: (x: DateItem) => void, msg?: string) =>
    update((p) => { const x = p.dates.find((y) => y.id === id); if (x) { fn(x); delete x.demoP; } }, { toast: msg });

  const saveActual = () => {
    const v = toMoney(actual);
    if (v !== null && (Number.isNaN(v) || v < 0)) { setErr("Amount can't be negative."); setActual(d.actual != null ? String(d.actual) : ""); return; }
    setErr("");
    if (v !== d.actual) setField((x) => { x.actual = v; }, "Saved");
  };

  return (
    <div className="sh-body">
      <div>
        <div className="eyebrow">{fmtDay(d.day)}{d.span > 1 ? ` – ${fmtDay(d.day + d.span - 1)}` : ""}</div>
        <h2 className="mt-1">{d.title}</h2>
        <div className="flex flex-wrap gap-1.5 mt-2"><CatTag cat={d.cat} />{free && <span className="tag free">No-spend</span>}</div>
      </div>

      <Segmented<Status>
        label="Status"
        value={d.status}
        options={STATUSES.map((s) => ({ key: s, label: s }))}
        onChange={(s) => {
          setField((x) => { x.status = s; });
          toast(s === "Completed" ? (d.actual == null && d.planned ? "Marked completed · add what you spent" : "Marked completed") : `Marked ${s.toLowerCase()}`);
        }}
      />

      {d.desc && <p>{d.desc}</p>}
      <div className="costs num">
        <div><span>Total</span><b>{peso(d.planned)}</b></div>
        <div><span>Each</span><b>{peso((d.planned || 0) / 2)}</b></div>
        <div><span>Transport</span><b>{d.transport ? peso(d.transport) : "—"}</b></div>
        <div><span>Food</span><b>{d.food ? peso(d.food) : "—"}</b></div>
      </div>
      {d.place && <p className="text-[13px]"><b>Where / bring:</b> <span className="text-muted">{d.place}</span></p>}

      <label className="f">Actual spent (₱)
        <input className="field num" type="number" min={0} step={10} inputMode="decimal" placeholder="Enter after the date"
          value={actual} onChange={(e) => setActual(e.target.value)} onBlur={saveActual}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
      </label>
      {err && <div className="err" role="alert">{err}</div>}

      <div className="f">How was it?
        <div className="rate" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} aria-label={`${i} of 5`} onClick={() => setField((x) => { x.rating = x.rating === i ? 0 : i; })}>
              <svg viewBox="0 0 24 24" className={i <= d.rating ? "on" : ""}><path d={HEART_PATH} /></svg>
            </button>
          ))}
        </div>
      </div>

      <label className="f">Notes &amp; memories
        <textarea id="shNotes" className="field" placeholder="What happened, what you loved…" value={notes}
          onChange={(e) => {
            const v = e.target.value;
            setNotes(v);
            window.clearTimeout(notesTimer.current);
            notesTimer.current = window.setTimeout(() => setField((x) => { x.notes = v; }), 500);
          }} />
      </label>

      <div className="flex flex-wrap justify-between items-center gap-2">
        <a className="tt" href={tiktokUrl(d.q)} target="_blank" rel="noopener noreferrer"><PlayIcon /> TikTok ideas</a>
        <span className="flex gap-2">
          <button className="btn sm" onClick={() => open(<DateForm id={d.id} />, "Edit date")}>Edit details</button>
          <button className="btn sm pri" onClick={close}>Done</button>
        </span>
      </div>
    </div>
  );
}
