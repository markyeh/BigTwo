import { getRankValue, getSuitValue, sortCards } from './cards';
import type { Card, Combo, ComboType, Rank, RuleModifier, Suit } from './types';

const FIVE_CARD_VALUES: Record<ComboType, number> = {
  single: 0,
  pair: 0,
  triple: 0,
  straight: 1,
  flush: 2,
  fullHouse: 3,
  fourOfAKind: 4,
  straightFlush: 5
};

export function getComboTypeValue(type: ComboType): number {
  return FIVE_CARD_VALUES[type];
}

export function evaluateCombo(cards: Card[], ruleModifiers: RuleModifier[] = []): Combo | null {
  if (![1, 2, 3, 5].includes(cards.length)) return null;
  const effective = sortCards(cards.map((card) => applyModifiers(card, ruleModifiers)));

  if (effective.length === 1) {
    return combo('single', effective, effective[0]);
  }

  const groups = rankGroups(effective);

  if (effective.length === 2) {
    if (groups.length !== 1) return null;
    return combo('pair', effective, highestSuitCard(effective));
  }

  if (effective.length === 3) {
    if (groups.length !== 1) return null;
    return combo('triple', effective, highestSuitCard(effective));
  }

  const straightHigh = getStraightHighCard(effective, ruleModifiers);
  const flush = new Set(effective.map((card) => card.suit)).size === 1;

  if (straightHigh && flush) return combo('straightFlush', effective, straightHigh);

  const sortedGroups = groups.sort((a, b) => b.cards.length - a.cards.length);
  if (sortedGroups[0]?.cards.length === 4) {
    return combo('fourOfAKind', effective, highestSuitCard(sortedGroups[0].cards));
  }

  if (sortedGroups[0]?.cards.length === 3 && sortedGroups[1]?.cards.length === 2) {
    return combo('fullHouse', effective, highestSuitCard(sortedGroups[0].cards));
  }

  if (flush) return combo('flush', effective, highestCard(effective));
  if (straightHigh) return combo('straight', effective, straightHigh);

  return null;
}

export function canBeatCombo(candidate: Combo, target: Combo): boolean {
  if (candidate.cards.length !== target.cards.length) return false;

  if (candidate.cards.length === 5 && candidate.comboValue !== target.comboValue) {
    return candidate.comboValue > target.comboValue;
  }

  if (candidate.type !== target.type) return false;
  if (candidate.rankValue !== target.rankValue) return candidate.rankValue > target.rankValue;
  return candidate.suitValue > target.suitValue;
}

export function findPlayableCombos(
  hand: Card[],
  lastCombo: Combo | null,
  ruleModifiers: RuleModifier[] = []
): Combo[] {
  const sizes = lastCombo ? [lastCombo.cards.length] : [1, 2, 3, 5];
  const combos: Combo[] = [];

  for (const size of sizes) {
    for (const candidate of combinations(hand, size)) {
      const evaluated = evaluateCombo(candidate, ruleModifiers);
      if (evaluated && (!lastCombo || canBeatCombo(evaluated, lastCombo))) {
        combos.push(evaluated);
      }
    }
  }

  return combos.sort(compareComboStrength);
}

function combo(type: ComboType, cards: Card[], highCard: Card): Combo {
  return {
    type,
    cards,
    rankValue: getRankValue(highCard.rank),
    suitValue: getSuitValue(highCard.suit),
    comboValue: getComboTypeValue(type)
  };
}

function applyModifiers(card: Card, modifiers: RuleModifier[]): Card {
  let next = { ...card };
  for (const modifier of modifiers) {
    if (modifier.effect === 'aceAsTwo' && modifier.targetCardId === card.id && card.rank === 'A') {
      next = { ...next, rank: '2' };
    }
    if (modifier.effect === 'wildSuit' && modifier.targetCardId === card.id && modifier.targetSuit) {
      next = { ...next, suit: modifier.targetSuit };
    }
  }
  return next;
}

function rankGroups(cards: Card[]): { rank: Rank; cards: Card[] }[] {
  const map = new Map<Rank, Card[]>();
  for (const card of cards) map.set(card.rank, [...(map.get(card.rank) ?? []), card]);
  return [...map.entries()].map(([rank, groupCards]) => ({ rank, cards: groupCards }));
}

function getStraightHighCard(cards: Card[], modifiers: RuleModifier[]): Card | null {
  const allowTwo = modifiers.some((modifier) => modifier.effect === 'allowTwoInStraight');
  const values = cards.map((card) => getRankValue(card.rank));
  if (!allowTwo && cards.some((card) => card.rank === '2')) return null;
  if (new Set(values).size !== 5) return null;

  const sorted = sortCards(cards);
  const normal = values.every((value) => values.includes(value + 1) || value === Math.max(...values));
  if (normal && Math.max(...values) - Math.min(...values) === 4) return highestCard(sorted);

  const forbiddenSequence: Rank[] = ['J', 'Q', 'K', 'A', '2'];
  if (allowTwo && forbiddenSequence.every((rank) => cards.some((card) => card.rank === rank))) {
    return highestCard(cards.filter((card) => card.rank === '2'));
  }

  return null;
}

function highestCard(cards: Card[]): Card {
  return sortCards(cards).at(-1)!;
}

function highestSuitCard(cards: Card[]): Card {
  return [...cards].sort((a, b) => getSuitValue(a.suit) - getSuitValue(b.suit)).at(-1)!;
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return [
    ...combinations(rest, size - 1).map((comboItems) => [first, ...comboItems]),
    ...combinations(rest, size)
  ];
}

function compareComboStrength(a: Combo, b: Combo): number {
  if (a.cards.length !== b.cards.length) return b.cards.length - a.cards.length;
  if (a.comboValue !== b.comboValue) return a.comboValue - b.comboValue;
  if (a.rankValue !== b.rankValue) return a.rankValue - b.rankValue;
  return a.suitValue - b.suitValue;
}
