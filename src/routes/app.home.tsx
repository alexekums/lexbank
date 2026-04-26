import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Bell, Car, Clapperboard, Copy, Eye, EyeOff, Gamepad2, Gift, HeartPulse, IdCard, Loader2, PiggyBank, Plane, Plus, Receipt, Smartphone, Target, Trash2, Tv, Wifi, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { formatNGN, formatUSD } from "@/lib/mockData";
import { balancesActions, useBalances } from "@/lib/balancesStore";
import { transactionsActions, useTransactions } from "@/lib/transactionsStore";
import { useSavings } from "@/lib/savingsStore";
import { DomiciliaryAccounts } from "@/components/DomiciliaryAccounts";

export const Route = createFileRoute("/app/home")({
  head: () => ({ meta: [{ title: "Home — LexBank" }] }),
  component: HomePage,
});

type Flow = "deposit" | "request" | "bills" | "airtime" | "data" | "electricity" | "tv" | "travel" | "betting" | "transport" | "internet" | "waste" | "idcard";

const flowCopy: Record<Flow, { title: string; label: string; icon: string; category: string; success: string }> = {
  deposit: { title: "Deposit money", label: "Deposit amount (₦)", icon: "💰", category: "Income", success: "Deposit successful" },
  request: { title: "Request money", label: "Request amount (₦)", icon: "⬅️", category: "Request", success: "Payment request sent" },
  bills: { title: "Pay a bill", label: "Bill amount (₦)", icon: "🧾", category: "Bills", success: "Bill paid" },
  airtime: { title: "Buy airtime", label: "Airtime amount (₦)", icon: "📱", category: "Data & Airtime", success: "Airtime purchased" },
  data: { title: "Buy data", label: "Data bundle amount (₦)", icon: "🌐", category: "Data & Airtime", success: "Data bundle purchased" },
  electricity: { title: "Pay electricity", label: "Electricity amount (₦)", icon: "⚡", category: "Utilities", success: "Electricity token purchased" },
  tv: { title: "Pay TV", label: "TV subscription amount (₦)", icon: "📺", category: "Subscriptions", success: "TV subscription paid" },
  travel: { title: "Book travel", label: "Travel amount (₦)", icon: "✈️", category: "Travel", success: "Travel payment created" },
  betting: { title: "Fund betting wallet", label: "Funding amount (₦)", icon: "🎮", category: "Entertainment", success: "Betting wallet funded" },
  transport: { title: "Pay transport", label: "Transport amount (₦)", icon: "🚗", category: "Transport", success: "Transport payment sent" },
  internet: { title: "Pay internet", label: "Internet amount (₦)", icon: "📡", category: "Utilities", success: "Internet subscription paid" },
  waste: { title: "Pay waste bill", label: "Waste bill amount (₦)", icon: "🗑️", category: "Utilities", success: "Waste bill paid" },
  idcard: { title: "ID Card / Verification", label: "Service fee (₦)", icon: "🪪", category: "Verification", success: "ID request submitted" },
};

const providers: Partial<Record<Flow, string[]>> = {
  airtime: ["MTN", "Airtel", "Glo", "9mobile"],
  data: ["MTN Data", "Airtel Data", "Glo Data", "9mobile Data"],
  electricity: ["EKEDC / NEPA", "IKEDC / PHCN", "AEDC", "PHED", "KEDCO"],
  tv: ["DSTV", "GOTV", "Startimes", "Showmax"],
  bills: ["Electricity", "Cable TV", "Internet", "Waste bill", "Betting", "ID Card", "Airtime", "Data"],
  travel: ["Flights", "Hotels", "Interstate bus"],
  betting: ["Bet9ja", "SportyBet", "BetKing", "1xBet"],
  transport: ["Uber", "Bolt", "Cowry", "BRT"],
  internet: ["Spectranet", "Smile", "Swift", "ipNX", "FiberOne"],
  waste: ["LAWMA", "PSP Operator", "Cleaner Lagos"],
  idcard: ["NIN Slip", "Passport (Reissue)", "Driver's License", "Voter's Card"],
};

