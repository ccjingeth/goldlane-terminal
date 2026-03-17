# Goldlane

`Goldlane` 现在对外不再主打“资本审批台”，而是一个专门寻找 **真实可盈利机会** 的交易决策工具。

它做的不是告诉你哪里在涨，而是把下面四件事压成一个可执行结果：

- 这个窗口有没有真实利润空间
- 这个利润空间能不能真的执行
- 这是不是假机会、坏市场或脏流动性
- 现在应该走 `spot / futures / basis / watch / skip` 哪条路径

现在数据链路也已经收成真正的实时模式：

- 前端优先使用 `EventSource` 订阅 `/api/live/stream`
- 顶部会直接显示 `SSE Live / SSE Reconnecting / Poll Fallback`
- 如果流式链路异常，前端会自动回退到 HTTP 轮询，不会让整站因为实时通道断开而失活
- 如果核心 live 源暂时不可用，后端会返回 `stale-fallback`
  - 这不是 demo，也不是空白错误页
  - 而是“最近一次有效机会快照”或“基于历史机会记录生成的保底监控快照”
  - 页面会明确显示 `Stale Snapshot`，提醒你这时适合监控和复审，不适合把它当 full live 下新单

默认原则也更收紧了：

- 只有扣掉执行成本后，净边际仍然为正，机会才会被批准到 `Approved`
- `Alert Center` 只为真正可赚钱或刚刚失效的窗口发声，不为普通波动发声

## 新定位

一句话：

`Goldlane` 是一个专门寻找“真实可盈利机会”的实时交易终端，前台展示机会，后台用风控和执行过滤器拦掉假机会。

现在的首页已经改成机会导向：

- `Top Opportunities Now`
- `Alert Center`
- `Command Deck`
- `Regime Ops`
- `Portfolio Watchtower`
- `My Position Alerts`
- `Alert Policy Center`
- `Postmortem`
- `Journal Mode`
- `Portfolio Mode`
- `Killed Fake Opportunities`
- `Watch & Recheck`
- `Opportunity Market Board`
- `Opportunity Check`

## 这轮升级做了什么

- 首页叙事从 `Capital Warrant Desk` 改成 `Real Opportunity Terminal`
- 卡片和详情面板不再先强调审批，而是先展示：
  - `Opportunity Score`
  - `Executable Edge`
  - `Lane`
  - `TTL`
  - `How To Execute`
  - `Execution Brief`
- `Quick Check` 现在会直接告诉你：
  - 这是不是一个真实可盈利机会
  - 当前能不能做
  - 应该怎么做
- 后端现在会直接给每个标的返回 `opportunity` 对象：
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
- 后端现在还会返回 `executionBrief`
  - `posture`
  - `primaryAction`
  - `summary`
  - `breakEvenEdgePct`
  - `roomAfterCostPct`
  - `rewardCostRatio`
  - `capitalAtRiskUsd`
  - `checklist`
  - `killSwitch`
  - `nextReview`
- 后端现在还会返回 `postmortem`
  - `kind`
  - `headline`
  - `rootCause`
  - `lesson`
  - `nextScreen`
  - `avoidedLossUsd`
- 首页新增 `What Changed`
  - 用来显示机会状态和净边际的跃迁，而不是只展示静态列表
- 首页新增 `Alert Center`
  - 只推送高价值提醒：机会转正、净收益转正、机会失效、短 TTL 复审
  - 支持按 `高 / 中 / 低` 优先级筛选，不让提醒区退化成噪音流
- 首页顶部新增 `Stream Status`
  - 用来明确告诉用户当前是 `SSE Live` 还是 `Poll Fallback`
  - 不再让“实时”只停留在文案层
- 后端新增 `last good snapshot` 兜底
  - live 成功时会把最近一次成功的完整 overview 落盘到 `data/last-live-overview.json`
  - 这样即使服务重启且外部实时源短时不可用，也不会直接退化成 500
- 首页新增 `Command Deck`
  - 把真钱机会、组合风险、伪机会过滤和当前 preset 压成一张“今日作战卡”
  - 会直接排出 `Priority 1 / Priority 2 / Priority 3 / Do Not Touch`
  - 支持一键聚焦首要任务和复制今日作战卡
