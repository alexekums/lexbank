import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Camera, ChevronRight, CreditCard, Fingerprint, HeartPulse, HelpCircle, KeyRound, Lock, LogOut, Mail, Pencil, PiggyBank, Phone as PhoneIcon, Settings, Shield, Sparkles, TrendingUp, Umbrella, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/more")({
  head: () => ({ meta: [{ title: "More — LexBank" }] }),
  component: MorePage,
});

const groups: Array<{ title: string; items: { icon: typeof User; label: string; hint?: string }[] }> = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile" },
      { icon: CreditCard, label: "Cards & accounts" },
      { icon: Bell, label: "Notifications" },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: Shield, label: "Security center", hint: "Biometric ON" },
      { icon: Lock, label: "Change PIN" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: Sparkles, label: "What's new" },
      { icon: HelpCircle, label: "Help & support" },
      { icon: Settings, label: "Preferences" },
    ],
  },
];

const investments = [
  { name: "Mutual Funds", returns: "15.8% p.a.", note: "Balanced naira fund" },
  { name: "Treasury Bills", returns: "18.2% p.a.", note: "Low-risk government bills" },
  { name: "Fixed Deposits", returns: "16.5% p.a.", note: "Lock funds for 90–365 days" },
];

const insurance = ["Health", "Gadget", "Life", "Travel"];

function MorePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("0803 452 1980");
  const [bvn, setBvn] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [twoFa, setTwoFa] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateUser({ name: name.trim() || user?.name, email: email.trim() || user?.email });
    setEditingProfile(false);
    toast.success("Profile updated");
  };

  const verifyKyc = (e: FormEvent) => {
    e.preventDefault();
    if (bvn.replace(/\D/g, "").length !== 11) return toast.error("Enter an 11-digit BVN");
    toast.success("KYC submitted", { description: "ID, selfie and BVN verified in demo mode" });
  };

  const updatePassword = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setPassword("");
    toast.success("Password changed");
  };

  const updatePin = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) return toast.error("Enter a 4-digit PIN");
    setPin("");
    toast.success("Transaction PIN updated");
  };

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-8 pt-10 text-white shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black ring-1 ring-white/30">
            {user?.name?.[0]?.toUpperCase() ?? "L"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black">{user?.name}</p>
            <p className="truncate text-xs text-white/80">{user?.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/30">
              ✨ LexBank Plus
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 pt-5">
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-lg font-black text-primary">{name[0]?.toUpperCase() ?? "L"}</span>
              <div>
                <h2 className="text-sm font-black">Profile</h2>
                <p className="text-[11px] text-muted-foreground">{editingProfile ? "Update your details" : "Personal information"}</p>
              </div>
            </div>
            {!editingProfile && (
              <button type="button" onClick={() => setEditingProfile(true)} className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-[11px] font-black text-primary ring-1 ring-border">
                <Pencil className="h-3 w-3" /> Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={saveProfile} className="space-y-3">
              <button type="button" onClick={() => toast.success("Avatar updated in demo mode")} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-black text-primary"><Camera className="h-4 w-4" />Upload avatar</button>
              <div className="float-field"><input value={name} onChange={(e) => setName(e.target.value)} placeholder=" " /><label>Full name</label></div>
              <div className="float-field"><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder=" " /><label>Phone number</label></div>
              <div className="float-field"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder=" " /><label>Email address</label></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setName(user?.name ?? ""); setEmail(user?.email ?? ""); setEditingProfile(false); }} className="h-11 flex-1 rounded-xl bg-secondary text-sm font-black text-foreground ring-1 ring-border">Cancel</button>
                <button type="submit" className="btn-shine h-11 flex-1 rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Save profile</button>
              </div>
            </form>
          ) : (
            <ul className="space-y-2">
              <ProfileRow icon={User} label="Full name" value={user?.name ?? "—"} />
              <ProfileRow icon={PhoneIcon} label="Phone" value={phone} />
              <ProfileRow icon={Mail} label="Email" value={user?.email ?? "—"} />
            </ul>
          )}
        </section>

        <Link to="/app/savings" className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition active:scale-[0.99]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><PiggyBank className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-black">Savings Plans</p>
              <p className="text-[11px] text-muted-foreground">Manage your savings goals</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <form onSubmit={verifyKyc} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><h2 className="text-sm font-black">KYC Verification</h2></div>
          <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => toast.success("ID uploaded")} className="rounded-xl bg-secondary p-3 text-xs font-black text-foreground">Upload ID</button><button type="button" onClick={() => toast.success("Selfie captured")} className="rounded-xl bg-secondary p-3 text-xs font-black text-foreground">Take selfie</button></div>
          <div className="float-field mt-3"><input value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" placeholder=" " /><label>BVN</label></div>
          <button className="mt-4 h-11 w-full rounded-xl bg-secondary text-sm font-black text-primary ring-1 ring-border">Submit KYC</button>
        </form>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /><h2 className="text-sm font-black">Settings</h2></div>
          <div className="space-y-3"><ToggleRow icon={Sparkles} label="Dark Mode" active={darkMode} onClick={() => setDarkMode((v) => !v)} /><ToggleRow icon={Fingerprint} label="2FA" active={twoFa} onClick={() => setTwoFa((v) => !v)} /></div>
          <form onSubmit={updatePassword} className="mt-4 space-y-3"><div className="float-field"><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder=" " /><label>New password</label></div><button className="h-10 w-full rounded-xl bg-secondary text-xs font-black text-primary"><KeyRound className="mr-1 inline h-3.5 w-3.5" />Change Password</button></form>
          <form onSubmit={updatePin} className="mt-3 space-y-3"><div className="float-field"><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder=" " /><label>Transaction PIN</label></div><button className="h-10 w-full rounded-xl bg-secondary text-xs font-black text-primary"><Lock className="mr-1 inline h-3.5 w-3.5" />Update PIN</button></form>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h2 className="text-sm font-black">Investments</h2></div>
          <div className="space-y-2">
            {investments.map((product) => <div key={product.name} className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3 ring-1 ring-border"><div><p className="text-sm font-black">{product.name}</p><p className="text-[11px] text-muted-foreground">{product.note} · {product.returns}</p></div><button onClick={() => toast.success(`${product.name} investment started`, { description: `Simulated return ${product.returns}` })} className="rounded-xl bg-gradient-primary px-3 py-2 text-[11px] font-black text-primary-foreground">Invest Now</button></div>)}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2"><Umbrella className="h-4 w-4 text-primary" /><h2 className="text-sm font-black">Microinsurance</h2></div>
          <div className="grid grid-cols-2 gap-2">
            {insurance.map((plan) => <button key={plan} onClick={() => toast.success(`${plan} cover selected`, { description: "Demo policy quote generated" })} className="rounded-xl bg-secondary p-3 text-left text-xs font-black ring-1 ring-border"><HeartPulse className="mb-2 h-4 w-4 text-primary" />{plan}<p className="mt-1 font-medium text-muted-foreground">From ₦500/month</p></button>)}
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3 text-sm font-semibold text-destructive shadow-sm ring-1 ring-border transition hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>

        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          LexBank v1.0 · Powered by <span className="font-semibold text-foreground">LexTX</span>
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, active, onClick }: { icon: typeof User; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl bg-secondary p-3 text-left ring-1 ring-border">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 text-sm font-bold">{label}</span>
      <span className={`h-6 w-11 rounded-full p-0.5 transition ${active ? "bg-primary" : "bg-muted"}`}><span className={`block h-5 w-5 rounded-full bg-card shadow-sm transition ${active ? "translate-x-5" : ""}`} /></span>
    </button>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-secondary p-3 ring-1 ring-border">
      <Icon className="h-4 w-4 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-black text-foreground">{value}</p>
      </div>
    </li>
  );
}