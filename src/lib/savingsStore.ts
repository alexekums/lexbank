import { useSyncExternalStore } from "react";

export type SavingsGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  icon?: string;
};

let goals: SavingsGoal[] = [
  { id: "g1", name: "New Phone", target: 850000, saved: 325000, deadline: "Aug 2026", icon: "📱" },
  { id: "g2", name: "Wedding", target: 3500000, saved: 920000, deadline: "Dec 2026", icon: "💍" },
  { id: "g3", name: "Emergency Fund", target: 1000000, saved: 480000, deadline: "Jun 2026", icon: "🛡️" },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => goals;

export const useSavings = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const savingsActions = {
  create(input: Omit<SavingsGoal, "id" | "saved"> & { saved?: number }) {
    const next: SavingsGoal = {
      id: `g_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      saved: input.saved ?? 0,
      ...input,
    };
    goals = [next, ...goals];
    emit();
    return next;
  },
  contribute(id: string, amount: number) {
    goals = goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g));
    emit();
  },
  update(id: string, patch: Partial<Omit<SavingsGoal, "id">>) {
    goals = goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
    emit();
  },
  remove(id: string) {
    goals = goals.filter((g) => g.id !== id);
    emit();
  },
  get(id: string) {
    return goals.find((g) => g.id === id);
  },
};