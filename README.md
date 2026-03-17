# Goldlane

<p align="center">
  <img src="./assets/binance-logo-card.svg" alt="Binance logo" width="88" />
</p>

<p align="center">
  <strong>一个面向 Binance 场景的实时机会终端</strong>
</p>

<p align="center">
  不做热闹榜，只做真钱机会。先筛掉假机会，再把真正可执行、利润还活着的窗口推到你面前。
</p>

<p align="center">
  <img src="./assets/goldlane-readme-cover.svg" alt="Goldlane cover" width="100%" />
</p>

## Goldlane 是什么

Goldlane 是一个给真实交易使用的 Web3 机会终端。

它的目标不是告诉你“哪里在涨”，而是帮你更快回答这 4 个更重要的问题：

1. 这个机会是真的吗？
2. 这个机会现在能做吗？
3. 应该走 `spot`、`futures`、`basis`，还是先别做？
4. 如果我已经在盯它，什么时候应该复审或放弃？

所以它不是普通行情面板，也不是单纯的信号榜。  
它更像一个面向 Binance 场景的 **实时决策层**。

## 它解决什么问题

大多数交易工具都有同一个问题：给你的数据很多，但真正有用的判断很少。

Goldlane 重点解决的是这几类常见误判：

- 把坏市场当成套利机会
- 把大价差当成真钱机会
- 把有热度的币误认为现在就能做
- 把已经失效的 thesis 继续留在注意力中心
- 因为信息太多，反而不知道现在先处理什么

Goldlane 的核心原则只有一句：

**先杀掉假机会，再展示真机会。**

## 适合谁

- 需要同时看 Binance 和链上价格的人
- 想做 Binance + DEX 联动判断的人
- 不想被“看起来很大”的假价差骗的人
- 想把盯盘、复审、个人 thesis 管理收成一套工作台的人

## 用户第一次打开应该怎么用

### 第一步：先看 `Opportunity Spotlight`

这是首屏最上方的唯一重点卡。

你能直接看到：

- 当前状态
- 预估净收益
- 建议执行通道
- 复审时点

如果这张卡都不成立，就没必要先翻全量市场。

### 第二步：看 `Top Opportunities Now`

这里是当前最值得处理的机会队列。

每张卡只保留 4 个对交易最有用的字段：

- 能不能做
- 预估净收益
- 走哪条 lane
- 多久后复审

### 第三步：看 `Alert Center`

这里只保留真正值得处理的变化：

- 机会转正
- 机会失效
- 净收益转负
- 临近复审

它不是消息流，而是你的实时动作面板。

### 第四步：看 `Do Not Touch`

这是 Goldlane 的一个关键模块。

它会明确告诉你：

- 哪些窗口看起来很香，但别碰
- 哪些价差更像坏市场，不是真套利
- 哪些机会已经被成本或失活通道吃掉

这块不是装饰，它直接影响你少踩多少坑。

### 第五步：下单前用 `Quick Check`

在首屏右侧输入 symbol，Goldlane 会直接给一个简化结论：

- 现在能不能做
- 建议走哪条 lane
- 剩余净边际够不够
- 多久后要重新看

如果你只想保留一个高频入口，那就是 `Quick Check`。

## 页面结构说明

| 模块 | 你应该怎么理解它 |
| --- | --- |
| `Opportunity Spotlight` | 现在先看什么 |
| `Top Opportunities Now` | 当前最值得处理的机会 |
| `Alert Center` | 盘中最需要立刻处理的变化 |
| `Opportunity Radar` | 哪些机会在升温，哪些在降级 |
| `Do Not Touch` | 看起来有利润，但实际上别碰的窗口 |
| `My Watchtower` | 你自己已经在盯的 thesis，现在是否变坏 |
| `Portfolio Mode` | 你的 paper positions 和 thesis 跟踪面板 |
| `Market Board` | 全量机会队列，只在你要扩展搜索范围时再看 |
| `Inspector` | 当前选中机会的动作面板，不是原始指标堆叠 |

## 盘前 / 盘中 / 盘后怎么用

### 盘前

先看：

- `Opportunity Spotlight`
- `Top Opportunities Now`

目标：

- 找出今天最值得处理的 1 到 3 个机会

### 盘中

先看：

- `Alert Center`
- `My Watchtower`

目标：

- 处理变化，不是刷新噪音

### 盘后

先看：

- `Do Not Touch`
- `Portfolio Mode`

目标：

- 复盘自己今天避开了什么坑
- 哪些 thesis 还值得继续盯

## 实时数据怎么接

Goldlane 现在已经支持在 Web 界面直接配置 Binance API，并且由后端写入本地 `.env`。

### 推荐配置方式

1. 生成一个 **只读** 的 Binance API Key / Secret  
2. 打开首页右侧的 `连接你的 Binance 实时通道`
3. 填入：
   - `API Key`
   - `API Secret`
   - `Spot API Base`
   - `Futures API Base`
4. 先点 `测试连接`
5. 再点 `保存到 .env`
6. 保存后 Goldlane 会立即重新拉起实时链路