const amountPresets: Partial<Record<Flow, number[]>> = {
  airtime: [500, 1000, 2000, 5000],
  data: [1000, 2000, 3500, 10000],
  electricity: [5000, 10000, 20000, 50000],
  tv: [3300, 7600, 12500, 24500],
  internet: [9500, 14500, 22000, 45000],
  waste: [2500, 5000, 7500, 10000],
  idcard: [5000, 15000, 35000, 70000],
  betting: [1000, 2000, 5000, 10000],
};

// Detail field per flow (besides provider)
const detailLabel: Partial<Record<Flow, string>> = {
  airtime: "Phone number",
  data: "Phone number",
  electricity: "Meter number",
  tv: "Smartcard / IUC number",
  internet: "Customer ID",
  waste: "Customer / property ID",
  idcard: "NIN or reference number",
  betting: "Betting username / account ID",
  transport: "Trip reference",
  travel: "Booking reference",
};

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const balances = useBalances();
  const transactions = useTransactions();
  const cryptoUsd = balances.crypto.reduce((s, c) => s + c.amount * c.priceUsd, 0);
  const tradingPnlNgn = balances.positions.reduce(
    (s, p) => s + (p.pair.endsWith("NGN") ? p.pnl : p.pnl * 1613.3),
    0,
  );
  const visibleTransactions = useMemo(() => (showAll ? transactions : transactions.slice(0, 4)), [showAll, transactions]);
  const budgetCategories = useMemo(() => {
    const totals = transactions.reduce<Record<string, number>>((acc, tx) => {
      if (tx.amount < 0) acc[tx.category] = (acc[tx.category] ?? 0) + Math.abs(tx.amount);
      return acc;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [transactions]);

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
              <p className="text-sm font-semibold tracking-wide">let's bank</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotificationsOpen(true)} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30" aria-label="Open notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-foreground" />
            </button>
            <button
              onClick={() => setShow((s) => !s)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30"
              aria-label="Toggle balance"
            >
              {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-xs uppercase tracking-widest text-white/70">Naira balance</p>
          <motion.p key={String(show)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-4xl font-black tracking-tight">
            {show ? formatNGN(balances.ngn) : "₦••••••"}
          </motion.p>
          <button onClick={() => { navigator.clipboard?.writeText("8021034521"); toast.success("Account number copied", { description: "8021034521" }); }} className="mt-1 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white">
            <Copy className="h-3 w-3" /> Account 8021034521 · Tap to copy
          </button>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {[
            { icon: Plus, label: "Deposit", onClick: () => setFlow("deposit") },
            { icon: ArrowUpRight, label: "Send", onClick: openTransfer },
            { icon: ArrowDownLeft, label: "Request", onClick: () => setFlow("request") },
            { icon: Receipt, label: "Bills", onClick: () => setFlow("bills") },
            { icon: PiggyBank, label: "Save", onClick: () => setSavingsOpen(true) },
          ].map((q) => (
            <button key={q.label} onClick={q.onClick} className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-1 py-3 text-[11px] font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95">
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

      <div className="mt-6">
        <DomiciliaryAccounts />
      </div>

      <section className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Quick services</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Smartphone, label: "Airtime", flow: "airtime" as const },
            { icon: Wifi, label: "Data", flow: "data" as const },
            { icon: Zap, label: "Electricity", flow: "electricity" as const },
            { icon: Tv, label: "TV", flow: "tv" as const },
          ].map((s) => (
            <button key={s.label} onClick={() => setFlow(s.flow)} className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 text-xs font-medium text-foreground shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={() => setMoreOpen(true)} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card text-sm font-black text-primary shadow-sm ring-1 ring-border transition active:scale-95">
          <Clapperboard className="h-4 w-4" /> More Services
        </button>
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-2xl bg-gradient-to-br from-rose-100 via-white to-rose-50 p-4 ring-1 ring-rose-100 dark:from-primary/15 dark:via-card dark:to-card dark:ring-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">AI Insight</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            You've spent <span className="font-bold">₦45,800</span> on airtime &amp; internet this month — about
            <span className="font-bold"> 18% more</span> than last month. Want a data bundle plan?
          </p>
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <Gift className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-black">Refer &amp; Earn</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Share your code and earn ₦1,000 per active friend.</p>
            <button onClick={() => { navigator.clipboard?.writeText("LEX-4521"); toast.success("Referral code copied"); }} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-black text-primary"><Copy className="h-3.5 w-3.5" />LEX-4521</button>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <Target className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-black">Budget Tracker</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Top spend: {budgetCategories[0]?.[0] ?? "None"}</p>
            <div className="mt-3 space-y-2">{budgetCategories.slice(0, 3).map(([category, total]) => <div key={category} className="flex items-center justify-between text-[11px]"><span className="truncate text-muted-foreground">{category}</span><span className="font-black">{formatNGN(total).replace(".00", "")}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Recent transactions</h2>
          <button onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-primary">
            {showAll ? "Show less" : "See all transactions"}
          </button>
        </div>
        <ul className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
          {visibleTransactions.map((t, i) => (
            <li key={t.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-base">{t.icon}</span>
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

      <AnimatePresence>{notificationsOpen && <NotificationsSheet onClose={() => setNotificationsOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{moreOpen && <MoreServicesSheet onClose={() => setMoreOpen(false)} onPick={(next: Flow) => { setMoreOpen(false); setFlow(next); }} />}</AnimatePresence>
      <AnimatePresence>{flow && <ActionSheet flow={flow} balance={balances.ngn} onClose={() => setFlow(null)} />}</AnimatePresence>
      <AnimatePresence>{savingsOpen && <SavingsPanel onClose={() => setSavingsOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function ActionSheet({ flow, balance, onClose }: { flow: Flow; balance: number; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [detail, setDetail] = useState(providers[flow]?.[0] ?? "");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const copy = flowCopy[flow];
  const isCredit = flow === "deposit";
  const isRequest = flow === "request";
  const options = providers[flow];
  const presets = amountPresets[flow];
  const refLabel = detailLabel[flow] ?? (isRequest ? "Contact or note" : "Reference");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 100) return toast.error("Enter a valid amount");
    if (!isCredit && !isRequest && value > balance) return toast.error("Insufficient Spend Balance");
    setSubmitting(true);
    setTimeout(() => {
      if (isCredit) balancesActions.addNgn(value);
      if (!isCredit && !isRequest) balancesActions.addNgn(-value);
      transactionsActions.add({
        title: isCredit ? "Wallet deposit" : isRequest ? `Request from ${detail || "contact"}` : `${copy.title}${detail ? ` · ${detail}` : ""}`,
        category: copy.category,
        amount: isCredit ? value : isRequest ? 0 : -value,
        icon: copy.icon,
      });
      setSubmitting(false);
      setDone({ ref: `LX-${Date.now().toString().slice(-9)}` });
      toast.success(copy.success, { description: isRequest ? "We’ll notify you when it is paid" : `${formatNGN(value)} processed` });
    }, 900);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        {done ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.55)]"><Receipt className="h-8 w-8" /></div>
            <h3 className="mt-3 text-lg font-black text-foreground">{copy.success}</h3>
            <p className="text-xs text-muted-foreground">{formatNGN(Number(amount))} · Ref {done.ref}</p>
            {detail && <p className="mt-1 text-xs text-muted-foreground">Provider · {detail}</p>}
            {reference && <p className="mt-1 text-xs text-muted-foreground">{refLabel} · {reference}</p>}
            <button onClick={onClose} className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Done</button>
          </div>
        ) : (
        <form onSubmit={submit}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">LexBank</p>
            <h3 className="text-lg font-black">{copy.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {options && <div className="grid grid-cols-2 gap-2">{options.map((option) => <button type="button" key={option} onClick={() => setDetail(option)} className={`rounded-xl px-3 py-2 text-xs font-black ${detail === option ? "bg-gradient-primary text-primary-foreground shadow-card" : "bg-secondary text-foreground"}`}>{option}</button>)}</div>}
          {presets && <div className="grid grid-cols-4 gap-2">{presets.map((preset) => <button type="button" key={preset} onClick={() => setAmount(String(preset))} className="rounded-xl bg-secondary px-2 py-2 text-xs font-black text-primary ring-1 ring-border">{formatNGN(preset).replace(".00", "")}</button>)}</div>}
          {!isCredit && !isRequest && (
            <div className="float-field"><input value={reference} onChange={(e) => setReference(e.target.value)} placeholder=" " /><label>{refLabel}</label></div>
          )}
          <div className="float-field"><input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder=" " /><label>{copy.label}</label></div>
          {(isCredit || isRequest) && <div className="float-field"><input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder=" " /><label>{isRequest ? "Contact or note" : "Source / note"}</label></div>}
        </div>
        <button disabled={submitting} className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card disabled:opacity-60">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</> : "Continue"}
        </button>
        </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function MoreServicesSheet({ onClose, onPick }: { onClose: () => void; onPick: (flow: Flow) => void }) {
  const services: { icon: typeof Plane; label: string; flow?: Flow; to?: string }[] = [
    { icon: Plane, label: "Travel", flow: "travel" },
    { icon: Gamepad2, label: "Betting", flow: "betting" },
    { icon: Car, label: "Transport", flow: "transport" },
    { icon: Wifi, label: "Internet", flow: "internet" },
    { icon: Trash2, label: "Waste bill", flow: "waste" },
    { icon: IdCard, label: "ID Card", flow: "idcard" },
    { icon: HeartPulse, label: "Microinsurance", to: "/app/insurance" },
    { icon: Receipt, label: "Bills", flow: "bills" },
  ];

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Services</p>
            <h3 className="text-lg font-black">More Services</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => service.to ? (
            <Link key={service.label} to={service.to} onClick={onClose} className="rounded-2xl bg-secondary p-4 text-left ring-1 ring-border transition active:scale-95">
              <service.icon className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-black">{service.label}</p>
              <p className="text-[11px] text-muted-foreground">Cover &amp; protection</p>
            </Link>
          ) : (
            <button key={service.label} onClick={() => service.flow && onPick(service.flow)} className="rounded-2xl bg-secondary p-4 text-left ring-1 ring-border transition active:scale-95">
              <service.icon className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-black">{service.label}</p>
              <p className="text-[11px] text-muted-foreground">Pay instantly</p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SavingsPanel({ onClose }: { onClose: () => void }) {
  const goals = useSavings();
  return (
    <motion.div className="fixed inset-0 z-50 bg-foreground/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-[88%] max-w-md overflow-y-auto bg-background shadow-2xl ring-1 ring-border"
      >
        <header className="rounded-br-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
          <div className="flex items-center justify-between">
            <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-white/85">Savings</p>
            <span className="h-9 w-9" />
          </div>
          <h2 className="mt-5 text-2xl font-black">Your savings dashboard</h2>
          <p className="mt-1 text-sm text-white/85">Track goals and grow each pot.</p>
        </header>
        <div className="space-y-3 p-5">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
            return (
              <div key={goal.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">{goal.icon ?? "🎯"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-foreground">{goal.name}</p>
                        <p className="text-[11px] text-muted-foreground">Due {goal.deadline}</p>
                      </div>
                      <p className="text-xs font-black text-primary">{progress}%</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">{formatNGN(goal.saved)} of {formatNGN(goal.target)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <Link to="/app/savings" onClick={onClose} className="btn-shine mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">
            <PiggyBank className="h-4 w-4" /> Open full Savings Plans
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function NotificationsSheet({ onClose }: { onClose: () => void }) {
  const notifications = [
    { title: "Savings milestone", body: "New Phone goal is now 38% funded.", time: "Now" },
    { title: "Budget insight", body: "Airtime & data is trending above last month.", time: "12m" },
    { title: "LexTX calendar", body: "US GDP and BoE rate decision this week.", time: "1h" },
    { title: "Card security", body: "International card transactions remain blocked.", time: "Today" },
  ];

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-wider text-primary">Notifications</p><h3 className="text-lg font-black">Activity center</h3></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-2">
          {notifications.map((item) => <div key={item.title} className="rounded-2xl bg-secondary p-3 ring-1 ring-border"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black">{item.title}</p><span className="text-[10px] font-bold text-primary">{item.time}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.body}</p></div>)}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MiniCard({ label, value, accent, positive }: { label: string; value: string; accent: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
      <div className={`mb-2 h-1.5 w-8 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold text-foreground ${positive ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{value}</p>
    </div>
  );
}
