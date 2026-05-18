import { getRankValue, getSuitValue, sortCards } from './cards';
import { cardListLabel, comboName } from './format';
import type { CounterCombo, CounterComboType } from './counterTypes';
import type { Card, Rank } from './types';

export function scanCombos(hand: Card[], options: { aceAsTwo?: boolean; pairAsTriple?: boolean } = {}): CounterCombo[] {
  const cards = sortCards(hand);
  const combos: CounterCombo[] = [];

  for (const card of cards) {
    combos.push(makeCombo('single', [card], options));
  }

  const byRank = groupByRank(cards);
  for (const group of byRank.values()) {
    if (group.length >= 2) {
      for (const pair of combinations(group, 2)) {
        combos.push(makeCombo('pair', pair, options));
        if (options.pairAsTriple) combos.push(makeCombo('triple', pair, options, 'pair-as-triple'));
      }
    }
    if (group.length >= 3) {
      for (const triple of combinations(group, 3)) {
        combos.push(makeCombo('triple', triple, options));
      }
    }
  }

  return combos.sort((a, b) => a.type.localeCompare(b.type) || a.rankValue - b.rankValue || a.suitValue - b.suitValue);
}

export function comboDamage(combo: CounterCombo): number {
  const value = rankDamageValue(combo.cards[0].rank);
  if (combo.type === 'single') return value;
  if (combo.type === 'pair') return (value + 2) * 2;
  return (value + 4) * 4;
}

export function rankDamageValue(rank: Rank): number {
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  if (rank === 'A') return 14;
  if (rank === '2') return 16;
  return Number(rank);
}

function makeCombo(
  type: CounterComboType,
  cards: Card[],
  options: { aceAsTwo?: boolean },
  idSuffix = ''
): CounterCombo {
  const sorted = sortCards(cards);
  const rankValue = Math.max(...sorted.map((card) => effectiveRankValue(card, options)));
  const suitValue = Math.max(...sorted.map((card) => getSuitValue(card.suit)));
  const base = comboDamage({
    id: '',
    type,
    cards: sorted,
    rankValue,
    suitValue,
    baseDamage: 0,
    label: ''
  });
  const suffix = idSuffix ? `-${idSuffix}` : '';

  return {
    id: `${type}-${sorted.map((card) => card.id).join('-')}${suffix}`,
    type,
    cards: sorted,
    rankValue,
    suitValue,
    baseDamage: base,
    label: `${comboName(type)}${idSuffix === 'pair-as-triple' ? '（殘響）' : ''} ${cardListLabel(sorted)}`
  };
}

function effectiveRankValue(card: Card, options: { aceAsTwo?: boolean }): number {
  if (options.aceAsTwo && card.rank === 'A') return getRankValue('2');
  return getRankValue(card.rank);
}

function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();
  for (const card of cards) groups.set(card.rank, [...(groups.get(card.rank) ?? []), card]);
  return groups;
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return [
    ...combinations(rest, size - 1).map((combo) => [first, ...combo]),
    ...combinations(rest, size)
  ];
}
