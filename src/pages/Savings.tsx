import { usePlanner } from "../state/planner";
import { useSheet } from "../components/Sheet";
import { AnimatedNumber, Empty, Meter } from "../components/ui";
import { ProgressRing, SavingsOverTime, WhoChart } from "../components/Charts";
import { ContribForm } from "../sheets/ContribForm";
import { peso, shortDate } from "../lib/format";
import { totals } from "../lib/totals";

export function Savings() {
  const { plan, update, name } = usePlanner();
  const { open } = useSheet();
  const t = totals(plan);
  const names: [string, string] = [name("p1"), name("p2")];
  const over = t.combined - t.target;
  const list = [...plan.contribs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <>
      <div className="sec-title"><h2>Our savings</h2></div>
      <div className="save-top">
        <div className="card wide">
          <div className="eyebrow">Combined</div>
          <div className="text-[28px] font-extrabold leading-tight num"><AnimatedNumber value={t.combined} /></div>
          <div className="flex flex-wrap justify-between items-center gap-2 text-[13px] mt-0.5">
            <span className="text-muted">{t.target > 0 ? (over >= 0 ? `Target reached · ${peso(over)} extra` : `${peso(t.left)} to go · ${t.progress.toFixed(0)}%`) : "Set a target"}</span>
            <label className="flex items-center gap-1"><span className="text-muted">Target ₱</span>
              <input key={plan.target} className="money-in num !text-[15px] w-24" type="number" min={0} step={100} inputMode="numeric" defaultValue={plan.target}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v) || v < 0 || e.target.value === "") { e.target.value = String(plan.target); return; }
                  if (v !== plan.target) update((p) => { p.target = v; }, { toast: "Target updated" });
                }} />
            </label>
          </div>
          <Meter value={t.progress} />
        </div>
        <PartnerCard label={names[0]} value={t.p1} share={t.share1} tone="p1" />
        <PartnerCard label={names[1]} value={t.p2} share={t.share2} tone="p2" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-3">
        <div className="card">
          <h3>Progress to target</h3>
          <div className="h-56 mt-2"><ProgressRing t={t} /></div>
          <p className="text-[13px] mt-2">{t.target > 0 ? (t.combined >= t.target ? `Target reached. ${peso(over)} saved beyond it.` : `${peso(t.left)} left to reach ${peso(t.target)}.`) : "Set a savings target to see progress."}</p>
        </div>
        <div className="card"><h3>Who saved what</h3><div className="h-56 mt-2"><WhoChart t={t} names={names} /></div></div>
      </div>
      <div className="card mt-3"><h3>Savings over May</h3><div className="h-64 mt-2"><SavingsOverTime plan={plan} names={names} /></div></div>

      <div className="sec-title"><h2>Contributions</h2>{list.length > 0 && <span className="text-muted text-[13px]">{list.length} {list.length === 1 ? "entry" : "entries"} · tap to edit</span>}</div>
      <div className="grid gap-2 md:grid-cols-2">
        {list.length ? list.map((c) => (
          <button key={c.id} className="card tap li" onClick={() => open(<ContribForm id={c.id} />, "Edit contribution")}>
            <span className={`avatar ${c.who}`}>{name(c.who).charAt(0).toUpperCase()}</span>
            <span className="mid">
              <b>{name(c.who)}{c.demo && <span className="tag ml-1.5">demo</span>}</b>
              <small>{[shortDate(c.date), c.type, c.purpose, c.note].filter(Boolean).join(" · ")}</small>
            </span>
            <span className="end"><b className="num text-base">{peso(c.amount)}</b></span>
          </button>
        )) : <Empty>No contributions yet. Tap + when one of you puts money in.</Empty>}
      </div>
    </>
  );
}

function PartnerCard({ label, value, share, tone }: { label: string; value: number; share: number; tone: "p1" | "p2" }) {
  return (
    <div className="card">
      <div className={`eyebrow ${tone === "p1" ? "!text-p1" : ""}`}>{label}</div>
      <div className="text-[21px] font-extrabold num"><AnimatedNumber value={value} /></div>
      <div className="text-muted text-[13px]">{share.toFixed(0)}% of total</div>
      <Meter value={share} tone={tone} />
    </div>
  );
}
