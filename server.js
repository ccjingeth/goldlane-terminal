const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { execFile } = require("child_process");
const { promisify } = require("util");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const ENV_FILE = path.join(ROOT, ".env");
const CACHE = new Map();
const LIVE_OVERVIEW_CACHE = new Map();
const OPPORTUNITY_HISTORY = new Map();
const OPPORTUNITY_TIMELINE = new Map();
const HISTORY_FILE = path.join(ROOT, "data", "opportunity-history.json");
const LAST_OVERVIEW_FILE = path.join(ROOT, "data", "last-live-overview.json");
const HISTORY_LIMIT = 24;
const POLL_MS = 30000;
const STREAM_HEARTBEAT_MS = 15000;
const STREAM_RETRY_MS = 4000;
const execFileAsync = promisify(execFile);
let HISTORY_LOADED = false;
let LAST_OVERVIEW_LOADED = false;
let LAST_OVERVIEW_SNAPSHOT = null;
let ENV_FILE_LOADED = false;
let ENV_FILE_VALUES = {};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const STABLE_QUOTES = new Set(["USDT", "USDC", "BUSD", "FDUSD", "USDE"]);
const MANAGED_ENV_KEYS = [
  "BINANCE_API_KEY",
  "BINANCE_API_SECRET",
  "BINANCE_SPOT_API_BASE",
  "BINANCE_FUTURES_API_BASE",
  "BINANCE_SPOT_FALLBACK_BASES",
  "BINANCE_FUTURES_FALLBACK_BASES",
];
const DEFAULT_BINANCE_SPOT_BASE = "https://api.binance.com";
const DEFAULT_BINANCE_FUTURES_BASE = "https://fapi.binance.com";
const DEFAULT_BINANCE_SPOT_FALLBACKS = [
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://data-api.binance.vision",
];
const DEFAULT_BINANCE_FUTURES_FALLBACKS = [
  "https://fapi1.binance.com",
  "https://fapi2.binance.com",
  "https://fapi3.binance.com",
];

const WATCHLIST = [
  {
    symbol: "CAKE",
    name: "PancakeSwap",
    chain: "BSC",
    theme: "DEX beta",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    coingeckoId: "pancakeswap-token",
  },
  {
    symbol: "BAKE",
    name: "BakeryToken",
    chain: "BSC",
    theme: "legacy DEX rotation",
    address: "0xE02dF9e3e622DebdD69fb838BB799E3F168902c5",
    coingeckoId: "bakerytoken",
  },
  {
    symbol: "FLOKI",
    name: "FLOKI",
    chain: "BSC",
    theme: "meme beta",
    address: "0xfb5B838b6cFeEdC2873aB27866079AC55363D37E",
    coingeckoId: "floki",
  },
  {
    symbol: "TWT",
    name: "Trust Wallet Token",
    chain: "BSC",
    theme: "wallet beta",
    address: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    coingeckoId: "trust-wallet-token",
  },
  {
    symbol: "ALPACA",
    name: "Alpaca Finance",
    chain: "BSC",
    theme: "yield beta",
    address: "0x8f0528cE5EF7B51152A59745BEfDD91D97091d2F",
    coingeckoId: "alpaca-finance",
  },
  {
    symbol: "XVS",
    name: "Venus",
    chain: "BSC",
    theme: "lending beta",
    address: "0xcf6bb5389c92Bdda8a3747DdB454cB7A64626C63",
    coingeckoId: "venus",
  },
];

const DEFAULT_MANDATE = {
  id: "binance-capital-firewall",
  name: "Profit Opportunity Mandate",
  desc: "Binance-first, execution-aware. Only surface opportunities whose edge survives venue health, execution friction, and your mandate.",
  principles: [
    "先验证 edge，再追利润",
    "任何 venue mismatch 先视为坏市场，不视为套利",
    "机会不是永久有效的，TTL 到期必须复审",
  ],
  guardrails: [
    "Reject if Binance Spot order book is effectively off",
    "Reject if audit risk >= 70 or honeypot-like flags appear",
    "Revoke if venue mismatch >= 5x or futures lane goes inactive",
    "Only surface opportunities when fit score is high and fragility remains controlled",
  ],
  settings: {
    minFitApprove: 72,
    maxFragilityApprove: 56,
    maxAuditRisk: 70,
    maxRiskBudgetPct: 24,
    referenceCapitalUsd: 10000,
    allowFutures: true,
    allowBasis: true,
    allowResearch: true,
  },
};

const VERDICT_RANK = {
  Approved: 4,
  Deferred: 3,
  Revoked: 2,
  Rejected: 1,
};

