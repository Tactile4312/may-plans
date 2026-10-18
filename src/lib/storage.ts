// Small wrappers around localStorage that never throw (private browsing can block it).
export function readLocal<T>(key: string): T | null {
  try {
    const t = localStorage.getItem(key);
    return t ? (JSON.parse(t) as T) : null;
  } catch {
    return null;
  }
}
export function writeLocal(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function removeLocal(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
