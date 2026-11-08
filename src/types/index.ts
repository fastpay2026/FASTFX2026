export type UserRole = "admin" | "trader";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  balance: number;
  equity: number;
  demoBalance: number;
  kycStatus: "verified" | "pending" | "unverified" | "rejected";
  kycTier?: "TIER_1_STANDARD" | "TIER_2_INSTITUTIONAL" | "TIER_3_UNLIMITED";
  kycNotes?: string;
  country?: string;
  phone?: string;
  status: "active" | "suspended" | "frozen";
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
  closeReason?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE_PROFIT" | "TRADE_LOSS" | "ADMIN_CREDIT" | "TRANSFER_IN" | "TRANSFER_OUT";
  amount: number;
  balanceAfter: number;
  note: string;
  timestamp: string;
}

export interface FundRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  paymentMethod: "BANK_WIRE" | "CRYPTO_USDT" | "SEPA" | "INSTITUTIONAL_LEDGER";
  txReference: string;
  destinationAddress?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  amountAlreadyDeducted?: boolean;
}

export interface ManagedMarketPair {
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
  minLots: number;
  maxLots: number;
  maxLeverage: number;
  tradingEnabled: boolean;
}

export interface PlatformBroadcast {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "urgent";
  active: boolean;
  createdAt: string;
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
  allowNewRegistrations: boolean;
  riskMode: "A_BOOK" | "B_BOOK" | "HYBRID";
  autoLiquidationLevel: number; // e.g. 20%
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

export type ServerStatus = "ONLINE" | "REBOOTING" | "MAINTENANCE" | "DEGRADED" | "OFFLINE";

export interface ServerNode {
  id: string;
  name: string;
  role: string;
  region: string;
  datacenter: string;
  ipAddress: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatencyMs: number;
  bandwidthGbps: number;
  uptimeHours: number;
  activeConnections: number;
  status: ServerStatus;
  lastRebootedAt?: string;
  version: string;
}

export type SystemLogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "CRITICAL";

export interface SystemLogEntry {
  id: string;
  serverId: string;
  serverName: string;
  level: SystemLogLevel;
  component: string;
  message: string;
  timestamp: string;
  metadata?: string;
}

