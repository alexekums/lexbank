import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { initialChat, type ChatMessage, formatNGN, formatUSD } from "@/lib/mockData";
import { useTransactions } from "@/lib/transactionsStore";
import { useBalances, DOM_ACCOUNTS } from "@/lib/balancesStore";

export const Route = createFileRoute("/app/ai")({
  head: () => ({ meta: [{ title: "Lexi AI — LexBank" }] }),
  component: AIPage,
});

const suggestions = [
  "Show my last 5 transactions",
  "How do I deposit crypto?",
  "Where can I exchange USD?",
  "How much did I spend?",
  "How does Spend to Save work?",
  "Show my account numbers",
];

type Ctx = {
  transactions: ReturnType<typeof useTransactions>;
  balances: ReturnType<typeof useBalances>;
  history: ChatMessage[];
};

function smartReply(msg: string, ctx: Ctx): string {
  const m = msg.toLowerCase();
  const { transactions, balances, history } = ctx;

  // Multi-turn: simple follow-ups
  const lastUser = [...history].reverse().find((h) => h.role === "user")?.text.toLowerCase() ?? "";
  if (/^(yes|sure|ok|okay|please|do it|go ahead)\b/i.test(m) && lastUser) {
    if (lastUser.includes("transaction") || lastUser.includes("spend")) {
      return "Tap any transaction on Home to see details, or hit 'See all transactions' for the full list.";
    }
    if (lastUser.includes("transfer") || lastUser.includes("send")) {
      return "Step 1 — Tap Transfers in the bottom nav. Step 2 — Pick LexBank Internal or Local bank transfer. Step 3 — Bank → Account number → Amount → Send.";
    }
  }

  // App navigation help
  if (/(how|where).*deposit.*crypto/.test(m) || /deposit crypto/.test(m)) {
    return "Open the LexTX tab → tap the pink 'Deposit to Crypto Wallet' button at the top. Pick BTC, ETH or USDT, enter the Naira amount, choose Bank/Card/Wallet, then Confirm Deposit.";
  }
  if (/(savings|save\b|spend to save|round up|goal)/.test(m)) {
    return "Tap the pink 'Save' quick action on Home. It opens the Savings dashboard. Toggle 'Spend to Save' to round every transaction up to ₦100 and stash the difference into a goal.";
  }
  if (/(exchange|fx|domiciliary|usd|gbp|eur|currency)/.test(m)) {
    const dom = balances.dom;
    return `Domiciliary balances → $${dom.USD.toFixed(2)} · £${dom.GBP.toFixed(2)} · €${dom.EUR.toFixed(2)}. Tap 'Exchange' on the Domiciliary card (Home or LexTX) — pick From/To, enter amount, see live rate, confirm.`;
  }
  if (/(account number|copy account|find my account)/.test(m)) {
    return `Your accounts:\n• NGN · 8021034521 (LexBank)\n• USD · ${DOM_ACCOUNTS.USD.number}\n• GBP · ${DOM_ACCOUNTS.GBP.number}\n• EUR · ${DOM_ACCOUNTS.EUR.number}\nTap any 'Copy' button to copy.`;
  }
  if (/(transfer|send money|local bank|beneficiar)/.test(m)) {
    return "Tap Transfers in the bottom nav. Choose LexBank Internal or Local bank transfer, pick the bank, enter account number — recipient name auto-fills. Add amount and narration, then Send. Use '+ Add Beneficiary' to save someone.";
  }
  if (/(bill|electricity|tv|cable|airtime|data\b|betting|waste|internet)/.test(m)) {
    return "Hit Bills on Home (or 'More Services'). Pick Electricity, Cable TV, Internet, Waste, Betting, ID Card, Airtime or Data. Fill the meter/smartcard/phone field, choose an amount, then Continue.";
  }
  if (/(card|freeze|spending limit|international)/.test(m)) {
    return "Open Cards in the bottom nav → tap your card. Freeze/Unfreeze, set a daily spending limit, and toggle international transactions on or off.";
  }
  if (/(invest|mutual fund|treasury|fixed deposit)/.test(m)) {
    return "On LexTX, scroll to Investments. Tap 'Invest Now' on Mutual Funds, Treasury Bills, or Fixed Deposits. Enter amount, pick a tenor (30/90/180/365 days), preview returns, Confirm.";
  }
  if (/(insurance|microinsurance|health|gadget|life|travel insurance)/.test(m)) {
    return "Open More → Microinsurance, or 'More Services' on Home. Pick Health, Gadget, Life or Travel, choose Monthly or Annual, then activate cover.";
  }
  if (/(refer|referral|earn)/.test(m)) {
    return "Your referral code is LEX-4521. Tap the Refer & Earn card on Home or in More to copy/share. You earn ₦1,000 per active friend.";
  }
  if (/(kyc|verify|verification|bvn|id upload)/.test(m)) {
    return "More → KYC Verification. Upload your ID, take a selfie, enter your BVN, then Submit. You'll be upgraded once verified.";
  }

  // Spending insights from real transactions
  if (/(last|recent|my).*(transaction|payment|spend)/.test(m) || /show.*transactions?/.test(m)) {
    const recent = transactions.slice(0, 5);
    if (!recent.length) return "No transactions yet. Make your first move and I'll start tracking patterns.";
    return "Your last transactions:\n" + recent.map((t) => `${t.icon} ${t.title} — ${t.amount > 0 ? "+" : "−"}${formatNGN(Math.abs(t.amount))} (${t.category}, ${t.date})`).join("\n");
  }
  if (/(how much).*(spend|spent)/.test(m)) {
    const debits = transactions.filter((t) => t.amount < 0);
    const total = debits.reduce((s, t) => s + Math.abs(t.amount), 0);
    const byCat = debits.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount); return acc; }, {});
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    return `You've spent ${formatNGN(total)} across ${debits.length} transactions. Top category: ${top?.[0] ?? "—"} (${formatNGN(top?.[1] ?? 0)}).`;
  }
  if (/(balance|how much.*have|wallet)/.test(m)) {
    const cryptoUsd = balances.crypto.reduce((s, c) => s + c.amount * c.priceUsd, 0);
    return `Spend Balance: ${formatNGN(balances.ngn)} · Trading: ${formatNGN(balances.tradingNgn)} · USD dom: $${balances.dom.USD.toFixed(2)} · Crypto: ${formatUSD(cryptoUsd)}.`;
  }

  // Categorization helpers
  const amount = m.match(/(?:₦|ngn|n)?\s*([0-9][0-9,]*)/i)?.[1]?.replace(/,/g, "");
  const naira = amount ? `₦${Number(amount).toLocaleString()}` : "that spend";
  if (/(calendar|news|cpi|nfp|rate decision|fomc)/.test(m)) {
    return "Forex brief: watch US CPI, Non-Farm Payrolls, FOMC rate guidance, crude oil, and CBN policy. High-impact windows widen spreads — reduce leverage and protect open positions with stops.";
  }
  if (/(food|restaurant|lunch|uber|bolt)/.test(m)) {
    return `Categorized ${naira} as Lifestyle & Transport. Try a fixed daily allowance for rides and eating out.`;
  }
  if (/(rent|school|fee)/.test(m)) {
    return `Categorized ${naira} as Essential Bills. Schedule the payment and keep at least 1.5× the bill amount as buffer.`;
  }
  if (m.includes("convert") || m.includes("usdt")) {
    return "Use Crypto → 'Convert to Naira' on LexTX, or use Domiciliary 'Exchange' for USD/GBP/EUR. Today's USD rate is ~₦1,650 per $1.";
  }
  if (m.includes("leverage")) {
    return "Leverage lets you control a larger position with less capital. e.g. 1:100 means ₦1,000 controls ₦100,000. Higher reward, higher risk — start small.";
  }

  return "I can help with: transfers, bills, savings/Spend to Save, crypto deposits, FX exchange, investments, cards, KYC, referral, or your transaction history. Try: 'How do I deposit crypto?' or 'Show my last transactions'.";
}

function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [input, setInput] = useState("");
  const transactions = useTransactions();
  const balances = useBalances();
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
      setMessages((prev) => {
        const reply = smartReply(value, { transactions, balances, history: prev });
        return [...prev, { id: crypto.randomUUID(), role: "ai", text: reply, time: now }];
      });
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
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
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-gradient-primary text-white"
                  : "rounded-bl-sm bg-card text-foreground ring-1 ring-border"
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
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm transition hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-20 z-20 px-5 pb-2">
        <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-card ring-1 ring-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lexi anything…"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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