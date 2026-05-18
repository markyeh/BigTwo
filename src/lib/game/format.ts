import { getCardLabel } from './cards';
import type { Card, ComboType } from './types';
import type { CounterComboType } from './counterTypes';

export function comboName(type: ComboType | CounterComboType): string {
  const names: Record<ComboType, string> = {
    single: '單張',
    pair: '對子',
    triple: '三條',
    straight: '順子',
    flush: '同花',
    fullHouse: '葫蘆',
    fourOfAKind: '鐵支',
    straightFlush: '同花順'
  };
  return names[type];
}

export function cardListLabel(cards: Card[]): string {
  return cards.map(getCardLabel).join(' ');
}
