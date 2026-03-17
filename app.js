const fallbackOverview = {
  mode: "demo-fallback",
  pollMs: 30000,
  generatedAt: new Date().toISOString(),
  marketContext: {
    fearGreedValue: null,
    fearGreedClass: "Unavailable",
    regime: "Fallback",
  },
  userMandate: {
    id: "binance-capital-firewall",
    name: "Profit Opportunity Mandate",
    desc: "Binance-first. Only surface opportunities whose edge survives venue health, execution friction, and your current mandate.",
    principles: ["先验证 edge，再追利润", "只做可执行机会", "假价差不当成机会"],
    guardrails: [
      "Reject spot book off",
      "Revoke multi-x venue mismatch",
      "Only surface high-fit setups",
      "Short TTL for fragile opportunities",
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
  },
  approvalSummary: {
    approved: 1,
    deferred: 1,
    revoked: 1,
    rejected: 1,
  },
  desk: {
    approved: ["CAKE"],
    rejected: ["BAKE", "ALPACA"],
    reapproval: ["CAKE", "TWT", "BAKE"],
  },
  alertFeed: [
    {
      symbol: "CAKE",
      severity: "high",
      kind: "window-opened",
      headline: "CAKE 转正为可执行利润窗口",
      body: "状态 Deferred -> Approved，当前 lane spot，预估净收益 +$16。",
      status: "Approved",
      lane: "spot",
      score: 78,
      netEdgePct: 0.77,
      expectedNetPnlUsd: 16.1,
      pnlDeltaUsd: 9.2,
      ttlMinutes: 90,
    },
    {
      symbol: "BAKE",
      severity: "high",
      kind: "fake-edge",
      headline: "BAKE 被识别为伪机会",
      body: "系统把它降级为 Revoked，当前更像坏市场或失活 lane。",
      status: "Revoked",
      lane: "blocked",
      score: 0,
      netEdgePct: -2.52,
      expectedNetPnlUsd: 0,
      pnlDeltaUsd: -18,
      ttlMinutes: 15,
    },
  ],
  postmortemFeed: [
    {
      symbol: "BAKE",
      kind: "broken-market",
      headline: "BAKE 不是套利，是坏市场",
      rootCause: "链上与 Binance 存在 20x 级别断层，这类窗口更像坏价格而不是真实利润。",
      lesson: "看到极端价差时，先验证市场质量，不要先假设自己发现了免费钱。",
      nextScreen: "只有 venue mismatch 收敛后，才值得重新进入观察。",
      avoidedLossUsd: 42,
      previousStatus: "Deferred",
      currentStatus: "Revoked",
      lane: "blocked",
      score: 0,
    },
  ],
  sourceHealth: {
    binance: { status: "demo" },
    dexscreener: { status: "demo" },
    goplus: { status: "demo" },
    coingecko: { status: "demo" },
    alternative: { status: "demo" },
    cryptocompare: { status: "disabled" },
  },
  tokens: [
    {
      symbol: "CAKE",
      name: "PancakeSwap",
      chain: "BSC",
      theme: "DEX beta",
      narrativeScore: 76,
      flowScore: 71,
      auditRisk: 18,
      executionFriction: 12,
      dexPriceUsd: 1.42,
      spotPrice: 1.431,
      futuresPrice: 1.4308,
      dexSpotSpreadPct: 0.77,
      spotPerpBasisPct: -0.01,
      fundingRatePct: 0.005,
      dexLiquidityUsd: 5936502,
      dexVolume24hUsd: 343875,
      marketCapUsd: 471815438,
      marketCapRank: 101,
      holderCount: 1903193,
      hasSpot: true,
      hasFutures: true,
      venueMismatch: false,
      mismatchRatio: 1,
      isTrending: false,
      boostAmount: 0,
      riskFlags: ["mintable"],
      strategy: "Whale Shadow",
      compositeScore: 43.3,
      fragilityScore: 24,
      fitScore: 84,
      warrantLane: "spot",
      signalNote: "PancakeSwap 已进入可执行机会区，当前 fit 84，建议按 90 分钟 TTL 管理。",
      route: [
        { skill: "crypto-market-rank", note: "确认叙事仍在 mandate 内，不是最后一棒热度" },
        { skill: "spot", note: "在 Binance Spot 建立基础暴露" },
        { skill: "assets", note: "把风险预算压在可撤销范围内" },
      ],
      squareDraft:
        "【CAKE / Approved】\nPancakeSwap 当前机会判断为 Approved，lane spot，fit 84/100。\nDEX→Binance Spot 错位 +0.77%，审计风险 18/100，执行摩擦 12/100。\n当前建议：这是当前少数可执行的 spot 利润窗口。",
      dexPairUrl: "https://dexscreener.com/bsc/0x7f51c8aaa6b0599abd16674e2b17fec7a9f674a1",
      warrant: {
        status: "Approved",
        lane: "spot",
        fitScore: 84,
        fitLabel: "Core",
        riskBudgetPct: 22,
        ttlMinutes: 90,
        expiresAt: new Date(Date.now() + 90 * 60_000).toISOString(),
        fragilityScore: 24,
        reviewPriority: 48,
        capitalAction: "Approve 22% active risk budget",
        approvalHeadline: "批准小规模资本进入 spot lane，当前 fit 84。",
        reasonChain: [
          "Binance Spot 委托簿正常，可见执行 lane 已打开。",
          "DEX→Spot 错位 +0.77%，已进入值得认真处理的利润窗口。",
          "审计风险 18/100，风险闸门暂未触发硬 veto。",
          "执行摩擦 12/100，当前 lane 尚可承受。",
        ],
        invalidationRules: [
          "Binance Spot bid / ask 再次失真或消失，立即撤销批准。",
          "如果 DEX→Spot 错位回落到 0.27% 以下，当前窗口失去稀缺性。",
          "如果 DEX 流动性跌破 $3.26M，这张机会单需要重新复审。",
        ],
        recheckTriggers: [
          "叙事热度上穿 84 或下破 66 时复审。",
          "资金流上穿 77 或跌破 59 时复审。",
          "Funding 方向反转时复审。",
        ],
      },
    },
    {
      symbol: "TWT",
      name: "Trust Wallet Token",
      chain: "BSC",
      theme: "wallet beta",
      narrativeScore: 50,
      flowScore: 70,
      auditRisk: 48,
      executionFriction: 37,
      dexPriceUsd: 0.5241,
      spotPrice: 0.5246,
      futuresPrice: 0.525,
      dexSpotSpreadPct: 0.1,
      spotPerpBasisPct: 0.08,
      fundingRatePct: 0.01,
      dexLiquidityUsd: 810616,
      dexVolume24hUsd: 176055,
      marketCapUsd: 225000000,
      marketCapRank: 168,
      holderCount: null,
      hasSpot: true,
      hasFutures: true,
      venueMismatch: false,
      mismatchRatio: 1,
      isTrending: false,
      boostAmount: 0,
      riskFlags: ["security unavailable"],
      strategy: "Watchlist",
      compositeScore: 20.4,
      fragilityScore: 43,
      fitScore: 61,
      warrantLane: "research",
      signalNote: "Trust Wallet Token 仍在 review queue，当前更像观察机会，而不是立即可做的机会。",
      route: [
        { skill: "query-token-info", note: "继续观察流动性与成交倾斜是否升级" },
        { skill: "trading-signal", note: "等待更强 confirmation，而不是提前批准资金" },
        { skill: "assets", note: "先只保留研究席位，不急着开正式仓位" },
      ],
      squareDraft:
        "【TWT / Deferred】\nTrust Wallet Token 当前机会判断为 Deferred，lane research，fit 61/100。\nDEX→Binance Spot 错位 +0.10%，审计风险 48/100，执行摩擦 37/100。\n当前建议：先观察，不急着做。",
      dexPairUrl: "https://dexscreener.com/bsc/0x8ccb4544b3030dacf3d4d71c658f04e8688e25b1",
      warrant: {
        status: "Deferred",
        lane: "research",
        fitScore: 61,
        fitLabel: "Conditional",
        riskBudgetPct: 6,
        ttlMinutes: 60,
        expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
        fragilityScore: 43,
        reviewPriority: 51,
        capitalAction: "Defer to review queue",
        approvalHeadline: "机会还在形成，利润空间和确认度暂时不够，先观察。",
        reasonChain: [
          "Binance Spot 委托簿正常，可见执行 lane 已打开。",
          "当前错位 +0.10%，更适合观察，而不是立刻出手。",
          "审计风险 48/100，说明风险边界还不够宽松。",
          "安全源未完整返回，这个机会需要更短 TTL 与更高复审频率。",
        ],
        invalidationRules: [
          "Binance Spot bid / ask 失真时，直接降级为拒绝。",
          "如果错位继续收敛到 0.05% 以下，这张研究单失去价值。",
          "如果资金流跌破 58，研究优先级进一步下调。",
        ],
        recheckTriggers: [
          "叙事热度上穿 58 或下破 40 时复审。",
          "资金流上穿 76 或跌破 58 时复审。",
          "全局情绪切换到 Greed / Extreme Fear 时复审。",
        ],
      },
    },
    {
      symbol: "BAKE",
      name: "BakeryToken",
      chain: "BSC",
      theme: "legacy DEX rotation",
      narrativeScore: 17,
      flowScore: 58,
      auditRisk: 48,
      executionFriction: 42,
      dexPriceUsd: 0.001572,
      spotPrice: 0.0519,
      futuresPrice: 0.012312,
      dexSpotSpreadPct: 3201.53,
      spotPerpBasisPct: -76.28,
      fundingRatePct: 0,
      dexLiquidityUsd: 41676,
      dexVolume24hUsd: 609,
      marketCapUsd: 850000,
      marketCapRank: 3827,
      holderCount: null,
      hasSpot: false,
      hasFutures: false,
      venueMismatch: true,
      mismatchRatio: 20.5,
      isTrending: false,
      boostAmount: 0,
      riskFlags: ["security unavailable", "spot_book_off", "futures_inactive", "venue_mismatch_20.5x"],
      strategy: "Risk Tombstone",
      compositeScore: -18.7,
      fragilityScore: 86,
      fitScore: 18,
      warrantLane: "blocked",
      signalNote: "BakeryToken 表面上有边际，但当前更像假机会、坏市场或失活 lane。",
      route: [
        { skill: "query-token-audit", note: "先确认 veto 的根因是不是审计或结构性风险" },
        { skill: "query-token-info", note: "复核是不是脏 pair、坏流动性或坏市场" },
        { skill: "square-post", note: "输出拒绝交易的结论，而不是继续找进场理由" },
      ],
      squareDraft:
        "【BAKE / Revoked】\nBakeryToken 当前机会判断为 Revoked，lane blocked，fit 18/100。\nDEX→Binance Spot 错位 +3201.53%，审计风险 48/100，执行摩擦 42/100。\n当前建议：这更像假机会，不要碰。",
      dexPairUrl: "https://dexscreener.com/bsc/0xc2eed0f5a0dc28cfa895084bc0a9b8b8279ae492",
      warrant: {
        status: "Revoked",
        lane: "blocked",
        fitScore: 18,
        fitLabel: "Out of Mandate",
        riskBudgetPct: 0,
        ttlMinutes: 15,
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
        fragilityScore: 86,
        reviewPriority: 94,
        capitalAction: "Revoke existing lane immediately",
        approvalHeadline: "表面上有 edge，但当前更像假机会或坏市场。",
        reasonChain: [
          "Binance Spot 委托簿不可用，当前不具备基本成交可见性。",
          "链上参考价与交易所价格出现 20.5 级断层，更像坏市场而非正常价差。",
          "执行摩擦 42/100，说明这不是低阻力通道。",
          "安全源未完整返回，不能给资本开绿灯。",
        ],
        invalidationRules: [
          "只要 venue mismatch 仍处于多倍断层，就不得恢复批准。",
          "Binance Spot 委托簿恢复前，不得把这个标的重新视为真实机会。",
          "如果 futures lane 继续失活，basis 逻辑永久失效。",
        ],
        recheckTriggers: [
          "若 Binance Spot bid / ask 恢复，再进入复审。",
          "若 venue mismatch 回到 3x 以下，再进入复审。",
          "若 DEX 流动性显著恢复，再进入复审。",
        ],
      },
    },
    {
      symbol: "ALPACA",
      name: "Alpaca Finance",
      chain: "BSC",
      theme: "yield beta",
      narrativeScore: 33,
      flowScore: 35,
      auditRisk: 48,
      executionFriction: 42,
      dexPriceUsd: 0.00216,
      spotPrice: 0.2244,
      futuresPrice: 0.01882,
      dexSpotSpreadPct: 10288.89,
      spotPerpBasisPct: -91.61,
      fundingRatePct: 0,
      dexLiquidityUsd: 35791,
      dexVolume24hUsd: 4952,
      marketCapUsd: 2100000,
      marketCapRank: 4228,
      holderCount: null,
      hasSpot: false,
      hasFutures: true,
      venueMismatch: true,
      mismatchRatio: 56.6,
      isTrending: false,
      boostAmount: 0,
      riskFlags: ["security unavailable", "spot_book_off", "venue_mismatch_56.6x"],
      strategy: "Risk Tombstone",
      compositeScore: -4.84,
      fragilityScore: 82,
      fitScore: 26,
      warrantLane: "blocked",
      signalNote: "Alpaca Finance 表面上有边际，但当前更像假机会、坏市场或失活 lane。",
      route: [
        { skill: "query-token-audit", note: "先确认 veto 的根因是不是审计或结构性风险" },
        { skill: "query-token-info", note: "复核是不是脏 pair、坏流动性或坏市场" },
        { skill: "square-post", note: "输出拒绝交易的结论，而不是继续找进场理由" },
      ],
      squareDraft:
        "【ALPACA / Revoked】\nAlpaca Finance 当前机会判断为 Revoked，lane blocked，fit 26/100。\nDEX→Binance Spot 错位 +10288.89%，审计风险 48/100，执行摩擦 42/100。\n当前建议：这更像假机会，不要碰。",
      dexPairUrl: "https://dexscreener.com/bsc/0xf3ce6aac24980e6b657926dfc79502ae414d3083",
      warrant: {
        status: "Revoked",
        lane: "blocked",
        fitScore: 26,
        fitLabel: "Out of Mandate",
        riskBudgetPct: 0,
        ttlMinutes: 15,
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
        fragilityScore: 82,
        reviewPriority: 91,
        capitalAction: "Revoke existing lane immediately",
        approvalHeadline: "表面上有 edge，但当前更像假机会或坏市场。",
        reasonChain: [
          "Binance Spot 委托簿不可用，当前不具备基本成交可见性。",
          "链上参考价与交易所价格出现 56.6 级断层，更像坏市场而非正常价差。",
          "执行摩擦 42/100，说明这不是低阻力通道。",
          "当前 lane blocked，不配占用风险预算。",
        ],
        invalidationRules: [
          "只要 venue mismatch 仍处于多倍断层，就不得恢复批准。",
          "Binance Spot 委托簿恢复前，不得重新纳入真实机会列表。",
          "如果 DEX 流动性跌破 $19.68K，完全退出观察列表。",
        ],
        recheckTriggers: [
          "若 Binance Spot 委托簿恢复，再进入复审。",
          "若 venue mismatch 回到 4x 以下，再进入复审。",
          "若流动性恢复并出现真实买盘，再进入复审。",
        ],
      },
    },
  ],
};

const policyModules = [
  {
    title: "Truth Gate",
    tag: "Truth",
    desc: "先判断这是不是一个真钱机会，而不是坏价格、脏 pair 或失活委托簿制造出来的幻觉。",
    skills: ["query-token-info", "query-token-audit", "spot"],
  },
  {
    title: "Execution Gate",
    tag: "Lane",
    desc: "Spot、basis、futures 哪条路径还真的能走，决定这个机会能不能转化成利润。",
    skills: ["spot", "derivatives-trading-usds-futures", "assets"],
  },
  {
    title: "Profit Gate",
    tag: "Fit",
    desc: "不是所有真实机会都值得做。只有利润空间、执行性和适配度一起过线才会上榜。",
    skills: ["alpha", "trading-signal", "assets"],
  },
  {
    title: "Window Engine",
    tag: "Review",
    desc: "机会不是永久有效的。TTL、fragility 和 regime 变化会决定窗口是否还值得继续做。",
    skills: ["crypto-market-rank", "query-token-info", "assets"],
  },
  {
    title: "Explain Layer",
    tag: "Explain",
    desc: "每个机会都保留理由链、失效条件和可发布摘要，不只是给分，而是解释为什么能赚或为什么别碰。",
    skills: ["square-post", "query-address-info", "query-token-audit"],
  },
];

const dataSources = [
  {
    key: "binance",
    name: "Binance Public Market",
    type: "Live",
    freshness: "15s - 30s",
    desc: "真实利润机会的主执行场。没有清晰的 Binance 盘口，就不该把它当成真钱机会。",
    tags: ["spot ticker", "premiumIndex", "order-book health proxy"],
  },
  {
    key: "dexscreener",
    name: "DexScreener",
    type: "Live",
    freshness: "15s - 60s",
    desc: "给出链上参考价、流动性和成交倾斜，用来判断这是不是正常错位还是坏市场。",
    tags: ["token-pairs", "liquidity", "buy/sell imbalance"],
  },
  {
    key: "goplus",
    name: "GoPlus Security",
    type: "Live",
    freshness: "5m - 15m",
    desc: "高热标的不过安全闸门，就不能算真实利润机会，只能进观察或跳过。",
    tags: ["token security", "tax", "honeypot flags"],
  },
  {
    key: "coingecko",
    name: "CoinGecko",
    type: "Fallback",
    freshness: "3m - 10m",
    desc: "补市值、长窗价格和市场规模，用来判断用户适配度和 lane 稳定性。",
    tags: ["market cap", "rank", "trending"],
  },
  {
    key: "alternative",
    name: "Fear & Greed",
    type: "Context",
    freshness: "1d",
    desc: "不是直接下单信号，而是机会排序和风险预算的全局风格旋钮。",
    tags: ["regime", "risk throttle"],
  },
  {
    key: "cryptocompare",
    name: "CryptoCompare News",
    type: "Optional",
    freshness: "5m - 15m",
    desc: "后续会拿来解释催化，不放进当前秒级机会主链路。",
    tags: ["catalyst", "news", "optional"],
  },
];

const apiContracts = [
  {
    title: "Live Opportunity Overview",
    method: "GET",
    path: "/api/live/overview",
    desc: "主机会接口，返回实时机会列表、内部裁决结果、mandate 和数据源健康度。",
    bullets: [
      "前端只轮询这一条，就能更新 Top Opportunities、假机会拦截流和复审流。",
      "每个 token 都带 warrant、reasonChain、TTL、fragility 与 recheckTriggers，前台只把它翻译成机会语言。",
      "当某个上游源退化时，整页转 degraded，而不是静默出假结论。",
    ],
  },
  {
    title: "Single Opportunity Case",
    method: "GET",
    path: "/api/live/token/:symbol",
    desc: "给 Opportunity Check 和右侧详情面板供数。",
    bullets: [
      "返回单个标的的完整机会判断，而不是仅返回行情。",
      "未来最适合扩展成浏览器插件、bot 或下单前弹窗。",
    ],
  },
  {
    title: "Health Probe",
    method: "GET",
    path: "/api/health",
    desc: "确认服务和机会热路径是否还活着。",
    bullets: [
      "最适合挂到桌面启动器或 uptime 检查。",
      "当 Binance 或 DEX 源结构变化时，这里会最先暴露问题。",
    ],
  },
  {
    title: "Quick Opportunity Check",
    method: "POST",
    path: "/api/warrant/check",
    desc: "即时机会评估接口，给 Quick Check、插件和下单前弹窗共用。",
    bullets: [
      "输入 symbol 和用户 mandate，直接返回一张实时机会判断单。",
      "前端 Draft Mandate 也可以先走这里做预演，再决定是否应用到整张机会面板。",
    ],
  },
];

const pipelineStages = [
  {
    title: "Hot Loop / 30s",
    desc: "真正影响机会排序的热路径。",
    bullets: ["Binance spot / futures", "DexScreener pairs", "实时 opportunity scoring"],
  },
  {
    title: "Review Loop / 5m",
    desc: "风险、规模和 fit 的中速复审层。",
    bullets: ["GoPlus security", "CoinGecko market context", "fragility refresh"],
  },
  {
    title: "Window Review / 15m+",
    desc: "针对已上榜和已杀掉机会的复审节奏。",
    bullets: ["TTL expiry", "lane recovery check", "regime change review"],
  },
  {
    title: "Explain / On Demand",
    desc: "解释和发布链路，不占秒级实时预算。",
    bullets: ["Square brief", "decision notes", "postmortem hooks"],
  },
];

const verdictFilters = ["All", "Approved", "Deferred", "Revoked", "Rejected"];
const verdictLabels = {
  All: "全部机会",
  Approved: "可执行",
  Deferred: "观察中",
  Revoked: "假机会",
  Rejected: "跳过",
};

const alertSeverityFilters = ["All", "high", "medium", "low"];
const alertSeverityLabels = {
  All: "全部提醒",
  high: "高优先",
  medium: "中优先",
  low: "低优先",
};

const journalFilters = ["All", "trade", "watch", "pass", "review"];
const journalLabels = {
  All: "全部记录",
  trade: "准备做",
  watch: "加观察",
  pass: "明确跳过",
  review: "记为复盘",
};

const portfolioFilters = ["All", "Open", "Needs Review", "Winners", "Closed"];
const portfolioLabels = {
  All: "全部持仓",
  Open: "进行中",
  "Needs Review": "待复审",
  Winners: "浮盈中",
  Closed: "已关闭",
};

const positionAlertFilters = ["Unread", "Active", "Resolved", "All", "high", "medium", "low"];
const positionAlertLabels = {
  Unread: "未读提醒",
  Active: "进行中",
  Resolved: "已解除",
  All: "全部提醒",
  high: "高优先",
  medium: "中优先",
  low: "低优先",
};

const severityLevels = ["high", "medium", "low"];
const severityRank = {
  high: 3,
  medium: 2,
  low: 1,
};
const symbolAlertPolicyModes = ["global", "reopened", "inbox", "critical", "mute"];
const symbolAlertPolicyLabels = {
  global: "Global",
  reopened: "Reopened Only",
  inbox: "Inbox Only",
  critical: "High Only",
  mute: "Muted",
};
const symbolAlertPolicyDescriptions = {
  global: "跟随全局 Inbox / Desktop 阈值，是默认的平衡模式。",
  reopened: "保留当前已存在提醒；之后只有问题解除后再次出现，才重新进入 inbox / desktop。",
  inbox: "继续进入个人提醒箱，但不再弹桌面通知，适合不想被打断的 symbol。",
  critical: "只保留高优先风险或机会提醒，低中优先变化会被压掉。",
  mute: "完全静默这个 symbol，不再进入提醒箱，也不再弹桌面通知。",
};
const positionAlertPresetConfigs = {
  quiet: {
    label: "Quiet",
    desc: "只保留真正高优先的变化，适合已经有稳定工作流、不想被噪音打断时使用。",
    minInboxSeverity: "high",
    minDesktopSeverity: "high",
    desktopCriticalOnly: true,
  },
  focus: {
    label: "Focus",
    desc: "默认平衡档。Inbox 保留中高优先，桌面更克制，适合大多数日常盯盘。",
    minInboxSeverity: "medium",
    minDesktopSeverity: "high",
    desktopCriticalOnly: false,
  },
  hunter: {
    label: "Hunter",
    desc: "扩大捕获范围，尽量不漏掉正在形成的窗口，适合主动找机会时使用。",
    minInboxSeverity: "low",
    minDesktopSeverity: "medium",
    desktopCriticalOnly: false,
  },
};

const JOURNAL_STORAGE_KEY = "rift-radar-journal-v1";
const POSITION_ALERTS_STORAGE_KEY = "rift-radar-position-alerts-v1";
const POSITION_ALERT_PREFS_STORAGE_KEY = "rift-radar-position-alert-prefs-v1";

const dom = {
  modeBadge: document.getElementById("modeBadge"),
  streamBadge: document.getElementById("streamBadge"),
  updateBadge: document.getElementById("updateBadge"),
  regimeBadge: document.getElementById("regimeBadge"),
  refreshButton: document.getElementById("refreshButton"),
  summaryGrid: document.getElementById("summaryGrid"),
  heroSpotlight: document.getElementById("heroSpotlight"),
  commandDeckPanel: document.getElementById("commandDeckPanel"),
  mandateCard: document.getElementById("mandateCard"),
  quickCheckInput: document.getElementById("quickCheckInput"),
  quickCheckButton: document.getElementById("quickCheckButton"),
  quickCheckResult: document.getElementById("quickCheckResult"),
  binanceApiPanel: document.getElementById("binanceApiPanel"),
  symbolList: document.getElementById("symbolList"),
  verdictFilters: document.getElementById("verdictFilters"),
  riskSlider: document.getElementById("riskSlider"),
  fitSlider: document.getElementById("fitSlider"),
  approvalOnlyToggle: document.getElementById("approvalOnlyToggle"),
  riskValue: document.getElementById("riskValue"),
  fitValue: document.getElementById("fitValue"),
  approvalDesk: document.getElementById("approvalDesk"),
  killDesk: document.getElementById("killDesk"),
  reapprovalQueue: document.getElementById("reapprovalQueue"),
  alertFeed: document.getElementById("alertFeed"),
  regimeOpsPanel: document.getElementById("regimeOpsPanel"),
  portfolioWatchtower: document.getElementById("portfolioWatchtower"),
  positionAlertPanel: document.getElementById("positionAlertPanel"),
  alertPolicyPanel: document.getElementById("alertPolicyPanel"),
  postmortemFeed: document.getElementById("postmortemFeed"),
  shiftFeed: document.getElementById("shiftFeed"),
  capitalQueue: document.getElementById("capitalQueue"),
  journalPanel: document.getElementById("journalPanel"),
  portfolioPanel: document.getElementById("portfolioPanel"),
  inspector: document.getElementById("inspector"),
  policyGrid: document.getElementById("policyGrid"),
  sourceGrid: document.getElementById("sourceGrid"),
  contractGrid: document.getElementById("contractGrid"),
  pipelineGrid: document.getElementById("pipelineGrid"),
};

const state = {
  overview: fallbackOverview,
  verdictFilter: "All",
  selected: fallbackOverview.tokens[0]?.symbol || "",
  riskLimit: 55,
  fitFloor: 35,
  approvalOnly: false,
  loading: false,
  error: null,
  pollTimer: null,
  streamSource: null,
  streamStatus: "idle",
  streamLastEventAt: null,
  streamError: null,
  mandateDraft: { ...fallbackOverview.userMandate.settings },
  activeMandate: { ...fallbackOverview.userMandate.settings },
  quickCheckToken: null,
  quickCheckMeta: null,
  quickCheckError: null,
  quickCheckPending: false,
  binanceSettings: {
    loading: false,
    saving: false,
    testing: false,
    error: null,
    configured: false,
    keyPreview: "",
    spotBaseUrl: "https://api.binance.com",
    futuresBaseUrl: "https://fapi.binance.com",
    validation: {
      status: "missing",
      headline: "未配置 Binance API",
      detail: "配置后可让 Goldlane 优先使用你的 Binance 通道。",
    },
    form: {
      apiKey: "",
      apiSecret: "",
      spotBaseUrl: "https://api.binance.com",
      futuresBaseUrl: "https://fapi.binance.com",
    },
  },
  alertSeverityFilter: "All",
  journalEntries: [],
  journalFilter: "All",
  portfolioFilter: "Open",
  positionAlerts: [],
  positionAlertFilter: "Unread",
  positionAlertPrefs: {
    desktopEnabled: false,
    minInboxSeverity: "medium",
    minDesktopSeverity: "high",
    desktopCriticalOnly: false,
    autoFollowRecommendedPreset: false,
    mutedSymbols: [],
    snoozedUntilBySymbol: {},
    symbolPolicies: {},
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pct(value) {
  return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}

function price(value) {
  return value == null ? "--" : `$${Number(value).toFixed(value >= 1 ? 3 : 6)}`;
}

function compactUsd(value) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  const numeric = Number(value);
  if (numeric >= 1_000_000_000) return `$${(numeric / 1_000_000_000).toFixed(2)}B`;
  if (numeric >= 1_000_000) return `$${(numeric / 1_000_000).toFixed(2)}M`;
  if (numeric >= 1_000) return `$${(numeric / 1_000).toFixed(1)}K`;
  return `$${numeric.toFixed(0)}`;
}

function signedCompactUsd(value) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  const numeric = Number(value);
  const prefix = numeric > 0 ? "+" : numeric < 0 ? "-" : "";
  return `${prefix}${compactUsd(Math.abs(numeric))}`;
}

function compactMinutes(minutes) {
  if (!minutes) return "No TTL";
  if (minutes >= 60) return `${Math.round(minutes / 60)}h`;
  return `${minutes}m`;
}

function timeUntil(iso) {
  if (!iso) return "No expiry";
  const diffMinutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (diffMinutes <= 0) return "Expired";
  if (diffMinutes >= 60) return `${Math.round(diffMinutes / 60)}h 后复审`;
  return `${diffMinutes}m 后复审`;
}

function rawEdgePct(token) {
  if (token?.opportunity?.grossEdgePct != null) return Number(token.opportunity.grossEdgePct);
  const spotEdge = Math.abs(Number(token?.dexSpotSpreadPct || 0));
  const basisEdge = Math.abs(Number(token?.spotPerpBasisPct || 0));
  return Math.max(spotEdge, basisEdge);
}

function executableEdgePct(token) {
  if (token?.opportunity?.netEdgePct != null) return Number(token.opportunity.netEdgePct);
  if (!token) return 0;
  const status = token.warrant?.status;
  if (["Revoked", "Rejected"].includes(status)) return 0;

  const spotEdge = Math.abs(Number(token.dexSpotSpreadPct || 0));
  const basisEdge = Math.abs(Number(token.spotPerpBasisPct || 0));
  const lane = token.warrant?.lane;

  if (lane === "basis") return basisEdge || spotEdge;
  if (lane === "futures") return Math.max(basisEdge, spotEdge * 0.7);
  if (lane === "spot" || lane === "research") return spotEdge;
  return 0;
}

function opportunityReferenceCapitalUsd(token) {
  if (token?.opportunity?.referenceCapitalUsd != null) return Number(token.opportunity.referenceCapitalUsd);
  return Number(
    state.overview.userMandate?.settings?.referenceCapitalUsd ??
      state.activeMandate?.referenceCapitalUsd ??
      fallbackOverview.userMandate.settings.referenceCapitalUsd,
  );
}

function opportunitySuggestedNotionalUsd(token) {
  if (token?.opportunity?.suggestedNotionalUsd != null) return Number(token.opportunity.suggestedNotionalUsd);
  return Number((((token?.warrant?.riskBudgetPct || 0) * opportunityReferenceCapitalUsd(token)) / 100).toFixed(2));
}

function opportunityExpectedGrossPnlUsd(token) {
  if (token?.opportunity?.expectedGrossPnlUsd != null) return Number(token.opportunity.expectedGrossPnlUsd);
  return Number(((opportunitySuggestedNotionalUsd(token) * rawEdgePct(token)) / 100).toFixed(2));
}

function opportunityExpectedNetPnlUsd(token) {
  if (token?.opportunity?.expectedNetPnlUsd != null) return Number(token.opportunity.expectedNetPnlUsd);
  return Number(((opportunitySuggestedNotionalUsd(token) * executableEdgePct(token)) / 100).toFixed(2));
}

function opportunityReplay(token) {
  return Array.isArray(token?.opportunity?.replay) ? token.opportunity.replay : [];
}

function replayTimestamp(iso) {
  if (!iso) return "--";
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function storageAvailable() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch (error) {
    return false;
  }
}

function currentLaneMarkPrice(token, lane) {
  if (!token) return null;

  if (lane === "futures") {
    return Number(token.futuresPrice ?? token.spotPrice ?? token.dexPriceUsd ?? 0) || null;
  }

  if (lane === "basis") {
    return Number(token.spotPrice ?? token.futuresPrice ?? token.dexPriceUsd ?? 0) || null;
  }

  if (lane === "spot" || lane === "research") {
    return Number(token.spotPrice ?? token.dexPriceUsd ?? token.futuresPrice ?? 0) || null;
  }

  return Number(token.spotPrice ?? token.dexPriceUsd ?? token.futuresPrice ?? 0) || null;
}

function normalizeJournalEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const normalized = { ...entry };

  if (normalized.action === "trade") {
    normalized.positionStatus = normalized.positionStatus === "closed" ? "closed" : "open";
    normalized.entryPriceUsd = normalized.entryPriceUsd != null ? Number(normalized.entryPriceUsd) : null;
    normalized.entryNetEdgePct = normalized.entryNetEdgePct != null ? Number(normalized.entryNetEdgePct) : null;
    normalized.entryRawEdgePct = normalized.entryRawEdgePct != null ? Number(normalized.entryRawEdgePct) : null;
    normalized.entryNotionalUsd =
      normalized.entryNotionalUsd != null
        ? Number(normalized.entryNotionalUsd)
        : Number(
            (
              ((normalized.riskBudgetPct || 0) *
                Number(
                  normalized.entryReferenceCapitalUsd ??
                    state.activeMandate?.referenceCapitalUsd ??
                    fallbackOverview.userMandate.settings.referenceCapitalUsd,
                )) /
              100
            ).toFixed(2),
          );
    normalized.entryReferenceCapitalUsd =
      normalized.entryReferenceCapitalUsd != null
        ? Number(normalized.entryReferenceCapitalUsd)
        : Number(
            state.activeMandate?.referenceCapitalUsd ?? fallbackOverview.userMandate.settings.referenceCapitalUsd,
          );
    normalized.entryExpectedNetPnlUsd =
      normalized.entryExpectedNetPnlUsd != null ? Number(normalized.entryExpectedNetPnlUsd) : normalized.expectedNetPnlUsd;
    normalized.closedPriceUsd = normalized.closedPriceUsd != null ? Number(normalized.closedPriceUsd) : null;
    normalized.closedExpectedNetPnlUsd =
      normalized.closedExpectedNetPnlUsd != null ? Number(normalized.closedExpectedNetPnlUsd) : null;
  }

  return normalized;
}

