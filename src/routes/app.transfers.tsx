import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeftRight, CheckCircle2, Clock, Landmark, Phone, Repeat, Search, Users, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { formatNGN } from "@/lib/mockData";
import { balancesActions, useBalances } from "@/lib/balancesStore";
import { transactionsActions } from "@/lib/transactionsStore";

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

const banks = ["Access Bank", "Zenith Bank", "GTBank", "UBA", "First Bank", "Stanbic IBTC", "Fidelity Bank", "FCMB", "Wema Bank", "Sterling Bank", "Union Bank", "Keystone Bank", "Polaris Bank", "Unity Bank", "Heritage Bank", "Providus Bank", "Jaiz Bank", "SunTrust Bank", "Kuda", "Opay", "PalmPay", "Moniepoint", "VFD Microfinance", "TAJ Bank", "Titan Trust Bank"];
const mockNames = ["TUNDE ADEBAYO", "AMAKA OKORO", "CHINEDU NWOSU", "AISHA BELLO", "KELVIN EZE"];

type Mode = "other" | "same" | "schedule" | "phone" | "recurring";

function TransfersPage() {
  const balances = useBalances();
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [phone, setPhone] = useState("");
  const [remark, setRemark] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [mode, setMode] = useState<Mode>("other");
  const [bank, setBank] = useState(banks[0]);

  const activeBank = mode === "same" ? "LexBank" : bank;
  const filteredBanks = useMemo(() => banks.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase().trim())), [bankSearch]);
  const accountName = useMemo(() => {
    const digits = (mode === "phone" ? phone : account).replace(/\D/g, "");
    if (digits.length < (mode === "phone" ? 11 : 10)) return "";
    return mockNames[Number(digits.slice(-2)) % mockNames.length];
  }, [account, mode, phone]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    const digits = (mode === "phone" ? phone : account).replace(/\D/g, "");
    if (!n || digits.length < (mode === "phone" ? 11 : 10) || !accountName) return toast.error("Enter valid transfer details");
    if (n > balances.ngn) return toast.error("Insufficient Spend Balance");
    balancesActions.addNgn(-n);
    transactionsActions.add({ title: `Transfer to ${accountName}`, category: mode === "same" ? "Same-bank transfer" : "Transfer", amount: -n, icon: mode === "same" ? "🏦" : "↗️" });
    toast.success(mode === "schedule" ? "Transfer scheduled" : `Sent ${formatNGN(n)} to ${accountName}`, { description: `${activeBank} •• ${digits.slice(-4)}` });
    setAmount("");
    setAccount("");
    setPhone("");
  };

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <h1 className="text-2xl font-black">Transfers</h1>
        <p className="mt-1 text-sm text-white/85">Send money to LexBank and major Nigerian banks.</p>
      </header>

      <section className="grid grid-cols-5 gap-2 px-5 pt-5">
        {[
          { icon: Building2, label: "Same", value: "same" as const },
          { icon: Zap, label: "Instant", value: "other" as const },
          { icon: Clock, label: "Schedule", value: "schedule" as const },
          { icon: Phone, label: "Phone", value: "phone" as const },
          { icon: Repeat, label: "Repeat", value: "recurring" as const },
        ].map((q) => (
          <button key={q.label} onClick={() => setMode(q.value)} className={`flex flex-col items-center gap-2 rounded-2xl p-2.5 text-[11px] font-medium shadow-sm ring-1 transition active:scale-95 ${mode === q.value ? "bg-gradient-primary text-white ring-primary" : "bg-white ring-rose-100"}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${mode === q.value ? "bg-white/15" : "bg-rose-50 text-primary"}`}>
              <q.icon className="h-4 w-4" />
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
              <button onClick={() => { setMode(b.bank === "LexBank" ? "same" : "other"); setAccount("0123456789"); }} className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white shadow-card transition active:scale-95">
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
            {mode === "same" ? <Building2 className="h-4 w-4 text-primary" /> : <ArrowLeftRight className="h-4 w-4 text-primary" />}
            <h2 className="text-sm font-bold tracking-tight">{mode === "same" ? "Same-bank transfer" : "New transfer"}</h2>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{mode === "same" ? "Same-bank network" : "Bank"}</label>
            <select value={mode === "same" ? sameBank : bank} onChange={(e) => mode === "same" ? setSameBank(e.target.value) : setBank(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-glow">
              {(mode === "same" ? sameBanks : banks).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="float-field"><input type="text" inputMode="numeric" placeholder=" " value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} /><label>Amount (₦)</label></div>
            <div className="float-field"><input type="text" inputMode="numeric" maxLength={mode === "phone" ? 11 : 10} placeholder=" " value={mode === "phone" ? phone : account} onChange={(e) => mode === "phone" ? setPhone(e.target.value.replace(/\D/g, "")) : setAccount(e.target.value.replace(/\D/g, ""))} /><label>{mode === "phone" ? "Phone number" : "Account number"}</label></div>
            <div className="min-h-14 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
              {accountName ? <div className="flex items-center gap-2 text-sm font-black text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{accountName}</div> : <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Landmark className="h-4 w-4 text-primary" />Account name appears automatically</div>}
              <p className="mt-1 text-[11px] text-muted-foreground">Mock name enquiry · {activeBank}</p>
            </div>
          </div>

          <button type="submit" className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-card transition active:scale-[0.98]">
            {mode === "schedule" ? "Schedule transfer" : "Send money"}
          </button>
        </form>
      </section>
    </div>
  );
}
