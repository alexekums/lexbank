import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — LexBank" },
      { name: "description", content: "Welcome back to LexBank. Lex' Bank • Let's Bank." },
    ],
  }),
  component: LoginPage,
});

const slideVariants = {
  enterRight: { x: "60%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitLeft: { x: "-60%", opacity: 0 },
  enterLeft: { x: "-60%", opacity: 0 },
  exitRight: { x: "60%", opacity: 0 },
};

const transition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        if (!email || !password) throw new Error("Enter email and password");
        await login(email, password);
        toast.success("Welcome back 🔥");
      } else {
        if (!name || !email || !password) throw new Error("Fill all fields");
        if (password.length < 6) throw new Error("Password must be at least 6 chars");
        await signup(name, email, password);
        toast.success(`Welcome to LexBank, ${name.split(" ")[0]} 🎉`);
      }
      navigate({ to: "/app/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-100 px-5 py-10">
      {/* decorative blurs */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-glow/30 blur-3xl" />

      <div className="relative mx-auto flex max-w-md flex-col items-center pt-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card">
            <span className="text-lg font-black">L</span>
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight">LexBank</p>
            <p className="-mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Lex' Bank • Let's Bank
            </p>
          </div>
        </div>

        <div className="relative w-full overflow-hidden rounded-3xl bg-white/80 p-7 shadow-card ring-1 ring-rose-100 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/60" />

          <div className="relative" style={{ minHeight: 410 }}>
            <AnimatePresence mode="wait" initial={false}>
              {mode === "login" ? (
                <motion.form
                  key="login"
                  variants={slideVariants}
                  initial="enterRight"
                  animate="center"
                  exit="exitLeft"
                  transition={transition}
                  onSubmit={submit}
                  className="absolute inset-0 flex flex-col"
                >
                  <h1 className="text-2xl font-extrabold tracking-tight">Welcome Back 🔥</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Sign in to continue banking with Lex.</p>

                  <div className="mt-6 space-y-4">
                    <div className="float-field">
                      <input
                        id="email"
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                      <label htmlFor="email">Email address</label>
                    </div>
                    <div className="float-field">
                      <input
                        id="password"
                        type="password"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-shine mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
                  </button>

                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </p>

                  <p className="mt-auto pt-6 text-center text-[11px] text-muted-foreground">
                    🔒 Secured with bank-grade encryption
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  variants={slideVariants}
                  initial="enterLeft"
                  animate="center"
                  exit="exitRight"
                  transition={transition}
                  onSubmit={submit}
                  className="absolute inset-0 flex flex-col"
                >
                  <h1 className="text-2xl font-extrabold tracking-tight">Create your account ✨</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Join LexBank in under a minute.</p>

                  <div className="mt-6 space-y-4">
                    <div className="float-field">
                      <input
                        id="name"
                        type="text"
                        placeholder=" "
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                      <label htmlFor="name">Full name</label>
                    </div>
                    <div className="float-field">
                      <input
                        id="email-s"
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                      <label htmlFor="email-s">Email address</label>
                    </div>
                    <div className="float-field">
                      <input
                        id="password-s"
                        type="password"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <label htmlFor="password-s">Create password</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-shine mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary text-base font-semibold text-white shadow-card transition active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
                  </button>

                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">LexTX</span> — Lex Transactions
        </p>
      </div>
    </main>
  );
}

// suppress unused import warning for redirect (kept for future server-side guard)
void redirect;