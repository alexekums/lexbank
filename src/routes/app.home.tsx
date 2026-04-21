import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, Receipt, Smartphone, Wifi, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { formatNGN, formatUSD, mockBalances, mockTransactions } from "@/lib/mockData";

export const Route = createFileRoute("/app/home")({
  head: () => ({ meta: [{ title: "Home — LexBank" }] }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const [show, setShow] = useState(true);

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-8 pt-10 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <span className="text-sm font-bold">{user?.name?.[0]?.toUpperCase() ?? "L"}</span>
            </div>
            <div>
              <p className="text-xs text-white/80">Hi {user?.name?.split(" ")[0] ?? "there"} 👋</p>
              <p className="text-sm font-semibold">Lex' Bank • Let's Bank</p>
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
          <motion.p
            key={String(show)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-4xl font-black tracking-tight"
          >
            {show ? formatNGN(mockBalances.ngn) : "₦••••••"}
          </motion.p>
          <p className="mt-1 text-xs text-white/80">Account •• 4521 · Tap to copy</p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            { icon: Plus, label: "Deposit" },
            { icon: ArrowUpRight, label: "Send" },
            { icon: ArrowDownLeft, label: "Request" },
            { icon: Receipt, label: "Bills" },
          ].map((q) => (
            <button
              key={q.label}
              className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-2 py-3 text-xs font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95"
            >
              <q.icon className="h-4 w-4" />
              {q.label}
            </button>
          ))}
        </div>
      </header>

      {/* Multi-currency cards */}
      <section className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-2">
          <MiniCard label="USD" value={show ? formatUSD(mockBalances.usd) : "$••••"} accent="from-emerald-500 to-teal-500" />
          <MiniCard label="Crypto" value={show ? formatUSD(mockBalances.cryptoUsd) : "$••••"} accent="from-amber-500 to-orange-500" />
          <MiniCard label="P&L" value={show ? formatNGN(mockBalances.tradingPnl) : "₦••••"} accent="from-primary to-primary-glow" positive />
        </div>
      </section>

      {/* Quick services */}
      <section className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Quick services</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Smartphone, label: "Airtime" },
            { icon: Wifi, label: "Data" },
            { icon: Zap, label: "Electricity" },
            { icon: Receipt, label: "TV" },
          ].map((s) => (
            <button
              key={s.label}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-xs font-medium shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* AI insight */}
      <section className="mt-6 px-5">
        <div className="rounded-2xl bg-gradient-to-br from-rose-100 via-white to-rose-50 p-4 ring-1 ring-rose-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">AI Insight</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            You've spent <span className="font-bold">₦45,800</span> on airtime &amp; internet this month — about
            <span className="font-bold"> 18% more</span> than last month. Want a data bundle plan?
          </p>
        </div>
      </section>

      {/* Transactions */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Recent transactions</h2>
          <button className="text-xs font-semibold text-primary">See all</button>
        </div>
        <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-rose-100">
          {mockTransactions.map((t, i) => (
            <li
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-rose-50" : ""}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-base">
                {t.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {t.category} · {t.date}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${
                  t.amount > 0 ? "text-emerald-600" : "text-foreground"
                }`}
              >
                {t.amount > 0 ? "+" : "−"}
                {formatNGN(Math.abs(t.amount))}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MiniCard({
  label,
  value,
  accent,
  positive,
}: {
  label: string;
  value: string;
  accent: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-rose-100">
      <div className={`mb-2 h-1.5 w-8 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold ${positive ? "text-emerald-600" : ""}`}>{value}</p>
    </div>
  );
}