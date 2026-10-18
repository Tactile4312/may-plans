import type { ReactNode } from "react";
import { usePlanner, type SyncMode } from "../state/planner";
import { useAuth } from "../state/auth";
import { MONTH_NAME } from "../lib/format";
import { YEAR } from "../config";

export type Tab = "home" | "calendar" | "places" | "savings";
export const TABS: Tab[] = ["home", "calendar", "places", "savings"];

const syncText: Record<SyncMode, [string, string]> = {
  connecting: ["", "…"],
  shared: ["ok", "Synced"],
  local: ["warn", "This phone"],
  offline: ["warn", "Offline"],
  blocked: ["warn", "Not allowed"],
};
export const syncExplain: Record<SyncMode, string> = {
  connecting: "Connecting…",
  shared: "Your plan saves automatically and syncs between both of your phones.",
  local: "Syncing isn't set up, so changes save on this device only. Export a backup to keep a copy.",
  offline: "Couldn't reach the server. Changes are kept on this phone and will sync when you're back online.",
  blocked: "The database rules are blocking saves. Check that both emails are in the Firestore rules.",
};

export function Header({ onMenu }: { onMenu: () => void }) {
  const { plan, sync, saving, name } = usePlanner();
  const { me } = useAuth();
  const [cls, txt] = saving ? ["warn", "Saving"] : syncText[sync];
  return (
    <header className="appbar">
      <div className="inner flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="eyebrow">{MONTH_NAME} {YEAR} · our dates</div>
          <h1 className="mt-0.5">{me ? `Hi, ${name(me)}` : `${plan.names.p1} & ${plan.names.p2}`}</h1>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="sync" title={syncExplain[sync]}><span className={`dot ${cls}`} />{txt}</span>
          <button className="icon-btn" onClick={onMenu} aria-label="Settings and backup">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}

const icons: Record<Tab, ReactNode> = {
  home: <path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  places: <><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></>,
  savings: <><path d="M4 8h14.5A2.5 2.5 0 0 1 21 10.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A1.5 1.5 0 0 1 4 18.5z" /><path d="M4 8.5V7a2 2 0 0 1 2-2h10v3" /><circle cx="16.5" cy="14" r="1.2" /></>,
};
const labels: Record<Tab, string> = { home: "Home", calendar: "Calendar", places: "Places", savings: "Savings" };

/** Bottom bar on phones, pill bar at the top on wider screens (see .tabs in index.css). */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((t) => (
        <button key={t} className="tab" aria-current={tab === t ? "page" : undefined} onClick={() => onChange(t)}>
          <span className="ic"><svg viewBox="0 0 24 24">{icons[t]}</svg></span>
          {labels[t]}
        </button>
      ))}
    </nav>
  );
}

export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button className="fab" onClick={onClick} aria-label="Add">
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  );
}