function journalTone(action) {
  if (action === "trade") return "approved";
  if (action === "watch") return "deferred";
  if (action === "review") return "revoked";
  return "muted";
}

function loadJournalEntries() {
  if (!storageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeJournalEntry).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveJournalEntries() {
  if (!storageAvailable()) return;

  try {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(state.journalEntries.slice(0, 80)));
  } catch (error) {
    // Ignore storage write failures and keep journal in memory.
  }
}

function loadPositionAlerts() {
  if (!storageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(POSITION_ALERTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .map((alert) => {
            if (!alert || typeof alert !== "object") return null;
            return {
              status: alert.status === "resolved" ? "resolved" : "active",
              lifecycle: alert.lifecycle || "new",
              resolvedAt: alert.resolvedAt || null,
              resolutionNote: alert.resolutionNote || null,
              reopenedFromId: alert.reopenedFromId || null,
              ...alert,
            };
          })
          .filter(Boolean)
      : [];
  } catch (error) {
    return [];
  }
}

function savePositionAlerts() {
  if (!storageAvailable()) return;

  try {
    window.localStorage.setItem(POSITION_ALERTS_STORAGE_KEY, JSON.stringify(state.positionAlerts.slice(0, 80)));
  } catch (error) {
    // Ignore storage write failures and keep alerts in memory.
  }
}

function sanitizePositionAlertPrefs(prefs = {}) {
  const rawSymbolPolicies =
    prefs.symbolPolicies && typeof prefs.symbolPolicies === "object" ? prefs.symbolPolicies : {};
  const symbolPolicies = Object.fromEntries(
    Object.entries(rawSymbolPolicies)
      .map(([symbol, mode]) => [String(symbol).toUpperCase(), normalizeSymbolAlertPolicyMode(mode)])
      .filter(([symbol, mode]) => symbol && mode !== "global"),
  );
  if (Array.isArray(prefs.mutedSymbols)) {
    prefs.mutedSymbols.forEach((symbol) => {
      const normalizedSymbol = String(symbol).toUpperCase();
      if (normalizedSymbol && !symbolPolicies[normalizedSymbol]) {
        symbolPolicies[normalizedSymbol] = "mute";
      }
    });
  }
  const mutedSymbols = Object.entries(symbolPolicies)
    .filter(([, mode]) => mode === "mute")
    .map(([symbol]) => symbol);
  const rawSnoozes = prefs.snoozedUntilBySymbol && typeof prefs.snoozedUntilBySymbol === "object" ? prefs.snoozedUntilBySymbol : {};
  const now = Date.now();
  const snoozedUntilBySymbol = Object.fromEntries(
    Object.entries(rawSnoozes)
      .map(([symbol, iso]) => [String(symbol).toUpperCase(), iso])
      .filter(([, iso]) => iso && new Date(iso).getTime() > now),
  );

  return {
    desktopEnabled: Boolean(prefs.desktopEnabled),
    minInboxSeverity: severityLevels.includes(prefs.minInboxSeverity) ? prefs.minInboxSeverity : "medium",
    minDesktopSeverity: severityLevels.includes(prefs.minDesktopSeverity) ? prefs.minDesktopSeverity : "high",
    desktopCriticalOnly: Boolean(prefs.desktopCriticalOnly),
    autoFollowRecommendedPreset: Boolean(prefs.autoFollowRecommendedPreset),
    mutedSymbols,
    snoozedUntilBySymbol,
    symbolPolicies,
  };
}

function loadPositionAlertPrefs() {
  if (!storageAvailable()) return sanitizePositionAlertPrefs();

  try {
    const raw = window.localStorage.getItem(POSITION_ALERT_PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return sanitizePositionAlertPrefs(parsed);
  } catch (error) {
    return sanitizePositionAlertPrefs();
  }
}

function savePositionAlertPrefs() {
  if (!storageAvailable()) return;

  try {
    window.localStorage.setItem(POSITION_ALERT_PREFS_STORAGE_KEY, JSON.stringify(state.positionAlertPrefs));
  } catch (error) {
    // Ignore storage write failures and keep prefs in memory.
  }
}

function supportsBrowserNotifications() {
  return typeof window !== "undefined" && typeof Notification !== "undefined";
}

function browserNotificationPermission() {
  if (!supportsBrowserNotifications()) return "unsupported";
  return Notification.permission || "default";
}

function severityAtLeast(severity, floor) {
  return (severityRank[severity] || 0) >= (severityRank[floor] || 0);
}

function severityFloorLabel(severity) {
  if (severity === "high") return "High Only";
  if (severity === "medium") return "Medium+";
  return "All Levels";
}

function cycleSeverityFloor(current) {
  if (current === "high") return "medium";
  if (current === "medium") return "low";
  return "high";
}

function positionAlertPresetLabel(name) {
  return positionAlertPresetConfigs[name]?.label || "Custom";
}

function positionAlertPresetDescription(name) {
  return positionAlertPresetConfigs[name]?.desc || "你已经手动调整了提醒参数，当前不是标准工作模式。";
}

function currentPositionAlertPreset() {
  const matched = Object.entries(positionAlertPresetConfigs).find(([, config]) => {
    return (
      state.positionAlertPrefs.minInboxSeverity === config.minInboxSeverity &&
      state.positionAlertPrefs.minDesktopSeverity === config.minDesktopSeverity &&
      state.positionAlertPrefs.desktopCriticalOnly === config.desktopCriticalOnly
    );
  });

  return matched?.[0] || "custom";
}

function recommendedPositionAlertPreset() {
  const market = state.overview.marketContext || {};
  const summary = state.overview.approvalSummary || {};
  const liveAlerts = state.overview.alertFeed || [];
  const watchItems = portfolioWatchtowerItems();
  const highWatch = watchItems.filter((item) => item.severity === "high").length;
  const mediumWatch = watchItems.filter((item) => item.severity === "medium").length;
  const highAlerts = liveAlerts.filter((item) => item.severity === "high").length;
  const mediumAlerts = liveAlerts.filter((item) => item.severity === "medium").length;
  const fearGreedValue =
    market.fearGreedValue != null && !Number.isNaN(Number(market.fearGreedValue))
      ? Number(market.fearGreedValue)
      : null;
  const regimeText = `${market.regime || ""} ${market.fearGreedClass || ""}`.toLowerCase();
  const rejectedCount = Number(summary.revoked || 0) + Number(summary.rejected || 0);
  const approvedCount = Number(summary.approved || 0);

  if (
    highWatch >= 2 ||
    highAlerts >= 3 ||
    (fearGreedValue != null && fearGreedValue <= 20) ||
    /extreme fear|fear|panic|stress|risk.?off/.test(regimeText)
  ) {
    return {
      name: "quiet",
      tone: "revoked",
      headline: "当前更适合 Quiet",
      reason:
        highWatch >= 2
          ? `你的组合里已经有 ${highWatch} 个高优先风险点，先压噪音比继续扩提醒更重要。`
          : highAlerts >= 3
            ? `实时高优先提醒已经堆到 ${highAlerts} 条，先收窄工作流更稳。`
            : `市场当前偏 ${market.fearGreedClass || market.regime || "risk-off"}，先把提醒收紧更合理。`,
    };
  }

  if (
    highWatch === 0 &&
    highAlerts <= 1 &&
    approvedCount >= 2 &&
    ((fearGreedValue != null && fearGreedValue >= 60) || /greed|risk.?on|momentum|breakout/.test(regimeText))
  ) {
    return {
      name: "hunter",
      tone: "approved",
      headline: "当前更适合 Hunter",
      reason: `已批准机会 ${approvedCount} 个，组合高优先风险不高，市场环境也允许你放宽捕获范围。`,
    };
  }

  return {
    name: "focus",
    tone: "deferred",
    headline: "当前更适合 Focus",
    reason:
      rejectedCount >= approvedCount
        ? `真假机会同时存在，先维持平衡档更容易看清哪些值得处理。`
        : mediumWatch || mediumAlerts
          ? `当前有一些需要盯的变化，但还不至于切到最保守或最激进。`
          : `当前市场和组合压力都不极端，默认平衡档最合适。`,
  };
}

function syncRecommendedPositionAlertPreset() {
  if (!state.positionAlertPrefs.autoFollowRecommendedPreset) return;
  const recommended = recommendedPositionAlertPreset();
  const config = positionAlertPresetConfigs[recommended.name];
  if (!config) return;

  const nextPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    minInboxSeverity: config.minInboxSeverity,
    minDesktopSeverity: config.minDesktopSeverity,
    desktopCriticalOnly: config.desktopCriticalOnly,
  });

  if (JSON.stringify(nextPrefs) === JSON.stringify(state.positionAlertPrefs)) return;
  state.positionAlertPrefs = nextPrefs;
  savePositionAlertPrefs();
}

function regimeOpsBrief() {
  const market = state.overview.marketContext || {};
  const summary = state.overview.approvalSummary || {};
  const recommended = recommendedPositionAlertPreset();
  const currentPreset = currentPositionAlertPreset();
  const liveAlerts = state.overview.alertFeed || [];
  const watchItems = portfolioWatchtowerItems();
  const highWatch = watchItems.filter((item) => item.severity === "high").length;
  const mediumWatch = watchItems.filter((item) => item.severity === "medium").length;
  const highAlerts = liveAlerts.filter((item) => item.severity === "high").length;
  const totalUniverse =
    Number(summary.approved || 0) +
    Number(summary.deferred || 0) +
    Number(summary.revoked || 0) +
    Number(summary.rejected || 0);
  const fakeCount = Number(summary.revoked || 0) + Number(summary.rejected || 0);
  const fakeRatioPct = totalUniverse ? Math.round((fakeCount / totalUniverse) * 100) : 0;
  const approvedCount = Number(summary.approved || 0);
  const pressureScore = highWatch * 3 + mediumWatch * 2 + highAlerts * 2 + fakeCount;

  let title = "保持 Focus";
  let tone = "deferred";
  let summaryText = "当前环境更适合维持平衡档，既不要被噪音推着走，也不用过度收缩。";

  if (recommended.name === "quiet") {
    title = "先保资本，再扩注意力";
    tone = "revoked";
    summaryText = "当前组合压力或市场风险偏高，先把提醒和执行范围收紧，优先处理已经暴露出来的问题。";
  } else if (recommended.name === "hunter") {
    title = "允许更积极地捕捉新窗口";
    tone = "approved";
    summaryText = "当前真钱机会密度不差，组合压力也可控，可以适度放宽提醒和机会捕获范围。";
  }

  const operateNow = [];
  const pullBack = [];
  const reviewFirst = [];

  if (recommended.name === "quiet") {
    operateNow.push("先把提醒收在高优先，把桌面打断降到最低。");
    operateNow.push("优先处理 Watchtower 里的 thesis broken / net edge lost。");
    pullBack.push("减少新增 symbol 的 overrides，不要一边冒火一边继续加监控。");
    pullBack.push("短 TTL 窗口先看，不急着扩成长期 thesis。");
  } else if (recommended.name === "hunter") {
    operateNow.push("允许更多中低优先变化进入 inbox，尽量别漏掉新窗口。");
    operateNow.push("更频繁查看 What Changed 和 Alert Center，优先捕捉刚转正的机会。");
    pullBack.push("别因为环境转暖就忽略 fake ratio 和 broken market。");
    pullBack.push("新窗口先看执行 lane 和成本，不要只看 gross edge。");
  } else {
    operateNow.push("维持 Focus，优先处理真变化，不对所有波动做反应。");
    operateNow.push("让 inbox 保持可读，同时保留对新窗口的基本覆盖。");
    pullBack.push("不要把临时高优先提醒放大成全面 risk-off。");
    pullBack.push("也不要因为一两个新机会就直接切到最激进档。");
  }

  if (highWatch > 0) {
    reviewFirst.push(`你的组合里有 ${highWatch} 个高优先风险点，先处理这些再看新机会。`);
  }
  if (mediumWatch > 0) {
    reviewFirst.push(`还有 ${mediumWatch} 个中优先 watchtower 项，适合在下一轮 review 里顺手消化。`);
  }
  if (highAlerts > 0) {
    reviewFirst.push(`实时高优先提醒当前有 ${highAlerts} 条，说明今天更像运营日，不只是浏览日。`);
  }
  if (fakeCount > approvedCount) {
    reviewFirst.push(`假机会数量 ${fakeCount} 已经高于真钱机会 ${approvedCount}，先看 Killed / Postmortem 更有价值。`);
  }
  if (!reviewFirst.length) {
    reviewFirst.push("当前没有特别拥挤的风险堆积，可以按推荐 preset 稳定执行。");
  }

  return {
    title,
    tone,
    summaryText,
    recommended,
    currentPreset,
    autoFollow: state.positionAlertPrefs.autoFollowRecommendedPreset,
    metrics: {
      regime: market.regime || "--",
      fearGreed: market.fearGreedValue != null ? `${market.fearGreedValue} · ${market.fearGreedClass || "--"}` : "--",
      approvedCount,
      fakeRatioPct,
      pressureScore,
    },
    operateNow,
    pullBack,
    reviewFirst,
  };
}

