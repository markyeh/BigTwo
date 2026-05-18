import { createDeck, dealCards, getCardLabel, shuffleDeck, sortCards } from './cards';
import { comboName } from './format';
import { canBeatCombo, evaluateCombo } from './handEvaluator';
import { rookieSkills } from './skills';
import type { AdventureState, BattleState, Card, PlayerState } from './types';
import { resolveBattleResult } from './rewards';

export function createBattle(adventure: AdventureState, battleKind: 'normal' | 'boss'): BattleState {
  const deck = shuffleDeck(createDeck());
  const hands = dealCards(deck, 4);
  const players: PlayerState[] = [
    {
      id: 'player',
      name: '你',
      role: 'human',
      hp: adventure.playerHp,
      maxHp: adventure.playerMaxHp,
      energy: 3,
      maxEnergy: 3,
      hand: hands[0],
      skills: adventure.playerSkills.length ? resetBattleSkills(adventure.playerSkills) : rookieSkills(),
      equippedRuleChangingSkillIds: adventure.equippedRuleChangingSkillIds
    },
    {
      id: 'ai-1',
      name: '北門牌手',
      role: 'ai',
      aiPersonality: 'conservative',
      hp: 20,
      maxHp: 20,
      energy: 0,
      maxEnergy: 0,
      hand: hands[1],
      skills: [],
      equippedRuleChangingSkillIds: []
    },
    {
      id: 'ai-2',
      name: '夜市高手',
      role: 'ai',
      aiPersonality: 'basic',
      hp: 20,
      maxHp: 20,
      energy: 0,
      maxEnergy: 0,
      hand: hands[2],
      skills: [],
      equippedRuleChangingSkillIds: []
    },
    {
      id: 'ai-3',
      name: battleKind === 'boss' ? '街頭霸王' : '巷口快手',
      role: battleKind === 'boss' ? 'boss' : 'ai',
      aiPersonality: battleKind === 'boss' ? 'boss' : 'aggressive',
      hp: battleKind === 'boss' ? 30 : 20,
      maxHp: battleKind === 'boss' ? 30 : 20,
      energy: 0,
      maxEnergy: 1,
      hand: hands[3],
      skills: [],
      equippedRuleChangingSkillIds: []
    }
  ];
  const starterIndex = players.findIndex((player) => player.hand.some((card) => card.id === '3-diamond'));

  return {
    battleId: crypto.randomUUID(),
    kind: battleKind,
    players,
    currentPlayerIndex: starterIndex,
    lastCombo: null,
    lastComboPlayerId: null,
    passPlayerIds: [],
    finishedPlayerIds: [],
    roundNumber: 1,
    phase: 'dealing',
    selectedCardIds: [],
    highlightedCardIds: [],
    battleLog: [
      {
        id: crypto.randomUUID(),
        message: `${players[starterIndex].name} 持有 3♦，由他先攻。`
      }
    ],
    mustIncludeCardId: '3-diamond',
    activeRuleModifiers: [],
    playedCards: []
  };
}

export function startBattle(state: BattleState): BattleState {
  return { ...state, phase: 'playing' };
}

export function selectCard(state: BattleState, cardId: string): BattleState {
  if (state.players[state.currentPlayerIndex]?.role !== 'human') return state;
  const selectedCardIds = state.selectedCardIds.includes(cardId)
    ? state.selectedCardIds.filter((id) => id !== cardId)
    : [...state.selectedCardIds, cardId];
  return { ...state, selectedCardIds, highlightedCardIds: [] };
}

export function clearSelection(state: BattleState): BattleState {
  return { ...state, selectedCardIds: [], highlightedCardIds: [] };
}

export function setSelection(state: BattleState, cardIds: string[]): BattleState {
  if (state.players[state.currentPlayerIndex]?.role !== 'human') return state;
  const handIds = new Set(state.players[0].hand.map((card) => card.id));
  return {
    ...state,
    selectedCardIds: cardIds.filter((cardId) => handIds.has(cardId)),
    highlightedCardIds: []
  };
}

