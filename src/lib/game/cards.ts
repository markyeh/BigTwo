import type { Card, Rank, Suit } from './types';

export const RANK_ORDER = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'] as const;
export const SUIT_ORDER = ['club', 'diamond', 'heart', 'spade'] as const;

export const SUIT_SYMBOL: Record<Suit, string> = {
  club: '♣',
  diamond: '♦',
  heart: '♥',
  spade: '♠'
};

export function createDeck(): Card[] {
  return RANK_ORDER.flatMap((rank) =>
    SUIT_ORDER.map((suit) => ({
      id: `${rank}-${suit}`,
      rank,
      suit
    }))
  );
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playerCount: number): Card[][] {
  const hands = Array.from({ length: playerCount }, () => [] as Card[]);
  deck.forEach((card, index) => hands[index % playerCount].push(card));
  return hands.map(sortCards);
}

export function getRankValue(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

export function getSuitValue(suit: Suit): number {
  return SUIT_ORDER.indexOf(suit);
}

export function compareCard(a: Card, b: Card): number {
  const rankDiff = getRankValue(a.rank) - getRankValue(b.rank);
  return rankDiff === 0 ? getSuitValue(a.suit) - getSuitValue(b.suit) : rankDiff;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort(compareCard);
}

export function getCardLabel(card: Card): string {
  return `${card.rank}${SUIT_SYMBOL[card.suit]}`;
}
