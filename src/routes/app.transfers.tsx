import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeftRight, Building2, CheckCircle2, Clock, Globe2, Landmark, Phone, Repeat, Search, Users } from "lucide-react";
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

type Mode = "other" | "same" | "schedule" | "phone" | "recurring" | "international";
const currencies = ["USD", "GBP", "EUR", "CAD", "GHS", "ZAR", "CHF", "AUD"];
const intlPurposes = ["Family support", "Tuition / School fees", "Business payment", "Personal savings", "Investment"];

function TransfersPage() {
  const balances = useBalances();
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [phone, setPhone] = useState("");
  const [remark, setRemark] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [mode, setMode] = useState<Mode>("same");
  const [bank, setBank] = useState(banks[0]);
  const [currency, setCurrency] = useState(currencies[0]);
  const [intlRecipient, setIntlRecipient] = useState("");
  const [intlBank, setIntlBank] = useState("");
  const [intlSwift, setIntlSwift] = useState("");
  const [intlPurpose, setIntlPurpose] = useState(intlPurposes[0]);

  const activeBank = mode === "same" ? "LexBank" : mode === "international" ? intlBank || "International bank" : bank;
  const filteredBanks = useMemo(() => banks.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase().trim())), [bankSearch]);
  const accountName = useMemo(() => {
    if (mode === "international") return intlRecipient.trim();
    const digits = (mode === "phone" ? phone : account).replace(/\D/g, "");
    if (digits.length < (mode === "phone" ? 11 : 10)) return "";
    return mockNames[Number(digits.slice(-2)) % mockNames.length];
  }, [account, mode, phone, intlRecipient]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (mode === "international") {
      if (!n || !intlRecipient.trim() || !account.trim() || !intlBank.trim() || !intlSwift.trim()) return toast.error("Enter all international details");
    } else {
      const digits = (mode === "phone" ? phone : account).replace(/\D/g, "");
      if (!n || digits.length < (mode === "phone" ? 11 : 10) || !accountName) return toast.error("Enter valid transfer details");
    }
    if (n > balances.ngn) return toast.error("Insufficient Spend Balance");
    balancesActions.addNgn(-n);
    transactionsActions.add({
      title: `Transfer to ${accountName}`,
      category: mode === "same" ? "Same-bank transfer" : mode === "international" ? "International transfer" : "Transfer",
      amount: -n,
      icon: mode === "same" ? "🏦" : mode === "international" ? "🌍" : "↗️",
    });
    const tail = mode === "international" ? account.slice(-4) : (mode === "phone" ? phone : account).replace(/\D/g, "").slice(-4);
    const desc = mode === "international" ? `${activeBank} · ${currency} · SWIFT ${intlSwift}` : `${activeBank} •• ${tail}`;
    toast.success(mode === "schedule" ? "Transfer scheduled" : `Sent ${formatNGN(n)} to ${accountName}`, { description: desc });
    setAmount(""); setAccount(""); setPhone(""); setIntlRecipient(""); setIntlBank(""); setIntlSwift(""); setRemark("");
  };

  const tabs: { icon: typeof Building2; label: string; value: Mode }[] = [
    { icon: Building2, label: "Same", value: "same" },
    { icon: Globe2, label: "International", value: "international" },
    { icon: Clock, label: "Schedule", value: "schedule" },
    { icon: Phone, label: "Phone", value: "phone" },
    { icon: Repeat, label: "Repeat", value: "recurring" },
  ];

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <h1 className="text-2xl font-black">Transfers</h1>
        <p className="mt-1 text-sm text-white/85">Send money locally or internationally.</p>
      </header>

      <section className="grid grid-cols-5 gap-1.5 px-5 pt-5">
        {tabs.map((q) => (
          <button key={q.label} onClick={() => setMode(q.value)} className={`flex flex-col items-center gap-1.5 rounded-2xl p-2 text-[10px] font-medium shadow-sm ring-1 transition active:scale-95 ${mode === q.value ? "bg-gradient-primary text-white ring-primary" : "bg-card ring-border text-foreground"}`}>
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${mode === q.value ? "bg-white/15" : "bg-secondary text-primary"}`}>
              <q.icon className="h-3.5 w-3.5" />
            </span>
            <span className="leading-tight">{q.label}</span>
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
        <form onSubmit={submit} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2">
            {mode === "same" ? <Building2 className="h-4 w-4 text-primary" /> : mode === "international" ? <Globe2 className="h-4 w-4 text-primary" /> : <ArrowLeftRight className="h-4 w-4 text-primary" />}
            <h2 className="text-sm font-bold tracking-tight">{mode === "same" ? "let's bank Internal Transfer" : mode === "international" ? "International / Domiciliary transfer" : "Other bank transfer"}</h2>
          </div>

          {mode === "international" ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-secondary p-3 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">Send to domiciliary accounts or international banks worldwide.</p>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Destination currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-glow">
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="float-field"><input value={intlRecipient} onChange={(e) => setIntlRecipient(e.target.value)} placeholder=" " /><label>Recipient full name</label></div>
              <div className="float-field"><input value={account} onChange={(e) => setAccount(e.target.value)} placeholder=" " /><label>Account number / IBAN</label></div>
              <div className="float-field"><input value={intlBank} onChange={(e) => setIntlBank(e.target.value)} placeholder=" " /><label>Bank name (international)</label></div>
              <div className="float-field"><input value={intlSwift} onChange={(e) => setIntlSwift(e.target.value.toUpperCase())} placeholder=" " /><label>SWIFT / Routing code</label></div>
              <div className="float-field"><input type="text" inputMode="numeric" placeholder=" " value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} /><label>Amount (₦)</label></div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Purpose</label>
                <select value={intlPurpose} onChange={(e) => setIntlPurpose(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-glow">
                  {intlPurposes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <p className="rounded-xl bg-secondary p-3 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">Estimated recipient value shown in {currency}; SWIFT fees simulated in demo mode.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mode !== "same" && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Bank</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Search Nigerian banks" className="h-12 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-glow" />
                  </div>
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-glow">
                    {filteredBanks.map((b: string) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div className="float-field"><input type="text" inputMode="numeric" placeholder=" " value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} /><label>Amount (₦)</label></div>
              <div className="float-field"><input type="text" inputMode="numeric" maxLength={mode === "phone" ? 11 : 10} placeholder=" " value={mode === "phone" ? phone : account} onChange={(e) => mode === "phone" ? setPhone(e.target.value.replace(/\D/g, "")) : setAccount(e.target.value.replace(/\D/g, ""))} /><label>{mode === "phone" ? "Phone number" : "Account number"}</label></div>
              {mode === "same" && <div className="float-field"><input type="text" placeholder=" " value={remark} onChange={(e) => setRemark(e.target.value)} /><label>Remark</label></div>}
              <div className="min-h-14 rounded-xl bg-secondary p-3 ring-1 ring-border">
                {accountName ? <div className="flex items-center gap-2 text-sm font-black text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{accountName}</div> : <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Landmark className="h-4 w-4 text-primary" />Account name appears automatically</div>}
                <p className="mt-1 text-[11px] text-muted-foreground">Mock name enquiry · {activeBank}</p>
              </div>
            </div>
          )}

          <button type="submit" className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-card transition active:scale-[0.98]">
            {mode === "schedule" ? "Schedule transfer" : "Send money"}
          </button>
        </form>
      </section>
    </div>
  );
}