function commandDeckBrief() {
  const regime = regimeOpsBrief();
  const summary = state.overview.approvalSummary || {};
  const approvedTop =
    symbolsToTokens(state.overview.desk?.approved)[0] ||
    state.overview.tokens.find((token) => token.warrant?.status === "Approved") ||
    null;
  const rejectedTop = symbolsToTokens(state.overview.desk?.rejected)[0] || deriveDesk("rejected")[0] || null;
  const recheckTop = symbolsToTokens(state.overview.desk?.reapproval)[0] || deriveDesk("reapproval")[0] || null;
  const liveAlerts = (state.overview.alertFeed || [])
    .slice()
    .sort((left, right) => (severityRank[right.severity] || 0) - (severityRank[left.severity] || 0));
  const topAlert = liveAlerts[0] || null;
  const watchItems = portfolioWatchtowerItems();
  const topRisk = watchItems[0] || null;
  const highRiskCount = watchItems.filter((item) => item.severity === "high").length;
  const approvedCount = Number(summary.approved || 0);
  const fakeCount = Number(summary.revoked || 0) + Number(summary.rejected || 0);

  let title = "今天按平衡档执行";
  let tone = regime.tone;
  let summaryText = regime.summaryText;
  let primaryFocus = topAlert?.symbol || topRisk?.symbol || approvedTop?.symbol || recheckTop?.symbol || "";
  let firstMove = {
    title: "保持扫描",
    symbol: recheckTop?.symbol || approvedTop?.symbol || "",
    tone: "deferred",
    body: recheckTop
      ? `${recheckTop.symbol} 是当前最值得继续复审的窗口，先确认它有没有进入可执行区。`
      : approvedTop
        ? `${approvedTop.symbol} 是当前最干净的真钱机会，先确认 lane、TTL 和执行摩擦。`
        : "当前没有明确的首要动作，先看 Regime Ops 和 What Changed。",
  };

  if (topRisk && topRisk.severity === "high") {
    title = "先处理组合风险，再谈新机会";
    tone = "revoked";
    summaryText = `${topRisk.symbol} 已经进入高优先风险区。今天第一任务不是找新币，而是把已有 thesis 的风险处理掉。`;
    primaryFocus = topRisk.symbol;
    firstMove = {
      title: "Priority 1 · Defend Capital",
      symbol: topRisk.symbol,
      tone: "revoked",
      body: `${topRisk.headline} ${topRisk.body}`,
    };
  } else if (topAlert && topAlert.severity === "high") {
    title = "先处理高优先机会变化";
    tone = "deferred";
    summaryText = `${topAlert.symbol} 刚刚出现高优先变化，今天先处理这类真变化，再决定要不要扩工作流。`;
    primaryFocus = topAlert.symbol;
    firstMove = {
      title: "Priority 1 · Handle Signal",
      symbol: topAlert.symbol,
      tone: topAlert.kind === "window-opened" || topAlert.kind === "net-pnl-cross" ? "approved" : "deferred",
      body: `${topAlert.headline} ${topAlert.body}`,
    };
  } else if (approvedTop) {
    title = "今天可以优先处理真钱机会";
    tone = "approved";
    summaryText = `${approvedTop.symbol} 当前仍是最干净的可执行窗口，先处理它，再决定是否扩到更多标的。`;
    primaryFocus = approvedTop.symbol;
    firstMove = {
      title: "Priority 1 · Best Opportunity",
      symbol: approvedTop.symbol,
      tone: "approved",
      body: opportunityHeadline(approvedTop),
    };
  }

  const cards = [
    firstMove,
    {
      title: "Priority 2 · Protect Capital",
      symbol: topRisk?.symbol || "",
      tone: topRisk ? (topRisk.severity === "high" ? "revoked" : "deferred") : "muted",
      body: topRisk
        ? `${topRisk.headline} 当前组合高优先 ${highRiskCount} 项。`
        : "当前没有明显的组合级 thesis 断裂，可以把注意力更多留给真钱机会。",
    },
    {
      title: "Priority 3 · Best New Window",
      symbol: approvedTop?.symbol || recheckTop?.symbol || "",
      tone: approvedTop ? "approved" : recheckTop ? "deferred" : "muted",
      body: approvedTop
        ? `${approvedTop.symbol} 当前净边际 ${pct(executableEdgePct(approvedTop))}，预估净收益 ${signedCompactUsd(opportunityExpectedNetPnlUsd(approvedTop))}。`
        : recheckTop
          ? `${recheckTop.symbol} 还在复审队列里，先看它会不会从观察转正。`
          : "当前没有已批准窗口，先继续看 What Changed 和 Watch & Recheck。",
    },
    {
      title: "Do Not Touch",
      symbol: rejectedTop?.symbol || "",
      tone: rejectedTop ? "revoked" : "muted",
      body: rejectedTop
        ? `${rejectedTop.symbol} 当前更像伪机会或坏市场。今天别把注意力浪费在这种窗口上。`
        : fakeCount
          ? `当前仍有 ${fakeCount} 个被系统拦掉的伪机会，先信过滤器。`
          : "当前没有特别突出的伪机会，但仍要先验证 venue 和执行 lane。",
    },
  ];

  return {
    title,
    tone,
    summaryText,
    primaryFocus,
    cards,
    metrics: {
      suggestedPreset: positionAlertPresetLabel(regime.recommended.name),
      currentPreset: positionAlertPresetLabel(regime.currentPreset),
      actionable: approvedCount,
      fakeCount,
      highRiskCount,
    },
  };
}

function commandDeckExportText(deck) {
  return [
    `Goldlane · Command Deck`,
    `${deck.title}`,
    `${deck.summaryText}`,
    ``,
    `Current Preset: ${deck.metrics.currentPreset}`,
    `Suggested Preset: ${deck.metrics.suggestedPreset}`,
    `Actionable: ${deck.metrics.actionable}`,
    `Fake Windows: ${deck.metrics.fakeCount}`,
    `High Portfolio Risk: ${deck.metrics.highRiskCount}`,
    ``,
    ...deck.cards.map((card) => `- ${card.title}${card.symbol ? ` (${card.symbol})` : ""}: ${card.body}`),
  ].join("\n");
}

function normalizeSymbolAlertPolicyMode(mode) {
  return symbolAlertPolicyModes.includes(mode) ? mode : "global";
}

function symbolAlertPolicy(symbol) {
  const normalizedSymbol = String(symbol).toUpperCase();
  return normalizeSymbolAlertPolicyMode(state.positionAlertPrefs.symbolPolicies?.[normalizedSymbol] || "global");
}

function symbolAlertPolicyLabel(mode) {
  return symbolAlertPolicyLabels[normalizeSymbolAlertPolicyMode(mode)] || symbolAlertPolicyLabels.global;
}

function symbolAlertPolicyDescription(mode) {
  return (
    symbolAlertPolicyDescriptions[normalizeSymbolAlertPolicyMode(mode)] || symbolAlertPolicyDescriptions.global
  );
}

function symbolAlertPolicyTone(mode) {
  if (mode === "mute") return "muted";
  if (mode === "critical") return "revoked";
  if (mode === "reopened") return "deferred";
  if (mode === "inbox") return "deferred";
  return "approved";
}

function activeSnoozes() {
  const prefs = sanitizePositionAlertPrefs(state.positionAlertPrefs);
  if (JSON.stringify(prefs) !== JSON.stringify(state.positionAlertPrefs)) {
    state.positionAlertPrefs = prefs;
    savePositionAlertPrefs();
  }
  return prefs.snoozedUntilBySymbol;
}

function isSymbolMuted(symbol) {
  return symbolAlertPolicy(symbol) === "mute";
}

function snoozedUntilForSymbol(symbol) {
  return activeSnoozes()[String(symbol).toUpperCase()] || null;
}

function isSymbolSnoozed(symbol) {
  return Boolean(snoozedUntilForSymbol(symbol));
}

function suppressAlertsForSymbol(symbol, reason) {
  const nowIso = new Date().toISOString();
  const normalizedSymbol = String(symbol).toUpperCase();
  state.positionAlerts = state.positionAlerts.map((alert) => {
    if (alert.symbol !== normalizedSymbol || alert.status === "resolved") return alert;
    return {
      ...alert,
      status: "resolved",
      resolvedAt: nowIso,
      resolutionNote: reason,
    };
  });
  savePositionAlerts();
}

function setSymbolAlertPolicy(symbol, mode) {
  const normalizedSymbol = String(symbol).toUpperCase();
  const normalizedMode = normalizeSymbolAlertPolicyMode(mode);
  const nextPolicies = { ...(state.positionAlertPrefs.symbolPolicies || {}) };

  if (normalizedMode === "global") {
    delete nextPolicies[normalizedSymbol];
  } else {
    nextPolicies[normalizedSymbol] = normalizedMode;
  }

  if (normalizedMode === "mute") {
    suppressAlertsForSymbol(normalizedSymbol, "你已将这个 symbol 设为 Muted，当前提醒已从个人工作流里移出。");
  }

  state.positionAlertPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    symbolPolicies: nextPolicies,
  });
  savePositionAlertPrefs();
  syncPositionAlerts();
  render();
}

function applyPositionAlertPreset(name, options = {}) {
  const config = positionAlertPresetConfigs[name];
  if (!config) return;

  state.positionAlertPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    minInboxSeverity: config.minInboxSeverity,
    minDesktopSeverity: config.minDesktopSeverity,
    desktopCriticalOnly: config.desktopCriticalOnly,
    autoFollowRecommendedPreset: options.keepAuto
      ? state.positionAlertPrefs.autoFollowRecommendedPreset
      : false,
  });
  savePositionAlertPrefs();
  syncPositionAlerts();
  render();
}

function clearPositionAlertOverrides() {
  state.positionAlertPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    symbolPolicies: {},
    snoozedUntilBySymbol: {},
  });
  savePositionAlertPrefs();
  syncPositionAlerts();
  render();
}

function toggleAutoFollowRecommendedPreset() {
  const nextEnabled = !state.positionAlertPrefs.autoFollowRecommendedPreset;
  state.positionAlertPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    autoFollowRecommendedPreset: nextEnabled,
  });
  savePositionAlertPrefs();
  if (nextEnabled) {
    const recommended = recommendedPositionAlertPreset();
    applyPositionAlertPreset(recommended.name, { keepAuto: true });
    return;
  }
  syncPositionAlerts();
  render();
}

function cycleSymbolAlertPolicy(symbol) {
  const current = symbolAlertPolicy(symbol);
  const index = symbolAlertPolicyModes.indexOf(current);
  const next = symbolAlertPolicyModes[(index + 1) % symbolAlertPolicyModes.length] || "global";
  setSymbolAlertPolicy(symbol, next);
}

function inboxThresholdForSymbol(symbol) {
  return symbolAlertPolicy(symbol) === "critical" ? "high" : state.positionAlertPrefs.minInboxSeverity;
}

function desktopThresholdForSymbol(symbol) {
  const mode = symbolAlertPolicy(symbol);
  if (mode === "mute" || mode === "inbox") return null;
  return mode === "critical" ? "high" : state.positionAlertPrefs.minDesktopSeverity;
}

function shouldSurfacePositionAlertInInbox(item) {
  const mode = symbolAlertPolicy(item.symbol);
  if (mode === "mute") return false;
  return severityAtLeast(item.severity, inboxThresholdForSymbol(item.symbol));
}

function shouldSurfacePositionAlertOnDesktop(alert) {
  const desktopFloor = desktopThresholdForSymbol(alert.symbol);
  if (!desktopFloor) return false;
  if (!severityAtLeast(alert.severity, desktopFloor)) return false;
  if (state.positionAlertPrefs.desktopCriticalOnly && !isCriticalPositionAlert(alert)) return false;
  return true;
}

function positionAlertPolicyStats() {
  const policyValues = Object.values(state.positionAlertPrefs.symbolPolicies || {});
  return {
    custom: policyValues.length,
    reopened: policyValues.filter((mode) => mode === "reopened").length,
    inbox: policyValues.filter((mode) => mode === "inbox").length,
    critical: policyValues.filter((mode) => mode === "critical").length,
    mute: policyValues.filter((mode) => mode === "mute").length,
    snoozed: Object.keys(activeSnoozes()).length,
  };
}

function nextReviewIsoForSymbol(symbol) {
  const token = getToken(symbol);
  if (token?.warrant?.expiresAt) return token.warrant.expiresAt;
  return new Date(Date.now() + 2 * 60 * 60_000).toISOString();
}

function journalEntryLabel(action) {
  return journalLabels[action] || action;
}

function journalActionCopy(action, token) {
  const brief = executionBrief(token);
  const pm = postmortem(token);

  if (action === "trade") return brief.primaryAction;
  if (action === "watch") return `先继续观察 ${token.symbol}，当前重点看 ${brief.nextReview?.[0] || "下一轮结构变化"}`;
  if (action === "review") return pm?.lesson || "记为复盘案例，下次先看失败根因。";
  return `明确跳过 ${token.symbol}，把注意力转移到更干净的窗口。`;
}

function buildJournalEntry(token, action) {
  const brief = executionBrief(token);
  const pm = postmortem(token);
  const createdAt = new Date().toISOString();
  const entry = {
    id: `${token.symbol}-${action}-${Date.now()}`,
    action,
    symbol: token.symbol,
    name: token.name,
    theme: token.theme,
    createdAt,
    updatedAt: createdAt,
    status: token.warrant?.status || "Deferred",
    lane: token.warrant?.lane || "blocked",
    score: opportunityScore(token),
    expectedNetPnlUsd: opportunityExpectedNetPnlUsd(token),
    riskBudgetPct: token.warrant?.riskBudgetPct || 0,
    headline: action === "review" && pm ? pm.headline : opportunityHeadline(token),
    note: journalActionCopy(action, token),
  };

  if (action !== "trade") return entry;

  return {
    ...entry,
    positionStatus: "open",
    entryPriceUsd: currentLaneMarkPrice(token, token.warrant?.lane),
    entryNetEdgePct: executableEdgePct(token),
    entryRawEdgePct: rawEdgePct(token),
    entryNotionalUsd: opportunitySuggestedNotionalUsd(token),
    entryReferenceCapitalUsd: opportunityReferenceCapitalUsd(token),
    entryExpectedNetPnlUsd: opportunityExpectedNetPnlUsd(token),
    entryVerdict: token.warrant?.status || "Deferred",
    closedAt: null,
    closedPriceUsd: null,
    closedExpectedNetPnlUsd: null,
    closeReason: null,
  };
}

function addJournalEntry(token, action, button) {
  let entry = buildJournalEntry(token, action);
  let buttonCopy = "已记录";

  if (action === "trade") {
    const existingIndex = state.journalEntries.findIndex(
      (item) => item.action === "trade" && item.symbol === token.symbol && item.positionStatus !== "closed",
    );

    if (existingIndex >= 0) {
      const existing = state.journalEntries[existingIndex];
      entry = {
        ...existing,
        ...entry,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
        note: `更新持仓快照：${journalActionCopy(action, token)}`,
      };
      state.journalEntries = [entry, ...state.journalEntries.filter((_, index) => index !== existingIndex)].slice(0, 80);
      buttonCopy = "已更新持仓";
    } else {
      state.journalEntries = [entry, ...state.journalEntries].slice(0, 80);
      buttonCopy = "已加入组合";
    }
  } else {
    state.journalEntries = [entry, ...state.journalEntries].slice(0, 80);
  }

  saveJournalEntries();
  syncPositionAlerts();
  renderSummary();
  renderJournalPanel();
  renderPositionAlertPanel();
  renderPortfolioPanel();
  renderPortfolioWatchtower();
  renderInspector(getToken(state.selected));

  if (button) {
    const previous = button.textContent;
    button.textContent = buttonCopy;
    window.setTimeout(() => {
      button.textContent = previous;
    }, 900);
  }
}

function exportJournalMarkdown() {
  if (!state.journalEntries.length) return "暂无 Journal 记录";
  return state.journalEntries
    .map(
      (entry) =>
        `- ${replayTimestamp(entry.createdAt)} | ${entry.symbol} | ${journalEntryLabel(entry.action)} | ${entry.status} | ${laneLabel(entry.lane)} | PnL ${signedCompactUsd(entry.expectedNetPnlUsd)}${entry.action === "trade" ? ` | Position ${entry.positionStatus || "open"}` : ""} | ${entry.note}`,
    )
    .join("\n");
}

function portfolioEntries() {
  return state.journalEntries.filter((entry) => entry.action === "trade");
}

function latestPortfolioEntryForSymbol(symbol, options = {}) {
  const includeClosed = options.includeClosed || false;
  return portfolioEntries().find(
    (entry) => entry.symbol === symbol && (includeClosed || entry.positionStatus !== "closed"),
  );
}

function portfolioMarkPrice(entry, token = getToken(entry.symbol)) {
  if (entry.positionStatus === "closed") return Number(entry.closedPriceUsd ?? entry.entryPriceUsd ?? 0) || null;
  const livePrice = currentLaneMarkPrice(token, entry.lane);
  const fallbackPrice = Number(entry.entryPriceUsd ?? 0) || null;
  return livePrice ?? fallbackPrice;
}

function portfolioMarkChangePct(entry, token = getToken(entry.symbol)) {
  const entryPrice = Number(entry.entryPriceUsd || 0);
  const markPrice = portfolioMarkPrice(entry, token);
  if (!entryPrice || !markPrice) return null;
  return Number((((markPrice - entryPrice) / entryPrice) * 100).toFixed(2));
}

function portfolioMarkPnlUsd(entry, token = getToken(entry.symbol)) {
  const entryPrice = Number(entry.entryPriceUsd || 0);
  const markPrice = portfolioMarkPrice(entry, token);
  const notional = Number(entry.entryNotionalUsd || 0);
  if (!entryPrice || !markPrice || !notional) return null;
  return Number(((notional * (markPrice - entryPrice)) / entryPrice).toFixed(2));
}

function portfolioLiveNetPnlUsd(entry, token = getToken(entry.symbol)) {
  if (entry.positionStatus === "closed") {
    return Number(entry.closedExpectedNetPnlUsd ?? entry.entryExpectedNetPnlUsd ?? entry.expectedNetPnlUsd ?? 0);
  }
  return token ? opportunityExpectedNetPnlUsd(token) : Number(entry.entryExpectedNetPnlUsd ?? entry.expectedNetPnlUsd ?? 0);
}

function portfolioEdgeDriftPct(entry, token = getToken(entry.symbol)) {
  if (!token || entry.entryNetEdgePct == null) return null;
  return Number((executableEdgePct(token) - Number(entry.entryNetEdgePct || 0)).toFixed(2));
}

function portfolioHoldLabel(entry) {
  const start = new Date(entry.createdAt).getTime();
  const end = new Date(entry.positionStatus === "closed" ? entry.closedAt || entry.updatedAt || entry.createdAt : Date.now()).getTime();
  const diffMinutes = Math.max(1, Math.round((end - start) / 60_000));
  if (diffMinutes >= 60 * 24) return `${Math.round(diffMinutes / (60 * 24))}d`;
  if (diffMinutes >= 60) return `${Math.round(diffMinutes / 60)}h`;
  return `${diffMinutes}m`;
}

function portfolioNeedsReview(entry, token = getToken(entry.symbol)) {
  if (entry.positionStatus === "closed") return false;
  if (!token) return true;
  return token.warrant?.status !== "Approved" || opportunityExpectedNetPnlUsd(token) <= 0;
}

function portfolioPhaseLabel(entry, token = getToken(entry.symbol)) {
  if (entry.positionStatus === "closed") return "Closed";
  if (!token) return "Offline";
  if (portfolioNeedsReview(entry, token)) {
    return token.warrant?.status === "Deferred" ? "Needs Recheck" : "Thesis Broken";
  }
  return "Thesis Alive";
}

function portfolioTone(entry, token = getToken(entry.symbol)) {
  if (entry.positionStatus === "closed") {
    return (portfolioMarkPnlUsd(entry, token) || 0) >= 0 ? "approved" : "revoked";
  }
  if (portfolioNeedsReview(entry, token)) {
    return token?.warrant?.status === "Deferred" ? "deferred" : "revoked";
  }
  return "approved";
}

function filteredPortfolioEntries() {
  const entries = portfolioEntries();

  if (state.portfolioFilter === "All") return entries;
  if (state.portfolioFilter === "Open") return entries.filter((entry) => entry.positionStatus !== "closed");
  if (state.portfolioFilter === "Closed") return entries.filter((entry) => entry.positionStatus === "closed");
  if (state.portfolioFilter === "Needs Review") {
    return entries.filter((entry) => portfolioNeedsReview(entry, getToken(entry.symbol)));
  }
  if (state.portfolioFilter === "Winners") {
    return entries.filter((entry) => (portfolioMarkPnlUsd(entry, getToken(entry.symbol)) || 0) > 0);
  }
  return entries;
}

