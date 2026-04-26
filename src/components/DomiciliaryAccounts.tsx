import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRightLeft, Copy, X } from "lucide-react";
import { balancesActions, DOM_ACCOUNTS, DOM_RATES, useBalances, type DomCurrency } from "@/lib/balancesStore";
import { formatNGN } from "@/lib/mockData";

const CURRENCIES: DomCurrency[] = ["USD", "GBP", "EUR"];
const SYMBOLS: Record<DomCurrency | "NGN", string> = { USD: "$", GBP: "£", EUR: "€", NGN: "₦" };
const FLAGS: Record<DomCurrency, string> = { USD: "🇺🇸", GBP: "🇬🇧", EUR: "🇪🇺" };

function fmt(currency: DomCurrency | "NGN", value: number) {
  if (currency === "NGN") return formatNGN(value);
  return `${SYMBOLS[currency]}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DomiciliaryAccounts({ variant = "light" }: { variant?: "light" | "dark" }) {
  const balances = useBalances();
  const [active, setActive] = useState<DomCurrency>("USD");
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const account = DOM_ACCOUNTS[active];

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`, { description: text });
  };

  const baseSurface = variant === "dark" ? "bg-white/[0.04] ring-white/10 text-white" : "bg-card ring-border text-foreground";
  const subtle = variant === "dark" ? "text-white/55" : "text-muted-foreground";
  const tabBg = variant === "dark" ? "bg-white/5 ring-white/10" : "bg-secondary ring-border";
  const inactiveTab = variant === "dark" ? "text-white/60" : "text-muted-foreground";

  return (
    <section className="px-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className={`text-sm font-black ${variant === "dark" ? "text-white" : "text-foreground"}`}>Domiciliary Accounts</h2>
          <p className={`text-[11px] ${subtle}`}>Multi-currency. Live rates.</p>
        </div>
        <button onClick={() => setExchangeOpen(true)} className="btn-shine inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-[11px] font-black text-primary-foreground shadow-card">
          <ArrowRightLeft className="h-3.5 w-3.5" />Exchange
        </button>
      </div>

      <div className={`mb-3 inline-flex w-full gap-1 rounded-xl p-1 ring-1 ${tabBg}`}>
        {CURRENCIES.map((c) => (
          <button key={c} onClick={() => setActive(c)} className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-black transition ${active === c ? "bg-gradient-primary text-primary-foreground shadow-card" : inactiveTab}`}>
            {FLAGS[c]} {c}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl p-4 shadow-sm ring-1 ${baseSurface}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtle}`}>{account.bank}</p>
            <p className={`mt-1 text-2xl font-black ${variant === "dark" ? "text-white" : "text-foreground"}`}>{fmt(active, balances.dom[active])}</p>
            <p className={`mt-0.5 text-[11px] ${subtle}`}>≈ {formatNGN(balances.dom[active] * DOM_RATES[active])}</p>
          </div>
          <span className="text-3xl">{FLAGS[active]}</span>
        </div>
        <div className={`mt-4 flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ${variant === "dark" ? "bg-white/5 ring-white/10" : "bg-secondary ring-border"}`}>
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${subtle}`}>Account number</p>
            <p className={`font-mono text-sm font-black ${variant === "dark" ? "text-white" : "text-foreground"}`}>{account.number}</p>
          </div>
          <button onClick={() => copy(account.number, "Account number")} className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-2.5 py-1.5 text-[10px] font-black text-primary-foreground shadow-card">
            <Copy className="h-3 w-3" />Copy
          </button>
        </div>
        <p className={`mt-2 text-[10px] ${subtle}`}>SWIFT/BIC · {account.swift}</p>
      </div>

      <AnimatePresence>{exchangeOpen && <ExchangeSheet onClose={() => setExchangeOpen(false)} />}</AnimatePresence>
    </section>
  );
}

type Account = "NGN" | DomCurrency;
const ALL_ACCOUNTS: Account[] = ["NGN", "USD", "GBP", "EUR"];

function ExchangeSheet({ onClose }: { onClose: () => void }) {
  const balances = useBalances();
  const [from, setFrom] = useState<Account>("NGN");
  const [to, setTo] = useState<Account>("USD");
  const [amount, setAmount] = useState("");
  const numeric = parseFloat(amount) || 0;

  const balanceOf = (a: Account) => (a === "NGN" ? balances.ngn : balances.dom[a]);
  const fromNgn = from === "NGN" ? numeric : numeric * DOM_RATES[from];
  const received = to === "NGN" ? fromNgn : fromNgn / DOM_RATES[to];
  const rateLabel =
    from === to
      ? "—"
      : from === "NGN"
      ? `${SYMBOLS.NGN}${DOM_RATES[to as DomCurrency].toLocaleString()} / ${SYMBOLS[to]}1`
      : to === "NGN"
      ? `${SYMBOLS.NGN}${DOM_RATES[from as DomCurrency].toLocaleString()} / ${SYMBOLS[from]}1`
      : `${(DOM_RATES[from as DomCurrency] / DOM_RATES[to as DomCurrency]).toFixed(4)} ${to} / 1 ${from}`;

  const valid = from !== to && numeric > 0 && numeric <= balanceOf(from);

  const confirm = () => {
    const out = balancesActions.exchange(from, to, numeric);
    if (out <= 0) return toast.error("Exchange failed — check balance");
    toast.success("Exchange complete", { description: `${fmt(from, numeric)} → ${fmt(to, out)}` });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-5 text-foreground shadow-2xl ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">FX</p>
            <h3 className="text-lg font-black">Currency Exchange</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">From</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {ALL_ACCOUNTS.map((a) => (
            <button key={a} onClick={() => setFrom(a)} className={`rounded-xl py-2 text-xs font-black ${from === a ? "bg-gradient-primary text-primary-foreground shadow-card" : "bg-secondary text-primary"}`}>{a}</button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Available {fmt(from, balanceOf(from))}</p>

        <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">To</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {ALL_ACCOUNTS.map((a) => (
            <button key={a} onClick={() => setTo(a)} className={`rounded-xl py-2 text-xs font-black ${to === a ? "bg-gradient-primary text-primary-foreground shadow-card" : "bg-secondary text-primary"}`}>{a}</button>
          ))}
        </div>

        <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount in {from}</label>
        <input autoFocus type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-xl border-2 border-border bg-secondary px-4 py-3 text-lg font-bold text-foreground outline-none transition focus:border-primary focus:bg-card focus:shadow-glow" />

        <div className="mt-4 rounded-xl bg-secondary p-3 ring-1 ring-border">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>Rate</span><span className="font-mono">{rateLabel}</span></div>
          <p className="mt-2 text-[11px] text-muted-foreground">You receive</p>
          <p className="text-2xl font-black text-primary">{fmt(to, received)}</p>
        </div>

        <button disabled={!valid} onClick={confirm} className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-50">Confirm Exchange</button>
      </motion.div>
    </motion.div>
  );
}