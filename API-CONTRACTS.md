# Rift Radar API Contracts

这份文档服务的是新的 `Real Opportunity Terminal`。

对外我们卖的是“真实可盈利机会”，但内部仍然保留 `warrant` 这层判断对象，原因很简单：

- 前台要展示机会
- 后台要保留真假过滤、执行路径、复审条件
- 所以接口返回的是 `机会视图 + 内部判断单`

## 核心对象

### Opportunity Case

每个标的不再只是一个 token row，而是一张机会案例卡。

前台主要关心：

- `symbol`
- `dexSpotSpreadPct`
- `spotPerpBasisPct`
- `opportunity.grossEdgePct`
- `opportunity.executionCostPct`
- `opportunity.netEdgePct`
- `opportunity.score`
- `opportunity.band`
- `opportunity.referenceCapitalUsd`
- `opportunity.suggestedNotionalUsd`
- `opportunity.expectedGrossPnlUsd`
- `opportunity.expectedNetPnlUsd`
- `opportunity.whyNow`
- `opportunity.stateShift`
- `opportunity.replay`
- `route`
- `squareDraft`
- `executionBrief`
- `postmortem`
- `warrant.status`
- `warrant.lane`
- `warrant.fitScore`
- `warrant.fragilityScore`
- `warrant.ttlMinutes`
- `warrant.reasonChain`
- `warrant.invalidationRules`
- `warrant.recheckTriggers`

也就是说，`warrant` 现在是后台判断核心，不再是前台叙事核心。

### Execution Brief

每个机会还会带一张结构化执行摘要，给前端直接渲染：

- `posture`
- `primaryAction`
- `summary`
- `breakEvenEdgePct`
- `roomAfterCostPct`
- `rewardCostRatio`
- `capitalAtRiskUsd`
- `expectedNetPnlUsd`
- `checklist`
- `killSwitch`
- `nextReview`

### Postmortem

失败或失效机会还会带一张结构化复盘卡：

- `kind`
- `headline`
- `rootCause`
- `lesson`
- `nextScreen`
- `avoidedLossUsd`
- `previousStatus`
- `currentStatus`

### Journal / Portfolio Layer

这两层当前不走后端 API，而是前端本地持久化：

- `Journal Mode`
  - 记录 `准备做 / 加观察 / 明确跳过 / 记为复盘`
- `Portfolio Mode`
  - 把 `准备做` 升级成 paper position
  - 额外保留 `entryPriceUsd / entryNotionalUsd / entryNetEdgePct / positionStatus / closedAt`
- `Portfolio Watchtower`
  - 不新增后端接口
  - 前端用 `paper position + live token` 本地派生高价值组合提醒
  - 重点只看：`thesis broken / net edge lost / drawdown / ttl review / winner`
- `My Position Alerts`
  - 也是前端本地层，不新增后端接口
  - 从 `Portfolio Watchtower` 派生出 inbox 历史
  - 额外保留 `readAt / createdAt / desktopEnabled / status / resolvedAt / lifecycle` 这类个人提醒状态
  - 还保留 `minInboxSeverity / minDesktopSeverity / desktopCriticalOnly / mutedSymbols / snoozedUntilBySymbol / symbolPolicies`
  - 提醒签名使用稳定问题类型，而不是 headline 文案，避免同一问题被误判成一串新提醒
- `Alert Policy Center`
  - 同样是前端本地层，不新增后端接口
  - 按 symbol 保留提醒策略
  - 当前支持 `global / reopened / inbox / critical / mute`
  - 这些策略会同时影响 inbox 收录和 desktop 通知
  - `reopened` 只在问题解除后再次出现时恢复提醒，用于压低重复噪音
  - 全局还支持 `Quiet / Focus / Hunter` 三档工作模式
  - 这三档不是单独存字段，而是由 `minInboxSeverity / minDesktopSeverity / desktopCriticalOnly` 的组合推导
  - 当前还支持 `autoFollowRecommendedPreset`
  - 开启后会根据 `marketContext + approvalSummary + alertFeed + portfolio watchtower` 自动更新全局 preset
- `Regime Ops`
  - 也是前端派生层，不新增后端接口
  - 它消费 `marketContext / approvalSummary / alertFeed / portfolio watchtower`
  - 输出的是结构化操作简报，不是新数据源
