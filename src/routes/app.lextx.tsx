import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatNGN, formatUSD, initialForex, mockCrypto, mockPositions, type ForexPair } from "@/lib/mockData";

export const Route = createFileRoute("/app/lextx")({
  head: () => ({ meta: [{ title: "LexTX — Trading & Crypto" }] }),
  component: LexTXPage,
});

function LexTXPage() {
  const [pairs, setPairs] = useState<ForexPair[]>(initialForex);

  // Simulate live price ticks
  useEffect(() => {
    const id = setInterval(() => {
      setPairs((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.5) * (p.bid * 0.0008);
          const newBid = +(p.bid + drift).toFixed(p.pair.includes("NGN") ? 2 : 4);
          const newAsk = +(newBid + (p.ask - p.bid)).toFixed(p.pair.includes("NGN") ? 2 : 4);
          return { ...p, bid: newBid, ask: newAsk, change: +(p.change + (Math.random() - 0.5) * 0.05).toFixed(2) };
        }),
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const cryptoTotal = mockCrypto.reduce((s, c) => s + c.amount * c.priceUsd, 0);

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-to-br from-rose-700 via-primary to-primary-glow px-5 pb-7 pt-10 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">LexTX</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Trading Hub</h1>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold ring-1 ring-white/30">
            <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-emerald-300" /> Live
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
            <p className="text-[10px] uppercase tracking-wider text-white/70">Crypto wallet</p>
            <p className="mt-1 text-lg font-bold">{formatUSD(cryptoTotal)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
            <p className="text-[10px] uppercase tracking-wider text-white/70">Open P&L</p>
            <p className="mt-1 text-lg font-bold text-emerald-300">+{formatNGN(20955)}</p>
          </div>
        </div>

        <button className="btn-shine mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-primary shadow-card transition active:scale-[0.98]">
          <Wallet className="h-4 w-4" /> Fund from LexBank Naira
        </button>
      </header>

      {/* Crypto holdings */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Crypto holdings</h2>
        <ul className="space-y-2">
          {mockCrypto.map((c) => (
            <li
              key={c.symbol}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-rose-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-sm font-black text-amber-600">
                {c.symbol}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {c.amount} {c.symbol} · {formatUSD(c.priceUsd)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatUSD(c.amount * c.priceUsd)}</p>
                <p
                  className={`text-[11px] font-semibold ${
                    c.change24h >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {c.change24h >= 0 ? "+" : ""}
                  {c.change24h}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Forex Terminal */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Forex terminal</h2>
          <span className="text-[11px] text-muted-foreground">Updated live</span>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-rose-100">
          {pairs.map((p, i) => (
            <div
              key={p.pair}
              className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-rose-50" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight">{p.pair}</p>
                <p className={`text-[11px] font-semibold ${p.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {p.change >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}{" "}
                  {p.change >= 0 ? "+" : ""}
                  {p.change.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <motion.p key={p.bid} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground">
                  Bid <span className="font-mono font-semibold text-foreground">{p.bid}</span>
                </motion.p>
                <p className="text-xs text-muted-foreground">
                  Ask <span className="font-mono font-semibold text-foreground">{p.ask}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button className="rounded-md bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition active:scale-95">
                  BUY
                </button>
                <button className="rounded-md bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition active:scale-95">
                  SELL
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open positions */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Open positions</h2>
        <ul className="space-y-2">
          {mockPositions.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-rose-100">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  p.side === "BUY" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}
              >
                {p.side === "BUY" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {p.pair} · {p.side}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {p.lots} lots @ {p.entry}
                </p>
              </div>
              <p className={`text-sm font-bold ${p.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {p.pnl >= 0 ? "+" : ""}
                {p.pair.endsWith("NGN") ? formatNGN(p.pnl) : formatUSD(p.pnl)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}