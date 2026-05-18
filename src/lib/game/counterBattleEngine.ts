import { getRankValue } from './cards';
import { getCharacter, getCounterSkill, getEnemy } from './counterContent';
import { chooseEnemyAttack, chooseEnemyCounter } from './counterAi';
import { canCounterCombo } from './comboCompare';
import { scanCombos } from './comboScanner';
import { createDeckZone, discardCards, drawCards, refillHand } from './deck';
import { cardListLabel, comboName } from './format';
import { chainMultiplier, momentumMultiplier, nextMomentum } from './momentum';
import type { Card, Skill } from './types';
import type {
  BattleSide,
  CharacterId,
  CounterActor,
  CounterBattleState,
  CounterCombo,
  EnemyId
} from './counterTypes';

export function createCounterBattle(characterId: CharacterId = 'fighter', enemyId: EnemyId = 'aggressive'): CounterBattleState {
  const character = getCharacter(characterId);
  const enemyDefinition = getEnemy(enemyId);
  const playerDeck = createDeckZone();
  const enemyDeck = createDeckZone();
  const playerDraw = drawCards(playerDeck, 8);
  const enemyDraw = drawCards(enemyDeck, 8);
  const playerRuleSkillIds = character.ruleSkillIds.slice(0, 2);

  return {
    phase: 'playing',
    character: characterId,
    enemyId,
    player: {
      id: 'player',
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
      id: 'enemy',
      name: enemyDefinition.name,
      hp: enemyDefinition.maxHp,
      maxHp: enemyDefinition.maxHp,
      shield: 0,
      hand: enemyDraw.cards,
      deck: enemyDraw.deck,
      skills: [],
      ruleSkillIds: enemyId === 'trickster' ? ['ace-overdrive'] : []
    },
    activeSide: 'player',
    defendingSide: 'enemy',
    currentAttack: null,
    momentum: 0,
    chain: 0,
    turn: 1,
    feedback: 'idle',
    events: [event(`遭遇 ${enemyDefinition.name}：${enemyDefinition.intent}`, 'info')],
    floatingTexts: [],
    selectedComboId: null,
    nextDamageBonus: 0,
    playerRuleFlags: {
      aceAsTwo: playerRuleSkillIds.includes('ace-overdrive'),
      pairAsTriple: playerRuleSkillIds.includes('pair-echo')
    }
  };
}

export function getPlayerCombos(state: CounterBattleState): CounterCombo[] {
  return scanCombos(state.player.hand, state.playerRuleFlags);
}

export function getPlayerActions(state: CounterBattleState): CounterCombo[] {
  const combos = getPlayerCombos(state);
  if (state.defendingSide === 'player' && state.currentAttack) {
    return combos.filter((combo) => canCounterCombo(combo, state.currentAttack!));
  }
  return combos;
}

export function playerChooseCombo(state: CounterBattleState, comboId: string): CounterBattleState {
  if (state.phase !== 'playing') return state;
  const combo = getPlayerActions(state).find((candidate) => candidate.id === comboId);
  if (!combo) return pushEvent(state, '這個 Combo 目前不能使用。', 'info');
  return state.defendingSide === 'player' ? playerCounter(state, combo) : playerAttack(state, combo);
}

export function playerPass(state: CounterBattleState): CounterBattleState {
  if (state.phase !== 'playing' || state.defendingSide !== 'player' || !state.currentAttack) return state;
  let next = resolveDamage(state, 'player', state.currentAttack, '你選擇 Pass');

  if (next.character === 'gambler' && next.phase === 'playing') {
    next = gamblerPassCycle(next);
  }

  if (next.phase !== 'playing') return next;
  return {
    ...next,
    currentAttack: null,
    activeSide: 'player',
    defendingSide: 'enemy',
    chain: 0,
    turn: next.turn + 1
  };
}

