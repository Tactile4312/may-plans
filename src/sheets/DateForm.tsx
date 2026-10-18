import { useState, type FormEvent } from "react";
import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { CATS, DAYS_IN_MONTH, fmtDay, toMoney, uid } from "../lib/format";
import type { DateItem } from "../lib/types";

type Prefill = Partial<Pick<DateItem, "title" | "cat" | "desc" | "place" | "planned" | "q">>;

/** Add a new date, or edit an existing one. `placeId` links a date planned from the Places list. */
export function DateForm({ id, day, prefill, placeId }: { id?: string; day?: number; prefill?: Prefill; placeId?: string }) {
  const { plan, update } = usePlanner();
  const { close } = useSheet();
  const ex = id ? plan.dates.find((d) => d.id === id) : undefined;
  const base = ex ?? { title: "", day: day ?? 1, cat: "Other", desc: "", place: "", planned: 0, transport: 0, food: 0, q: "", span: 1, ...prefill };
  const [f, setF] = useState({
    title: base.title, day: String(base.day), cat: base.cat, desc: base.desc, place: base.place,
    planned: String(base.planned || 0), transport: String(base.transport || 0), food: String(base.food || 0),
    q: base.q, span: String(base.span || 1),
  });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = f.title.trim();
    if (!title) return setErr("Give the date a name.");
    const pl = toMoney(f.planned), tr = toMoney(f.transport), fd = toMoney(f.food);
    if ([pl, tr, fd].some((v) => v !== null && (Number.isNaN(v) || v < 0))) return setErr("Amounts can't be negative.");
    if ((tr ?? 0) + (fd ?? 0) > (pl ?? 0)) return setErr("Transport + food is more than the planned total. Raise the total or lower them.");
    const fields = {
      title, day: Number(f.day), cat: f.cat, desc: f.desc.trim(), place: f.place.trim(),
      planned: pl ?? 0, transport: tr ?? 0, food: fd ?? 0, q: f.q.trim() || title, span: Number(f.span),
    };
    update((p) => {
      if (ex) {
        const x = p.dates.find((d) => d.id === ex.id);
        if (x) Object.assign(x, fields);
      } else {
        const nd: DateItem = { id: uid("d"), status: "Planned", actual: null, notes: "", rating: 0, ...fields };
        p.dates.push(nd);
        const pl2 = placeId ? p.places.find((x) => x.id === placeId) : undefined;
        if (pl2) pl2.dateId = nd.id;
      }
    }, { toast: ex ? "Date updated" : `Added to ${fmtDay(fields.day)}` });
    close();
  }

  function remove() {
    if (!ex) return;
    close();
    update((p) => {
      p.dates = p.dates.filter((d) => d.id !== ex.id);
      p.places.forEach((pl) => { if (pl.dateId === ex.id) pl.dateId = null; });
    }, { toast: "Date removed", undo: true });
  }

  return (
    <form className="sh-body" onSubmit={submit} noValidate>
      <h2>{ex ? "Edit date" : prefill ? "Plan this place" : "Plan a date"}</h2>
      <div className="form">
        <label className="f full">Activity<input className="field" maxLength={60} value={f.title} onChange={set("title")} placeholder="e.g. Kite flying at the park" /></label>
        <label className="f">Day
          <select className="field" value={f.day} onChange={set("day")}>
            {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{fmtDay(n)}{plan.dates.some((x) => x.day === n && x.id !== ex?.id) ? " •" : ""}</option>
            ))}
          </select>
        </label>
        <label className="f">Type
          <select className="field" value={f.cat} onChange={set("cat")}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="f full">What you'll do<textarea className="field" rows={3} value={f.desc} onChange={set("desc")} /></label>
        <label className="f full">Where / what to bring<input className="field" value={f.place} onChange={set("place")} /></label>
        <label className="f">Planned total ₱<input className="field num" type="number" min={0} step={10} inputMode="numeric" value={f.planned} onChange={set("planned")} /></label>
        <label className="f">Length
          <select className="field" value={f.span} onChange={set("span")}><option value="1">1 day</option><option value="2">Overnight (2 days)</option></select>
        </label>
        <label className="f">Transport ₱<input className="field num" type="number" min={0} step={10} inputMode="numeric" value={f.transport} onChange={set("transport")} /></label>
        <label className="f">Food &amp; drinks ₱<input className="field num" type="number" min={0} step={10} inputMode="numeric" value={f.food} onChange={set("food")} /></label>
        <label className="f full">TikTok search words<input className="field" value={f.q} onChange={set("q")} placeholder="e.g. kite flying couple date" /></label>
      </div>
      <div className="err" role="alert">{err}</div>
      <div className="flex justify-between gap-2">
        {ex ? <button type="button" className="btn danger" onClick={remove}>Remove date</button> : <span />}
        <span className="flex gap-2"><button type="button" className="btn" onClick={close}>Cancel</button><button type="submit" className="btn pri">Save</button></span>
      </div>
    </form>
  );
}
