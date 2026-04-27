import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Home, LineChart, MessageCircle, ArrowLeftRight, MoreHorizontal, CreditCard, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

const tabs = [
  { to: "/app/home", label: "Home", icon: Home },
  { to: "/app/lextx", label: "LexTX", icon: LineChart },
  { to: "/app/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/app/cards", label: "Cards", icon: CreditCard },
  { to: "/app/more", label: "More", icon: MoreHorizontal },
] as const;

function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [aiMinimized, setAiMinimized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (!user) return null;

  const showAiButton = pathname !== "/app/ai";

  return (
    <div ref={dragRef} className="relative min-h-screen bg-background pb-24 dark:bg-background">
      <Outlet />

      {showAiButton && (
        <motion.div
          drag
          dragConstraints={dragRef}
          dragElastic={0.15}
          dragMomentum={false}
          className="fixed bottom-24 right-3 z-40 flex cursor-grab items-center gap-2 active:cursor-grabbing"
          whileDrag={{ scale: 1.05 }}
        >
          {!aiMinimized && (
            <button
              type="button"
              onClick={() => setAiMinimized(true)}
              aria-label="Minimize AI assistant"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary shadow-card ring-1 ring-border transition active:scale-95"
            >
              <Minus className="h-4 w-4" />
            </button>
          )}
          <Link
            to="/app/ai"
            aria-label="Open Lexi AI chat"
            draggable={false}
            className={cn(
              "flex select-none items-center justify-center bg-gradient-primary text-primary-foreground shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)] ring-1 ring-white/40 transition active:scale-95",
              aiMinimized ? "h-12 w-12 rounded-full text-xs font-black" : "h-14 gap-2 rounded-full px-4 text-sm font-black",
            )}
            onClick={() => setAiMinimized(true)}
          >
            {aiMinimized ? "AI" : <><MessageCircle className="h-5 w-5" /> Lexi</>}
          </Link>
        </motion.div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-3 pb-3">
        <div className="rounded-2xl border border-border bg-card/95 px-2 py-2 shadow-card backdrop-blur-xl">
          <ul className="grid grid-cols-5 gap-1">
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