export function useCounterSkill(state: CounterBattleState, skillId: string): CounterBattleState {
  const skill = state.player.skills.find((candidate) => candidate.id === skillId);
  if (!skill || skill.type === 'ruleChange') return state;
  if (skill.oncePerBattle && skill.usedThisBattle) return pushEvent(state, '這個技能本場已使用過。', 'info');

  let next = markSkillUsed(state, skillId);
  if (skillId === 'power-strike') {
    return addFloating(pushEvent({ ...next, nextDamageBonus: next.nextDamageBonus + 0.3, feedback: 'skill' }, '重擊架勢：下一次傷害 +30%。', 'skill'), 'player', '+30%', 'skill');
  }
  if (skillId === 'guard-up') {
    return addFloating(pushEvent(updateActor(next, 'player', { shield: next.player.shield + 14 }), '舉盾：獲得 14 點護盾。', 'skill'), 'player', 'Block +14', 'block');
  }
  if (skillId === 'focus-breath') {
    return addFloating(pushEvent({ ...next, momentum: nextMomentum(next.momentum), feedback: 'skill' }, '集中呼吸：Momentum +1。', 'skill'), 'player', 'Momentum +1', 'skill');
  }
  if (skillId === 'quick-mulligan') {
    const lowest = [...next.player.hand].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank)).slice(0, 2);
    next = movePlayedCards(next, 'player', lowest);
    return pushEvent(addFloating(next, 'player', '換牌', 'skill'), '快手換牌：棄掉 2 張低牌並補滿。', 'skill');
  }
  if (skillId === 'revenge-spark') {
    const bonus = next.defendingSide === 'player' ? 0.25 : 0.15;
    return pushEvent({ ...next, nextDamageBonus: next.nextDamageBonus + bonus, feedback: 'skill' }, `反擊火花：下一次傷害 +${Math.round(bonus * 100)}%。`, 'skill');
  }
  if (skillId === 'second-wind') {
    const healed = Math.min(next.player.maxHp, next.player.hp + 10);
    return addFloating(pushEvent(updateActor(next, 'player', { hp: healed }), '第二口氣：回復 10 HP。', 'skill'), 'player', '+10 HP', 'skill');
  }
  return next;
}

function playerAttack(state: CounterBattleState, combo: CounterCombo): CounterBattleState {
  let next = playCombo(state, 'player', combo);
  next = pushEvent({ ...next, currentAttack: combo, activeSide: 'player', defendingSide: 'enemy', chain: 1 }, `你出招：${combo.label}`, 'info');

  const counter = chooseEnemyCounter(next);
  if (counter) {
    return enemyCounter(next, counter);
  }

  next = resolveDamage(next, 'enemy', combo, `${next.enemy.name} Pass`);
  if (next.phase !== 'playing') return next;
  return enemyStarts(next);
}

function playerCounter(state: CounterBattleState, combo: CounterCombo): CounterBattleState {
  let next = playCombo(state, 'player', combo);
  const momentum = nextMomentum(next.momentum);
  next = addFloating(
    pushEvent(
      {
        ...next,
        currentAttack: combo,
        activeSide: 'player',
        defendingSide: 'enemy',
        momentum,
        chain: next.chain + 1,
        feedback: 'counter'
      },
      `COUNTER！你用 ${combo.label} 壓制成功。`,
      'counter'
    ),
    'player',
    'COUNTER!',
    'counter'
  );

  const enemyCounterCombo = chooseEnemyCounter(next);
  if (enemyCounterCombo) return enemyCounter(next, enemyCounterCombo);

  next = resolveDamage(next, 'enemy', combo, `${next.enemy.name} 無法 Counter`);
  if (next.phase !== 'playing') return next;
  return enemyStarts(next);
}

function enemyStarts(state: CounterBattleState): CounterBattleState {
  const combo = chooseEnemyAttack(state);
  let next = playCombo(state, 'enemy', combo);
  return pushEvent(
    {
      ...next,
      currentAttack: combo,
      activeSide: 'enemy',
      defendingSide: 'player',
      chain: 1,
      turn: next.turn + 1
    },
    `${next.enemy.name} 出招：${combo.label}`,
    'info'
  );
}

