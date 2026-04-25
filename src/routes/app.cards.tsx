import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { CreditCard, Globe2, Lock, MapPin, Phone, Plus, ShieldCheck, Snowflake, Sparkles, WalletCards } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatNGN } from "@/lib/mockData";

export const Route = createFileRoute("/app/cards")({
  head: () => ({ meta: [{ title: "Cards — LexBank" }] }),
  component: CardsPage,
});

type VirtualCard = {
  id: string;
  name: string;
  number: string;
  balance: number;
  created: string;
  history: { id: string; title: string; amount: number; date: string }[];
  frozen: boolean;
  spendingLimit: number;
  internationalBlocked: boolean;
};

const starterCards: VirtualCard[] = [
  {
    id: "vc_1",
    name: "Online Shopping",
    number: "5321 8840 1294 7712",
    balance: 185000,
    created: "Apr 2026",
    frozen: false,
    spendingLimit: 250000,
    internationalBlocked: true,
    history: [
      { id: "h1", title: "Netflix", amount: -6500, date: "Today" },
      { id: "h2", title: "Card top up", amount: 50000, date: "Yesterday" },
    ],
  },
];

function CardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>(starterCards);
  const [label, setLabel] = useState("");
  const [funding, setFunding] = useState("50000");
  const [limit, setLimit] = useState("250000");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const active = cards[0];

  const total = useMemo(() => cards.reduce((sum, card) => sum + card.balance, 0), [cards]);

  const createCard = (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(funding);
    if (!label.trim() || amount < 1000) return toast.error("Enter a card name and at least ₦1,000");
    const tail = String(Math.floor(1000 + Math.random() * 8999));
    const card: VirtualCard = {
      id: `vc_${Date.now()}`,
      name: label.trim(),
      number: `5321 8840 ${tail} ${String(Math.floor(1000 + Math.random() * 8999))}`,
      balance: amount,
      created: "New",
      frozen: false,
      spendingLimit: amount,
      internationalBlocked: true,
      history: [{ id: `h_${Date.now()}`, title: "Initial funding", amount, date: "Just now" }],
    };
    setCards((prev) => [card, ...prev]);
    setLabel("");
    setFunding("50000");
    toast.success("Virtual card created", { description: `${card.name} is ready to use` });
  };

  const updateActiveCard = (patch: Partial<VirtualCard>) => {
    if (!active) return;
    setCards((prev) => prev.map((card) => card.id === active.id ? { ...card, ...patch } : card));
  };

  const requestPhysicalCard = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim().length < 10 || phone.trim().length < 10) return toast.error("Enter delivery address and phone number");
    setAddress("");
    setPhone("");
    toast.success("Physical Mastercard requested", { description: "Delivery fee ₦2,500 · ETA 7–14 days" });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-8">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-primary-foreground shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/75">LexBank Cards</p>
            <h1 className="mt-1 text-2xl font-black">Virtual debit cards</h1>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
            <CreditCard className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 rounded-2xl bg-primary-foreground/12 p-4 ring-1 ring-primary-foreground/20">
          <p className="text-xs text-primary-foreground/70">Total card balance</p>
          <p className="mt-1 text-3xl font-black">{formatNGN(total)}</p>
        </div>
      </header>

      <main className="space-y-5 px-5 pt-5">
        {active && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl bg-zinc-900 p-5 text-white shadow-card dark:bg-zinc-950 dark:ring-1 dark:ring-white/10">
            <div className="flex items-center justify-between">
              <Sparkles className="h-5 w-5 text-primary-glow" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Virtual</p>
            </div>
            <p className="mt-8 font-mono text-lg font-black tracking-wider">{active.number}</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase text-white/55">Card name</p>
                <p className="text-sm font-bold">{active.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-white/55">Balance</p>
                <p className="text-sm font-black">{formatNGN(active.balance)}</p>
              </div>
            </div>
          </motion.section>
        )}

        {active && (
          <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="mb-3 flex items-center gap-2"><WalletCards className="h-4 w-4 text-primary" /><h2 className="text-sm font-black">Card control</h2></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { updateActiveCard({ frozen: !active.frozen }); toast.success(active.frozen ? "Card unfrozen" : "Card frozen"); }} className="rounded-xl bg-secondary p-3 text-left text-xs font-black ring-1 ring-border"><Snowflake className="mb-2 h-4 w-4 text-primary" />{active.frozen ? "Unfreeze card" : "Freeze card"}<p className="mt-1 font-medium text-muted-foreground">{active.frozen ? "Card is paused" : "Pause instantly"}</p></button>
              <button onClick={() => { updateActiveCard({ internationalBlocked: !active.internationalBlocked }); toast.success(active.internationalBlocked ? "International enabled" : "International blocked"); }} className="rounded-xl bg-secondary p-3 text-left text-xs font-black ring-1 ring-border"><Globe2 className="mb-2 h-4 w-4 text-primary" />International<p className="mt-1 font-medium text-muted-foreground">{active.internationalBlocked ? "Blocked" : "Allowed"}</p></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const next = Number(limit); if (next < 1000) return toast.error("Enter a valid limit"); updateActiveCard({ spendingLimit: next }); toast.success("Spending limit updated"); }} className="mt-3 flex gap-2">
              <div className="float-field flex-1"><input value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder=" " /><label>Spending limit</label></div>
              <button className="h-14 rounded-xl bg-gradient-primary px-4 text-xs font-black text-primary-foreground shadow-card"><Lock className="mr-1 inline h-3.5 w-3.5" />Set</button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">Current limit: {formatNGN(active.spendingLimit)}</p>
          </section>
        )}

        <form onSubmit={createCard} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black">Create new card</h2>
          </div>
          <div className="space-y-3">
            <div className="float-field">
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder=" " />
              <label>Card label</label>
            </div>
            <div className="float-field">
              <input value={funding} onChange={(e) => setFunding(e.target.value)} inputMode="numeric" placeholder=" " />
              <label>Starting balance (₦)</label>
            </div>
          </div>
          <button className="btn-shine mt-4 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Create virtual card</button>
        </form>

        <form onSubmit={requestPhysicalCard} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black">Request Physical Mastercard</h2>
          </div>
          <div className="space-y-3">
            <div className="float-field">
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder=" " />
              <label>Delivery address</label>
            </div>
            <div className="float-field">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder=" " />
              <label>Phone number</label>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-secondary p-3"><MapPin className="mb-1 h-4 w-4 text-primary" /><p className="font-bold">Delivery fee</p><p className="text-muted-foreground">{formatNGN(2500)}</p></div>
            <div className="rounded-xl bg-secondary p-3"><Phone className="mb-1 h-4 w-4 text-primary" /><p className="font-bold">Estimated time</p><p className="text-muted-foreground">7–14 days</p></div>
          </div>
          <button className="btn-shine mt-4 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Request Mastercard</button>
        </form>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black">Card activity</h2>
          </div>
          <div className="space-y-2">
            {cards.flatMap((card) => card.history.map((item) => ({ ...item, card: card.name }))).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.card} · {item.date}</p>
                </div>
                <p className={`text-sm font-black ${item.amount >= 0 ? "text-emerald-600" : "text-primary"}`}>{item.amount >= 0 ? "+" : ""}{formatNGN(item.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
