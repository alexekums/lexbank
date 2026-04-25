import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Coins, PiggyBank, Plus, Sparkles, Target, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { formatNGN } from "@/lib/mockData";
import { savingsActions, useRoundup, useSavings, type SavingsGoal } from "@/lib/savingsStore";
import { balancesActions, useBalances } from "@/lib/balancesStore";

export const Route = createFileRoute("/app/savings")({
  head: () => ({ meta: [{ title: "Savings Plans — LexBank" }] }),
  component: SavingsPage,
});

const ICONS = ["🎯", "📱", "💍", "🏠", "🚗", "✈️", "🎓", "🛡️", "💼", "💝"];

function SavingsPage() {
  const goals = useSavings();
  const roundup = useRoundup();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState<SavingsGoal | null>(null);

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate({ to: "/app/more" })} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-white/85">Savings Plans</p>
          <span className="h-9 w-9" />
        </div>
        <div className="mt-6">
          <h1 className="text-2xl font-black">Save smart, reach faster</h1>
          <p className="mt-1 text-sm text-white/85">Build dedicated pots for the things that matter.</p>
        </div>
      </header>

      <section className="px-5 pt-5">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm ring-1 ring-border">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card"><Coins className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-foreground">Spend to Save</p>
                <button
                  onClick={() => { savingsActions.setRoundup({ enabled: !roundup.enabled }); toast.success(roundup.enabled ? "Spend to Save disabled" : "Spend to Save enabled"); }}
                  aria-pressed={roundup.enabled}
                  className={`h-6 w-11 rounded-full p-0.5 transition ${roundup.enabled ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-card shadow-sm transition ${roundup.enabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Round up every transaction to the nearest ₦100 and save the difference automatically.</p>
            </div>
          </div>
          {roundup.enabled && (
            <div className="mt-3 space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Round into goal</label>
                <select
                  value={roundup.goalId ?? ""}
                  onChange={(e) => savingsActions.setRoundup({ goalId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:shadow-glow"
                >
                  {goals.map((g) => <option key={g.id} value={g.id}>{g.icon ?? "🎯"} {g.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary p-3 ring-1 ring-border">
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-[11px] font-bold text-muted-foreground">Saved this month</span></div>
                <span className="text-sm font-black text-primary">{formatNGN(roundup.monthSaved)}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pt-4">
        {goals.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
            <PiggyBank className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="text-sm font-black">No savings goals yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first goal to start saving toward something special.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
              return (
                <li key={goal.id}>
                  <button onClick={() => setActive(goal)} className="block w-full rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-border transition active:scale-[0.99]">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">{goal.icon ?? "🎯"}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{goal.name}</p>
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
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button
        onClick={() => setCreating(true)}
        aria-label="Create new goal"
        className="btn-shine fixed bottom-28 right-[max(0.75rem,calc((100vw-28rem)/2+0.75rem))] z-30 flex h-14 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-black text-primary-foreground shadow-card ring-1 ring-white/40 active:scale-95"
      >
        <Plus className="h-5 w-5" /> Create New Goal
      </button>

      <AnimatePresence>{creating && <CreateGoalSheet onClose={() => setCreating(false)} />}</AnimatePresence>
      <AnimatePresence>{active && <GoalDetailSheet goal={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </div>
  );
}

function CreateGoalSheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const target = Number(amount);
    if (!name.trim() || target < 1000 || !deadline.trim()) return toast.error("Enter goal name, amount and deadline");
    savingsActions.create({ name: name.trim(), target, deadline: deadline.trim(), icon });
    toast.success("Savings goal created");
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form onSubmit={submit} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Savings</p>
            <h3 className="text-lg font-black">Create new goal</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pick an icon</p>
            <div className="grid grid-cols-10 gap-1">
              {ICONS.map((i) => (
                <button type="button" key={i} onClick={() => setIcon(i)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${icon === i ? "bg-gradient-primary shadow-card" : "bg-secondary"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="float-field"><input value={name} onChange={(e) => setName(e.target.value)} placeholder=" " /><label>Goal name</label></div>
          <div className="float-field"><input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder=" " /><label>Target amount (₦)</label></div>
          <div className="float-field"><input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder=" " /><label>Deadline (e.g. Dec 2026)</label></div>
        </div>

        <button className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Create goal</button>
      </motion.form>
    </motion.div>
  );
}

function GoalDetailSheet({ goal, onClose }: { goal: SavingsGoal; onClose: () => void }) {
  const balances = useBalances();
  const [amount, setAmount] = useState("");
  const current = useSavings().find((g) => g.id === goal.id) ?? goal;
  const progress = Math.min(100, Math.round((current.saved / current.target) * 100));

  const contribute = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 100) return toast.error("Enter a valid amount");
    if (value > balances.ngn) return toast.error("Insufficient Spend Balance");
    balancesActions.addNgn(-value);
    savingsActions.contribute(current.id, value);
    toast.success(`${formatNGN(value)} added to ${current.name}`);
    setAmount("");
  };

  const remove = () => {
    savingsActions.remove(current.id);
    toast.success("Goal deleted");
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 px-4 pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">{current.icon ?? "🎯"}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Savings goal</p>
              <h3 className="text-lg font-black">{current.name}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="rounded-2xl bg-secondary p-4 ring-1 ring-border">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
            <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatNGN(current.saved)} saved</span>
            <span>Target {formatNGN(current.target)}</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground"><Target className="mr-1 inline h-3 w-3" /> Due {current.deadline}</p>
        </div>

        <form onSubmit={contribute} className="mt-4 space-y-3">
          <div className="float-field"><input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder=" " /><label>Contribute amount (₦)</label></div>
          <button className="btn-shine h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Add to goal</button>
        </form>

        <button onClick={remove} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-black text-destructive ring-1 ring-border">
          <Trash2 className="h-4 w-4" /> Delete goal
        </button>
      </motion.div>
    </motion.div>
  );
}