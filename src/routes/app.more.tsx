import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Camera, ChevronRight, CreditCard, Fingerprint, HelpCircle, KeyRound, Lock, LogOut, Settings, Shield, Sparkles, User } from "lucide-react";
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
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-7 pt-10 text-white shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-black ring-1 ring-white/30">
            {user?.name?.[0]?.toUpperCase() ?? "L"}
          </div>
          <div>
            <p className="text-lg font-bold">{user?.name}</p>
            <p className="text-xs text-white/80">{user?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/30">
              ✨ LexBank Plus
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 pt-5">
        <form onSubmit={saveProfile} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="mb-3 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-lg font-black text-primary">{name[0]?.toUpperCase() ?? "L"}</span><div><h2 className="text-sm font-black">Complete Profile</h2><p className="text-[11px] text-muted-foreground">Avatar, name, phone and email</p></div></div>
          <div className="space-y-3"><button type="button" onClick={() => toast.success("Avatar updated in demo mode")} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-black text-primary"><Camera className="h-4 w-4" />Upload avatar</button><div className="float-field"><input value={name} onChange={(e) => setName(e.target.value)} placeholder=" " /><label>Full name</label></div><div className="float-field"><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder=" " /><label>Phone number</label></div><div className="float-field"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder=" " /><label>Email address</label></div></div>
          <button className="btn-shine mt-4 h-11 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Save profile</button>
        </form>

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

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-rose-100 transition hover:bg-red-50"
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