function enemyCounter(state: CounterBattleState, combo: CounterCombo): CounterBattleState {
  let next = playCombo(state, 'enemy', combo);
  const momentum = nextMomentum(next.momentum);
  return addFloating(
    pushEvent(
      {
        ...next,
        currentAttack: combo,
        activeSide: 'enemy',
        defendingSide: 'player',
        momentum,
        chain: next.chain + 1,
        feedback: 'counter'
      },
      `COUNTER！${next.enemy.name} 用 ${combo.label} 反壓。`,
      'counter'
    ),
    'enemy',
    'COUNTER!',
    'counter'
  );
}

function playCombo(state: CounterBattleState, side: BattleSide, combo: CounterCombo): CounterBattleState {
  return movePlayedCards(state, side, combo.cards);
}

function movePlayedCards(state: CounterBattleState, side: BattleSide, cards: Card[]): CounterBattleState {
  const actor = state[side];
  const cardIds = new Set(cards.map((card) => card.id));
  const deckWithDiscard = discardCards(actor.deck, cards);
  const refilled = refillHand(actor.hand.filter((card) => !cardIds.has(card.id)), deckWithDiscard);
  return updateActor(state, side, {
    hand: refilled.hand,
    deck: refilled.deck
  });
}

function resolveDamage(state: CounterBattleState, target: BattleSide, combo: CounterCombo, reason: string): CounterBattleState {
  const attacker: BattleSide = target === 'player' ? 'enemy' : 'player';
  const fighterPairBonus = state.character === 'fighter' && attacker === 'player' && combo.type === 'pair' && state.chain > 1 ? 0.25 : 0;
  const rawDamage = Math.ceil(
    combo.baseDamage *
      chainMultiplier(state.chain) *
      momentumMultiplier(state.momentum) *
      (1 + (attacker === 'player' ? state.nextDamageBonus : 0) + fighterPairBonus)
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
    nextDamageBonus: attacker === 'player' ? 0 : next.nextDamageBonus,
    feedback: 'hit'
  };
  next = addFloating(next, target, blocked ? `-${damage} Block ${blocked}` : `-${damage}`, damage ? 'damage' : 'block');
  next = pushEvent(next, `${reason}，${actor.name} 受到 ${damage} 傷害。`, 'hit');

  if (next.enemy.hp <= 0) return { ...next, phase: 'victory' };
  if (next.player.hp <= 0) return { ...next, phase: 'defeat' };
  return next;
}

function gamblerPassCycle(state: CounterBattleState): CounterBattleState {
  const lowest = [...state.player.hand].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank))[0];
  if (!lowest) return state;
  return pushEvent(movePlayedCards(state, 'player', [lowest]), 'Gambler 被動：Pass 後換掉 1 張最低牌。', 'skill');
}

function updateActor(state: CounterBattleState, side: BattleSide, patch: Partial<CounterActor>): CounterBattleState {
  return {
    ...state,
    [side]: {
      ...state[side],
      ...patch
    }
  };
}

function markSkillUsed(state: CounterBattleState, skillId: string): CounterBattleState {
  return updateActor(state, 'player', {
    skills: state.player.skills.map((skill) => (skill.id === skillId ? { ...skill, usedThisBattle: true } : skill))
  });
}

function pushEvent(state: CounterBattleState, text: string, tone: CounterBattleState['events'][number]['tone']): CounterBattleState {
  return {
    ...state,
    events: [event(text, tone), ...state.events].slice(0, 8)
  };
}

function event(text: string, tone: CounterBattleState['events'][number]['tone']) {
  return { id: crypto.randomUUID(), text, tone };
}

function addFloating(
  state: CounterBattleState,
  side: BattleSide,
  text: string,
  tone: CounterBattleState['floatingTexts'][number]['tone']
): CounterBattleState {
  return {
    ...state,
    floatingTexts: [{ id: crypto.randomUUID(), side, text, tone }, ...state.floatingTexts].slice(0, 6)
  };
}
