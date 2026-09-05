# Deep Salvage Inc. 深海捞捞

深海打捞 idle 游戏,面向 CrazyGames 上架。零依赖、零图片资源:全部内容由配置表驱动 (`js/data.js`),美术全部程序化 Canvas 绘制 (`js/scene.js`)。

## 本地运行

```bash
cd deepsea
python3 -m http.server 8080
# 打开 http://localhost:8080
```

> 必须用 http 服务打开(ES Modules 不支持 file://)。无 SDK 时广告自动进入"模拟广告"模式,所有功能可测试。

## 上架 CrazyGames 步骤

1. 打开 `thumbnail.html` 下载 1280×720 封面图和 512×512 图标;
2. 把整个 `deepsea` 目录打成 zip(不要嵌套外层文件夹);
3. 在 [CrazyGames 开发者后台](https://developer.crazygames.com) 上传,填 QA 清单;
4. QA 关注点(已全部实现):
   - ✅ SDK loading 事件 (`sdkGameLoadingStart/Stop`)
   - ✅ rewarded 广告 6 个位 + midgame(仅 prestige)+ 失败兜底(广告出错仍发奖励,不卡流程)
   - ✅ happytime(新物种/合同完成/prestige)
   - ✅ 存档 localStorage + SDK.data 云同步双写
   - ✅ 静音按钮(设置内音效/音乐开关)、移动端触控、无外链、无第三方广告
   - ✅ 首屏秒开(无任何外部资源依赖,SDK 脚本加载失败也不阻塞)

## 架构

| 文件 | 职责 |
|---|---|
| `js/data.js` | **全部内容表**:48 物种、16 条升级线(187 个购买档位)、8 区域、8 皮肤、转盘/扭蛋/签到/任务/实验室 |
| `js/core.js` | 工具 / i18n(en+zh)/ 存档 / WebAudio 合成音效 |
| `js/ads.js` | CrazyGames SDK 适配 + 广告频控 + 模拟广告 |
| `js/game.js` | 世界:生物生成、抓爪状态机、相机、结算、离线收益 |
| `js/scene.js` | 程序化渲染:29 种生物绘制模板、水体、船、爪 |
| `js/meta.js` | 转盘、扭蛋(含保底)、7 天签到、每日任务、双层 prestige、研究、限时合同 |
| `js/ui.js` | 全部面板/弹窗/教程(DOM UI) |
| `js/main.js` | 启动序列 + 主循环 |

## 数值节奏(已用 `tools/balance.mjs` 模拟验证)

```bash
node tools/balance.mjs   # 模拟休闲玩家 20 次/分钟、贪心升级
```

- 第 2 区 ~40 分钟,第 3 区 ~88 分钟,第 4 区(可 prestige)~164 分钟 → 首玩 3 小时不撞内容墙
- 升级间隔峰值 5.3 分钟(< 10 分钟目标,任何时刻都有近在眼前的目标)
- 6-8 区为 prestige 后的二周目内容(转生后用核心加成快速推进)
- 调节奏只改 `data.js` 的 `ZONES[].cost` 与升级线 `base/g`

## 加内容的姿势(杠杆所在)

- **新生物**:`data.js` 的 `CREATURES` 加一行(选 29 个形状模板之一 + 换色);
- **新区域**:`ZONES` 加一行(调色板 + 解锁价 + 机制);
- **新皮肤/转盘奖/任务**:`SKINS` / `WHEEL` / `TASK_POOL` 各加一行;
- 节日活动 = 改表,零代码。
