import { useRef, useState } from "react";
import { usePlanner } from "../state/planner";
import { useAuth } from "../state/auth";
import { useSheet } from "../components/Sheet";
import { useToast } from "../components/Toast";
import { Segmented } from "../components/ui";
import { syncExplain } from "../components/Shell";
import { defaults, isPlanner } from "../lib/defaults";
import { clearDemo, hasDemo, sortedDates } from "../lib/plan";
import { isoDay } from "../lib/format";
import { readString, removeLocal, writeLocal } from "../lib/storage";
import { ConfirmSheet } from "./Menus";

type Theme = "system" | "light" | "dark";

export function applyTheme(t: Theme) {
  if (t === "system") { removeLocal("bp-theme"); document.documentElement.removeAttribute("data-theme"); }
  else { writeLocal("bp-theme", t); document.documentElement.setAttribute("data-theme", t); }
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  document.getElementById("themeColor")?.setAttribute("content", bg || "#FFF8FA");
}

function download(filename: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}
const csvCell = (v: unknown) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function Settings() {
  const { plan, update, replace, sync, name } = usePlanner();
  const { needsLogin, signOut } = useAuth();
  const { open, close } = useSheet();
  const toast = useToast();
  const [theme, setTheme] = useState<Theme>(() => (readString("bp-theme") as Theme) || "system");
  const [n1, setN1] = useState(plan.names.p1);
  const [n2, setN2] = useState(plan.names.p2);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const saveName = (k: "p1" | "p2", v: string) => {
    const val = v.trim() || (k === "p1" ? "Partner 1" : "Partner 2");
    if (val !== plan.names[k]) update((p) => { p.names[k] = val; }, { toast: "Name saved" });
  };

  const exportCSV = () => {
    const rows: unknown[][] = [["Section", "Date", "Activity / Partner", "Planned (PHP)", "Actual (PHP)", "Status / Type", "Notes"]];
    sortedDates(plan).forEach((d) => rows.push(["Date", isoDay(d.day), d.title, d.planned, d.actual ?? "", d.status, d.notes]));
    plan.contribs.forEach((c) => rows.push(["Contribution", c.date, name(c.who), "", c.amount, c.type, [c.purpose, c.note].filter(Boolean).join(" · ")]));
    plan.places.forEach((p) => rows.push(["Place", "", p.name + (p.area ? ` (${p.area})` : ""), p.cost, "", p.visited ? "Been there" : "Not yet", [p.note, p.link].filter(Boolean).join(" · ")]));
    download("our-may-2027.csv", "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n"), "text/csv;charset=utf-8");
    toast("Downloading CSV");
  };

  const importFile = (file?: File) => {
    setErr("");
    if (!file) return;
    file.text().then((txt) => {
      try {
        const o: unknown = JSON.parse(txt);
        if (!isPlanner(o)) throw new Error();
        open(<ConfirmSheet title="Replace the planner with this backup?" message="Everything in the planner now will be replaced by the backup file, for both of you." ok="Import" onOk={() => replace(o, "Backup imported")} />);
      } catch {
        setErr("That file isn't a planner backup. Use a file made with “Export backup”.");
      }
    });
  };

  return (
    <div className="sh-body">
      <h2>Settings</h2>
      <div className="form">
        <label className="f">Partner 1 name<input className="field" maxLength={20} value={n1} onChange={(e) => setN1(e.target.value)} onBlur={() => saveName("p1", n1)} /></label>
        <label className="f">Partner 2 name<input className="field" maxLength={20} value={n2} onChange={(e) => setN2(e.target.value)} onBlur={() => saveName("p2", n2)} /></label>
      </div>
      <div className="f">Appearance
        <Segmented<Theme> label="Appearance" value={theme} onChange={(t) => { setTheme(t); applyTheme(t); }}
          options={[{ key: "system", label: "Auto" }, { key: "light", label: "Light" }, { key: "dark", label: "Dark" }]} />
      </div>
      <p className="text-[13px] text-muted"><span className={`dot inline-block mr-1.5 ${sync === "shared" ? "ok" : "warn"}`} />{syncExplain[sync]}</p>
      <div className="grid gap-2">
        <button className="btn menu" onClick={exportCSV}>Export CSV (spreadsheet)</button>
        <button className="btn menu" onClick={() => { download("our-may-2027-backup.json", JSON.stringify(plan, null, 2), "application/json"); toast("Downloading backup"); }}>Export backup</button>
        <button className="btn menu" onClick={() => fileRef.current?.click()}>Import backup</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = ""; }} />
        {hasDemo(plan) && <button className="btn menu" onClick={() => { close(); update(clearDemo, { toast: "Demo data cleared", undo: true }); }}>Clear demo data</button>}
        <button className="btn menu danger" onClick={() => open(<ConfirmSheet title="Reset everything?" message="This replaces all edits, contributions, places and notes with the original May plan. Export a backup first if you want to keep anything." ok="Reset" onOk={() => replace({ ...defaults(), names: plan.names }, "Plan reset")} />)}>Reset to the original plan</button>
        {needsLogin && <button className="btn menu" onClick={() => { close(); signOut(); }}>Lock (sign out)</button>}
      </div>
      {err && <div className="err">{err}</div>}
      <button className="btn pri w-full" onClick={close}>Done</button>
    </div>
  );
}
