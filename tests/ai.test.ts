import { strict as assert } from 'node:assert';
import { chooseAiAction } from '../src/lib/game/ai';
import type { BattleState, Card, Rank, Suit } from '../src/lib/game/types';

function card(rank: Rank, suit: Suit): Card {
  return { id: `${rank}-${suit}`, rank, suit };
}

function stateWithHand(hand: Card[], personality: 'basic' | 'conservative' | 'aggressive'): BattleState {
  return {
    battleId: 'test',
    kind: 'normal',
    players: [
      {
        id: 'ai',
        name: 'AI',
        role: 'ai',
        aiPersonality: personality,
        hp: 20,
        maxHp: 20,
        energy: 0,
        maxEnergy: 0,
        hand,
        skills: [],
        equippedRuleChangingSkillIds: []
      }
    ],
    currentPlayerIndex: 0,
    lastCombo: null,
    lastComboPlayerId: null,
    passPlayerIds: [],
    finishedPlayerIds: [],
    roundNumber: 1,
    phase: 'playing',
    selectedCardIds: [],
    highlightedCardIds: [],
    battleLog: [],
    activeRuleModifiers: [],
    playedCards: []
  };
}

const mixedHand = [
  card('3', 'club'),
  card('4', 'club'),
  card('5', 'club'),
  card('6', 'club'),
  card('7', 'club'),
  card('9', 'heart'),
  card('9', 'spade'),
  card('K', 'diamond')
];

const basic = chooseAiAction(stateWithHand(mixedHand, 'basic'), 'ai');
const conservative = chooseAiAction(stateWithHand(mixedHand, 'conservative'), 'ai');
const aggressive = chooseAiAction(stateWithHand(mixedHand, 'aggressive'), 'ai');

assert.equal(basic.type, 'play');
assert.equal(conservative.type, 'play');
assert.equal(aggressive.type, 'play');

if (basic.type === 'play') assert.equal(basic.cardIds.length > 1, true);
if (conservative.type === 'play') assert.equal(conservative.cardIds.length > 1, true);
if (aggressive.type === 'play') assert.equal(aggressive.cardIds.length, 5);

console.log('ai ok');
