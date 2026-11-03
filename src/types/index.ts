export type UserRole = "admin" | "trader";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  balance: number;
  equity: number;
  demoBalance: number;
  kycStatus: "verified" | "pending" | "unverified";
  status: "active" | "suspended";
  createdAt: string;
}

export type OrderType = "MARKET" | "LIMIT";
export type OrderSide = "BUY" | "SELL";
export type TradeStatus = "OPEN" | "CLOSED" | "CANCELLED";

export interface Trade {
  id: string;
  userId: string;
  userEmail: string;
  symbol: string;
  type: OrderSide;
  orderType: OrderType;
  lots: number;
  amount: number; // Volume in base units
  entryPrice: number;
  currentPrice: number;
  closePrice?: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  margin: number;
  pnl: number;
  status: TradeStatus;
  openedAt: string;
  closedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE_PROFIT" | "TRADE_LOSS" | "ADMIN_CREDIT";
  amount: number;
  balanceAfter: number;
  note: string;
  timestamp: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  source: string;
  status: "active" | "unsubscribed";
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface PlatformSettings {
  tradingHalted: boolean;
  maxLeverage: number;
  spreadMultiplier: number;
  maintenanceMode: boolean;
  minDeposit: number;
}

export interface MarketPair {
  symbol: string;
  name: string;
  type: "forex" | "crypto" | "commodities";
  price: number;
  bid: number;
  ask: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  spreadPips: number;
}

export interface SqlQueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  statementType?: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "CREATE" | "DROP" | "OTHER";
}
