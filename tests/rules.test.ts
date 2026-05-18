import { strict as assert } from 'node:assert';
import { createDeck } from '../src/lib/game/cards';
import { canBeatCombo, evaluateCombo } from '../src/lib/game/handEvaluator';
import type { Card, Rank, Suit } from '../src/lib/game/types';

function card(rank: Rank, suit: Suit): Card {
  return { id: `${rank}-${suit}`, rank, suit };
}

const deck = createDeck();
assert.equal(deck.length, 52, 'deck has 52 cards');
assert.equal(new Set(deck.map((item) => item.id)).size, 52, 'deck card ids are unique');

assert.equal(evaluateCombo([card('3', 'club')])?.type, 'single');
assert.equal(evaluateCombo([card('8', 'club'), card('8', 'spade')])?.type, 'pair');
assert.equal(evaluateCombo([card('K', 'club'), card('K', 'heart'), card('K', 'spade')])?.type, 'triple');
assert.equal(
  evaluateCombo([card('3', 'club'), card('4', 'diamond'), card('5', 'heart'), card('6', 'spade'), card('7', 'club')])
    ?.type,
  'straight'
);
assert.equal(
  evaluateCombo([card('3', 'club'), card('6', 'club'), card('9', 'club'), card('J', 'club'), card('A', 'club')])?.type,
  'flush'
);
assert.equal(
  evaluateCombo([card('Q', 'club'), card('Q', 'diamond'), card('Q', 'heart'), card('5', 'club'), card('5', 'spade')])
    ?.type,
  'fullHouse'
);
assert.equal(
  evaluateCombo([card('9', 'club'), card('9', 'diamond'), card('9', 'heart'), card('9', 'spade'), card('4', 'club')])
    ?.type,
  'fourOfAKind'
);
assert.equal(
  evaluateCombo([card('6', 'spade'), card('7', 'spade'), card('8', 'spade'), card('9', 'spade'), card('10', 'spade')])
    ?.type,
  'straightFlush'
);
assert.equal(
  evaluateCombo([card('J', 'club'), card('Q', 'diamond'), card('K', 'heart'), card('A', 'spade'), card('2', 'club')]),
  null,
  '2 is not allowed in normal straight'
);
assert.equal(
  evaluateCombo(
    [card('J', 'club'), card('Q', 'diamond'), card('K', 'heart'), card('A', 'spade'), card('2', 'club')],
    [{ id: 'm', sourceSkillId: 'forbidden-sequence', expiresAt: 'afterPlay', effect: 'allowTwoInStraight' }]
  )?.type,
  'straight',
  'forbidden sequence allows JQKA2'
);

const straightA = evaluateCombo([
  card('6', 'club'),
  card('7', 'diamond'),
  card('8', 'heart'),
  card('9', 'spade'),
  card('10', 'club')
])!;
const straightB = evaluateCombo([
  card('6', 'diamond'),
  card('7', 'club'),
  card('8', 'spade'),
  card('9', 'heart'),
  card('10', 'spade')
])!;
assert.equal(canBeatCombo(straightB, straightA), true, 'same straight compares high-card suit');

const flush = evaluateCombo([card('3', 'heart'), card('6', 'heart'), card('9', 'heart'), card('J', 'heart'), card('A', 'heart')])!;
const fullHouse = evaluateCombo([
  card('4', 'club'),
  card('4', 'diamond'),
  card('4', 'heart'),
  card('7', 'club'),
  card('7', 'spade')
])!;
assert.equal(canBeatCombo(fullHouse, flush), true, 'full house beats flush');

console.log('rules ok');
