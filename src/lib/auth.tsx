import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface LexUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  kyc?: { idUploaded?: boolean; selfieTaken?: boolean; bvn?: string; idImage?: string; selfieImage?: string };
}

interface AuthCtx {
  user: LexUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (patch: Partial<LexUser>) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "lexbank.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LexUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persist = (u: LexUser | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    }
  };

  const login: AuthCtx["login"] = async (email) => {
    await new Promise((r) => setTimeout(r, 700));
    persist({ id: "demo-1", name: email.split("@")[0] || "Demo User", email });
  };

  const signup: AuthCtx["signup"] = async (name, email) => {
    await new Promise((r) => setTimeout(r, 800));
    persist({ id: "demo-1", name, email });
  };

  const logout = () => persist(null);
  const updateUser: AuthCtx["updateUser"] = (patch) => {
    if (!user) return;
    persist({ ...user, ...patch });
  };

  return <Ctx.Provider value={{ user, loading, login, signup, updateUser, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}