function portfolioWatchtowerItems() {
  const severityRank = { high: 3, medium: 2, low: 1 };

  return portfolioEntries()
    .filter((entry) => entry.positionStatus !== "closed")
    .map((entry) => {
      const token = getToken(entry.symbol);
      const markPnlUsd = portfolioMarkPnlUsd(entry, token);
      const markChangePct = portfolioMarkChangePct(entry, token);
      const liveNetPnlUsd = portfolioLiveNetPnlUsd(entry, token);
      const edgeDriftPct = portfolioEdgeDriftPct(entry, token);
      const ttlMinutes = token?.warrant?.ttlMinutes || 0;
      const holdLabel = portfolioHoldLabel(entry);

      if (!token) {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "high",
          cardTone: "revoked",
          headline: `${entry.symbol} 的实时机会数据当前不可用`,
          body: "这笔 paper position 失去了实时验证上下文，先不要继续沿用旧 thesis。",
          lane: entry.lane || "blocked",
          statusLabel: "Offline",
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "focus",
          actionLabel: "先复核",
        };
      }

      const liveStatus = token.warrant?.status || "Deferred";

      if (liveStatus === "Revoked" || liveStatus === "Rejected") {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "high",
          cardTone: "revoked",
          headline: `${entry.symbol} 的 thesis 已被系统否决`,
          body:
            postmortem(token)?.headline ||
            `当前 live verdict 已变成 ${liveStatus}，这笔 position 不该继续按原逻辑持有。`,
          lane: token.warrant?.lane || entry.lane || "blocked",
          statusLabel: liveStatus,
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "close",
          actionLabel: "优先关掉",
        };
      }

      if ((liveNetPnlUsd || 0) <= 0) {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "high",
          cardTone: "revoked",
          headline: `${entry.symbol} 的净机会已经转负`,
          body: `你记录它时还是 ${signedCompactUsd(entry.entryExpectedNetPnlUsd || entry.expectedNetPnlUsd || 0)}，现在 live net 已变成 ${signedCompactUsd(liveNetPnlUsd)}。`,
          lane: token.warrant?.lane || entry.lane || "blocked",
          statusLabel: "Net Edge Lost",
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "focus",
          actionLabel: "重新审批",
        };
      }

      if ((markPnlUsd || 0) <= -Math.max(Number(entry.entryNotionalUsd || 0) * 0.015, 6)) {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "medium",
          cardTone: "deferred",
          headline: `${entry.symbol} 已出现明显回撤`,
          body: `当前 mark ${signedCompactUsd(markPnlUsd)}，持有 ${holdLabel}，建议立刻复核进场假设是否还在。`,
          lane: token.warrant?.lane || entry.lane || "blocked",
          statusLabel: "Drawdown",
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "focus",
          actionLabel: "检查止损",
        };
      }

      if ((edgeDriftPct || 0) <= -0.2) {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "medium",
          cardTone: "deferred",
          headline: `${entry.symbol} 的边际正在衰减`,
          body: `从你记录时开始，净边际已经回落 ${pct(edgeDriftPct)}，当前更像“该复审”而不是“继续放着”。`,
          lane: token.warrant?.lane || entry.lane || "blocked",
          statusLabel: liveStatus,
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "focus",
          actionLabel: "复核 thesis",
        };
      }

      if (ttlMinutes > 0 && ttlMinutes <= 20) {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "medium",
          cardTone: "deferred",
          headline: `${entry.symbol} 进入短 TTL 复审区`,
          body: `这笔 position 的实时窗口只剩 ${compactMinutes(ttlMinutes)}，不要把短窗机会当成长期 thesis。`,
          lane: token.warrant?.lane || entry.lane || "blocked",
          statusLabel: "TTL Review",
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "focus",
          actionLabel: "马上复查",
        };
      }

      if ((markPnlUsd || 0) >= Math.max(Number(entry.entryNotionalUsd || 0) * 0.01, 10)) {
        return {
          entryId: entry.id,
          symbol: entry.symbol,
          severity: "low",
          cardTone: "approved",
          headline: `${entry.symbol} 目前仍在扩大利润窗口`,
          body: `当前 mark ${signedCompactUsd(markPnlUsd)}，live net ${signedCompactUsd(liveNetPnlUsd)}，这笔 thesis 仍然健康。`,
          lane: token.warrant?.lane || entry.lane || "blocked",
          statusLabel: "Winner",
          markPnlUsd,
          markChangePct,
          liveNetPnlUsd,
          edgeDriftPct,
          ttlMinutes,
          holdLabel,
          actionKind: "focus",
          actionLabel: "继续跟踪",
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((left, right) => {
      const severityDelta = (severityRank[right.severity] || 0) - (severityRank[left.severity] || 0);
      if (severityDelta !== 0) return severityDelta;
      return Math.abs(Number(right.markPnlUsd || 0)) - Math.abs(Number(left.markPnlUsd || 0));
    })
    .slice(0, 6);
}

function buildPositionAlertKey(item) {
  return [item.entryId, item.symbol, item.statusLabel, item.actionKind].join("::");
}

function buildPositionAlert(item, options = {}) {
  return {
    id: `${item.entryId}-${Date.now()}`,
    key: buildPositionAlertKey(item),
    symbol: item.symbol,
    severity: item.severity,
    headline: item.headline,
    body: item.body,
    lane: item.lane,
    statusLabel: item.statusLabel,
    actionKind: item.actionKind,
    actionLabel: item.actionLabel,
    markPnlUsd: item.markPnlUsd ?? null,
    liveNetPnlUsd: item.liveNetPnlUsd ?? null,
    edgeDriftPct: item.edgeDriftPct ?? null,
    holdLabel: item.holdLabel,
    ttlMinutes: item.ttlMinutes || 0,
    createdAt: new Date().toISOString(),
    readAt: null,
    status: "active",
    lifecycle: options.lifecycle || "new",
    resolvedAt: null,
    resolutionNote: null,
    reopenedFromId: options.reopenedFromId || null,
  };
}

function positionAlertCounts() {
  return {
    unread: state.positionAlerts.filter((alert) => !alert.readAt).length,
    active: state.positionAlerts.filter((alert) => alert.status !== "resolved").length,
    resolved: state.positionAlerts.filter((alert) => alert.status === "resolved").length,
    high: state.positionAlerts.filter((alert) => alert.status !== "resolved" && alert.severity === "high").length,
    medium: state.positionAlerts.filter((alert) => alert.status !== "resolved" && alert.severity === "medium").length,
    low: state.positionAlerts.filter((alert) => alert.status !== "resolved" && alert.severity === "low").length,
  };
}

function filteredPositionAlerts() {
  if (state.positionAlertFilter === "Unread") {
    return state.positionAlerts.filter((alert) => !alert.readAt);
  }
  if (state.positionAlertFilter === "Active") {
    return state.positionAlerts.filter((alert) => alert.status !== "resolved");
  }
  if (state.positionAlertFilter === "Resolved") {
    return state.positionAlerts.filter((alert) => alert.status === "resolved");
  }
  if (state.positionAlertFilter === "All") {
    return state.positionAlerts;
  }
  return state.positionAlerts.filter((alert) => alert.severity === state.positionAlertFilter);
}

function positionAlertsForSymbol(symbol) {
  const normalizedSymbol = String(symbol).toUpperCase();
  return state.positionAlerts.filter((alert) => alert.symbol === normalizedSymbol);
}

function alertPolicyRows() {
  const openPortfolio = portfolioEntries().filter((entry) => entry.positionStatus !== "closed");
  const watchtower = portfolioWatchtowerItems();
  const watchtowerBySymbol = new Map(watchtower.map((item) => [item.symbol, item]));
  const symbols = new Set([
    ...openPortfolio.map((entry) => entry.symbol),
    ...state.positionAlerts.map((alert) => alert.symbol),
    ...watchtower.map((item) => item.symbol),
    ...Object.keys(state.positionAlertPrefs.symbolPolicies || {}),
  ]);

  return [...symbols]
    .map((symbol) => {
      const alerts = positionAlertsForSymbol(symbol);
      const activeAlerts = alerts.filter((alert) => alert.status !== "resolved");
      const unreadAlerts = activeAlerts.filter((alert) => !alert.readAt);
      const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved");
      const openEntries = openPortfolio.filter((entry) => entry.symbol === symbol);
      const latestAlert = activeAlerts[0] || alerts[0] || null;
      const watchItem = watchtowerBySymbol.get(symbol) || null;
      const token = getToken(symbol);
      const mode = symbolAlertPolicy(symbol);
      const desktopFloor = desktopThresholdForSymbol(symbol);
      const snoozedUntil = snoozedUntilForSymbol(symbol);
      const headline =
        watchItem?.headline ||
        latestAlert?.headline ||
        (token ? `${symbol} 当前仍在机会引擎覆盖内` : `${symbol} 当前只保留本地提醒历史`);
      const detail =
        watchItem?.body ||
        latestAlert?.body ||
        (token?.warrant?.reasonChain?.[0] || "当前没有额外活跃提醒，规则只会在问题再次出现时介入。");

      return {
        symbol,
        token,
        lane: token?.warrant?.lane || latestAlert?.lane || openEntries[0]?.lane || "blocked",
        openCount: openEntries.length,
        unreadCount: unreadAlerts.length,
        activeCount: activeAlerts.length,
        resolvedCount: resolvedAlerts.length,
        latestAlert,
        watchItem,
        mode,
        reopenedReady: resolvedAlerts.length > 0,
        headline,
        detail,
        snoozedUntil,
        inboxFloorLabel: severityFloorLabel(inboxThresholdForSymbol(symbol)),
        desktopFloorLabel: desktopFloor ? severityFloorLabel(desktopFloor) : "Off",
      };
    })
    .sort((left, right) => {
      const severityDelta =
        (severityRank[right.latestAlert?.severity || right.watchItem?.severity || "low"] || 0) -
        (severityRank[left.latestAlert?.severity || left.watchItem?.severity || "low"] || 0);
      if (severityDelta !== 0) return severityDelta;
      const unreadDelta = right.unreadCount - left.unreadCount;
      if (unreadDelta !== 0) return unreadDelta;
      const activeDelta = right.activeCount - left.activeCount;
      if (activeDelta !== 0) return activeDelta;
      const policyDelta = Number(right.mode !== "global") - Number(left.mode !== "global");
      if (policyDelta !== 0) return policyDelta;
      const openDelta = right.openCount - left.openCount;
      if (openDelta !== 0) return openDelta;
      return left.symbol.localeCompare(right.symbol);
    });
}

function desktopNotificationTone(alert) {
  if (alert.lifecycle === "reopened") return "问题再次出现";
  if (alert.severity === "high") return "需要立刻处理";
  if (alert.severity === "medium") return "建议尽快复核";
  return "继续跟踪";
}

function isCriticalPositionAlert(alert) {
  return alert.actionKind === "close" || alert.statusLabel === "Net Edge Lost" || alert.severity === "high";
}

function notifyPositionAlerts(alerts) {
  if (!alerts.length) return;
  if (!state.positionAlertPrefs.desktopEnabled) return;
  if (!supportsBrowserNotifications()) return;
  if (browserNotificationPermission() !== "granted") return;

  alerts
    .filter((alert) => shouldSurfacePositionAlertOnDesktop(alert))
    .slice(0, 3)
    .forEach((alert) => {
      try {
        const notification = new Notification(`Goldlane · ${alert.symbol}`, {
          body: `${desktopNotificationTone(alert)} · ${alert.headline}`,
          tag: alert.key,
        });
        notification.onclick = () => {
          window.focus();
          state.selected = alert.symbol;
          markPositionAlertRead(alert.id);
          render();
        };
      } catch (error) {
        // Ignore notification delivery failures and keep the inbox intact.
      }
    });
}

function resolutionNoteForAlert(alert) {
  if (alert.status !== "resolved") return null;
  return alert.resolutionNote || "对应风险项已退出当前活跃问题列表。";
}

function syncPositionAlerts() {
  syncRecommendedPositionAlertPreset();
  const watchItems = portfolioWatchtowerItems();
  const actionableItems = watchItems.filter(
    (item) => shouldSurfacePositionAlertInInbox(item) && !isSymbolSnoozed(item.symbol),
  );
  const activeKeys = new Set(actionableItems.map((item) => buildPositionAlertKey(item)));
  const nowIso = new Date().toISOString();
  const previousAlerts = state.positionAlerts.slice();
  const newAlerts = [];

  state.positionAlerts = previousAlerts.map((alert) => {
    if (alert.status === "resolved") return alert;
    if (activeKeys.has(alert.key)) return alert;

    return {
      ...alert,
      status: "resolved",
      resolvedAt: nowIso,
      resolutionNote:
        alert.actionKind === "close"
          ? "这笔高风险 thesis 已经从当前 watchtower 消失，说明系统不再把它判为最紧急风险。"
          : "对应问题暂时解除，当前已经退出高优先组合提醒列表。",
    };
  });

  actionableItems.forEach((item) => {
    const key = buildPositionAlertKey(item);
    const existingActive = state.positionAlerts.find((alert) => alert.key === key && alert.status !== "resolved");

    if (existingActive) {
      state.positionAlerts = state.positionAlerts.map((alert) =>
        alert.id === existingActive.id
          ? {
              ...alert,
              headline: item.headline,
              body: item.body,
              severity: item.severity,
              lane: item.lane,
              statusLabel: item.statusLabel,
              actionKind: item.actionKind,
              actionLabel: item.actionLabel,
              markPnlUsd: item.markPnlUsd ?? null,
              liveNetPnlUsd: item.liveNetPnlUsd ?? null,
              edgeDriftPct: item.edgeDriftPct ?? null,
              holdLabel: item.holdLabel,
              ttlMinutes: item.ttlMinutes || 0,
            }
          : alert,
      );
      return;
    }

    const resolvedMatch = state.positionAlerts.find((alert) => alert.key === key && alert.status === "resolved");
    const mode = symbolAlertPolicy(item.symbol);
    if (mode === "reopened" && !resolvedMatch) {
      return;
    }
    const nextAlert = buildPositionAlert(item, {
      lifecycle: resolvedMatch ? "reopened" : "new",
      reopenedFromId: resolvedMatch?.id || null,
    });
    newAlerts.push(nextAlert);
  });

  if (!newAlerts.length && state.positionAlerts.length === previousAlerts.length) {
    const changed = state.positionAlerts.some((alert, index) => {
      const previous = previousAlerts[index];
      return JSON.stringify(alert) !== JSON.stringify(previous);
    });
    if (!changed) return;
  }

  state.positionAlerts = [...newAlerts, ...state.positionAlerts].slice(0, 80);
  savePositionAlerts();
  notifyPositionAlerts(newAlerts);
}

function markPositionAlertRead(alertId) {
  state.positionAlerts = state.positionAlerts.map((alert) =>
    alert.id === alertId && !alert.readAt ? { ...alert, readAt: new Date().toISOString() } : alert,
  );
  savePositionAlerts();
}

function dismissPositionAlert(alertId) {
  state.positionAlerts = state.positionAlerts.filter((alert) => alert.id !== alertId);
  savePositionAlerts();
}

function clearPositionAlerts() {
  state.positionAlerts = [];
  savePositionAlerts();
}

async function requestPositionAlertDesktopPermission(button) {
  if (!supportsBrowserNotifications()) {
    if (button) {
      const previous = button.textContent;
      button.textContent = "当前浏览器不支持";
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1200);
    }
    return;
  }

  const permission = await Notification.requestPermission();
  state.positionAlertPrefs.desktopEnabled = permission === "granted";
  savePositionAlertPrefs();
  renderPositionAlertPanel();
  renderSummary();
}

function toggleSymbolMute(symbol) {
  setSymbolAlertPolicy(symbol, isSymbolMuted(symbol) ? "global" : "mute");
}

function toggleSnoozeSymbol(symbol, hours = 2) {
  const normalizedSymbol = String(symbol).toUpperCase();
  const snoozes = { ...activeSnoozes() };

  if (snoozes[normalizedSymbol]) {
    delete snoozes[normalizedSymbol];
  } else {
    snoozes[normalizedSymbol] = new Date(Date.now() + hours * 60 * 60_000).toISOString();
    suppressAlertsForSymbol(
      normalizedSymbol,
      `你已将 ${normalizedSymbol} 静默到 ${replayTimestamp(snoozes[normalizedSymbol])}。`,
    );
  }

  state.positionAlertPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    snoozedUntilBySymbol: snoozes,
  });
  savePositionAlertPrefs();
  syncPositionAlerts();
  render();
}

function toggleSnoozeUntilReview(symbol) {
  const normalizedSymbol = String(symbol).toUpperCase();
  const snoozes = { ...activeSnoozes() };

  if (snoozes[normalizedSymbol]) {
    delete snoozes[normalizedSymbol];
  } else {
    snoozes[normalizedSymbol] = nextReviewIsoForSymbol(normalizedSymbol);
    suppressAlertsForSymbol(
      normalizedSymbol,
      `你已将 ${normalizedSymbol} 静默到下次复审 ${replayTimestamp(snoozes[normalizedSymbol])}。`,
    );
  }

  state.positionAlertPrefs = sanitizePositionAlertPrefs({
    ...state.positionAlertPrefs,
    snoozedUntilBySymbol: snoozes,
  });
  savePositionAlertPrefs();
  syncPositionAlerts();
  render();
}

function exportPortfolioMarkdown() {
  const entries = portfolioEntries();
  if (!entries.length) return "暂无 Portfolio 记录";

  return entries
    .map((entry) => {
      const token = getToken(entry.symbol);
      return `- ${entry.symbol} | ${entry.positionStatus === "closed" ? "Closed" : "Open"} | ${portfolioPhaseLabel(entry, token)} | Mark ${signedCompactUsd(portfolioMarkPnlUsd(entry, token))} | Live Net ${signedCompactUsd(portfolioLiveNetPnlUsd(entry, token))} | Hold ${portfolioHoldLabel(entry)}`;
    })
    .join("\n");
}

function updatePortfolioEntry(entryId, updater) {
  const index = state.journalEntries.findIndex((entry) => entry.id === entryId);
  if (index < 0) return;

  state.journalEntries = state.journalEntries
    .map((entry, entryIndex) => {
      if (entryIndex !== index) return entry;
      return normalizeJournalEntry(updater({ ...entry }));
    })
    .filter(Boolean);

  saveJournalEntries();
  syncPositionAlerts();
  render();
}

function closePortfolioEntry(entryId) {
  updatePortfolioEntry(entryId, (entry) => {
    const token = getToken(entry.symbol);
    return {
      ...entry,
      positionStatus: "closed",
      updatedAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
      closedPriceUsd: portfolioMarkPrice(entry, token),
      closedExpectedNetPnlUsd: portfolioLiveNetPnlUsd(entry, token),
      closeReason: portfolioNeedsReview(entry, token)
        ? `close-${(token?.warrant?.status || "review").toLowerCase()}`
        : "manual-close",
    };
  });
}

function reopenPortfolioEntry(entryId) {
  updatePortfolioEntry(entryId, (entry) => ({
    ...entry,
    positionStatus: "open",
    updatedAt: new Date().toISOString(),
    closedAt: null,
    closedPriceUsd: null,
    closedExpectedNetPnlUsd: null,
    closeReason: null,
  }));
}

function replayTrendSummary(token) {
  const replay = opportunityReplay(token);
  if (replay.length < 2) {
    return {
      label: "Waiting for Replay",
      tone: "muted",
      pnlDeltaUsd: 0,
      scoreDelta: 0,
      edgeDeltaPct: 0,
    };
  }

  const first = replay[0];
  const last = replay[replay.length - 1];
  const pnlDeltaUsd = Number((Number(last.expectedNetPnlUsd || 0) - Number(first.expectedNetPnlUsd || 0)).toFixed(2));
  const scoreDelta = Number((Number(last.score || 0) - Number(first.score || 0)).toFixed(0));
  const edgeDeltaPct = Number((Number(last.netEdgePct || 0) - Number(first.netEdgePct || 0)).toFixed(2));

  if (last.status === "Revoked" || pnlDeltaUsd <= -6 || edgeDeltaPct <= -0.18) {
    return { label: "Window Decaying", tone: "revoked", pnlDeltaUsd, scoreDelta, edgeDeltaPct };
  }
  if (last.status === "Approved" && pnlDeltaUsd >= 4) {
    return { label: "Window Expanding", tone: "approved", pnlDeltaUsd, scoreDelta, edgeDeltaPct };
  }
  if (scoreDelta >= 8 || edgeDeltaPct >= 0.12) {
    return { label: "Pressure Building", tone: "deferred", pnlDeltaUsd, scoreDelta, edgeDeltaPct };
  }
  return { label: "Structure Stable", tone: "muted", pnlDeltaUsd, scoreDelta, edgeDeltaPct };
}

