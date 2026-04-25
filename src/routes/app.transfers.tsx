import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Building2, CheckCircle2, Clock, Globe2, Landmark, Loader2, Plus, Repeat, Search, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { formatNGN } from "@/lib/mockData";
import { balancesActions, useBalances } from "@/lib/balancesStore";
import { transactionsActions } from "@/lib/transactionsStore";

export const Route = createFileRoute("/app/transfers")({
  head: () => ({ meta: [{ title: "Transfers — LexBank" }] }),
  component: TransfersPage,
});

const initialBeneficiaries = [
  { id: "b1", name: "Tunde A.", bank: "GTBank", initials: "TA" },
  { id: "b2", name: "Amaka O.", bank: "Access", initials: "AO" },
  { id: "b3", name: "Kelvin", bank: "LexBank", initials: "K" },
  { id: "b4", name: "Mum 💖", bank: "UBA", initials: "M" },
];

const banks = ["Access Bank", "Zenith Bank", "GTBank", "UBA", "First Bank", "Stanbic IBTC", "Fidelity Bank", "FCMB", "Wema Bank", "Sterling Bank", "Union Bank", "Keystone Bank", "Polaris Bank", "Unity Bank", "Heritage Bank", "Providus Bank", "Jaiz Bank", "SunTrust Bank", "Kuda", "Opay", "PalmPay", "Moniepoint", "VFD Microfinance", "TAJ Bank", "Titan Trust Bank"];
const mockNames = ["TUNDE ADEBAYO", "AMAKA OKORO", "CHINEDU NWOSU", "AISHA BELLO", "KELVIN EZE"];

type Mode = "same" | "local" | "schedule" | "repeat" | "international";
const currencies = ["USD", "GBP", "EUR", "CAD", "GHS", "ZAR", "CHF", "AUD"];
const intlPurposes = ["Family support", "Tuition / School fees", "Business payment", "Personal savings", "Investment"];

type LastTransfer = { mode: Mode; bank: string; account: string; name: string; amount: string; narration: string };
const LAST_KEY = "lex_last_transfer";