- 首页新增 `Regime Ops`
  - 会把 `Fear & Greed / regime / 已批准机会数 / fake ratio / 组合压力` 压成一张操作简报
  - 不只告诉你建议哪个 preset，还会告诉你为什么今天该保守或该主动
  - 现在已经支持 `使用市场建议 / 自动跟随建议`
- 首页新增 `Postmortem`
  - 专门解释“这单子为什么死了、为什么别继续做、下次该先看什么”
- 首页新增 `Journal Mode`
  - 可以把机会记成 `准备做 / 加观察 / 明确跳过 / 记为复盘`
  - 当前使用浏览器本地持久化，不依赖后端账号系统
- 首页新增 `Portfolio Mode`
  - 会把 `准备做` 的 Journal 记录升级成持续跟踪的 paper position
  - 会保留入场价格、入场 size、持有时长、当前 thesis 状态、浮动 Mark 和一键关单/重开
  - 目标不是替代真实账户，而是把“我当时为什么想做、现在还该不该继续做”持续留在同一个界面里
- 首页新增 `Portfolio Watchtower`
  - 专门盯你已经记成 `准备做` 的机会，不再把公共提醒和自己的组合混在一起
  - 会优先识别：`thesis 已坏`、`净边际转负`、`明显回撤`、`短 TTL 复审`
  - 组合层提醒完全由前端本地持仓快照和实时 live token 联合推导，不依赖额外后端状态
- 首页新增 `My Position Alerts`
  - 会把 watchtower 里的高价值变化收进你自己的提醒箱
  - 支持 `未读 / 进行中 / 已解除 / 全部 / 高 / 中 / 低` 过滤
  - 支持浏览器桌面通知权限，后续轮询只对新增提醒发通知，不重复轰炸
  - 现在还支持提醒生命周期：`Active / Resolved / Reopened`
  - 也就是说，问题出现、问题解除、问题再次出现，会分别留下痕迹
  - 现在还支持 `Inbox 阈值 / Desktop 阈值 / 桌面仅关键 / Mute Symbol / 静默到复审`
  - 现在还支持一键工作模式：`Quiet / Focus / Hunter`
  - 现在会根据 `Fear & Greed / regime / 已批准机会数 / 组合高优先压力` 自动给出当前更适合的 preset 建议
  - 并支持 `自动跟随建议`
  - 提醒不再是越多越好，而是能按你的工作方式变得更安静
- 首页新增 `Alert Policy Center`
  - 可以按 symbol 单独设置 `Global / Reopened Only / Inbox Only / High Only / Muted`
  - 同时支持全局一键工作模式：`Quiet / Focus / Hunter`
  - `Quiet` 只保留真正高优先变化
  - `Focus` 是默认平衡档
  - `Hunter` 会放宽阈值，尽量不漏掉新窗口
  - 如果你打开 `自动跟随建议`，系统会在下一轮 live 扫描或组合状态变化后自动把全局 preset 切到建议档位
  - `Global` 跟随全局阈值
  - `Reopened Only` 只在问题解除后再次出现时才重新提醒，适合不想被重复噪音打断的 symbol
  - `Inbox Only` 继续进个人提醒箱，但不再弹桌面
  - `High Only` 只保留高优先变化
  - `Muted` 会把这个 symbol 完全移出个人提醒流
  - 这套规则会同时影响 `My Position Alerts / Portfolio Mode / Inspector`
- `Mandate` 现在新增 `Reference Capital`
  - 前端会把它直接映射到 `Suggested Size` 和 `Est Net PnL`
- 机会历史现在会落盘到 `data/opportunity-history.json`
  - `What Changed` 不再只靠进程内内存
  - Inspector 可以直接回放最近几轮机会变化
  - Inspector 现在会把 replay 画成时间轴，而不是只堆历史列表
- `Mandate` 仍然保留，但变成内部过滤器
  - 也就是前台卖机会，后台继续做真假机会筛选

## 实时数据层

当前默认聚合：

- Binance Spot / Futures 公共行情
- DexScreener DEX 价格、流动性、成交倾斜
- GoPlus 安全信号
- CoinGecko 市值 / 排名 / 趋势
- Fear & Greed 市场情绪

`CryptoCompare` 仍是可选增强层，没有 key 也不影响主链路。

## 文件

