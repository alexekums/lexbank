import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LexBank — let's bank" },
      { name: "description", content: "LexBank: premium Nigerian banking powered by LexTX. Naira, USD, crypto and forex in one app." },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigate({ to: user ? "/app/home" : "/login" });
    }, 1800);
    return () => clearTimeout(t);
  }, [loading, user, navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-primary px-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center text-white"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
          <span className="text-4xl font-black">L</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">LexBank</h1>
        <p className="mt-3 text-xl font-semibold tracking-wide text-white">let's bank</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 text-xs font-medium uppercase tracking-[0.3em] text-white/70"
        >
          Powered by LexTX
        </motion.p>
      </motion.div>
    </main>
  );
}