export function playSelectedCards(state: BattleState): BattleState {
  const current = state.players[state.currentPlayerIndex];
  const selected = current.hand.filter((card) => state.selectedCardIds.includes(card.id));
  return playCards(state, current.id, selected.map((card) => card.id));
}

export function playCards(state: BattleState, playerId: string, cardIds: string[]): BattleState {
  if (state.phase !== 'playing') return state;
  const playerIndex = state.players.findIndex((player) => player.id === playerId);
  if (playerIndex !== state.currentPlayerIndex) return state;
  const player = state.players[playerIndex];
  const selected = player.hand.filter((card) => cardIds.includes(card.id));
  const evaluated = evaluateCombo(selected, state.activeRuleModifiers);

  if (!evaluated) return log(state, '這不是合法牌型。');
  if (state.mustIncludeCardId && !selected.some((card) => card.id === state.mustIncludeCardId)) {
    return log(state, '第一手必須包含 3♦。');
  }
  if (state.lastCombo && !canBeatCombo(evaluated, state.lastCombo)) {
    return log(state, '這手牌壓不過桌面的牌。');
  }

  const nextPlayers = state.players.map((candidate, index) => {
    if (index !== playerIndex) return candidate;
    return {
      ...candidate,
      hand: sortCards(candidate.hand.filter((card) => !cardIds.includes(card.id)))
    };
  });

  let next: BattleState = {
    ...state,
    players: nextPlayers,
    lastCombo: evaluated,
    lastComboPlayerId: player.id,
    passPlayerIds: [],
    selectedCardIds: [],
    highlightedCardIds: [],
    mustIncludeCardId: undefined,
    activeRuleModifiers: state.activeRuleModifiers.filter((modifier) => modifier.expiresAt !== 'afterPlay'),
    playedCards: [...state.playedCards, ...selected],
    battleLog: [
      {
        id: crypto.randomUUID(),
        message: `${player.name} 打出 ${comboName(evaluated.type)}：${selected.map(getCardLabel).join(' ')}`
      },
      ...state.battleLog
    ].slice(0, 40)
  };

  if (next.players[playerIndex].hand.length === 0 && !next.finishedPlayerIds.includes(player.id)) {
    const rank = next.finishedPlayerIds.length + 1;
    next = {
      ...next,
      players: next.players.map((candidate, index) =>
        index === playerIndex ? { ...candidate, finishedRank: rank } : candidate
      ),
      finishedPlayerIds: [...next.finishedPlayerIds, player.id],
      battleLog: [{ id: crypto.randomUUID(), message: `${player.name} 第 ${rank} 名出完！` }, ...next.battleLog]
    };
  }

  next = checkBattleFinished(next);
  return next.phase === 'playing' ? advanceTurn(next) : next;
}

export function passTurn(state: BattleState): BattleState {
  if (state.phase !== 'playing') return state;
  if (!state.lastCombo) return log(state, '桌面清空時不能 Pass。');
  const current = state.players[state.currentPlayerIndex];
  if (current.id === state.lastComboPlayerId) return log(state, '剛出牌的人不能 Pass 自己的牌。');

  let next: BattleState = {
    ...state,
    selectedCardIds: [],
    highlightedCardIds: [],
    passPlayerIds: state.passPlayerIds.includes(current.id) ? state.passPlayerIds : [...state.passPlayerIds, current.id],
    battleLog: [{ id: crypto.randomUUID(), message: `${current.name} Pass。` }, ...state.battleLog].slice(0, 40)
  };

  if (current.role === 'human') {
    next = applyPassCharge(next);
  }

  const activePlayers = next.players.filter((player) => player.hand.length > 0);
  const everyoneElsePassed = activePlayers
    .filter((player) => player.id !== next.lastComboPlayerId)
    .every((player) => next.passPlayerIds.includes(player.id));

  if (everyoneElsePassed && next.lastComboPlayerId) {
    const lastPlayerIndex = next.players.findIndex((player) => player.id === next.lastComboPlayerId);
    const currentPlayerIndex =
      next.players[lastPlayerIndex]?.hand.length > 0 ? lastPlayerIndex : nextActiveIndexFrom(next, lastPlayerIndex);
    return {
      ...next,
      currentPlayerIndex,
      lastCombo: null,
      lastComboPlayerId: null,
      passPlayerIds: [],
      roundNumber: next.roundNumber + 1,
      battleLog: [{ id: crypto.randomUUID(), message: '其他玩家都 Pass，桌面清空。' }, ...next.battleLog].slice(0, 40)
    };
  }

  return advanceTurn(next);
}

