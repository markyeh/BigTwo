# 大老二 Counter Battle Roguelike MVP 規格

## 1. 專案方向

本專案不再使用：

```text
傳統四人大老二 Roguelike
```

而是改成：

```text
大老二牌型對招戰鬥 Roguelike
```

核心概念：

* 玩家與敵人 1v1 戰鬥
* 使用「大老二牌型」進行攻擊
* 敵人可選擇 Pass 或壓制（Counter）
* 壓制成功會反擊
* 雙方持續出招形成連段感
* Build 圍繞牌型與規則改變
* 戰鬥節奏快速
* 先以桌面版為主
* 不優先考慮手機直式 UI

遊戲體驗目標：

```text
像格鬥遊戲對招
+ Poker Combo
+ Roguelike Build
```

參考方向：

* Slay the Spire
* Balatro
* Monster Train

但核心玩法必須保留：

```text
大老二的「壓過」概念
```

---

# 2. MVP 範圍

MVP 不做完整 Roguelike。

只驗證：

```text
Counter 戰鬥是否有趣
```

---

## MVP 內容

### 戰鬥

* 玩家 VS AI
* 單場戰鬥
* 不做地圖
* 不做商店
* 不做章節
* 不做 Meta Progression

---

### 支援牌型

MVP 只支援：

* 單張
* 對子
* 三條

先不要做：

* 順子
* 同花
* 葫蘆
* 鐵支
* 同花順

因為需要先驗證：

```text
壓制與反擊是否好玩
```

---

### MVP Build

只做：

* 2 個角色
* 6~8 個技能
* 2 個規則技能
* 3 個敵人

---

# 3. 核心戰鬥設計

## 3.1 戰鬥流程

戰鬥流程：

```text
1. 發牌
2. 玩家出招
3. 敵人回應
4. 若敵人壓制成功 -> 反擊
5. 若敵人 Pass -> 吃傷害
6. 換敵人主動出招
7. 玩家回應
8. 持續循環
```

---

# 4. 手牌系統

## 4.1 固定手牌數

雙方永遠維持：

```text
8 張手牌
```

---

## 4.2 出牌後立即補牌

例如：

玩家打出：

```text
對子 8
```

消耗 2 張牌。

系統立刻：

```text
補 2 張牌
```

回到 8 張。

---

## 4.3 牌庫

使用標準：

```text
52 張牌
```

不含 Joker。

---

## 4.4 洗牌

牌庫抽完後：

```text
棄牌堆重新洗牌
```

形成循環牌庫。

---

# 5. 大老二規則

## 5.1 點數大小

```text
3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2
```

---

## 5.2 花色大小

```text
梅花 ♣ < 方塊 ♦ < 紅心 ♥ < 黑桃 ♠
```

---

## 5.3 同牌型比較

### 單張

先比點數。

若相同再比花色。

---

### 對子

比點數。

若相同：

比最大花色。

---

### 三條

只比點數。

---

# 6. 出招與 Counter 系統

## 6.1 主動出招

當玩家為主動方：

可選擇任意合法牌型：

* 單張
* 對子
* 三條

---

## 6.2 防守方選擇

防守方只有兩種選擇：

### 選項 1：Pass

直接受到攻擊。

例如：

```text
玩家：對子 8
敵人：Pass
```

敵人受到傷害。

---

### 選項 2：壓制（Counter）

必須：

```text
使用相同牌型
且更大
```

例如：

```text
玩家：對子 8
敵人：對子 J
```

則：

```text
玩家攻擊被取消
敵人進行反擊
```

並由敵人變成主動方。

---

# 7. 傷害系統

## 7.1 基礎傷害

### 單張

```text
傷害 = 點數
```

例如：

| 牌 | 傷害 |
| - | -- |
| 5 | 5  |
| J | 11 |
| A | 14 |
| 2 | 16 |

---

### 對子

```text
傷害 = 基礎值 x 2
```

建議：

```text
(牌點數 + 2) x 2
```

例如：

| 對子   | 傷害 |
| ---- | -- |
| 對子 5 | 14 |
| 對子 J | 26 |
| 對子 A | 32 |

---

### 三條

```text
高爆發傷害
```

建議：

```text
(牌點數 + 4) x 4
```

例如：

| 三條   | 傷害 |
| ---- | -- |
| 三條 5 | 36 |
| 三條 J | 60 |

---

# 8. Momentum 系統

## 8.1 Momentum

連續 Counter 成功時：

增加：

```text
Momentum
```

---

## 8.2 效果

每層 Momentum：

```text
傷害 +10%
```

最大：

```text
5 層
```

---

## 8.3 重置

當：

* Pass
* 吃傷害
* 無法 Counter