function replayChartSvg(token) {
  const replay = opportunityReplay(token);
  if (replay.length < 2) return "";

  const width = 320;
  const height = 128;
  const paddingX = 18;
  const paddingY = 16;
  const values = replay.map((snapshot) => Number(snapshot.expectedNetPnlUsd || 0));
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const range = maxValue - minValue || 1;
  const stepX = replay.length > 1 ? (width - paddingX * 2) / (replay.length - 1) : 0;
  const yFor = (value) => {
    const ratio = (value - minValue) / range;
    return Number((height - paddingY - ratio * (height - paddingY * 2)).toFixed(2));
  };
  const xFor = (index) => Number((paddingX + stepX * index).toFixed(2));
  const baselineY = yFor(0);
  const linePath = replay
    .map((snapshot, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(Number(snapshot.expectedNetPnlUsd || 0))}`)
    .join(" ");
  const areaPath = `${linePath} L ${xFor(replay.length - 1)} ${baselineY} L ${xFor(0)} ${baselineY} Z`;

  return `
    <svg class="replay-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Opportunity replay chart">
      <line class="replay-baseline" x1="${paddingX}" y1="${baselineY}" x2="${width - paddingX}" y2="${baselineY}"></line>
      <path class="replay-area" d="${areaPath}"></path>
      <path class="replay-line" d="${linePath}"></path>
      ${replay
        .map((snapshot, index) => {
          const x = xFor(index);
          const y = yFor(Number(snapshot.expectedNetPnlUsd || 0));
          return `<circle class="replay-dot" cx="${x}" cy="${y}" r="3.4"><title>${replayTimestamp(snapshot.generatedAt)} · ${signedCompactUsd(snapshot.expectedNetPnlUsd)}</title></circle>`;
        })
        .join("")}
    </svg>
  `;
}

function executionBrief(token) {
  if (token?.executionBrief) return token.executionBrief;

  const status = token?.warrant?.status || "Deferred";
  const netPnl = opportunityExpectedNetPnlUsd(token);
  const netEdge = executableEdgePct(token);
  const costEdge = Number((rawEdgePct(token) - netEdge).toFixed(2));
  const size = opportunitySuggestedNotionalUsd(token);

  let posture = "Watch Tight";
  let primaryAction = "继续观察，等待更好的利润空间或确认度。";
  let summary = `当前净边际 ${pct(netEdge)}，预估净收益 ${signedCompactUsd(netPnl)}。`;

  if (status === "Approved") {
    posture = "Act Now";
    primaryAction = `按 ${token?.warrant?.riskBudgetPct || 0}% 风险预算，优先走 ${laneLabel(token?.warrant?.lane)}。`;
  } else if (status === "Revoked") {
    posture = "Avoid";
    primaryAction = "把它当成伪机会处理，不要继续找进场理由。";
  } else if (status === "Rejected") {
    posture = "Skip";
    primaryAction = "直接跳过，把注意力留给更干净的窗口。";
  }

  return {
    posture,
    primaryAction,
    summary,
    breakEvenEdgePct: costEdge,
    roomAfterCostPct: netEdge,
    rewardCostRatio: costEdge > 0 ? Number((Math.max(rawEdgePct(token), 0) / costEdge).toFixed(2)) : null,
    capitalAtRiskUsd: Number(((size * Math.max(costEdge, 0)) / 100).toFixed(2)),
    expectedNetPnlUsd: netPnl,
    checklist: [...(token?.opportunity?.whyNow || []), ...(token?.warrant?.reasonChain || [])].slice(0, 3),
    killSwitch: (token?.warrant?.invalidationRules || []).slice(0, 2),
    nextReview: (token?.warrant?.recheckTriggers || []).slice(0, 2),
  };
}

function executionBriefTone(brief) {
  if (brief?.posture === "Act Now") return "approved";
  if (brief?.posture === "Watch Tight") return "deferred";
  if (brief?.posture === "Avoid") return "revoked";
  return "muted";
}

function postmortem(token) {
  if (token?.postmortem) return token.postmortem;
  const status = token?.warrant?.status || "Deferred";
  if (status === "Approved") return null;

  const replay = opportunityReplay(token);
  const previousStatus = replay.at(-2)?.status || null;
  const brief = executionBrief(token);

  let kind = "no-edge";
  let headline = `${token?.symbol} 当前不值得继续做`;
  let rootCause = "当前利润空间、执行性或质量至少有一项已经掉出可执行区。";
  let lesson = "不要让不再成立的 thesis 占用注意力。";
  let nextScreen = token?.warrant?.recheckTriggers?.[0] || "等待更强的结构变化后再审。";

  if (previousStatus === "Approved" && status !== "Approved") {
    kind = "window-lost";
    headline = `${token?.symbol} 的可执行窗口已经失效`;
    rootCause = `它曾经是 Approved，但现在已经掉到 ${status}。`;
    lesson = "机会失效时先做退出判断，不要继续追旧逻辑。";
  } else if (token?.venueMismatch) {
    kind = "broken-market";
    headline = `${token?.symbol} 不是套利，是坏市场`;
    rootCause = `链上与 Binance 价格存在 ${token?.mismatchRatio?.toFixed?.(1) || token?.mismatchRatio || "多倍"} 断层。`;
    lesson = "先怀疑市场质量，再怀疑自己错过了机会。";
  } else if (token?.riskFlags?.includes("spot_book_off") || token?.riskFlags?.includes("futures_inactive")) {
    kind = "lane-dead";
    headline = `${token?.symbol} 的执行通道已经失效`;
    rootCause = "关键执行 lane 已经坏掉，原本的交易路径不再成立。";
    lesson = "没有执行通道的机会，不是机会。";
  } else if (opportunityExpectedNetPnlUsd(token) <= 0 && rawEdgePct(token) > 0) {
    kind = "cost-overrun";
    headline = `${token?.symbol} 的毛边际被成本吃掉了`;
    rootCause = `看起来还有 ${pct(rawEdgePct(token))} 的毛边际，但净收益已经变成 ${signedCompactUsd(opportunityExpectedNetPnlUsd(token))}。`;
    lesson = "永远看净边际，不看毛边际。";
  }

  return {
    kind,
    headline,
    rootCause,
    lesson,
    nextScreen,
    avoidedLossUsd: Math.max(Math.abs(Math.min(opportunityExpectedNetPnlUsd(token), 0)), brief.capitalAtRiskUsd || 0),
    previousStatus,
    currentStatus: status,
    lane: token?.warrant?.lane || "blocked",
    score: opportunityScore(token),
  };
}

function edgeChipLabel(token) {
  if (token?.opportunity?.netEdgePct != null) return "Net Edge";
  const lane = token?.warrant?.lane;
  if (lane === "basis") return "Basis Edge";
  if (lane === "futures") return "Momentum Edge";
  if (lane === "spot") return "Spot Edge";
  if (lane === "research") return "Watch Edge";
  return "False Edge";
}

function opportunityScore(token) {
  if (token?.opportunity?.score != null) return Number(token.opportunity.score);
  const executableEdge = executableEdgePct(token);
  const rawEdge = rawEdgePct(token);
  const statusBonus =
    token.warrant?.status === "Approved"
      ? 14
      : token.warrant?.status === "Deferred"
        ? 4
        : token.warrant?.status === "Revoked"
          ? -18
          : -12;

  const score =
    (token.warrant?.fitScore || 0) * 0.58 +
    Math.min(executableEdge * 18, 24) +
    Math.min(rawEdge * 0.08, 8) +
    statusBonus -
    (token.warrant?.fragilityScore || 0) * 0.18 -
    (token.auditRisk || 0) * 0.08;

  return clamp(Math.round(score), 0, 100);
}

function laneLabel(lane) {
  if (lane === "basis") return "Basis Capture";
  if (lane === "futures") return "Futures Follow";
  if (lane === "spot") return "Spot Capture";
  if (lane === "research") return "Watch Setup";
  return "No Trade";
}

function opportunityStateLabel(token) {
  if (token?.opportunity?.band) return token.opportunity.band;
  const status = token?.warrant?.status;
  if (status === "Approved") return "Actionable Now";
  if (status === "Deferred") return "Building";
  if (status === "Revoked") return "False Setup";
  return "Skip";
}

function opportunityHeadline(token) {
  const liveEdge = executableEdgePct(token);
  const rawEdge = rawEdgePct(token);
  const lane = laneLabel(token?.warrant?.lane);

  if (token?.warrant?.status === "Approved") {
    return `现在能做，优先走 ${lane}，当前净边际 ${pct(liveEdge)}。`;
  }
  if (token?.warrant?.status === "Deferred") {
    return `先盯住，当前窗口 ${pct(rawEdge)}，但还没到出手时点。`;
  }
  if (token?.warrant?.status === "Revoked") {
    return `别碰，表面边际 ${pct(rawEdge)}，但这更像假机会或坏市场。`;
  }
  return `跳过，当前利润空间不值得占用仓位和注意力。`;
}

function opportunityExplain(token) {
  if (token?.opportunity?.whyNow?.length) {
    return token.opportunity.whyNow[0];
  }
  if (token?.warrant?.status === "Approved") {
    return `机会分 ${opportunityScore(token)}，fit ${Math.round(token.warrant?.fitScore || 0)}，fragility ${Math.round(token.warrant?.fragilityScore || 0)}。`;
  }
  if (token?.warrant?.status === "Deferred") {
    return `继续等 edge、flow 或 narrative 进一步确认，再决定是否把它升到可执行机会。`;
  }
  if (token?.warrant?.status === "Revoked") {
    return `这是典型的“看起来很大，但做不了”的窗口，系统优先保护你不踩坑。`;
  }
  return `系统已判断这不是当前应该做的机会，把注意力留给更干净的窗口。`;
}

function dataStatusClass(status) {
  if (status === "ok" || status === "live") return "live";
  if (status === "stale" || status === "degraded") return "warn";
  if (status === "error") return "error";
  return "muted";
}

function shiftDirectionLabel(direction) {
  if (direction === "up") return "Shift Up";
  if (direction === "down") return "Shift Down";
  if (direction === "fresh") return "Fresh Scan";
  return "Stable";
}

function alertSeverityLabel(severity) {
  if (severity === "high") return "Act Now";
  if (severity === "medium") return "Watch Tight";
  return "Review Soon";
}

function postmortemKindLabel(kind) {
  if (kind === "window-lost") return "Window Lost";
  if (kind === "broken-market") return "Broken Market";
  if (kind === "lane-dead") return "Lane Dead";
  if (kind === "risk-gated") return "Risk Gated";
  if (kind === "cost-overrun") return "Cost Overrun";
  return "No Edge";
}

function filteredAlerts() {
  const items = (state.overview.alertFeed || [])
    .map((item) => ({
      ...item,
      token: getToken(item.symbol),
    }))
    .filter((item) => item.token);

  if (state.alertSeverityFilter === "All") return items;
  return items.filter((item) => item.severity === state.alertSeverityFilter);
}

function verdictClass(status) {
  if (status === "Approved") return "approved";
  if (status === "Deferred") return "deferred";
  if (status === "Revoked") return "revoked";
  return "rejected";
}

function laneClass(lane) {
  if (lane === "basis") return "basis";
  if (lane === "spot") return "spot";
  if (lane === "futures") return "futures";
  if (lane === "research") return "research";
  return "blocked";
}

function getToken(symbol) {
  return state.overview.tokens.find((token) => token.symbol === symbol);
}

function cloneMandateSettings(settings = {}) {
  return {
    ...fallbackOverview.userMandate.settings,
    ...(settings || {}),
  };
}

function mandateSettingsDiffer(left, right) {
  const normalizedLeft = cloneMandateSettings(left);
  const normalizedRight = cloneMandateSettings(right);
  return Object.keys(normalizedLeft).some((key) => normalizedLeft[key] !== normalizedRight[key]);
}

function streamSupported() {
  return typeof window !== "undefined" && typeof window.EventSource !== "undefined";
}

function serializeMandateParams(mandate) {
  const params = new URLSearchParams();
  Object.entries(cloneMandateSettings(mandate)).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  return params;
}

function buildLiveUrl(path, mandate, { force = false } = {}) {
  const params = serializeMandateParams(mandate);
  if (force) {
    params.set("force", "true");
  }
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

function symbolsToTokens(symbols) {
  return (symbols || []).map((symbol) => getToken(symbol)).filter(Boolean);
}

function deriveDesk(type) {
  if (type === "approved") {
    return state.overview.tokens.filter((token) => token.warrant?.status === "Approved").slice(0, 3);
  }
  if (type === "rejected") {
    return state.overview.tokens
      .filter((token) => ["Rejected", "Revoked"].includes(token.warrant?.status))
      .sort((left, right) => (right.warrant?.fragilityScore || 0) - (left.warrant?.fragilityScore || 0))
      .slice(0, 3);
  }
  return state.overview.tokens
    .filter((token) => ["Approved", "Deferred", "Revoked"].includes(token.warrant?.status))
    .sort((left, right) => (right.warrant?.reviewPriority || 0) - (left.warrant?.reviewPriority || 0))
    .slice(0, 4);
}

function filteredTokens() {
  return state.overview.tokens
    .filter((token) => (token.auditRisk || 0) <= state.riskLimit)
    .filter((token) => (token.warrant?.fitScore || 0) >= state.fitFloor)
    .filter((token) => (state.approvalOnly ? token.warrant?.status === "Approved" : true))
    .filter((token) => (state.verdictFilter === "All" ? true : token.warrant?.status === state.verdictFilter))
    .sort((left, right) => {
      const verdictOrder = ["Approved", "Deferred", "Revoked", "Rejected"];
      const rankDelta = verdictOrder.indexOf(left.warrant?.status) - verdictOrder.indexOf(right.warrant?.status);
      if (rankDelta !== 0) return rankDelta;
      return opportunityScore(right) - opportunityScore(left);
    });
}

function ensureSelection(list) {
  if (!list.some((token) => token.symbol === state.selected)) {
    state.selected = list[0]?.symbol || state.overview.tokens[0]?.symbol || "";
  }
}

function populateSymbolList() {
  dom.symbolList.innerHTML = "";
  state.overview.tokens.forEach((token) => {
    const option = document.createElement("option");
    option.value = token.symbol;
    option.label = token.name;
    dom.symbolList.appendChild(option);
  });
}

function applyOverviewPayload(payload) {
  const draftDirty = mandateSettingsDiffer(state.mandateDraft, state.activeMandate);
  state.overview = payload;
  state.activeMandate = cloneMandateSettings(payload.userMandate?.settings);

  if (payload.binanceConfig) {
    state.binanceSettings = {
      ...state.binanceSettings,
      configured: Boolean(payload.binanceConfig.configured),
      keyPreview: payload.binanceConfig.keyPreview || state.binanceSettings.keyPreview,
      spotBaseUrl: payload.binanceConfig.spotBaseUrl || state.binanceSettings.spotBaseUrl,
      futuresBaseUrl: payload.binanceConfig.futuresBaseUrl || state.binanceSettings.futuresBaseUrl,
      validation: payload.binanceConfig.validation || state.binanceSettings.validation,
      form: {
        ...state.binanceSettings.form,
        spotBaseUrl: payload.binanceConfig.spotBaseUrl || state.binanceSettings.form.spotBaseUrl,
        futuresBaseUrl: payload.binanceConfig.futuresBaseUrl || state.binanceSettings.form.futuresBaseUrl,
      },
    };
  }

  if (!draftDirty) {
    state.mandateDraft = cloneMandateSettings(payload.userMandate?.settings);
    state.quickCheckToken = null;
    state.quickCheckMeta = null;
    state.quickCheckError = null;
  }

  syncPositionAlerts();
  state.error = null;
}

function disconnectLiveStream({ keepHeartbeat = false } = {}) {
  if (state.streamSource) {
    state.streamSource.close();
    state.streamSource = null;
  }

  if (!keepHeartbeat) {
    state.streamLastEventAt = null;
  }
}

function streamBadgeMeta() {
  const lastEventText = state.streamLastEventAt
    ? new Date(state.streamLastEventAt).toLocaleTimeString("zh-CN", { hour12: false })
    : null;

  if (!streamSupported()) {
    return {
      tone: "muted",
      text: "Poll Only",
    };
  }

  if (state.streamStatus === "live") {
    return {
      tone: "live",
      text: lastEventText ? `SSE Live · ${lastEventText}` : "SSE Live",
    };
  }

  if (state.streamStatus === "connecting") {
    return {
      tone: "warn",
      text: "SSE Connecting",
    };
  }

  if (state.streamStatus === "reconnecting") {
    return {
      tone: "warn",
      text: lastEventText ? `SSE Reconnecting · Last ${lastEventText}` : "SSE Reconnecting",
    };
  }

  if (state.streamStatus === "fallback") {
    return {
      tone: "muted",
      text: "Poll Fallback",
    };
  }

  return {
    tone: "muted",
    text: "Stream Idle",
  };
}

function renderTopbar() {
  const mode = state.overview.mode || "demo-fallback";
  const modeClass =
    mode === "live"
      ? "live"
      : mode === "degraded" || mode === "stale-fallback"
        ? "warn"
        : mode === "demo-fallback"
          ? "muted"
          : "error";
  dom.modeBadge.className = `pill ${modeClass}`;
  dom.modeBadge.textContent =
    mode === "live"
      ? "Live Opportunities"
      : mode === "degraded"
        ? "Degraded Opportunities"
        : mode === "stale-fallback"
          ? "Stale Snapshot"
          : mode === "demo-fallback"
            ? "Demo Snapshot"
            : "Sync Error";

  const streamMeta = streamBadgeMeta();
  dom.streamBadge.className = `pill ${streamMeta.tone}`;
  dom.streamBadge.textContent = streamMeta.text;

  const generatedAt = state.overview.generatedAt ? new Date(state.overview.generatedAt) : null;
  dom.updateBadge.className = `pill ${state.error ? "error" : state.loading ? "warn" : "muted"}`;
  dom.updateBadge.textContent = state.error
    ? "同步失败，显示回退机会样本"
    : mode === "stale-fallback"
      ? `实时源暂不可用，显示 ${generatedAt ? generatedAt.toLocaleTimeString("zh-CN", { hour12: false }) : "--"} 快照`
    : generatedAt
      ? `${state.loading ? "同步中" : "Updated"} ${generatedAt.toLocaleTimeString("zh-CN", { hour12: false })}`
      : "等待首轮同步";

  const { fearGreedValue, fearGreedClass, regime } = state.overview.marketContext || {};
  dom.regimeBadge.className = `pill ${fearGreedValue != null ? "live" : "muted"}`;
  dom.regimeBadge.textContent =
    fearGreedValue != null ? `FG ${fearGreedValue} · ${fearGreedClass || regime}` : `Regime ${regime || "--"}`;
}

function renderSummary() {
  const summary = state.overview.approvalSummary || {};
  const approvedTop = symbolsToTokens(state.overview.desk?.approved)[0] || state.overview.tokens.find((token) => token.warrant?.status === "Approved");
  const approvedTokens = state.overview.tokens.filter((token) => token.warrant?.status === "Approved");
  const avgExpectedNetPnl = approvedTokens.length
    ? approvedTokens.reduce((sum, token) => sum + opportunityExpectedNetPnlUsd(token), 0) / approvedTokens.length
    : 0;
  const liveAlerts = state.overview.alertFeed || [];
  const openPortfolio = portfolioEntries().filter((entry) => entry.positionStatus !== "closed");
  const openPortfolioMark = openPortfolio.reduce(
    (sum, entry) => sum + Number(portfolioMarkPnlUsd(entry, getToken(entry.symbol)) || 0),
    0,
  );
  const reviewPortfolioCount = openPortfolio.filter((entry) => portfolioNeedsReview(entry, getToken(entry.symbol))).length;

  const cards = [
    {
      label: "现在该看",
      value: approvedTop?.symbol || "--",
      note: approvedTop
        ? `${laneLabel(approvedTop.warrant?.lane)} · 净边际 ${pct(executableEdgePct(approvedTop))}`
        : "当前没有通过过滤器的机会",
      tone: "approved",
    },
    {
      label: "可执行",
      value: summary.approved ?? 0,
      note: approvedTokens.length
        ? `按当前资金规模估算，平均净收益 ${signedCompactUsd(avgExpectedNetPnl)}`
        : "当前没有处于可执行区的窗口",
      tone: "deferred",
    },
    {
      label: "别碰",
      value: (summary.revoked ?? 0) + (summary.rejected ?? 0),
      note: "这些是系统主动替你拦下的伪机会和坏市场",
      tone: "revoked",
    },
    {
      label: "我的组合",
      value: openPortfolio.length,
      note: openPortfolio.length
        ? `浮动 ${signedCompactUsd(openPortfolioMark)} · ${reviewPortfolioCount} 笔待复审`
        : liveAlerts[0]?.headline || "还没有建立自己的观察组合",
      tone: reviewPortfolioCount ? "deferred" : openPortfolio.length ? "approved" : "muted",
    },
  ];

  dom.summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card ${card.tone}">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <p>${card.note}</p>
        </article>
      `,
    )
    .join("");
}

function renderHeroSpotlight() {
  if (!dom.heroSpotlight) return;

  const bestToken =
    symbolsToTokens(state.overview.desk?.approved)[0] ||
    [...state.overview.tokens].sort((left, right) => opportunityScore(right) - opportunityScore(left))[0];

  if (!bestToken) {
    dom.heroSpotlight.innerHTML = `<div class="empty-card">等待首轮机会扫描。</div>`;
    return;
  }

  const brief = bestToken.executionBrief || {};
  const whyNow = (bestToken.opportunity?.whyNow || []).slice(0, 2);

  dom.heroSpotlight.innerHTML = `
    <div class="hero-spotlight-card ${verdictClass(bestToken.warrant?.status)}" data-symbol="${bestToken.symbol}">
      <div class="hero-spotlight-head">
        <div>
          <span class="eyebrow">Opportunity Spotlight</span>
          <strong>${bestToken.symbol}</strong>
          <p>${bestToken.name}</p>
        </div>
        <span class="status-pill ${verdictClass(bestToken.warrant?.status)}">${verdictLabels[bestToken.warrant?.status] || bestToken.warrant?.status}</span>
      </div>
      <div class="hero-spotlight-metrics">
        <div class="metric-card">
          <span>Lane</span>
          <strong>${laneLabel(bestToken.warrant?.lane)}</strong>
        </div>
        <div class="metric-card">
          <span>Net Edge</span>
          <strong>${pct(executableEdgePct(bestToken))}</strong>
        </div>
        <div class="metric-card">
          <span>Est Net</span>
          <strong>${signedCompactUsd(opportunityExpectedNetPnlUsd(bestToken))}</strong>
        </div>
      </div>
      <div class="spotlight-brief">
        <p class="spotlight-summary">${brief.summary || bestToken.signalNote}</p>
        <div class="bullet-list">
          ${whyNow.map((item) => `<div class="bullet-item">${item}</div>`).join("")}
        </div>
      </div>
      <div class="hero-lane-row">
        <span class="hero-lane-pill">${brief.posture || "Watch"}</span>
        <span class="hero-lane-pill">${compactMinutes(bestToken.warrant?.ttlMinutes || 0)}</span>
        <span class="hero-lane-pill">${bestToken.opportunity?.band || "Opportunity"}</span>
      </div>
    </div>
  `;

  dom.heroSpotlight.querySelector("[data-symbol]")?.addEventListener("click", () => {
    state.selected = bestToken.symbol;
    render();
  });
}

function renderCommandDeck() {
  const deck = commandDeckBrief();

  dom.commandDeckPanel.innerHTML = `
    <div class="brief-card ${deck.tone}">
      <div class="brief-head">
        <div>
          <strong>${deck.title}</strong>
          <p>${deck.summaryText}</p>
        </div>
        <span class="status-pill ${deck.tone}">今日重点</span>
      </div>
      <div class="tag-row">
        <span class="tag">Actionable ${deck.metrics.actionable}</span>
        <span class="tag">Fake ${deck.metrics.fakeCount}</span>
        <span class="tag">High Risk ${deck.metrics.highRiskCount}</span>
        <span class="tag">${deck.metrics.regime}</span>
      </div>
      <div class="action-row">
        <button id="commandDeckFocus" class="action-button" ${deck.primaryFocus ? "" : "disabled"}>聚焦首要任务</button>
      </div>
    </div>
    <div class="command-deck-grid">
      ${deck.cards
        .map(
          (card) => `
            <article class="review-card ${card.tone}" data-command-focus="${card.symbol}">
              <div class="review-head">
                <strong>${card.title}</strong>
                <span class="status-pill ${card.tone === "muted" ? "deferred" : card.tone}">${card.symbol || "Queue"}</span>
              </div>
              <p>${card.body}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;

  document.getElementById("commandDeckFocus")?.addEventListener("click", () => {
    if (!deck.primaryFocus) return;
    state.selected = deck.primaryFocus;
    render();
  });

  dom.commandDeckPanel.querySelectorAll("[data-command-focus]").forEach((item) => {
    item.addEventListener("click", () => {
      if (!item.dataset.commandFocus) return;
      state.selected = item.dataset.commandFocus;
      render();
    });
  });
}

function renderRegimeOpsPanel() {
  const briefing = regimeOpsBrief();

  dom.regimeOpsPanel.innerHTML = `
    <div class="brief-card ${briefing.tone}">
      <div class="brief-head">
        <div>
          <strong>${briefing.title}</strong>
          <p>${briefing.summaryText}</p>
        </div>
        <span class="status-pill ${briefing.tone}">${positionAlertPresetLabel(briefing.recommended.name)}</span>
      </div>
      <div class="tag-row">
        <span class="tag">Current ${positionAlertPresetLabel(briefing.currentPreset)}</span>
        <span class="tag">Suggested ${positionAlertPresetLabel(briefing.recommended.name)}</span>
        <span class="tag">${briefing.autoFollow ? "Auto Follow On" : "Auto Follow Off"}</span>
      </div>
      <div class="brief-grid">
        <div class="metric-card">
          <span>Regime</span>
          <strong>${briefing.metrics.regime}</strong>
        </div>
        <div class="metric-card">
          <span>Fear & Greed</span>
          <strong>${briefing.metrics.fearGreed}</strong>
        </div>
        <div class="metric-card">
          <span>Actionable</span>
          <strong>${briefing.metrics.approvedCount}</strong>
        </div>
        <div class="metric-card">
          <span>Fake Ratio</span>
          <strong>${briefing.metrics.fakeRatioPct}%</strong>
        </div>
        <div class="metric-card">
          <span>Pressure</span>
          <strong>${briefing.metrics.pressureScore}</strong>
        </div>
        <div class="metric-card">
          <span>Why Preset</span>
          <strong>${briefing.recommended.headline}</strong>
        </div>
      </div>
      <div class="action-row">
        <button id="regimeApplySuggested" class="action-button" ${
          briefing.currentPreset === briefing.recommended.name && !briefing.autoFollow ? "disabled" : ""
        }>使用市场建议</button>
        <button id="regimeToggleAutoFollow" class="secondary-button">${
          briefing.autoFollow ? "关闭自动跟随" : "自动跟随建议"
        }</button>
      </div>
      <div class="brief-columns">
        <div class="brief-column">
          <span class="field-label">Operate Now</span>
          <div class="bullet-list">
            ${briefing.operateNow.map((item) => `<div class="bullet-item">${item}</div>`).join("")}
          </div>
        </div>
        <div class="brief-column">
          <span class="field-label">Pull Back</span>
          <div class="bullet-list">
            ${briefing.pullBack.map((item) => `<div class="bullet-item">${item}</div>`).join("")}
          </div>
        </div>
        <div class="brief-column">
          <span class="field-label">Review First</span>
          <div class="bullet-list">
            ${briefing.reviewFirst.map((item) => `<div class="bullet-item">${item}</div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("regimeApplySuggested")?.addEventListener("click", () => {
    applyPositionAlertPreset(briefing.recommended.name);
  });

  document.getElementById("regimeToggleAutoFollow")?.addEventListener("click", () => {
    toggleAutoFollowRecommendedPreset();
  });
}

function renderMandate() {
  const mandate = state.overview.userMandate || fallbackOverview.userMandate;
  const draft = cloneMandateSettings(state.mandateDraft);
  const applied = cloneMandateSettings(state.activeMandate);
  const defaults = cloneMandateSettings(fallbackOverview.userMandate.settings);
  const draftDirty = mandateSettingsDiffer(draft, applied);
  const canReset = mandateSettingsDiffer(draft, defaults) || mandateSettingsDiffer(applied, defaults);
  const laneNotes = [];

  if (!applied.allowFutures) laneNotes.push("Futures Off");
  if (!applied.allowBasis) laneNotes.push("Basis Off");
  if (!applied.allowResearch) laneNotes.push("Research Off");

  dom.mandateCard.innerHTML = `
    <div class="mandate-head">
      <strong>${mandate.name}</strong>
      <span class="pill ${draftDirty ? "warn" : "live"}">${draftDirty ? "Draft Pending" : "Applied"}</span>
    </div>
    <p>${mandate.desc}</p>
    <div class="mandate-grid">
      <div>
        <span class="field-label">Principles</span>
        <div class="tag-row">
          ${(mandate.principles || []).map((item) => `<span class="tag">${item}</span>`).join("")}
        </div>
      </div>
      <div>
        <span class="field-label">Guardrails</span>
        <div class="tag-row">
          ${(mandate.guardrails || []).map((item) => `<span class="tag">${item}</span>`).join("")}
        </div>
      </div>
      <div class="mandate-status-row">
        <span class="tag">Applied Fit ≥ ${applied.minFitApprove}</span>
        <span class="tag">Fragility ≤ ${applied.maxFragilityApprove}</span>
        <span class="tag">Audit ≤ ${applied.maxAuditRisk}</span>
        <span class="tag">Budget ≤ ${applied.maxRiskBudgetPct}%</span>
        <span class="tag">Capital ${compactUsd(applied.referenceCapitalUsd)}</span>
        <span class="tag">${laneNotes.length ? laneNotes.join(" · ") : "All Lanes Open"}</span>
      </div>
      <div class="mandate-controls">
        <div class="mini-control-grid">
          <label class="mini-control">
            <span>Approve Fit</span>
            <strong>${draft.minFitApprove}</strong>
            <input id="mandateMinFit" type="range" min="30" max="90" value="${draft.minFitApprove}" />
          </label>
          <label class="mini-control">
            <span>Max Fragility</span>
            <strong>${draft.maxFragilityApprove}</strong>
            <input id="mandateMaxFragility" type="range" min="20" max="90" value="${draft.maxFragilityApprove}" />
          </label>
          <label class="mini-control">
            <span>Max Audit Risk</span>
            <strong>${draft.maxAuditRisk}</strong>
            <input id="mandateMaxAudit" type="range" min="30" max="95" value="${draft.maxAuditRisk}" />
          </label>
          <label class="mini-control">
            <span>Budget Cap</span>
            <strong>${draft.maxRiskBudgetPct}%</strong>
            <input id="mandateBudgetCap" type="range" min="5" max="40" value="${draft.maxRiskBudgetPct}" />
          </label>
          <label class="mini-control">
            <span>Reference Capital</span>
            <strong>${compactUsd(draft.referenceCapitalUsd)}</strong>
            <input id="mandateReferenceCapital" type="number" min="1000" max="500000" step="1000" value="${draft.referenceCapitalUsd}" />
          </label>
        </div>
        <div class="mini-toggle-row">
          <label class="mini-toggle">
            <span>Allow Futures</span>
            <input id="mandateAllowFutures" type="checkbox" ${draft.allowFutures ? "checked" : ""} />
          </label>
          <label class="mini-toggle">
            <span>Allow Basis</span>
            <input id="mandateAllowBasis" type="checkbox" ${draft.allowBasis ? "checked" : ""} />
          </label>
          <label class="mini-toggle">
            <span>Allow Research</span>
            <input id="mandateAllowResearch" type="checkbox" ${draft.allowResearch ? "checked" : ""} />
          </label>
        </div>
        <div class="mandate-actions">
          <button id="applyMandateButton" class="action-button" ${draftDirty ? "" : "disabled"}>应用 Mandate</button>
          <button id="resetMandateButton" class="secondary-button" ${canReset ? "" : "disabled"}>恢复默认</button>
        </div>
      </div>
    </div>
  `;

  const bindRange = (id, key, formatter = (value) => value) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", (event) => {
      state.mandateDraft[key] = Number(event.target.value);
      renderMandate();
    });
  };

  bindRange("mandateMinFit", "minFitApprove");
  bindRange("mandateMaxFragility", "maxFragilityApprove");
  bindRange("mandateMaxAudit", "maxAuditRisk");
  bindRange("mandateBudgetCap", "maxRiskBudgetPct");

  const referenceCapitalInput = document.getElementById("mandateReferenceCapital");
  referenceCapitalInput?.addEventListener("input", (event) => {
    state.mandateDraft.referenceCapitalUsd = Number(event.target.value);
    renderMandate();
  });

  const bindToggle = (id, key) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("change", (event) => {
      state.mandateDraft[key] = event.target.checked;
    });
  };

  bindToggle("mandateAllowFutures", "allowFutures");
  bindToggle("mandateAllowBasis", "allowBasis");
  bindToggle("mandateAllowResearch", "allowResearch");

  const applyMandateButton = document.getElementById("applyMandateButton");
  const resetMandateButton = document.getElementById("resetMandateButton");

  applyMandateButton?.addEventListener("click", () => {
    state.activeMandate = cloneMandateSettings(state.mandateDraft);
    state.quickCheckToken = null;
    state.quickCheckMeta = null;
    state.quickCheckError = null;
    startRealtimeSync({ force: true });
  });

  resetMandateButton?.addEventListener("click", () => {
    const resetSettings = cloneMandateSettings(fallbackOverview.userMandate.settings);
    state.mandateDraft = resetSettings;
    state.activeMandate = resetSettings;
    state.quickCheckToken = null;
    state.quickCheckMeta = null;
    state.quickCheckError = null;
    startRealtimeSync({ force: true });
  });
}

