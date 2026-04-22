import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, Receipt, Smartphone, Wifi, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { formatNGN, formatUSD } from "@/lib/mockData";
import { balancesActions, useBalances } from "@/lib/balancesStore";
import { transactionsActions, useTransactions } from "@/lib/transactionsStore";

export const Route = createFileRoute("/app/home")({
  head: () => ({ meta: [{ title: "Home — LexBank" }] }),
  component: HomePage,
});

type Flow = "deposit" | "request" | "bills" | "airtime" | "data" | "electricity" | "tv";

const flowCopy: Record<Flow, { title: string; label: string; icon: string; category: string; success: string }> = {
  deposit: { title: "Deposit money", label: "Deposit amount (₦)", icon: "💰", category: "Income", success: "Deposit successful" },
  request: { title: "Request money", label: "Request amount (₦)", icon: "⬅️", category: "Request", success: "Payment request sent" },
  bills: { title: "Pay bills", label: "Bill amount (₦)", icon: "🧾", category: "Bills", success: "Bill paid" },
  airtime: { title: "Buy airtime", label: "Airtime amount (₦)", icon: "📱", category: "Data & Airtime", success: "Airtime purchased" },
  data: { title: "Buy data", label: "Data bundle amount (₦)", icon: "🌐", category: "Data & Airtime", success: "Data bundle purchased" },
  electricity: { title: "Pay electricity", label: "Electricity amount (₦)", icon: "⚡", category: "Utilities", success: "Electricity token purchased" },
  tv: { title: "Pay TV", label: "TV subscription amount (₦)", icon: "📺", category: "Subscriptions", success: "TV subscription paid" },
};

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [showAll, setShowAll] = useState(false);
  const balances = useBalances();
  const transactions = useTransactions();
  const cryptoUsd = balances.crypto.reduce((s, c) => s + c.amount * c.priceUsd, 0);
  const tradingPnlNgn = balances.positions.reduce(
    (s, p) => s + (p.pair.endsWith("NGN") ? p.pnl : p.pnl * 1613.3),
    0,
  );
  const visibleTransactions = useMemo(() => (showAll ? transactions : transactions.slice(0, 4)), [showAll, transactions]);

  const openTransfer = () => navigate({ to: "/app/transfers" });

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-8 pt-10 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <span className="text-sm font-bold">{user?.name?.[0]?.toUpperCase() ?? "L"}</span>
            </div>
            <div>
              <p className="text-xs text-white/80">Hi {user?.name?.split(" ")[0] ?? "there"} 👋</p>
              <p className="text-sm font-semibold uppercase tracking-wide">LET'S BANK</p>
            </div>
          </div>
          <button
            onClick={() => setShow((s) => !s)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30"
            aria-label="Toggle balance"
          >
            {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-7">
          <p className="text-xs uppercase tracking-widest text-white/70">Naira balance</p>
          <motion.p key={String(show)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-4xl font-black tracking-tight">
            {show ? formatNGN(balances.ngn) : "₦••••••"}
          </motion.p>
          <p className="mt-1 text-xs text-white/80">Account •• 4521 · Tap to copy</p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            { icon: Plus, label: "Deposit", onClick: () => setFlow("deposit") },
            { icon: ArrowUpRight, label: "Send", onClick: openTransfer },
            { icon: ArrowDownLeft, label: "Request", onClick: () => setFlow("request") },
            { icon: Receipt, label: "Bills", onClick: () => setFlow("bills") },
          ].map((q) => (
            <button key={q.label} onClick={q.onClick} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-2 py-3 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95">
              <q.icon className="h-4 w-4" />
              {q.label}
            </button>
          ))}
        </div>
      </header>

      <section className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-2">
          <MiniCard label="USD" value={show ? formatUSD(balances.usd) : "$••••"} accent="from-emerald-500 to-teal-500" />
          <MiniCard label="Crypto" value={show ? formatUSD(cryptoUsd) : "$••••"} accent="from-amber-500 to-orange-500" />
          <MiniCard label="P&L" value={show ? formatNGN(tradingPnlNgn) : "₦••••"} accent="from-primary to-primary-glow" positive={tradingPnlNgn >= 0} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Quick services</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Smartphone, label: "Airtime", flow: "airtime" as const },
            { icon: Wifi, label: "Data", flow: "data" as const },
            { icon: Zap, label: "Electricity", flow: "electricity" as const },
            { icon: Receipt, label: "TV", flow: "tv" as const },
          ].map((s) => (
            <button key={s.label} onClick={() => setFlow(s.flow)} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-xs font-medium shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-2xl bg-gradient-to-br from-rose-100 via-white to-rose-50 p-4 ring-1 ring-rose-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">AI Insight</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            You've spent <span className="font-bold">₦45,800</span> on airtime &amp; internet this month — about
            <span className="font-bold"> 18% more</span> than last month. Want a data bundle plan?
          </p>
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Recent transactions</h2>
          <button onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-primary">
            {showAll ? "Show less" : "See all transactions"}
          </button>
        </div>
        <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-rose-100">
          {visibleTransactions.map((t, i) => (
            <li key={t.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-rose-50" : ""}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-base">{t.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{t.category} · {t.date}</p>
              </div>
              <p className={`text-sm font-bold ${t.amount > 0 ? "text-emerald-600" : "text-foreground"}`}>
                {t.amount > 0 ? "+" : "−"}{formatNGN(Math.abs(t.amount))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <AnimatePresence>{flow && <ActionSheet flow={flow} balance={balances.ngn} onClose={() => setFlow(null)} />}</AnimatePresence>
    </div>
  );
}

function ActionSheet({ flow, balance, onClose }: { flow: Flow; balance: number; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [detail, setDetail] = useState("");
  const copy = flowCopy[flow];
  const isCredit = flow === "deposit";
  const isRequest = flow === "request";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 100) return toast.error("Enter a valid amount");
    if (!isCredit && !isRequest && value > balance) return toast.error("Insufficient Spend Balance");
    if (isCredit) balancesActions.addNgn(value);
    if (!isCredit && !isRequest) balancesActions.addNgn(-value);
    transactionsActions.add({
      title: isCredit ? "Wallet deposit" : isRequest ? `Request from ${detail || "contact"}` : `${copy.title}${detail ? ` · ${detail}` : ""}`,
      category: copy.category,
      amount: isCredit ? value : isRequest ? 0 : -value,
      icon: copy.icon,
    });
    toast.success(copy.success, { description: isRequest ? "We’ll notify you when it is paid" : `${formatNGN(value)} processed` });
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form onSubmit={submit} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">LexBank</p>
            <h3 className="text-lg font-black">{copy.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="float-field"><input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder=" " /><label>{copy.label}</label></div>
          <div className="float-field"><input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder=" " /><label>{isRequest ? "Contact or note" : "Provider / reference"}</label></div>
        </div>
        <button className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Continue</button>
      </motion.form>
    </motion.div>
  );
}

function MiniCard({ label, value, accent, positive }: { label: string; value: string; accent: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-rose-100">
      <div className={`mb-2 h-1.5 w-8 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold ${positive ? "text-emerald-600" : ""}`}>{value}</p>
    </div>
  );
}
