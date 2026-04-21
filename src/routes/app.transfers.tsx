import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeftRight, Clock, Phone, Repeat, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { formatNGN } from "@/lib/mockData";

export const Route = createFileRoute("/app/transfers")({
  head: () => ({ meta: [{ title: "Transfers — LexBank" }] }),
  component: TransfersPage,
});

const beneficiaries = [
  { id: "b1", name: "Tunde A.", bank: "GTBank", initials: "TA" },
  { id: "b2", name: "Amaka O.", bank: "Access", initials: "AO" },
  { id: "b3", name: "Kelvin", bank: "LexBank", initials: "K" },
  { id: "b4", name: "Mum 💖", bank: "UBA", initials: "M" },
];

function TransfersPage() {
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || !account || !bank) return toast.error("Fill all fields");
    toast.success(`Sent ${formatNGN(n)} to ${bank} •• ${account.slice(-4)}`);
    setAmount(""); setAccount(""); setBank("");
  };

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <h1 className="text-2xl font-black">Transfers</h1>
        <p className="mt-1 text-sm text-white/85">Send money fast, free between LexBank users.</p>
      </header>

      <section className="grid grid-cols-4 gap-3 px-5 pt-5">
        {[
          { icon: Zap, label: "Instant" },
          { icon: Clock, label: "Schedule" },
          { icon: Phone, label: "To phone" },
          { icon: Repeat, label: "Recurring" },
        ].map((q) => (
          <button
            key={q.label}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-xs font-medium shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-primary">
              <q.icon className="h-5 w-5" />
            </span>
            {q.label}
          </button>
        ))}
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold tracking-tight">Beneficiaries</h2>
        </div>
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {beneficiaries.map((b) => (
            <li key={b.id} className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5">
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white shadow-card transition active:scale-95">
                {b.initials}
              </button>
              <p className="truncate text-[11px] font-medium">{b.name}</p>
              <p className="-mt-1 text-[9px] text-muted-foreground">{b.bank}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-4">
        <form onSubmit={submit} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-100">
          <div className="mb-3 flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-tight">New transfer</h2>
          </div>

          <div className="space-y-3">
            <div className="float-field">
              <input type="text" inputMode="numeric" placeholder=" " value={amount} onChange={(e) => setAmount(e.target.value)} />
              <label>Amount (₦)</label>
            </div>
            <div className="float-field">
              <input type="text" placeholder=" " value={account} onChange={(e) => setAccount(e.target.value)} />
              <label>Account number</label>
            </div>
            <div className="float-field">
              <input type="text" placeholder=" " value={bank} onChange={(e) => setBank(e.target.value)} />
              <label>Bank name</label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-card transition active:scale-[0.98]"
          >
            Send money
          </button>
        </form>
      </section>
    </div>
  );
}