function binanceValidationTone(status) {
  if (status === "ok") return "live";
  if (status === "partial") return "warn";
  if (status === "error") return "error";
  return "muted";
}

function renderBinanceApiPanel() {
  const settings = state.binanceSettings;
  const validation = settings.validation || {};
  const tone = binanceValidationTone(validation.status);
  const hasDraftKey = Boolean((settings.form.apiKey || "").trim());
  const hasDraftSecret = Boolean((settings.form.apiSecret || "").trim());
  const saveDisabled =
    settings.saving ||
    ((hasDraftKey && !hasDraftSecret && !settings.configured) || (hasDraftSecret && !hasDraftKey && !settings.configured));

  dom.binanceApiPanel.innerHTML = `
    <div class="section-head compact-head">
      <div>
        <p class="eyebrow">Binance API</p>
        <h2>连接你的 Binance 实时通道</h2>
      </div>
      <span class="pill ${tone}">${validation.headline || "未配置 Binance API"}</span>
    </div>
    <p class="api-panel-copy">${validation.detail || "配置后可让 Goldlane 优先使用你的 Binance 通道。"}${
      settings.keyPreview ? ` 当前 Key：${settings.keyPreview}` : ""
    }</p>
    <div class="api-panel-grid">
      <label class="mini-control">
        <span>API Key</span>
        <input id="binanceApiKeyInput" class="api-input" type="password" autocomplete="off" placeholder="${settings.keyPreview || "输入 Binance API Key"}" value="${settings.form.apiKey}" />
      </label>
      <label class="mini-control">
        <span>API Secret</span>
        <input id="binanceApiSecretInput" class="api-input" type="password" autocomplete="off" placeholder="${settings.configured ? "已保存，留空则沿用现有 Secret" : "输入 Binance API Secret"}" value="${settings.form.apiSecret}" />
      </label>
      <label class="mini-control">
        <span>Spot API Base</span>
        <input id="binanceSpotBaseInput" class="api-input" type="text" value="${settings.form.spotBaseUrl}" />
      </label>
      <label class="mini-control">
        <span>Futures API Base</span>
        <input id="binanceFuturesBaseInput" class="api-input" type="text" value="${settings.form.futuresBaseUrl}" />
      </label>
    </div>
    <div class="api-panel-actions">
      <button id="testBinanceApiButton" class="secondary-button" ${settings.testing ? "disabled" : ""}>${settings.testing ? "测试中..." : "测试连接"}</button>
      <button id="saveBinanceApiButton" class="action-button" ${saveDisabled ? "disabled" : ""}>${settings.saving ? "保存中..." : "保存到 .env"}</button>
      <button id="clearBinanceApiButton" class="secondary-button" ${settings.saving ? "disabled" : ""}>清除 API</button>
    </div>
    ${settings.error ? `<div class="quick-result empty">Binance API：${settings.error}</div>` : ""}
  `;

  const bindInput = (id, key) => {
    const input = document.getElementById(id);
    input?.addEventListener("input", (event) => {
      state.binanceSettings.form[key] = event.target.value;
    });
  };

  bindInput("binanceApiKeyInput", "apiKey");
  bindInput("binanceApiSecretInput", "apiSecret");
  bindInput("binanceSpotBaseInput", "spotBaseUrl");
  bindInput("binanceFuturesBaseInput", "futuresBaseUrl");

  document.getElementById("testBinanceApiButton")?.addEventListener("click", () => {
    testBinanceApiSettings();
  });
  document.getElementById("saveBinanceApiButton")?.addEventListener("click", () => {
    saveBinanceApiSettings();
  });
  document.getElementById("clearBinanceApiButton")?.addEventListener("click", () => {
    saveBinanceApiSettings({ clearCredentials: true });
  });
}

function renderQuickCheck(messageToken) {
  if (state.quickCheckPending) {
    dom.quickCheckResult.innerHTML = `
      <div class="quick-result empty">
        正在判断…
        <div class="tag-row">
          <span class="tag">${(dom.quickCheckInput.value || "Symbol").toUpperCase()}</span>
          <span class="tag">${mandateSettingsDiffer(state.mandateDraft, state.activeMandate) ? "当前草稿" : "当前设置"}</span>
        </div>
      </div>
    `;
    return;
  }

  if (state.quickCheckError) {
    dom.quickCheckResult.innerHTML = `<div class="quick-result empty">Quick Check 失败：${state.quickCheckError}</div>`;
    return;
  }

  const token = messageToken || state.quickCheckToken || getToken(state.selected);
  if (!token) {
    dom.quickCheckResult.innerHTML = `<div class="quick-result empty">输入一个 symbol，系统会告诉你这是不是一个真实可盈利机会。</div>`;
    return;
  }

  const scopeLabel = state.quickCheckMeta?.scope || "Desk Snapshot";
  const checkedAt = state.quickCheckMeta?.generatedAt
    ? new Date(state.quickCheckMeta.generatedAt).toLocaleTimeString("zh-CN", { hour12: false })
    : null;
  const brief = executionBrief(token);

  dom.quickCheckResult.innerHTML = `
    <div class="quick-result ${verdictClass(token.warrant?.status)}">
      <div class="quick-result-head">
        <strong>${token.symbol}</strong>
        <span class="status-pill ${verdictClass(token.warrant?.status)}">${verdictLabels[token.warrant?.status] || token.warrant?.status || "观察中"}</span>
      </div>
      <p>${opportunityHeadline(token)}</p>
      <p class="quick-brief">${brief.primaryAction}</p>
      <div class="tag-row">
        <span class="tag ${laneClass(token.warrant?.lane)}">${laneLabel(token.warrant?.lane)}</span>
        <span class="tag">Edge ${pct(executableEdgePct(token))}</span>
        <span class="tag">预估 ${signedCompactUsd(opportunityExpectedNetPnlUsd(token))}</span>
        <span class="tag">TTL ${compactMinutes(token.warrant?.ttlMinutes || 0)}</span>
        ${checkedAt ? `<span class="tag">Checked ${checkedAt}</span>` : ""}
      </div>
    </div>
  `;
}

async function runQuickCheck() {
  const raw = (dom.quickCheckInput.value || "").trim().toUpperCase();
  if (!raw) {
    state.quickCheckToken = null;
    state.quickCheckMeta = null;
    state.quickCheckError = null;
    renderQuickCheck();
    return;
  }

  const draftMode = mandateSettingsDiffer(state.mandateDraft, state.activeMandate);
  state.quickCheckPending = true;
  state.quickCheckError = null;
  renderQuickCheck();

  try {
    const response = await fetch("/api/warrant/check", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        symbol: raw,
        mandate: draftMode ? cloneMandateSettings(state.mandateDraft) : cloneMandateSettings(state.activeMandate),
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(response.status === 404 ? `没有找到 ${raw}，当前实时 watchlist 仅支持已接入标的。` : payload.error || `无法为 ${raw} 生成机会判断`);
    }

    state.selected = payload.token?.symbol || raw;
    state.quickCheckToken = payload.token || null;
    state.quickCheckMeta = {
      scope: draftMode ? "Draft Mandate" : "Applied Mandate",
      generatedAt: payload.generatedAt || null,
    };
    state.quickCheckError = null;
    state.quickCheckPending = false;
    render();
  } catch (error) {
    state.quickCheckToken = null;
    state.quickCheckMeta = null;
    state.quickCheckError = error.message;
    state.quickCheckPending = false;
    renderQuickCheck();
  }
}

function renderFilters() {
  dom.verdictFilters.innerHTML = "";
  verdictFilters.forEach((name) => {
    const button = document.createElement("button");
    button.className = `chip${state.verdictFilter === name ? " active" : ""}`;
    button.textContent = verdictLabels[name] || name;
    button.addEventListener("click", () => {
      state.verdictFilter = name;
      render();
    });
    dom.verdictFilters.appendChild(button);
  });
}

function buildDecisionCard(token) {
  const brief = executionBrief(token);
  return `
    <article class="decision-card ${verdictClass(token.warrant?.status)}" data-symbol="${token.symbol}">
      <div class="decision-head">
        <div>
          <strong>${token.symbol}</strong>
          <span>${token.name}</span>
        </div>
        <span class="status-pill ${verdictClass(token.warrant?.status)}">${verdictLabels[token.warrant?.status] || token.warrant?.status || "观察中"}</span>
      </div>
      <p>${opportunityHeadline(token)}</p>
      <div class="review-note">${brief.primaryAction}</div>
      <div class="decision-metrics">
        <div>
          <span>预估</span>
          <strong>${signedCompactUsd(opportunityExpectedNetPnlUsd(token))}</strong>
        </div>
        <div>
          <span>Edge</span>
          <strong>${pct(executableEdgePct(token))}</strong>
        </div>
        <div>
          <span>Lane</span>
          <strong>${laneLabel(token.warrant?.lane)}</strong>
        </div>
        <div>
          <span>TTL</span>
          <strong>${compactMinutes(token.warrant?.ttlMinutes || 0)}</strong>
        </div>
      </div>
    </article>
  `;
}

function attachDecisionClicks(container) {
  container.querySelectorAll("[data-symbol]").forEach((card) => {
    card.addEventListener("click", () => {
      state.selected = card.dataset.symbol;
      render();
    });
  });
}

function renderApprovalDesk() {
  const tokens = symbolsToTokens(state.overview.desk?.approved);
  const list = tokens.length ? tokens : deriveDesk("approved");
  if (!list.length) {
    dom.approvalDesk.innerHTML = `<div class="empty-card">当前没有通过过滤器的真实可执行机会。</div>`;
    return;
  }
  dom.approvalDesk.innerHTML = list.map((token) => buildDecisionCard(token)).join("");
  attachDecisionClicks(dom.approvalDesk);
}

function renderAlertFeed() {
  const allItems = (state.overview.alertFeed || [])
    .map((item) => ({
      ...item,
      token: getToken(item.symbol),
    }))
    .filter((item) => item.token);
  const items = filteredAlerts();
  const counts = alertSeverityFilters.reduce((acc, key) => {
    if (key === "All") return acc;
    acc[key] = allItems.filter((item) => item.severity === key).length;
    return acc;
  }, {});

  dom.alertFeed.innerHTML = `
    <div class="alert-toolbar">
      <div class="chip-row">
        ${alertSeverityFilters
          .map(
            (name) => `
              <button class="chip${state.alertSeverityFilter === name ? " active" : ""}" data-alert-filter="${name}">
                ${alertSeverityLabels[name]}
              </button>
            `,
          )
          .join("")}
      </div>
      <span class="tag">高 ${counts.high || 0} · 中 ${counts.medium || 0} · 低 ${counts.low || 0}</span>
    </div>
    ${
      items.length
        ? items
            .map(
              (item) => `
                <article class="alert-card ${item.severity}" data-symbol="${item.symbol}">
                  <div class="alert-head">
                    <strong>${item.symbol}</strong>
                    <span class="status-pill ${item.severity}">${alertSeverityLabel(item.severity)}</span>
                  </div>
                  <p>${item.headline}</p>
                  <div class="tag-row">
                    <span class="tag ${laneClass(item.lane)}">${laneLabel(item.lane)}</span>
                    <span class="tag">净边际 ${pct(item.netEdgePct || 0)}</span>
                    <span class="tag">预估 ${signedCompactUsd(item.expectedNetPnlUsd || 0)}</span>
                    <span class="tag">TTL ${compactMinutes(item.ttlMinutes || 0)}</span>
                  </div>
                  <div class="review-note">${item.body}</div>
                </article>
              `,
            )
            .join("")
        : `<div class="empty-card">当前过滤条件下没有需要立刻处理的提醒。</div>`
    }
  `;

  dom.alertFeed.querySelectorAll("[data-alert-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.alertSeverityFilter = button.dataset.alertFilter;
      renderAlertFeed();
    });
  });

  attachDecisionClicks(dom.alertFeed);
}

function renderPortfolioWatchtower() {
  const items = portfolioWatchtowerItems();

  if (!items.length) {
    dom.portfolioWatchtower.innerHTML = `<div class="empty-card">还没有需要你处理的持仓风险。</div>`;
    return;
  }

  dom.portfolioWatchtower.innerHTML = `
    ${items
      .map(
        (item) => `
          <article class="review-card ${item.cardTone}" data-symbol="${item.symbol}">
            <div class="review-head">
              <strong>${item.symbol}</strong>
              <span class="status-pill ${item.severity}">${alertSeverityLabel(item.severity)}</span>
            </div>
            <p>${item.headline}</p>
            <div class="tag-row">
              <span class="tag ${laneClass(item.lane)}">${laneLabel(item.lane)}</span>
              <span class="tag">Mark ${signedCompactUsd(item.markPnlUsd || 0)}</span>
              <span class="tag">当前 ${signedCompactUsd(item.liveNetPnlUsd || 0)}</span>
              <span class="tag">Hold ${item.holdLabel}</span>
              ${item.ttlMinutes ? `<span class="tag">TTL ${compactMinutes(item.ttlMinutes)}</span>` : ""}
            </div>
            <div class="review-note">${item.body}</div>
            <div class="action-row">
              <button class="secondary-button" data-portfolio-focus-button="${item.symbol}">聚焦机会</button>
              ${
                item.actionKind === "close"
                  ? `<button class="secondary-button" data-portfolio-close="${item.entryId}">${item.actionLabel}</button>`
                  : `<button class="secondary-button" data-portfolio-focus-button="${item.symbol}">${item.actionLabel}</button>`
              }
            </div>
          </article>
        `,
      )
      .join("")}
  `;

  attachDecisionClicks(dom.portfolioWatchtower);

  dom.portfolioWatchtower.querySelectorAll("[data-portfolio-focus-button]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selected = button.dataset.portfolioFocusButton;
      render();
    });
  });

  dom.portfolioWatchtower.querySelectorAll("[data-portfolio-close]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      closePortfolioEntry(button.dataset.portfolioClose);
    });
  });
}

function renderPositionAlertPanel() {
  const alerts = filteredPositionAlerts();
  const counts = positionAlertCounts();
  const policyStats = positionAlertPolicyStats();
  const alertPreset = currentPositionAlertPreset();
  const recommendedPreset = recommendedPositionAlertPreset();
  const permission = browserNotificationPermission();
  const snoozes = activeSnoozes();
  const mutedSymbols = state.positionAlertPrefs.mutedSymbols;
  const snoozedSymbols = Object.keys(snoozes);
  const desktopStatus =
    permission === "granted"
      ? state.positionAlertPrefs.desktopEnabled
        ? "Desktop On"
        : "Granted / Off"
      : permission === "denied"
        ? "Blocked"
        : permission === "unsupported"
          ? "Unsupported"
          : "Ask Permission";

  dom.positionAlertPanel.innerHTML = `
    <div class="portfolio-toolbar">
      <div class="chip-row">
        ${positionAlertFilters
          .map(
            (name) => `
              <button class="chip${state.positionAlertFilter === name ? " active" : ""}" data-position-alert-filter="${name}">
                ${positionAlertLabels[name]}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="chip-row">
        ${Object.entries(positionAlertPresetConfigs)
          .map(
            ([name, preset]) => `
              <button class="chip${alertPreset === name ? " active" : ""}" data-position-alert-preset="${name}">
                ${preset.label}
              </button>
            `,
          )
          .join("")}
        <button id="applyRecommendedPreset" class="secondary-button" ${
          alertPreset === recommendedPreset.name && !state.positionAlertPrefs.autoFollowRecommendedPreset ? "disabled" : ""
        }>使用市场建议</button>
        <button id="toggleAutoPreset" class="secondary-button">${
          state.positionAlertPrefs.autoFollowRecommendedPreset ? "关闭自动跟随" : "自动跟随建议"
        }</button>
        <button id="clearAlertOverrides" class="secondary-button" ${policyStats.custom || policyStats.snoozed ? "" : "disabled"}>清空 Overrides</button>
      </div>
      <div class="review-note">${positionAlertPresetDescription(alertPreset)} 当前建议：${recommendedPreset.headline}。${recommendedPreset.reason}</div>
      <div class="action-row">
        <span class="tag">Unread ${counts.unread}</span>
        <span class="tag">Active ${counts.active}</span>
        <span class="tag">Resolved ${counts.resolved}</span>
        <span class="tag">High ${counts.high}</span>
        <span class="tag">Medium ${counts.medium}</span>
        <span class="tag">Low ${counts.low}</span>
        <span class="tag">Preset ${positionAlertPresetLabel(alertPreset)}</span>
        <span class="tag">Suggested ${positionAlertPresetLabel(recommendedPreset.name)}</span>
        <span class="tag">Custom ${policyStats.custom}</span>
        <span class="tag">Reopened ${policyStats.reopened}</span>
        <span class="tag">Inbox Only ${policyStats.inbox}</span>
        <span class="tag">High Only ${policyStats.critical}</span>
        <span class="tag">Inbox ${severityFloorLabel(state.positionAlertPrefs.minInboxSeverity)}</span>
        <span class="tag">Desktop ${severityFloorLabel(state.positionAlertPrefs.minDesktopSeverity)}</span>
        <span class="tag">${state.positionAlertPrefs.desktopCriticalOnly ? "Desktop Critical" : "Desktop Follows Threshold"}</span>
        <span class="tag">Muted ${mutedSymbols.length}</span>
        <span class="tag">Snoozed ${snoozedSymbols.length}</span>
        <span class="tag">Desktop ${desktopStatus}</span>
        <button id="cycleInboxSeverity" class="secondary-button">Inbox 阈值</button>
        <button id="cycleDesktopSeverity" class="secondary-button">Desktop 阈值</button>
        <button id="toggleDesktopCritical" class="secondary-button">${state.positionAlertPrefs.desktopCriticalOnly ? "桌面仅关键" : "桌面跟随阈值"}</button>
        <button id="enablePositionDesktop" class="secondary-button" ${permission === "denied" || permission === "unsupported" ? "disabled" : ""}>
          ${state.positionAlertPrefs.desktopEnabled ? "关闭桌面提醒" : "开启桌面提醒"}
        </button>
        <button id="clearPositionAlerts" class="secondary-button" ${state.positionAlerts.length ? "" : "disabled"}>清空提醒箱</button>
      </div>
      ${
        mutedSymbols.length || snoozedSymbols.length
          ? `
              <div class="tag-row">
                ${
                  mutedSymbols.length
                    ? mutedSymbols.map((symbol) => `<span class="tag">Muted ${symbol}</span>`).join("")
                    : ""
                }
                ${
                  snoozedSymbols.length
                    ? snoozedSymbols
                        .map((symbol) => `<span class="tag">Snoozed ${symbol} → ${replayTimestamp(snoozes[symbol])}</span>`)
                        .join("")
                    : ""
                }
              </div>
            `
          : ""
      }
    </div>
    ${
      alerts.length
        ? `
            <div class="position-alert-list">
              ${alerts
                .map(
                  (alert) => `
                    <article class="position-alert-item ${alert.severity} ${alert.status}${alert.readAt ? "" : " unread"}" data-symbol="${alert.symbol}" data-position-alert-id="${alert.id}">
                      <div class="alert-head">
                        <div>
                          <strong>${alert.symbol}</strong>
                          <span>${replayTimestamp(alert.createdAt)} · ${alert.statusLabel}</span>
                        </div>
                        <div class="tag-row">
                          <span class="status-pill ${alert.severity}">${alertSeverityLabel(alert.severity)}</span>
                          <span class="tag">${alert.status === "resolved" ? "Resolved" : "Active"}</span>
                          ${alert.lifecycle === "reopened" ? `<span class="tag">Reopened</span>` : alert.lifecycle === "new" ? `<span class="tag">New</span>` : ""}
                          ${alert.readAt ? `<span class="tag">Read</span>` : `<span class="tag">Unread</span>`}
                        </div>
                      </div>
                      <p>${alert.headline}</p>
                      <div class="tag-row">
                        <span class="tag ${laneClass(alert.lane)}">${laneLabel(alert.lane)}</span>
                        <span class="tag">Policy ${symbolAlertPolicyLabel(symbolAlertPolicy(alert.symbol))}</span>
                        <span class="tag">Mark ${signedCompactUsd(alert.markPnlUsd || 0)}</span>
                        <span class="tag">Live ${signedCompactUsd(alert.liveNetPnlUsd || 0)}</span>
                        ${alert.edgeDriftPct != null ? `<span class="tag">Edge ${pct(alert.edgeDriftPct)}</span>` : ""}
                        <span class="tag">Hold ${alert.holdLabel}</span>
                        ${alert.ttlMinutes ? `<span class="tag">TTL ${compactMinutes(alert.ttlMinutes)}</span>` : ""}
                      </div>
                      <div class="review-note">${alert.body}</div>
                      ${alert.status === "resolved" ? `<div class="review-note">${resolutionNoteForAlert(alert)}</div>` : ""}
                      <div class="action-row">
                        <button class="secondary-button" data-position-focus="${alert.symbol}">聚焦机会</button>
                        <button class="secondary-button" data-position-policy-cycle="${alert.symbol}">切换策略</button>
                        <button class="secondary-button" data-position-snooze-review="${alert.symbol}">${
                          isSymbolSnoozed(alert.symbol) ? "取消静默" : "静默到复审"
                        }</button>
                        <button class="secondary-button" data-position-mute="${alert.symbol}">${
                          isSymbolMuted(alert.symbol) ? "取消 Mute" : "Mute Symbol"
                        }</button>
                        ${
                          alert.readAt
                            ? ""
                            : `<button class="secondary-button" data-position-read="${alert.id}">标记已读</button>`
                        }
                        <button class="secondary-button" data-position-dismiss="${alert.id}">移出提醒箱</button>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `
        : `<div class="empty-card">当前提醒箱是空的。只要你的 paper position 出现 thesis 断裂、净边际转负或短 TTL 复审，就会自动进入这里。</div>`
    }
  `;

  dom.positionAlertPanel.querySelectorAll("[data-position-alert-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.positionAlertFilter = button.dataset.positionAlertFilter;
      renderPositionAlertPanel();
    });
  });

  dom.positionAlertPanel.querySelectorAll("[data-symbol]").forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.positionAlertId) {
        markPositionAlertRead(item.dataset.positionAlertId);
      }
      state.selected = item.dataset.symbol;
      render();
    });
  });

  dom.positionAlertPanel.querySelectorAll("[data-position-focus]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const alertCard = button.closest("[data-position-alert-id]");
      if (alertCard?.dataset.positionAlertId) {
        markPositionAlertRead(alertCard.dataset.positionAlertId);
      }
      state.selected = button.dataset.positionFocus;
      render();
    });
  });

  dom.positionAlertPanel.querySelectorAll("[data-position-read]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      markPositionAlertRead(button.dataset.positionRead);
      renderSummary();
      renderPositionAlertPanel();
    });
  });

  dom.positionAlertPanel.querySelectorAll("[data-position-dismiss]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      dismissPositionAlert(button.dataset.positionDismiss);
      renderPositionAlertPanel();
      renderSummary();
    });
  });

  const enableButton = document.getElementById("enablePositionDesktop");
  const clearButton = document.getElementById("clearPositionAlerts");
  const applyRecommendedPresetButton = document.getElementById("applyRecommendedPreset");
  const toggleAutoPresetButton = document.getElementById("toggleAutoPreset");
  const clearOverridesButton = document.getElementById("clearAlertOverrides");
  const cycleInboxSeverityButton = document.getElementById("cycleInboxSeverity");
  const cycleDesktopSeverityButton = document.getElementById("cycleDesktopSeverity");
  const toggleDesktopCriticalButton = document.getElementById("toggleDesktopCritical");

  dom.positionAlertPanel.querySelectorAll("[data-position-alert-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      applyPositionAlertPreset(button.dataset.positionAlertPreset);
    });
  });

  applyRecommendedPresetButton?.addEventListener("click", () => {
    applyPositionAlertPreset(recommendedPreset.name);
  });

  toggleAutoPresetButton?.addEventListener("click", () => {
    toggleAutoFollowRecommendedPreset();
  });

  cycleInboxSeverityButton?.addEventListener("click", () => {
    state.positionAlertPrefs = sanitizePositionAlertPrefs({
      ...state.positionAlertPrefs,
      minInboxSeverity: cycleSeverityFloor(state.positionAlertPrefs.minInboxSeverity),
    });
    savePositionAlertPrefs();
    syncPositionAlerts();
    render();
  });

  cycleDesktopSeverityButton?.addEventListener("click", () => {
    state.positionAlertPrefs = sanitizePositionAlertPrefs({
      ...state.positionAlertPrefs,
      minDesktopSeverity: cycleSeverityFloor(state.positionAlertPrefs.minDesktopSeverity),
    });
    savePositionAlertPrefs();
    renderPositionAlertPanel();
    renderSummary();
  });

  toggleDesktopCriticalButton?.addEventListener("click", () => {
    state.positionAlertPrefs = sanitizePositionAlertPrefs({
      ...state.positionAlertPrefs,
      desktopCriticalOnly: !state.positionAlertPrefs.desktopCriticalOnly,
    });
    savePositionAlertPrefs();
    renderPositionAlertPanel();
    renderSummary();
  });

  enableButton?.addEventListener("click", () => {
    if (state.positionAlertPrefs.desktopEnabled) {
      state.positionAlertPrefs.desktopEnabled = false;
      savePositionAlertPrefs();
      renderPositionAlertPanel();
      renderSummary();
      return;
    }
    requestPositionAlertDesktopPermission(enableButton);
  });

  clearButton?.addEventListener("click", () => {
    clearPositionAlerts();
    renderPositionAlertPanel();
    renderSummary();
  });

  clearOverridesButton?.addEventListener("click", () => {
    clearPositionAlertOverrides();
  });

  dom.positionAlertPanel.querySelectorAll("[data-position-snooze-review]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSnoozeUntilReview(button.dataset.positionSnoozeReview);
    });
  });

  dom.positionAlertPanel.querySelectorAll("[data-position-mute]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSymbolMute(button.dataset.positionMute);
    });
  });

  dom.positionAlertPanel.querySelectorAll("[data-position-policy-cycle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      cycleSymbolAlertPolicy(button.dataset.positionPolicyCycle);
    });
  });
}

