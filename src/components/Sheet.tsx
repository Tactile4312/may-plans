import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";

interface SheetApi {
  open: (content: ReactNode, label?: string) => void;
  close: () => void;
}
const SheetContext = createContext<SheetApi>({ open: () => {}, close: () => {} });

/**
 * One sheet at a time: slides up from the bottom on phones, a centered card on wider screens.
 * Opening a new sheet while one is open swaps the content.
 */
export function SheetProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null);
  const [label, setLabel] = useState("");
  const [shown, setShown] = useState(false);
  const seq = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const open = useCallback((c: ReactNode, l?: string) => {
    seq.current++;
    setContent(c);
    setLabel(l ?? "");
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    if (sheetRef.current) sheetRef.current.scrollTop = 0;
  }, []);

  const close = useCallback(() => {
    const mine = ++seq.current;
    setShown(false);
    window.setTimeout(() => { if (seq.current === mine) setContent(null); }, 320);
  }, []);

  // Escape closes; the page behind doesn't scroll while a sheet is open.
  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [content, close]);

  // Swipe down to close (phones).
  const drag = useRef<{ y0: number; dy: number } | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    const el = sheetRef.current;
    if (!el || el.scrollTop > 0 || window.innerWidth >= 760) return;
    if ((e.target as HTMLElement).closest("input,textarea,select")) return;
    drag.current = { y0: e.touches[0].clientY, dy: 0 };
  };
  const onTouchMove = (e: TouchEvent) => {
    const d = drag.current, el = sheetRef.current;
    if (!d || !el) return;
    d.dy = Math.max(0, e.touches[0].clientY - d.y0);
    el.classList.add("drag");
    el.style.transform = `translateY(${d.dy}px)`;
  };
  const onTouchEnd = () => {
    const d = drag.current, el = sheetRef.current;
    if (!d || !el) return;
    el.classList.remove("drag");
    el.style.transform = "";
    if (d.dy > 110) close();
    drag.current = null;
  };

  return (
    <SheetContext.Provider value={{ open, close }}>
      {children}
      {content !== null && (
        <>
          <div className={`scrim ${shown ? "open" : ""}`} onClick={close} />
          <div
            ref={sheetRef}
            className={`sheet ${shown ? "open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={label || undefined}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="handle" aria-hidden="true" />
            {content}
          </div>
        </>
      )}
    </SheetContext.Provider>
  );
}

export const useSheet = () => useContext(SheetContext);
