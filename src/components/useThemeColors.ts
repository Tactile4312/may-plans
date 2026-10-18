import { useEffect, useState } from "react";

const NAMES = ["--ink", "--muted", "--line", "--rose", "--pink", "--blush", "--p1", "--p2", "--both", "--card"] as const;
type Colors = Record<(typeof NAMES)[number], string>;

function read(): Colors {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(NAMES.map((n) => [n, cs.getPropertyValue(n).trim()])) as Colors;
}

/** Chart libraries need real color values, so read the CSS theme colors and refresh when light/dark changes. */
export function useThemeColors(): Colors {
  const [colors, setColors] = useState<Colors>(read);
  useEffect(() => {
    const refresh = () => setColors(read());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", refresh);
    const mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { mq.removeEventListener("change", refresh); mo.disconnect(); };
  }, []);
  return colors;
}