function renderAlertPolicyPanel() {
  const rows = alertPolicyRows();
  const stats = positionAlertPolicyStats();
  const alertPreset = currentPositionAlertPreset();
  const recommendedPreset = recommendedPositionAlertPreset();

  if (!rows.length) {
    dom.alertPolicyPanel.innerHTML = `<div class="empty-card">当前还没有进入个人提醒工作流的 symbol。等你把机会记成“准备做”或产生本地提醒后，这里会长成真正的策略中心。</div>`;
    return;
  }

  dom.alertPolicyPanel.innerHTML = `
    <div class="portfolio-toolbar">
      <div class="chip-row">
        ${Object.entries(positionAlertPresetConfigs)
          .map(
            ([name, preset]) => `
              <button class="chip${alertPreset === name ? " active" : ""}" data-alert-preset="${name}">
                ${preset.label}
              </button>
            `,
          )
          .join("")}
        <button id="applyRecommendedAlertPreset" class="secondary-button" ${
          alertPreset === recommendedPreset.name && !state.positionAlertPrefs.autoFollowRecommendedPreset ? "disabled" : ""
        }>使用市场建议</button>
        <button id="toggleAlertAutoPreset" class="secondary-button">${
          state.positionAlertPrefs.autoFollowRecommendedPreset ? "关闭自动跟随" : "自动跟随建议"
        }</button>
        <button id="clearAlertPolicyOverrides" class="secondary-button" ${stats.custom || stats.snoozed ? "" : "disabled"}>清空 Overrides</button>
      </div>
      <div class="review-note">${positionAlertPresetDescription(alertPreset)} 当前建议：${recommendedPreset.headline}。${recommendedPreset.reason}</div>
      <div class="tag-row">
        <span class="tag">Preset ${positionAlertPresetLabel(alertPreset)}</span>
        <span class="tag">Suggested ${positionAlertPresetLabel(recommendedPreset.name)}</span>
        <span class="tag">Custom ${stats.custom}</span>
        <span class="tag">Reopened ${stats.reopened}</span>
        <span class="tag">Inbox Only ${stats.inbox}</span>
        <span class="tag">High Only ${stats.critical}</span>
        <span class="tag">Muted ${stats.mute}</span>
        <span class="tag">Snoozed ${stats.snoozed}</span>
      </div>
      <div class="review-note">这里按 symbol 管提醒，不再只靠全局阈值。你可以把某些标的降成仅 Inbox、只保留问题重现、只留高优先，或者直接静默。</div>
    </div>
    <div class="portfolio-list">
      ${rows
        .map(
          (row) => `
            <article class="review-card ${symbolAlertPolicyTone(row.mode)}" data-alert-policy-focus="${row.symbol}">
              <div class="review-head">
                <strong>${row.symbol}</strong>
                <span class="status-pill ${symbolAlertPolicyTone(row.mode) === "muted" ? "deferred" : symbolAlertPolicyTone(row.mode)}">${symbolAlertPolicyLabel(row.mode)}</span>
              </div>
              <p>${row.headline}</p>
              <div class="tag-row">
                <span class="tag ${laneClass(row.lane)}">${laneLabel(row.lane)}</span>
                <span class="tag">Open ${row.openCount}</span>
                <span class="tag">Unread ${row.unreadCount}</span>
                <span class="tag">Active ${row.activeCount}</span>
                <span class="tag">Resolved ${row.resolvedCount}</span>
                <span class="tag">Inbox ${row.inboxFloorLabel}</span>
                <span class="tag">Desktop ${row.desktopFloorLabel}</span>
                ${row.mode === "reopened" ? `<span class="tag">${row.reopenedReady ? "Reopen Ready" : "Waiting First Clear"}</span>` : ""}
                ${row.snoozedUntil ? `<span class="tag">Snoozed ${replayTimestamp(row.snoozedUntil)}</span>` : ""}
              </div>
              <div class="review-note">${symbolAlertPolicyDescription(row.mode)} ${row.mode === "reopened" && !row.reopenedReady ? "当前还没有已解除历史，等第一轮问题退出后，再次出现才会真正提醒。" : ""} ${row.detail ? `当前重点：${row.detail}` : ""}</div>
              <div class="policy-mode-row">
                ${symbolAlertPolicyModes
                  .map(
                    (mode) => `
                      <button class="chip${row.mode === mode ? " active" : ""}" data-alert-policy-set="${mode}" data-alert-policy-symbol="${row.symbol}">
                        ${symbolAlertPolicyLabel(mode)}
                      </button>
                    `,
                  )
                  .join("")}
                <button class="secondary-button" data-alert-policy-snooze-review="${row.symbol}">${
                  row.snoozedUntil ? "取消静默" : "静默到复审"
                }</button>
                <button class="secondary-button" data-alert-policy-focus-button="${row.symbol}">聚焦机会</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;

  dom.alertPolicyPanel.querySelectorAll("[data-alert-policy-focus]").forEach((item) => {
    item.addEventListener("click", () => {
      state.selected = item.dataset.alertPolicyFocus;
      render();
    });
  });

  dom.alertPolicyPanel.querySelectorAll("[data-alert-policy-focus-button]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selected = button.dataset.alertPolicyFocusButton;
      render();
    });
  });

  dom.alertPolicyPanel.querySelectorAll("[data-alert-policy-set]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setSymbolAlertPolicy(button.dataset.alertPolicySymbol, button.dataset.alertPolicySet);
    });
  });

  dom.alertPolicyPanel.querySelectorAll("[data-alert-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      applyPositionAlertPreset(button.dataset.alertPreset);
    });
  });

  document.getElementById("applyRecommendedAlertPreset")?.addEventListener("click", () => {
    applyPositionAlertPreset(recommendedPreset.name);
  });

  document.getElementById("toggleAlertAutoPreset")?.addEventListener("click", () => {
    toggleAutoFollowRecommendedPreset();
  });

  dom.alertPolicyPanel.querySelectorAll("[data-alert-policy-snooze-review]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSnoozeUntilReview(button.dataset.alertPolicySnoozeReview);
    });
  });

  document.getElementById("clearAlertPolicyOverrides")?.addEventListener("click", () => {
    clearPositionAlertOverrides();
  });
}

function renderPostmortemFeed() {
  const feed =
    (state.overview.postmortemFeed || []).length
      ? (state.overview.postmortemFeed || [])
          .map((item) => ({
            ...item,
            token: getToken(item.symbol),
          }))
          .filter((item) => item.token)
      : state.overview.tokens
          .map((token) => {
            const item = postmortem(token);
            return item ? { ...item, symbol: token.symbol, token } : null;
          })
          .filter(Boolean)
          .slice(0, 4);

  if (!feed.length) {
    dom.postmortemFeed.innerHTML = `<div class="empty-card">当前还没有值得写入复盘墙的失败案例。</div>`;
    return;
  }

  dom.postmortemFeed.innerHTML = feed
    .map(
      (item) => `
        <article class="review-card ${verdictClass(item.currentStatus)}" data-symbol="${item.symbol}">
          <div class="review-head">
            <strong>${item.symbol}</strong>
            <span class="status-pill ${verdictClass(item.currentStatus)}">${postmortemKindLabel(item.kind)}</span>
          </div>
          <p>${item.headline}</p>
          <div class="tag-row">
            <span class="tag ${laneClass(item.lane)}">${laneLabel(item.lane)}</span>
            <span class="tag">${item.previousStatus ? `${item.previousStatus} -> ${item.currentStatus}` : item.currentStatus}</span>
            <span class="tag">Avoided ${signedCompactUsd(item.avoidedLossUsd || 0)}</span>
            <span class="tag">Score ${item.score || 0}</span>
          </div>
          <div class="review-note">${item.lesson}</div>
        </article>
      `,
    )
    .join("");

  attachDecisionClicks(dom.postmortemFeed);
}

function renderShiftFeed() {
  const items = (state.overview.shiftFeed || [])
    .map((item) => ({
      ...item,
      token: getToken(item.symbol),
    }))
    .filter((item) => item.token);

  if (!items.length) {
    dom.shiftFeed.innerHTML = `<div class="empty-card">等待下一轮实时扫描，系统会把状态跃迁最大的机会放到这里。</div>`;
    return;
  }

  dom.shiftFeed.innerHTML = items
    .map(
      (item) => `
        <article class="review-card ${verdictClass(item.status)}" data-symbol="${item.symbol}">
          <div class="review-head">
            <strong>${item.symbol}</strong>
            <span class="status-pill ${verdictClass(item.status)}">${shiftDirectionLabel(item.direction)}</span>
          </div>
          <p>${item.headline}</p>
          <div class="tag-row">
            <span class="tag">Score ${item.score}</span>
            <span class="tag">Net ${pct(item.netEdgePct || 0)}</span>
            <span class="tag">PnL ${signedCompactUsd(item.expectedNetPnlUsd || 0)}</span>
            <span class="tag">${opportunityStateLabel(item.token)}</span>
            <span class="tag ${laneClass(item.token.warrant?.lane)}">${laneLabel(item.token.warrant?.lane)}</span>
          </div>
          <div class="review-note">${item.token.opportunity?.whyNow?.[1] || item.token.warrant?.reasonChain?.[0] || "等待下一次结构变化"}</div>
        </article>
      `,
    )
    .join("");

  attachDecisionClicks(dom.shiftFeed);
}

function renderKillDesk() {
  const tokens = symbolsToTokens(state.overview.desk?.rejected);
  const list = tokens.length ? tokens : deriveDesk("rejected");
  if (!list.length) {
    dom.killDesk.innerHTML = `<div class="empty-card">当前还没有明显的假机会被系统拦下。</div>`;
    return;
  }
  dom.killDesk.innerHTML = list.map((token) => buildDecisionCard(token)).join("");
  attachDecisionClicks(dom.killDesk);
}

function renderReapprovalQueue() {
  const tokens = symbolsToTokens(state.overview.desk?.reapproval);
  const list = tokens.length ? tokens : deriveDesk("reapproval");
  if (!list.length) {
    dom.reapprovalQueue.innerHTML = `<div class="empty-card">当前没有需要复审的机会。</div>`;
    return;
  }

  dom.reapprovalQueue.innerHTML = list
    .map(
      (token) => `
        <article class="review-card ${verdictClass(token.warrant?.status)}" data-symbol="${token.symbol}">
          <div class="review-head">
            <strong>${token.symbol}</strong>
            <span class="status-pill ${verdictClass(token.warrant?.status)}">${verdictLabels[token.warrant?.status] || token.warrant?.status || "观察中"}</span>
          </div>
          <p>${opportunityExplain(token)}</p>
          <div class="tag-row">
            <span class="tag">TTL ${timeUntil(token.warrant?.expiresAt)}</span>
            <span class="tag">Fragility ${Math.round(token.warrant?.fragilityScore || 0)}</span>
            <span class="tag">${edgeChipLabel(token)} ${pct(executableEdgePct(token))}</span>
            <span class="tag ${laneClass(token.warrant?.lane)}">${laneLabel(token.warrant?.lane)}</span>
          </div>
          <div class="review-note">${token.warrant?.recheckTriggers?.[0] || "等待新的机会触发器"}</div>
        </article>
      `,
    )
    .join("");
  attachDecisionClicks(dom.reapprovalQueue);
}

function renderCapitalQueue(list) {
  if (!list.length) {
    dom.capitalQueue.innerHTML = `<div class="empty-card">当前筛选条件下没有符合要求的机会。</div>`;
    return;
  }

  dom.capitalQueue.innerHTML = list
    .map(
      (token) => `
        <article class="queue-row${state.selected === token.symbol ? " active" : ""}" data-symbol="${token.symbol}">
          <div class="queue-main">
            <div class="queue-symbol">
              <strong>${token.symbol}</strong>
              <span>${token.name}</span>
            </div>
            <p>${opportunityHeadline(token)}</p>
          </div>
          <div class="queue-side">
            <span class="status-pill ${verdictClass(token.warrant?.status)}">${verdictLabels[token.warrant?.status] || token.warrant?.status || "观察中"}</span>
            <span class="queue-metric">Edge ${pct(executableEdgePct(token))}</span>
            <span class="queue-metric">预估 ${signedCompactUsd(opportunityExpectedNetPnlUsd(token))}</span>
            <span class="queue-metric ${laneClass(token.warrant?.lane)}">${laneLabel(token.warrant?.lane)}</span>
            <span class="queue-metric">TTL ${compactMinutes(token.warrant?.ttlMinutes || 0)}</span>
          </div>
        </article>
      `,
    )
    .join("");
  attachDecisionClicks(dom.capitalQueue);
}

function filteredJournalEntries() {
  if (state.journalFilter === "All") return state.journalEntries;
  return state.journalEntries.filter((entry) => entry.action === state.journalFilter);
}

function renderJournalPanel() {
  const entries = filteredJournalEntries();
  const counts = journalFilters.reduce((acc, key) => {
    if (key === "All") return acc;
    acc[key] = state.journalEntries.filter((entry) => entry.action === key).length;
    return acc;
  }, {});

  dom.journalPanel.innerHTML = `
    <div class="journal-toolbar">
      <div class="chip-row">
        ${journalFilters
          .map(
            (name) => `
              <button class="chip${state.journalFilter === name ? " active" : ""}" data-journal-filter="${name}">
                ${journalLabels[name]}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="action-row">
        <span class="tag">Trade ${counts.trade || 0}</span>
        <span class="tag">Watch ${counts.watch || 0}</span>
        <span class="tag">Pass ${counts.pass || 0}</span>
        <span class="tag">Review ${counts.review || 0}</span>
        <button id="exportJournalButton" class="secondary-button" ${state.journalEntries.length ? "" : "disabled"}>导出 Journal</button>
      </div>
    </div>
    ${
      entries.length
        ? `
            <div class="journal-list">
              ${entries
                .map(
                  (entry) => `
                    <article class="journal-item ${journalTone(entry.action)}" data-symbol="${entry.symbol}">
                      <div class="journal-head">
                        <div>
                          <strong>${entry.symbol}</strong>
                          <span>${entry.name} · ${entry.theme}</span>
                        </div>
                        <span class="status-pill ${journalTone(entry.action)}">${journalEntryLabel(entry.action)}</span>
                      </div>
                      <p>${entry.headline}</p>
                      <div class="tag-row">
                        <span class="tag">${replayTimestamp(entry.createdAt)}</span>
                        <span class="tag">${entry.status}</span>
                        <span class="tag ${laneClass(entry.lane)}">${laneLabel(entry.lane)}</span>
                        <span class="tag">Score ${entry.score}</span>
                        <span class="tag">PnL ${signedCompactUsd(entry.expectedNetPnlUsd)}</span>
                        <span class="tag">Budget ${entry.riskBudgetPct}%</span>
                        ${entry.action === "trade" ? `<span class="tag">${entry.positionStatus === "closed" ? "Position Closed" : "Position Live"}</span>` : ""}
                      </div>
                      <div class="review-note">${entry.note}</div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `
        : `<div class="empty-card">还没有 Journal 记录。你可以在右侧详情里把机会记成准备做、加观察、跳过或复盘。</div>`
    }
  `;

  dom.journalPanel.querySelectorAll("[data-journal-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.journalFilter = button.dataset.journalFilter;
      renderJournalPanel();
    });
  });

  dom.journalPanel.querySelectorAll("[data-symbol]").forEach((item) => {
    item.addEventListener("click", () => {
      state.selected = item.dataset.symbol;
      render();
    });
  });

  const exportButton = document.getElementById("exportJournalButton");
  exportButton?.addEventListener("click", () => copyText(exportJournalMarkdown(), exportButton, "已导出"));
}

function renderPortfolioPanel() {
  const entries = filteredPortfolioEntries();
  const allEntries = portfolioEntries();
  const counts = {
    open: allEntries.filter((entry) => entry.positionStatus !== "closed").length,
    closed: allEntries.filter((entry) => entry.positionStatus === "closed").length,
    review: allEntries.filter((entry) => portfolioNeedsReview(entry, getToken(entry.symbol))).length,
    winners: allEntries.filter((entry) => (portfolioMarkPnlUsd(entry, getToken(entry.symbol)) || 0) > 0).length,
  };
  const floatingMarkUsd = allEntries
    .filter((entry) => entry.positionStatus !== "closed")
    .reduce((sum, entry) => sum + Number(portfolioMarkPnlUsd(entry, getToken(entry.symbol)) || 0), 0);

  dom.portfolioPanel.innerHTML = `
    <div class="portfolio-toolbar">
      <div class="chip-row">
        ${portfolioFilters
          .map(
            (name) => `
              <button class="chip${state.portfolioFilter === name ? " active" : ""}" data-portfolio-filter="${name}">
                ${portfolioLabels[name]}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="action-row">
        <span class="tag">Open ${counts.open}</span>
        <span class="tag">Needs Review ${counts.review}</span>
        <span class="tag">Winners ${counts.winners}</span>
        <span class="tag">Closed ${counts.closed}</span>
        <span class="tag">Floating ${signedCompactUsd(floatingMarkUsd)}</span>
        <button id="exportPortfolioButton" class="secondary-button" ${allEntries.length ? "" : "disabled"}>导出 Portfolio</button>
      </div>
    </div>
    ${
      entries.length
        ? `
            <div class="portfolio-list">
              ${entries
                .map((entry) => {
                  const token = getToken(entry.symbol);
                  const tone = portfolioTone(entry, token);
                  const markPnlUsd = portfolioMarkPnlUsd(entry, token);
                  const markChangePct = portfolioMarkChangePct(entry, token);
                  const liveNetPnlUsd = portfolioLiveNetPnlUsd(entry, token);
                  const edgeDriftPct = portfolioEdgeDriftPct(entry, token);
                  const markPrice = portfolioMarkPrice(entry, token);
                  const phase = portfolioPhaseLabel(entry, token);
                  const liveStatus = token?.warrant?.status || entry.status || "Offline";
                  const muted = isSymbolMuted(entry.symbol);
                  const snoozedUntil = snoozedUntilForSymbol(entry.symbol);
                  const policyMode = symbolAlertPolicy(entry.symbol);
                  const reviewCopy =
                    entry.positionStatus === "closed"
                      ? `这笔 paper position 已在 ${replayTimestamp(entry.closedAt || entry.updatedAt)} 关闭，原因 ${entry.closeReason || "manual-close"}。`
                      : portfolioNeedsReview(entry, token)
                        ? `当前 live verdict 已变成 ${liveStatus}，应优先复核 thesis 和退出条件。`
                        : token?.opportunity?.whyNow?.[0] || "当前 thesis 仍在 force，继续按 TTL 复审。";

                  return `
                    <article class="portfolio-card ${tone}" data-portfolio-focus="${entry.symbol}">
                      <div class="portfolio-head">
                        <div>
                          <strong>${entry.symbol}</strong>
                          <span>${entry.name} · ${entry.theme}</span>
                        </div>
                        <div class="tag-row">
                          <span class="status-pill ${tone}">${entry.positionStatus === "closed" ? "Closed" : "Paper Live"}</span>
                          <span class="status-pill ${entry.positionStatus === "closed" ? tone : verdictClass(liveStatus)}">${phase}</span>
                        </div>
                      </div>
                      <p>
                        ${
                          entry.positionStatus === "closed"
                            ? `本次跟踪最终 Mark ${signedCompactUsd(markPnlUsd)}，最终净机会估算 ${signedCompactUsd(liveNetPnlUsd)}。`
                            : `入场以来 Mark ${signedCompactUsd(markPnlUsd)}，当前实时净机会估算 ${signedCompactUsd(liveNetPnlUsd)}。`
                        }
                      </p>
                      <div class="tag-row">
                        <span class="tag">Entry ${price(entry.entryPriceUsd)}</span>
                        <span class="tag">Now ${price(markPrice)}</span>
                        <span class="tag">Mark ${markChangePct != null ? pct(markChangePct) : "--"}</span>
                        <span class="tag">Edge Drift ${edgeDriftPct != null ? pct(edgeDriftPct) : "--"}</span>
                        <span class="tag">${laneLabel(entry.lane)}</span>
                        <span class="tag">Size ${compactUsd(entry.entryNotionalUsd)}</span>
                        <span class="tag">Hold ${portfolioHoldLabel(entry)}</span>
                        <span class="tag">Policy ${symbolAlertPolicyLabel(policyMode)}</span>
                        ${muted ? `<span class="tag">Muted</span>` : ""}
                        ${snoozedUntil ? `<span class="tag">Snoozed ${replayTimestamp(snoozedUntil)}</span>` : ""}
                      </div>
                      <div class="review-note">${reviewCopy}</div>
                      <div class="action-row">
                        <button class="secondary-button" data-portfolio-focus-button="${entry.symbol}">聚焦机会</button>
                        <button class="secondary-button" data-portfolio-policy-cycle="${entry.symbol}">切换策略</button>
                        <button class="secondary-button" data-portfolio-snooze-review="${entry.symbol}">${
                          snoozedUntil ? "取消静默" : "静默到复审"
                        }</button>
                        <button class="secondary-button" data-portfolio-mute="${entry.symbol}">${
                          muted ? "取消 Mute" : "Mute Alerts"
                        }</button>
                        ${
                          entry.positionStatus === "closed"
                            ? `<button class="secondary-button" data-portfolio-reopen="${entry.id}">重新打开</button>`
                            : `<button class="secondary-button" data-portfolio-close="${entry.id}">标记已关闭</button>`
                        }
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>
          `
        : `<div class="empty-card">还没有 Portfolio 记录。先在右侧详情把机会记成“准备做”，这里就会自动长成持续跟踪的 paper position。</div>`
    }
  `;

  dom.portfolioPanel.querySelectorAll("[data-portfolio-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.portfolioFilter = button.dataset.portfolioFilter;
      renderPortfolioPanel();
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-focus]").forEach((item) => {
    item.addEventListener("click", () => {
      state.selected = item.dataset.portfolioFocus;
      render();
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-focus-button]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selected = button.dataset.portfolioFocusButton;
      render();
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-close]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      closePortfolioEntry(button.dataset.portfolioClose);
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-reopen]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      reopenPortfolioEntry(button.dataset.portfolioReopen);
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-snooze-review]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSnoozeUntilReview(button.dataset.portfolioSnoozeReview);
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-policy-cycle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      cycleSymbolAlertPolicy(button.dataset.portfolioPolicyCycle);
    });
  });

  dom.portfolioPanel.querySelectorAll("[data-portfolio-mute]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSymbolMute(button.dataset.portfolioMute);
    });
  });

  const exportButton = document.getElementById("exportPortfolioButton");
  exportButton?.addEventListener("click", () => copyText(exportPortfolioMarkdown(), exportButton, "已导出"));
}

