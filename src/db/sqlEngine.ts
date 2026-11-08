import {
  User,
  Trade,
  Transaction,
  Subscriber,
  AuditLog,
  PlatformSettings,
  SqlQueryResult,
  FundRequest,
  ManagedMarketPair,
  PlatformBroadcast,
  ServerNode,
  ServerStatus,
  SystemLogLevel,
  SystemLogEntry
} from "../types";

export const SUPER_ADMIN_EMAIL = "admin@fast-fx.uk";
const DB_STORAGE_KEY = "fast_fx_relational_sql_db_v3";

interface DatabaseState {
  users: User[];
  trades: Trade[];
  transactions: Transaction[];
  subscribers: Subscriber[];
  audit_logs: AuditLog[];
  platform_settings: PlatformSettings;
  fund_requests: FundRequest[];
  market_instruments: ManagedMarketPair[];
  broadcasts: PlatformBroadcast[];
  server_nodes: ServerNode[];
  system_logs: SystemLogEntry[];
}

const initialMarketInstruments: ManagedMarketPair[] = [
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    type: "forex",
    price: 1.0945,
    bid: 1.0944,
    ask: 1.0946,
    change24h: 0.18,
    high24h: 1.0975,
    low24h: 1.0921,
    volume24h: "$4.2B",
    spreadPips: 0.2,
    minLots: 0.01,
    maxLots: 100.0,
    maxLeverage: 500,
    tradingEnabled: true
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    type: "forex",
    price: 1.2721,
    bid: 1.2720,
    ask: 1.2723,
    change24h: -0.09,
    high24h: 1.2760,
    low24h: 1.2690,
    volume24h: "$2.8B",
    spreadPips: 0.3,
    minLots: 0.01,
    maxLots: 100.0,
    maxLeverage: 500,
    tradingEnabled: true
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    type: "forex",
    price: 155.80,
    bid: 155.78,
    ask: 155.82,
    change24h: 0.35,
    high24h: 156.10,
    low24h: 155.30,
    volume24h: "$3.1B",
    spreadPips: 0.4,
    minLots: 0.01,
    maxLots: 100.0,
    maxLeverage: 500,
    tradingEnabled: true
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    type: "crypto",
    price: 96450.0,
    bid: 96445.0,
    ask: 96455.0,
    change24h: 1.85,
    high24h: 97800.0,
    low24h: 94900.0,
    volume24h: "$18.5B",
    spreadPips: 1.0,
    minLots: 0.01,
    maxLots: 50.0,
    maxLeverage: 100,
    tradingEnabled: true
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    type: "crypto",
    price: 3450.25,
    bid: 3449.80,
    ask: 3450.70,
    change24h: -0.72,
    high24h: 3520.0,
    low24h: 3410.0,
    volume24h: "$8.4B",
    spreadPips: 0.9,
    minLots: 0.01,
    maxLots: 50.0,
    maxLeverage: 100,
    tradingEnabled: true
  },
  {
    symbol: "SOL/USD",
    name: "Solana / US Dollar",
    type: "crypto",
    price: 188.40,
    bid: 188.35,
    ask: 188.45,
    change24h: 3.42,
    high24h: 194.20,
    low24h: 181.50,
    volume24h: "$4.1B",
    spreadPips: 0.8,
    minLots: 0.1,
    maxLots: 50.0,
    maxLeverage: 50,
    tradingEnabled: true
  },
  {
    symbol: "Gold (XAU)",
    name: "Spot Gold / USD",
    type: "commodities",
    price: 2342.1,
    bid: 2341.9,
    ask: 2342.3,
    change24h: -0.15,
    high24h: 2355.0,
    low24h: 2332.0,
    volume24h: "$5.6B",
    spreadPips: 0.4,
    minLots: 0.01,
    maxLots: 80.0,
    maxLeverage: 200,
    tradingEnabled: true
  },
  {
    symbol: "Crude Oil",
    name: "WTI Crude Oil",
    type: "commodities",
    price: 78.45,
    bid: 78.43,
    ask: 78.47,
    change24h: 1.25,
    high24h: 79.10,
    low24h: 77.80,
    volume24h: "$3.9B",
    spreadPips: 0.4,
    minLots: 0.1,
    maxLots: 100.0,
    maxLeverage: 100,
    tradingEnabled: true
  }
];

const initialFundRequests: FundRequest[] = [
  {
    id: "req_fnd_101",
    userId: "usr_trader_002",
    userEmail: "trader.alex@fastfx.com",
    userName: "Alex Mercer",
    type: "DEPOSIT",
    amount: 15000.0,
    paymentMethod: "BANK_WIRE",
    txReference: "SWIFT-CH9930214",
    status: "PENDING",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "req_fnd_102",
    userId: "usr_trader_003",
    userEmail: "sarah.invest@fastfx.com",
    userName: "Sarah Jenkins",
    type: "WITHDRAWAL",
    amount: 5000.0,
    paymentMethod: "CRYPTO_USDT",
    txReference: "TRC20-0x8892bcaef12",
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "req_fnd_100",
    userId: "usr_trader_002",
    userEmail: "trader.alex@fastfx.com",
    userName: "Alex Mercer",
    type: "DEPOSIT",
    amount: 25000.0,
    paymentMethod: "SEPA",
    txReference: "SEPA-DE88192019",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000 + 120000).toISOString(),
    reviewNote: "Verified with Bundesbank SEPA clearing gateway"
  }
];

