import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Repeat,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { formatNGN, formatUSD, initialForex, USD_NGN_RATE, type ForexPair } from "@/lib/mockData";
import { balancesActions, useBalances } from "@/lib/balancesStore";

export const Route = createFileRoute("/app/lextx")({
  head: () => ({ meta: [{ title: "LexTX — Trading & Crypto" }] }),
  component: LexTXPage,
});

function LexTXPage() {
  const balances = useBalances();
  const [pairs, setPairs] = useState<ForexPair[]>(initialForex);
  const [convertOpen, setConvertOpen] = useState<string | null>(null);
  const [tradeOpen, setTradeOpen] = useState<{ pair: string; side: "BUY" | "SELL" } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Live price ticks
  useEffect(() => {
    const id = setInterval(() => {
      setPairs((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.5) * (p.bid * 0.0008);
          const decimals = p.pair.includes("NGN") ? 2 : 4;
          const newBid = +(p.bid + drift).toFixed(decimals);
          const newAsk = +(newBid + (p.ask - p.bid)).toFixed(decimals);
          return { ...p, bid: newBid, ask: newAsk, change: +(p.change + (Math.random() - 0.5) * 0.05).toFixed(2) };
        }),
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Mark-to-market open positions
  useEffect(() => {
    const prices = Object.fromEntries(pairs.map((p) => [p.pair, (p.bid + p.ask) / 2]));
    balancesActions.tickPositions(prices);
  }, [pairs]);

  const cryptoTotalUsd = useMemo(
    () => balances.crypto.reduce((s, c) => s + c.amount * c.priceUsd, 0),
    [balances.crypto],
  );
  const openPnlNgn = useMemo(
    () =>
      balances.positions.reduce(
        (s, p) => s + (p.pair.endsWith("NGN") ? p.pnl : p.pnl * USD_NGN_RATE),
        0,
      ),
    [balances.positions],
  );

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 1700);
  };

  const handleConvert = (symbol: string, amount: number) => {
    const ngn = balancesActions.convertCryptoToNgn(symbol, amount, USD_NGN_RATE);
    setConvertOpen(null);
    if (ngn > 0) {
      flashSuccess(`Converted to ${formatNGN(ngn)}`);
      toast.success("Crypto converted", { description: `+${formatNGN(ngn)} added to your Naira balance` });
    }
  };

  const handleOpenTrade = (lots: number) => {
    if (!tradeOpen) return;
    const pair = pairs.find((p) => p.pair === tradeOpen.pair);
    if (!pair) return;
    const entry = tradeOpen.side === "BUY" ? pair.ask : pair.bid;
    balancesActions.openPosition(tradeOpen.pair, tradeOpen.side, lots, entry);
    toast.success(`${tradeOpen.side} ${tradeOpen.pair}`, { description: `${lots} lots @ ${entry}` });
    setTradeOpen(null);
  };

  const handleClosePosition = (id: string) => {
    const ngn = balancesActions.closePosition(id, USD_NGN_RATE);
    if (ngn > 0) {
      flashSuccess(`+${formatNGN(ngn)} to LexBank`);
      toast.success("Position closed", { description: `${formatNGN(ngn)} sent to your Naira balance` });
    } else {
      toast("Position closed");
    }
  };

  const handleWithdrawProfit = () => {
    const ngn = balancesActions.withdrawTradingPnl(USD_NGN_RATE);
    if (ngn <= 0) {
      toast.error("No open profit to withdraw");
      return;
    }
    flashSuccess(`+${formatNGN(ngn)} withdrawn`);
    toast.success("Profit withdrawn", { description: `${formatNGN(ngn)} added to your LexBank Naira balance` });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gradient-to-b from-[#1a0608] via-[#240a0e] to-[#1a0608] text-white">
      {/* Header */}
      <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#3a0810] via-[#7a0d1c] to-[#ff4b4b] px-5 pb-7 pt-10 shadow-[0_20px_60px_-20px_rgba(255,75,75,0.6)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff4b4b]/40 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">LexTX</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Trading Hub</h1>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold ring-1 ring-white/30 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" />
            Live market
          </span>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/10 backdrop-blur">
            <p className="text-[10px] uppercase tracking-wider text-white/60">Crypto wallet</p>
            <p className="mt-1 text-lg font-bold">{formatUSD(cryptoTotalUsd)}</p>
          </div>
          <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/10 backdrop-blur">
            <p className="text-[10px] uppercase tracking-wider text-white/60">Open P&L</p>
            <motion.p
              key={Math.round(openPnlNgn)}
              initial={{ scale: 0.96, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-1 text-lg font-bold ${openPnlNgn >= 0 ? "text-emerald-300" : "text-rose-300"}`}
            >
              {openPnlNgn >= 0 ? "+" : ""}
              {formatNGN(openPnlNgn)}
            </motion.p>
          </div>
        </div>

        <button
          onClick={handleWithdrawProfit}
          className="btn-shine relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4b4b] to-[#ff7878] text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(255,75,75,0.8)] ring-1 ring-white/30 transition active:scale-[0.98]"
        >
          <Zap className="h-4 w-4" /> Withdraw profit to LexBank
        </button>
      </header>

      {/* Crypto wallet */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-white">Crypto wallet</h2>
          <span className="text-[11px] text-white/50">BTC · ETH · USDT</span>
        </div>
        <ul className="space-y-2">
          {balances.crypto.map((c) => (
            <li
              key={c.symbol}
              className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-xs font-black text-amber-200 ring-1 ring-amber-300/20">
                  {c.symbol}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] text-white/50">
                    {c.amount.toFixed(c.symbol === "USDT" ? 2 : 4)} {c.symbol} · {formatUSD(c.priceUsd)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatUSD(c.amount * c.priceUsd)}</p>
                  <p className={`text-[11px] font-semibold ${c.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {c.change24h >= 0 ? "+" : ""}
                    {c.change24h}%
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <CryptoBtn icon={Send} label="Send" onClick={() => toast("Send flow coming soon")} />
                <CryptoBtn icon={ArrowDownLeft} label="Receive" onClick={() => toast("Receive address copied")} />
                <CryptoBtn
                  icon={Repeat}
                  label="To Naira"
                  primary
                  onClick={() => setConvertOpen(c.symbol)}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Forex Terminal */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Forex terminal</h2>
          <span className="text-[11px] text-white/50">Streaming · 1.8s</span>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur">
          {pairs.map((p, i) => (
            <div
              key={p.pair}
              className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight">{p.pair}</p>
                <p className={`text-[11px] font-semibold ${p.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {p.change >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}{" "}
                  {p.change >= 0 ? "+" : ""}
                  {p.change.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <motion.p
                  key={p.bid}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-white/50"
                >
                  Bid <span className="font-mono font-semibold text-white">{p.bid}</span>
                </motion.p>
                <p className="text-[11px] text-white/50">
                  Ask <span className="font-mono font-semibold text-white">{p.ask}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setTradeOpen({ pair: p.pair, side: "BUY" })}
                  className="rounded-md bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] ring-1 ring-emerald-300/40 transition hover:bg-emerald-400 active:scale-95"
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeOpen({ pair: p.pair, side: "SELL" })}
                  className="rounded-md bg-rose-500 px-3 py-1 text-[10px] font-black text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] ring-1 ring-rose-300/40 transition hover:bg-rose-400 active:scale-95"
                >
                  SELL
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open positions */}
      <section className="px-5 pb-8 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Open positions</h2>
          <span className="text-[11px] text-white/50">{balances.positions.length} active</span>
        </div>
        {balances.positions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
            <Wallet className="mx-auto h-6 w-6 text-white/40" />
            <p className="mt-2 text-xs text-white/60">No open trades. Tap BUY or SELL above to start.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {balances.positions.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 backdrop-blur"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
                    p.side === "BUY"
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                      : "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                  }`}
                >
                  {p.side === "BUY" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {p.pair} · {p.side}
                  </p>
                  <p className="text-[11px] text-white/50">
                    {p.lots} lots @ {p.entry}
                  </p>
                </div>
                <div className="text-right">
                  <motion.p
                    key={Math.round(p.pnl)}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm font-bold ${p.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                  >
                    {p.pnl >= 0 ? "+" : ""}
                    {p.pair.endsWith("NGN") ? formatNGN(p.pnl) : formatUSD(p.pnl)}
                  </motion.p>
                  <button
                    onClick={() => handleClosePosition(p.id)}
                    className="mt-1 text-[10px] font-bold text-white/70 underline-offset-2 hover:underline"
                  >
                    Close
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Convert sheet */}
      <AnimatePresence>
        {convertOpen && (
          <ConvertSheet
            symbol={convertOpen}
            holding={balances.crypto.find((c) => c.symbol === convertOpen)!}
            onClose={() => setConvertOpen(null)}
            onConfirm={handleConvert}
          />
        )}
      </AnimatePresence>

      {/* Trade sheet */}
      <AnimatePresence>
        {tradeOpen && (
          <TradeSheet
            pair={pairs.find((p) => p.pair === tradeOpen.pair)!}
            side={tradeOpen.side}
            onClose={() => setTradeOpen(null)}
            onConfirm={handleOpenTrade}
          />
        )}
      </AnimatePresence>

      {/* Success splash */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSuccess(null)}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-7 text-center text-foreground shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 14 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.6)]"
              >
                <CheckCircle2 className="h-9 w-9" />
              </motion.div>
              <p className="text-sm font-bold">{success}</p>
              <p className="text-[11px] text-muted-foreground">Updated in your LexBank Naira balance</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CryptoBtn({
  icon: Icon,
  label,
  primary,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition active:scale-95 ${
        primary
          ? "bg-gradient-to-r from-[#ff4b4b] to-[#ff7878] text-white shadow-[0_0_14px_rgba(255,75,75,0.55)] ring-1 ring-white/20"
          : "bg-white/5 text-white/80 ring-1 ring-white/10 hover:bg-white/10"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ConvertSheet({
  symbol,
  holding,
  onClose,
  onConfirm,
}: {
  symbol: string;
  holding: { amount: number; priceUsd: number; name: string };
  onClose: () => void;
  onConfirm: (symbol: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const numeric = parseFloat(amount) || 0;
  const ngn = numeric * holding.priceUsd * USD_NGN_RATE;
  const valid = numeric > 0 && numeric <= holding.amount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-5 text-foreground shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-rose-200" />
        <h3 className="text-base font-black">Convert {holding.name} → Naira</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Available: {holding.amount.toFixed(symbol === "USDT" ? 2 : 4)} {symbol}
        </p>
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Amount in {symbol}
          </label>
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-xl border-2 border-rose-100 bg-rose-50/40 px-4 py-3 text-lg font-bold outline-none transition focus:border-primary focus:bg-white focus:shadow-glow"
          />
          <div className="mt-2 flex gap-1.5">
            {[0.25, 0.5, 1].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(String(+(holding.amount * pct).toFixed(6)))}
                className="flex-1 rounded-md bg-rose-50 py-1 text-[11px] font-semibold text-primary"
              >
                {pct === 1 ? "Max" : `${pct * 100}%`}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-gradient-to-br from-rose-50 to-white p-3 ring-1 ring-rose-100">
          <p className="text-[11px] text-muted-foreground">You will receive</p>
          <p className="mt-0.5 text-2xl font-black text-primary">{formatNGN(ngn)}</p>
          <p className="text-[10px] text-muted-foreground">Rate: 1 USD ≈ ₦{USD_NGN_RATE.toFixed(2)}</p>
        </div>
        <button
          disabled={!valid}
          onClick={() => onConfirm(symbol, numeric)}
          className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-glow text-sm font-bold text-white shadow-card transition disabled:opacity-50"
        >
          Convert to Naira
        </button>
      </motion.div>
    </motion.div>
  );
}

function TradeSheet({
  pair,
  side,
  onClose,
  onConfirm,
}: {
  pair: ForexPair;
  side: "BUY" | "SELL";
  onClose: () => void;
  onConfirm: (lots: number) => void;
}) {
  const [lots, setLots] = useState("0.10");
  const [leverage, setLeverage] = useState(100);
  const numeric = parseFloat(lots) || 0;
  const price = side === "BUY" ? pair.ask : pair.bid;
  const valid = numeric > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-5 text-foreground shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-rose-200" />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black">
              {side} {pair.pair}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Live price: <span className="font-mono font-bold text-foreground">{price}</span>
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black text-white ${
              side === "BUY" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {side}
          </span>
        </div>
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Lot size
          </label>
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-rose-100 bg-rose-50/40 px-4 py-3 text-lg font-bold outline-none transition focus:border-primary focus:bg-white focus:shadow-glow"
          />
          <div className="mt-2 flex gap-1.5">
            {[0.01, 0.1, 0.5, 1].map((v) => (
              <button
                key={v}
                onClick={() => setLots(v.toFixed(2))}
                className="flex-1 rounded-md bg-rose-50 py-1 text-[11px] font-semibold text-primary"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Leverage
          </label>
          <div className="mt-1 flex gap-1.5">
            {[1, 50, 100, 500].map((l) => (
              <button
                key={l}
                onClick={() => setLeverage(l)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  leverage === l
                    ? "bg-gradient-to-r from-primary to-primary-glow text-white shadow-card"
                    : "bg-rose-50 text-primary"
                }`}
              >
                ×{l}
              </button>
            ))}
          </div>
        </div>
        <button
          disabled={!valid}
          onClick={() => onConfirm(numeric)}
          className={`btn-shine mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white shadow-card transition disabled:opacity-50 ${
            side === "BUY"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
              : "bg-gradient-to-r from-rose-500 to-rose-600"
          }`}
        >
          Open {side} · {numeric.toFixed(2)} lots
        </button>
      </motion.div>
    </motion.div>
  );
}