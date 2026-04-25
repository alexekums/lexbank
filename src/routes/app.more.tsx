import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronDown, ChevronRight, Fingerprint, HeartPulse, IdCard, KeyRound, Lock, LogOut, Pencil, PiggyBank, ScanFace, Settings, Shield, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/more")({
  head: () => ({ meta: [{ title: "More — LexBank" }] }),
  component: MorePage,
});

type Section = "kyc" | "security" | "settings" | null;

function MorePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);
  const [section, setSection] = useState<Section>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "0803 452 1980");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [bvn, setBvn] = useState(user?.kyc?.bvn ?? "");
  const [idImage, setIdImage] = useState<string | undefined>(user?.kyc?.idImage);
  const [selfieImage, setSelfieImage] = useState<string | undefined>(user?.kyc?.selfieImage);
  const idFileRef = useRef<HTMLInputElement>(null);
  const selfieFileRef = useRef<HTMLInputElement>(null);

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

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    setAvatarPreview(url);
  };

  const onIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    setIdImage(url);
    updateUser({ kyc: { ...(user?.kyc ?? {}), idImage: url, idUploaded: true } });
    toast.success("ID uploaded");
  };

  const onSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    setSelfieImage(url);
    updateUser({ kyc: { ...(user?.kyc ?? {}), selfieImage: url, selfieTaken: true } });
    toast.success("Selfie captured");
  };

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateUser({ name: name.trim() || user?.name, email: email.trim() || user?.email, phone, avatar: avatarPreview });
    setEditingProfile(false);
    toast.success("Profile updated");
  };

  const verifyKyc = (e: FormEvent) => {
    e.preventDefault();
    if (bvn.replace(/\D/g, "").length !== 11) return toast.error("Enter an 11-digit BVN");
    updateUser({ kyc: { ...(user?.kyc ?? {}), bvn, idImage, selfieImage } });
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

  const toggleSection = (next: Section) => setSection((curr) => (curr === next ? null : next));
  const avatarSrc = avatarPreview ?? user?.avatar;

  return (
    <div className="mx-auto max-w-md">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-8 pt-10 text-white shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/30">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-black">{user?.name?.[0]?.toUpperCase() ?? "L"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black">{user?.name}</p>
            <p className="truncate text-xs text-white/80">{user?.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/30">
              ✨ LexBank Plus
            </span>
          </div>
        </div>
        {!editingProfile && (
          <button
            type="button"
            onClick={() => setEditingProfile(true)}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/15 text-sm font-black text-white ring-1 ring-white/30 transition active:scale-[0.99]"
          >
            <Pencil className="h-4 w-4" /> Edit Profile
          </button>
        )}
      </header>

      <div className="space-y-4 px-5 pt-5">
        <AnimatePresence>
          {editingProfile && (
            <motion.form
              key="edit-profile"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={saveProfile}
              className="space-y-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-secondary ring-1 ring-border">
                  {avatarSrc ? <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-primary" />}
                </div>
                <button type="button" onClick={() => avatarFileRef.current?.click()} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-black text-primary">
                  <Camera className="h-4 w-4" /> Upload avatar
                </button>
                <input ref={avatarFileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
              </div>
              <div className="float-field"><input value={name} onChange={(e) => setName(e.target.value)} placeholder=" " /><label>Full name</label></div>
              <div className="float-field"><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder=" " /><label>Phone number</label></div>
              <div className="float-field"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder=" " /><label>Email address</label></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setName(user?.name ?? ""); setEmail(user?.email ?? ""); setPhone(user?.phone ?? "0803 452 1980"); setAvatarPreview(user?.avatar); setEditingProfile(false); }} className="h-11 flex-1 rounded-xl bg-secondary text-sm font-black text-foreground ring-1 ring-border">Cancel</button>
                <button type="submit" className="btn-shine h-11 flex-1 rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Save profile</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

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

        <Link to="/app/insurance" className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition active:scale-[0.99]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><HeartPulse className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-black">Microinsurance</p>
              <p className="text-[11px] text-muted-foreground">Health, gadget, life & travel cover</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <SectionCard
          icon={Shield}
          title="KYC Verification"
          subtitle={user?.kyc?.bvn ? "Submitted" : "Verify your identity"}
          open={section === "kyc"}
          onToggle={() => toggleSection("kyc")}
        >
          <form onSubmit={verifyKyc} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => idFileRef.current?.click()} className="flex flex-col items-center justify-center gap-1 rounded-xl bg-secondary p-3 text-xs font-black text-foreground ring-1 ring-border">
                {idImage ? <img src={idImage} alt="ID" className="h-14 w-full rounded-md object-cover" /> : <IdCard className="h-5 w-5 text-primary" />}
                {idImage ? "Replace ID" : "Upload ID"}
              </button>
              <button type="button" onClick={() => selfieFileRef.current?.click()} className="flex flex-col items-center justify-center gap-1 rounded-xl bg-secondary p-3 text-xs font-black text-foreground ring-1 ring-border">
                {selfieImage ? <img src={selfieImage} alt="Selfie" className="h-14 w-full rounded-md object-cover" /> : <ScanFace className="h-5 w-5 text-primary" />}
                {selfieImage ? "Retake selfie" : "Take selfie"}
              </button>
              <input ref={idFileRef} type="file" accept="image/*" hidden onChange={onIdChange} />
              <input ref={selfieFileRef} type="file" accept="image/*" capture="user" hidden onChange={onSelfieChange} />
            </div>
            <div className="float-field"><input value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" placeholder=" " /><label>BVN</label></div>
            <button className="btn-shine h-11 w-full rounded-xl bg-gradient-primary text-sm font-black text-primary-foreground shadow-card">Submit KYC</button>
          </form>
        </SectionCard>

        <SectionCard
          icon={Lock}
          title="Security"
          subtitle="Password & transaction PIN"
          open={section === "security"}
          onToggle={() => toggleSection("security")}
        >
          <form onSubmit={updatePassword} className="space-y-3">
            <div className="float-field"><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder=" " /><label>New password</label></div>
            <button className="h-10 w-full rounded-xl bg-secondary text-xs font-black text-primary ring-1 ring-border"><KeyRound className="mr-1 inline h-3.5 w-3.5" />Change Password</button>
          </form>
          <form onSubmit={updatePin} className="mt-3 space-y-3">
            <div className="float-field"><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder=" " /><label>Transaction PIN</label></div>
            <button className="h-10 w-full rounded-xl bg-secondary text-xs font-black text-primary ring-1 ring-border"><Lock className="mr-1 inline h-3.5 w-3.5" />Update PIN</button>
          </form>
        </SectionCard>

        <SectionCard
          icon={Settings}
          title="Settings"
          subtitle="Theme & 2FA"
          open={section === "settings"}
          onToggle={() => toggleSection("settings")}
        >
          <div className="space-y-3">
            <ToggleRow icon={Sparkles} label="Dark Mode" active={darkMode} onClick={() => setDarkMode((v) => !v)} />
            <ToggleRow icon={Fingerprint} label="Two-factor auth" active={twoFa} onClick={() => setTwoFa((v) => !v)} />
          </div>
        </SectionCard>

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

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  icon: typeof User;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">{title}</p>
          {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ToggleRow({ icon: Icon, label, active, onClick }: { icon: typeof User; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl bg-secondary p-3 text-left ring-1 ring-border">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 text-sm font-bold">{label}</span>
      <span className={`h-6 w-11 rounded-full p-0.5 transition ${active ? "bg-primary" : "bg-muted"}`}>
        <span className={`block h-5 w-5 rounded-full bg-card shadow-sm transition ${active ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

