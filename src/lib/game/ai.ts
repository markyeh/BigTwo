import { findPlayableCombos } from './handEvaluator';
import type { BattleState, Combo } from './types';

export type AiAction = { type: 'play'; cardIds: string[] } | { type: 'pass' };

export function chooseAiAction(state: BattleState, playerId: string): AiAction {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) return { type: 'pass' };

  const playable = findPlayableCombos(player.hand, state.lastCombo, state.activeRuleModifiers);
  const legal = state.mustIncludeCardId
    ? playable.filter((combo) => combo.cards.some((card) => card.id === state.mustIncludeCardId))
    : playable;
  if (!legal.length) return { type: 'pass' };

  const personality = player.aiPersonality ?? 'basic';
  const chosen = state.lastCombo
    ? chooseResponse(legal, personality)
    : chooseLead(legal, personality);

  return { type: 'play', cardIds: chosen.cards.map((card) => card.id) };
}

function chooseLead(combos: Combo[], personality: string): Combo {
  const nonSingles = combos.filter((combo) => combo.type !== 'single');
  const fiveCards = nonSingles.filter((combo) => combo.cards.length === 5);
  const groups = nonSingles.filter((combo) => combo.cards.length < 5);

  if (personality === 'aggressive' || personality === 'boss') {
    return strongestLengthFirst(fiveCards)[0] ?? strongestLengthFirst(groups)[0] ?? combos[0];
  }

  if (personality === 'conservative') {
    const lowGroup = groups.find((combo) => combo.rankValue < 9);
    return lowGroup ?? smallestNonTwoSingle(combos) ?? strongestLengthFirst(nonSingles)[0] ?? combos[0];
  }

  return strongestLengthFirst(groups)[0] ?? fiveCards[0] ?? combos[0];
}

function chooseResponse(combos: Combo[], personality: string): Combo {
  if (personality === 'aggressive' || personality === 'boss') {
    return strongestLengthFirst(combos)[0];
  }

  if (personality === 'conservative') {
    const singleLow = combos.find((combo) => combo.type === 'single' && combo.rankValue < 10);
    return singleLow ?? combos[0];
  }

  return combos[0];
}

function strongestLengthFirst(combos: Combo[]): Combo[] {
  return [...combos].sort(
    (a, b) =>
      b.cards.length - a.cards.length ||
      b.comboValue - a.comboValue ||
      a.rankValue - b.rankValue ||
      a.suitValue - b.suitValue
  );
}

function smallestNonTwoSingle(combos: Combo[]): Combo | undefined {
  const singleLow = combos.find((combo) => combo.type === 'single' && combo.rankValue < 10);
  return singleLow ?? combos.find((combo) => combo.type === 'single');
}
