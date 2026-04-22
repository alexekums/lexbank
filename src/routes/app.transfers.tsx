import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeftRight, CheckCircle2, Clock, Landmark, Phone, Repeat, Users, Zap } from "lucide-react";
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

const banks = ["GTBank", "Zenith Bank", "Access Bank", "FirstBank", "UBA", "Fidelity Bank", "Stanbic IBTC", "Sterling Bank"];
const mockNames = ["TUNDE ADEBAYO", "AMAKA OKORO", "CHINEDU NWOSU", "AISHA BELLO", "KELVIN EZE"];

function TransfersPage() {
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState(banks[0]);

  const accountName = useMemo(() => {
    const digits = account.replace(/\D/g, "");
    if (digits.length < 10) return "";
    return mockNames[Number(digits.slice(-2)) % mockNames.length];
  }, [account]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || account.replace(/\D/g, "").length < 10 || !bank || !accountName) return toast.error("Enter valid transfer details");
    toast.success(`Sent ${formatNGN(n)} to ${accountName}`, { description: `${bank} •• ${account.slice(-4)}` });
    setAmount(""); setAccount("");
  };

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <h1 className="text-2xl font-black">Transfers</h1>
        <p className="mt-1 text-sm text-white/85">Send money to LexBank and major Nigerian banks.</p>
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank</label>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-glow">
              {banks.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="float-field">
              <input type="text" inputMode="numeric" placeholder=" " value={amount} onChange={(e) => setAmount(e.target.value)} />
              <label>Amount (₦)</label>
            </div>
            <div className="float-field">
              <input type="text" inputMode="numeric" maxLength={10} placeholder=" " value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} />
              <label>Account number</label>
            </div>
            <div className="min-h-14 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
              {accountName ? <div className="flex items-center gap-2 text-sm font-black text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{accountName}</div> : <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Landmark className="h-4 w-4 text-primary" />Account name appears automatically</div>}
              <p className="mt-1 text-[11px] text-muted-foreground">Mock name enquiry · {bank}</p>
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