const initialBroadcasts: PlatformBroadcast[] = [
  {
    id: "bc_001",
    title: "Equinix LD4 Server Optimization",
    message: "Scheduled matching engine latency calibration completed. Core fill latency verified at < 0.003ms.",
    severity: "info",
    active: true,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: "bc_002",
    title: "15-Day Grand Prix Priority Allocation",
    message: "Early registration is open for institutional accounts. Raw spreads 0.0 pips activated.",
    severity: "warning",
    active: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const initialServerNodes: ServerNode[] = [
  {
    id: "srv_ld4_match_01",
    name: "LD4-MATCH-CORE-01",
    role: "Ultra-Low Latency Matching Engine",
    region: "Europe West",
    datacenter: "Equinix LD4 (London Slough, UK)",
    ipAddress: "194.109.12.44",
    cpuUsage: 34.2,
    memoryUsage: 48.6,
    diskUsage: 28.5,
    networkLatencyMs: 0.12,
    bandwidthGbps: 18.4,
    uptimeHours: 3420,
    activeConnections: 1840,
    status: "ONLINE",
    lastRebootedAt: new Date(Date.now() - 142 * 24 * 3600 * 1000).toISOString(),
    version: "v4.19.4-fastfx-ld4"
  },
  {
    id: "srv_ld4_fix_02",
    name: "LD4-FIX-GATEWAY-02",
    role: "Institutional FIX Protocol 4.4 Bridge",
    region: "Europe West",
    datacenter: "Equinix LD4 (London Slough, UK)",
    ipAddress: "194.109.12.48",
    cpuUsage: 22.8,
    memoryUsage: 31.4,
    diskUsage: 19.2,
    networkLatencyMs: 0.18,
    bandwidthGbps: 8.7,
    uptimeHours: 2160,
    activeConnections: 490,
    status: "ONLINE",
    lastRebootedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    version: "v4.19.0-fix44"
  },
  {
    id: "srv_fr2_stream_01",
    name: "FR2-WS-FEED-01",
    role: "High-Frequency WebSocket Price Streamer",
    region: "Europe Central",
    datacenter: "Equinix FR2 (Frankfurt, DE)",
    ipAddress: "185.12.88.102",
    cpuUsage: 41.5,
    memoryUsage: 54.0,
    diskUsage: 35.1,
    networkLatencyMs: 0.42,
    bandwidthGbps: 14.2,
    uptimeHours: 1840,
    activeConnections: 2450,
    status: "ONLINE",
    lastRebootedAt: new Date(Date.now() - 76 * 24 * 3600 * 1000).toISOString(),
    version: "v4.19.3-ws-fast"
  },
  {
    id: "srv_ny4_liq_03",
    name: "NY4-LIQ-AGG-03",
    role: "Tier-1 Multi-Bank LP Liquidity Router",
    region: "North America East",
    datacenter: "Equinix NY4 (Secaucus NJ, USA)",
    ipAddress: "64.120.44.18",
    cpuUsage: 29.1,
    memoryUsage: 38.2,
    diskUsage: 24.6,
    networkLatencyMs: 0.74,
    bandwidthGbps: 11.5,
    uptimeHours: 4200,
    activeConnections: 320,
    status: "ONLINE",
    lastRebootedAt: new Date(Date.now() - 175 * 24 * 3600 * 1000).toISOString(),
    version: "v4.18.9-liq-agg"
  },
  {
    id: "srv_ld4_sql_master",
    name: "LD4-SQL-MASTER-01",
    role: "Primary Relational Core Database (PostgreSQL)",
    region: "Europe West",
    datacenter: "Equinix LD4 (London Slough, UK)",
    ipAddress: "10.240.40.10",
    cpuUsage: 48.7,
    memoryUsage: 68.3,
    diskUsage: 52.8,
    networkLatencyMs: 0.08,
    bandwidthGbps: 6.2,
    uptimeHours: 5120,
    activeConnections: 128,
    status: "ONLINE",
    lastRebootedAt: new Date(Date.now() - 213 * 24 * 3600 * 1000).toISOString(),
    version: "v16.3-fastfx-sql"
  },
  {
    id: "srv_dx1_risk_02",
    name: "DX1-RISK-GOV-02",
    role: "Real-Time Pre-Trade Risk & Margin Governor",
    region: "Middle East",
    datacenter: "Equinix DX1 (Dubai DIFC, UAE)",
    ipAddress: "195.229.110.22",
    cpuUsage: 19.4,
    memoryUsage: 26.8,
    diskUsage: 16.0,
    networkLatencyMs: 0.65,
    bandwidthGbps: 4.8,
    uptimeHours: 1420,
    activeConnections: 640,
    status: "ONLINE",
    lastRebootedAt: new Date(Date.now() - 59 * 24 * 3600 * 1000).toISOString(),
    version: "v4.19.1-risk-gov"
  }
];

const initialSystemLogs: SystemLogEntry[] = [
  {
    id: "slog_101",
    serverId: "srv_ld4_match_01",
    serverName: "LD4-MATCH-CORE-01",
    level: "INFO",
    component: "MATCH-CORE",
    message: "L2 Orderbook matching cycle completed. Core execution latency verified at 0.0028ms across 1,840 feeds.",
    timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
    metadata: "latency=0.0028ms queue=0 drops=0"
  },
  {
    id: "slog_102",
    serverId: "srv_fr2_stream_01",
    serverName: "FR2-WS-FEED-01",
    level: "INFO",
    component: "WS-STREAM",
    message: "Broadcasted EUR/USD tick 1.0945 to 2,450 concurrent subscriber channels. Zero buffer lag.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    metadata: "channels=2450 tickRate=1840/s"
  },
  {
    id: "slog_103",
    serverId: "srv_ld4_fix_02",
    serverName: "LD4-FIX-GATEWAY-02",
    level: "INFO",
    component: "FIX-SESSION",
    message: "Institutional Session FIX.4.4 logged on: CompID=BARCLAYS_LON_GW SeqNum=482109.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    metadata: "session=FIX44_LD4_09 heartbeat=30s"
  },
  {
    id: "slog_104",
    serverId: "srv_dx1_risk_02",
    serverName: "DX1-RISK-GOV-02",
    level: "INFO",
    component: "MARGIN-CHECK",
    message: "Pre-trade leverage check evaluated for 142 open positions. Fleet margin level safe at 348%.",
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    metadata: "riskLevel=SAFE margin=348%"
  },
  {
    id: "slog_105",
    serverId: "srv_ny4_liq_03",
    serverName: "NY4-LIQ-AGG-03",
    level: "WARN",
    component: "LP-BRIDGE",
    message: "JPMorgan Chase LP bridge returned momentary packet jitter (+1.8ms) during NY open rollover. Switched to primary dark pool route.",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    metadata: "lp=JPM_NY4 latencyDelta=+1.8ms failover=OK"
  },
  {
    id: "slog_106",
    serverId: "srv_ld4_sql_master",
    serverName: "LD4-SQL-MASTER-01",
    level: "INFO",
    component: "WAL-CHECKPOINT",
    message: "PostgreSQL WAL archive sync checkpoint completed. 48MB flushed to NVMe mirror. IOPS=48,200.",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    metadata: "walSize=48MB flushTime=1.8ms"
  },
  {
    id: "slog_107",
    serverId: "srv_fr2_stream_01",
    serverName: "FR2-WS-FEED-01",
    level: "DEBUG",
    component: "TLS-CIPHER",
    message: "TLS 1.3 handshake negotiation completed with ECDHE-RSA-AES256-GCM-SHA384 for client IP 92.184.22.10.",
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    metadata: "proto=TLS1.3 cert=valid"
  },
  {
    id: "slog_108",
    serverId: "srv_ld4_match_01",
    serverName: "LD4-MATCH-CORE-01",
    level: "INFO",
    component: "SYNCHRONIZER",
    message: "Clock drift NTP synchronization synchronized with PTP GPS Master clock at LD4. Drift: < 0.00004ms.",
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    metadata: "ntpServer=ld4-ptp-time.equinix.com offset=0.04us"
  },
  {
    id: "slog_109",
    serverId: "srv_dx1_risk_02",
    serverName: "DX1-RISK-GOV-02",
    level: "WARN",
    component: "MAX-DRAWDOWN",
    message: "High volatility threshold detected on XAU/USD gold pair. Auto-adjusted maximum B-book retention cap to $1,000,000.",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    metadata: "symbol=XAU/USD volDelta=+24%"
  },
  {
    id: "slog_110",
    serverId: "srv_ld4_fix_02",
    serverName: "LD4-FIX-GATEWAY-02",
    level: "INFO",
    component: "SECURITY",
    message: "Automated DDOS scrub filter inspected 420,000 packets. 0 malicious signatures detected. All traffic clean.",
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    metadata: "scrubber=CleanPipe ruleSet=Strict"
  }
];

const defaultInitialState: DatabaseState = {
  users: [
    {
      id: "usr_admin_001",
      email: SUPER_ADMIN_EMAIL,
      name: "مدير المنصة الرئيسي (Super Admin)",
      role: "admin",
      balance: 500000.0,
      equity: 500000.0,
      demoBalance: 100000.0,
      kycStatus: "verified",
      kycTier: "TIER_3_UNLIMITED",
      kycNotes: "Root institutional clearance verified with FSA London & FCA registry",
      country: "United Kingdom",
      phone: "+44 20 7946 0912",
      status: "active",
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "usr_trader_002",
      email: "trader.alex@fastfx.com",
      name: "Alex Mercer",
      role: "trader",
      balance: 25000.0,
      equity: 25840.0,
      demoBalance: 50000.0,
      kycStatus: "verified",
      kycTier: "TIER_2_INSTITUTIONAL",
      kycNotes: "Passport & Proof of Address verified. Proof of funds on record.",
      country: "Germany",
      phone: "+49 30 2312 8841",
      status: "active",
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "usr_trader_003",
      email: "sarah.invest@fastfx.com",
      name: "Sarah Jenkins",
      role: "trader",
      balance: 82400.0,
      equity: 81950.0,
      demoBalance: 100000.0,
      kycStatus: "pending",
      kycTier: "TIER_1_STANDARD",
      kycNotes: "Awaiting notarized bank reference letter for Tier 2 Institutional upgrade.",
      country: "United Arab Emirates",
      phone: "+971 4 391 2200",
      status: "active",
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "usr_trader_004",
      email: "khalid.trading@gulfcapital.sa",
      name: "خالد الشمري",
      role: "trader",
      balance: 145000.0,
      equity: 145200.0,
      demoBalance: 100000.0,
      kycStatus: "verified",
      kycTier: "TIER_2_INSTITUTIONAL",
      kycNotes: "Institutional Corporate Account documentation validated.",
      country: "Saudi Arabia",
      phone: "+966 11 482 1900",
      status: "active",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    }
  ],
  trades: [
    {
      id: "trd_881021",
      userId: "usr_admin_001",
      userEmail: SUPER_ADMIN_EMAIL,
      symbol: "EUR/USD",
      type: "BUY",
      orderType: "MARKET",
      lots: 2.0,
      amount: 200000,
      entryPrice: 1.0920,
      currentPrice: 1.0945,
      leverage: 100,
      stopLoss: 1.0880,
      takeProfit: 1.1000,
      margin: 2184.0,
      pnl: 500.0,
      status: "OPEN",
      openedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: "trd_881022",
      userId: "usr_admin_001",
      userEmail: SUPER_ADMIN_EMAIL,
      symbol: "BTC/USD",
      type: "BUY",
      orderType: "MARKET",
      lots: 1.0,
      amount: 95000,
      entryPrice: 95200.0,
      currentPrice: 96450.0,
      leverage: 50,
      stopLoss: 94000.0,
      takeProfit: 98000.0,
      margin: 1904.0,
      pnl: 1250.0,
      status: "OPEN",
      openedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    {
      id: "trd_881023",
      userId: "usr_trader_002",
      userEmail: "trader.alex@fastfx.com",
      symbol: "Gold (XAU)",
      type: "BUY",
      orderType: "MARKET",
      lots: 0.5,
      amount: 50,
      entryPrice: 2335.5,
      currentPrice: 2342.1,
      leverage: 100,
      margin: 1167.75,
      pnl: 330.0,
      status: "OPEN",
      openedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    },
    {
      id: "trd_881024",
      userId: "usr_trader_004",
      userEmail: "khalid.trading@gulfcapital.sa",
      symbol: "EUR/USD",
      type: "SELL",
      orderType: "MARKET",
      lots: 5.0,
      amount: 500000,
      entryPrice: 1.0960,
      currentPrice: 1.0945,
      leverage: 200,
      margin: 2736.0,
      pnl: 750.0,
      status: "OPEN",
      openedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
    },
    {
      id: "trd_881019",
      userId: "usr_trader_003",
      userEmail: "sarah.invest@fastfx.com",
      symbol: "USD/JPY",
      type: "SELL",
      orderType: "MARKET",
      lots: 1.5,
      amount: 150000,
      entryPrice: 156.20,
      currentPrice: 155.80,
      closePrice: 155.80,
      leverage: 100,
      margin: 1500.0,
      pnl: 384.6,
      status: "CLOSED",
      openedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ],
  transactions: [
    {
      id: "tx_001",
      userId: "usr_admin_001",
      userEmail: SUPER_ADMIN_EMAIL,
      type: "ADMIN_CREDIT",
      amount: 500000.0,
      balanceAfter: 500000.0,
      note: "Initial Institutional Liquidity Seed",
      timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "tx_002",
      userId: "usr_trader_002",
      userEmail: "trader.alex@fastfx.com",
      type: "DEPOSIT",
      amount: 25000.0,
      balanceAfter: 25000.0,
      note: "Bank Wire Deposit Verified",
      timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "tx_003",
      userId: "usr_trader_004",
      userEmail: "khalid.trading@gulfcapital.sa",
      type: "DEPOSIT",
      amount: 145000.0,
      balanceAfter: 145000.0,
      note: "Corporate Institutional Custody Transfer",
      timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    }
  ],
  subscribers: [
    {
      id: "sub_01",
      email: "vip.trader@london-fx.co.uk",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      source: "Countdown 15-day Landing",
      status: "active"
    },
    {
      id: "sub_02",
      email: "crypto.whale@dubai-capital.ae",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      source: "Countdown 15-day Landing",
      status: "active"
    },
    {
      id: "sub_03",
      email: SUPER_ADMIN_EMAIL,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      source: "Admin Priority Waitlist",
      status: "active"
    }
  ],
  audit_logs: [
    {
      id: "log_001",
      actorEmail: SUPER_ADMIN_EMAIL,
      action: "DATABASE_INITIALIZE",
      details: "PostgreSQL/SQLite Relational Schema v3.0 initialized successfully",
      timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "log_002",
      actorEmail: SUPER_ADMIN_EMAIL,
      action: "RISK_PARAMETERS_CONFIGURED",
      details: "Configured A-Book/B-Book hybrid execution routing with 20% auto-liquidation trigger",
      timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ],
  platform_settings: {
    tradingHalted: false,
    maxLeverage: 500,
    spreadMultiplier: 1.0,
    maintenanceMode: false,
    minDeposit: 50.0,
    allowNewRegistrations: true,
    riskMode: "HYBRID",
    autoLiquidationLevel: 20
  },
  fund_requests: initialFundRequests,
  market_instruments: initialMarketInstruments,
  broadcasts: initialBroadcasts,
  server_nodes: initialServerNodes,
  system_logs: initialSystemLogs
};

type DbChangeListener = () => void;

class SqlDatabaseEngine {
  private state: DatabaseState;
  private listeners: Set<DbChangeListener> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    if (typeof window === "undefined") {
      return defaultInitialState;
    }
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        // Ensure super admin always exists with correct email
        const hasSuperAdmin = parsed.users?.some(
          (u: User) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
        );
        if (!hasSuperAdmin) {
          parsed.users = [...(parsed.users || []), defaultInitialState.users[0]];
        }

        return {
          users: parsed.users || defaultInitialState.users,
          trades: parsed.trades || defaultInitialState.trades,
          transactions: parsed.transactions || defaultInitialState.transactions,
          subscribers: parsed.subscribers || defaultInitialState.subscribers,
          audit_logs: parsed.audit_logs || defaultInitialState.audit_logs,
          platform_settings: {
            ...defaultInitialState.platform_settings,
            ...(parsed.platform_settings || {})
          },
          fund_requests: parsed.fund_requests || defaultInitialState.fund_requests,
          market_instruments: parsed.market_instruments || defaultInitialState.market_instruments,
          broadcasts: parsed.broadcasts || defaultInitialState.broadcasts,
          server_nodes:
            parsed.server_nodes && parsed.server_nodes.length > 0
              ? parsed.server_nodes
              : defaultInitialState.server_nodes,
          system_logs:
            parsed.system_logs && parsed.system_logs.length > 0
              ? parsed.system_logs
              : defaultInitialState.system_logs
        };
      }
    } catch (e) {
      console.error("Failed to load SQL database from localStorage, initializing default state", e);
    }
    return defaultInitialState;
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error("Failed to save SQL database to localStorage", e);
    }
  }

  public subscribe(listener: DbChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in DB subscriber listener", err);
      }
    });
  }

  // --- SQL Parser & Query Executor ---
  public execute(sqlQuery: string): SqlQueryResult {
    const startTime = performance.now();
    const cleanSql = sqlQuery.trim().replace(/;$/, "");
    const upper = cleanSql.toUpperCase();

    try {
      // 1. SELECT Query
      if (upper.startsWith("SELECT")) {
        return this.executeSelect(cleanSql, startTime);
      }

      // 2. INSERT Query
      if (upper.startsWith("INSERT INTO")) {
        return this.executeInsert(cleanSql, startTime);
      }

      // 3. UPDATE Query
      if (upper.startsWith("UPDATE")) {
        return this.executeUpdate(cleanSql, startTime);
      }

      // 4. DELETE Query
      if (upper.startsWith("DELETE FROM")) {
        return this.executeDelete(cleanSql, startTime);
      }

      // 5. SHOW TABLES or PRAGMA table_info
      if (upper.includes("SHOW TABLES") || upper.includes("INFORMATION_SCHEMA")) {
        const tables = [
          "users",
          "trades",
          "transactions",
          "fund_requests",
          "market_instruments",
          "broadcasts",
          "subscribers",
          "audit_logs",
          "platform_settings"
        ];
        return {
          columns: ["table_name", "record_count", "engine"],
          rows: tables.map((tbl) => [tbl, (this.state as any)[tbl]?.length ?? 1, "Relational SQL (Postgres / SQLite)"]),
          rowCount: tables.length,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          statementType: "SELECT"
        };
      }

      // 6. CREATE TABLE
      if (upper.startsWith("CREATE TABLE")) {
        return {
          columns: ["result"],
          rows: [["Table schema registered in relational catalog."]],
          rowCount: 1,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          statementType: "CREATE"
        };
      }

      return {
        columns: ["message"],
        rows: [[`Statement executed successfully: ${cleanSql.slice(0, 40)}...`]],
        rowCount: 1,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        statementType: "OTHER"
      };
    } catch (err: any) {
      return {
        columns: ["error"],
        rows: [],
        rowCount: 0,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        error: err.message || "SQL Syntax Error or Execution Exception",
        statementType: "OTHER"
      };
    }
  }

  private executeSelect(sql: string, startTime: number): SqlQueryResult {
    const match = sql.match(/SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?$/i);

    if (!match) {
      throw new Error("Invalid SELECT statement format. Expected: SELECT <columns> FROM <table> [WHERE ...] [ORDER BY ...] [LIMIT ...]");
    }

    const selectClause = match[1].trim();
    const tableName = match[2].trim().toLowerCase();
    const whereClause = match[3]?.trim();
    const orderByClause = match[4]?.trim();
    const limitClause = match[5]?.trim();

    const tableData: any[] = (this.state as any)[tableName];
    if (!Array.isArray(tableData)) {
      throw new Error(`Table '${tableName}' does not exist in relational schema.`);
    }

    let results = [...tableData];

    // Filter WHERE
    if (whereClause) {
      results = results.filter((row) => this.evaluateWhereCondition(row, whereClause));
    }

    // Sort ORDER BY
    if (orderByClause) {
      const [orderCol, direction] = orderByClause.split(/\s+/);
      const isDesc = direction?.toUpperCase() === "DESC";
      results.sort((a, b) => {
        const valA = a[orderCol] ?? a[this.toCamelCase(orderCol)];
        const valB = b[orderCol] ?? b[this.toCamelCase(orderCol)];
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // Apply LIMIT
    if (limitClause) {
      const limitNum = parseInt(limitClause, 10);
      if (!isNaN(limitNum)) {
        results = results.slice(0, limitNum);
      }
    }

    // Determine columns
    let columns: string[] = [];
    if (selectClause === "*") {
      columns = results.length > 0 ? Object.keys(results[0]) : ["id", "status"];
    } else if (selectClause.toUpperCase().includes("COUNT(*)")) {
      return {
        columns: ["count"],
        rows: [[results.length]],
        rowCount: 1,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        statementType: "SELECT"
      };
    } else {
      columns = selectClause.split(",").map((c) => c.trim().replace(/^`|`$/g, ""));
    }

    // Extract rows
    const rows = results.map((row) =>
      columns.map((col) => {
        const val = row[col] ?? row[this.toCamelCase(col)];
        return val !== undefined ? val : null;
      })
    );

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      statementType: "SELECT"
    };
  }

  private executeInsert(sql: string, startTime: number): SqlQueryResult {
    const match = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*(?:\((.*?)\))?\s+VALUES\s*\((.*?)\)/i);
    if (!match) {
      throw new Error("Invalid INSERT statement. Expected: INSERT INTO <table> [(columns)] VALUES (values)");
    }

    const tableName = match[1].trim().toLowerCase();
    const colsStr = match[2]?.trim();
    const valsStr = match[3]?.trim();

    const tableData: any[] = (this.state as any)[tableName];
    if (!Array.isArray(tableData)) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    const rawValues = valsStr.split(",").map((v) => {
      const trimmed = v.trim();
      if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        return trimmed.slice(1, -1);
      }
      if (trimmed.toLowerCase() === "true") return true;
      if (trimmed.toLowerCase() === "false") return false;
      if (trimmed.toLowerCase() === "null") return null;
      const num = Number(trimmed);
      return isNaN(num) ? trimmed : num;
    });

    const newRow: any = {
      id: `${tableName.slice(0, 3)}_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };

    if (colsStr) {
      const cols = colsStr.split(",").map((c) => c.trim());
      cols.forEach((col, idx) => {
        const camel = this.toCamelCase(col);
        newRow[camel] = rawValues[idx];
        newRow[col] = rawValues[idx];
      });
    }

    tableData.unshift(newRow);
    this.saveToStorage();

    return {
      columns: ["affected_rows", "inserted_id"],
      rows: [[1, newRow.id]],
      rowCount: 1,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      statementType: "INSERT"
    };
  }

  private executeUpdate(sql: string, startTime: number): SqlQueryResult {
    const match = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?))?$/i);
    if (!match) {
      throw new Error("Invalid UPDATE statement. Expected: UPDATE <table> SET col = val [WHERE condition]");
    }

    const tableName = match[1].trim().toLowerCase();
    const setClause = match[2].trim();
    const whereClause = match[3]?.trim();

    const tableData: any[] = (this.state as any)[tableName];
    if (!Array.isArray(tableData)) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    const assignments: { key: string; value: any }[] = setClause.split(",").map((item) => {
      const [k, v] = item.split("=").map((s) => s.trim());
      let parsedVal: any = v;
      if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
        parsedVal = v.slice(1, -1);
      } else if (v.toLowerCase() === "true") parsedVal = true;
      else if (v.toLowerCase() === "false") parsedVal = false;
      else if (!isNaN(Number(v))) parsedVal = Number(v);

      return { key: k, value: parsedVal };
    });

    let affectedCount = 0;
    tableData.forEach((row) => {
      if (!whereClause || this.evaluateWhereCondition(row, whereClause)) {
        assignments.forEach(({ key, value }) => {
          row[key] = value;
          row[this.toCamelCase(key)] = value;
        });
        affectedCount++;
      }
    });

    if (affectedCount > 0) {
      this.saveToStorage();
    }

    return {
      columns: ["affected_rows"],
      rows: [[affectedCount]],
      rowCount: affectedCount,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      statementType: "UPDATE"
    };
  }

  private executeDelete(sql: string, startTime: number): SqlQueryResult {
    const match = sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?$/i);
    if (!match) {
      throw new Error("Invalid DELETE statement format.");
    }

    const tableName = match[1].trim().toLowerCase();
    const whereClause = match[2]?.trim();

    const tableData: any[] = (this.state as any)[tableName];
    if (!Array.isArray(tableData)) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    const initialLen = tableData.length;
    if (!whereClause) {
      (this.state as any)[tableName] = [];
    } else {
      (this.state as any)[tableName] = tableData.filter((row) => !this.evaluateWhereCondition(row, whereClause));
    }

    const affected = initialLen - (this.state as any)[tableName].length;
    this.saveToStorage();

    return {
      columns: ["affected_rows"],
      rows: [[affected]],
      rowCount: affected,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      statementType: "DELETE"
    };
  }

  private evaluateWhereCondition(row: any, condition: string): boolean {
    const eqMatch = condition.match(/([a-zA-Z0-9_]+)\s*(=|!=|>|<|LIKE)\s*(.*)/i);
    if (!eqMatch) return true;

    const col = eqMatch[1].trim();
    const op = eqMatch[2].toUpperCase();
    let valStr = eqMatch[3].trim();

    if ((valStr.startsWith("'") && valStr.endsWith("'")) || (valStr.startsWith('"') && valStr.endsWith('"'))) {
      valStr = valStr.slice(1, -1);
    }

    const rowVal = row[col] ?? row[this.toCamelCase(col)];
    if (rowVal === undefined) return false;

    if (op === "=") {
      return String(rowVal).toLowerCase() === valStr.toLowerCase();
    }
    if (op === "!=") {
      return String(rowVal).toLowerCase() !== valStr.toLowerCase();
    }
    if (op === ">") {
      return Number(rowVal) > Number(valStr);
    }
    if (op === "<") {
      return Number(rowVal) < Number(valStr);
    }
    if (op === "LIKE") {
      const pattern = valStr.replace(/%/g, ".*");
      return new RegExp(pattern, "i").test(String(rowVal));
    }
    return true;
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  // --- Type-safe ORM API ---

  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public registerUser(email: string, name: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) return existing;

    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      email,
      name: name || (isSuperAdmin ? "Super Admin" : "Trader " + email.split("@")[0]),
      role: isSuperAdmin ? "admin" : "trader",
      balance: isSuperAdmin ? 500000.0 : 10000.0,
      equity: isSuperAdmin ? 500000.0 : 10000.0,
      demoBalance: 50000.0,
      kycStatus: isSuperAdmin ? "verified" : "pending",
      kycTier: isSuperAdmin ? "TIER_3_UNLIMITED" : "TIER_1_STANDARD",
      kycNotes: isSuperAdmin ? "Root clearance" : "New registrant, pending document review",
      status: "active",
      createdAt: new Date().toISOString()
    };

    this.state.users.unshift(newUser);
    this.addAuditLog(email, "USER_REGISTER", `User registered with initial balance $${newUser.balance}`);
    this.saveToStorage();
    return newUser;
  }

  public updateUserBalance(userId: string, newBalance: number, note?: string): void {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      const prev = user.balance;
      user.balance = Number(newBalance.toFixed(2));
      user.equity = Number(newBalance.toFixed(2));

      this.state.transactions.unshift({
        id: `tx_${Date.now().toString(36)}`,
        userId: user.id,
        userEmail: user.email,
        type: newBalance >= prev ? "ADMIN_CREDIT" : "WITHDRAWAL",
        amount: Math.abs(newBalance - prev),
        balanceAfter: user.balance,
        note: note || `Admin balance adjustment ($${prev} -> $${newBalance})`,
        timestamp: new Date().toISOString()
      });

      this.addAuditLog(SUPER_ADMIN_EMAIL, "BALANCE_ADJUST", `User ${user.email} balance updated from $${prev} to $${newBalance}`);
      this.saveToStorage();
    }
  }

  // --- 1. Add Balance to Client ---
  public addBalanceToUser(userId: string, amountToAdd: number, note?: string): { success: boolean; newBalance?: number; error?: string } {
    if (amountToAdd <= 0) {
      return { success: false, error: "المبلغ المضاف يجب أن يكون أكبر من الصفر" };
    }
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    const prev = user.balance;
    const newBal = Number((user.balance + amountToAdd).toFixed(2));
    user.balance = newBal;
    user.equity = newBal;

    this.state.transactions.unshift({
      id: `tx_${Date.now().toString(36)}`,
      userId: user.id,
      userEmail: user.email,
      type: "ADMIN_CREDIT",
      amount: amountToAdd,
      balanceAfter: user.balance,
      note: note || `إيداع إداري مباشر: +$${amountToAdd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      timestamp: new Date().toISOString()
    });

    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      "ADMIN_BALANCE_ADD",
      `Credited $${amountToAdd} to ${user.email} (Previous: $${prev}, New: $${newBal}). Note: ${note || "Direct Credit"}`
    );
    this.saveToStorage();
    return { success: true, newBalance: newBal };
  }

  // --- 2. Freeze / Unfreeze Client Account ---
  public freezeUser(userId: string, reason?: string): { success: boolean; error?: string } {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "لا يمكن تجميد حساب المدير الرئيسي" };
    }

    user.status = "frozen";
    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      "USER_ACCOUNT_FROZEN",
      `Account ${user.email} frozen by Admin. Reason: ${reason || "Compliance & Security Hold"}`
    );
    this.saveToStorage();
    return { success: true };
  }

  public unfreezeUser(userId: string): { success: boolean; error?: string } {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    user.status = "active";
    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      "USER_ACCOUNT_UNFROZEN",
      `Account ${user.email} unfrozen and reactivated by Admin.`
    );
    this.saveToStorage();
    return { success: true };
  }

  // --- 3. Transfer Balance Between Clients ---
  public transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: number,
    adminNote?: string
  ): { success: boolean; error?: string; sourceBalance?: number; targetBalance?: number } {
    if (!fromUserId || !toUserId) {
      return { success: false, error: "يرجى تحديد حساب المرسل وحساب المستلم" };
    }
    if (fromUserId === toUserId) {
      return { success: false, error: "لا يمكن تحويل الرصيد إلى نفس الحساب" };
    }
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: "مبلغ التحويل يجب أن يكون أكبر من الصفر" };
    }

    const fromUser = this.state.users.find((u) => u.id === fromUserId);
    const toUser = this.state.users.find((u) => u.id === toUserId);

    if (!fromUser) {
      return { success: false, error: "حساب العميل المحول منه غير موجود" };
    }
    if (!toUser) {
      return { success: false, error: "حساب العميل المحول إليه غير موجود" };
    }

    if (fromUser.status === "frozen") {
      return { success: false, error: `حساب العميل المحول منه (${fromUser.name}) مُجمّد، لا يمكن التحويل منه` };
    }

    if (fromUser.balance < amount) {
      return {
        success: false,
        error: `رصيد العميل المحول منه غير كافٍ. الرصيد المتاح: $${fromUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} والمطلوب: $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      };
    }

    const cleanAmount = Number(amount.toFixed(2));
    fromUser.balance = Number((fromUser.balance - cleanAmount).toFixed(2));
    fromUser.equity = fromUser.balance;

    toUser.balance = Number((toUser.balance + cleanAmount).toFixed(2));
    toUser.equity = toUser.balance;

    const timestamp = new Date().toISOString();

    // 1. Transaction record for Source Client
    this.state.transactions.unshift({
      id: `tx_${Date.now().toString(36)}_out`,
      userId: fromUser.id,
      userEmail: fromUser.email,
      type: "TRANSFER_OUT",
      amount: cleanAmount,
      balanceAfter: fromUser.balance,
      note: adminNote
        ? `تحويل إداري صادر إلى ${toUser.name} (${toUser.email}) - بيان: ${adminNote}`
        : `تحويل إداري صادر إلى حساب ${toUser.name} (${toUser.email})`,
      timestamp
    });

    // 2. Transaction record for Destination Client
    this.state.transactions.unshift({
      id: `tx_${Date.now().toString(36)}_in`,
      userId: toUser.id,
      userEmail: toUser.email,
      type: "TRANSFER_IN",
      amount: cleanAmount,
      balanceAfter: toUser.balance,
      note: adminNote
        ? `تحويل إداري وارد من ${fromUser.name} (${fromUser.email}) - بيان: ${adminNote}`
        : `تحويل إداري وارد من حساب ${fromUser.name} (${fromUser.email})`,
      timestamp
    });

    // 3. Audit log
    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      "ADMIN_CLIENT_TRANSFER",
      `Transferred $${cleanAmount} from ${fromUser.email} to ${toUser.email}. Note: ${adminNote || "Direct Admin Transfer"}`
    );

    this.saveToStorage();
    return {
      success: true,
      sourceBalance: fromUser.balance,
      targetBalance: toUser.balance
    };
  }

  public updateUserKyc(userId: string, kycStatus: User["kycStatus"], kycNotes?: string, kycTier?: User["kycTier"]): void {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      user.kycStatus = kycStatus;
      if (kycNotes) user.kycNotes = kycNotes;
      if (kycTier) user.kycTier = kycTier;
      this.addAuditLog(SUPER_ADMIN_EMAIL, "KYC_UPDATE", `User ${user.email} KYC set to ${kycStatus} (${kycTier || "N/A"})`);
      this.saveToStorage();
    }
  }

  public toggleUserStatus(userId: string): void {
    const user = this.state.users.find((u) => u.id === userId);
    if (user && user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      user.status = user.status === "active" ? "suspended" : "active";
      this.addAuditLog(SUPER_ADMIN_EMAIL, "USER_STATUS_CHANGE", `User ${user.email} status toggled to ${user.status}`);
      this.saveToStorage();
    }
  }

  public toggleUserRole(userId: string): void {
    const user = this.state.users.find((u) => u.id === userId);
    if (user && user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      user.role = user.role === "admin" ? "trader" : "admin";
      this.addAuditLog(SUPER_ADMIN_EMAIL, "ROLE_CHANGE", `User ${user.email} role changed to ${user.role}`);
      this.saveToStorage();
    }
  }

  // --- Fund Requests (Deposits & 4. Withdrawals Workflow) ---

  public getFundRequests(): FundRequest[] {
    return [...this.state.fund_requests];
  }

  // Client or Admin requests a withdrawal
  public requestWithdrawal(
    userId: string,
    amount: number,
    paymentMethod: FundRequest["paymentMethod"],
    destinationAddress: string,
    note?: string
  ): { success: boolean; error?: string; request?: FundRequest } {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }
    if (user.status === "frozen") {
      return { success: false, error: "هذا الحساب مجمّد حالياً من قِبل إدارة الامتثال، لا يمكن طلب السحب" };
    }
    if (user.status === "suspended") {
      return { success: false, error: "الحساب موقوف، لا يمكن إتمام عمليات السحب" };
    }
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: "مبلغ السحب يجب أن يكون أكبر من صفر" };
    }
    if (user.balance < amount) {
      return {
        success: false,
        error: `الرصيد المتاح ($${user.balance.toFixed(2)}) أقل من المبلغ المطلوب سحبه ($${amount.toFixed(2)})`
      };
    }

    const cleanAmount = Number(amount.toFixed(2));

    // Lock/Hold the withdrawal amount immediately from available balance
    user.balance = Number((user.balance - cleanAmount).toFixed(2));
    user.equity = user.balance;

    const newRequest: FundRequest = {
      id: `req_wdr_${Date.now().toString(36)}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      type: "WITHDRAWAL",
      amount: cleanAmount,
      paymentMethod,
      destinationAddress,
      txReference: `WDR-${Date.now().toString(36).toUpperCase()}`,
      status: "PENDING",
      amountAlreadyDeducted: true,
      reviewNote: note,
      createdAt: new Date().toISOString()
    };

    this.state.fund_requests.unshift(newRequest);

    this.state.transactions.unshift({
      id: `tx_${Date.now().toString(36)}`,
      userId: user.id,
      userEmail: user.email,
      type: "WITHDRAWAL",
      amount: cleanAmount,
      balanceAfter: user.balance,
      note: `طلب سحب قيد المعالجة (${paymentMethod} -> ${destinationAddress || "N/A"})`,
      timestamp: new Date().toISOString()
    });

    this.addAuditLog(
      user.email,
      "WITHDRAWAL_REQUESTED",
      `Withdrawal requested: $${cleanAmount} via ${paymentMethod} to ${destinationAddress || "N/A"}`
    );

    this.saveToStorage();
    return { success: true, request: newRequest };
  }

  // Admin Approves a Fund Request (Deposit or Withdrawal)
  public approveFundRequest(requestId: string, reviewNote?: string): { success: boolean; error?: string } {
    const req = this.state.fund_requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: "طلب التحويل غير موجود" };
    }
    if (req.status !== "PENDING") {
      return { success: false, error: `الطلب تمت معالجته مسبقاً (${req.status})` };
    }

    req.status = "APPROVED";
    req.reviewedAt = new Date().toISOString();
    req.reviewNote = reviewNote || "تمت الموافقة والاعتماد من قِبل إدارة الامتثال والخزينة";

    const user = this.state.users.find((u) => u.id === req.userId);
    if (user) {
      if (req.type === "DEPOSIT") {
        user.balance = Number((user.balance + req.amount).toFixed(2));
        user.equity = user.balance;
        this.state.transactions.unshift({
          id: `tx_${Date.now().toString(36)}`,
          userId: user.id,
          userEmail: user.email,
          type: "DEPOSIT",
          amount: req.amount,
          balanceAfter: user.balance,
          note: `إيداع معتمد: مرجع ${req.txReference}`,
          timestamp: new Date().toISOString()
        });
      } else if (req.type === "WITHDRAWAL") {
        // If not deducted yet (legacy/initial seeds), deduct now
        if (!req.amountAlreadyDeducted) {
          user.balance = Number((user.balance - req.amount).toFixed(2));
          user.equity = user.balance;
        }
        this.state.transactions.unshift({
          id: `tx_${Date.now().toString(36)}`,
          userId: user.id,
          userEmail: user.email,
          type: "WITHDRAWAL",
          amount: req.amount,
          balanceAfter: user.balance,
          note: `سحب معتمد نهائياً ومحوّل للعميل: ${req.txReference} (${reviewNote || req.paymentMethod})`,
          timestamp: new Date().toISOString()
        });
      }
    }

    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      req.type === "WITHDRAWAL" ? "WITHDRAWAL_APPROVED" : "DEPOSIT_APPROVED",
      `Approved ${req.type} request ${req.id} ($${req.amount}) for ${req.userEmail}. Note: ${req.reviewNote}`
    );
    this.saveToStorage();
    return { success: true };
  }

  // Admin Rejects a Fund Request (Refunds held funds if withdrawal)
  public rejectFundRequest(requestId: string, reviewNote: string): { success: boolean; error?: string } {
    const req = this.state.fund_requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, error: "طلب التحويل غير موجود" };
    }
    if (req.status !== "PENDING") {
      return { success: false, error: `الطلب تمت معالجته مسبقاً (${req.status})` };
    }

    req.status = "REJECTED";
    req.reviewedAt = new Date().toISOString();
    req.reviewNote = reviewNote || "تم رفض الطلب لعدم مطابقة بيانات التحقق والامتثال";

    const user = this.state.users.find((u) => u.id === req.userId);
    if (user) {
      // If it was a withdrawal where funds were held/locked, REFUND them back to user!
      if (req.type === "WITHDRAWAL" && req.amountAlreadyDeducted) {
        user.balance = Number((user.balance + req.amount).toFixed(2));
        user.equity = user.balance;

        this.state.transactions.unshift({
          id: `tx_${Date.now().toString(36)}`,
          userId: user.id,
          userEmail: user.email,
          type: "ADMIN_CREDIT",
          amount: req.amount,
          balanceAfter: user.balance,
          note: `استرجاع رصيد: تم رفض طلب السحب (${reviewNote || "مرفوض من الإدارة"})`,
          timestamp: new Date().toISOString()
        });
      }
    }

    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      req.type === "WITHDRAWAL" ? "WITHDRAWAL_REJECTED" : "DEPOSIT_REJECTED",
      `Rejected ${req.type} request ${req.id} for ${req.userEmail}. Reason: ${req.reviewNote}`
    );
    this.saveToStorage();
    return { success: true };
  }

  // --- Market Instruments Controls ---

  public getMarketInstruments(): ManagedMarketPair[] {
    return [...this.state.market_instruments];
  }

  public updateMarketInstrument(symbol: string, updates: Partial<ManagedMarketPair>): void {
    const pair = this.state.market_instruments.find((p) => p.symbol === symbol);
    if (pair) {
      Object.assign(pair, updates);
      this.addAuditLog(SUPER_ADMIN_EMAIL, "MARKET_PAIR_UPDATE", `Updated pair ${symbol}: ${JSON.stringify(updates)}`);
      this.saveToStorage();
    }
  }

  public toggleMarketInstrument(symbol: string): void {
    const pair = this.state.market_instruments.find((p) => p.symbol === symbol);
    if (pair) {
      pair.tradingEnabled = !pair.tradingEnabled;
      this.addAuditLog(SUPER_ADMIN_EMAIL, "MARKET_PAIR_TOGGLE", `Pair ${symbol} tradingEnabled set to ${pair.tradingEnabled}`);
      this.saveToStorage();
    }
  }

  public addMarketInstrument(instrument: ManagedMarketPair): void {
    const existing = this.state.market_instruments.find((p) => p.symbol === instrument.symbol);
    if (!existing) {
      this.state.market_instruments.unshift(instrument);
      this.addAuditLog(SUPER_ADMIN_EMAIL, "MARKET_PAIR_ADDED", `Added new market pair ${instrument.symbol}`);
      this.saveToStorage();
    }
  }

  // --- Broadcasts / System Announcements ---

  public getBroadcasts(): PlatformBroadcast[] {
    return [...this.state.broadcasts];
  }

  public createBroadcast(title: string, message: string, severity: PlatformBroadcast["severity"]): PlatformBroadcast {
    const newBc: PlatformBroadcast = {
      id: `bc_${Date.now().toString(36)}`,
      title,
      message,
      severity,
      active: true,
      createdAt: new Date().toISOString()
    };
    this.state.broadcasts.unshift(newBc);
    this.addAuditLog(SUPER_ADMIN_EMAIL, "BROADCAST_CREATED", `Created broadcast: ${title}`);
    this.saveToStorage();
    return newBc;
  }

  public toggleBroadcast(id: string): void {
    const bc = this.state.broadcasts.find((b) => b.id === id);
    if (bc) {
      bc.active = !bc.active;
      this.saveToStorage();
    }
  }

  public deleteBroadcast(id: string): void {
    this.state.broadcasts = this.state.broadcasts.filter((b) => b.id !== id);
    this.saveToStorage();
  }

  // --- Trading API & Liquidation ---

  public getTrades(userId?: string): Trade[] {
    if (userId) {
      return this.state.trades.filter((t) => t.userId === userId);
    }
    return [...this.state.trades];
  }

  public createTrade(tradeData: Omit<Trade, "id" | "openedAt" | "status" | "pnl">): Trade {
    const newTrade: Trade = {
      ...tradeData,
      id: `trd_${Date.now().toString(36)}`,
      status: "OPEN",
      pnl: 0,
      openedAt: new Date().toISOString()
    };

    this.state.trades.unshift(newTrade);
    this.addAuditLog(newTrade.userEmail, "ORDER_EXECUTED", `${newTrade.type} ${newTrade.lots} lots ${newTrade.symbol} @ ${newTrade.entryPrice}`);
    this.saveToStorage();
    return newTrade;
  }

  public closeTrade(tradeId: string, closePrice: number, finalPnl: number, reason: string = "Trader Closed"): void {
    const trade = this.state.trades.find((t) => t.id === tradeId);
    if (trade && trade.status === "OPEN") {
      trade.status = "CLOSED";
      trade.closePrice = closePrice;
      trade.pnl = Number(finalPnl.toFixed(2));
      trade.closedAt = new Date().toISOString();
      trade.closeReason = reason;

      const user = this.state.users.find((u) => u.id === trade.userId);
      if (user) {
        user.balance = Number((user.balance + finalPnl).toFixed(2));
        user.equity = user.balance;

        this.state.transactions.unshift({
          id: `tx_${Date.now().toString(36)}`,
          userId: user.id,
          userEmail: user.email,
          type: finalPnl >= 0 ? "TRADE_PROFIT" : "TRADE_LOSS",
          amount: Math.abs(finalPnl),
          balanceAfter: user.balance,
          note: `Closed ${trade.symbol} ${trade.type} position (${reason})`,
          timestamp: new Date().toISOString()
        });
      }

      this.addAuditLog(trade.userEmail, "ORDER_CLOSED", `Closed trade ${trade.id} on ${trade.symbol} with PnL $${finalPnl} (${reason})`);
      this.saveToStorage();
    }
  }

  public forceLiquidatePosition(tradeId: string, reason: string): void {
    const trade = this.state.trades.find((t) => t.id === tradeId);
    if (trade && trade.status === "OPEN") {
      const pair = this.state.market_instruments.find((p) => p.symbol === trade.symbol);
      const closePrice = pair ? pair.price : trade.entryPrice;
      this.closeTrade(tradeId, closePrice, trade.pnl, `Admin Liquidation: ${reason}`);
      this.addAuditLog(SUPER_ADMIN_EMAIL, "FORCE_LIQUIDATION", `Force liquidated trade ${tradeId} (${trade.symbol}) by Admin: ${reason}`);
    }
  }

  public updateTradeLivePnL(tradeId: string, currentPrice: number, livePnl: number): void {
    const trade = this.state.trades.find((t) => t.id === tradeId);
    if (trade && trade.status === "OPEN") {
      trade.currentPrice = currentPrice;
      trade.pnl = Number(livePnl.toFixed(2));
    }
  }

  // --- Subscribers ---

  public getSubscribers(): Subscriber[] {
    return [...this.state.subscribers];
  }

  public addSubscriber(email: string): { success: boolean; message: string } {
    const clean = email.trim().toLowerCase();
    const existing = this.state.subscribers.find((s) => s.email.toLowerCase() === clean);
    if (existing) {
      return { success: false, message: "Email is already registered on the waitlist." };
    }

    const sub: Subscriber = {
      id: `sub_${Date.now().toString(36)}`,
      email: clean,
      createdAt: new Date().toISOString(),
      source: "Countdown 15-day Landing",
      status: "active"
    };

    this.state.subscribers.unshift(sub);
    this.addAuditLog(clean, "SUBSCRIBER_JOINED", `Joined 15-day countdown priority list`);
    this.saveToStorage();
    return { success: true, message: "Successfully registered on the VIP waitlist." };
  }

  // --- Transactions & Audit Logs ---

  public getTransactions(userId?: string): Transaction[] {
    if (userId) {
      return this.state.transactions.filter((tx) => tx.userId === userId);
    }
    return [...this.state.transactions];
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.audit_logs];
  }

  public addAuditLog(actorEmail: string, action: string, details: string): void {
    this.state.audit_logs.unshift({
      id: `log_${Date.now().toString(36)}`,
      actorEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    if (this.state.audit_logs.length > 300) {
      this.state.audit_logs.pop();
    }
  }

  // --- Platform Settings ---

  public getSettings(): PlatformSettings {
    return { ...this.state.platform_settings };
  }

  public updateSettings(settings: Partial<PlatformSettings>): void {
    this.state.platform_settings = { ...this.state.platform_settings, ...settings };
    this.addAuditLog(SUPER_ADMIN_EMAIL, "SETTINGS_UPDATE", JSON.stringify(settings));
    this.saveToStorage();
  }

  // --- Risk & Book Analytics ---

  public getRiskSummary() {
    const openTrades = this.state.trades.filter((t) => t.status === "OPEN");
    const longTrades = openTrades.filter((t) => t.type === "BUY");
    const shortTrades = openTrades.filter((t) => t.type === "SELL");

    const totalLongVolume = longTrades.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalShortVolume = shortTrades.reduce((acc, t) => acc + (t.amount || 0), 0);
    const netExposure = totalLongVolume - totalShortVolume;

    const totalOpenTraderPnL = openTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    // In B-Book broker model, broker profit = - trader PnL
    const brokerBookPnL = -totalOpenTraderPnL;

    // Accounts under margin stress (where margin used > 70% of equity)
    const atRiskAccounts = this.state.users
      .map((u) => {
        const userOpen = openTrades.filter((t) => t.userId === u.id);
        const usedMargin = userOpen.reduce((acc, t) => acc + t.margin, 0);
        const marginLevel = usedMargin > 0 ? (u.equity / usedMargin) * 100 : 999;
        return {
          user: u,
          openTradesCount: userOpen.length,
          usedMargin,
          marginLevel
        };
      })
      .filter((a) => a.openTradesCount > 0 && a.marginLevel < 120);

    return {
      openTradesCount: openTrades.length,
      totalLongVolume,
      totalShortVolume,
      netExposure,
      totalOpenTraderPnL,
      brokerBookPnL,
      atRiskAccounts
    };
  }

  // --- Export Database to .sql dump ---

  public exportSqlDump(): string {
    const lines: string[] = [
      `-- Fast FX Institutional Relational SQL Database Dump v3.0`,
      `-- Exported At: ${new Date().toISOString()}`,
      `-- Super Admin: ${SUPER_ADMIN_EMAIL}`,
      ``,
      `-- 1. Table: users`,
      `CREATE TABLE IF NOT EXISTS users (`,
      `  id VARCHAR(64) PRIMARY KEY,`,
      `  email VARCHAR(128) UNIQUE NOT NULL,`,
      `  name VARCHAR(128) NOT NULL,`,
      `  role VARCHAR(16) DEFAULT 'trader',`,
      `  balance DECIMAL(15, 2) DEFAULT 0.00,`,
      `  equity DECIMAL(15, 2) DEFAULT 0.00,`,
      `  kyc_status VARCHAR(16) DEFAULT 'pending',`,
      `  kyc_tier VARCHAR(32) DEFAULT 'TIER_1_STANDARD',`,
      `  status VARCHAR(16) DEFAULT 'active',`,
      `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `);`,
      ``
    ];

    this.state.users.forEach((u) => {
      lines.push(
        `INSERT INTO users (id, email, name, role, balance, equity, kyc_status, kyc_tier, status, created_at) VALUES ('${u.id}', '${u.email}', '${u.name.replace(/'/g, "''")}', '${u.role}', ${u.balance}, ${u.equity}, '${u.kycStatus}', '${u.kycTier || "TIER_1_STANDARD"}', '${u.status}', '${u.createdAt}');`
      );
    });

    lines.push(``);
    lines.push(`-- 2. Table: trades`);
    lines.push(
      `CREATE TABLE IF NOT EXISTS trades (`,
      `  id VARCHAR(64) PRIMARY KEY,`,
      `  user_id VARCHAR(64) REFERENCES users(id),`,
      `  symbol VARCHAR(32) NOT NULL,`,
      `  type VARCHAR(8) NOT NULL,`,
      `  lots DECIMAL(10, 2) NOT NULL,`,
      `  entry_price DECIMAL(15, 4) NOT NULL,`,
      `  close_price DECIMAL(15, 4),`,
      `  leverage INT DEFAULT 100,`,
      `  pnl DECIMAL(15, 2) DEFAULT 0.00,`,
      `  status VARCHAR(16) DEFAULT 'OPEN',`,
      `  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `);`
    );

    this.state.trades.forEach((t) => {
      lines.push(
        `INSERT INTO trades (id, user_id, symbol, type, lots, entry_price, close_price, leverage, pnl, status, opened_at) VALUES ('${t.id}', '${t.userId}', '${t.symbol}', '${t.type}', ${t.lots}, ${t.entryPrice}, ${t.closePrice || "NULL"}, ${t.leverage}, ${t.pnl}, '${t.status}', '${t.openedAt}');`
      );
    });

    lines.push(``);
    lines.push(`-- 3. Table: fund_requests`);
    this.state.fund_requests.forEach((f) => {
      lines.push(
        `INSERT INTO fund_requests (id, user_id, amount, type, status, tx_reference) VALUES ('${f.id}', '${f.userId}', ${f.amount}, '${f.type}', '${f.status}', '${f.txReference}');`
      );
    });

    lines.push(``);
    lines.push(`-- 4. Table: market_instruments`);
    this.state.market_instruments.forEach((m) => {
      lines.push(
        `INSERT INTO market_instruments (symbol, name, price, spread_pips, max_leverage, trading_enabled) VALUES ('${m.symbol}', '${m.name.replace(/'/g, "''")}', ${m.price}, ${m.spreadPips}, ${m.maxLeverage}, ${m.tradingEnabled});`
      );
    });

    return lines.join("\n");
  }

  // --- Server Nodes & CRM Fleet Management ---

  public getServerNodes(): ServerNode[] {
    return [...this.state.server_nodes];
  }

  public getServerNodeById(id: string): ServerNode | undefined {
    return this.state.server_nodes.find((s) => s.id === id);
  }

  public updateServerNode(node: ServerNode): void {
    const idx = this.state.server_nodes.findIndex((s) => s.id === node.id);
    if (idx !== -1) {
      this.state.server_nodes[idx] = { ...node };
      this.saveToStorage();
    }
  }

  public async rebootServer(nodeId: string, mode: "graceful" | "force" = "graceful"): Promise<boolean> {
    const node = this.state.server_nodes.find((s) => s.id === nodeId);
    if (!node) return false;

    // 1. Mark status as REBOOTING
    node.status = "REBOOTING";
    this.saveToStorage();

    // 2. Add System Log Entry for reboot start
    this.addSystemLog({
      serverId: node.id,
      serverName: node.name,
      level: "WARN",
      component: "SYSTEM-CONTROL",
      message: `Admin initiated ${mode === "graceful" ? "graceful drain reboot" : "forced instant reboot"} sequence on node ${node.name}. Draining socket buffers.`,
      metadata: `mode=${mode} initiatedBy=SuperAdmin`
    });

    // 3. Add to Audit Log
    this.addAuditLog(
      SUPER_ADMIN_EMAIL,
      "SERVER_NODE_REBOOT",
      `Reboot command issued for server node ${node.name} (${node.ipAddress}) in ${node.datacenter} [Mode: ${mode.toUpperCase()}]`
    );

    // 4. Return immediately for caller to show progress, background timer handles restore
    setTimeout(() => {
      const activeNode = this.state.server_nodes.find((s) => s.id === nodeId);
      if (activeNode) {
        activeNode.status = "ONLINE";
        activeNode.uptimeHours = 0.1;
        activeNode.lastRebootedAt = new Date().toISOString();
        activeNode.cpuUsage = +(Math.random() * 15 + 12).toFixed(1);
        activeNode.memoryUsage = +(Math.random() * 15 + 28).toFixed(1);
        this.saveToStorage();

        this.addSystemLog({
          serverId: activeNode.id,
          serverName: activeNode.name,
          level: "INFO",
          component: "SYSTEM-CONTROL",
          message: `Node ${activeNode.name} completed reboot cycle successfully. Kernel v6.8.0-fastfx loaded, network sockets listening, hardware health verified OK.`,
          metadata: `status=ONLINE bootDuration=3.42s latency=${activeNode.networkLatencyMs}ms`
        });
      }
    }, 4500);

    return true;
  }

  // --- System Logs Management ---

  public getSystemLogs(): SystemLogEntry[] {
    return [...this.state.system_logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addSystemLog(entry: Omit<SystemLogEntry, "id" | "timestamp">): SystemLogEntry {
    const newLog: SystemLogEntry = {
      id: `slog_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    // Keep last 500 logs max
    this.state.system_logs.unshift(newLog);
    if (this.state.system_logs.length > 500) {
      this.state.system_logs = this.state.system_logs.slice(0, 500);
    }
    this.saveToStorage();
    return newLog;
  }

  public clearSystemLogs(): void {
    this.state.system_logs = [];
    this.saveToStorage();
  }

  public exportSystemLogs(): string {
    const lines = [
      `# FAST FX INSTITUTIONAL SYSTEM LOGS EXPORT`,
      `# Export Timestamp: ${new Date().toISOString()}`,
      `# Total Log Entries: ${this.state.system_logs.length}`,
      `# Fleet Core: Equinix LD4 / FR2 / NY4 / DX1`,
      `# -------------------------------------------------------------`,
      ``
    ];
    this.state.system_logs.forEach((log) => {
      lines.push(
        `[${log.timestamp}] [${log.level}] [${log.serverName}] [${log.component}]: ${log.message} ${log.metadata ? `(${log.metadata})` : ""}`
      );
    });
    return lines.join("\n");
  }

  public resetDatabase(): void {
    this.state = JSON.parse(JSON.stringify(defaultInitialState));
    this.saveToStorage();
  }
}

// Global Singleton Instance
export const sqlDb = new SqlDatabaseEngine();
