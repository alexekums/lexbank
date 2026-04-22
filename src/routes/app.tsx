import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Home, LineChart, MessageCircle, ArrowLeftRight, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

const tabs = [
  { to: "/app/home", label: "Home", icon: Home },
  { to: "/app/lextx", label: "LexTX", icon: LineChart },
  { to: "/app/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/app/more", label: "More", icon: MoreHorizontal },
] as const;

function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-rose-50/40 pb-24">
      <Outlet />

      <Link
        to="/app/ai"
        aria-label="Open Lexi AI chat"
        className="fixed bottom-24 right-[max(1rem,calc((100vw-28rem)/2+1rem))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)] ring-1 ring-white/40 transition active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
      </Link>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-3 pb-3">
        <div className="rounded-2xl border border-rose-100 bg-white/95 px-2 py-2 shadow-card backdrop-blur-xl">
          <ul className="grid grid-cols-4 gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = pathname === t.to || pathname.startsWith(t.to + "/");
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl transition",
                        active && "bg-gradient-primary text-white shadow-card",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}