import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { initialChat, type ChatMessage } from "@/lib/mockData";

export const Route = createFileRoute("/app/ai")({
  head: () => ({ meta: [{ title: "Lexi AI — LexBank" }] }),
  component: AIPage,
});

const suggestions = [
  "How much did I spend on airtime?",
  "Send ₦5,000 to Tunde",
  "Convert ₦100k to USDT",
  "Explain forex leverage",
];

function fakeReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("airtime") || m.includes("data")) {
    return "You've spent ₦45,800 on airtime & internet this month — categorized under Data & Airtime. That's about 18% more than last month. Want me to suggest a cheaper bundle?";
  }
  if (m.includes("send") || m.includes("transfer")) {
    return "Sure — opening the Transfers tab. I can split the amount or schedule it for later. Just say the word.";
  }
  if (m.includes("convert") || m.includes("usdt") || m.includes("usd")) {
    return "At today's LexTX rate, ₦100,000 ≈ 62.05 USDT. Want me to execute the conversion now?";
  }
  if (m.includes("leverage")) {
    return "Leverage lets you control a larger position with less capital. e.g. 1:100 means ₦1,000 controls ₦100,000. Higher reward, higher risk — start small.";
  }
  return "Got it! I can help with transfers, spending insights, crypto conversions, or trading questions. What would you like to do?";
}

function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: value, time: now }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", text: fakeReply(value), time: now },
      ]);
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="rounded-b-3xl bg-gradient-primary px-5 pb-6 pt-10 text-white shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black">Lexi AI</h1>
            <p className="text-xs text-white/80">Your money assistant · Always on</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 px-5 py-5">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-gradient-primary text-white"
                  : "rounded-bl-sm bg-white text-foreground ring-1 ring-rose-100"
              }`}
            >
              {m.text}
              <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                {m.time}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-5 pb-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm transition hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-20 z-20 px-5 pb-2">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-card ring-1 ring-rose-100">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lexi anything…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card transition active:scale-95"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}