### 手动配置方式

```bash
cp .env.example .env
```

然后填写：

```bash
BINANCE_API_KEY=
BINANCE_API_SECRET=
BINANCE_SPOT_API_BASE=https://api.binance.com
BINANCE_FUTURES_API_BASE=https://fapi.binance.com
BINANCE_SPOT_FALLBACK_BASES=https://api1.binance.com,https://api2.binance.com,https://api3.binance.com,https://data-api.binance.vision
BINANCE_FUTURES_FALLBACK_BASES=https://fapi1.binance.com,https://fapi2.binance.com,https://fapi3.binance.com
```

### 安全说明

- `.env` 已加入 `.gitignore`
- 前端不会直接读取你的 Secret
- Secret 只保留在本地服务端，用来校验连接和增强实时链路
- 建议只给只读权限，不要给提币和高风险权限

## 实时模式说明

Goldlane 不会假装所有数据都一样新。

| 模式 | 含义 | 你该怎么理解 |
| --- | --- | --- |
| `live` | 核心实时源正常 | 可以作为真实盘中参考 |
| `degraded` | 部分实时源变慢或缺失 | 可以继续盯，但要更保守 |
| `stale-fallback` | 上游核心源不可用，系统退回最近有效快照 | 适合监控和复审，不适合高信心新开仓 |
| `demo-fallback` | 纯前端演示回退 | 只用于本地展示连续性 |

一句实话：

**配置了 Binance API，不等于自动拥有 full-live。**  
如果你本机到 Binance / DEX 上游网络不通，Goldlane 仍然会退到 `degraded` 或 `stale-fallback`。  
这不是产品假装 live，而是它在诚实地告诉你当前数据新鲜度。

## 本地启动

```bash
npm start
```

默认地址：

```bash
http://localhost:4173
```

可选环境变量：

```bash
HOST=127.0.0.1
PORT=4173
RIFT_HTTP_TRANSPORT=fetch
```

## 常用接口

### 用户最会用到的

- `GET /api/live/overview`
- `GET /api/live/stream`
- `GET /api/live/token/:symbol`
- `POST /api/warrant/check`

### 配置相关

- `GET /api/settings/binance`
- `POST /api/settings/binance/test`
- `POST /api/settings/binance`

### 健康检查

- `GET /api/health`

完整字段见：[API-CONTRACTS.md](./API-CONTRACTS.md)

## 数据来源

### 快路径

- Binance Spot 公共行情
- Binance USD-M Futures 上下文
- DexScreener 价格与流动性

### 中速校验层

- GoPlus 风险信息
- CoinGecko 市场上下文
- Fear & Greed 市场环境

## 界面预览

<p align="center">
  <img src="./ui-validation.png" alt="Goldlane UI screenshot" width="100%" />
</p>

## 常见问题

### 1. 为什么我配置了 Binance API，还是不是 `live`？

因为 `live` 取决于两件事：

- 你的 Binance API 是否有效
- 你这台机器到 Binance / DEX 上游是否可达

如果网络层有问题，Goldlane 会诚实退到 `degraded` 或 `stale-fallback`。

### 2. 为什么要保留 `Do Not Touch`？

因为真实交易里，“少做错”通常比“多发现几个机会”更值钱。  
Goldlane 不是单纯找利润，而是专门过滤 **看起来像机会、其实做不了** 的窗口。

### 3. 为什么用 `.env` 保存？

因为这是本地产品化最稳的方式：

- 用户真的能配置
- 服务端真的能读取
- 前端不需要直接接触 Secret
- 重启服务后配置仍然存在

## 当前边界

- 这是 `live beta`，不是官方 Binance Skills 直连产品
- 预估净收益、机会分数、执行建议属于内部估算，不是收益承诺
- Journal、Portfolio、Alert Policy 目前仍是浏览器本地状态
- full-live 仍然依赖本机到 Binance / DEX 上游的网络可达性

## 已完成验证

本地已经实际验证：

- `node --check app.js`
- `node --check server.js`
- `/api/live/overview` 在上游不可用时会回到 `stale-fallback`，而不是直接 `500`
- `/api/live/stream` 在 stale 模式下仍会持续推送 `overview`
- `/api/settings/binance` 已支持读取、测试并把 Binance API 持久化到 `.env`
- 页面已接入 Binance logo，并已加入首屏 Binance API 配置面板
- `data/last-live-overview.json` 和 `data/opportunity-history.json` 改为运行时本地生成，不再污染仓库提交

## 仓库结构

```text
.
├── assets/
│   ├── binance-logo-card.svg
│   └── goldlane-readme-cover.svg
├── data/
│   └── .gitkeep
├── index.html
├── styles.css
├── app.js
├── server.js
├── API-CONTRACTS.md
├── README.md
├── .env.example
└── ui-validation.png
```

## 接下来最值得做的

- 继续把当前机器的 Binance / DEX full-live 可达性修到更稳
- 把个人提醒接到 Telegram / Webhook
- 把 Portfolio 和 Mandate 做成服务端持久化
- 增加更清晰的 replay 时间轴和 case memory
