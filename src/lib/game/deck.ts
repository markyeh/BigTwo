import { createDeck, shuffleDeck, sortCards } from './cards';
import type { Card } from './types';
import type { DeckZone } from './counterTypes';

export function createDeckZone(): DeckZone {
  return {
    drawPile: shuffleDeck(createDeck()),
    discardPile: []
  };
}

export function drawCards(deck: DeckZone, count: number): { cards: Card[]; deck: DeckZone } {
  let drawPile = [...deck.drawPile];
  let discardPile = [...deck.discardPile];
  const cards: Card[] = [];

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

export function discardCards(deck: DeckZone, cards: Card[]): DeckZone {
  return {
    ...deck,
    discardPile: [...deck.discardPile, ...cards]
  };
}

export function refillHand(hand: Card[], deck: DeckZone, target = 8): { hand: Card[]; deck: DeckZone } {
  const needed = Math.max(0, target - hand.length);
  const result = drawCards(deck, needed);
  return {
    hand: sortCards([...hand, ...result.cards]),
    deck: result.deck
  };
}
