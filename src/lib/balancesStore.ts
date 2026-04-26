import { useSyncExternalStore } from "react";
import { mockBalances, mockCrypto, mockPositions, type CryptoHolding, type OpenPosition } from "@/lib/mockData";

export type DomCurrency = "USD" | "GBP" | "EUR";

export const DOM_ACCOUNTS: Record<DomCurrency, { number: string; bank: string; swift: string }> = {
  USD: { number: "8021045210", bank: "LexBank Domiciliary", swift: "LEXBNGLA" },
  GBP: { number: "8021045220", bank: "LexBank Domiciliary", swift: "LEXBGB22" },
  EUR: { number: "8021045230", bank: "LexBank Domiciliary", swift: "LEXBDEFF" },
};

// NGN per 1 unit foreign currency (mock realistic rates)
export const DOM_RATES: Record<DomCurrency, number> = {
  USD: 1650,
  GBP: 2080,
  EUR: 1780,
};

type State = {
  ngn: number;
  usd: number;
  dom: Record<DomCurrency, number>;
  tradingNgn: number;
  crypto: CryptoHolding[];
  positions: OpenPosition[];
  closedPositions: OpenPosition[];
};

let state: State = {
  ngn: mockBalances.ngn,
  usd: mockBalances.usd,
  dom: { USD: 1240.55, GBP: 480.2, EUR: 612.9 },
  tradingNgn: mockBalances.tradingNgn,
  crypto: mockCrypto.map((c) => ({ ...c })),
  positions: mockPositions.map((p) => ({ ...p })),
  closedPositions: [],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export const useBalances = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const balancesActions = {
  addNgn(delta: number) {
    state = { ...state, ngn: Math.max(0, state.ngn + delta) };
    emit();
  },
  addDom(currency: DomCurrency, delta: number) {
    state = { ...state, dom: { ...state.dom, [currency]: Math.max(0, state.dom[currency] + delta) } };
    emit();
  },
  exchange(from: "NGN" | DomCurrency, to: "NGN" | DomCurrency, amount: number) {
    if (from === to || amount <= 0) return 0;
    // Convert "from" amount into NGN first, then NGN into "to"
    const fromNgn = from === "NGN" ? amount : amount * DOM_RATES[from];
    if (from === "NGN") {
      if (state.ngn < amount) return 0;
    } else {
      if (state.dom[from] < amount) return 0;
    }
    const toAmount = to === "NGN" ? fromNgn : fromNgn / DOM_RATES[to];
    const nextDom = { ...state.dom };
    let nextNgn = state.ngn;
    if (from === "NGN") nextNgn -= amount; else nextDom[from] -= amount;
    if (to === "NGN") nextNgn += toAmount; else nextDom[to] += toAmount;
    state = { ...state, ngn: nextNgn, dom: nextDom };
    emit();
    return toAmount;
  },
  moveToTrading(amount: number) {
    const value = Math.min(Math.max(0, amount), state.ngn);
    if (value <= 0) return 0;
    state = { ...state, ngn: state.ngn - value, tradingNgn: state.tradingNgn + value };
    emit();
    return value;
  },
  withdrawTradingBalance(amount: number) {
    const value = Math.min(Math.max(0, amount), state.tradingNgn);
    if (value <= 0) return 0;
    state = { ...state, ngn: state.ngn + value, tradingNgn: state.tradingNgn - value };
    emit();
    return value;
  },
  convertCryptoToNgn(symbol: string, cryptoAmount: number, rateUsdNgn: number) {
    const holding = state.crypto.find((c) => c.symbol === symbol);
    if (!holding) return 0;
    const amount = Math.min(cryptoAmount, holding.amount);
    const ngnGained = amount * holding.priceUsd * rateUsdNgn;
    state = {
      ...state,
      ngn: state.ngn + ngnGained,
      crypto: state.crypto.map((c) => (c.symbol === symbol ? { ...c, amount: +(c.amount - amount).toFixed(6) } : c)),
    };
    emit();
    return ngnGained;
  },
  openPosition(pair: string, side: "BUY" | "SELL", lots: number, entry: number, leverage: number, marginNgn: number) {
    const margin = Math.min(Math.max(0, marginNgn), state.tradingNgn);
    if (margin <= 0) return false;
    const pos: OpenPosition = {
      id: `p_${Date.now()}`,
      pair,
      side,
      lots,
      entry,
      leverage,
      marginNgn: margin,
      pnl: 0,
    };
    state = { ...state, tradingNgn: state.tradingNgn - margin, positions: [pos, ...state.positions] };
    emit();
    return true;
  },
  closePosition(id: string, rateUsdNgn: number) {
    const pos = state.positions.find((p) => p.id === id);
    if (!pos) return 0;
    const pnlNgn = pos.pair.endsWith("NGN") ? pos.pnl : pos.pnl * rateUsdNgn;
    const returnedToTrading = Math.max(0, pos.marginNgn + pnlNgn);
    state = {
      ...state,
      tradingNgn: state.tradingNgn + returnedToTrading,
      positions: state.positions.filter((p) => p.id !== id),
      closedPositions: [{ ...pos, pnl: +pos.pnl.toFixed(2) }, ...state.closedPositions],
    };
    emit();
    return returnedToTrading;
  },
  tickPositions(prices: Record<string, number>) {
    state = {
      ...state,
      positions: state.positions.map((p) => {
        const price = prices[p.pair];
        if (!price) return p;
        const direction = p.side === "BUY" ? 1 : -1;
        // Lot size 100,000 units; PnL in quote currency
        const pnl = +((price - p.entry) * direction * p.lots * 100000).toFixed(2);
        return { ...p, pnl };
      }),
    };
    emit();
  },
};