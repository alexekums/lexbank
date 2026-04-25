import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HeartPulse, Shield, Smartphone, Plane, HeartHandshake, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/insurance")({
  head: () => ({ meta: [{ title: "Microinsurance — LexBank" }] }),
  component: InsurancePage,
});

type Plan = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Shield;
  from: number;
  benefits: string[];
};

const plans: Plan[] = [
  { id: "health", name: "Health Cover", desc: "Hospital care, consultations & emergencies", icon: HeartPulse, from: 1500, benefits: ["Hospital admission up to ₦500k", "Free consultations", "24/7 emergency line"] },
  { id: "gadget", name: "Gadget Insurance", desc: "Phone, laptop & device protection", icon: Smartphone, from: 800, benefits: ["Theft & damage cover", "Screen replacement", "Worldwide protection"] },
  { id: "life", name: "Life Cover", desc: "Family financial protection", icon: HeartHandshake, from: 2500, benefits: ["Up to ₦5M payout", "Funeral expenses", "Critical illness rider"] },
  { id: "travel", name: "Travel Insurance", desc: "Trips, baggage & medical abroad", icon: Plane, from: 1200, benefits: ["Trip cancellation", "Medical evacuation", "Lost baggage"] },
];

function InsurancePage() {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [tenor, setTenor] = useState("monthly");
  const [confirmed, setConfirmed] = useState<{ plan: string; ref: string } | null>(null);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const ref = `INS-${Date.now().toString().slice(-8)}`;
    setConfirmed({ plan: selected.name, ref });
    toast.success(`${selected.name} activated`, { description: `Reference ${ref}` });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-10">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <div className="flex items-center gap-3">
          <Link to="/app/more" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">Microinsurance</h1>
            <p className="text-xs text-white/85">Affordable cover for everyday risks</p>
          </div>
        </div>
      </header>

      {confirmed ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-8 rounded-2xl bg-card p-6 text-center shadow-card ring-1 ring-border">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.55)]"><CheckCircle2 className="h-7 w-7" /></div>
          <h2 className="mt-3 text-lg font-black">Policy active</h2>
          <p className="mt-1 text-xs text-muted-foreground">{confirmed.plan} — Reference {confirmed.ref}</p>
          <button onClick={() => { setConfirmed(null); setSelected(null); }} className="btn-shine mt-5 h-11 w-full rounded-xl bg-gradient-primary text-sm font-black text-white shadow-card">Done</button>
        </motion.div>
      ) : selected ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-6">
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-card"><selected.icon className="h-6 w-6" /></span>
              <div>
                <h2 className="text-base font-black">{selected.name}</h2>
                <p className="text-[11px] text-muted-foreground">{selected.desc}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {selected.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />{b}</li>
              ))}
            </ul>
          </div>

          <form onSubmit={subscribe} className="mt-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Billing frequency</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[["monthly", "Monthly", 1], ["quarterly", "Quarterly", 3], ["annual", "Annual", 12]].map(([v, l, m]) => (
                <button key={v as string} type="button" onClick={() => setTenor(v as string)} className={`rounded-xl py-2.5 text-xs font-black transition ${tenor === v ? "bg-gradient-primary text-white shadow-card" : "bg-secondary text-foreground"}`}>
                  {l}
                  <p className="text-[9px] font-medium opacity-80">₦{(selected.from * (m as number)).toLocaleString()}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-secondary p-3 ring-1 ring-border">
              <p className="text-[11px] text-muted-foreground">You pay</p>
              <p className="text-xl font-black text-primary">₦{(selected.from * (tenor === "annual" ? 12 : tenor === "quarterly" ? 3 : 1)).toLocaleString()} <span className="text-[11px] font-medium text-muted-foreground">/ {tenor}</span></p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSelected(null)} className="h-11 rounded-xl bg-secondary text-sm font-black text-foreground ring-1 ring-border">Back</button>
              <button type="submit" className="btn-shine h-11 rounded-xl bg-gradient-primary text-sm font-black text-white shadow-card">Activate</button>
            </div>
          </form>
        </motion.section>
      ) : (
        <section className="px-5 pt-6">
          <h2 className="mb-3 text-sm font-black tracking-tight">Choose a plan</h2>
          <div className="grid grid-cols-2 gap-3">
            {plans.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className="rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border transition active:scale-[0.98]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card"><p.icon className="h-5 w-5" /></span>
                <p className="mt-3 text-sm font-black text-foreground">{p.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{p.desc}</p>
                <p className="mt-2 text-[11px] font-black text-primary">From ₦{p.from.toLocaleString()}/mo</p>
              </button>
            ))}
          </div>
          <p className="mt-5 rounded-xl bg-secondary p-3 text-[11px] text-muted-foreground ring-1 ring-border">All policies are simulated for demo purposes. Real policies will be underwritten by licensed Nigerian insurers.</p>
        </section>
      )}
    </div>
  );
}
