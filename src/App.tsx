import { useEffect, useState } from "react";
import { useAuth } from "./state/auth";
import { usePlanner } from "./state/planner";
import { useSheet } from "./components/Sheet";
import { Fab, Header, TabBar, TABS, type Tab } from "./components/Shell";
import { Gate } from "./components/Gate";
import { Home } from "./pages/Home";
import { CalendarPage } from "./pages/CalendarPage";
import { Places } from "./pages/Places";
import { Savings } from "./pages/Savings";
import { Settings } from "./sheets/Settings";
import { AddMenu } from "./sheets/Menus";
import { DateForm } from "./sheets/DateForm";
import { PlaceForm } from "./sheets/PlaceForm";
import { ContribForm } from "./sheets/ContribForm";
import { nextFreeWeekend } from "./lib/plan";
import { readString, writeLocal } from "./lib/storage";

const tabFromHash = (): Tab | null => {
  const h = window.location.hash.slice(1) as Tab;
  return TABS.includes(h) ? h : null;
};

export default function App() {
  const { ready, user, needsLogin } = useAuth();
  const { plan } = usePlanner();
  const { open } = useSheet();
  const [tab, setTab] = useState<Tab>(() => tabFromHash() ?? ((readString("bp-tab") as Tab) || "home"));

  // Keep the tab in the address (#calendar) so the phone's back button and links work.
  useEffect(() => {
    const onHash = () => { const t = tabFromHash(); if (t) setTab(t); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    writeLocal("bp-tab", tab);
    if (window.location.hash !== "#" + tab) history.replaceState(null, "", "#" + tab);
    window.scrollTo({ top: 0 });
  }, [tab]);

  if (!ready) return null; // checking whether someone is already signed in
  if (needsLogin && !user) return <Gate />;

  const onAdd = () => {
    if (tab === "places") open(<PlaceForm />, "Save a place");
    else if (tab === "savings") open(<ContribForm />, "Add savings");
    else if (tab === "calendar") open(<DateForm day={nextFreeWeekend(plan)} />, "Plan a date");
    else open(<AddMenu />, "Add");
  };

  return (
    <>
      <Header onMenu={() => open(<Settings />, "Settings")} />
      <TabBar tab={tab} onChange={setTab} />
      <main className="inner">
        <section key={tab} className="panel">
          {tab === "home" && <Home />}
          {tab === "calendar" && <CalendarPage />}
          {tab === "places" && <Places />}
          {tab === "savings" && <Savings />}
        </section>
      </main>
      <Fab onClick={onAdd} />
    </>
  );
}