則 Momentum 歸零。

---

# 9. Combo Chain

## 9.1 連續壓制

例如：

```text
玩家：對子 7
敵人：對子 9
玩家：對子 Q
敵人：Pass
```

則玩家獲得：

```text
Chain Bonus
```

---

## 9.2 傷害倍率

| Chain | 倍率  |
| ----- | --- |
| 1     | 1.0 |
| 2     | 1.2 |
| 3     | 1.5 |
| 4+    | 2.0 |

---

# 10. UI 設計

## 10.1 平台

MVP：

```text
桌面版優先
```

不需要手機直式。

---

## 10.2 畫面配置

```text
------------------------------------------------
敵人資訊
HP / Momentum / Intent

敵人出牌區

----------------------------
中央戰鬥區

----------------------------
玩家出牌區

玩家手牌

可用 Combo 列表

技能列
------------------------------------------------
```

---

# 11. Combo 自動偵測

## 11.1 系統自動掃描

系統需要自動找出：

* 所有單張
* 所有對子
* 所有三條

玩家不需要自己組牌。

---

## 11.2 Combo UI

例如：

```text
可用牌型：

[單張 A♠] 傷害 14
[對子 8] 傷害 20
[三條 Q] 傷害 64
```

玩家點擊即可出招。

---

# 12. 技能系統

## 12.1 技能分類

### 普通技能

不改變核心規則。

例如：

* 傷害增加
* 抽牌
* 補牌
* 暴擊
* 護盾

---

### 規則技能

會改變大老二規則。

例如：

* A 視為 2
* 對子可當三條
* 可忽略花色限制

---

## 12.2 Rule Slot 限制

玩家只能裝備：

```text
2 個規則技能
```

避免規則完全崩壞。

---

# 13. MVP 角色

## 13.1 Fighter

定位：

```text
對子反擊流
```

被動：

```text
對子 Counter 傷害 +25%
```

---

## 13.2 Gambler

定位：

```text
高風險抽牌流
```

被動：

```text
Pass 後抽 1 張牌
```

---

# 14. MVP 敵人

## 14.1 Aggressive Enemy

特色：

```text
優先 Counter
```

---

## 14.2 Defensive Enemy

特色：

```text
保留高牌
常 Pass
```

---

## 14.3 Trickster Enemy

特色：

```text
擁有規則技能
```

---

# 15. AI 規則

## AI 不需要很聰明

MVP AI：

```text
能 Counter 就 Counter
否則 Pass
```

即可。

---

## AI Counter 優先度

### Aggressive

優先最小可 Counter。

---

### Defensive

保留：

* A
* 2
* 高花色

---

# 16. 視覺風格

方向：

```text
輕鬆
可愛
高辨識 UI
大數字傷害
強烈 Counter Feedback
```

---

## 必須有的 Feedback

### Counter 成功

* 大字 Counter
* 螢幕震動
* 傷害特效
* 音效

這是核心爽感。

---

# 17. 技術架構

## SvelteKit

使用：

```text
SvelteKit + TypeScript
```

---

## 專案架構

```text
src/
  lib/
    game/
      cards.ts
      deck.ts
      comboScanner.ts
      comboCompare.ts
      battleEngine.ts
      ai.ts
      skills.ts
      momentum.ts

    stores/
      battleStore.ts
      playerStore.ts

    components/
      Card.svelte
      Hand.svelte
      ComboButton.svelte
      BattleScreen.svelte
      EnemyPanel.svelte
      PlayerPanel.svelte
      MomentumBar.svelte

  routes/
    +page.svelte
```

---

# 18. MVP 完成條件

以下功能完成即算 MVP：

* 可完整進行 1v1 戰鬥
* 可正常發牌
* 可自動掃描 Combo
* 可出招
* 可 Counter
* 可 Pass
* 可造成傷害
* Momentum 正常運作
* AI 可正常行動
* 戰鬥能正常結束
* 有基本動畫與 Feedback

---

# 19. 第一優先事項

Codex 第一階段優先實作：

## 第一階段

* Card Model
* Deck System
* Combo Scanner
* Combo Compare
* Battle State
* Counter Logic

---

## 第二階段

* UI
* 動畫
* 傷害數字
* Momentum
* AI

---

## 第三階段

* Skills
* Rule Skills
* Build
* 敵人差異

---

# 20. 最重要設計原則

這遊戲不是：

```text
傳統大老二
```

而是：

```text
大老二對招戰鬥遊戲
```

核心樂趣必須來自：

* 壓制
* Counter
* Momentum
* 心理戰
* Combo Chain
* Build 爽感

而不是：

```text
慢慢等 AI 出牌
```
