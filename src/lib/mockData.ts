export const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(n);

export const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number; // negative = debit
  date: string;
  icon: string;
}

export const mockTransactions: Transaction[] = [
  { id: "t1", title: "MTN Airtime", category: "Data & Airtime", amount: -5000, date: "Today, 10:24", icon: "📱" },
  { id: "t2", title: "Salary — Acme Ltd", category: "Income", amount: 850000, date: "Yesterday", icon: "💼" },
  { id: "t3", title: "Chicken Republic", category: "Food", amount: -7800, date: "Yesterday", icon: "🍗" },
  { id: "t4", title: "Transfer to Tunde", category: "Transfer", amount: -25000, date: "Mon", icon: "↗️" },
  { id: "t5", title: "Spotify", category: "Subscriptions", amount: -1300, date: "Mon", icon: "🎧" },
  { id: "t6", title: "Uber Ride", category: "Transport", amount: -3450, date: "Sun", icon: "🚕" },
  { id: "t7", title: "Glo Data 10GB", category: "Data & Airtime", amount: -3500, date: "Sat", icon: "🌐" },
];

export interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number;
  change24h: number;
}

export const mockCrypto: CryptoHolding[] = [
  { symbol: "BTC", name: "Bitcoin", amount: 0.0421, priceUsd: 67890, change24h: 2.34 },
  { symbol: "ETH", name: "Ethereum", amount: 0.812, priceUsd: 3520, change24h: -1.12 },
  { symbol: "USDT", name: "Tether", amount: 1240.5, priceUsd: 1, change24h: 0.01 },
];

export interface ForexPair {
  pair: string;
  bid: number;
  ask: number;
  change: number;
}

export const initialForex: ForexPair[] = [
  { pair: "USD/NGN", bid: 1612.45, ask: 1614.20, change: 0.42 },
  { pair: "EUR/USD", bid: 1.0842, ask: 1.0844, change: -0.18 },
  { pair: "GBP/USD", bid: 1.2715, ask: 1.2718, change: 0.27 },
  { pair: "USD/JPY", bid: 154.32, ask: 154.35, change: -0.05 },
  { pair: "AUD/USD", bid: 0.6428, ask: 0.6430, change: 0.12 },
  { pair: "USD/CAD", bid: 1.3725, ask: 1.3728, change: -0.09 },
  { pair: "NZD/USD", bid: 0.5924, ask: 0.5927, change: 0.16 },
  { pair: "EUR/GBP", bid: 0.8526, ask: 0.8529, change: -0.11 },
  { pair: "USD/CHF", bid: 0.9132, ask: 0.9135, change: 0.08 },
  { pair: "EUR/JPY", bid: 167.31, ask: 167.36, change: 0.23 },
  { pair: "GBP/JPY", bid: 196.18, ask: 196.25, change: 0.34 },
  { pair: "EUR/CAD", bid: 1.4882, ask: 1.4887, change: -0.14 },
  { pair: "AUD/JPY", bid: 99.21, ask: 99.26, change: 0.19 },
  { pair: "EUR/NGN", bid: 1747.80, ask: 1750.10, change: 0.31 },
];

export interface OpenPosition {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  lots: number;
  entry: number;
  leverage: number;
  marginNgn: number;
  pnl: number;
}

export const mockPositions: OpenPosition[] = [
  { id: "p1", pair: "USD/NGN", side: "BUY", lots: 0.5, entry: 1608.20, leverage: 100, marginNgn: 80410, pnl: 21000 },
  { id: "p2", pair: "EUR/USD", side: "SELL", lots: 0.2, entry: 1.0860, leverage: 100, marginNgn: 35000, pnl: -45 },
];

export const mockBalances = {
  ngn: 1284530.75,
  usd: 1840.22,
  tradingNgn: 250000,
  cryptoUsd: 0.0421 * 67890 + 0.812 * 3520 + 1240.5,
  tradingPnl: 20955,
};

// Approximate USD→NGN reference rate used for in-app conversions
export const USD_NGN_RATE = 1613.3;

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

export const initialChat: ChatMessage[] = [
  {
    id: "m1",
    role: "ai",
    text: "Hey 👋 I'm Lexi, your LexBank AI. Ask me about your spending, transfers, or anything money-related.",
    time: "Now",
  },
];