import type { ReactNode } from "react";
import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { StatusPill } from "../components/ui";
import { dow, peso } from "../lib/format";
import { nextFreeWeekend, sortedDates } from "../lib/plan";
import { DateForm } from "./DateForm";
import { DateSheet } from "./DateSheet";
import { ContribForm } from "./ContribForm";
import { PlaceForm } from "./PlaceForm";

const Icon = ({ children }: { children: ReactNode }) => (
  <span className="ai"><svg viewBox="0 0 24 24">{children}</svg></span>
);

/** What the + button shows on the Home tab. */
export function AddMenu() {
  const { plan } = usePlanner();
  const { open } = useSheet();
  const items = [
    { title: "Add savings", sub: "Record money one of you put in", icon: <><path d="M4 8h14.5A2.5 2.5 0 0 1 21 10.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A1.5 1.5 0 0 1 4 18.5z" /><path d="M4 8.5V7a2 2 0 0 1 2-2h10v3" /></>, go: () => open(<ContribForm />, "Add savings") },
    { title: "Log a finished date", sub: "Mark it done and enter what you spent", icon: <path d="M5 12.5l4.5 4.5L19 7.5" />, go: () => open(<PickDate />, "Pick a date") },
    { title: "Plan a date", sub: "Put a new date on the calendar", icon: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4M12 13v4M10 15h4" /></>, go: () => open(<DateForm day={nextFreeWeekend(plan)} />, "Plan a date") },
    { title: "Save a place", sub: "Somewhere you want to try", icon: <><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></>, go: () => open(<PlaceForm />, "Save a place") },
  ];
  return (
    <div className="sh-body">
      <h2>Add something</h2>
      <div className="grid gap-2.5">
        {items.map((it) => (
          <button key={it.title} className="add-opt" onClick={it.go}>
            <Icon>{it.icon}</Icon>
            <span><b>{it.title}</b><span className="block text-[13px] text-muted">{it.sub}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PickDate() {
  const { plan } = usePlanner();
  const { open } = useSheet();
  const open_ = sortedDates(plan).filter((d) => d.status !== "Completed");
  const list = open_.length ? open_ : sortedDates(plan);
  return (
    <div className="sh-body">
      <h2>Which date?</h2>
      <div className="grid gap-2">
        {list.map((d) => (
          <button key={d.id} className="card tap li" onClick={() => open(<DateSheet id={d.id} />, d.title)}>
            <span className="datebox"><small>{dow(d.day)}</small><b>{d.day}</b></span>
            <span className="mid"><b>{d.title}</b><small>{d.planned ? `${peso(d.planned)} planned` : "No-spend"}</small></span>
            <StatusPill status={d.status} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfirmSheet({ title, message, ok, onOk }: { title: string; message: string; ok: string; onOk: () => void }) {
  const { close } = useSheet();
  return (
    <div className="sh-body">
      <h3>{title}</h3>
      <p className="text-muted">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={close}>Cancel</button>
        <button className="btn pri" onClick={() => { close(); onOk(); }}>{ok}</button>
      </div>
    </div>
  );
}
