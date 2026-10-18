import { useEffect, useRef, useState, type ReactNode } from "react";
import { catColor, peso } from "../lib/format";
import type { Status } from "../lib/types";

export const HEART_PATH =
  "M12 21s-7.5-4.6-9.7-9.4C.6 7.9 3 4 6.8 4c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3C21 4 23.4 7.9 21.7 11.6 19.5 16.4 12 21 12 21z";

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill st-${status}`}>{status}</span>;
}

export function CatDot({ cat }: { cat: string }) {
  return <span className="cdot" style={{ background: catColor(cat) }} />;
}

export function CatTag({ cat }: { cat: string }) {
  return (
    <span className="tag">
      <CatDot cat={cat} />
      {cat}
    </span>
  );
}

export function Hearts({ value }: { value: number }) {
  return (
    <span className="hearts" aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i <= value ? "on" : ""}>
          <path d={HEART_PATH} />
        </svg>
      ))}
    </span>
  );
}

/** Progress bar. Width changes animate because React keeps the same element. */
export function Meter({ value, tone = "green" }: { value: number; tone?: "green" | "rose" | "p1" | "p2" | "over" }) {
  return (
    <div className={`meter ${tone}`}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Counts up/down smoothly to the new value. */
export function AnimatedNumber({ value, format = peso }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    if (reducedMotion() || start === value) { setShown(value); from.current = value; return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 550);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(start + (value - start) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value]);
  return <>{format(shown)}</>;
}

export function Chips<T extends string>({ options, value, onChange, label }: {
  options: { key: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.key} className="chip" aria-pressed={value === o.key} onClick={() => onChange(o.key)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button key={o.key} type="button" data-k={o.key} aria-pressed={value === o.key} onClick={() => onChange(o.key)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card empty">{children}</div>;
}

export const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
export const CheckIcon = () => (
  <svg className="check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