function renderInspector(token) {
  if (!token) {
    dom.inspector.innerHTML = `<div class="empty-card">当前没有选中的机会案例。</div>`;
    return;
  }

  const replay = opportunityReplay(token);
  const replaySummary = replayTrendSummary(token);
  const brief = executionBrief(token);
  const pm = postmortem(token);
  const portfolioEntry = latestPortfolioEntryForSymbol(token.symbol, { includeClosed: true });
  const portfolioToneClass = portfolioEntry ? portfolioTone(portfolioEntry, token) : "muted";
  const portfolioPhase = portfolioEntry ? portfolioPhaseLabel(portfolioEntry, token) : null;
  const alertHistory = positionAlertsForSymbol(token.symbol);
  const activeAlertCount = alertHistory.filter((alert) => alert.status !== "resolved").length;
  const unreadAlertCount = alertHistory.filter((alert) => alert.status !== "resolved" && !alert.readAt).length;
  const resolvedAlertCount = alertHistory.filter((alert) => alert.status === "resolved").length;
  const currentAlertPolicy = symbolAlertPolicy(token.symbol);
  const currentPolicyTone = symbolAlertPolicyTone(currentAlertPolicy);
  const policySnoozedUntil = snoozedUntilForSymbol(token.symbol);
  const portfolioMarkUsd = portfolioEntry ? portfolioMarkPnlUsd(portfolioEntry, token) : null;
  const portfolioLiveNetUsd = portfolioEntry ? portfolioLiveNetPnlUsd(portfolioEntry, token) : null;
  const primaryWhy = (token.opportunity?.whyNow || [])[0] || opportunityExplain(token);
  const firstRiskRule = (token.warrant?.invalidationRules || [])[0] || "当前没有额外风险提示。";

  dom.inspector.innerHTML = `
    <div class="inspector-head">
      <div>
        <p class="eyebrow">Selected Opportunity</p>
        <strong>${token.symbol}</strong>
        <span>${token.name}</span>
        <p class="inspector-copy">${primaryWhy}</p>
      </div>
      <span class="status-pill ${verdictClass(token.warrant?.status)}">${verdictLabels[token.warrant?.status] || token.warrant?.status || "观察中"}</span>
    </div>

    <div class="inspector-grid">
      <div class="metric-card">
        <span>预估收益</span>
        <strong>${signedCompactUsd(opportunityExpectedNetPnlUsd(token))}</strong>
      </div>
      <div class="metric-card">
        <span>净边际</span>
        <strong>${pct(executableEdgePct(token))}</strong>
      </div>
      <div class="metric-card">
        <span>建议仓位</span>
        <strong>${compactUsd(opportunitySuggestedNotionalUsd(token))}</strong>
      </div>
      <div class="metric-card">
        <span>执行路径</span>
        <strong>${laneLabel(token.warrant?.lane)}</strong>
      </div>
      <div class="metric-card">
        <span>下次复审</span>
        <strong>${compactMinutes(token.warrant?.ttlMinutes || 0)}</strong>
      </div>
    </div>

    ${
      portfolioEntry
        ? `
          <div class="subsection">
            <span class="field-label">My Position</span>
            <div class="brief-card ${portfolioToneClass}">
              <div class="brief-head">
                <div>
                  <strong>${portfolioEntry.positionStatus === "closed" ? "已关闭" : "跟踪中"}</strong>
                  <p>${portfolioEntry.positionStatus === "closed" ? "这笔记录已关闭。" : "这笔机会正在你的观察组合里持续跟踪。"}</p>
                </div>
                <span class="status-pill ${portfolioToneClass === "muted" ? "deferred" : portfolioToneClass}">${portfolioPhase}</span>
              </div>
              <div class="brief-grid">
                <div class="metric-card">
                  <span>浮动</span>
                  <strong>${signedCompactUsd(portfolioMarkUsd)}</strong>
                </div>
                <div class="metric-card">
                  <span>当前机会</span>
                  <strong>${signedCompactUsd(portfolioLiveNetUsd)}</strong>
                </div>
                <div class="metric-card">
                  <span>持有时长</span>
                  <strong>${portfolioHoldLabel(portfolioEntry)}</strong>
                </div>
              </div>
              <div class="tag-row">
                <span class="tag">Size ${compactUsd(portfolioEntry.entryNotionalUsd)}</span>
                <span class="tag">${laneLabel(portfolioEntry.lane)}</span>
              </div>
              <div class="action-row">
                ${
                  portfolioEntry.positionStatus === "closed"
                    ? `<button id="portfolioReopen" class="secondary-button">重新打开持仓</button>`
                    : `<button id="portfolioClose" class="secondary-button">标记已关闭</button>`
                }
              </div>
            </div>
          </div>
        `
        : ""
    }

    <div class="subsection">
      <span class="field-label">What To Do</span>
      <div class="brief-card ${executionBriefTone(brief)}">
        <div class="brief-head">
          <div>
            <strong>${brief.posture}</strong>
            <p>${brief.primaryAction}</p>
          </div>
          <span class="status-pill ${executionBriefTone(brief) === "muted" ? "deferred" : executionBriefTone(brief)}">${laneLabel(token.warrant?.lane)}</span>
        </div>
        <p class="brief-summary">${brief.summary}</p>
        <div class="brief-grid">
          <div class="metric-card">
            <span>成本线</span>
            <strong>${pct(brief.breakEvenEdgePct || 0)}</strong>
          </div>
          <div class="metric-card">
            <span>剩余空间</span>
            <strong>${pct(brief.roomAfterCostPct || 0)}</strong>
          </div>
          <div class="metric-card">
            <span>风险资本</span>
            <strong>${signedCompactUsd(brief.capitalAtRiskUsd || 0)}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="subsection">
      <span class="field-label">Alert Policy</span>
      <div class="brief-card ${currentPolicyTone}">
        <div class="brief-head">
          <div>
            <strong>${symbolAlertPolicyLabel(currentAlertPolicy)}</strong>
            <p>${symbolAlertPolicyDescription(currentAlertPolicy)}</p>
          </div>
          <span class="status-pill ${currentPolicyTone === "muted" ? "deferred" : currentPolicyTone}">${symbolAlertPolicyLabel(currentAlertPolicy)}</span>
        </div>
        <div class="tag-row">
          <span class="tag">Unread ${unreadAlertCount}</span>
          <span class="tag">Active ${activeAlertCount}</span>
          ${policySnoozedUntil ? `<span class="tag">Snoozed ${replayTimestamp(policySnoozedUntil)}</span>` : ""}
        </div>
        <div class="policy-mode-row">
          ${symbolAlertPolicyModes
            .map(
              (mode) => `
                <button class="chip${currentAlertPolicy === mode ? " active" : ""}" data-inspector-policy-set="${mode}">
                  ${symbolAlertPolicyLabel(mode)}
                </button>
              `,
            )
            .join("")}
          <button id="inspectorSnoozeReview" class="secondary-button">${policySnoozedUntil ? "取消静默" : "静默到复审"}</button>
        </div>
      </div>
    </div>

    <div class="subsection">
      <span class="field-label">If Wrong</span>
      <div class="bullet-list">
        <div class="bullet-item">${firstRiskRule}</div>
        <div class="bullet-item">${(token.warrant?.recheckTriggers || [])[0] || "等待新的复审触发器。"}</div>
        ${pm ? `<div class="bullet-item">${pm.lesson}</div>` : ""}
      </div>
    </div>

    <div class="subsection">
      <span class="field-label">Recent Changes</span>
      ${
        replay.length >= 2
          ? `
            <div class="replay-chart-card ${replaySummary.tone}">
              <div class="replay-chart-head">
                <strong>${replaySummary.label}</strong>
                <span class="status-pill ${replaySummary.tone === "muted" ? "deferred" : replaySummary.tone}">
                  ${replay.length} scans
                </span>
              </div>
              ${replayChartSvg(token)}
              <div class="tag-row">
                <span class="tag">Δ PnL ${signedCompactUsd(replaySummary.pnlDeltaUsd)}</span>
                <span class="tag">Δ Edge ${pct(replaySummary.edgeDeltaPct)}</span>
              </div>
            </div>
          `
          : ""
      }
      <div class="bullet-list">
        ${
          replay.length
            ? replay
                .slice()
                .reverse()
                .map(
                  (snapshot) => `
                    <div class="bullet-item">
                      <strong>${replayTimestamp(snapshot.generatedAt)} · ${snapshot.status} · ${laneLabel(snapshot.lane)}</strong>
                      <div class="tag-row">
                        <span class="tag">Net ${pct(snapshot.netEdgePct || 0)}</span>
                        <span class="tag">PnL ${signedCompactUsd(snapshot.expectedNetPnlUsd)}</span>
                      </div>
                    </div>
                  `,
                )
                .join("")
            : `<div class="bullet-item">还没有足够的历史回放数据。</div>`
        }
      </div>
    </div>

    <div class="action-row">
      <button id="journalTrade" class="action-button">记录准备做</button>
      <button id="journalWatch" class="secondary-button">加入观察</button>
      <button id="journalPass" class="secondary-button">明确跳过</button>
      ${pm ? `<button id="journalReview" class="secondary-button">记为复盘</button>` : ""}
    </div>

    <div class="action-row">
      <button id="copyMemo" class="action-button">复制机会摘要</button>
      <button id="openDex" class="secondary-button">打开 DEX 页面</button>
    </div>
  `;

  const copyMemo = document.getElementById("copyMemo");
  const openDex = document.getElementById("openDex");
  const journalTrade = document.getElementById("journalTrade");
  const journalWatch = document.getElementById("journalWatch");
  const journalPass = document.getElementById("journalPass");
  const journalReview = document.getElementById("journalReview");
  const portfolioClose = document.getElementById("portfolioClose");
  const portfolioReopen = document.getElementById("portfolioReopen");
  const inspectorSnoozeReview = document.getElementById("inspectorSnoozeReview");

  copyMemo.addEventListener("click", () => copyText(token.squareDraft || "", copyMemo, "已复制"));
  openDex.addEventListener("click", () => {
    if (token.dexPairUrl) {
      window.open(token.dexPairUrl, "_blank", "noopener,noreferrer");
    }
  });
  journalTrade?.addEventListener("click", () => addJournalEntry(token, "trade", journalTrade));
  journalWatch?.addEventListener("click", () => addJournalEntry(token, "watch", journalWatch));
  journalPass?.addEventListener("click", () => addJournalEntry(token, "pass", journalPass));
  journalReview?.addEventListener("click", () => addJournalEntry(token, "review", journalReview));
  portfolioClose?.addEventListener("click", () => closePortfolioEntry(portfolioEntry.id));
  portfolioReopen?.addEventListener("click", () => reopenPortfolioEntry(portfolioEntry.id));
  inspectorSnoozeReview?.addEventListener("click", () => toggleSnoozeUntilReview(token.symbol));
  dom.inspector.querySelectorAll("[data-inspector-policy-set]").forEach((button) => {
    button.addEventListener("click", () => {
      setSymbolAlertPolicy(token.symbol, button.dataset.inspectorPolicySet);
    });
  });
}

function renderPolicy() {
  dom.policyGrid.innerHTML = policyModules
    .map(
      (module) => `
        <article class="policy-card">
          <div class="policy-head">
            <strong>${module.title}</strong>
            <span class="policy-tag">${module.tag}</span>
          </div>
          <p>${module.desc}</p>
          <div class="tag-row">
            ${module.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderSources() {
  dom.sourceGrid.innerHTML = dataSources
    .map((source) => {
      const health = state.overview.sourceHealth?.[source.key] || { status: "unknown" };
      return `
        <article class="source-card">
          <div class="source-head">
            <span>${source.type}</span>
            <span class="status-pill ${dataStatusClass(health.status)}">${health.status || "unknown"}</span>
          </div>
          <strong>${source.name}</strong>
          <p>${source.desc}</p>
          <div class="tag-row">
            ${source.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          ${health.error ? `<p class="error-copy">${health.error}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderContracts() {
  dom.contractGrid.innerHTML = apiContracts
    .map(
      (contract) => `
        <article class="contract-card">
          <div class="source-head">
            <span>${contract.method}</span>
            <span>internal</span>
          </div>
          <strong>${contract.title}</strong>
          <span class="contract-path">${contract.path}</span>
          <p>${contract.desc}</p>
          <ul class="plain-list">
            ${contract.bullets.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderPipeline() {
  dom.pipelineGrid.innerHTML = pipelineStages
    .map(
      (stage) => `
        <article class="pipeline-card">
          <strong>${stage.title}</strong>
          <p>${stage.desc}</p>
          <ul class="plain-list">
            ${stage.bullets.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

async function copyText(text, button, successText) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    const previous = button.textContent;
    button.textContent = successText;
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1000);
  } catch (error) {
    button.textContent = "复制失败";
    window.setTimeout(() => {
      button.textContent = "复制机会摘要";
    }, 1000);
  }
}

async function fetchBinanceApiSettings() {
  state.binanceSettings.loading = true;
  state.binanceSettings.error = null;

  try {
    const response = await fetch("/api/settings/binance", {
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "读取 Binance API 配置失败");
    }

    state.binanceSettings = {
      ...state.binanceSettings,
      loading: false,
      saving: false,
      testing: false,
      error: null,
      configured: Boolean(payload.configured),
      keyPreview: payload.keyPreview || "",
      spotBaseUrl: payload.spotBaseUrl || "https://api.binance.com",
      futuresBaseUrl: payload.futuresBaseUrl || "https://fapi.binance.com",
      validation: payload.validation || state.binanceSettings.validation,
      form: {
        apiKey: "",
        apiSecret: "",
        spotBaseUrl: payload.spotBaseUrl || "https://api.binance.com",
        futuresBaseUrl: payload.futuresBaseUrl || "https://fapi.binance.com",
      },
    };
  } catch (error) {
    state.binanceSettings.loading = false;
    state.binanceSettings.error = error.message;
  } finally {
    renderBinanceApiPanel();
  }
}

function binanceSettingsRequestPayload({ clearCredentials = false } = {}) {
  return {
    clearCredentials,
    apiKey: clearCredentials ? "" : state.binanceSettings.form.apiKey,
    apiSecret: clearCredentials ? "" : state.binanceSettings.form.apiSecret,
    spotBaseUrl: state.binanceSettings.form.spotBaseUrl,
    futuresBaseUrl: state.binanceSettings.form.futuresBaseUrl,
  };
}

async function testBinanceApiSettings() {
  state.binanceSettings.testing = true;
  state.binanceSettings.error = null;
  renderBinanceApiPanel();

  try {
    const response = await fetch("/api/settings/binance/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(binanceSettingsRequestPayload()),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Binance API 测试失败");
    }

    state.binanceSettings = {
      ...state.binanceSettings,
      configured: Boolean(payload.configured),
      keyPreview: payload.keyPreview || state.binanceSettings.keyPreview,
      spotBaseUrl: payload.spotBaseUrl || state.binanceSettings.spotBaseUrl,
      futuresBaseUrl: payload.futuresBaseUrl || state.binanceSettings.futuresBaseUrl,
      validation: payload.validation || state.binanceSettings.validation,
    };
  } catch (error) {
    state.binanceSettings.error = error.message;
  } finally {
    state.binanceSettings.testing = false;
    renderBinanceApiPanel();
  }
}

async function saveBinanceApiSettings({ clearCredentials = false } = {}) {
  state.binanceSettings.saving = true;
  state.binanceSettings.error = null;
  renderBinanceApiPanel();

  try {
    const response = await fetch("/api/settings/binance", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(binanceSettingsRequestPayload({ clearCredentials })),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "保存 Binance API 配置失败");
    }

    const settings = payload.settings || {};
    state.binanceSettings = {
      ...state.binanceSettings,
      saving: false,
      testing: false,
      error: null,
      configured: Boolean(settings.configured),
      keyPreview: settings.keyPreview || "",
      spotBaseUrl: settings.spotBaseUrl || "https://api.binance.com",
      futuresBaseUrl: settings.futuresBaseUrl || "https://fapi.binance.com",
      validation: settings.validation || state.binanceSettings.validation,
      form: {
        apiKey: "",
        apiSecret: "",
        spotBaseUrl: settings.spotBaseUrl || "https://api.binance.com",
        futuresBaseUrl: settings.futuresBaseUrl || "https://fapi.binance.com",
      },
    };

    startRealtimeSync({ force: true });
  } catch (error) {
    state.binanceSettings.saving = false;
    state.binanceSettings.error = error.message;
    renderBinanceApiPanel();
    return;
  }

  renderBinanceApiPanel();
}

async function fetchOverview({ silent = false } = {}) {
  if (state.loading && silent) return;

  state.loading = true;
  renderTopbar();

  try {
    const response = await fetch(buildLiveUrl("/api/live/overview", state.activeMandate, { force: !silent }), {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "实时数据同步失败");
    }

    applyOverviewPayload(payload);
  } catch (error) {
    state.error = error.message;
    if (!state.overview?.tokens?.length || state.overview.mode !== "demo-fallback") {
      state.overview = fallbackOverview;
    }
  } finally {
    state.loading = false;
    render();
    scheduleNextPoll();
  }
}

function scheduleNextPoll(delayMs = null) {
  window.clearTimeout(state.pollTimer);

  if (streamSupported() && ["live", "connecting"].includes(state.streamStatus)) {
    return;
  }

  state.pollTimer = window.setTimeout(() => {
    fetchOverview({ silent: true });
  }, delayMs ?? state.overview.pollMs ?? fallbackOverview.pollMs);
}

function connectLiveStream({ force = false } = {}) {
  if (!streamSupported()) {
    state.streamStatus = "fallback";
    renderTopbar();
    fetchOverview();
    return;
  }

  window.clearTimeout(state.pollTimer);
  disconnectLiveStream();
  state.streamStatus = "connecting";
  state.streamError = null;
  state.loading = true;
  renderTopbar();

  const source = new EventSource(buildLiveUrl("/api/live/stream", state.activeMandate));
  state.streamSource = source;

  if (force) {
    fetchOverview();
  }

  source.addEventListener("overview", (event) => {
    if (state.streamSource !== source) return;

    try {
      const payload = JSON.parse(event.data);
      applyOverviewPayload(payload);
      state.streamStatus = "live";
      state.streamLastEventAt = Date.now();
      state.streamError = null;
      state.loading = false;
      window.clearTimeout(state.pollTimer);
      render();
    } catch (error) {
      state.streamStatus = "reconnecting";
      state.streamError = error.message;
      state.loading = false;
      renderTopbar();
      scheduleNextPoll(5000);
    }
  });

  source.addEventListener("heartbeat", () => {
    if (state.streamSource !== source) return;
    state.streamLastEventAt = Date.now();
    renderTopbar();
  });

  source.addEventListener("snapshot-error", (event) => {
    if (state.streamSource !== source) return;

    try {
      const payload = JSON.parse(event.data);
      state.streamError = payload.error || "实时流快照失败";
    } catch (error) {
      state.streamError = "实时流快照失败";
    }

    state.loading = false;

    if (!state.streamLastEventAt) {
      disconnectLiveStream();
      state.streamStatus = "fallback";
      renderTopbar();
      fetchOverview();
      return;
    }

    state.streamStatus = "reconnecting";
    renderTopbar();
    scheduleNextPoll(5000);
  });

  source.onerror = () => {
    if (state.streamSource !== source) return;

    state.loading = false;

    if (!state.streamLastEventAt) {
      disconnectLiveStream();
      state.streamStatus = "fallback";
      renderTopbar();
      fetchOverview();
      return;
    }

    state.streamStatus = "reconnecting";
    renderTopbar();
    scheduleNextPoll(5000);
  };
}

function startRealtimeSync({ force = false } = {}) {
  if (streamSupported()) {
    connectLiveStream({ force });
    return;
  }

  state.streamStatus = "fallback";
  fetchOverview({ silent: false });
}

function render() {
  dom.riskValue.textContent = state.riskLimit;
  dom.fitValue.textContent = state.fitFloor;

  populateSymbolList();
  renderTopbar();
  renderSummary();
  renderHeroSpotlight();
  renderCommandDeck();
  renderMandate();
  renderBinanceApiPanel();
  renderQuickCheck();
  renderFilters();
  renderApprovalDesk();
  renderAlertFeed();
  renderRegimeOpsPanel();
  renderPortfolioWatchtower();
  renderPositionAlertPanel();
  renderAlertPolicyPanel();
  renderShiftFeed();
  renderKillDesk();
  renderPostmortemFeed();
  renderReapprovalQueue();
  renderJournalPanel();
  renderPortfolioPanel();
  renderPolicy();
  renderSources();
  renderContracts();
  renderPipeline();

  const list = filteredTokens();
  ensureSelection(list);
  const selectedToken = list.find((token) => token.symbol === state.selected) || list[0] || state.overview.tokens[0];

  renderCapitalQueue(list);
  renderInspector(selectedToken);
}

dom.refreshButton.addEventListener("click", () => {
  fetchOverview();
});

dom.quickCheckButton.addEventListener("click", () => {
  runQuickCheck();
});

dom.quickCheckInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runQuickCheck();
  }
});

dom.riskSlider.addEventListener("input", (event) => {
  state.riskLimit = Number(event.target.value);
  render();
});

dom.fitSlider.addEventListener("input", (event) => {
  state.fitFloor = Number(event.target.value);
  render();
});

dom.approvalOnlyToggle.addEventListener("change", (event) => {
  state.approvalOnly = event.target.checked;
  render();
});

state.journalEntries = loadJournalEntries();
state.positionAlerts = loadPositionAlerts();
state.positionAlertPrefs = loadPositionAlertPrefs();
render();
fetchBinanceApiSettings();
startRealtimeSync();