const ALERT_SEVERITY_RANK = {
  high: 3,
  medium: 2,
  low: 1,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function json(res, statusCode, data) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function parseEnvFile(raw) {
  return raw
    .split(/\r?\n/)
    .reduce((accumulator, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return accumulator;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return accumulator;
      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      accumulator[key] = value;
      return accumulator;
    }, {});
}

function serializeEnvValue(value) {
  if (value == null || value === "") return "";
  if (/^[A-Za-z0-9_./:-]+$/.test(String(value))) return String(value);
  return JSON.stringify(String(value));
}

async function loadEnvFile() {
  if (ENV_FILE_LOADED) return ENV_FILE_VALUES;
  ENV_FILE_LOADED = true;

  try {
    const raw = await fs.readFile(ENV_FILE, "utf8");
    ENV_FILE_VALUES = parseEnvFile(raw);
    Object.entries(ENV_FILE_VALUES).forEach(([key, value]) => {
      if (process.env[key] == null || MANAGED_ENV_KEYS.includes(key)) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to load .env file:", error.message);
    }
  }

  return ENV_FILE_VALUES;
}

async function persistManagedEnv(updates) {
  await loadEnvFile();
  const nextValues = { ...ENV_FILE_VALUES };

  MANAGED_ENV_KEYS.forEach((key) => {
    if (!(key in updates)) return;
    const value = updates[key];
    if (value == null || value === "") {
      delete nextValues[key];
      delete process.env[key];
      return;
    }
    nextValues[key] = String(value);
    process.env[key] = String(value);
  });

  ENV_FILE_VALUES = nextValues;
  const lines = [
    "# Goldlane local runtime configuration",
    "# Binance API credentials and endpoint overrides are managed by the app.",
    "",
    ...Object.keys(nextValues)
      .sort()
      .map((key) => `${key}=${serializeEnvValue(nextValues[key])}`),
    "",
  ];

  await fs.writeFile(ENV_FILE, lines.join("\n"), "utf8");
}

function uniqueBaseUrls(urls) {
  const seen = new Set();
  const list = [];
  urls.forEach((value) => {
    const normalized = String(value || "").trim().replace(/\/+$/, "");
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    list.push(normalized);
  });
  return list;
}

function parseCsvUrls(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function maskCredential(value) {
  if (!value) return "";
  const source = String(value);
  if (source.length <= 8) return `${source.slice(0, 2)}***${source.slice(-2)}`;
  return `${source.slice(0, 4)}***${source.slice(-4)}`;
}

function getBinanceRuntimeConfig() {
  const apiKey = String(process.env.BINANCE_API_KEY || "").trim();
  const apiSecret = String(process.env.BINANCE_API_SECRET || "").trim();
  const spotBaseUrl = String(process.env.BINANCE_SPOT_API_BASE || DEFAULT_BINANCE_SPOT_BASE).trim();
  const futuresBaseUrl = String(process.env.BINANCE_FUTURES_API_BASE || DEFAULT_BINANCE_FUTURES_BASE).trim();
  const spotFallbackBaseUrls = uniqueBaseUrls([
    ...parseCsvUrls(process.env.BINANCE_SPOT_FALLBACK_BASES),
    ...DEFAULT_BINANCE_SPOT_FALLBACKS,
  ]);
  const futuresFallbackBaseUrls = uniqueBaseUrls([
    ...parseCsvUrls(process.env.BINANCE_FUTURES_FALLBACK_BASES),
    ...DEFAULT_BINANCE_FUTURES_FALLBACKS,
  ]);

  return {
    apiKey,
    apiSecret,
    configured: Boolean(apiKey && apiSecret),
    keyPreview: maskCredential(apiKey),
    spotBaseUrl,
    futuresBaseUrl,
    spotFallbackBaseUrls: uniqueBaseUrls([spotBaseUrl, ...spotFallbackBaseUrls]),
    futuresFallbackBaseUrls: uniqueBaseUrls([futuresBaseUrl, ...futuresFallbackBaseUrls]),
  };
}

function hmacSignature(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function loadOpportunityHistory() {
  if (HISTORY_LOADED) return;
  HISTORY_LOADED = true;

  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf8");
    const parsed = JSON.parse(raw);
    Object.entries(parsed?.timelines || {}).forEach(([symbol, snapshots]) => {
      const normalized = Array.isArray(snapshots)
        ? snapshots
            .filter((snapshot) => snapshot && snapshot.generatedAt)
            .map((snapshot) => ({
              status: snapshot.status || "Deferred",
              lane: snapshot.lane || "blocked",
              score: safeNumber(snapshot.score),
              netEdgePct: safeNumber(snapshot.netEdgePct),
              grossEdgePct: safeNumber(snapshot.grossEdgePct),
              executionCostPct: safeNumber(snapshot.executionCostPct),
              referenceCapitalUsd: safeNumber(snapshot.referenceCapitalUsd, DEFAULT_MANDATE.settings.referenceCapitalUsd),
              suggestedNotionalUsd: safeNumber(snapshot.suggestedNotionalUsd),
              expectedGrossPnlUsd: safeNumber(snapshot.expectedGrossPnlUsd),
              expectedNetPnlUsd: safeNumber(snapshot.expectedNetPnlUsd),
              mandateFingerprint: snapshot.mandateFingerprint || null,
              generatedAt: snapshot.generatedAt,
            }))
        : [];

      if (!normalized.length) return;
      OPPORTUNITY_TIMELINE.set(symbol, normalized.slice(-HISTORY_LIMIT));
      OPPORTUNITY_HISTORY.set(symbol, normalized.at(-1));
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to load opportunity history:", error.message);
    }
  }
}

async function persistOpportunityHistory() {
  const payload = {
    updatedAt: new Date().toISOString(),
    timelines: Object.fromEntries(OPPORTUNITY_TIMELINE.entries()),
  };

  await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
  await fs.writeFile(HISTORY_FILE, JSON.stringify(payload, null, 2), "utf8");
}

async function loadLastOverviewSnapshot() {
  if (LAST_OVERVIEW_LOADED) return LAST_OVERVIEW_SNAPSHOT;
  LAST_OVERVIEW_LOADED = true;

  try {
    const raw = await fs.readFile(LAST_OVERVIEW_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed?.tokens?.length) {
      LAST_OVERVIEW_SNAPSHOT = parsed;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to load last overview snapshot:", error.message);
    }
  }

  return LAST_OVERVIEW_SNAPSHOT;
}

async function persistLastOverviewSnapshot(overview) {
  LAST_OVERVIEW_SNAPSHOT = overview;
  await fs.mkdir(path.dirname(LAST_OVERVIEW_FILE), { recursive: true });
  await fs.writeFile(LAST_OVERVIEW_FILE, JSON.stringify(overview, null, 2), "utf8");
}

function buildMandate(override = {}) {
  const settings = {
    ...DEFAULT_MANDATE.settings,
    ...(override.settings || {}),
  };

  if (override.minFitApprove != null) settings.minFitApprove = override.minFitApprove;
  if (override.maxFragilityApprove != null) settings.maxFragilityApprove = override.maxFragilityApprove;
  if (override.maxAuditRisk != null) settings.maxAuditRisk = override.maxAuditRisk;
  if (override.maxRiskBudgetPct != null) settings.maxRiskBudgetPct = override.maxRiskBudgetPct;
  if (override.referenceCapitalUsd != null) settings.referenceCapitalUsd = override.referenceCapitalUsd;
  if (override.allowFutures != null) settings.allowFutures = override.allowFutures;
  if (override.allowBasis != null) settings.allowBasis = override.allowBasis;
  if (override.allowResearch != null) settings.allowResearch = override.allowResearch;

  const normalizedSettings = {
    minFitApprove: clamp(safeNumber(settings.minFitApprove, DEFAULT_MANDATE.settings.minFitApprove), 20, 95),
    maxFragilityApprove: clamp(safeNumber(settings.maxFragilityApprove, DEFAULT_MANDATE.settings.maxFragilityApprove), 10, 95),
    maxAuditRisk: clamp(safeNumber(settings.maxAuditRisk, DEFAULT_MANDATE.settings.maxAuditRisk), 25, 95),
    maxRiskBudgetPct: clamp(safeNumber(settings.maxRiskBudgetPct, DEFAULT_MANDATE.settings.maxRiskBudgetPct), 5, 50),
    referenceCapitalUsd: clamp(safeNumber(settings.referenceCapitalUsd, DEFAULT_MANDATE.settings.referenceCapitalUsd), 1000, 500000),
    allowFutures: safeBoolean(settings.allowFutures, DEFAULT_MANDATE.settings.allowFutures),
    allowBasis: safeBoolean(settings.allowBasis, DEFAULT_MANDATE.settings.allowBasis),
    allowResearch: safeBoolean(settings.allowResearch, DEFAULT_MANDATE.settings.allowResearch),
  };

  const topLevelOverride = { ...override };
  delete topLevelOverride.settings;
  delete topLevelOverride.minFitApprove;
  delete topLevelOverride.maxFragilityApprove;
  delete topLevelOverride.maxAuditRisk;
  delete topLevelOverride.maxRiskBudgetPct;
  delete topLevelOverride.referenceCapitalUsd;
  delete topLevelOverride.allowFutures;
  delete topLevelOverride.allowBasis;
  delete topLevelOverride.allowResearch;

  return {
    ...DEFAULT_MANDATE,
    ...topLevelOverride,
    settings: normalizedSettings,
  };
}

function mandateFingerprint(mandate) {
  const settings = mandate?.settings || DEFAULT_MANDATE.settings;
  return [
    safeNumber(settings.minFitApprove, DEFAULT_MANDATE.settings.minFitApprove),
    safeNumber(settings.maxFragilityApprove, DEFAULT_MANDATE.settings.maxFragilityApprove),
    safeNumber(settings.maxAuditRisk, DEFAULT_MANDATE.settings.maxAuditRisk),
    safeNumber(settings.maxRiskBudgetPct, DEFAULT_MANDATE.settings.maxRiskBudgetPct),
    safeNumber(settings.referenceCapitalUsd, DEFAULT_MANDATE.settings.referenceCapitalUsd),
    safeBoolean(settings.allowFutures, DEFAULT_MANDATE.settings.allowFutures) ? 1 : 0,
    safeBoolean(settings.allowBasis, DEFAULT_MANDATE.settings.allowBasis) ? 1 : 0,
    safeBoolean(settings.allowResearch, DEFAULT_MANDATE.settings.allowResearch) ? 1 : 0,
  ].join(":");
}

function extractMandateFromSearchParams(searchParams) {
  return buildMandate({
    minFitApprove: searchParams.get("minFitApprove"),
    maxFragilityApprove: searchParams.get("maxFragilityApprove"),
    maxAuditRisk: searchParams.get("maxAuditRisk"),
    maxRiskBudgetPct: searchParams.get("maxRiskBudgetPct"),
    referenceCapitalUsd: searchParams.get("referenceCapitalUsd"),
    allowFutures: searchParams.get("allowFutures"),
    allowBasis: searchParams.get("allowBasis"),
    allowResearch: searchParams.get("allowResearch"),
  });
}

function pct(value) {
  return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}

function cacheWrap(key, ttlMs, loader) {
  const cached = CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve({
      status: "ok",
      updatedAt: cached.updatedAt,
      data: cached.data,
      cached: true,
    });
  }

  return loader()
    .then((data) => {
      CACHE.set(key, {
        data,
        updatedAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
      });
      return {
        status: "ok",
        updatedAt: Date.now(),
        data,
        cached: false,
      };
    })
    .catch((error) => {
      if (cached) {
        return {
          status: "stale",
          updatedAt: cached.updatedAt,
          data: cached.data,
          error: error.message,
          cached: true,
        };
      }
      return {
        status: "error",
        updatedAt: null,
        data: null,
        error: error.message,
        cached: false,
      };
    });
}

async function fetchJsonWithFetch(url, { headers = {}, timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "RiftRadar/1.0",
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonWithCurl(url, { headers = {}, timeoutMs = 12000 } = {}) {
  const mergedHeaders = {
    accept: "application/json",
    "user-agent": "RiftRadar/1.0",
    ...headers,
  };

  const args = ["-sS", "-L", "--compressed", "--fail-with-body", "--max-time", String(Math.ceil(timeoutMs / 1000))];
  Object.entries(mergedHeaders).forEach(([key, value]) => {
    args.push("-H", `${key}: ${value}`);
  });
  args.push(url);

  const { stdout } = await execFileAsync("curl", args, {
    maxBuffer: 16 * 1024 * 1024,
  });

  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Invalid JSON from ${url}`);
  }
}

async function fetchJson(url, options = {}) {
  if (process.env.RIFT_HTTP_TRANSPORT === "fetch") {
    return fetchJsonWithFetch(url, options);
  }

  try {
    return await fetchJsonWithCurl(url, options);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fetchJsonWithFetch(url, options);
    }
    throw error;
  }
}

async function fetchJsonFromCandidates(pathname, { baseUrls, headers = {}, timeoutMs = 12000 } = {}) {
  const errors = [];
  for (const baseUrl of uniqueBaseUrls(baseUrls || [])) {
    const url = `${baseUrl}${pathname}`;
    try {
      const data = await fetchJson(url, { headers, timeoutMs });
      return { data, baseUrl, url };
    } catch (error) {
      errors.push(`${baseUrl}: ${error.message}`);
    }
  }

  throw new Error(errors.length ? `Binance request failed: ${errors.join(" | ")}` : "No Binance base URLs configured");
}

async function fetchSignedBinanceJson({
  baseUrl,
  pathname,
  apiKey,
  apiSecret,
  params = {},
  timeoutMs = 12000,
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    searchParams.set(key, String(value));
  });
  searchParams.set("timestamp", String(Date.now()));
  searchParams.set("recvWindow", "5000");
  const query = searchParams.toString();
  const signature = hmacSignature(query, apiSecret);
  return fetchJson(`${baseUrl}${pathname}?${query}&signature=${signature}`, {
    headers: {
      "X-MBX-APIKEY": apiKey,
    },
    timeoutMs,
  });
}

async function validateBinanceCredentials(config = getBinanceRuntimeConfig()) {
  if (!config.configured) {
    return {
      configured: false,
      status: "missing",
      headline: "未配置 Binance API",
      detail: "填入只读 Binance API Key / Secret 后，Goldlane 会优先用你的配置校验连接并增强实时链路。",
    };
  }

  const cacheKey = `binance-auth:${maskCredential(config.apiKey)}:${config.spotBaseUrl}:${config.futuresBaseUrl}`;
  const cached = CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const [spotAccount, futuresAccount] = await Promise.allSettled([
    fetchSignedBinanceJson({
      baseUrl: config.spotBaseUrl,
      pathname: "/api/v3/account",
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    }),
    fetchSignedBinanceJson({
      baseUrl: config.futuresBaseUrl,
      pathname: "/fapi/v2/account",
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    }),
  ]);

  const payload = {
    configured: true,
    keyPreview: config.keyPreview,
    spotBaseUrl: config.spotBaseUrl,
    futuresBaseUrl: config.futuresBaseUrl,
    permissions: [],
    accountType: null,
    status: "error",
    headline: "Binance API 校验失败",
    detail: "请检查 API Key / Secret、权限和基础地址。",
    checks: {
      spot:
        spotAccount.status === "fulfilled"
          ? { status: "ok", canTrade: Boolean(spotAccount.value.canTrade), accountType: spotAccount.value.accountType || "SPOT" }
          : { status: "error", error: spotAccount.reason?.message || "spot account failed" },
      futures:
        futuresAccount.status === "fulfilled"
          ? { status: "ok", canTrade: true, totalWalletBalance: futuresAccount.value.totalWalletBalance || null }
          : { status: "error", error: futuresAccount.reason?.message || "futures account failed" },
    },
  };

  if (spotAccount.status === "fulfilled") {
    payload.permissions = Array.isArray(spotAccount.value.permissions) ? spotAccount.value.permissions : [];
    payload.accountType = spotAccount.value.accountType || "SPOT";
  }

  if (spotAccount.status === "fulfilled" || futuresAccount.status === "fulfilled") {
    payload.status = futuresAccount.status === "fulfilled" && spotAccount.status === "fulfilled" ? "ok" : "partial";
    payload.headline =
      payload.status === "ok" ? "Binance API 已验证" : "Binance API 部分可用";
    payload.detail =
      payload.status === "ok"
        ? "Goldlane 已成功验证你的 Binance 凭证，可用于增强实时数据和账户侧连接。"
        : "凭证至少在一个 Binance 通道上可用，建议继续检查另一个通道或基础地址。";
  }

  CACHE.set(cacheKey, {
    data: payload,
    updatedAt: Date.now(),
    expiresAt: Date.now() + 60_000,
  });

  return payload;
}

function clearLiveCaches() {
  CACHE.clear();
  LIVE_OVERVIEW_CACHE.clear();
}

function encodeSymbols(symbols) {
  return encodeURIComponent(JSON.stringify(symbols));
}

function pickBestPair(pairs) {
  return [...pairs]
    .sort((left, right) => {
      const leftScore = pairPreferenceScore(left);
      const rightScore = pairPreferenceScore(right);
      return rightScore - leftScore;
    })
    .at(0);
}

function pairPreferenceScore(pair) {
  const quoteSymbol = String(pair.quoteToken?.symbol || "").toUpperCase();
  const quoteWeight = STABLE_QUOTES.has(quoteSymbol) ? 3 : quoteSymbol === "WBNB" ? 2 : 1;
  return quoteWeight * 1_000_000_000_000 + safeNumber(pair.liquidity?.usd);
}

function deriveFearGreedRegime(value) {
  if (value == null) return "Unknown";
  if (value <= 20) return "Extreme Fear";
  if (value <= 40) return "Fear";
  if (value < 60) return "Neutral";
  if (value < 80) return "Greed";
  return "Extreme Greed";
}

function buildRiskProfile(security) {
  if (!security) {
    return { auditRisk: 48, riskFlags: ["security unavailable"], holderCount: null, buyTax: 0, sellTax: 0 };
  }

  const checks = [
    ["is_honeypot", 70, "honeypot"],
    ["cannot_sell_all", 30, "cannot_sell_all"],
    ["cannot_buy", 20, "cannot_buy"],
    ["can_take_back_ownership", 12, "owner_takeback"],
    ["hidden_owner", 14, "hidden_owner"],
    ["owner_change_balance", 14, "owner_change_balance"],
    ["selfdestruct", 12, "selfdestruct"],
    ["external_call", 8, "external_call"],
    ["is_blacklisted", 20, "blacklist"],
    ["transfer_pausable", 8, "transfer_pausable"],
    ["is_mintable", 10, "mintable"],
    ["trading_cooldown", 6, "trading_cooldown"],
    ["slippage_modifiable", 10, "slippage_modifiable"],
  ];

  let auditRisk = 8;
  const riskFlags = [];

  checks.forEach(([field, weight, label]) => {
    if (String(security[field]) === "1") {
      auditRisk += weight;
      riskFlags.push(label);
    }
  });

  const buyTax = safeNumber(security.buy_tax);
  const sellTax = safeNumber(security.sell_tax);
  if (buyTax > 5) {
    auditRisk += clamp(buyTax * 0.8, 0, 12);
    riskFlags.push(`buy_tax_${buyTax}`);
  }
  if (sellTax > 5) {
    auditRisk += clamp(sellTax * 0.8, 0, 18);
    riskFlags.push(`sell_tax_${sellTax}`);
  }

  return {
    auditRisk: clamp(auditRisk, 0, 100),
    riskFlags: riskFlags.slice(0, 6),
    holderCount: safeNumber(security.holder_count || security.holderCount, null),
    buyTax,
    sellTax,
  };
}

function computeNarrativeScore({ dexPair, boostAmount, isTrending }) {
  if (!dexPair) return 0;

  const txns24h = safeNumber(dexPair.txns?.h24?.buys) + safeNumber(dexPair.txns?.h24?.sells);
  const volumeLiquidityRatio = dexPair.liquidity?.usd
    ? clamp((safeNumber(dexPair.volume?.h24) / safeNumber(dexPair.liquidity?.usd)) * 40, 0, 40)
    : 0;
  const txPulse = clamp(txns24h / 18, 0, 28);
  const priceMomentum = clamp(safeNumber(dexPair.priceChange?.h24) * 0.7 + 15, 0, 20);
  const boostBonus = clamp(safeNumber(boostAmount) / 20, 0, 18);
  const trendingBonus = isTrending ? 14 : 0;

  return clamp(txPulse + volumeLiquidityRatio + priceMomentum + boostBonus + trendingBonus, 0, 100);
}

function computeFlowScore({ dexPair, binanceSpot }) {
  if (!dexPair) return 0;

  const buys = safeNumber(dexPair.txns?.h24?.buys);
  const sells = safeNumber(dexPair.txns?.h24?.sells);
  const total = buys + sells;
  const imbalance = total ? ((buys - sells) / total) * 100 : 0;
  const participation = clamp(total / 22, 0, 28);
  const imbalanceScore = clamp(50 + imbalance * 0.7, 0, 72);
  const spotMomentum = binanceSpot ? clamp(safeNumber(binanceSpot.priceChangePercent) * 0.8 + 8, 0, 16) : 0;

  return clamp(imbalanceScore * 0.65 + participation + spotMomentum, 0, 100);
}

function computeVenueProfile({ spot, futures, dexPriceUsd, gecko }) {
  const spotPrice = spot ? safeNumber(spot.lastPrice, null) : null;
  const spotBid = safeNumber(spot?.bidPrice, 0);
  const spotAsk = safeNumber(spot?.askPrice, 0);
  const futuresPrice = futures ? safeNumber(futures.markPrice, null) : null;
  const nextFundingTime = safeNumber(futures?.nextFundingTime, 0);
  const geckoPrice = gecko ? safeNumber(gecko.current_price, null) : null;

  const spotActive = Boolean(spot && spotPrice != null && spotBid > 0 && spotAsk > 0);
  const futuresActive = Boolean(futures && futuresPrice != null && nextFundingTime > 0);

  const referencePrices = [dexPriceUsd, geckoPrice].filter((price) => price != null && price > 0);
  const exchangePrices = [spotPrice, futuresPrice].filter((price) => price != null && price > 0);

  let venuePenalty = 0;
  const riskFlags = [];

  if (spot && !spotActive) {
    venuePenalty += 24;
    riskFlags.push("spot_book_off");
  }

  if (futures && !futuresActive) {
    venuePenalty += 18;
    riskFlags.push("futures_inactive");
  }

  const referenceMedian = median(referencePrices);
  const exchangeMedian = median(exchangePrices);
  const mismatchRatio =
    referenceMedian && exchangeMedian ? Math.max(referenceMedian, exchangeMedian) / Math.min(referenceMedian, exchangeMedian) : null;
  const venueMismatch = Boolean(mismatchRatio && mismatchRatio >= 5);

  if (venueMismatch) {
    venuePenalty += 32;
    riskFlags.push(`venue_mismatch_${mismatchRatio.toFixed(1)}x`);
  }

  return {
    spotActive,
    futuresActive,
    venueMismatch,
    mismatchRatio,
    venuePenalty,
    riskFlags,
  };
}

function computeExecutionFriction({ dexPair, hasFutures, riskProfile, venueProfile }) {
  const liquidityPenalty = dexPair
    ? clamp(34 - Math.min(34, safeNumber(dexPair.liquidity?.usd) / 120000), 0, 34)
    : 38;
  const noFuturesPenalty = hasFutures ? 0 : 12;
  const taxPenalty = clamp((riskProfile.buyTax + riskProfile.sellTax) * 0.9, 0, 24);
  return clamp(8 + liquidityPenalty + noFuturesPenalty + taxPenalty + (venueProfile?.venuePenalty || 0), 0, 100);
}

function computeStrategy({ narrativeScore, flowScore, auditRisk, executionFriction, dexSpotSpreadPct, hasSpot, hasFutures, venueMismatch }) {
  if (!hasSpot || venueMismatch) return "Risk Tombstone";
  if (auditRisk >= 65) return "Risk Tombstone";
  if (Math.abs(dexSpotSpreadPct) >= 1.25 && hasFutures && executionFriction <= 42) return "Basis Hedge";
  if (narrativeScore >= 72 && flowScore >= 62 && auditRisk <= 35) return "Alpha Scout";
  if (hasFutures && narrativeScore >= 64 && flowScore >= 56 && auditRisk <= 42) return "Margin Probe";
  if (flowScore >= 74 && auditRisk <= 38) return "Whale Shadow";
  return "Watchlist";
}

function determineLane({ hasSpot, hasFutures, venueMismatch, dexSpotSpreadPct, flowScore, narrativeScore }) {
  if (!hasSpot || venueMismatch) return "blocked";
  if (hasFutures && Math.abs(dexSpotSpreadPct) >= 1.25) return "basis";
  if (hasFutures && flowScore >= 70) return "futures";
  if (hasSpot && (narrativeScore >= 60 || flowScore >= 58)) return "spot";
  if (hasSpot) return "research";
  return "blocked";
}

function applyMandateToLane(baseLane, mandate, hasSpot) {
  const settings = mandate.settings;

  if (baseLane === "basis" && !settings.allowBasis) {
    return hasSpot ? "spot" : "blocked";
  }
  if (baseLane === "futures" && !settings.allowFutures) {
    return hasSpot ? "spot" : "blocked";
  }
  if (baseLane === "research" && !settings.allowResearch) {
    return "blocked";
  }
  return baseLane;
}

function computeFragility({
  auditRisk,
  executionFriction,
  venueProfile,
  marketContext,
  dexSpotSpreadPct,
  dexLiquidityUsd,
  hasFutures,
  riskFlags,
}) {
  let score = executionFriction * 0.42 + auditRisk * 0.22 + safeNumber(venueProfile?.venuePenalty) * 0.45;

  if (marketContext?.fearGreedValue != null && marketContext.fearGreedValue <= 20) {
    score += 8;
  }
  if (Math.abs(dexSpotSpreadPct) >= 2) {
    score += 8;
  }
  if ((dexLiquidityUsd || 0) < 500000) {
    score += 12;
  }
  if (!hasFutures && Math.abs(dexSpotSpreadPct) >= 1.25) {
    score += 10;
  }
  if (riskFlags.includes("security unavailable")) {
    score += 6;
  }

  return clamp(score, 0, 100);
}

function computeFitScore({
  narrativeScore,
  flowScore,
  auditRisk,
  executionFriction,
  fragilityScore,
  dexSpotSpreadPct,
  dexLiquidityUsd,
  hasSpot,
  hasFutures,
  venueProfile,
}) {
  const spreadEdge = clamp(Math.abs(dexSpotSpreadPct) * 8, 0, 18);
  const liquidityEdge = clamp(safeNumber(dexLiquidityUsd) / 250000, 0, 18);

  const quality =
    22 +
    narrativeScore * 0.24 +
    flowScore * 0.28 +
    spreadEdge +
    liquidityEdge +
    (hasSpot ? 14 : 0) +
    (hasFutures ? 8 : 0);

  const penalties =
    auditRisk * 0.28 +
    executionFriction * 0.22 +
    fragilityScore * 0.18 +
    safeNumber(venueProfile?.venuePenalty) * 0.2;

  return clamp(quality - penalties, 0, 100);
}

function fitLabel(score) {
  if (score >= 82) return "Core";
  if (score >= 68) return "Tactical";
  if (score >= 48) return "Conditional";
  return "Out of Mandate";
}

function computeGrossEdgePct(token) {
  const spotEdge = Math.abs(safeNumber(token.dexSpotSpreadPct));
  const basisEdge = Math.abs(safeNumber(token.spotPerpBasisPct));

  if (token.warrantLane === "basis") {
    return Math.max(basisEdge, spotEdge * 0.35);
  }
  if (token.warrantLane === "futures") {
    return Math.max(basisEdge, spotEdge * 0.75);
  }
  return spotEdge;
}

function computeExecutionCostPct(token) {
  const frictionCost = safeNumber(token.executionFriction) * 0.015;
  const liquidityCost = token.dexLiquidityUsd ? clamp(220000 / Math.max(token.dexLiquidityUsd, 1), 0.03, 0.85) : 0.85;
  const auditCost = safeNumber(token.auditRisk) * 0.0035;
  const fundingCost = token.hasFutures && Math.abs(safeNumber(token.fundingRatePct)) >= 0.03 ? 0.08 : 0;
  return clamp(frictionCost + liquidityCost + auditCost + fundingCost, 0.05, 4.5);
}

function opportunityBand({ status, netEdgePct }) {
  if (status === "Revoked") return "False Edge";
  if (status === "Rejected") return "No Trade";
  if (netEdgePct >= 1.2) return "High Conviction";
  if (netEdgePct >= 0.45) return "Tradable";
  if (netEdgePct > 0.05) return "Thin Edge";
  return "Watch Only";
}

function opportunityKind(token) {
  if (token.warrant?.status === "Revoked") return "fake-edge";
  if (token.warrant?.status === "Rejected") return "skip";
  if (token.warrantLane === "basis") return "basis-capture";
  if (token.warrantLane === "futures") return "momentum-follow";
  if (token.warrantLane === "spot") return "spot-capture";
  return "watch-setup";
}

function buildWhyNow(token, marketContext, grossEdgePct, netEdgePct) {
  const reasons = [];

  if (token.venueMismatch) {
    reasons.push(`表面边际很大，但 ${token.mismatchRatio?.toFixed(1) || "多倍"} venue mismatch 更像坏市场。`);
  } else if (grossEdgePct >= 0.6) {
    reasons.push(`链上与 Binance 之间仍有 ${pct(grossEdgePct)} 的毛边际。`);
  } else {
    reasons.push(`当前毛边际 ${pct(grossEdgePct)}，需要更高确认度。`);
  }

  if (netEdgePct > 0.15) {
    reasons.push(`扣掉执行摩擦后，净边际仍剩 ${pct(netEdgePct)}。`);
  } else if (token.warrant?.status === "Approved") {
    reasons.push(`虽然净边际不厚，但当前 lane 仍可执行。`);
  } else {
    reasons.push(`净边际偏薄，暂时还不值得出手。`);
  }

  if (token.flowScore >= 68) {
    reasons.push(`资金流 ${Math.round(token.flowScore)}/100，成交确认仍在。`);
  } else if (token.narrativeScore >= 70) {
    reasons.push(`叙事热度 ${Math.round(token.narrativeScore)}/100，催化还没有完全退潮。`);
  }

  if (marketContext?.fearGreedValue != null && marketContext.fearGreedValue <= 20) {
    reasons.push("极端恐慌环境会放大错位，也会缩短机会窗口。");
  }

  return reasons.slice(0, 3);
}

function buildStateShift(token, previousSnapshot) {
  if (!previousSnapshot) {
    return {
      direction: "fresh",
      magnitude: 12,
      headline: "首次进入扫描视图",
    };
  }

  const previousRank = VERDICT_RANK[previousSnapshot.status] || 0;
  const currentRank = VERDICT_RANK[token.warrant?.status] || 0;
  const netEdgeDelta = safeNumber(token.opportunity?.netEdgePct) - safeNumber(previousSnapshot.netEdgePct);
  const scoreDelta = safeNumber(token.opportunity?.score) - safeNumber(previousSnapshot.score);

  if (previousSnapshot.status !== token.warrant?.status) {
    return {
      direction: currentRank > previousRank ? "up" : "down",
      magnitude: 35 + Math.abs(currentRank - previousRank) * 6,
      headline: `${previousSnapshot.status} -> ${token.warrant?.status}`,
    };
  }

  if (Math.abs(netEdgeDelta) >= 0.12) {
    return {
      direction: netEdgeDelta > 0 ? "up" : "down",
      magnitude: Math.abs(netEdgeDelta) * 100,
      headline: `净边际 ${netEdgeDelta > 0 ? "扩大" : "收缩"} ${Math.abs(netEdgeDelta).toFixed(2)}%`,
    };
  }

  if (Math.abs(scoreDelta) >= 5) {
    return {
      direction: scoreDelta > 0 ? "up" : "down",
      magnitude: Math.abs(scoreDelta),
      headline: `机会分 ${scoreDelta > 0 ? "提升" : "回落"} ${Math.abs(Math.round(scoreDelta))}`,
    };
  }

  return {
    direction: "flat",
    magnitude: 1,
    headline: "结构基本稳定",
  };
}

function buildOpportunityCase(token, marketContext, previousTimeline, mandate) {
  const currentFingerprint = mandateFingerprint(mandate);
  const replayBase = (Array.isArray(previousTimeline) ? previousTimeline : []).filter(
    (snapshot) => !snapshot.mandateFingerprint || snapshot.mandateFingerprint === currentFingerprint,
  );
  const previousSnapshot = replayBase.at(-1) || null;
  const grossEdgePct = computeGrossEdgePct(token);
  const executionCostPct = computeExecutionCostPct(token);
  const netEdgePct =
    token.warrant?.status === "Revoked" || token.warrant?.status === "Rejected"
      ? Number((-executionCostPct).toFixed(2))
      : Number((grossEdgePct - executionCostPct).toFixed(2));
  const referenceCapitalUsd = safeNumber(mandate?.settings?.referenceCapitalUsd, DEFAULT_MANDATE.settings.referenceCapitalUsd);
  const suggestedNotionalUsd = Number(((referenceCapitalUsd * safeNumber(token.warrant?.riskBudgetPct)) / 100).toFixed(2));
  const expectedGrossPnlUsd = Number(((suggestedNotionalUsd * grossEdgePct) / 100).toFixed(2));
  const expectedNetPnlUsd = Number(((suggestedNotionalUsd * netEdgePct) / 100).toFixed(2));

  const confidenceScore = clamp(
    Math.round((token.fitScore || 0) * 0.62 + (token.flowScore || 0) * 0.12 - (token.fragilityScore || 0) * 0.16),
    0,
    100,
  );

  const score = clamp(
    Math.round(
      (token.fitScore || 0) * 0.54 +
        Math.max(netEdgePct, 0) * 28 +
        (token.warrant?.status === "Approved" ? 14 : token.warrant?.status === "Deferred" ? 4 : -12) -
        (token.fragilityScore || 0) * 0.16 -
        (token.auditRisk || 0) * 0.08,
    ),
    0,
    100,
  );

  const opportunity = {
    kind: opportunityKind(token),
    score,
    confidenceScore,
    referenceCapitalUsd,
    suggestedNotionalUsd,
    grossEdgePct: Number(grossEdgePct.toFixed(2)),
    executionCostPct: Number(executionCostPct.toFixed(2)),
    netEdgePct,
    expectedGrossPnlUsd,
    expectedNetPnlUsd,
    band: opportunityBand({ status: token.warrant?.status, netEdgePct }),
    whyNow: buildWhyNow(token, marketContext, grossEdgePct, netEdgePct),
    stateShift: null,
    replay: [],
  };

  opportunity.stateShift = buildStateShift({ ...token, opportunity }, previousSnapshot);
  opportunity.replay = [
    ...replayBase.slice(-3),
    {
      status: token.warrant?.status || "Deferred",
      lane: token.warrant?.lane || "blocked",
      score,
      netEdgePct,
      grossEdgePct: Number(grossEdgePct.toFixed(2)),
      executionCostPct: Number(executionCostPct.toFixed(2)),
      referenceCapitalUsd,
      suggestedNotionalUsd,
      expectedGrossPnlUsd,
      expectedNetPnlUsd,
      mandateFingerprint: currentFingerprint,
      generatedAt: token.generatedAt || new Date().toISOString(),
    },
  ];
  return opportunity;
}

function signedCompactUsd(value) {
  const numeric = safeNumber(value, 0);
  const prefix = numeric > 0 ? "+" : numeric < 0 ? "-" : "";
  return `${prefix}${compactUsdForRule(Math.abs(numeric))}`;
}

function buildAlertFeed(tokens) {
  return tokens
    .map((token) => {
      const replay = token.opportunity?.replay || [];
      const current = replay.at(-1);
      const previous = replay.at(-2);

      if (!current || !previous) return null;

      const currentStatus = current.status || token.warrant?.status || "Deferred";
      const previousStatus = previous.status || "Deferred";
      const currentNetPnlUsd = safeNumber(current.expectedNetPnlUsd, 0);
      const previousNetPnlUsd = safeNumber(previous.expectedNetPnlUsd, 0);
      const pnlDeltaUsd = Number((currentNetPnlUsd - previousNetPnlUsd).toFixed(2));
      const netEdgeDelta = Number((safeNumber(current.netEdgePct) - safeNumber(previous.netEdgePct)).toFixed(2));
      const scoreDelta = safeNumber(current.score) - safeNumber(previous.score);

      let severity = "";
      let kind = "";
      let headline = "";
      let body = "";

      if (currentStatus === "Approved" && previousStatus !== "Approved" && currentNetPnlUsd > 0 && safeNumber(current.netEdgePct) > 0) {
        severity = "high";
        kind = "window-opened";
        headline = `${token.symbol} 转正为可执行利润窗口`;
        body = `状态 ${previousStatus} -> Approved，当前 lane ${token.warrant?.lane || current.lane}，预估净收益 ${signedCompactUsd(currentNetPnlUsd)}。`;
      } else if (previousStatus === "Approved" && currentStatus !== "Approved") {
        severity = "high";
        kind = "window-lost";
        headline = `${token.symbol} 已失去可执行资格`;
        body = `状态 Approved -> ${currentStatus}，当前更适合撤销关注，预估净收益回落到 ${signedCompactUsd(currentNetPnlUsd)}。`;
      } else if (currentStatus === "Revoked" && previousStatus !== "Revoked") {
        severity = "high";
        kind = "fake-edge";
        headline = `${token.symbol} 被识别为伪机会`;
        body = `系统把它从 ${previousStatus} 降级为 Revoked，当前更像坏市场或失活 lane。`;
      } else if (previousNetPnlUsd <= 0 && currentNetPnlUsd > 0) {
        severity = "high";
        kind = "net-pnl-cross";
        headline = `${token.symbol} 预估净收益转正`;
        body = `净收益从 ${signedCompactUsd(previousNetPnlUsd)} 提升到 ${signedCompactUsd(currentNetPnlUsd)}，适合优先复审。`;
      } else if (currentStatus === "Approved" && currentNetPnlUsd > 0 && (pnlDeltaUsd >= 6 || netEdgeDelta >= 0.18 || scoreDelta >= 8)) {
        severity = "medium";
        kind = "pnl-expanding";
        headline = `${token.symbol} 利润窗口正在扩大`;
        body = `预估净收益变化 ${signedCompactUsd(pnlDeltaUsd)}，净边际变化 ${pct(netEdgeDelta)}，机会分变化 ${Math.round(scoreDelta)}。`;
      } else if (currentStatus === "Deferred" && (pnlDeltaUsd >= 4 || netEdgeDelta >= 0.12 || scoreDelta >= 6)) {
        severity = "medium";
        kind = "watch-upgrade";
        headline = `${token.symbol} 正在逼近可执行区`;
        body = `虽然仍是 Deferred，但净收益变化 ${signedCompactUsd(pnlDeltaUsd)}，可以提前加入重点观察。`;
      } else if (currentStatus === "Approved" && safeNumber(token.warrant?.ttlMinutes, 0) <= 20) {
        severity = "low";
        kind = "ttl-review";
        headline = `${token.symbol} 进入短 TTL 复审区`;
        body = `当前机会仍可执行，但 TTL 只剩 ${token.warrant?.ttlMinutes} 分钟，适合立即复审。`;
      } else {
        return null;
      }

      return {
        symbol: token.symbol,
        severity,
        kind,
        headline,
        body,
        status: currentStatus,
        lane: token.warrant?.lane || current.lane || "blocked",
        score: token.opportunity?.score || current.score || 0,
        netEdgePct: token.opportunity?.netEdgePct ?? current.netEdgePct ?? 0,
        expectedNetPnlUsd: currentNetPnlUsd,
        pnlDeltaUsd,
        ttlMinutes: token.warrant?.ttlMinutes || 0,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const severityDelta = (ALERT_SEVERITY_RANK[right.severity] || 0) - (ALERT_SEVERITY_RANK[left.severity] || 0);
      if (severityDelta !== 0) return severityDelta;
      const pnlDelta = Math.abs(safeNumber(right.pnlDeltaUsd)) - Math.abs(safeNumber(left.pnlDeltaUsd));
      if (pnlDelta !== 0) return pnlDelta;
      return safeNumber(right.score) - safeNumber(left.score);
    })
    .slice(0, 6);
}

function buildReasonChain(token) {
  const reasons = [];

  if (!token.hasSpot) {
    reasons.push("Binance Spot 委托簿不可用，当前不具备基本成交可见性。");
  } else {
    reasons.push(`Binance Spot 委托簿正常，可见执行 lane 已打开。`);
  }

  if (token.venueMismatch) {
    reasons.push(`链上参考价与交易所价格出现 ${token.mismatchRatio?.toFixed(1) || "多倍"} 级断层，更像坏市场而非正常价差。`);
  } else if (Math.abs(token.dexSpotSpreadPct) >= 0.4) {
    reasons.push(`DEX→Spot 错位 ${pct(token.dexSpotSpreadPct)}，已经进入值得认真处理的利润窗口。`);
  } else {
    reasons.push(`当前错位 ${pct(token.dexSpotSpreadPct)}，更适合继续观察，而不是立刻出手。`);
  }

  if (token.auditRisk >= 55) {
    reasons.push(`审计风险 ${Math.round(token.auditRisk)}/100，先防守。`);
  } else {
    reasons.push(`审计风险 ${Math.round(token.auditRisk)}/100，风险闸门暂未触发硬 veto。`);
  }

  if (token.executionFriction >= 45) {
    reasons.push(`执行摩擦 ${Math.round(token.executionFriction)}/100，说明这不是低阻力通道。`);
  } else {
    reasons.push(`执行摩擦 ${Math.round(token.executionFriction)}/100，当前 lane 尚可承受。`);
  }

  if (token.warrantLane === "basis") {
    reasons.push("当前更像 basis lane，应按结构性对冲机会处理，而不是把它当纯方向交易。");
  }
  if (token.baseLane !== token.warrantLane) {
    reasons.push(`原始 lane 是 ${token.baseLane}，但当前 mandate 已将它收缩到 ${token.warrantLane}。`);
  }
  if (token.riskFlags.includes("security unavailable")) {
    reasons.push("安全源未完整返回，这个机会需要更短 TTL 与更高复审频率。");
  }

  return reasons.slice(0, 5);
}

function buildInvalidationRules(token) {
  const rules = [
    "Binance Spot bid / ask 再次失真或消失，立即把这个机会降级。",
    `如果 DEX→Spot 错位回落到 ${Math.max(0.15, Math.abs(token.dexSpotSpreadPct) * 0.35).toFixed(2)}% 以下，当前窗口失去稀缺性。`,
  ];

  if (token.hasFutures) {
    rules.push("如果 futures lane 失活或 funding lane 不再可用，basis / futures 执行逻辑立即失效。");
  }
  if ((token.dexLiquidityUsd || 0) > 0) {
    rules.push(`如果 DEX 流动性跌破 ${compactUsdForRule(token.dexLiquidityUsd * 0.55)}，这张机会单需要重新复审。`);
  }
  if (token.venueMismatch) {
    rules.push("只要 venue mismatch 仍处于多倍断层，就不得把它重新视为真实机会。");
  }

  return rules.slice(0, 4);
}

function buildRecheckTriggers(token, marketContext) {
  const triggers = [
    `叙事热度上穿 ${Math.min(92, Math.round(token.narrativeScore + 8))} 或下破 ${Math.max(25, Math.round(token.narrativeScore - 10))} 时复审。`,
    `资金流上穿 ${Math.min(92, Math.round(token.flowScore + 6))} 或跌破 ${Math.max(25, Math.round(token.flowScore - 12))} 时复审。`,
  ];

  if (token.hasFutures) {
    triggers.push("Funding 方向反转或 next funding lane 异常时复审。");
  }
  if (marketContext?.fearGreedValue != null) {
    triggers.push(`全局情绪从当前 ${marketContext.fearGreedValue} 发生 regime 切换时复审。`);
  }

  return triggers.slice(0, 4);
}

function compactUsdForRule(value) {
  if (!value) return "$0";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Number(value).toFixed(0)}`;
}

function buildCapitalWarrant(token, marketContext, generatedAt, mandate) {
  const settings = mandate.settings;
  const netExecutableEdgePct = computeGrossEdgePct(token) - computeExecutionCostPct(token);
  const hasPositiveExecutableEdge = netExecutableEdgePct > 0.05;
  const hardReject =
    token.auditRisk >= settings.maxAuditRisk ||
    token.riskFlags.some((flag) => ["honeypot", "cannot_sell_all", "blacklist"].includes(flag));
  const revocationRisk =
    token.venueMismatch ||
    token.riskFlags.includes("spot_book_off") ||
    token.riskFlags.includes("futures_inactive");

  let status = "Deferred";
  const minFitReject = Math.max(18, settings.minFitApprove - 30);

  if (revocationRisk) {
    status = "Revoked";
  } else if (hardReject) {
    status = "Rejected";
  } else if (
    token.fitScore >= settings.minFitApprove &&
    token.fragilityScore <= settings.maxFragilityApprove &&
    token.warrantLane !== "blocked" &&
    hasPositiveExecutableEdge
  ) {
    status = "Approved";
  } else if (token.fitScore < minFitReject || token.warrantLane === "blocked") {
    status = "Rejected";
  }

  let riskBudgetPct = 0;
  if (status === "Approved") {
    const laneCap = Math.min(settings.maxRiskBudgetPct, token.warrantLane === "basis" ? 34 : token.warrantLane === "spot" ? 24 : 18);
    riskBudgetPct = clamp(Math.round((token.fitScore - token.fragilityScore * 0.35) / 2.6), 10, laneCap);
  } else if (status === "Deferred") {
    riskBudgetPct = clamp(Math.round(token.fitScore / 10), 4, 10);
  }

  const ttlMinutes =
    status === "Approved"
      ? token.warrantLane === "basis"
        ? 45
        : 90
      : status === "Deferred"
        ? token.fragilityScore >= 55
          ? 20
          : 60
        : status === "Revoked"
          ? 15
          : 0;

  const expiresAt = ttlMinutes ? new Date(new Date(generatedAt).getTime() + ttlMinutes * 60_000).toISOString() : null;
  const reviewPriority = clamp(
    token.fragilityScore + (status === "Approved" ? 18 : 8) + (token.warrantLane === "basis" ? 10 : 0),
    0,
    100,
  );

  let approvalHeadline = "";
  if (status === "Approved") {
    approvalHeadline =
      token.warrantLane === "basis"
        ? `这是当前少数可执行的 basis 利润窗口，可先动用 ${riskBudgetPct}% 风险预算。`
        : `这是当前少数可执行的 ${token.warrantLane} 机会，当前 fit ${Math.round(token.fitScore)}。`;
  } else if (status === "Deferred") {
    approvalHeadline = hasPositiveExecutableEdge
      ? `机会还在形成，利润空间和确认度暂时不够，先观察。`
      : `表面上有窗口，但净边际还没跑赢执行成本，先观察。`;
  } else if (status === "Revoked") {
    approvalHeadline = `表面上有 edge，但当前更像假机会或坏市场。`;
  } else {
    approvalHeadline = `当前利润空间不足以覆盖风险与执行摩擦，先跳过。`;
  }

  const capitalAction =
    status === "Approved"
      ? `Actionable now via ${token.warrantLane} lane`
      : status === "Deferred"
        ? "Keep on watchlist"
        : status === "Revoked"
          ? "Fake edge / broken market"
          : "Skip this setup";

  return {
    status,
    lane: token.warrantLane,
    fitScore: token.fitScore,
    fitLabel: fitLabel(token.fitScore),
    riskBudgetPct,
    ttlMinutes,
    expiresAt,
    fragilityScore: token.fragilityScore,
    reviewPriority,
    capitalAction,
    approvalHeadline,
    mandateSettings: settings,
    reasonChain: buildReasonChain(token),
    invalidationRules: buildInvalidationRules(token),
    recheckTriggers: buildRecheckTriggers(token, marketContext),
  };
}

function buildExecutionBrief(token) {
  const status = token.warrant?.status || "Deferred";
  const lane = token.warrant?.lane || "blocked";
  const grossEdgePct = safeNumber(token.opportunity?.grossEdgePct, computeGrossEdgePct(token));
  const executionCostPct = safeNumber(token.opportunity?.executionCostPct, computeExecutionCostPct(token));
  const netEdgePct = safeNumber(token.opportunity?.netEdgePct, grossEdgePct - executionCostPct);
  const suggestedNotionalUsd = safeNumber(token.opportunity?.suggestedNotionalUsd, 0);
  const expectedNetPnlUsd = safeNumber(token.opportunity?.expectedNetPnlUsd, 0);
  const capitalAtRiskUsd = Number(((suggestedNotionalUsd * executionCostPct) / 100).toFixed(2));
  const rewardCostRatio = executionCostPct > 0 ? Number((Math.max(grossEdgePct, 0) / executionCostPct).toFixed(2)) : null;

  let posture = "Monitor";
  let primaryAction = "";
  let summary = "";

  if (status === "Approved") {
    posture = "Act Now";
    primaryAction =
      lane === "basis"
        ? `先走 basis lane，用 ${token.warrant?.riskBudgetPct || 0}% 风险预算捕捉结构性错位。`
        : lane === "futures"
          ? `优先用 futures lane 轻量执行，并把仓位压在 ${token.warrant?.riskBudgetPct || 0}% 风险预算内。`
          : `优先走 spot lane，按 ${token.warrant?.riskBudgetPct || 0}% 风险预算分批处理。`;
    summary = `当前净边际 ${pct(netEdgePct)}，预估净收益 ${signedCompactUsd(expectedNetPnlUsd)}，窗口仍在可执行区。`;
  } else if (status === "Deferred") {
    posture = "Watch Tight";
    primaryAction = "先不出手，把它放进重点观察队列，等 edge 或确认度进一步抬升。";
    summary = netEdgePct > 0
      ? `虽然还有 ${pct(netEdgePct)} 的净边际，但确认度和脆弱度还没同时过线。`
      : `当前净边际 ${pct(netEdgePct)}，还没跑赢执行成本，不值得现在投入仓位。`;
  } else if (status === "Revoked") {
    posture = "Avoid";
    primaryAction = "不要把它当真钱机会处理，先把注意力转移到更干净的窗口。";
    summary = `当前更像坏市场或失活 lane，继续找进场理由只会放大误判。`;
  } else {
    posture = "Skip";
    primaryAction = "直接跳过，不要让这张单子占用注意力和风险预算。";
    summary = `利润空间和执行质量都不够，当前不值得继续深挖。`;
  }

  return {
    posture,
    primaryAction,
    summary,
    breakEvenEdgePct: Number(executionCostPct.toFixed(2)),
    roomAfterCostPct: Number(netEdgePct.toFixed(2)),
    rewardCostRatio,
    capitalAtRiskUsd,
    expectedNetPnlUsd: Number(expectedNetPnlUsd.toFixed(2)),
    checklist: [...(token.opportunity?.whyNow || []), ...(token.warrant?.reasonChain || [])].slice(0, 3),
    killSwitch: (token.warrant?.invalidationRules || []).slice(0, 2),
    nextReview: (token.warrant?.recheckTriggers || []).slice(0, 2),
  };
}

function buildPostmortem(token) {
  const currentStatus = token.warrant?.status || "Deferred";
  const replay = token.opportunity?.replay || [];
  const previous = replay.at(-2);
  const previousStatus = previous?.status || null;
  const expectedNetPnlUsd = safeNumber(token.opportunity?.expectedNetPnlUsd, 0);
  const capitalAtRiskUsd = safeNumber(token.executionBrief?.capitalAtRiskUsd, 0);
  const avoidedLossUsd = Number(Math.max(capitalAtRiskUsd, Math.abs(Math.min(expectedNetPnlUsd, 0))).toFixed(2));

  if (currentStatus === "Approved") {
    return null;
  }

  let kind = "no-edge";
  let headline = `${token.symbol} 当前不值得继续做`;
  let rootCause = "当前利润空间、执行性或机会质量至少有一项掉出了可执行区。";
  let lesson = "不要让低质量窗口持续占用注意力。";
  let nextScreen = "等新的 edge、lane 或资金流确认重新出现后，再让系统复审。";

  if (previousStatus === "Approved" && currentStatus !== "Approved") {
    kind = "window-lost";
    headline = `${token.symbol} 的可执行窗口已经失效`;
    rootCause = `它曾经是 Approved，但现在变成 ${currentStatus}，说明这张机会单已经从可做变成不可做。`;
    lesson = "一旦窗口掉出可执行区，优先做撤退判断，不要继续追着旧 thesis 走。";
    nextScreen = token.warrant?.recheckTriggers?.[0] || nextScreen;
  } else if (token.venueMismatch) {
    kind = "broken-market";
    headline = `${token.symbol} 不是套利，是坏市场`;
    rootCause = `链上与 Binance 出现 ${token.mismatchRatio?.toFixed(1) || "多倍"} 断层，这类窗口更像坏价格或脏流动性。`;
    lesson = "巨大价差首先怀疑市场质量，而不是先假设自己发现了免费利润。";
    nextScreen = "只有 venue mismatch 明显收敛后，才值得重新审一遍。";
  } else if (token.riskFlags.includes("spot_book_off") || token.riskFlags.includes("futures_inactive")) {
    kind = "lane-dead";
    headline = `${token.symbol} 的执行通道已经失效`;
    rootCause = "至少一条关键执行 lane 已经失活，导致原本的执行路径不能成立。";
    lesson = "利润窗口只有在执行通道真实可走时才成立，通道坏了就不是机会。";
    nextScreen = "先等 spot / futures lane 恢复，再看这张单子是否值得回来。";
  } else if (
    token.auditRisk >= safeNumber(token.warrant?.mandateSettings?.maxAuditRisk, DEFAULT_MANDATE.settings.maxAuditRisk) ||
    token.riskFlags.some((flag) => ["honeypot", "cannot_sell_all", "blacklist"].includes(flag))
  ) {
    kind = "risk-gated";
    headline = `${token.symbol} 被风险闸门挡下`;
    rootCause = `审计风险 ${Math.round(token.auditRisk)}/100，系统优先把它归到风险案例，而不是利润案例。`;
    lesson = "在高风险资产上追逐边际，通常会把表面利润换成结构性亏损。";
    nextScreen = "只有风险标记明显改善，才值得重新打开。";
  } else if (expectedNetPnlUsd <= 0 && safeNumber(token.opportunity?.grossEdgePct, 0) > 0) {
    kind = "cost-overrun";
    headline = `${token.symbol} 的毛边际被执行成本吃掉了`;
    rootCause = `虽然表面上还有 ${pct(token.opportunity?.grossEdgePct || 0)} 的毛边际，但扣掉成本后净收益已经变成 ${signedCompactUsd(expectedNetPnlUsd)}。`;
    lesson = "真实利润看净边际，不看毛边际。";
    nextScreen = token.warrant?.recheckTriggers?.[0] || "等净边际重新转正再看。";
  }

  return {
    kind,
    headline,
    rootCause,
    lesson,
    nextScreen,
    avoidedLossUsd,
    previousStatus,
    currentStatus,
    lane: token.warrant?.lane || "blocked",
    score: token.opportunity?.score || 0,
  };
}

function buildRoute(strategy, token) {
  const basisRoute = [
    { skill: "query-token-info", note: "抓 DEX 侧价格、流动性与 24h 变化" },
    { skill: "spot", note: "对比 Binance Spot 定价" },
    { skill: "derivatives-trading-usds-futures", note: "验证升水与 funding 是否撑得住" },
    { skill: "assets", note: "确认执行摩擦是否还在可承受区间" },
  ];

  const watchRoute = [
    { skill: "crypto-market-rank", note: "判断叙事是否仍有延续性" },
    { skill: "query-token-info", note: "跟踪 DEX 流动性和价格变化" },
    { skill: "spot", note: "观察 Binance 跟价速度" },
  ];

  if (token.warrant?.status === "Revoked" || token.warrant?.status === "Rejected") {
    return [
      { skill: "query-token-audit", note: "先确认 veto 的根因是不是审计或结构性风险" },
      { skill: "query-token-info", note: "复核是不是脏 pair、坏流动性或坏市场" },
      { skill: "square-post", note: "输出拒绝交易的结论，而不是继续找进场理由" },
    ];
  }
  if (token.warrant?.status === "Approved" && token.warrant?.lane === "basis") {
    return basisRoute;
  }
  if (token.warrant?.status === "Approved" && token.warrant?.lane === "spot") {
    return [
      { skill: "crypto-market-rank", note: "确认叙事仍在 mandate 内，不是最后一棒热度" },
      { skill: "spot", note: "在 Binance Spot 建立基础暴露" },
      { skill: "assets", note: "把风险预算和执行节奏压在可撤销范围内" },
    ];
  }
  if (token.warrant?.status === "Approved" && token.warrant?.lane === "futures") {
    return [
      { skill: "trading-signal", note: "确认当前 flow 仍支持这笔机会，而不是短暂冲动成交" },
      { skill: "derivatives-trading-usds-futures", note: "在 futures lane 建立轻量级执行暴露" },
      { skill: "assets", note: "把 risk budget 和复审 TTL 严格绑定" },
    ];
  }
  if (token.warrant?.status === "Deferred") {
    return [
      { skill: "query-token-info", note: "继续观察流动性与成交倾斜是否升级" },
      { skill: "trading-signal", note: "等待更强 confirmation，而不是提前出手" },
      { skill: "assets", note: "先只保留研究席位，不急着开正式仓位" },
    ];
  }
  if (strategy === "Basis Hedge") return basisRoute;
  if (strategy === "Risk Tombstone") {
    return [
      { skill: "query-token-audit", note: "风险闸门先于一切执行判断" },
      { skill: "query-token-info", note: "确认流动性和税率问题" },
      { skill: "square-post", note: "输出风险提示，不给交易建议" },
    ];
  }
  if (strategy === "Whale Shadow") {
    return [
      { skill: "trading-signal", note: "未来接聪明钱层时优先放这里" },
      { skill: "query-address-info", note: "后续补地址画像而不是只看成交代理" },
      { skill: "spot", note: "现阶段先给轻仓观察方案" },
    ];
  }
  if (strategy === "Margin Probe" && token.hasFutures) {
    return [
      { skill: "spot", note: "建立基础方向暴露" },
      { skill: "margin-trading", note: "只在确认不是假突破后再上杠杆" },
      { skill: "assets", note: "从资金与风险角度检查可行性" },
    ];
  }
  return watchRoute;
}

function buildSignalNote(token, marketContext) {
  if (token.warrant?.status === "Approved") {
    return `${token.name} 已进入可执行机会区，可走 ${token.warrant.lane} lane，建议按 ${token.warrant.ttlMinutes} 分钟 TTL 管理。`;
  }
  if (token.warrant?.status === "Deferred") {
    return `${token.name} 仍在观察队列，机会在形成，但还没到值得出手的程度。`;
  }
  if (token.warrant?.status === "Revoked") {
    return `${token.name} 表面上有利润边际，但当前更像假机会、坏市场或失活 lane。`;
  }
  if (token.venueMismatch) {
    return `${token.name} 的链上参考价与 Binance 价格出现 ${token.mismatchRatio?.toFixed(1) || "多倍"} 级脱节，更像市场断层而不是正常套利。`;
  }
  if (!token.hasSpot) {
    return `${token.name} 的 Binance Spot 委托簿不可用，这种标的不应被视为真钱机会。`;
  }
  return `${token.name} 当前处于 ${marketContext?.regime || "Unknown"} 环境下，先观察再判断是否值得做。`;
}

function buildSquareDraft(token, marketContext) {
  const fear = marketContext?.fearGreedValue;
  const fearText = fear == null ? "市场情绪未知" : `恐慌贪婪指数 ${fear}`;
  return [
    `【${token.symbol} / ${token.warrant?.status || token.strategy}】`,
    `${token.name} 当前机会判断为 ${token.warrant?.status || "Deferred"}，lane ${token.warrant?.lane || "blocked"}，fit ${Math.round(token.warrant?.fitScore || 0)}/100。`,
    `DEX→Binance Spot 错位 ${pct(token.dexSpotSpreadPct)}，审计风险 ${Math.round(token.auditRisk)}/100，执行摩擦 ${Math.round(token.executionFriction)}/100。`,
    `${fearText}。当前建议：${token.warrant?.approvalHeadline || "继续观察"}`,
  ].join("\n");
}

async function fetchDexPairs() {
  const results = await Promise.allSettled(
    WATCHLIST.map((token) =>
      fetchJson(`https://api.dexscreener.com/token-pairs/v1/bsc/${token.address}`).then((pairs) => ({
        symbol: token.symbol,
        pair: Array.isArray(pairs) ? pickBestPair(pairs) : null,
      })),
    ),
  );

  const fulfilled = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (!fulfilled.length) {
    const firstError = results.find((result) => result.status === "rejected");
    throw firstError?.reason || new Error("DexScreener pairs unavailable");
  }

  return new Map(fulfilled.map((item) => [item.symbol, item.pair]));
}

async function fetchDexBoosts() {
  const [latestResult, topResult] = await Promise.allSettled([
    fetchJson("https://api.dexscreener.com/token-boosts/latest/v1"),
    fetchJson("https://api.dexscreener.com/token-boosts/top/v1"),
  ]);

  const payloads = [latestResult, topResult]
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (!payloads.length) {
    const firstError = [latestResult, topResult].find((result) => result.status === "rejected");
    throw firstError?.reason || new Error("DexScreener boosts unavailable");
  }

  const map = new Map();
  payloads.flat().forEach((item) => {
    const address = String(item.tokenAddress || "").toLowerCase();
    if (!address) return;
    const current = map.get(address) || { amount: 0, description: "" };
    map.set(address, {
      amount: Math.max(current.amount, safeNumber(item.amount)),
      description: item.description || current.description || "",
    });
  });
  return map;
}

async function fetchFearGreed() {
  const payload = await fetchJson("https://api.alternative.me/fng/?limit=1");
  const latest = payload?.data?.[0];
  const fearGreedValue = latest ? safeNumber(latest.value, null) : null;
  return {
    fearGreedValue,
    fearGreedClass: latest?.value_classification || deriveFearGreedRegime(fearGreedValue),
    regime: deriveFearGreedRegime(fearGreedValue),
  };
}

async function fetchCoinGeckoData() {
  const ids = WATCHLIST.map((token) => token.coingeckoId).join(",");
  const [marketsResult, trendingResult] = await Promise.allSettled([
    fetchJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`),
    fetchJson("https://api.coingecko.com/api/v3/search/trending"),
  ]);

  if (marketsResult.status === "rejected" && trendingResult.status === "rejected") {
    throw marketsResult.reason || trendingResult.reason || new Error("CoinGecko unavailable");
  }

  const marketMap = new Map(
    (marketsResult.status === "fulfilled" ? marketsResult.value : []).map((item) => [item.id, item]),
  );
  const trendingIds = new Set(
    ((trendingResult.status === "fulfilled" ? trendingResult.value?.coins : []) || []).map((entry) => entry.item?.id),
  );

  return { marketMap, trendingIds };
}

async function fetchGoPlusSecurity() {
  const addresses = WATCHLIST.map((token) => token.address).join(",");
  const payload = await fetchJson(`https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=${addresses}`);
  return payload?.result || {};
}

async function fetchBinanceSpot() {
  const config = getBinanceRuntimeConfig();
  const symbols = WATCHLIST.map((token) => `${token.symbol}USDT`);
  const headers = config.apiKey
    ? {
        "X-MBX-APIKEY": config.apiKey,
      }
    : {};

  try {
    const { data: payload } = await fetchJsonFromCandidates(`/api/v3/ticker/24hr?symbols=${encodeSymbols(symbols)}`, {
      baseUrls: config.spotFallbackBaseUrls,
      headers,
    });
    return new Map(payload.map((item) => [item.symbol.replace("USDT", ""), item]));
  } catch (batchError) {
    const results = await Promise.allSettled(
      WATCHLIST.map((token) =>
        fetchJsonFromCandidates(`/api/v3/ticker/24hr?symbol=${token.symbol}USDT`, {
          baseUrls: config.spotFallbackBaseUrls,
          headers,
        }).then(({ data: item }) => ({
          symbol: token.symbol,
          item,
        })),
      ),
    );

    const fulfilled = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => [result.value.symbol, result.value.item]);

    if (!fulfilled.length) {
      throw batchError;
    }

    return new Map(fulfilled);
  }
}

async function fetchBinanceFutures() {
  const config = getBinanceRuntimeConfig();
  const headers = config.apiKey
    ? {
        "X-MBX-APIKEY": config.apiKey,
      }
    : {};
  const results = await Promise.allSettled(
    WATCHLIST.map((token) =>
      fetchJsonFromCandidates(`/fapi/v1/premiumIndex?symbol=${token.symbol}USDT`, {
        baseUrls: config.futuresFallbackBaseUrls,
        headers,
      }).then(({ data: item }) => ({
        symbol: token.symbol,
        item,
      })),
    ),
  );

  return new Map(
    results
      .filter((result) => result.status === "fulfilled")
      .map((result) => [result.value.symbol, result.value.item]),
  );
}

async function fetchNewsStatus() {
  if (!process.env.CRYPTOCOMPARE_API_KEY) {
    return { enabled: false };
  }
  return { enabled: true };
}

async function buildOverview({ mandate: mandateOverride, mutateShiftHistory = false } = {}) {
  await loadEnvFile();
  await loadOpportunityHistory();

  const [dexResult, boostResult, fearResult, geckoResult, securityResult, spotResult, futuresResult, newsResult] = await Promise.all([
    cacheWrap("dex-pairs", 30000, fetchDexPairs),
    cacheWrap("dex-boosts", 60000, fetchDexBoosts),
    cacheWrap("fear-greed", 300000, fetchFearGreed),
    cacheWrap("coingecko", 300000, fetchCoinGeckoData),
    cacheWrap("goplus", 300000, fetchGoPlusSecurity),
    cacheWrap("binance-spot", 20000, fetchBinanceSpot),
    cacheWrap("binance-futures", 20000, fetchBinanceFutures),
    Promise.resolve({ status: process.env.CRYPTOCOMPARE_API_KEY ? "ok" : "disabled", data: await fetchNewsStatus() }),
  ]);

  const marketContext = fearResult.data || fallbackContext();
  const generatedAt = new Date().toISOString();
  const mandate = buildMandate(mandateOverride);
  const binanceConfig = getBinanceRuntimeConfig();
  const binanceAuth = await validateBinanceCredentials(binanceConfig).catch((error) => ({
    configured: binanceConfig.configured,
    keyPreview: binanceConfig.keyPreview,
    spotBaseUrl: binanceConfig.spotBaseUrl,
    futuresBaseUrl: binanceConfig.futuresBaseUrl,
    status: "error",
    headline: "Binance API 校验失败",
    detail: error.message,
  }));
  const previousTimelines = new Map(OPPORTUNITY_TIMELINE);

  const tokens = WATCHLIST.map((config) => {
    const dexPair = dexResult.data?.get(config.symbol) || null;
    const boostEntry = boostResult.data?.get(config.address.toLowerCase()) || { amount: 0, description: "" };
    const gecko = geckoResult.data?.marketMap?.get(config.coingeckoId) || null;
    const isTrending = geckoResult.data?.trendingIds?.has(config.coingeckoId) || false;
    const security = securityResult.data?.[config.address.toLowerCase()] || null;
    const spot = spotResult.data?.get(config.symbol) || null;
    const futures = futuresResult.data?.get(config.symbol) || null;
    const riskProfile = buildRiskProfile(security);
    const dexPriceUsd = dexPair ? safeNumber(dexPair.priceUsd, null) : null;
    const spotPrice = spot ? safeNumber(spot.lastPrice, null) : null;
    const futuresPrice = futures ? safeNumber(futures.markPrice, null) : null;
    const venueProfile = computeVenueProfile({ spot, futures, dexPriceUsd, gecko });
    const hasSpot = venueProfile.spotActive;
    const hasFutures = venueProfile.futuresActive;
    const dexSpotSpreadPct = dexPriceUsd && spotPrice ? ((spotPrice - dexPriceUsd) / dexPriceUsd) * 100 : 0;
    const spotPerpBasisPct = hasFutures && spotPrice ? ((futuresPrice - spotPrice) / spotPrice) * 100 : 0;
    const narrativeScore = computeNarrativeScore({ dexPair, boostAmount: boostEntry.amount, isTrending });
    const flowScore = computeFlowScore({ dexPair, binanceSpot: spot });
    const executionFriction = computeExecutionFriction({ dexPair, hasFutures, riskProfile, venueProfile });
    const fragilityScore = computeFragility({
      auditRisk: riskProfile.auditRisk,
      executionFriction,
      venueProfile,
      marketContext,
      dexSpotSpreadPct,
      dexLiquidityUsd: dexPair ? safeNumber(dexPair.liquidity?.usd, null) : null,
      hasFutures,
      riskFlags: riskProfile.riskFlags,
    });
    const fitScore = computeFitScore({
      narrativeScore,
      flowScore,
      auditRisk: riskProfile.auditRisk,
      executionFriction,
      fragilityScore,
      dexSpotSpreadPct,
      dexLiquidityUsd: dexPair ? safeNumber(dexPair.liquidity?.usd, null) : null,
      hasSpot,
      hasFutures,
      venueProfile,
    });
    const baseLane = determineLane({
      hasSpot,
      hasFutures,
      venueMismatch: venueProfile.venueMismatch,
      dexSpotSpreadPct,
      flowScore,
      narrativeScore,
    });
    const warrantLane = applyMandateToLane(baseLane, mandate, hasSpot);
    const strategy = computeStrategy({
      narrativeScore,
      flowScore,
      auditRisk: riskProfile.auditRisk,
      executionFriction,
      dexSpotSpreadPct,
      hasSpot,
      hasFutures,
      venueMismatch: venueProfile.venueMismatch,
    });

    const compositeScore =
      narrativeScore * 0.3 +
      flowScore * 0.24 +
      Math.min(Math.abs(dexSpotSpreadPct) * 16, 26) +
      (isTrending ? 8 : 0) +
      (hasFutures ? 6 : 0) -
      riskProfile.auditRisk * 0.26 -
      executionFriction * 0.18 -
      venueProfile.venuePenalty * 0.45;

    const token = {
      symbol: config.symbol,
      name: config.name,
      chain: config.chain,
      theme: config.theme,
      narrativeScore,
      flowScore,
      auditRisk: riskProfile.auditRisk,
      executionFriction,
      dexPriceUsd,
      spotPrice,
      futuresPrice,
      dexSpotSpreadPct,
      spotPerpBasisPct,
      fundingRatePct: futures ? safeNumber(futures.lastFundingRate) * 100 : null,
      dexLiquidityUsd: dexPair ? safeNumber(dexPair.liquidity?.usd, null) : null,
      dexVolume24hUsd: dexPair ? safeNumber(dexPair.volume?.h24, null) : null,
      marketCapUsd: gecko ? safeNumber(gecko.market_cap, null) : null,
      marketCapRank: gecko?.market_cap_rank || null,
      holderCount: riskProfile.holderCount,
      hasSpot,
      hasFutures,
      venueMismatch: venueProfile.venueMismatch,
      mismatchRatio: venueProfile.mismatchRatio,
      isTrending,
      boostAmount: boostEntry.amount || 0,
      riskFlags: [...riskProfile.riskFlags, ...venueProfile.riskFlags].slice(0, 6),
      strategy,
      compositeScore,
      generatedAt,
      fragilityScore,
      fitScore,
      baseLane,
      warrantLane,
      dexPairUrl: dexPair?.url || "",
      signalNote: "",
      route: [],
      squareDraft: "",
      warrant: null,
      opportunity: null,
      executionBrief: null,
      postmortem: null,
    };

    token.warrant = buildCapitalWarrant(token, marketContext, generatedAt, mandate);
    token.opportunity = buildOpportunityCase(token, marketContext, previousTimelines.get(config.symbol) || [], mandate);
    token.executionBrief = buildExecutionBrief(token);
    token.postmortem = buildPostmortem(token);
    token.signalNote = buildSignalNote(token, marketContext);
    token.route = buildRoute(strategy, token);
    token.squareDraft = buildSquareDraft(token, marketContext);
    return token;
  }).sort((left, right) => {
    const verdictDelta = (VERDICT_RANK[right.warrant?.status] || 0) - (VERDICT_RANK[left.warrant?.status] || 0);
    if (verdictDelta !== 0) return verdictDelta;
    const fitDelta = safeNumber(right.warrant?.fitScore) - safeNumber(left.warrant?.fitScore);
    if (fitDelta !== 0) return fitDelta;
    return safeNumber(right.compositeScore) - safeNumber(left.compositeScore);
  });

  const spotCoverage = tokens.filter((token) => token.spotPrice != null).length;
  const dexCoverage = tokens.filter((token) => token.dexPriceUsd != null).length;
  if (!spotCoverage && !dexCoverage) {
    throw new Error("Core live feeds unavailable");
  }

  const approvalSummary = tokens.reduce(
    (summary, token) => {
      const status = token.warrant?.status || "Deferred";
      summary[status.toLowerCase()] += 1;
      return summary;
    },
    { approved: 0, deferred: 0, revoked: 0, rejected: 0 },
  );

  const desk = {
    approved: tokens.filter((token) => token.warrant?.status === "Approved").slice(0, 3).map((token) => token.symbol),
    rejected: tokens
      .filter((token) => ["Rejected", "Revoked"].includes(token.warrant?.status))
      .sort((left, right) => safeNumber(right.fragilityScore) - safeNumber(left.fragilityScore))
      .slice(0, 3)
      .map((token) => token.symbol),
    reapproval: tokens
      .filter((token) => ["Approved", "Deferred", "Revoked"].includes(token.warrant?.status))
      .sort((left, right) => safeNumber(right.warrant?.reviewPriority) - safeNumber(left.warrant?.reviewPriority))
      .slice(0, 4)
      .map((token) => token.symbol),
  };

  const shiftFeed = tokens
    .map((token) => ({
      symbol: token.symbol,
      direction: token.opportunity?.stateShift?.direction || "flat",
      headline: token.opportunity?.stateShift?.headline || "结构基本稳定",
      score: token.opportunity?.score || 0,
      netEdgePct: token.opportunity?.netEdgePct || 0,
      expectedNetPnlUsd: token.opportunity?.expectedNetPnlUsd || 0,
      status: token.warrant?.status || "Deferred",
    }))
    .sort(
      (left, right) =>
        safeNumber(right.score) +
        safeNumber(right.netEdgePct) * 10 +
        safeNumber(right.expectedNetPnlUsd) * 0.02 -
        (safeNumber(left.score) + safeNumber(left.netEdgePct) * 10 + safeNumber(left.expectedNetPnlUsd) * 0.02),
    )
    .slice(0, 4);

  const alertFeed = buildAlertFeed(tokens);
  const postmortemFeed = tokens
    .filter((token) => token.postmortem)
    .map((token) => ({
      symbol: token.symbol,
      ...token.postmortem,
    }))
    .sort((left, right) => {
      const leftLost = left.previousStatus === "Approved" ? 1 : 0;
      const rightLost = right.previousStatus === "Approved" ? 1 : 0;
      if (rightLost !== leftLost) return rightLost - leftLost;
      const revokedDelta = (right.currentStatus === "Revoked" ? 1 : 0) - (left.currentStatus === "Revoked" ? 1 : 0);
      if (revokedDelta !== 0) return revokedDelta;
      const lossDelta = safeNumber(right.avoidedLossUsd) - safeNumber(left.avoidedLossUsd);
      if (lossDelta !== 0) return lossDelta;
      return safeNumber(right.score) - safeNumber(left.score);
    })
    .slice(0, 4);

  if (mutateShiftHistory) {
    tokens.forEach((token) => {
      const snapshot = {
        status: token.warrant?.status || "Deferred",
        lane: token.warrant?.lane || "blocked",
        score: token.opportunity?.score || 0,
        netEdgePct: token.opportunity?.netEdgePct || 0,
        grossEdgePct: token.opportunity?.grossEdgePct || 0,
        executionCostPct: token.opportunity?.executionCostPct || 0,
        referenceCapitalUsd: token.opportunity?.referenceCapitalUsd || mandate.settings.referenceCapitalUsd,
        suggestedNotionalUsd: token.opportunity?.suggestedNotionalUsd || 0,
        expectedGrossPnlUsd: token.opportunity?.expectedGrossPnlUsd || 0,
        expectedNetPnlUsd: token.opportunity?.expectedNetPnlUsd || 0,
        mandateFingerprint: mandateFingerprint(mandate),
        generatedAt,
      };

      const timeline = [...(OPPORTUNITY_TIMELINE.get(token.symbol) || []), snapshot].slice(-HISTORY_LIMIT);
      OPPORTUNITY_TIMELINE.set(token.symbol, timeline);
      OPPORTUNITY_HISTORY.set(token.symbol, snapshot);
    });

    try {
      await persistOpportunityHistory();
    } catch (error) {
      console.error("Failed to persist opportunity history:", error.message);
    }
  }

  return {
    mode: [dexResult, fearResult, geckoResult, securityResult, spotResult, futuresResult].some((item) => item.status === "error")
      ? "degraded"
      : "live",
    pollMs: POLL_MS,
    generatedAt,
    marketContext,
    userMandate: mandate,
    approvalSummary,
    desk,
    alertFeed,
    postmortemFeed,
    shiftFeed,
    sourceHealth: {
      binance: summarizeSourceStatus(spotResult, futuresResult),
      binanceAuth,
      dexscreener: summarizeSingleSource(dexResult),
      goplus: summarizeSingleSource(securityResult),
      coingecko: summarizeSingleSource(geckoResult),
      alternative: summarizeSingleSource(fearResult),
      cryptocompare: summarizeSingleSource(newsResult),
    },
    binanceConfig: {
      configured: binanceConfig.configured,
      keyPreview: binanceConfig.keyPreview,
      spotBaseUrl: binanceConfig.spotBaseUrl,
      futuresBaseUrl: binanceConfig.futuresBaseUrl,
      validation: binanceAuth,
    },
    tokens,
  };
}

async function buildLiveOverview({ mandate: mandateOverride, mutateShiftHistory = false, force = false } = {}) {
  const mandate = buildMandate(mandateOverride);
  const key = mandateFingerprint(mandate);
  const cached = LIVE_OVERVIEW_CACHE.get(key);

  if (!force && cached?.payload && Date.now() - cached.fetchedAt < POLL_MS) {
    return cached.payload;
  }

  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const entry = cached || {
    payload: null,
    fetchedAt: 0,
    inFlight: null,
    lastError: null,
  };
  LIVE_OVERVIEW_CACHE.set(key, entry);

  entry.inFlight = buildOverview({
    mandate,
    mutateShiftHistory,
  })
    .then((overview) => {
      entry.payload = overview;
      entry.fetchedAt = Date.now();
      entry.lastError = null;
      persistLastOverviewSnapshot(overview).catch((error) => {
        console.error("Failed to persist last overview snapshot:", error.message);
      });
      return overview;
    })
    .catch(async (error) => {
      entry.lastError = {
        message: error.message,
        at: new Date().toISOString(),
      };

      if (entry.payload) {
        return annotateStaleOverview(entry.payload, error.message);
      }

      const lastSnapshot = (await loadLastOverviewSnapshot()) || LAST_OVERVIEW_SNAPSHOT;
      if (lastSnapshot?.tokens?.length) {
        const staleSnapshot = annotateStaleOverview(lastSnapshot, error.message);
        entry.payload = staleSnapshot;
        entry.fetchedAt = Date.now();
        return staleSnapshot;
      }

      const emergencyOverview = buildEmergencyOverview({
        mandate,
        errorMessage: error.message,
      });
      entry.payload = emergencyOverview;
      entry.fetchedAt = Date.now();
      return emergencyOverview;
    })
    .finally(() => {
      entry.inFlight = null;
    });

  return entry.inFlight;
}

function summarizeSingleSource(source) {
  return {
    status: source.status,
    updatedAt: source.updatedAt || null,
    error: source.error || null,
  };
}

function summarizeSourceStatus(spotResult, futuresResult) {
  if (spotResult.status === "error" && futuresResult.status === "error") {
    return { status: "error", error: `${spotResult.error || ""} ${futuresResult.error || ""}`.trim() };
  }
  if (spotResult.status === "stale" || futuresResult.status === "stale") {
    return { status: "stale", error: spotResult.error || futuresResult.error || null };
  }
  return { status: "ok", error: null };
}

function fallbackContext() {
  return {
    fearGreedValue: null,
    fearGreedClass: "Unavailable",
    regime: "Unknown",
  };
}

function cloneOverviewPayload(payload) {
  return JSON.parse(JSON.stringify(payload));
}

function staleSourceHealth(sourceHealth = {}, errorMessage, fallbackUpdatedAt) {
  const next = { ...sourceHealth };
  const keys = ["binance", "dexscreener", "goplus", "coingecko", "alternative", "cryptocompare"];

  keys.forEach((key) => {
    const current = next[key] || {};
    next[key] = {
      ...current,
      status: current.status === "ok" || current.status === "live" ? "stale" : current.status || "stale",
      updatedAt: current.updatedAt || fallbackUpdatedAt || null,
      error: current.error || errorMessage || null,
    };
  });

  return next;
}

function buildEmergencyOverview({ mandate, errorMessage }) {
  const generatedAt = new Date().toISOString();
  const fingerprint = mandateFingerprint(mandate);
  const tokens = WATCHLIST.map((config) => {
    const replayBase = (OPPORTUNITY_TIMELINE.get(config.symbol) || []).filter(
      (snapshot) => !snapshot.mandateFingerprint || snapshot.mandateFingerprint === fingerprint,
    );
    const snapshot = replayBase.at(-1) || OPPORTUNITY_HISTORY.get(config.symbol) || null;
    const status = snapshot?.status || "Deferred";
    const lane = snapshot?.lane || "research";
    const grossEdgePct = Number(safeNumber(snapshot?.grossEdgePct, status === "Approved" ? 0.44 : 0.12).toFixed(2));
    const executionCostPct = Number(safeNumber(snapshot?.executionCostPct, status === "Approved" ? 0.22 : 0.28).toFixed(2));
    const netEdgePct = Number(safeNumber(snapshot?.netEdgePct, grossEdgePct - executionCostPct).toFixed(2));
    const referenceCapitalUsd = safeNumber(
      snapshot?.referenceCapitalUsd,
      mandate?.settings?.referenceCapitalUsd || DEFAULT_MANDATE.settings.referenceCapitalUsd,
    );
    const suggestedNotionalUsd = Number(
      safeNumber(
        snapshot?.suggestedNotionalUsd,
        (referenceCapitalUsd * (status === "Approved" ? 0.18 : status === "Deferred" ? 0.06 : 0)).toFixed(2),
      ).toFixed(2),
    );
    const expectedGrossPnlUsd = Number(
      safeNumber(snapshot?.expectedGrossPnlUsd, (suggestedNotionalUsd * grossEdgePct) / 100).toFixed(2),
    );
    const expectedNetPnlUsd = Number(
      safeNumber(snapshot?.expectedNetPnlUsd, (suggestedNotionalUsd * netEdgePct) / 100).toFixed(2),
    );
    const score = Math.round(safeNumber(snapshot?.score, status === "Approved" ? 68 : status === "Deferred" ? 46 : 24));
    const fitScore = clamp(status === "Approved" ? score + 12 : status === "Deferred" ? score + 8 : score + 4, 0, 100);
    const fragilityScore = clamp(status === "Approved" ? 38 : status === "Deferred" ? 52 : 76, 0, 100);
    const hasSpot = ["spot", "basis", "research", "futures"].includes(lane);
    const hasFutures = ["basis", "futures"].includes(lane);
    const riskBudgetPct =
      suggestedNotionalUsd > 0 && referenceCapitalUsd > 0
        ? clamp(Math.round((suggestedNotionalUsd / referenceCapitalUsd) * 100), 0, mandate.settings.maxRiskBudgetPct)
        : 0;
    const ttlMinutes = status === "Approved" ? 30 : status === "Deferred" ? 20 : 15;

    const token = {
      symbol: config.symbol,
      name: config.name,
      chain: config.chain,
      theme: config.theme,
      narrativeScore: clamp(score + (status === "Approved" ? 8 : 0), 0, 100),
      flowScore: clamp(score + (status === "Approved" ? 4 : 0), 0, 100),
      auditRisk: status === "Rejected" ? 72 : status === "Revoked" ? 58 : 34,
      executionFriction: clamp(executionCostPct * 42 + (status === "Revoked" ? 18 : 0), 8, 100),
      dexPriceUsd: null,
      spotPrice: null,
      futuresPrice: null,
      dexSpotSpreadPct: grossEdgePct,
      spotPerpBasisPct: lane === "basis" || lane === "futures" ? Number((grossEdgePct * 0.42).toFixed(2)) : 0,
      fundingRatePct: null,
      dexLiquidityUsd: null,
      dexVolume24hUsd: null,
      marketCapUsd: null,
      marketCapRank: null,
      holderCount: null,
      hasSpot,
      hasFutures,
      venueMismatch: status === "Revoked" && lane === "blocked",
      mismatchRatio: status === "Revoked" && lane === "blocked" ? 8.2 : null,
      isTrending: false,
      boostAmount: 0,
      riskFlags: ["live_sources_unavailable"],
      strategy: status === "Approved" ? "Opportunity Memory" : status === "Deferred" ? "Watch Memory" : "Risk Tombstone",
      compositeScore: score,
      generatedAt,
      fragilityScore,
      fitScore,
      baseLane: lane,
      warrantLane: lane,
      dexPairUrl: "",
      signalNote: "",
      route: [],
      squareDraft: "",
      warrant: null,
      opportunity: null,
      executionBrief: null,
      postmortem: null,
    };

    token.warrant = {
      status,
      lane,
      fitScore,
      fitLabel: fitLabel(fitScore),
      riskBudgetPct,
      ttlMinutes,
      expiresAt: new Date(new Date(generatedAt).getTime() + ttlMinutes * 60_000).toISOString(),
      fragilityScore,
      reviewPriority: clamp(fragilityScore + (status === "Approved" ? 18 : 8), 0, 100),
      capitalAction:
        status === "Approved"
          ? `Stale snapshot via ${lane} lane`
          : status === "Deferred"
            ? "Review after live recovery"
            : status === "Revoked"
              ? "Broken / stale edge"
              : "Skip until live recovery",
      approvalHeadline:
        status === "Approved"
          ? "当前显示的是最近一次有效快照，这张机会单曾处于可执行区。"
          : status === "Deferred"
            ? "当前显示的是最近一次有效快照，这张机会单仍以观察为主。"
            : "当前显示的是最近一次有效快照，这张机会单不应被当成真钱机会。",
      mandateSettings: mandate.settings,
      reasonChain: [
        `实时上游暂时不可用，当前展示的是 ${snapshot?.generatedAt || generatedAt} 的最近一次有效快照。`,
        "在实时源恢复前，这些结论只能用于监控和复审，不应用于新的高信心入场。",
        errorMessage || "核心实时源暂时不可用。",
      ],
      invalidationRules: [
        "实时源恢复后必须立即重刷，旧快照不应长期替代实时判断。",
        "如果下次 live 返回的净边际转负，这张机会单应立即降级。",
      ],
      recheckTriggers: [
        "Binance Spot 或 DexScreener 恢复后立即复审。",
        "如果下一次 live 拉齐，就用新快照覆盖当前 stale snapshot。",
      ],
    };

    token.opportunity = {
      kind: status === "Approved" ? "stale-approved" : status === "Deferred" ? "stale-watch" : "stale-risk",
      score,
      confidenceScore: clamp(status === "Approved" ? score - 6 : score - 12, 0, 100),
      referenceCapitalUsd,
      suggestedNotionalUsd,
      grossEdgePct,
      executionCostPct,
      netEdgePct,
      expectedGrossPnlUsd,
      expectedNetPnlUsd,
      band: "Stale Snapshot",
      whyNow: [
        "当前不是新鲜实时机会，而是最近一次有效判断的保底快照。",
        "它的作用是维持监控连续性，避免整站在源异常时完全失明。",
      ],
      stateShift: {
        direction: "flat",
        magnitude: 1,
        headline: "等待实时源恢复",
      },
      replay: replayBase.slice(-4),
    };
    token.executionBrief = buildExecutionBrief(token);
    token.postmortem = buildPostmortem(token);
    token.signalNote =
      status === "Approved"
        ? `${token.name} 当前显示的是最近一次可执行快照，等实时源恢复后再决定是否继续做。`
        : `${token.name} 当前显示的是最近一次保底快照，先等实时源恢复后再做新判断。`;
    token.route = buildRoute(token.strategy, token);
    token.squareDraft = buildSquareDraft(token, fallbackContext());
    return token;
  }).sort((left, right) => (VERDICT_RANK[right.warrant?.status] || 0) - (VERDICT_RANK[left.warrant?.status] || 0));

  const approvalSummary = tokens.reduce(
    (summary, token) => {
      summary[(token.warrant?.status || "Deferred").toLowerCase()] += 1;
      return summary;
    },
    { approved: 0, deferred: 0, revoked: 0, rejected: 0 },
  );

  const desk = {
    approved: tokens.filter((token) => token.warrant?.status === "Approved").slice(0, 3).map((token) => token.symbol),
    rejected: tokens.filter((token) => ["Rejected", "Revoked"].includes(token.warrant?.status)).slice(0, 3).map((token) => token.symbol),
    reapproval: tokens.filter((token) => ["Approved", "Deferred", "Revoked"].includes(token.warrant?.status)).slice(0, 4).map((token) => token.symbol),
  };

  return {
    mode: "stale-fallback",
    pollMs: POLL_MS,
    generatedAt,
    staleAt: generatedAt,
    staleReason: errorMessage || "Core live feeds unavailable",
    marketContext: {
      ...fallbackContext(),
      regime: "Fallback",
    },
    userMandate: mandate,
    approvalSummary,
    desk,
    alertFeed: buildAlertFeed(tokens),
    postmortemFeed: tokens.filter((token) => token.postmortem).map((token) => ({ symbol: token.symbol, ...token.postmortem })).slice(0, 4),
    shiftFeed: tokens.slice(0, 4).map((token) => ({
      symbol: token.symbol,
      direction: "flat",
      headline: "等待实时源恢复",
      score: token.opportunity?.score || 0,
      netEdgePct: token.opportunity?.netEdgePct || 0,
      expectedNetPnlUsd: token.opportunity?.expectedNetPnlUsd || 0,
      status: token.warrant?.status || "Deferred",
    })),
    sourceHealth: staleSourceHealth({}, errorMessage, generatedAt),
    tokens,
  };
}

function annotateStaleOverview(overview, errorMessage) {
  const payload = cloneOverviewPayload(overview);
  payload.mode = "stale-fallback";
  payload.staleAt = new Date().toISOString();
  payload.staleReason = errorMessage || payload.staleReason || "Core live feeds unavailable";
  payload.sourceHealth = staleSourceHealth(payload.sourceHealth, payload.staleReason, payload.generatedAt);
  return payload;
}

async function serveStatic(res, pathname) {
  const filePath = path.join(ROOT, pathname === "/" ? "index.html" : pathname.slice(1));
  const normalized = path.normalize(filePath);
  const relative = path.relative(ROOT, normalized);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    notFound(res);
    return;
  }

  try {
    const content = await fs.readFile(normalized);
    const ext = path.extname(normalized);
    res.writeHead(200, { "content-type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(content);
  } catch (error) {
    notFound(res);
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    chunks.push(chunk);
    total += chunk.length;
    if (total > 1024 * 1024) {
      throw new Error("Request body too large");
    }
  }

  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function handleLiveStream(req, res, searchParams) {
  const mandate = extractMandateFromSearchParams(searchParams);
  const force = safeBoolean(searchParams.get("force"), false);
  let refreshTimer = null;
  let heartbeatTimer = null;
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearTimeout(refreshTimer);
    clearInterval(heartbeatTimer);
    try {
      res.end();
    } catch (error) {
      // Ignore socket close races.
    }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);

  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  });

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  res.write(`retry: ${STREAM_RETRY_MS}\n\n`);

  const pushOverview = async ({ forceRefresh = false } = {}) => {
    if (closed) return;

    try {
      const overview = await buildLiveOverview({
        mandate,
        mutateShiftHistory: true,
        force: forceRefresh,
      });

      if (closed) return;
      writeSse(res, "overview", overview);

      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        pushOverview();
      }, Math.max(5000, overview.pollMs || POLL_MS));
    } catch (error) {
      if (closed) return;

      writeSse(res, "snapshot-error", {
        error: error.message,
        time: new Date().toISOString(),
      });

      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        pushOverview();
      }, STREAM_RETRY_MS);
    }
  };

  heartbeatTimer = setInterval(() => {
    if (closed) return;
    writeSse(res, "heartbeat", {
      time: new Date().toISOString(),
      mode: "stream",
    });
  }, STREAM_HEARTBEAT_MS);

  await pushOverview({ forceRefresh: force });
}

async function buildBinanceSettingsResponse({ validate = true } = {}) {
  await loadEnvFile();
  const config = getBinanceRuntimeConfig();
  const validation = validate
    ? await validateBinanceCredentials(config).catch((error) => ({
        configured: config.configured,
        keyPreview: config.keyPreview,
        spotBaseUrl: config.spotBaseUrl,
        futuresBaseUrl: config.futuresBaseUrl,
        status: "error",
        headline: "Binance API 校验失败",
        detail: error.message,
      }))
    : {
        configured: config.configured,
        keyPreview: config.keyPreview,
        status: config.configured ? "unknown" : "missing",
        headline: config.configured ? "已保存，等待校验" : "未配置 Binance API",
        detail: config.configured ? "凭证已保存到 .env。" : "尚未配置 Binance API 凭证。",
      };

  return {
    configured: config.configured,
    keyPreview: config.keyPreview,
    spotBaseUrl: config.spotBaseUrl,
    futuresBaseUrl: config.futuresBaseUrl,
    spotFallbackBaseUrls: config.spotFallbackBaseUrls,
    futuresFallbackBaseUrls: config.futuresFallbackBaseUrls,
    validation,
  };
}

function sanitizeBaseUrl(value, fallback) {
  const normalized = String(value || fallback || "").trim().replace(/\/+$/, "");
  return normalized || fallback;
}

async function requestListener(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname === "/api/health") {
    await loadEnvFile();
    const config = getBinanceRuntimeConfig();
    json(res, 200, {
      ok: true,
      service: "rift-radar",
      time: new Date().toISOString(),
      binanceApiConfigured: config.configured,
      binanceKeyPreview: config.keyPreview,
    });
    return;
  }

  if (requestUrl.pathname === "/api/settings/binance" && req.method === "GET") {
    try {
      json(res, 200, await buildBinanceSettingsResponse({ validate: true }));
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  if (requestUrl.pathname === "/api/settings/binance/test" && req.method === "POST") {
    try {
      await loadEnvFile();
      const payload = await readJsonBody(req);
      const current = getBinanceRuntimeConfig();
      const config = {
        apiKey: String(payload.apiKey || current.apiKey || "").trim(),
        apiSecret: String(payload.apiSecret || current.apiSecret || "").trim(),
        configured: Boolean(String(payload.apiKey || current.apiKey || "").trim() && String(payload.apiSecret || current.apiSecret || "").trim()),
        keyPreview: maskCredential(String(payload.apiKey || current.apiKey || "").trim()),
        spotBaseUrl: sanitizeBaseUrl(payload.spotBaseUrl, current.spotBaseUrl),
        futuresBaseUrl: sanitizeBaseUrl(payload.futuresBaseUrl, current.futuresBaseUrl),
        spotFallbackBaseUrls: uniqueBaseUrls([
          sanitizeBaseUrl(payload.spotBaseUrl, current.spotBaseUrl),
          ...current.spotFallbackBaseUrls,
        ]),
        futuresFallbackBaseUrls: uniqueBaseUrls([
          sanitizeBaseUrl(payload.futuresBaseUrl, current.futuresBaseUrl),
          ...current.futuresFallbackBaseUrls,
        ]),
      };
      json(res, 200, await buildBinanceSettingsResponse({ validate: false }).then(async (baseline) => ({
        ...baseline,
        configured: config.configured,
        keyPreview: config.keyPreview,
        spotBaseUrl: config.spotBaseUrl,
        futuresBaseUrl: config.futuresBaseUrl,
        validation: await validateBinanceCredentials(config),
      })));
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  if (requestUrl.pathname === "/api/settings/binance" && req.method === "POST") {
    try {
      await loadEnvFile();
      const payload = await readJsonBody(req);
      const current = getBinanceRuntimeConfig();
      const clearCredentials = safeBoolean(payload.clearCredentials, false);

      const updates = {
        BINANCE_API_KEY: clearCredentials ? "" : String(payload.apiKey || current.apiKey || "").trim(),
        BINANCE_API_SECRET: clearCredentials ? "" : String(payload.apiSecret || current.apiSecret || "").trim(),
        BINANCE_SPOT_API_BASE: sanitizeBaseUrl(payload.spotBaseUrl, current.spotBaseUrl),
        BINANCE_FUTURES_API_BASE: sanitizeBaseUrl(payload.futuresBaseUrl, current.futuresBaseUrl),
        BINANCE_SPOT_FALLBACK_BASES: uniqueBaseUrls([
          sanitizeBaseUrl(payload.spotBaseUrl, current.spotBaseUrl),
          ...DEFAULT_BINANCE_SPOT_FALLBACKS,
        ]).join(","),
        BINANCE_FUTURES_FALLBACK_BASES: uniqueBaseUrls([
          sanitizeBaseUrl(payload.futuresBaseUrl, current.futuresBaseUrl),
          ...DEFAULT_BINANCE_FUTURES_FALLBACKS,
        ]).join(","),
      };

      await persistManagedEnv(updates);
      clearLiveCaches();

      json(res, 200, {
        saved: true,
        settings: await buildBinanceSettingsResponse({ validate: true }),
      });
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  if (requestUrl.pathname === "/api/live/stream") {
    try {
      await handleLiveStream(req, res, requestUrl.searchParams);
    } catch (error) {
      if (!res.headersSent) {
        json(res, 500, {
          error: error.message,
          mode: "error",
        });
      } else {
        res.end();
      }
    }
    return;
  }

  if (requestUrl.pathname === "/api/live/overview") {
    try {
      const overview = await buildLiveOverview({
        mandate: extractMandateFromSearchParams(requestUrl.searchParams),
        mutateShiftHistory: true,
        force: safeBoolean(requestUrl.searchParams.get("force"), false),
      });
      json(res, 200, overview);
    } catch (error) {
      json(res, 500, {
        error: error.message,
        mode: "error",
      });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/api/live/token/")) {
    try {
      const symbol = requestUrl.pathname.split("/").at(-1).toUpperCase();
      const overview = await buildLiveOverview({
        mandate: extractMandateFromSearchParams(requestUrl.searchParams),
        force: safeBoolean(requestUrl.searchParams.get("force"), false),
      });
      const token = overview.tokens.find((item) => item.symbol === symbol);
      if (!token) {
        notFound(res);
        return;
      }
      json(res, 200, {
        generatedAt: overview.generatedAt,
        marketContext: overview.marketContext,
        token,
      });
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  if (requestUrl.pathname === "/api/warrant/check" && req.method === "POST") {
    try {
      const payload = await readJsonBody(req);
      const symbol = String(payload.symbol || "").trim().toUpperCase();
      if (!symbol) {
        json(res, 400, { error: "symbol is required" });
        return;
      }

      const overview = await buildLiveOverview({
        mandate: buildMandate(payload.mandate || payload),
        force: safeBoolean(payload.force, false),
      });
      const token = overview.tokens.find((item) => item.symbol === symbol);
      if (!token) {
        notFound(res);
        return;
      }

      json(res, 200, {
        generatedAt: overview.generatedAt,
        marketContext: overview.marketContext,
        userMandate: overview.userMandate,
        verdict: token.warrant?.status || "Deferred",
        token,
      });
    } catch (error) {
      json(res, 500, { error: error.message });
    }
    return;
  }

  serveStatic(res, requestUrl.pathname);
}

function createServer() {
  return http.createServer(requestListener);
}

function startServer() {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`Goldlane live server running at http://${HOST}:${PORT}`);
  });
  return server;
}

module.exports = {
  buildLiveOverview,
  buildOverview,
  buildMandate,
  createServer,
  handleLiveStream,
  requestListener,
  startServer,
};

if (require.main === module) {
  startServer();
}
