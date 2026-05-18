# 大老二 Counter Battle UI/UX 重構規格（Codex 實作版）

# 1. UI/UX 核心方向

本遊戲 UI 不應該使用：

```text
傳統撲克牌桌 UI
```

也不應該使用：

```text
四人大老二棋牌 UI
```

原因：

目前玩法核心已經變成：

```text
Counter 對招戰鬥
```

而不是：

```text
整理撲克牌
```

因此 UI 必須圍繞：

```text
玩家如何快速理解：
- 現在受到什麼攻擊
- 能怎麼 Counter
- Counter 後會發生什麼
```

而不是：

```text
如何自己找牌型
```

系統必須：

* 自動掃描 Combo
* 自動顯示可 Counter 的組合
* 玩家只需要做決策
* 不需要手動拼牌

---

# 2. 最重要 UI 原則

# 玩家操作的是 Combo

不是牌。

因此：

```text
Combo UI 必須是主畫面
```

而：

```text
手牌 UI 必須降級成輔助資訊
```

這是目前最重要的 UX 原則。

---

# 3. 畫面 Layout

# 1920x1080 桌面版 Layout

MVP 只支援：

```text
桌面橫式
```

不要做手機版。

---

# 整體畫面配置

```text
┌─────────────────────────────────────────────┐
│                                             │
│              ENEMY PANEL                    │
│                                             │
│  Enemy Avatar                               │
│  HP Bar                                     │
│  Momentum Bar                               │
│  Intent Area                                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              CENTER BATTLE AREA             │
│                                             │
│        Current Attack / Counter Area        │
│                                             │
│              Damage Numbers                 │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              COMBO ACTION PANEL             │
│                                             │
│   Available Combo Buttons                   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│              PLAYER HAND PANEL              │
│                                             │
│  Small Card List                            │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 4. 資訊優先級

UI 必須遵守以下層級。

---

# 第一層（最大）

## 現在的攻擊

例如：

```text
敵人使用：對子 Q
即將造成 28 傷害
```

這是玩家最需要知道的資訊。

因此：

* 必須在畫面中央
* 必須字體最大
* 必須有動畫
* 必須高亮

---

# 第二層

## 可 Counter 的選項

例如：

```text
[對子 K] 32 dmg
[對子 A] 38 dmg
[對子 2] 44 dmg
[PASS] 受到 28 傷害
```

這是玩家主要操作區。

---

# 第三層

## Momentum / Chain

例如：

```text
Momentum x3
Chain x2
Damage Bonus +30%
```

---

# 第四層

## 手牌資訊

只作為：

```text
Combo 原料顯示
```

不應該成為主視覺。

---

# 5. Enemy Panel

# 畫面位置

固定在：

```text
畫面上方
```

高度約：

```text
25%
```

---

# Enemy Panel 結構

```text
┌────────────────────────────┐
│ Enemy Avatar               │
│                            │
│ HP ███████████ 120 / 120   │
│                            │
│ Momentum ███░░             │
│                            │
│ Intent: Pair Attack        │
│ Incoming Damage: 28        │
│                            │
│ Current Combo: [Pair Q]    │
└────────────────────────────┘
```

---

# Enemy Intent UI

Intent 必須永遠可見。

例如：

| Intent     | 顯示             |
| ---------- | -------------- |
| 單張攻擊       | Single Attack  |
| 對子攻擊       | Pair Attack    |
| 三條攻擊       | Triple Strike  |
| Buff       | Charging       |
| Counter 強化 | Counter Stance |

---

# 6. 中央戰鬥區（最重要）

# 這是核心畫面

畫面中央必須專門顯示：

```text
目前正在對招的 Combo
```

---

# 平常狀態

例如：

```text
┌────────────────────────────┐
│                            │
│        Pair Q Attack       │
│                            │
│          28 Damage         │
│                            │
└────────────────────────────┘
```

---

# Counter Mode

當玩家被攻擊時：

畫面必須：

* 變暗
* 中央 UI 放大
* 顯示 Counter Window
* 強制玩家注意力集中

---

# Counter Window Layout

```text
================================================
COUNTER?
================================================

Enemy Used:
[ Pair Q ]

Incoming Damage:
28

Available Counters:

[ Pair K ] -> Counter 32 dmg
[ Pair A ] -> Counter 38 dmg
[ Pair 2 ] -> Counter 44 dmg

[ PASS ] -> Take 28 damage

