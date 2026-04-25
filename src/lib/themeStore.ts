import { useSyncExternalStore } from "react";

const KEY = "lex_theme";
type Theme = "light" | "dark";

const getInitial = (): Theme => {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light";
};

let theme: Theme = getInitial();
const listeners = new Set<() => void>();

const apply = (t: Theme) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", t === "dark");
  }
};
apply(theme);

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => theme;
const getServerSnapshot = () => "light" as Theme;

export const useTheme = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export const themeActions = {
  set(t: Theme) {
    theme = t;
    try { localStorage.setItem(KEY, t); } catch {}
    apply(t);
    listeners.forEach((l) => l());
  },
  toggle() {
    this.set(theme === "dark" ? "light" : "dark");
  },
};
