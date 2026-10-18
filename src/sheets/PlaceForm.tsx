import { useState, type FormEvent } from "react";
import { usePlanner } from "../state/planner";
import { useAuth } from "../state/auth";
import { useSheet } from "../components/Sheet";
import { CATS, safeLink, toMoney, uid } from "../lib/format";
import type { Place } from "../lib/types";

export function PlaceForm({ id }: { id?: string }) {
  const { plan, update, name } = usePlanner();
  const { me } = useAuth();
  const { close } = useSheet();
  const ex = id ? plan.places.find((p) => p.id === id) : undefined;
  const [f, setF] = useState({
    name: ex?.name ?? "", link: ex?.link ?? "", area: ex?.area ?? "", cost: ex ? String(ex.cost) : "",
    cat: ex?.cat ?? "Outdoor", who: (ex?.who ?? me ?? "p1") as Place["who"], note: ex?.note ?? "",
  });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function submit(e: FormEvent) {
    e.preventDefault();
    const nm = f.name.trim();
    if (!nm) return setErr("Give the place a name.");
    const cost = toMoney(f.cost);
    if (cost !== null && (Number.isNaN(cost) || cost < 0)) return setErr("Cost can't be negative.");
    const link = safeLink(f.link);
    if (f.link.trim() && !link) return setErr("That link doesn't look right. Paste the full web address.");
    const fields = { name: nm, area: f.area.trim(), cost: cost ?? 0, cat: f.cat, who: f.who, link, note: f.note.trim() };
    update((p) => {
      if (ex) { const x = p.places.find((y) => y.id === ex.id); if (x) Object.assign(x, fields); }
      else p.places.unshift({ id: uid("p"), visited: false, dateId: null, ...fields });
    }, { toast: ex ? "Place updated" : "Saved to your places" });
    close();
  }

  return (
    <form className="sh-body" onSubmit={submit} noValidate>
      <h2>{ex ? "Edit place" : "Save a place"}</h2>
      <div className="form">
        <label className="f full">Place<input className="field" maxLength={60} value={f.name} onChange={set("name")} placeholder="e.g. Sky Ranch Tagaytay" /></label>
        <label className="f full">Link (TikTok, Maps, Facebook…)<input className="field" inputMode="url" value={f.link} onChange={set("link")} placeholder="Paste a link" /></label>
        <label className="f">Area<input className="field" maxLength={60} value={f.area} onChange={set("area")} placeholder="e.g. Tagaytay" /></label>
        <label className="f">Cost for two ₱<input className="field num" type="number" min={0} step={10} inputMode="numeric" value={f.cost} onChange={set("cost")} /></label>
        <label className="f">Type<select className="field" value={f.cat} onChange={set("cat")}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="f">Added by
          <select className="field" value={f.who} onChange={set("who")}>
            <option value="p1">{name("p1")}</option>
            <option value="p2">{name("p2")}</option>
            {f.who === "idea" && <option value="idea">Starter idea</option>}
          </select>
        </label>
        <label className="f full">Why we want to go<textarea className="field" rows={2} value={f.note} onChange={set("note")} /></label>
      </div>
      <div className="err" role="alert">{err}</div>
      <div className="flex justify-between gap-2">
        {ex ? (
          <button type="button" className="btn danger" onClick={() => {
            close();
            update((p) => { p.places = p.places.filter((x) => x.id !== ex.id); }, { toast: `“${ex.name}” deleted`, undo: true });
          }}>Delete</button>
        ) : <span />}
        <span className="flex gap-2"><button type="button" className="btn" onClick={close}>Cancel</button><button type="submit" className="btn pri">{ex ? "Save" : "Save place"}</button></span>
      </div>
    </form>
  );
}