function loadLast(): LastTransfer | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(LAST_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function TransfersPage() {
  const balances = useBalances();
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [narration, setNarration] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [mode, setMode] = useState<Mode>("same");
  const [bank, setBank] = useState(banks[0]);
  const [currency, setCurrency] = useState(currencies[0]);
  const [intlRecipient, setIntlRecipient] = useState("");
  const [intlBank, setIntlBank] = useState("");
  const [intlSwift, setIntlSwift] = useState("");
  const [intlPurpose, setIntlPurpose] = useState(intlPurposes[0]);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ ref: string; name: string; bank: string; tail: string; amount: number; narration: string; mode: Mode } | null>(null);
  const [last, setLast] = useState<LastTransfer | null>(loadLast());
  const [bens, setBens] = useState(initialBeneficiaries);
  const [addBenOpen, setAddBenOpen] = useState(false);
  const [newBen, setNewBen] = useState({ name: "", nick: "", bank: "LexBank", account: "" });

  const activeBank = mode === "same" ? "LexBank" : mode === "international" ? intlBank || "International bank" : bank;
  const filteredBanks = useMemo(() => banks.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase().trim())), [bankSearch]);

  const accountName = useMemo(() => {
    if (mode === "international") return intlRecipient.trim();
    const digits = account.replace(/\D/g, "");
    if (digits.length < 10) return "";
    return mockNames[Number(digits.slice(-2)) % mockNames.length];
  }, [account, mode, intlRecipient]);

  // Pre-fill repeat tab from last successful transfer
  useEffect(() => {
    if (mode === "repeat" && last) {
      setBank(last.bank || banks[0]);
      setAccount(last.account);
      setAmount(last.amount);
      setNarration(last.narration);
    }
  }, [mode, last]);

  const resetForm = () => {
    setAmount(""); setAccount(""); setIntlRecipient(""); setIntlBank(""); setIntlSwift(""); setNarration("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (mode === "international") {
      if (!n || !intlRecipient.trim() || !account.trim() || !intlBank.trim() || !intlSwift.trim()) return toast.error("Enter all international details");
    } else {
      const digits = account.replace(/\D/g, "");
      if (!n || digits.length < 10 || !accountName) return toast.error("Enter valid transfer details");
    }
    if (n > balances.ngn) return toast.error("Insufficient Spend Balance");

    setSubmitting(true);
    setTimeout(() => {
      balancesActions.addNgn(-n);
      transactionsActions.add({
        title: `Transfer to ${accountName}`,
        category: mode === "same" ? "Same-bank transfer" : mode === "local" ? "Local bank transfer" : mode === "international" ? "International transfer" : "Transfer",
        amount: -n,
        icon: mode === "same" ? "🏦" : mode === "international" ? "🌍" : "↗️",
      });
      const tail = mode === "international" ? account.slice(-4) : account.replace(/\D/g, "").slice(-4);
      const ref = `LX-${Date.now().toString().slice(-9)}`;

      // Persist last transfer for Repeat tab
      if (mode !== "international" && mode !== "schedule") {
        const next: LastTransfer = { mode, bank: activeBank, account, name: accountName, amount, narration };
        try { localStorage.setItem(LAST_KEY, JSON.stringify(next)); } catch {}
        setLast(next);
      }

      setSubmitting(false);
      if (mode === "schedule") {
        toast.success("Transfer scheduled", { description: `${formatNGN(n)} to ${accountName}` });
        resetForm();
        return;
      }
      setReceipt({ ref, name: accountName, bank: activeBank, tail, amount: n, narration, mode });
    }, 1100);
  };

  const closeReceipt = () => { setReceipt(null); resetForm(); };
  const repeatFromReceipt = () => { setReceipt(null); setMode("repeat"); };

  const submitBeneficiary = (e: FormEvent) => {
    e.preventDefault();
    if (!newBen.name.trim() || newBen.account.replace(/\D/g, "").length < 10) return toast.error("Enter name and 10-digit account");
    const initials = (newBen.nick || newBen.name).trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
    setBens((prev) => [{ id: `b_${Date.now()}`, name: newBen.nick.trim() || newBen.name.trim(), bank: newBen.bank, initials }, ...prev]);
    toast.success("Beneficiary added");
    setNewBen({ name: "", nick: "", bank: "LexBank", account: "" });
    setAddBenOpen(false);
  };

  const tabs: { icon: typeof Building2; label: string; value: Mode }[] = [
    { icon: Building2, label: "Same", value: "same" },
    { icon: Landmark, label: "Local bank", value: "local" },
    { icon: Globe2, label: "International", value: "international" },
    { icon: Clock, label: "Schedule", value: "schedule" },
    { icon: Repeat, label: "Repeat", value: "repeat" },
  ];

  const showBankSelector = mode === "local" || mode === "schedule" || mode === "repeat";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-12">
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
          <h2 className="flex-1 text-sm font-bold tracking-tight text-foreground">Beneficiaries</h2>
          <button onClick={() => setAddBenOpen(true)} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-black text-primary ring-1 ring-border">
            <Plus className="h-3 w-3" /> Add Beneficiary
          </button>
        </div>
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {bens.map((b) => (
            <li key={b.id} className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5">
              <button onClick={() => { setMode(b.bank === "LexBank" ? "same" : "local"); setBank(b.bank === "LexBank" ? banks[0] : (banks.find((x) => x.toLowerCase().includes(b.bank.toLowerCase())) ?? banks[0])); setAccount("0123456789"); }} className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white shadow-card transition active:scale-95">
                {b.initials}
              </button>
              <p className="truncate text-[11px] font-medium text-foreground">{b.name}</p>
              <p className="-mt-1 text-[9px] text-muted-foreground">{b.bank}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-4">
        <form onSubmit={submit} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2">
            {mode === "same" ? <Building2 className="h-4 w-4 text-primary" /> : mode === "international" ? <Globe2 className="h-4 w-4 text-primary" /> : mode === "repeat" ? <Repeat className="h-4 w-4 text-primary" /> : <ArrowLeftRight className="h-4 w-4 text-primary" />}
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              {mode === "same" ? "LexBank Internal Transfer" : mode === "international" ? "International / Domiciliary transfer" : mode === "repeat" ? (last ? `Repeat last transfer to ${last.name}` : "No previous transfer to repeat") : mode === "schedule" ? "Schedule a transfer" : "Local bank transfer"}
            </h2>
          </div>

          {mode === "same" && (
            <button type="button" onClick={() => setAddBenOpen(true)} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-xs font-black text-primary ring-1 ring-border transition active:scale-[0.99]">
              <UserPlus className="h-3.5 w-3.5" /> + Add Beneficiary
            </button>
          )}

          {mode === "international" ? (
            <div className="space-y-3">
              <p className="rounded-xl bg-secondary p-3 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">Send to domiciliary accounts or international banks worldwide.</p>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Destination currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:shadow-glow">
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
                <select value={intlPurpose} onChange={(e) => setIntlPurpose(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:shadow-glow">
                  {intlPurposes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <p className="rounded-xl bg-secondary p-3 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">Estimated recipient value shown in {currency}; SWIFT fees simulated in demo mode.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {showBankSelector && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Bank</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Search Nigerian banks" className="h-12 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:shadow-glow" />
                  </div>
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:shadow-glow">
                    {filteredBanks.map((b: string) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div className="float-field"><input type="text" inputMode="numeric" maxLength={10} placeholder=" " value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} /><label>Account number</label></div>
              <div className="min-h-14 rounded-xl bg-secondary p-3 ring-1 ring-border">
                {accountName ? <div className="flex items-center gap-2 text-sm font-black text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{accountName}</div> : <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Landmark className="h-4 w-4 text-primary" />Account name appears automatically</div>}
                <p className="mt-1 text-[11px] text-muted-foreground">Mock name enquiry · {activeBank}</p>
              </div>
              <div className="float-field"><input type="text" inputMode="numeric" placeholder=" " value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} /><label>Amount (₦)</label></div>
              <div className="float-field"><input type="text" placeholder=" " value={narration} onChange={(e) => setNarration(e.target.value)} /><label>Narration / Purpose</label></div>
            </div>
          )}

          <button type="submit" disabled={submitting || (mode === "repeat" && !last)} className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Sending…</> : mode === "schedule" ? "Schedule transfer" : mode === "repeat" ? "Repeat transfer" : "Send Money"}
          </button>
        </form>
      </section>

      <AnimatePresence>
        {receipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={closeReceipt}>
            <motion.div initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl ring-1 ring-border">
              <div className="flex items-start justify-between">
                <div className="mx-auto flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.55)]"><CheckCircle2 className="h-9 w-9" /></div>
                  <h3 className="mt-3 text-lg font-black text-foreground">Transfer successful</h3>
                  <p className="text-xs text-muted-foreground">{formatNGN(receipt.amount)} sent to {receipt.name}</p>
                </div>
                <button onClick={closeReceipt} className="absolute right-5 top-5 rounded-full bg-secondary p-1.5 text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
              <ul className="mt-5 space-y-2 rounded-2xl bg-secondary p-4 ring-1 ring-border">
                <ReceiptRow label="Reference" value={receipt.ref} mono />
                <ReceiptRow label="Recipient" value={receipt.name} />
                <ReceiptRow label="Bank" value={`${receipt.bank} •• ${receipt.tail}`} />
                <ReceiptRow label="Amount" value={formatNGN(receipt.amount)} />
                {receipt.narration && <ReceiptRow label="Narration" value={receipt.narration} />}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={repeatFromReceipt} className="h-12 rounded-xl bg-secondary text-sm font-black text-foreground ring-1 ring-border">Repeat transfer</button>
                <button onClick={closeReceipt} className="btn-shine h-12 rounded-xl bg-gradient-primary text-sm font-black text-white shadow-card">Done</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addBenOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAddBenOpen(false)}>
            <motion.form onSubmit={submitBeneficiary} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl ring-1 ring-border">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Beneficiary</p>
                  <h3 className="text-lg font-black text-foreground">Add new beneficiary</h3>
                </div>
                <button type="button" onClick={() => setAddBenOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank</label>
                  <select value={newBen.bank} onChange={(e) => setNewBen((b) => ({ ...b, bank: e.target.value }))} className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:shadow-glow">
                    <option value="LexBank">LexBank (Internal)</option>
                    {banks.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="float-field"><input value={newBen.account} onChange={(e) => setNewBen((b) => ({ ...b, account: e.target.value.replace(/\D/g, "").slice(0, 10) }))} inputMode="numeric" placeholder=" " /><label>Account number</label></div>
                <div className="float-field"><input value={newBen.name} onChange={(e) => setNewBen((b) => ({ ...b, name: e.target.value }))} placeholder=" " /><label>Account name</label></div>
                <div className="float-field"><input value={newBen.nick} onChange={(e) => setNewBen((b) => ({ ...b, nick: e.target.value }))} placeholder=" " /><label>Nickname (optional)</label></div>
              </div>
              <button className="btn-shine mt-5 h-12 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Save beneficiary</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-sm font-black text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
    </li>
  );
}