================================================
```

---

# Counter Button 規格

每個 Counter Button：

```text
┌────────────────────────────┐
│ Pair K                     │
│ Damage: 32                 │
│ Momentum +1                │
│ Chain x2                   │
└────────────────────────────┘
```

---

# 按鈕尺寸

最小：

```text
240px x 100px
```

因為這是主要操作區。

---

# 7. Combo Action Panel

# 畫面位置

固定在：

```text
畫面下半部中央
```

---

# 功能

當玩家是主動方時：

顯示：

```text
目前可出的所有 Combo
```

---

# Layout

```text
┌────────────────────────────────────┐
│ Available Combos                   │
│                                    │
│ [ Single A♠ ] 14 dmg               │
│ [ Pair 8 ] 20 dmg                  │
│ [ Triple Q ] 60 dmg                │
│                                    │
└────────────────────────────────────┘
```

---

# Combo Button UI

每個 Combo Button 必須包含：

```text
Combo 名稱
使用牌
預估傷害
特殊效果
Momentum 變化
Chain 變化
```

---

# Button 視覺規則

## 單張

使用：

```text
細長按鈕
```

---

## 對子

使用：

```text
中型按鈕
```

---

## 三條

使用：

```text
大型高亮按鈕
```

並增加：

* 發光
* 邊框動畫
* 更大字體

讓玩家知道：

```text
這是高價值攻擊
```

---

# 8. 玩家手牌區

# 核心原則

手牌不是主要操作區。

因此：

* 不需要大牌面
* 不需要扇形排列
* 不需要玩家拖曳
* 不需要玩家自己組牌

---

# Layout

```text
┌────────────────────────────────────┐
│ Hand                               │
│                                    │
│ 3♣ 3♥ 5♠ 7♦ 7♣ Q♠ K♥ A♠            │
│                                    │
└────────────────────────────────────┘
```

---

# 手牌 UI 規格

* 小尺寸
* 低彩度
* 半透明
* 不搶畫面焦點

---

# 9. Momentum UI

# 顯示位置

玩家與敵人都需要。

位置：

```text
HP 下方
```

---

# Layout

```text
Momentum
████░░░░
3 / 5
```

---

# Momentum Feedback

當 Momentum 增加：

* 發光
* 數字跳動
* UI 放大
* 音效

---

# 10. Chain UI

# 顯示位置

畫面中央偏右。

---

# Layout

```text
CHAIN x3
Damage Bonus +50%
```

---

# 視覺效果

當 Chain 增加：

* UI 放大
* 快速動畫
* 顏色變亮

---

# 11. Damage UI

# 傷害數字

必須：

* 超大
* 浮動動畫
* 有爆擊感

---

# Layout

```text
-28
COUNTER
```

---

# 顏色規則

| 類型       | 顏色 |
| -------- | -- |
| 普通傷害     | 白色 |
| Counter  | 黃色 |
| Critical | 紅色 |
| Ultimate | 紫色 |

---

# 12. 動畫節奏

# 出招流程

## Step 1

Combo Button 放大。

---

## Step 2

卡牌飛向中央。

---

## Step 3

中央顯示：

```text
PAIR K
```

---

## Step 4

播放攻擊動畫。

---

## Step 5

傷害數字跳出。

---

## Step 6

Momentum 更新。

---

# 13. 色彩與風格

# MVP 風格

使用：

```text
深色背景
高對比 UI
高亮 Combo
```

---

# 背景

建議：

```text
深灰 / 深藍
```

避免純黑。

---

# Combo 顏色

| 類型       | 顏色 |
| -------- | -- |
| 單張       | 白色 |
| 對子       | 藍色 |
| 三條       | 金色 |
| Counter  | 黃色 |
| Ultimate | 紫色 |

---

# 14. MVP 不要做的事情

不要：

* 手牌拖曳
* 牌桌模擬
* 四人棋牌 UI
* 小字資訊
* 過多 HUD
* 手機直式
* 自由拼牌

因為：

這些都會破壞：

```text
Counter 戰鬥節奏
```

---

# 15. Codex UI 重構優先順序

# 第一優先

* Counter Window
* Combo Action Panel
* Enemy Intent
* Damage Feedback

---

# 第二優先

* Momentum UI
* Chain UI
* Combo Animations

---

# 第三優先

* 特效
* 轉場
* Screen Shake
* 音效 Hook

---

# 16. 最重要 UX 原則

Codex 必須遵守：

```text
玩家不是在玩撲克牌
```

玩家是在：

```text
選擇如何 Counter
```

因此：

真正的主畫面必須是：

```text
Counter 與 Combo
```

而不是手牌。
