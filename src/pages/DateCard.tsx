import { CatTag, Hearts, StatusPill } from "../components/ui";
import { fmtDay, peso } from "../lib/format";
import type { DateItem } from "../lib/types";

export function DateCard({ d, onOpen }: { d: DateItem; onOpen: () => void }) {
  const free = !d.planned;
  return (
    <button className="card tap dcard" onClick={onOpen}>
      <span className="flex justify-between items-start gap-2">
        <span className="min-w-0">
          <span className="block text-xs font-extrabold text-rose-ink">{fmtDay(d.day)}{d.span > 1 ? ` – ${fmtDay(d.day + d.span - 1)}` : ""}</span>
          <h3>{d.title}</h3>
        </span>
        <StatusPill status={d.status} />
      </span>
      <span className="flex flex-wrap gap-1.5"><CatTag cat={d.cat} />{free && <span className="tag free">No-spend</span>}</span>
      <span className="desc">{d.desc}</span>
      <span className="flex justify-between items-center gap-2 text-[13px]">
        <span className="num"><b>{free ? "Free" : peso(d.planned)}</b>{d.actual != null && <span className="text-muted"> · spent {peso(d.actual)}</span>}</span>
        {d.rating ? <Hearts value={d.rating} /> : <span className="text-muted">Tap to update</span>}
      </span>
    </button>
  );
}
