import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PLAN_DOC } from "../config";
import { defaults, isPlanner, normalize } from "../lib/defaults";
import { readLocal, writeLocal } from "../lib/storage";
import type { PartnerKey, Planner } from "../lib/types";
import { useAuth } from "./auth";
import { useToast } from "../components/Toast";

const LOCAL_KEY = "bp-may-planner-v1"; // same key as the old single-file version

/** shared = syncing · local = this device only · offline = couldn't reach server · blocked = rules refused */
export type SyncMode = "connecting" | "shared" | "local" | "offline" | "blocked";

interface PlannerState {
  plan: Planner;
  sync: SyncMode;
  saving: boolean;
  /** Change the plan. `fn` gets a copy you can edit directly. */
  update: (fn: (draft: Planner) => void, opts?: { toast?: string; undo?: boolean }) => void;
  replace: (next: Planner, toast?: string) => void;
  name: (k: PartnerKey) => string;
}

const PlannerContext = createContext<PlannerState | null>(null);

function initialPlan(): Planner {
  const saved = readLocal<unknown>(LOCAL_KEY);
  return isPlanner(saved) ? normalize(saved) : defaults();
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [plan, setPlan] = useState<Planner>(initialPlan);
  const [sync, setSync] = useState<SyncMode>(db ? "connecting" : "local");
  const [saving, setSaving] = useState(false);

  const planRef = useRef(plan); // always the latest plan, for async code
  const lastSynced = useRef(""); // JSON last written to / read from Firestore
  const timer = useRef<number | undefined>(undefined);
  const writing = useRef(false);
  const again = useRef(false);

  // Listen for changes made on the other phone.
  useEffect(() => {
    if (!db || !user) return;
    setSync("shared");
    const ref = doc(db, PLAN_DOC.collection, PLAN_DOC.id);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.metadata.hasPendingWrites || !snap.exists()) return; // our own write, or nothing saved yet
        const state = snap.data().state;
        if (typeof state !== "string" || state === lastSynced.current) return;
        if (state === JSON.stringify(planRef.current)) { lastSynced.current = state; return; }
        try {
          const parsed: unknown = JSON.parse(state);
          if (isPlanner(parsed)) {
            const next = normalize(parsed);
            lastSynced.current = state;
            planRef.current = next;
            setPlan(next);
            writeLocal(LOCAL_KEY, next);
          }
        } catch { /* ignore bad data */ }
      },
      () => setSync("offline"),
    );
  }, [user]);

  // Write the latest plan to Firestore, one write at a time.
  const flush = useCallback(async () => {
    if (!db || !user) return;
    if (writing.current) { again.current = true; return; }
    writing.current = true;
    setSaving(true);
    const json = JSON.stringify(planRef.current);
    try {
      await setDoc(doc(db, PLAN_DOC.collection, PLAN_DOC.id), { state: json, updatedAt: Date.now() });
      lastSynced.current = json;
      setSync("shared");
    } catch (e) {
      setSync((e as { code?: string })?.code === "permission-denied" ? "blocked" : "offline");
    }
    writing.current = false;
    setSaving(false);
    if (again.current) { again.current = false; void flush(); }
  }, [user]);

  const commit = useCallback((next: Planner) => {
    planRef.current = next;
    setPlan(next);
    writeLocal(LOCAL_KEY, next);
    if (db && user) {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), 600); // batch quick edits into one save
    }
  }, [flush, user]);

  const update = useCallback<PlannerState["update"]>((fn, opts) => {
    const before = planRef.current;
    const draft = structuredClone(before);
    fn(draft);
    commit(draft);
    if (opts?.undo) {
      toast(opts.toast ?? "Done", () => { commit(structuredClone(before)); toast("Restored"); });
    } else if (opts?.toast) {
      toast(opts.toast);
    }
  }, [commit, toast]);

  const replace = useCallback((next: Planner, msg?: string) => {
    commit(normalize(structuredClone(next)));
    if (msg) toast(msg);
  }, [commit, toast]);

  const name = useCallback((k: PartnerKey) => plan.names[k] || (k === "p1" ? "Partner 1" : "Partner 2"), [plan.names]);

  return (
    <PlannerContext.Provider value={{ plan, sync, saving, update, replace, name }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside <PlannerProvider>");
  return ctx;
}
