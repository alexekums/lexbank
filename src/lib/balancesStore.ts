import { useSyncExternalStore } from "react";
import { mockBalances, mockCrypto, mockPositions, type CryptoHolding, type OpenPosition } from "@/lib/mockData";

type State = {
  ngn: number;
  usd: number;
  crypto: CryptoHolding[];
  positions: OpenPosition[];
};

let state: State = {
  ngn: mockBalances.ngn,
  usd: mockBalances.usd,
  crypto: mockCrypto.map((c) => ({ ...c })),
  positions: mockPositions.map((p) => ({ ...p })),
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
  withdrawTradingPnl(rateUsdNgn: number) {
    // Sum positive P&L (NGN-denominated for NGN pairs, USD otherwise) → convert to NGN
    let totalNgn = 0;
    state.positions.forEach((p) => {
      if (p.pnl > 0) {
        totalNgn += p.pair.endsWith("NGN") ? p.pnl : p.pnl * rateUsdNgn;
      }
    });
    if (totalNgn <= 0) return 0;
    state = {
      ...state,
      ngn: state.ngn + totalNgn,
      positions: state.positions.map((p) => (p.pnl > 0 ? { ...p, pnl: 0 } : p)),
    };
    emit();
    return totalNgn;
  },
  openPosition(pair: string, side: "BUY" | "SELL", lots: number, entry: number) {
    const pos: OpenPosition = {
      id: `p_${Date.now()}`,
      pair,
      side,
      lots,
      entry,
      pnl: 0,
    };
    state = { ...state, positions: [pos, ...state.positions] };
    emit();
  },
  closePosition(id: string, rateUsdNgn: number) {
    const pos = state.positions.find((p) => p.id === id);
    if (!pos) return 0;
    const ngnGained = pos.pnl > 0 ? (pos.pair.endsWith("NGN") ? pos.pnl : pos.pnl * rateUsdNgn) : 0;
    state = {
      ...state,
      ngn: state.ngn + ngnGained,
      positions: state.positions.filter((p) => p.id !== id),
    };
    emit();
    return ngnGained;
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