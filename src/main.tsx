import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./state/auth";
import { PlannerProvider } from "./state/planner";
import { ToastProvider } from "./components/Toast";
import { SheetProvider } from "./components/Sheet";
import "./index.css";

// Providers wrap the app so any component can reach login, data, toasts and sheets.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <PlannerProvider>
          <SheetProvider>
            <App />
          </SheetProvider>
        </PlannerProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);

// Offline support + "Add to Home screen" (only on the real https site, not while developing).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
