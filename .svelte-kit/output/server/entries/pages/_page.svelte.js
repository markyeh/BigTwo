import { F as fallback, k as attr_class, ac as stringify, j as attr, D as escape_html, m as bind_props, A as ensure_array_like, ab as store_get, q as clsx, l as attr_style, ag as unsubscribe_stores } from "../../chunks/renderer.js";
import { d as derived, w as writable, g as get } from "../../chunks/index.js";
const COUNTER_SKILLS = [
  {
    id: "power-strike",
    name: "重擊架勢",
    description: "下一次造成傷害 +30%。",
    type: "assist",
    timing: "beforePlay",
    energyCost: 0
  },
  {
    id: "guard-up",
    name: "舉盾",
    description: "獲得 14 點護盾。",
    type: "assist",
    timing: "beforePlay",
    energyCost: 0
  },
  {
    id: "focus-breath",
    name: "集中呼吸",
    description: "Momentum +1。",
    type: "assist",
    timing: "beforePlay",
    energyCost: 0
  },
  {
    id: "quick-mulligan",
    name: "快手換牌",
    description: "棄掉 2 張最低牌並補牌。",
    type: "assist",
    timing: "beforePlay",
    energyCost: 0
  },
  {
    id: "revenge-spark",
    name: "反擊火花",
    description: "若正在防守，下一次 Counter 傷害 +25%。",
    type: "assist",
    timing: "beforePlay",
    energyCost: 0
  },
  {
    id: "second-wind",
    name: "第二口氣",
    description: "回復 10 HP，每場一次。",
    type: "assist",
    timing: "beforePlay",
    energyCost: 0,
    oncePerBattle: true
  },
  {
    id: "ace-overdrive",
    name: "A 超頻",
    description: "規則：A 在壓制比較時視為 2。",
    type: "ruleChange",
    timing: "battleStart",
    energyCost: 0
  },
  {
    id: "pair-echo",
    name: "對子殘響",
    description: "規則：對子可當作三條出招或 Counter。",
    type: "ruleChange",
    timing: "battleStart",
    energyCost: 0
  }
];
const CHARACTERS = [
  {
    id: "fighter",
    name: "Fighter",
    role: "對子反擊流",
    passive: "對子 Counter 傷害 +25%。",
    maxHp: 120,
    skillIds: ["power-strike", "guard-up", "revenge-spark"],
    ruleSkillIds: ["pair-echo"]
  },
  {
    id: "gambler",
    name: "Gambler",
    role: "高風險抽牌流",
    passive: "Pass 後抽 1 張牌再棄 1 張最低牌。",
    maxHp: 105,
    skillIds: ["quick-mulligan", "focus-breath", "second-wind"],
    ruleSkillIds: ["ace-overdrive"]
  }
];
const ENEMIES = [
  {
    id: "aggressive",
    name: "Aggressive Rival",
    intent: "能 Counter 就用最小牌壓回來。",
    maxHp: 115
  },
  {
    id: "defensive",
    name: "Defensive Rival",
    intent: "常 Pass，保留 A、2 與高花色。",
    maxHp: 130
  },
  {
    id: "trickster",
    name: "Trickster Rival",
    intent: "持有 A 超頻規則，A 會變得很危險。",
    maxHp: 110
  }
];
function getCounterSkill(id) {
  return { ...COUNTER_SKILLS.find((skill) => skill.id === id) };
}
function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}
function getEnemy(id) {
  return ENEMIES.find((enemy) => enemy.id === id) ?? ENEMIES[0];
}
function nextMomentum(current) {
  return Math.min(5, current + 1);
}
function chainMultiplier(chain) {
  if (chain >= 4) return 2;
  if (chain === 3) return 1.5;
  if (chain === 2) return 1.2;
  return 1;
}
function momentumMultiplier(momentum) {
  return 1 + momentum * 0.1;
}
const RANK_ORDER = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
const SUIT_ORDER = ["club", "diamond", "heart", "spade"];
const SUIT_SYMBOL = {
  club: "♣",
  diamond: "♦",
  heart: "♥",
  spade: "♠"
};
function createDeck() {
  return RANK_ORDER.flatMap(
    (rank) => SUIT_ORDER.map((suit) => ({
      id: `${rank}-${suit}`,
      rank,
      suit
    }))
  );
}
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function getRankValue(rank) {
  return RANK_ORDER.indexOf(rank);
}
function getSuitValue(suit) {
  return SUIT_ORDER.indexOf(suit);
}
function compareCard(a, b) {
  const rankDiff = getRankValue(a.rank) - getRankValue(b.rank);
  return rankDiff === 0 ? getSuitValue(a.suit) - getSuitValue(b.suit) : rankDiff;
}
function sortCards(cards) {
  return [...cards].sort(compareCard);
}
function getCardLabel(card) {
  return `${card.rank}${SUIT_SYMBOL[card.suit]}`;
}
function canCounterCombo(candidate, target) {
  if (candidate.type !== target.type) return false;
  if (candidate.rankValue !== target.rankValue) return candidate.rankValue > target.rankValue;
  if (candidate.type === "triple") return false;
  return candidate.suitValue > target.suitValue;
}
function comboName(type) {
  const names = {
    single: "單張",
    pair: "對子",
    triple: "三條",
    straight: "順子",
    flush: "同花",
    fullHouse: "葫蘆",
    fourOfAKind: "鐵支",
    straightFlush: "同花順"
  };
  return names[type];
}
function cardListLabel(cards) {
  return cards.map(getCardLabel).join(" ");
}
function scanCombos(hand, options = {}) {
  const cards = sortCards(hand);
  const combos = [];
  for (const card of cards) {
    combos.push(makeCombo("single", [card], options));
  }
  const byRank = groupByRank(cards);
  for (const group of byRank.values()) {
    if (group.length >= 2) {
      for (const pair of combinations(group, 2)) {
        combos.push(makeCombo("pair", pair, options));
        if (options.pairAsTriple) combos.push(makeCombo("triple", pair, options, "pair-as-triple"));
      }
    }
    if (group.length >= 3) {
      for (const triple of combinations(group, 3)) {
        combos.push(makeCombo("triple", triple, options));
      }
    }
  }
  return combos.sort((a, b) => a.type.localeCompare(b.type) || a.rankValue - b.rankValue || a.suitValue - b.suitValue);
}
function comboDamage(combo) {
  const value = rankDamageValue(combo.cards[0].rank);
  if (combo.type === "single") return value;
  if (combo.type === "pair") return (value + 2) * 2;
  return (value + 4) * 4;
}
function rankDamageValue(rank) {
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  if (rank === "A") return 14;
  if (rank === "2") return 16;
  return Number(rank);
}
function makeCombo(type, cards, options, idSuffix = "") {
  const sorted = sortCards(cards);
  const rankValue = Math.max(...sorted.map((card) => effectiveRankValue(card, options)));
  const suitValue = Math.max(...sorted.map((card) => getSuitValue(card.suit)));
  const base = comboDamage({
    type,
    cards: sorted
  });
  const suffix = idSuffix ? `-${idSuffix}` : "";
  return {
    id: `${type}-${sorted.map((card) => card.id).join("-")}${suffix}`,
    type,
    cards: sorted,
    rankValue,
    suitValue,
    baseDamage: base,
    label: `${comboName(type)}${idSuffix === "pair-as-triple" ? "（殘響）" : ""} ${cardListLabel(sorted)}`
  };
}
function effectiveRankValue(card, options) {
  if (options.aceAsTwo && card.rank === "A") return getRankValue("2");
  return getRankValue(card.rank);
}
function groupByRank(cards) {
  const groups = /* @__PURE__ */ new Map();
  for (const card of cards) groups.set(card.rank, [...groups.get(card.rank) ?? [], card]);
  return groups;
}
function combinations(items, size) {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return [
    ...combinations(rest, size - 1).map((combo) => [first, ...combo]),
    ...combinations(rest, size)
  ];
}
function chooseEnemyAttack(state) {
  const combos = scanCombos(state.enemy.hand, enemyRuleOptions(state));
  if (state.enemyId === "aggressive" || state.enemyId === "trickster") {
    return [...combos].sort((a, b) => b.cards.length - a.cards.length || a.rankValue - b.rankValue)[0];
  }
  return combos.find((combo) => combo.type === "pair" && combo.rankValue < 9) ?? combos[0];
}
function chooseEnemyCounter(state) {
  if (!state.currentAttack) return null;
  const counters = scanCombos(state.enemy.hand, enemyRuleOptions(state)).filter((combo) => canCounterCombo(combo, state.currentAttack)).sort((a, b) => a.rankValue - b.rankValue || a.suitValue - b.suitValue);
  if (!counters.length) return null;
  if (state.enemyId === "defensive") {
    return counters.find((combo) => combo.rankValue < 10) ?? null;
  }
  return counters[0];
}
function enemyRuleOptions(state) {
  return {
    aceAsTwo: state.enemyId === "trickster"
  };
}
function createDeckZone() {
  return {
    drawPile: shuffleDeck(createDeck()),
    discardPile: []
  };
}
function drawCards(deck, count) {
  let drawPile = [...deck.drawPile];
  let discardPile = [...deck.discardPile];
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    if (!drawPile.length) {
      drawPile = shuffleDeck(discardPile);
      discardPile = [];
    }
    const card = drawPile.shift();
    if (card) cards.push(card);
  }
  return { cards: sortCards(cards), deck: { drawPile, discardPile } };
}
function discardCards(deck, cards) {
  return {
    ...deck,
    discardPile: [...deck.discardPile, ...cards]
  };
}
function refillHand(hand, deck, target = 8) {
  const needed = Math.max(0, target - hand.length);
  const result = drawCards(deck, needed);
  return {
    hand: sortCards([...hand, ...result.cards]),
    deck: result.deck
  };
}
function createCounterBattle(characterId = "fighter", enemyId = "aggressive") {
  const character = getCharacter(characterId);
  const enemyDefinition = getEnemy(enemyId);
  const playerDeck = createDeckZone();
  const enemyDeck = createDeckZone();
  const playerDraw = drawCards(playerDeck, 8);
  const enemyDraw = drawCards(enemyDeck, 8);
  const playerRuleSkillIds = character.ruleSkillIds.slice(0, 2);
  return {
    phase: "playing",
    character: characterId,
    enemyId,
    player: {
      id: "player",
      name: character.name,
      hp: character.maxHp,
      maxHp: character.maxHp,
      shield: 0,
      hand: playerDraw.cards,
      deck: playerDraw.deck,
      skills: [...character.skillIds.map(getCounterSkill), ...playerRuleSkillIds.map(getCounterSkill)],
      ruleSkillIds: playerRuleSkillIds
    },
    enemy: {
      id: "enemy",
      name: enemyDefinition.name,
      hp: enemyDefinition.maxHp,
      maxHp: enemyDefinition.maxHp,
      shield: 0,
      hand: enemyDraw.cards,
      deck: enemyDraw.deck,
      skills: [],
      ruleSkillIds: enemyId === "trickster" ? ["ace-overdrive"] : []
    },
    activeSide: "player",
    defendingSide: "enemy",
    currentAttack: null,
    momentum: 0,
    chain: 0,
    turn: 1,
    feedback: "idle",
    events: [event(`遭遇 ${enemyDefinition.name}：${enemyDefinition.intent}`, "info")],
    floatingTexts: [],
    selectedComboId: null,
    nextDamageBonus: 0,
    playerRuleFlags: {
      aceAsTwo: playerRuleSkillIds.includes("ace-overdrive"),
      pairAsTriple: playerRuleSkillIds.includes("pair-echo")
    }
  };
}
function getPlayerCombos(state) {
  return scanCombos(state.player.hand, state.playerRuleFlags);
}
function getPlayerActions(state) {
  const combos = getPlayerCombos(state);
  if (state.defendingSide === "player" && state.currentAttack) {
    return combos.filter((combo) => canCounterCombo(combo, state.currentAttack));
  }
  return combos;
}
function playerChooseCombo(state, comboId) {
  if (state.phase !== "playing") return state;
  const combo = getPlayerActions(state).find((candidate) => candidate.id === comboId);
  if (!combo) return pushEvent(state, "這個 Combo 目前不能使用。", "info");
  return state.defendingSide === "player" ? playerCounter(state, combo) : playerAttack(state, combo);
}
function playerPass(state) {
  if (state.phase !== "playing" || state.defendingSide !== "player" || !state.currentAttack) return state;
  let next = resolveDamage(state, "player", state.currentAttack, "你選擇 Pass");
  if (next.character === "gambler" && next.phase === "playing") {
    next = gamblerPassCycle(next);
  }
  if (next.phase !== "playing") return next;
  return {
    ...next,
    currentAttack: null,
    activeSide: "player",
    defendingSide: "enemy",
    chain: 0,
    turn: next.turn + 1
  };
}
function useCounterSkill(state, skillId) {
  const skill = state.player.skills.find((candidate) => candidate.id === skillId);
  if (!skill || skill.type === "ruleChange") return state;
  if (skill.oncePerBattle && skill.usedThisBattle) return pushEvent(state, "這個技能本場已使用過。", "info");
  let next = markSkillUsed(state, skillId);
  if (skillId === "power-strike") {
    return addFloating(pushEvent({ ...next, nextDamageBonus: next.nextDamageBonus + 0.3, feedback: "skill" }, "重擊架勢：下一次傷害 +30%。", "skill"), "player", "+30%", "skill");
  }
  if (skillId === "guard-up") {
    return addFloating(pushEvent(updateActor(next, "player", { shield: next.player.shield + 14 }), "舉盾：獲得 14 點護盾。", "skill"), "player", "Block +14", "block");
  }
  if (skillId === "focus-breath") {
    return addFloating(pushEvent({ ...next, momentum: nextMomentum(next.momentum), feedback: "skill" }, "集中呼吸：Momentum +1。", "skill"), "player", "Momentum +1", "skill");
  }
  if (skillId === "quick-mulligan") {
    const lowest = [...next.player.hand].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank)).slice(0, 2);
    next = movePlayedCards(next, "player", lowest);
    return pushEvent(addFloating(next, "player", "換牌", "skill"), "快手換牌：棄掉 2 張低牌並補滿。", "skill");
  }
  if (skillId === "revenge-spark") {
    const bonus = next.defendingSide === "player" ? 0.25 : 0.15;
    return pushEvent({ ...next, nextDamageBonus: next.nextDamageBonus + bonus, feedback: "skill" }, `反擊火花：下一次傷害 +${Math.round(bonus * 100)}%。`, "skill");
  }
  if (skillId === "second-wind") {
    const healed = Math.min(next.player.maxHp, next.player.hp + 10);
    return addFloating(pushEvent(updateActor(next, "player", { hp: healed }), "第二口氣：回復 10 HP。", "skill"), "player", "+10 HP", "skill");
  }
  return next;
}
function playerAttack(state, combo) {
  let next = playCombo(state, "player", combo);
  next = pushEvent({ ...next, currentAttack: combo, activeSide: "player", defendingSide: "enemy", chain: 1 }, `你出招：${combo.label}`, "info");
  const counter = chooseEnemyCounter(next);
  if (counter) {
    return enemyCounter(next, counter);
  }
  next = resolveDamage(next, "enemy", combo, `${next.enemy.name} Pass`);
  if (next.phase !== "playing") return next;
  return enemyStarts(next);
}
function playerCounter(state, combo) {
  let next = playCombo(state, "player", combo);
  const momentum = nextMomentum(next.momentum);
  next = addFloating(
    pushEvent(
      {
        ...next,
        currentAttack: combo,
        activeSide: "player",
        defendingSide: "enemy",
        momentum,
        chain: next.chain + 1,
        feedback: "counter"
      },
      `COUNTER！你用 ${combo.label} 壓制成功。`,
      "counter"
    ),
    "player",
    "COUNTER!",
    "counter"
  );
  const enemyCounterCombo = chooseEnemyCounter(next);
  if (enemyCounterCombo) return enemyCounter(next, enemyCounterCombo);
  next = resolveDamage(next, "enemy", combo, `${next.enemy.name} 無法 Counter`);
  if (next.phase !== "playing") return next;
  return enemyStarts(next);
}
function enemyStarts(state) {
  const combo = chooseEnemyAttack(state);
  let next = playCombo(state, "enemy", combo);
  return pushEvent(
    {
      ...next,
      currentAttack: combo,
      activeSide: "enemy",
      defendingSide: "player",
      chain: 1,
      turn: next.turn + 1
    },
    `${next.enemy.name} 出招：${combo.label}`,
    "info"
  );
}
function enemyCounter(state, combo) {
  let next = playCombo(state, "enemy", combo);
  const momentum = nextMomentum(next.momentum);
  return addFloating(
    pushEvent(
      {
        ...next,
        currentAttack: combo,
        activeSide: "enemy",
        defendingSide: "player",
        momentum,
        chain: next.chain + 1,
        feedback: "counter"
      },
      `COUNTER！${next.enemy.name} 用 ${combo.label} 反壓。`,
      "counter"
    ),
    "enemy",
    "COUNTER!",
    "counter"
  );
}
function playCombo(state, side, combo) {
  return movePlayedCards(state, side, combo.cards);
}
function movePlayedCards(state, side, cards) {
  const actor = state[side];
  const cardIds = new Set(cards.map((card) => card.id));
  const deckWithDiscard = discardCards(actor.deck, cards);
  const refilled = refillHand(actor.hand.filter((card) => !cardIds.has(card.id)), deckWithDiscard);
  return updateActor(state, side, {
    hand: refilled.hand,
    deck: refilled.deck
  });
}
function resolveDamage(state, target, combo, reason) {
  const attacker = target === "player" ? "enemy" : "player";
  const fighterPairBonus = state.character === "fighter" && attacker === "player" && combo.type === "pair" && state.chain > 1 ? 0.25 : 0;
  const rawDamage = Math.ceil(
    combo.baseDamage * chainMultiplier(state.chain) * momentumMultiplier(state.momentum) * (1 + (attacker === "player" ? state.nextDamageBonus : 0) + fighterPairBonus)
  );
  const actor = state[target];
  const blocked = Math.min(actor.shield, rawDamage);
  const damage = rawDamage - blocked;
  const hp = Math.max(0, actor.hp - damage);
  let next = updateActor(state, target, { hp, shield: actor.shield - blocked });
  next = {
    ...next,
    momentum: 0,
    chain: 0,
    currentAttack: null,
    selectedComboId: null,
    nextDamageBonus: attacker === "player" ? 0 : next.nextDamageBonus,
    feedback: "hit"
  };
  next = addFloating(next, target, blocked ? `-${damage} Block ${blocked}` : `-${damage}`, damage ? "damage" : "block");
  next = pushEvent(next, `${reason}，${actor.name} 受到 ${damage} 傷害。`, "hit");
  if (next.enemy.hp <= 0) return { ...next, phase: "victory" };
  if (next.player.hp <= 0) return { ...next, phase: "defeat" };
  return next;
}
function gamblerPassCycle(state) {
  const lowest = [...state.player.hand].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))[0];
  if (!lowest) return state;
  return pushEvent(movePlayedCards(state, "player", [lowest]), "Gambler 被動：Pass 後換掉 1 張最低牌。", "skill");
}
function updateActor(state, side, patch) {
  return {
    ...state,
    [side]: {
      ...state[side],
      ...patch
    }
  };
}
function markSkillUsed(state, skillId) {
  return updateActor(state, "player", {
    skills: state.player.skills.map((skill) => skill.id === skillId ? { ...skill, usedThisBattle: true } : skill)
  });
}
function pushEvent(state, text, tone) {
  return {
    ...state,
    events: [event(text, tone), ...state.events].slice(0, 8)
  };
}
function event(text, tone) {
  return { id: crypto.randomUUID(), text, tone };
}
function addFloating(state, side, text, tone) {
  return {
    ...state,
    floatingTexts: [{ id: crypto.randomUUID(), side, text, tone }, ...state.floatingTexts].slice(0, 6)
  };
}
function createBattleStore() {
  const store = writable(createCounterBattle("fighter", "aggressive"));
  return {
    subscribe: store.subscribe,
    start: (character, enemy) => store.set(createCounterBattle(character, enemy)),
    chooseCombo: (comboId) => store.update((state) => playerChooseCombo(state, comboId)),
    pass: () => store.update(playerPass),
    useSkill: (skillId) => store.update((state) => useCounterSkill(state, skillId)),
    restart: () => {
      const state = get(store);
      store.set(createCounterBattle(state.character, state.enemyId));
    }
  };
}
const battleStore = createBattleStore();
const playerCombos = derived(battleStore, ($battle) => getPlayerCombos($battle));
const playerActions = derived(battleStore, ($battle) => getPlayerActions($battle));
function ComboButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let combo = $$props["combo"];
    let disabled = fallback($$props["disabled"], false);
    let mode = fallback($$props["mode"], "attack");
    let projectedDamage = fallback($$props["projectedDamage"], () => combo.baseDamage, true);
    let chain = fallback($$props["chain"], 1);
    let onPick = fallback($$props["onPick"], () => {
    });
    $$renderer2.push(`<button${attr_class(`combo-button combo-${stringify(combo.type)} ${stringify(mode)}`)}${attr("disabled", disabled, true)}><span class="combo-name">${escape_html(combo.label)}</span> <b>Damage ${escape_html(projectedDamage)}</b> <small>${escape_html(mode === "counter" ? `Momentum +1 / Chain x${chain}` : `Chain starts / ${combo.cards.length} card${combo.cards.length > 1 ? "s" : ""}`)}</small></button>`);
    bind_props($$props, { combo, disabled, mode, projectedDamage, chain, onPick });
  });
}
function MomentumBar($$renderer, $$props) {
  let momentum = fallback($$props["momentum"], 0);
  $$renderer.push(`<div class="momentum-bar" aria-label="Momentum"><!--[-->`);
  const each_array = ensure_array_like(Array(5));
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    each_array[index];
    $$renderer.push(`<span${attr_class("", void 0, { "filled": index < momentum })}></span>`);
  }
  $$renderer.push(`<!--]--></div>`);
  bind_props($$props, { momentum });
}
function BattleScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let defending, actionTitle, allowedIds, shownCombos, incomingDamage, intent;
    let battle = $$props["battle"];
    function actorClass(side) {
      return [
        "counter-actor",
        side,
        battle.defendingSide === side ? "defending" : "",
        battle.activeSide === side ? "active" : ""
      ].join(" ");
    }
    function hpPercent(actor) {
      return Math.max(0, Math.round(actor.hp / actor.maxHp * 100));
    }
    function projectedDamage(baseDamage, extraBonus) {
      return Math.ceil(baseDamage * chainMultiplier(Math.max(1, battle.chain)) * momentumMultiplier(battle.momentum) * (1 + extraBonus + battle.nextDamageBonus));
    }
    function getIntent(currentAttack, activeSide, damage) {
      if (!currentAttack) {
        return {
          label: activeSide === "enemy" ? "Charging" : "Waiting",
          damage: 0,
          combo: "None"
        };
      }
      const typeLabel = currentAttack.type === "single" ? "Single Attack" : currentAttack.type === "pair" ? "Pair Attack" : "Triple Strike";
      return {
        label: activeSide === "enemy" ? typeLabel : "Counter Stance",
        damage,
        combo: currentAttack.label
      };
    }
    defending = battle.defendingSide === "player";
    actionTitle = defending ? "可 Counter 牌型" : "可出招牌型";
    allowedIds = new Set(store_get($$store_subs ??= {}, "$playerActions", playerActions).map((combo) => combo.id));
    shownCombos = defending ? store_get($$store_subs ??= {}, "$playerActions", playerActions) : store_get($$store_subs ??= {}, "$playerCombos", playerCombos);
    incomingDamage = battle.currentAttack ? projectedDamage(battle.currentAttack.baseDamage, 0) : 0;
    intent = getIntent(battle.currentAttack, battle.activeSide, incomingDamage);
    $$renderer2.push(`<main${attr_class("counter-shell", void 0, { "shake": battle.feedback === "counter" })}><header class="counter-header"><div><h1>Counter Battle</h1> <p>大老二牌型對招 Roguelike MVP</p></div> <nav class="select-row">`);
    $$renderer2.select({ value: battle.character }, ($$renderer3) => {
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(CHARACTERS);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let character = each_array[$$index];
        $$renderer3.option({ value: character.id }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(character.name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(` `);
    $$renderer2.select({ value: battle.enemyId }, ($$renderer3) => {
      $$renderer3.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(ENEMIES);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let enemy = each_array_1[$$index_1];
        $$renderer3.option({ value: enemy.id }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(enemy.name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(` <button>重開</button></nav></header> <section class="enemy-panel"><article${attr_class(clsx(actorClass("enemy")))}><div class="enemy-avatar">!</div> <div class="actor-block"><div class="actor-head"><strong>${escape_html(battle.enemy.name)}</strong> <span>${escape_html(battle.enemy.shield ? `Shield ${battle.enemy.shield}` : intent.label)}</span></div> <div class="hp-row"><span>HP</span> <div class="hp-track"><i${attr_style(`width:${hpPercent(battle.enemy)}%`)}></i></div> <b>${escape_html(battle.enemy.hp)}/${escape_html(battle.enemy.maxHp)}</b></div> <div class="meter-row"><span>Momentum</span> `);
    MomentumBar($$renderer2, { momentum: battle.momentum });
    $$renderer2.push(`<!----> <b>${escape_html(battle.momentum)}/5</b></div> <div class="intent-card"><span>Intent: ${escape_html(intent.label)}</span> <strong>Incoming Damage: ${escape_html(intent.damage)}</strong> <small>Current Combo: ${escape_html(intent.combo)}</small></div></div> <!--[-->`);
    const each_array_2 = ensure_array_like(battle.floatingTexts.filter((item) => item.side === "enemy"));
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let item = each_array_2[$$index_2];
      $$renderer2.push(`<em${attr_class(`float ${stringify(item.tone)}`)}>${escape_html(item.text)}</em>`);
    }
    $$renderer2.push(`<!--]--></article></section> <section${attr_class("center-stage", void 0, { "counter-mode": defending })}><div class="battle-status"><span>Momentum x${escape_html(battle.momentum)}</span> <strong>CHAIN x${escape_html(Math.max(1, battle.chain))}</strong> <span>Damage Bonus +${escape_html(Math.round((chainMultiplier(Math.max(1, battle.chain)) * momentumMultiplier(battle.momentum) - 1) * 100))}%</span></div> <div class="attack-card">`);
    if (defending) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="counter-kicker">COUNTER WINDOW</span> <strong>COUNTER?</strong> `);
      if (battle.currentAttack) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<b>Enemy Used: ${escape_html(battle.currentAttack.label)}</b> <em>Incoming Damage: ${escape_html(incomingDamage)}</em>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else if (battle.currentAttack) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<span>${escape_html(battle.activeSide === "player" ? "你的攻勢" : "敵人的攻勢")}</span> <strong>${escape_html(battle.currentAttack.label)}</strong> <b>${escape_html(projectedDamage(battle.currentAttack.baseDamage, 0))} Damage</b>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span>主動回合</span> <strong>選一個 Combo 出招</strong> <b>Build pressure. Force a bad Pass.</b>`);
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    const each_array_3 = ensure_array_like(battle.floatingTexts);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let item = each_array_3[$$index_3];
      $$renderer2.push(`<em${attr_class(`center-float ${stringify(item.tone)} side-${stringify(item.side)}`)}>${escape_html(item.text)}</em>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (battle.phase === "victory" || battle.phase === "defeat") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="end-banner"><strong>${escape_html(battle.phase === "victory" ? "Victory" : "Defeat")}</strong> <button>再戰一場</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="combo-panel"><div class="zone-title"><strong>${escape_html(actionTitle)}</strong> <span>${escape_html(defending ? "選一個 Counter，或 Pass 承受傷害" : "Combo 是主操作，手牌只是原料")}</span></div> <div${attr_class("combo-grid", void 0, { "counter-list": defending })}><!--[-->`);
    const each_array_4 = ensure_array_like(shownCombos);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let combo = each_array_4[$$index_4];
      ComboButton($$renderer2, {
        combo,
        disabled: !allowedIds.has(combo.id) || battle.phase !== "playing",
        mode: defending ? "counter" : "attack",
        chain: Math.max(1, battle.chain + (defending ? 1 : 0)),
        projectedDamage: projectedDamage(combo.baseDamage, defending ? 0.25 : 0),
        onPick: battleStore.chooseCombo
      });
    }
    $$renderer2.push(`<!--]--></div> `);
    if (defending) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="pass-button"${attr("disabled", battle.phase !== "playing", true)}>PASS -> Take ${escape_html(incomingDamage)} damage</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="lower-grid"><article class="player-panel-mini"><div class="zone-title"><strong>${escape_html(battle.player.name)}</strong> <span>${escape_html(battle.player.shield ? `Shield ${battle.player.shield}` : "Ready")}</span></div> <div class="hp-row"><span>HP</span> <div class="hp-track"><i${attr_style(`width:${hpPercent(battle.player)}%`)}></i></div> <b>${escape_html(battle.player.hp)}/${escape_html(battle.player.maxHp)}</b></div> <div class="counter-hand compact"><!--[-->`);
    const each_array_5 = ensure_array_like(battle.player.hand);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let card = each_array_5[$$index_5];
      $$renderer2.push(`<span${attr_class("", void 0, { "red": card.suit === "diamond" || card.suit === "heart" })}>${escape_html(cardListLabel([card]))}</span>`);
    }
    $$renderer2.push(`<!--]--></div></article> <article class="skill-panel"><div class="zone-title"><strong>Build / 技能</strong> <span>Rule Slot ${escape_html(battle.player.ruleSkillIds.length)}/2</span></div> <div class="skill-grid"><!--[-->`);
    const each_array_6 = ensure_array_like(battle.player.skills);
    for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
      let skill = each_array_6[$$index_6];
      $$renderer2.push(`<button${attr("disabled", skill.type === "ruleChange" || skill.oncePerBattle && skill.usedThisBattle || battle.phase !== "playing", true)}${attr("title", skill.description)}${attr_class("", void 0, { "rule": skill.type === "ruleChange" })}><strong>${escape_html(skill.name)}</strong> <span>${escape_html(skill.description)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></article></section> <section class="event-log"><!--[-->`);
    const each_array_7 = ensure_array_like(battle.events);
    for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
      let event2 = each_array_7[$$index_7];
      $$renderer2.push(`<p${attr_class(clsx(event2.tone))}>${escape_html(event2.text)}</p>`);
    }
    $$renderer2.push(`<!--]--></section></main>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { battle });
  });
}
function _page($$renderer) {
  var $$store_subs;
  BattleScreen($$renderer, {
    battle: store_get($$store_subs ??= {}, "$battleStore", battleStore)
  });
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
export {
  _page as default
};
