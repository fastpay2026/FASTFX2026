import {
  User,
  Trade,
  Transaction,
  Subscriber,
  AuditLog,
  PlatformSettings,
  SqlQueryResult
} from "../types";

export const SUPER_ADMIN_EMAIL = "h07806480810@gmail.com";
const DB_STORAGE_KEY = "fast_fx_relational_sql_db_v2";

interface DatabaseState {
  users: User[];
  trades: Trade[];
  transactions: Transaction[];
  subscribers: Subscriber[];
  audit_logs: AuditLog[];
  platform_settings: PlatformSettings;
}

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
      kycStatus: "verified",
      status: "active",
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
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
      email: "h07806480810@gmail.com",
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
      details: "PostgreSQL/SQLite Relational Schema initialized successfully",
      timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    }
  ],
  platform_settings: {
    tradingHalted: false,
    maxLeverage: 500,
    spreadMultiplier: 1.0,
    maintenanceMode: false,
    minDeposit: 50.0
  }
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
        // Ensure super admin always exists
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
          platform_settings: parsed.platform_settings || defaultInitialState.platform_settings
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
        const tables = ["users", "trades", "transactions", "subscribers", "audit_logs", "platform_settings"];
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
    // Basic SQL Regex Parser: SELECT ... FROM <table> [WHERE ...] [ORDER BY ...] [LIMIT ...]
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
    // INSERT INTO <table> [(col1, col2)] VALUES (val1, val2)
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
    // UPDATE <table> SET col1 = val1, col2 = val2 [WHERE condition]
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

    // Parse SET assignments
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
    // Support basic operators: =, !=, >, <, LIKE
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

  // --- Type-safe ORM Convenience Methods ---

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

  // --- Trading API ---

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

  public closeTrade(tradeId: string, closePrice: number, finalPnl: number): void {
    const trade = this.state.trades.find((t) => t.id === tradeId);
    if (trade && trade.status === "OPEN") {
      trade.status = "CLOSED";
      trade.closePrice = closePrice;
      trade.pnl = Number(finalPnl.toFixed(2));
      trade.closedAt = new Date().toISOString();

      // Update user balance
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
          note: `Closed ${trade.symbol} ${trade.type} position (PnL: $${finalPnl.toFixed(2)})`,
          timestamp: new Date().toISOString()
        });
      }

      this.addAuditLog(trade.userEmail, "ORDER_CLOSED", `Closed trade ${trade.id} on ${trade.symbol} with PnL $${finalPnl}`);
      this.saveToStorage();
    }
  }

  public updateTradeLivePnL(tradeId: string, currentPrice: number, livePnl: number): void {
    const trade = this.state.trades.find((t) => t.id === tradeId);
    if (trade && trade.status === "OPEN") {
      trade.currentPrice = currentPrice;
      trade.pnl = Number(livePnl.toFixed(2));
    }
  }

  // --- Subscribers (15-day Launch Countdown) ---

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

  private addAuditLog(actorEmail: string, action: string, details: string): void {
    this.state.audit_logs.unshift({
      id: `log_${Date.now().toString(36)}`,
      actorEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    if (this.state.audit_logs.length > 200) {
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

  // --- Export Database to .sql script ---

  public exportSqlDump(): string {
    const lines: string[] = [
      `-- Fast FX Institutional SQL Database Dump`,
      `-- Exported At: ${new Date().toISOString()}`,
      `-- Admin: ${SUPER_ADMIN_EMAIL}`,
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
      `  status VARCHAR(16) DEFAULT 'active',`,
      `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `);`,
      ``
    ];

    this.state.users.forEach((u) => {
      lines.push(
        `INSERT INTO users (id, email, name, role, balance, equity, kyc_status, status, created_at) VALUES ('${u.id}', '${u.email}', '${u.name.replace(/'/g, "''")}', '${u.role}', ${u.balance}, ${u.equity}, '${u.kycStatus}', '${u.status}', '${u.createdAt}');`
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
    lines.push(`-- 3. Table: subscribers`);
    this.state.subscribers.forEach((s) => {
      lines.push(`INSERT INTO subscribers (id, email, created_at) VALUES ('${s.id}', '${s.email}', '${s.createdAt}');`);
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
