import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Copy, Eye, EyeOff, PiggyBank, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatNGN } from "@/lib/mockData";
import { balancesActions, DOM_ACCOUNTS, DOM_RATES, useBalances, type DomCurrency } from "@/lib/balancesStore";
import { transactionsActions, useTransactions } from "@/lib/transactionsStore";

export const Route = createFileRoute("/app/wallet/$currency")({
  head: () => ({ meta: [{ title: "Wallet — LexBank" }] }),
  component: WalletDetailPage,
});

type Code = "NGN" | DomCurrency;
const VALID: Code[] = ["NGN", "USD", "GBP", "EUR"];
const FLAGS: Record<Code, string> = { NGN: "🇳🇬", USD: "🇺🇸", GBP: "🇬🇧", EUR: "🇪🇺" };
const SYMBOLS: Record<Code, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" };
const LABELS: Record<Code, string> = { NGN: "Naira", USD: "US Dollar", GBP: "British Pound", EUR: "Euro" };
const NGN_ACCOUNT = "1001284530";

function fmt(code: Code, value: number) {
  if (code === "NGN") return formatNGN(value);
  return `${SYMBOLS[code]}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const seedTx: Record<DomCurrency, { id: string; title: string; party: string; amount: number; date: string; icon: string }[]> = {
  USD: [
    { id: "u1", title: "Inflow · Stripe Inc", party: "Wire transfer", amount: 4250.0, date: "Today, 09:14", icon: "💵" },
    { id: "u2", title: "Adobe Creative Cloud", party: "Subscription", amount: -54.99, date: "Yesterday", icon: "🎨" },
    { id: "u3", title: "Upwork payout", party: "Freelance income", amount: 1820.5, date: "Mon", icon: "💼" },
    { id: "u4", title: "Amazon.com", party: "Online order", amount: -312.4, date: "Sun", icon: "📦" },
    { id: "u5", title: "FX in from NGN", party: "Exchange", amount: 600.0, date: "Sat", icon: "🔁" },
  ],
  GBP: [
    { id: "g1", title: "Wise transfer · Daniel O.", party: "Inflow", amount: 1240.0, date: "Today", icon: "💷" },
    { id: "g2", title: "British Airways", party: "Travel", amount: -480.5, date: "Yesterday", icon: "✈️" },
    { id: "g3", title: "Tesco Express", party: "Groceries", amount: -68.2, date: "Mon", icon: "🛒" },
    { id: "g4", title: "Salary top-up", party: "Acme UK Ltd", amount: 2200.0, date: "Last week", icon: "💼" },
  ],
  EUR: [
    { id: "e1", title: "SEPA inbound · Klaus B.", party: "Inflow", amount: 980.0, date: "Today", icon: "💶" },
    { id: "e2", title: "Lufthansa", party: "Travel", amount: -415.0, date: "Yesterday", icon: "✈️" },
    { id: "e3", title: "Spotify EU", party: "Subscription", amount: -10.99, date: "Mon", icon: "🎧" },
    { id: "e4", title: "FX out to USD", party: "Exchange", amount: -250.0, date: "Sun", icon: "🔁" },
  ],
};

function WalletDetailPage() {
  const { currency } = Route.useParams();
  const navigate = useNavigate();
  const balances = useBalances();
  const transactions = useTransactions();
  const [show, setShow] = useState(true);
  const [flow, setFlow] = useState<"send" | "receive" | null>(null);

  const code = (VALID.includes(currency.toUpperCase() as Code) ? currency.toUpperCase() : "NGN") as Code;
  const isNgn = code === "NGN";
  const value = isNgn ? balances.ngn : balances.dom[code as DomCurrency];
  const ngnEquiv = isNgn ? value : value * DOM_RATES[code as DomCurrency];
  const account = isNgn
    ? { number: NGN_ACCOUNT, bank: "LexBank · NGN", swift: "LEXBNGLA" }
    : DOM_ACCOUNTS[code as DomCurrency];

  const txList = useMemo(() => {
    if (isNgn) return transactions.slice(0, 8);
    return seedTx[code as DomCurrency];
  }, [isNgn, code, transactions]);

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`, { description: text });
  };

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-8 pt-10 text-white shadow-card">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate({ to: "/app/home" })} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">Wallet</p>
            <p className="text-sm font-black">{FLAGS[code]} {LABELS[code]}</p>
          </div>
          <button onClick={() => setShow((s) => !s)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-7">
          <p className="text-xs uppercase tracking-widest text-white/70">{LABELS[code]} balance</p>
          <motion.p key={String(show)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-4xl font-black tracking-tight">
            {show ? fmt(code, value) : `${SYMBOLS[code]}••••••`}
          </motion.p>
          {!isNgn && <p className="mt-1 text-xs text-white/80">≈ {formatNGN(ngnEquiv)}</p>}
          <button onClick={() => copy(account.number, "Account number")} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-black ring-1 ring-white/25">
            <Copy className="h-3 w-3" /> {account.number} · Tap to copy
          </button>
          <p className="mt-1 text-[10px] text-white/60">{account.bank} · SWIFT {account.swift}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { icon: ArrowUpRight, label: "Send", onClick: () => setFlow("send") },
            { icon: ArrowDownLeft, label: "Receive", onClick: () => setFlow("receive") },
            { icon: PiggyBank, label: "Save", onClick: () => navigate({ to: "/app/savings" }) },
          ].map((q) => (
            <button key={q.label} onClick={q.onClick} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-1 py-3 text-[12px] font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95">
              <q.icon className="h-5 w-5" />
              {q.label}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Recent transactions</h2>
          <Link to="/app/home" className="text-xs font-semibold text-primary">All accounts</Link>
        </div>
        <ul className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
          {txList.map((t, i) => {
            const credit = t.amount > 0;
            return (
              <li key={t.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-base">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {"category" in t ? (t as any).category : (t as any).party} · {t.date}
                  </p>
                </div>
                <p className={`text-sm font-bold ${credit ? "text-emerald-600" : "text-foreground"}`}>
                  {credit ? "+" : "−"}{fmt(code, Math.abs(t.amount))}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <AnimatePresence>
        {flow && <SendReceiveSheet code={code} mode={flow} balance={value} account={account} onClose={() => setFlow(null)} />}
      </AnimatePresence>
    </div>
  );
}

function SendReceiveSheet({ code, mode, balance, account, onClose }: { code: Code; mode: "send" | "receive"; balance: number; account: { number: string; bank: string }; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    if (mode === "send" && n > balance) return toast.error("Insufficient balance");
    setBusy(true);
    setTimeout(() => {
      if (code === "NGN") {
        balancesActions.addNgn(mode === "send" ? -n : n);
      } else {
        balancesActions.addDom(code as DomCurrency, mode === "send" ? -n : n);
      }
      transactionsActions.add({
        title: mode === "send" ? `Sent to ${recipient || "recipient"}` : `Received in ${code}`,
        category: mode === "send" ? "Transfer" : "Income",
        amount: code === "NGN" ? (mode === "send" ? -n : n) : 0,
        icon: mode === "send" ? "↗️" : "↙️",
      });
      setBusy(false);
      toast.success(mode === "send" ? "Transfer sent" : "Funds received", { description: `${SYMBOLS[code]}${n.toLocaleString()}` });
      onClose();
    }, 800);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4">
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{LABELS[code]}</p>
            <h3 className="text-lg font-black">{mode === "send" ? "Send" : "Receive"} {code}</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        {mode === "receive" ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-secondary p-4 ring-1 ring-border">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account number</p>
              <p className="mt-1 font-mono text-lg font-black text-foreground">{account.number}</p>
              <p className="mt-1 text-xs text-muted-foreground">{account.bank}</p>
              <button onClick={() => copy(account.number, "Account number")} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-black text-primary-foreground shadow-card">
                <Copy className="h-3.5 w-3.5" /> Copy account number
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Share this account number to receive funds in {code}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="float-field"><input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder=" " /><label>Recipient name or account</label></div>
            <div className="float-field"><input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder=" " /><label>Amount ({SYMBOLS[code]})</label></div>
            <p className="text-[11px] text-muted-foreground">Available: {fmt(code, balance)}</p>
            <button disabled={busy} onClick={submit} className="btn-shine mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-60">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : "Send now"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