- [index.html](/Users/cc/Desktop/CodeX/binance-skills-rift-radar/index.html): 新的机会终端页面结构
- [styles.css](/Users/cc/Desktop/CodeX/binance-skills-rift-radar/styles.css): 机会终端视觉系统与布局
- [app.js](/Users/cc/Desktop/CodeX/binance-skills-rift-radar/app.js): 前端机会评分展示、过滤器、Opportunity Check
- [server.js](/Users/cc/Desktop/CodeX/binance-skills-rift-radar/server.js): 实时聚合、内部判断、机会/风控底层逻辑
- [API-CONTRACTS.md](/Users/cc/Desktop/CodeX/binance-skills-rift-radar/API-CONTRACTS.md): 内部接口与产品数据合同
- [package.json](/Users/cc/Desktop/CodeX/binance-skills-rift-radar/package.json): 启动脚本

## 运行

```bash
npm start
```

然后打开：

- <http://localhost:4173>

可选环境变量：

- `HOST`: 默认 `127.0.0.1`
- `PORT`: 默认 `4173`
- `RIFT_HTTP_TRANSPORT=fetch`: 强制改回 Node `fetch` 传输层

## 当前边界

- 这是 `live beta`，不是官方 Binance Skills API 直连版
- 当前 `user mandate` 已可编辑，但还没持久化成真正的多用户画像系统
- 当前机会分、`Est Gross PnL`、`Est Net PnL` 都是产品内估算，不是收益保证
- 当前 `replay` 已经能持久化最近 24 轮快照，但还没有上升到完整判例库

## 校验

已在 `2026-03-15` 验证：

- `GET /api/health`
- `GET /api/live/overview`
- `GET /api/live/token/CAKE`
- `POST /api/warrant/check`

已在 `2026-03-18` 追加验证：

- 当 Binance / DexScreener 等核心源不可用时，`GET /api/live/overview` 不再返回 `500 mode:error`
- 同样场景下会稳定返回 `mode: "stale-fallback"`
- `GET /api/live/stream` 不再只发 `snapshot-error`
  - 现在会继续发 `overview` 事件
  - payload 中明确带 `staleReason`

其中还额外验证了：

- 自定义 mandate query params 会改变 overview 中的 lane / verdict
- `referenceCapitalUsd` 会直接影响 `Suggested Size / Est Net PnL`
- 严格 mandate 下，`CAKE` 会从默认的 `futures` 收缩到 `spot`
- `Quick Check` 已经是真实服务端返回，不是前端本地假匹配
- `Execution Brief` 已会随 `token` 一起返回，Quick Check 和 Inspector 会直接消费
- `postmortemFeed` 和 `token.postmortem` 已会随 live overview 一起返回
- `Journal Mode` 当前基于浏览器 `localStorage` 持久化，刷新页面后不会丢
- `Portfolio Mode` 当前同样基于浏览器 `localStorage`
  - 这是本地 paper portfolio，不是交易所真实持仓同步
- `Portfolio Mode` 现在也能直接管理提醒规则
  - 每个 symbol 都可以在组合卡里直接 `Mute Alerts / 静默到复审 / 切换策略`
- `Portfolio Watchtower` 也是前端本地派生层
  - 它读取本地 paper position，再结合实时机会状态生成“我的组合提醒”
- `My Position Alerts` 也是前端本地 inbox
  - 当前不依赖额外后端接口
  - 提醒历史、已读状态、桌面通知开关、`resolved` 状态都保存在浏览器 `localStorage`
  - `mute`、`snooze` 和 `symbol policy` 都保存在本地偏好里；静默到期或到达下次复审后，如果问题仍在，会重新以 `Reopened` 形式进入 inbox
  - `自动跟随建议` 也保存在本地偏好里；开启后会在 live 扫描和组合变化时自动同步全局 preset
  - `Quiet / Focus / Hunter` 不单独持久化为新字段，而是由当前全局阈值组合自动推导；如果你手动调过参数，界面会自动显示成 `Custom`
  - 提醒签名已经收敛到稳定问题类型，不再因为 headline 微调就被误判成全新提醒
- `shiftFeed` 会在首次扫描返回 `fresh`，后续扫描回到真实的 `flat / up / down` 变化状态
- `alertFeed` 会返回高价值提醒，而不是把所有波动都推给用户
- `data/opportunity-history.json` 已会持久化 replay 快照
