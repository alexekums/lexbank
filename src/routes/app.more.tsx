import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, CreditCard, HelpCircle, Lock, LogOut, Settings, Shield, Sparkles, User } from "lucide-react";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
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
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </h2>
            <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-rose-100">
              {g.items.map((it, i) => (
                <li
                  key={it.label}
                  className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? "border-t border-rose-50" : ""}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-primary">
                    <it.icon className="h-4 w-4" />
                  </span>
                  <p className="flex-1 text-sm font-semibold">{it.label}</p>
                  {it.hint && <span className="text-[11px] text-emerald-600">{it.hint}</span>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </section>
        ))}

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