- `Command Deck`
  - 同样是前端派生层，不新增后端接口
  - 它消费 `approvalSummary / alertFeed / desk / portfolio watchtower / current preset`
  - 输出的是“今天先做什么”的优先队列与复制文案

这样做的原因是：

- 当前先把“机会判断 -> 自己的决策 -> 持续跟踪”这条产品链路做通
- 不引入账号系统也能先形成个人工作流

## 现有接口

### 1. GET `/api/live/overview`

用途：

- 给首页 `Top Opportunities Now`
- 给 `Killed Fake Opportunities`
- 给 `Watch & Recheck`
- 给 `Opportunity Market Board`

返回重点：

- `mode`
- `generatedAt`
- `staleAt`
- `staleReason`
- `marketContext`
- `userMandate`
- `approvalSummary`
- `desk`
- `alertFeed`
- `postmortemFeed`
- `shiftFeed`
- `sourceHealth`
- `tokens[]`

设计要求：

- `tokens[].warrant` 必须完整
- `tokens[].opportunity` 也必须完整，它是前台真正的机会展示层
- `alertFeed` 只返回高价值提醒，不返回普通波动
- `postmortemFeed` 只返回值得写入复盘墙的失败案例
- `desk` 返回 symbol 引用，不重复塞整份对象
- 当上游某个源失败时，接口可以返回 `degraded`
- 当核心实时源整体不可用时，接口必须优先返回 `stale-fallback`
  - 优先使用最近一次成功的完整 overview 快照
  - 如果连完整快照都没有，再退化到基于 `data/opportunity-history.json` 的应急监控快照
  - 不允许把这种状态继续包装成 `live`
- 支持通过 query params 覆盖当前 mandate：
  - `minFitApprove`
  - `maxFragilityApprove`
  - `maxAuditRisk`
  - `maxRiskBudgetPct`
  - `referenceCapitalUsd`
  - `allowFutures`
  - `allowBasis`
  - `allowResearch`

### 2. GET `/api/live/stream`

用途：

- 首页实时机会流
- 顶部 `Stream Status`
- `Alert Center / What Changed / Command Deck` 的实时刷新

传输方式：

- `text/event-stream`
- 前端使用 `EventSource`
- 当前会推送：
  - `overview`
  - `heartbeat`
  - `snapshot-error`

设计要求：

- `overview` 的 payload 结构与 `/api/live/overview` 保持一致
- 如果实时源不可用但后端已经生成 `stale-fallback`，SSE 仍应继续推 `overview`
  - 不应该只剩 `snapshot-error`
- 同一 mandate 下的流式订阅应复用同一轮 live snapshot，避免重复写历史
- 前端必须保留 HTTP 轮询兜底，不能让 SSE 成为单点故障
- 顶部必须能显式展示当前实时链路状态：`SSE Live / SSE Reconnecting / Poll Fallback`

### 3. GET `/api/live/token/:symbol`

用途：

- `Opportunity Check`
- 右侧详情面板
- 未来插件 / bot / 下单前弹窗

返回重点：

- `generatedAt`
- `marketContext`
- `token`

### 4. GET `/api/health`

用途：

- 本地启动检查
- uptime / launcher 健康探针

### 5. POST `/api/warrant/check`

用途：

- 下单前快速判断
- `Quick Check`
- 未来浏览器插件 / bot / 下单前弹窗

### 6. GET `/api/settings/binance`

用途：

- 读取当前 Binance API 配置状态
- 前端渲染 `连接你的 Binance 实时通道`

返回重点：

- `configured`
- `keyPreview`
- `spotBaseUrl`
- `futuresBaseUrl`
- `spotFallbackBaseUrls`
- `futuresFallbackBaseUrls`
- `validation`

说明：

- 只返回掩码后的 Key，不返回 Secret
- `validation.status` 可能是 `missing / ok / partial / error`

### 7. POST `/api/settings/binance/test`

用途：

- 在不写入 `.env` 的情况下测试 Binance API Key / Secret 和基础地址是否可用

请求重点：

- `apiKey`
- `apiSecret`
- `spotBaseUrl`
- `futuresBaseUrl`

返回重点：

- 与 `GET /api/settings/binance` 同结构
- 但 `validation` 使用当前测试请求的临时配置

