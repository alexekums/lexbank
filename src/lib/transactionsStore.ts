import { useSyncExternalStore } from "react";
import { mockTransactions, type Transaction } from "@/lib/mockData";

let transactions: Transaction[] = mockTransactions.map((t) => ({ ...t }));
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => transactions;

export const useTransactions = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const transactionsActions = {
  add(transaction: Omit<Transaction, "id" | "date"> & { date?: string }) {
    const next: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      date: transaction.date ?? "Just now",
    };
    transactions = [next, ...transactions];
    emit();
    return next;
  },
};