export function advanceTurn(state: BattleState): BattleState {
  const total = state.players.length;
  for (let offset = 1; offset <= total; offset += 1) {
    const index = (state.currentPlayerIndex + offset) % total;
    const player = state.players[index];
    if (player.hand.length > 0 && !state.finishedPlayerIds.includes(player.id)) {
      return { ...state, currentPlayerIndex: index };
    }
  }
  return state;
}

export function checkRoundClear(state: BattleState): BattleState {
  if (!state.lastComboPlayerId) return state;
  const activePlayers = state.players.filter((player) => player.hand.length > 0);
  const everyoneElsePassed = activePlayers
    .filter((player) => player.id !== state.lastComboPlayerId)
    .every((player) => state.passPlayerIds.includes(player.id));
  if (!everyoneElsePassed) return state;
  return {
    ...state,
    lastCombo: null,
    lastComboPlayerId: null,
    passPlayerIds: [],
    roundNumber: state.roundNumber + 1
  };
}

export function checkBattleFinished(state: BattleState): BattleState {
  const unfinished = state.players.filter((player) => player.hand.length > 0);
  if (unfinished.length > 1) return state;
  const last = unfinished[0];
  const players = last
    ? state.players.map((player) =>
        player.id === last.id ? { ...player, finishedRank: state.finishedPlayerIds.length + 1 } : player
      )
    : state.players;
  const finishedPlayerIds = last ? [...state.finishedPlayerIds, last.id] : state.finishedPlayerIds;
  const resultState = { ...state, players, finishedPlayerIds, phase: 'reward' as const };
  return { ...resultState, reward: { ...resolveBattleResult(resultState), stageCleared: true } };
}

export { resolveBattleResult };

function applyPassCharge(state: BattleState): BattleState {
  const player = state.players[0];
  const skill = player.skills.find((candidate) => candidate.id === 'pass-charge');
  if (!skill || skill.usedThisBattle) return state;
  return {
    ...state,
    players: state.players.map((candidate, index) =>
      index === 0
        ? {
            ...candidate,
            energy: Math.min(candidate.maxEnergy, candidate.energy + 1),
            skills: candidate.skills.map((candidateSkill) =>
              candidateSkill.id === 'pass-charge' ? { ...candidateSkill, usedThisBattle: true } : candidateSkill
            )
          }
        : candidate
    ),
    battleLog: [{ id: crypto.randomUUID(), message: 'Pass 蓄能：你回復 1 Energy。' }, ...state.battleLog].slice(0, 40)
  };
}

function resetBattleSkills(skills: PlayerState['skills']): PlayerState['skills'] {
  return skills.map((skill) => ({ ...skill, usedThisBattle: false }));
}

function nextActiveIndexFrom(state: BattleState, fromIndex: number): number {
  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const index = (fromIndex + offset) % state.players.length;
    const player = state.players[index];
    if (player.hand.length > 0 && !state.finishedPlayerIds.includes(player.id)) return index;
  }
  return fromIndex;
}

function log(state: BattleState, message: string): BattleState {
  return {
    ...state,
    battleLog: [{ id: crypto.randomUUID(), message }, ...state.battleLog].slice(0, 40)
  };
}