### 8. POST `/api/settings/binance`

用途：

- 把 Binance API Key / Secret 和基础地址写入本地 `.env`
- 写入后立即刷新 Goldlane 的实时链路

请求重点：

- `apiKey`
- `apiSecret`
- `spotBaseUrl`
- `futuresBaseUrl`
- `clearCredentials`

设计要求：

- `.env` 必须服务端写入，前端不直接接触文件系统
- Secret 不应回传给前端
- 保存成功后应立即清空相关 live cache
- 下一轮 `/api/live/overview` 必须能读取到新的 Binance 配置

- `Quick Check`
- 浏览器插件
- Telegram / bot
- 下单前弹窗

请求示例：

```json
{
  "symbol": "CAKE",
  "mandate": {
    "minFitApprove": 80,
    "maxFragilityApprove": 50,
    "maxAuditRisk": 65,
    "maxRiskBudgetPct": 18,
    "referenceCapitalUsd": 25000,
    "allowFutures": false,
    "allowBasis": false,
    "allowResearch": true
  }
}
```

响应重点：

- `generatedAt`
- `verdict`
- `userMandate`
- `token`

其中 `token.opportunity` 已经包含：

- `grossEdgePct`
- `executionCostPct`
- `netEdgePct`
- `score`
- `band`
- `referenceCapitalUsd`
- `suggestedNotionalUsd`
- `expectedGrossPnlUsd`
- `expectedNetPnlUsd`
- `whyNow`
- `stateShift`
- `replay`

这条接口现在已经是真实可用接口，不再只是预留。

## 历史快照

- `GET /api/live/overview` 每次成功扫描后，都会把每个标的最新的机会快照写入 `data/opportunity-history.json`
- 当前保留最近 `24` 轮 replay
- `shiftFeed` 和 `token.opportunity.replay` 会优先消费这份历史，而不是只依赖当前进程内状态
- 前端会直接用 `token.opportunity.replay` 画机会时间轴，不再只是把历史数据做成文字列表

## Alert Feed 规则

`alertFeed` 目前只推送这几类高价值变化：

- `window-opened`
  - 机会从非 Approved 升级到 `Approved`
- `window-lost`
  - 已批准机会失去可执行资格
- `fake-edge`
  - 标的被降级为 `Revoked`
- `net-pnl-cross`
  - 预估净收益从负转正
- `pnl-expanding`
  - 已批准机会的净收益或机会分显著抬升
- `ttl-review`
  - 已批准机会进入短 TTL 复审区

设计原则：

- 不提醒所有波动
- 只提醒“值得马上处理”的变化
- 默认按 `high -> medium -> low` 排序
- `Approved` 与 `window-opened` 默认要求净边际在扣掉执行成本后仍然为正

## Postmortem Feed 规则

`postmortemFeed` 目前优先收这些案例：

- 曾经 `Approved`，后来失效的机会
- `Revoked` 的伪机会和坏市场
- 毛边际存在，但被执行成本吃掉的窗口
- 被风险闸门挡下、但表面上看起来仍“很诱人”的标的

设计原则：

- 不只是告诉用户“错过了什么”，还要告诉用户“避免了什么”
- 复盘卡必须回答：为什么死、应该学到什么、下次先看什么

## 刷新策略

### Hot Loop

- 周期：`30 秒`
- 内容：`Binance spot / futures + DexScreener`
- 目标：刷新机会排序、edge 和 lane

### Review Loop

- 周期：`3-5 分钟`
- 内容：`GoPlus + CoinGecko + 规则重算`
- 目标：刷新 fit、fragility、risk budget 和 veto

### Window Review

- 周期：`15 分钟或 TTL 到期`
- 内容：`watch / recheck queue`
- 目标：检查机会是否还成立、是否应该降级或移除

### Explain Path

- 触发：用户点击复制 / 发布 / 复盘
- 内容：`Square Draft / decision notes / postmortem`
- 目标：不让文本生成进入秒级主链路

## 当前原则

这套接口的产品原则已经不是“返回尽可能多的数据”，而是：

1. 先把真假机会区分开
2. 再把少数可执行机会推到前面
3. 最后再解释为什么它值得做或为什么别碰

所以现在的 API 设计，本质上服务的是：

**一个寻找真实可盈利机会的交易决策终端。**
