import { useState, type FormEvent } from "react";
import { usePlanner } from "../state/planner";
import { useAuth } from "../state/auth";
import { useSheet } from "../components/Sheet";
import { Segmented } from "../components/ui";
import { isoDay, peso, toMoney, uid } from "../lib/format";
import { MONTH, YEAR } from "../config";
import type { Contribution, PartnerKey } from "../lib/types";

export function ContribForm({ id }: { id?: string }) {
  const { plan, update, name } = usePlanner();
  const { me } = useAuth();
  const { close } = useSheet();
  const ex = id ? plan.contribs.find((c) => c.id === id) : undefined;
  const now = new Date();
  const defaultDate = now.getFullYear() === YEAR && now.getMonth() === MONTH ? isoDay(now.getDate()) : isoDay(1);
  const [who, setWho] = useState<PartnerKey>(ex?.who ?? me ?? "p1");
  const [amount, setAmount] = useState(ex ? String(ex.amount) : "");
  const [date, setDate] = useState(ex?.date ?? defaultDate);
  const [type, setType] = useState<Contribution["type"]>(ex?.type ?? "Cash");
  const [purpose, setPurpose] = useState(ex?.purpose ?? "");
  const [note, setNote] = useState(ex?.note ?? "");
  const [err, setErr] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const amt = toMoney(amount);
    if (amt === null || Number.isNaN(amt) || amt <= 0) return setErr("Enter an amount above ₱0.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setErr("Pick a date.");
    const fields = { who, amount: amt, date, type, purpose: purpose.trim(), note: note.trim() };
    update((p) => {
      if (ex) {
        const x = p.contribs.find((c) => c.id === ex.id);
        if (x) { Object.assign(x, fields); delete x.demo; }
      } else p.contribs.push({ id: uid("c"), ...fields });
    }, { toast: ex ? "Contribution updated" : `${peso(amt)} added for ${name(who)}` });
    close();
  }

  return (
    <form className="sh-body" onSubmit={submit} noValidate>
      <h2>{ex ? "Edit contribution" : "Add savings"}</h2>
      <Segmented<PartnerKey> label="Who" value={who} onChange={setWho} options={[{ key: "p1", label: name("p1") }, { key: "p2", label: name("p2") }]} />
      <label className="f">Amount (₱)
        <input className="field num text-2xl font-extrabold" type="number" min={0} step={10} inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <div className="form">
        <label className="f">Date<input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="f">Type
          <select className="field" value={type} onChange={(e) => setType(e.target.value as Contribution["type"])}><option>Cash</option><option>Digital</option></select>
        </label>
        <label className="f full">For (optional)<input className="field" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Staycation, Date fund" /></label>
        <label className="f full">Note (optional)<input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. GCash transfer" /></label>
      </div>
      <div className="err" role="alert">{err}</div>
      <div className="flex justify-between gap-2">
        {ex ? (
          <button type="button" className="btn danger" onClick={() => {
            close();
            update((p) => { p.contribs = p.contribs.filter((c) => c.id !== ex.id); }, { toast: `${peso(ex.amount)} from ${name(ex.who)} deleted`, undo: true });
          }}>Delete</button>
        ) : <span />}
        <span className="flex gap-2"><button type="button" className="btn" onClick={close}>Cancel</button><button type="submit" className="btn pri">{ex ? "Save" : "Add"}</button></span>
      </div>
    </form>
  );
}
