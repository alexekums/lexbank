import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Copy,
  DraftingCompass,
  Layers,
  MessageCircle,
  MoveDiagonal,
  QrCode,
  Repeat,
  Square,
  Send,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatNGN, formatUSD, initialForex, USD_NGN_RATE, type ForexPair } from "@/lib/mockData";
import { balancesActions, useBalances } from "@/lib/balancesStore";

export const Route = createFileRoute("/app/lextx")({
  head: () => ({ meta: [{ title: "LexTX — Trading & Crypto" }] }),
  component: LexTXPage,
});

type Tab = "crypto" | "forex" | "investments" | "open" | "closed";
type TradeTicket = { pair: ForexPair; side: "BUY" | "SELL" };
type InvestmentProduct = { name: string; returns: string; note: string; rate: number; risk: "Low" | "Medium" | "High" };

function LexTXPage() {
  const balances = useBalances();
  const [pairs, setPairs] = useState<ForexPair[]>(initialForex);
  const [tab, setTab] = useState<Tab>("crypto");
  const [convertOpen, setConvertOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState<"fund" | "withdraw" | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [investing, setInvesting] = useState<InvestmentProduct | null>(null);
  const [tradeTicket, setTradeTicket] = useState<TradeTicket | null>(null);
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPairs((prev) =>
        prev.map((p) => {
          const drift = (Math.random() - 0.5) * (p.bid * 0.0008);
          const decimals = p.pair.includes("NGN") ? 2 : 4;
          const bid = +(p.bid + drift).toFixed(decimals);
          const ask = +(bid + (p.ask - p.bid)).toFixed(decimals);
          return { ...p, bid, ask, change: +(p.change + (Math.random() - 0.5) * 0.05).toFixed(2) };
        }),
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    balancesActions.tickPositions(Object.fromEntries(pairs.map((p) => [p.pair, (p.bid + p.ask) / 2])));
  }, [pairs]);

  const cryptoTotalUsd = useMemo(() => balances.crypto.reduce((s, c) => s + c.amount * c.priceUsd, 0), [balances.crypto]);
  const openPnlNgn = useMemo(
    () => balances.positions.reduce((s, p) => s + (p.pair.endsWith("NGN") ? p.pnl : p.pnl * USD_NGN_RATE), 0),
    [balances.positions],
  );

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 1700);
  };

  const handleConvert = (symbol: string, amount: number) => {
    const ngn = balancesActions.convertCryptoToNgn(symbol, amount, USD_NGN_RATE);
    setConvertOpen(false);
    if (ngn > 0) {
      flashSuccess(`Converted ${formatNGN(ngn)}`);
      toast.success("Crypto converted", { description: `Added to your Spend Balance` });
    }
  };

  const handleFundTransfer = (mode: "fund" | "withdraw", amount: number) => {
    const moved = mode === "fund" ? balancesActions.moveToTrading(amount) : balancesActions.withdrawTradingBalance(amount);
    setFundOpen(null);
    if (moved <= 0) return toast.error(mode === "fund" ? "Insufficient Spend Balance" : "Insufficient Trading Balance");
    flashSuccess(mode === "fund" ? `${formatNGN(moved)} moved to Trading` : `${formatNGN(moved)} withdrawn`);
    toast.success(mode === "fund" ? "Trading Balance funded" : "Withdrawn to Spend Balance");
  };

  const handleOpenTrade = (lots: number, leverage: number, marginNgn: number) => {
    if (!tradeTicket) return;
    const entry = tradeTicket.side === "BUY" ? tradeTicket.pair.ask : tradeTicket.pair.bid;
    const opened = balancesActions.openPosition(tradeTicket.pair.pair, tradeTicket.side, lots, entry, leverage, marginNgn);
    if (!opened) return toast.error("Fund Trading Balance first");
    setTradeTicket(null);
    setTab("open");
    toast.success(`${tradeTicket.side} ${tradeTicket.pair.pair}`, { description: `${lots} lots opened from Trading Balance` });
  };

  const handleClosePosition = (id: string) => {
    const returned = balancesActions.closePosition(id, USD_NGN_RATE);
    flashSuccess(`${formatNGN(returned)} returned to Trading`);
    toast.success("Position closed", { description: "Profit/loss settled in Trading Balance" });
  };

  if (selectedPair) {
    const livePair = pairs.find((p) => p.pair === selectedPair.pair) ?? selectedPair;
    return <TradingScreen pair={livePair} onBack={() => setSelectedPair(null)} onTrade={(side) => setTradeTicket({ pair: livePair, side })} />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gradient-to-b from-red-950 via-red-950 to-stone-950 pb-8 text-white">
      <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-red-950 via-red-900 to-primary px-5 pb-6 pt-10 shadow-[0_20px_60px_-20px_rgba(255,75,75,0.6)]">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">LexTX</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Crypto & Forex</h1>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold ring-1 ring-white/25">Live</span>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <BalanceCard label="Spend Balance" value={formatNGN(balances.ngn)} />
          <BalanceCard label="Trading Balance" value={formatNGN(balances.tradingNgn)} hot />
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setFundOpen("fund")} className="btn-shine h-11 rounded-xl bg-white text-sm font-black text-primary shadow-card">Fund Trading</button>
          <button onClick={() => setFundOpen("withdraw")} className="h-11 rounded-xl bg-white/10 text-sm font-bold text-white ring-1 ring-white/20">Withdraw</button>
        </div>
        <button onClick={() => setDepositOpen(true)} className="btn-shine relative mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-primary text-sm font-black text-white shadow-[0_0_18px_rgba(255,75,75,0.6)]">
          <ArrowDownLeft className="h-4 w-4" />Deposit to Crypto Wallet
        </button>
      </header>

      <div className="sticky top-0 z-20 bg-red-950/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex snap-x gap-2 overflow-x-auto rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
          {([
            ["crypto", "Crypto"],
            ["forex", "Forex"],
            ["investments", "Investments"],
            ["open", "Open Positions"],
            ["closed", "Closed Positions"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`snap-start whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition ${tab === value ? "bg-white text-primary shadow-card" : "text-white/60"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 pt-3">
        {tab === "crypto" && <CryptoPanel cryptoTotalUsd={cryptoTotalUsd} onConvert={() => setConvertOpen(true)} />}
        {tab === "forex" && <ForexPanel pairs={pairs} onPair={setSelectedPair} onTrade={(pair, side) => setTradeTicket({ pair, side })} />}
        {tab === "investments" && <InvestmentsPanel onInvest={setInvesting} />}
        {tab === "open" && <PositionsPanel positions={balances.positions} empty="No open trades yet." onClose={handleClosePosition} />}
        {tab === "closed" && <PositionsPanel positions={balances.closedPositions} empty="Closed trades will appear here." closed />}
        <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <p className="text-[11px] uppercase tracking-wider text-white/50">Open P&L</p>
          <p className={`mt-1 text-xl font-black ${openPnlNgn >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{openPnlNgn >= 0 ? "+" : ""}{formatNGN(openPnlNgn)}</p>
          <p className="mt-1 text-xs text-white/50">Profits settle into Trading Balance when positions close.</p>
        </div>
      </main>

      <AnimatePresence>{convertOpen && <ConvertSheet holdings={balances.crypto} onClose={() => setConvertOpen(false)} onConfirm={handleConvert} />}</AnimatePresence>
      <AnimatePresence>{fundOpen && <FundsSheet mode={fundOpen} max={fundOpen === "fund" ? balances.ngn : balances.tradingNgn} onClose={() => setFundOpen(null)} onConfirm={(amount) => handleFundTransfer(fundOpen, amount)} />}</AnimatePresence>
      <AnimatePresence>{depositOpen && <DepositSheet holdings={balances.crypto} onClose={() => setDepositOpen(false)} onConfirm={() => { setDepositOpen(false); flashSuccess("Crypto deposit confirmed"); }} />}</AnimatePresence>
      <AnimatePresence>{investing && <InvestmentSheet product={investing} max={balances.ngn} onClose={() => setInvesting(null)} onConfirm={(amount, days) => { setInvesting(null); flashSuccess(`Invested ${formatNGN(amount)} for ${days}d`); toast.success(`${investing.name} confirmed`, { description: `Reference INV-${Date.now().toString().slice(-6)}` }); }} />}</AnimatePresence>
      <AnimatePresence>{tradeTicket && <TradeSheet ticket={tradeTicket} tradingBalance={balances.tradingNgn} onClose={() => setTradeTicket(null)} onConfirm={handleOpenTrade} />}</AnimatePresence>
      <SuccessOverlay success={success} onClose={() => setSuccess(null)} />
    </div>
  );
}

function BalanceCard({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return <div className={`rounded-2xl p-3 ring-1 backdrop-blur ${hot ? "bg-primary/20 ring-white/20" : "bg-black/25 ring-white/10"}`}><p className="text-[10px] uppercase tracking-wider text-white/60">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
}

function CryptoPanel({ cryptoTotalUsd, onConvert }: { cryptoTotalUsd: number; onConvert: () => void }) {
  const balances = useBalances();
  return <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-base font-black">Crypto Wallet</h2><p className="text-xs text-white/50">Total value {formatUSD(cryptoTotalUsd)}</p></div><button onClick={onConvert} className="btn-shine rounded-xl bg-gradient-primary px-3 py-2 text-xs font-black shadow-[0_0_18px_rgba(255,75,75,0.55)]"><Repeat className="mr-1 inline h-3.5 w-3.5" />Convert to Naira</button></div><ul className="space-y-2">{balances.crypto.map((c) => <li key={c.symbol} className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white ring-1 ring-white/15">{c.symbol}</span><div className="flex-1"><p className="text-sm font-bold">{c.name}</p><p className="text-[11px] text-white/50">{c.amount.toFixed(c.symbol === "USDT" ? 2 : 4)} {c.symbol} · {formatUSD(c.priceUsd)}</p></div><div className="text-right"><p className="text-sm font-black">{formatUSD(c.amount * c.priceUsd)}</p><p className={c.change24h >= 0 ? "text-xs font-bold text-emerald-300" : "text-xs font-bold text-rose-300"}>{c.change24h >= 0 ? "+" : ""}{c.change24h}%</p></div></div><div className="mt-3 grid grid-cols-2 gap-2"><CryptoBtn icon={Send} label="Send" onClick={() => toast("Send flow coming soon")} /><CryptoBtn icon={ArrowDownLeft} label="Receive" onClick={() => toast("Receive address copied")} /></div></li>)}</ul></section>;
}

function CryptoBtn({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-[11px] font-bold text-white/80 ring-1 ring-white/10 transition active:scale-95"><Icon className="h-3.5 w-3.5" />{label}</button>;
}

function ForexPanel({ pairs, onPair, onTrade }: { pairs: ForexPair[]; onPair: (pair: ForexPair) => void; onTrade: (pair: ForexPair, side: "BUY" | "SELL") => void }) {
  return <section><div className="mb-3 flex items-end justify-between"><h2 className="text-base font-black">Forex Terminal</h2><p className="text-[11px] font-bold text-white/45">{pairs.length} tradable pairs</p></div><div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">{pairs.map((p, i) => <button key={p.pair} onClick={() => onPair(p)} className={`w-full px-4 py-3 text-left ${i ? "border-t border-white/5" : ""}`}><div className="flex items-center gap-3"><div className="flex-1"><p className="text-sm font-black">{p.pair.replace("/", "")}</p><p className={`text-[11px] font-bold ${p.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{p.change >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />} {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}% · {(p.pair.includes("JPY") ? 0.01 : 0.0001).toFixed(p.pair.includes("JPY") ? 2 : 4)} pip</p></div><div className="text-right"><p className="font-mono text-xs text-white/70">Bid {p.bid}</p><p className="font-mono text-xs text-white/40">Ask {p.ask}</p></div><div className="flex gap-1"><span onClick={(e) => { e.stopPropagation(); onTrade(p, "BUY"); }} className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-black shadow-[0_0_12px_rgba(16,185,129,0.65)]">BUY</span><span onClick={(e) => { e.stopPropagation(); onTrade(p, "SELL"); }} className="rounded-md bg-rose-500 px-2 py-1 text-[10px] font-black shadow-[0_0_12px_rgba(244,63,94,0.65)]">SELL</span></div></div></button>)}</div></section>;
}

function PositionsPanel({ positions, empty, closed, onClose }: { positions: ReturnType<typeof useBalances>["positions"]; empty: string; closed?: boolean; onClose?: (id: string) => void }) {
  if (!positions.length) return <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center"><Wallet className="mx-auto h-6 w-6 text-white/40" /><p className="mt-2 text-xs text-white/60">{empty}</p></div>;
  return <ul className="space-y-2">{positions.map((p) => <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${p.side === "BUY" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{p.side === "BUY" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}</span><div className="flex-1"><p className="text-sm font-bold">{p.pair} · {p.side}</p><p className="text-[11px] text-white/50">{p.lots} lots · margin {formatNGN(p.marginNgn)}</p></div><div className="text-right"><p className={`text-sm font-black ${p.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{p.pnl >= 0 ? "+" : ""}{p.pair.endsWith("NGN") ? formatNGN(p.pnl) : formatUSD(p.pnl)}</p>{!closed && <button onClick={() => onClose?.(p.id)} className="mt-1 text-[10px] font-bold text-white/70 underline">Close</button>}</div></li>)}</ul>;
}

function TradingScreen({ pair, onBack, onTrade }: { pair: ForexPair; onBack: () => void; onTrade: (side: "BUY" | "SELL") => void }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>(["Lexi: Momentum is forming near the session high. Watch support before entering."]);
  const submit = (e: FormEvent) => { e.preventDefault(); if (!note.trim()) return; setNotes((n) => [note.trim(), ...n]); setNote(""); };
  const mid = (pair.bid + pair.ask) / 2;
  const decimals = pair.pair.includes("NGN") ? 2 : 4;
  return <div className="mx-auto min-h-screen max-w-md bg-stone-950 text-white"><header className="flex items-center gap-3 px-4 pb-3 pt-10"><button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><ArrowLeft className="h-5 w-5" /></button><div className="flex-1"><h1 className="text-lg font-black">{pair.pair.replace("/", "")}</h1><p className="text-xs text-white/50">Pip · {(pair.pair.includes("JPY") ? 0.01 : 0.0001).toFixed(pair.pair.includes("JPY") ? 2 : 4)} · Volume 18.4K</p></div><div className="text-right"><p className="font-mono text-sm font-black text-emerald-300">{mid.toFixed(decimals)}</p><p className="text-[10px] text-white/45">Spread {(pair.ask - pair.bid).toFixed(decimals)}</p></div></header><section className="px-4"><div className="mb-2 flex gap-2 overflow-x-auto pb-1"><ToolPill icon={MoveDiagonal} label="Trendline" /><ToolPill icon={DraftingCompass} label="Fib" /><ToolPill icon={Square} label="Shapes" /><ToolPill icon={Circle} label="Zones" /><ToolPill icon={Layers} label="Volume" /></div><div className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-b from-red-950/40 to-black ring-1 ring-white/10"><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_28px]" /><svg viewBox="0 0 360 340" className="absolute inset-0 h-full w-full"><g opacity="0.35" stroke="rgb(255 255 255)">{[48,96,144,192,240].map((y) => <line key={y} x1="0" y1={y} x2="360" y2={y} strokeDasharray="4 8" />)}</g><g>{[22,46,70,94,118,142,166,190,214,238,262,286,310,334].map((x, i) => { const y = [174,148,162,120,134,88,104,70,82,50,66,42,58,34][i]; const h = [46,36,52,58,34,54,42,48,38,56,36,44,34,40][i]; const up = i % 4 !== 0; return <g key={x}><line x1={x + 6} y1={y - 18} x2={x + 6} y2={y + h + 18} stroke={up ? "rgb(52 211 153)" : "rgb(244 63 94)"} strokeWidth="1.5" /><rect x={x} y={y} width="12" height={h} rx="2" fill={up ? "rgb(52 211 153)" : "rgb(244 63 94)"} /></g>; })}</g><polyline points="0,220 34,196 68,204 102,152 136,164 170,112 204,128 238,86 272,101 310,58 360,70" fill="none" stroke="rgb(52 211 153)" strokeWidth="2.5" /><line x1="44" y1="228" x2="322" y2="62" stroke="rgb(255 75 75)" strokeWidth="2" strokeDasharray="7 7" /><g stroke="rgb(251 191 36)" strokeWidth="1.5" opacity="0.85"><line x1="62" y1="78" x2="310" y2="78" /><line x1="62" y1="126" x2="310" y2="126" /><line x1="62" y1="174" x2="310" y2="174" /></g><g opacity="0.72">{[18,42,66,90,114,138,162,186,210,234,258,282,306,330].map((x, i) => <rect key={x} x={x} y={292 - [28,18,32,24,42,36,26,45,34,52,30,46,38,55][i]} width="12" height={[28,18,32,24,42,36,26,45,34,52,30,46,38,55][i]} rx="2" fill="rgb(255 255 255 / 0.24)" />)}</g><rect x="76" y="88" width="76" height="54" rx="6" fill="none" stroke="rgb(248 113 113)" strokeDasharray="5 5" /></svg><div className="absolute right-2 top-4 space-y-9 text-right font-mono text-[10px] text-white/55"><p>{(mid * 1.002).toFixed(decimals)}</p><p>{(mid * 1.001).toFixed(decimals)}</p><p>{mid.toFixed(decimals)}</p><p>{(mid * 0.999).toFixed(decimals)}</p></div><div className="absolute left-3 top-3 rounded-xl bg-black/35 px-3 py-2 text-[10px] font-bold ring-1 ring-white/10">CANDLES · PIPS · VOLUME</div><div className="absolute bottom-16 left-3 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold"><MoveDiagonal className="mr-1 inline h-3 w-3" />Trendline</span><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold"><DraftingCompass className="mr-1 inline h-3 w-3" />Fib 38.2 / 61.8</span><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold">Price grid</span></div><div className="absolute bottom-3 left-3 right-3 grid grid-cols-2 gap-2"><button onClick={() => onTrade("BUY")} className="h-12 rounded-xl bg-emerald-500 text-sm font-black shadow-[0_0_20px_rgba(16,185,129,0.6)]">BUY {pair.ask}</button><button onClick={() => onTrade("SELL")} className="h-12 rounded-xl bg-rose-500 text-sm font-black shadow-[0_0_20px_rgba(244,63,94,0.6)]">SELL {pair.bid}</button></div></div></section><section className="px-4 py-5"><h2 className="mb-3 flex items-center gap-2 text-sm font-black"><MessageCircle className="h-4 w-4" />Chart chat & analysis</h2><form onSubmit={submit} className="flex gap-2"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a comment or trade idea…" className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-primary" /><button className="rounded-xl bg-gradient-primary px-4 text-sm font-black">Post</button></form><ul className="mt-3 space-y-2">{notes.map((n, i) => <li key={`${n}-${i}`} className="rounded-xl bg-white/[0.05] p-3 text-xs text-white/75 ring-1 ring-white/10">{n}</li>)}</ul></section></div>;
}

function ToolPill({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return <button className="flex flex-shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80 ring-1 ring-white/10"><Icon className="h-3.5 w-3.5" />{label}</button>;
}

function ConvertSheet({ holdings, onClose, onConfirm }: { holdings: ReturnType<typeof useBalances>["crypto"]; onClose: () => void; onConfirm: (symbol: string, amount: number) => void }) {
  const [symbol, setSymbol] = useState(holdings[0]?.symbol ?? "BTC");
  const [amount, setAmount] = useState("");
  const holding = holdings.find((c) => c.symbol === symbol) ?? holdings[0];
  const numeric = parseFloat(amount) || 0;
  const valid = holding && numeric > 0 && numeric <= holding.amount;
  const ngn = holding ? numeric * holding.priceUsd * USD_NGN_RATE : 0;
  return (
    <Sheet onClose={onClose}>
      <h3 className="text-base font-black text-foreground">Convert to Naira</h3>
      <p className="mt-1 text-xs text-muted-foreground">Choose crypto and enter the amount to convert.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {holdings.map((c) => (
          <button key={c.symbol} onClick={() => { setSymbol(c.symbol); setAmount(""); }} className={`rounded-xl py-2 text-xs font-black ${symbol === c.symbol ? "bg-gradient-primary text-primary-foreground shadow-card" : "bg-secondary text-primary"}`}>{c.symbol}</button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount in {symbol}</label>
        <button type="button" onClick={() => holding && setAmount(String(holding.amount))} className="rounded-lg bg-gradient-primary px-2.5 py-1 text-[10px] font-black text-primary-foreground shadow-card">All</button>
      </div>
      <input autoFocus type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none transition focus:border-primary focus:bg-card focus:shadow-glow" />
      <p className="mt-2 text-xs text-muted-foreground">Available: {holding?.amount.toFixed(symbol === "USDT" ? 2 : 4)} {symbol}</p>
      <div className="mt-4 rounded-xl bg-secondary p-3 ring-1 ring-border">
        <p className="text-[11px] text-muted-foreground">You receive</p>
        <p className="text-2xl font-black text-primary">{formatNGN(ngn)}</p>
      </div>
      <button disabled={!valid} onClick={() => onConfirm(symbol, numeric)} className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-50">Convert to Naira</button>
    </Sheet>
  );
}

function FundsSheet({ mode, max, onClose, onConfirm }: { mode: "fund" | "withdraw"; max: number; onClose: () => void; onConfirm: (amount: number) => void }) {
  const [amount, setAmount] = useState("");
  const numeric = parseFloat(amount) || 0;
  return <Sheet onClose={onClose}><h3 className="text-base font-black text-foreground">{mode === "fund" ? "Fund Trading Balance" : "Withdraw to Spend Balance"}</h3><p className="mt-1 text-xs text-muted-foreground">Available: {formatNGN(max)}</p><input autoFocus type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-4 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none transition focus:border-primary focus:bg-card focus:shadow-glow" /><div className="mt-3 grid grid-cols-4 gap-2">{[5000, 25000, 100000, max].map((preset, i) => <button type="button" key={i} onClick={() => setAmount(String(Math.floor(preset)))} className="rounded-xl bg-secondary px-2 py-2 text-[11px] font-black text-primary ring-1 ring-border">{i === 3 ? "Max" : formatNGN(preset).replace(".00", "")}</button>)}</div><button disabled={numeric <= 0 || numeric > max} onClick={() => onConfirm(numeric)} className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-50">Confirm</button></Sheet>;
}

function TradeSheet({ ticket, tradingBalance, onClose, onConfirm }: { ticket: TradeTicket; tradingBalance: number; onClose: () => void; onConfirm: (lots: number, leverage: number, marginNgn: number) => void }) {
  const [lots, setLots] = useState("0.10");
  const [leverage, setLeverage] = useState(100);
  const [margin, setMargin] = useState("25000");
  const numericLots = parseFloat(lots) || 0;
  const numericMargin = parseFloat(margin) || 0;
  const valid = numericLots > 0 && numericMargin > 0 && numericMargin <= tradingBalance;
  return <Sheet onClose={onClose}><h3 className="text-base font-black text-foreground">{ticket.side} {ticket.pair.pair}</h3><p className="mt-1 text-xs text-muted-foreground">Trades use Trading Balance only. Available: {formatNGN(tradingBalance)}</p><label className="mt-4 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lot size</label><input value={lots} onChange={(e) => setLots(e.target.value)} type="number" className="mt-1 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none focus:border-primary focus:bg-card" /><label className="mt-4 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Margin from Trading Balance</label><input value={margin} onChange={(e) => setMargin(e.target.value)} type="number" className="mt-1 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none focus:border-primary focus:bg-card" /><div className="mt-4 grid grid-cols-4 gap-2">{[1, 50, 100, 500].map((l) => <button key={l} onClick={() => setLeverage(l)} className={`rounded-lg py-2 text-xs font-black ${leverage === l ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-primary"}`}>×{l}</button>)}</div><button disabled={!valid} onClick={() => onConfirm(numericLots, leverage, numericMargin)} className={`mt-5 h-12 w-full rounded-xl text-sm font-black text-white shadow-card disabled:opacity-50 ${ticket.side === "BUY" ? "bg-emerald-500" : "bg-rose-500"}`}>Open {ticket.side}</button></Sheet>;
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm"><motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-5 text-foreground shadow-2xl ring-1 ring-border"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />{children}</motion.div></motion.div>;
}

const investmentProducts: InvestmentProduct[] = [
  { name: "Mutual Funds", returns: "15.8% p.a.", note: "Balanced naira fund", rate: 0.158, risk: "Medium" },
  { name: "Treasury Bills", returns: "18.2% p.a.", note: "Low-risk government bills", rate: 0.182, risk: "Low" },
  { name: "Fixed Deposits", returns: "16.5% p.a.", note: "Lock funds for 90–365 days", rate: 0.165, risk: "Low" },
];

function InvestmentsPanel({ onInvest }: { onInvest: (p: InvestmentProduct) => void }) {
  return (
    <section className="mt-5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-black">Investments</h2>
      </div>
      <div className="space-y-2">
        {investmentProducts.map((product) => (
          <div key={product.name} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <div>
              <p className="text-sm font-black">{product.name}</p>
              <p className="text-[11px] text-white/55">{product.note} · {product.returns}</p>
            </div>
            <button onClick={() => onInvest(product)} className="rounded-xl bg-gradient-primary px-3 py-2 text-[11px] font-black text-white shadow-card">Invest Now</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DepositSheet({ holdings, onClose, onConfirm }: { holdings: ReturnType<typeof useBalances>["crypto"]; onClose: () => void; onConfirm: () => void }) {
  const [symbol, setSymbol] = useState(holdings[0]?.symbol ?? "BTC");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank" | "card" | "wallet">("bank");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const address = useMemo(() => `${symbol}-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`, [symbol]);
  const numeric = parseFloat(amount) || 0;
  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone({ ref: `CRY-${Date.now().toString().slice(-8)}` });
    }, 900);
  };
  return (
    <Sheet onClose={onClose}>
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.55)]"><CheckCircle2 className="h-8 w-8" /></div>
          <h3 className="mt-3 text-lg font-black text-foreground">Deposit confirmed</h3>
          <p className="text-xs text-muted-foreground">{formatNGN(numeric)} · {symbol} · Ref {done.ref}</p>
          <button onClick={onConfirm} className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Done</button>
        </div>
      ) : (
      <>
      <h3 className="text-base font-black text-foreground">Deposit to Crypto Wallet</h3>
      <p className="mt-1 text-xs text-muted-foreground">Buy crypto instantly or fund from an external wallet.</p>
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Choose asset</label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {holdings.map((c) => (
          <button key={c.symbol} onClick={() => setSymbol(c.symbol)} className={`rounded-xl py-2 text-xs font-black ${symbol === c.symbol ? "bg-gradient-primary text-primary-foreground shadow-card" : "bg-secondary text-primary"}`}>{c.symbol}</button>
        ))}
      </div>
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount (₦)</label>
      <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none transition focus:border-primary focus:bg-card focus:shadow-glow" />
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment method</label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {([["bank", "Bank"], ["card", "Card"], ["wallet", "Wallet"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setMethod(v)} className={`rounded-xl py-2 text-xs font-black ${method === v ? "bg-gradient-primary text-primary-foreground shadow-card" : "bg-secondary text-primary"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-secondary p-3 ring-1 ring-border">
        <p className="text-[11px] font-bold text-muted-foreground">Or send {symbol} to this address</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border"><QrCode className="h-10 w-10 text-primary" /></div>
          <div className="min-w-0 flex-1">
            <p className="break-all font-mono text-[10px] text-foreground">{address}</p>
            <button onClick={() => { navigator.clipboard?.writeText(address); toast.success("Address copied"); }} className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-primary"><Copy className="h-3 w-3" />Copy address</button>
          </div>
        </div>
      </div>
      <button disabled={numeric <= 0 || submitting} onClick={submit} className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-50">{submitting ? "Processing…" : `Confirm Deposit via ${method === "bank" ? "Bank" : method === "card" ? "Card" : "Wallet"}`}</button>
      </>
      )}
    </Sheet>
  );
}

function InvestmentSheet({ product, max, onClose, onConfirm }: { product: InvestmentProduct; max: number; onClose: () => void; onConfirm: (amount: number, days: number) => void }) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState(90);
  const numeric = parseFloat(amount) || 0;
  const expected = numeric + numeric * product.rate * (days / 365);
  const valid = numeric > 0 && numeric <= max;
  const riskColor = product.risk === "Low" ? "bg-emerald-100 text-emerald-700" : product.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  return (
    <Sheet onClose={onClose}>
      <h3 className="text-base font-black text-foreground">{product.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{product.note}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${riskColor}`}><ShieldCheck className="mr-1 inline h-3 w-3" />{product.risk} risk</span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-black text-primary">{product.returns}</span>
      </div>
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount (₦) · Available {formatNGN(max)}</label>
      <input autoFocus type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none transition focus:border-primary focus:bg-card focus:shadow-glow" />
      <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tenor</label>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[30, 90, 180, 365].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-lg py-2 text-xs font-black ${days === d ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-primary"}`}>{d}d</button>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-secondary p-3 ring-1 ring-border">
        <p className="text-[11px] text-muted-foreground">Expected at maturity</p>
        <p className="text-2xl font-black text-primary">{formatNGN(expected)}</p>
        <p className="text-[10px] text-muted-foreground">Profit {formatNGN(expected - numeric)} · {product.returns}</p>
      </div>
      <button disabled={!valid} onClick={() => onConfirm(numeric, days)} className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-50">Confirm Investment</button>
    </Sheet>
  );
}

function SuccessOverlay({ success, onClose }: { success: string | null; onClose: () => void }) {
  return <AnimatePresence>{success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}><motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-7 text-center text-foreground shadow-2xl"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.6)]"><CheckCircle2 className="h-9 w-9" /></div><p className="text-sm font-bold">{success}</p><p className="text-[11px] text-muted-foreground">Balance updated instantly</p></motion.div></motion.div>}</AnimatePresence>;
}
