import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ShowToast = (message: string, undo?: () => void) => void;
const ToastContext = createContext<ShowToast>(() => {});

/** Small message at the bottom of the screen, with an optional Undo button. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState("");
  const [shown, setShown] = useState(false);
  const undoRef = useRef<(() => void) | null>(null);
  const [hasUndo, setHasUndo] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ShowToast>((message, undo) => {
    setMsg(message);
    undoRef.current = undo ?? null;
    setHasUndo(!!undo);
    setShown(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShown(false), undo ? 5000 : 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast ${shown ? "show" : ""}`} role="status" aria-live="polite">
        <span>{msg}</span>
        {hasUndo && (
          <button
            onClick={() => {
              const f = undoRef.current;
              undoRef.current = null;
              setShown(false);
              f?.();
            }}
          >
            Undo
          </button>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
