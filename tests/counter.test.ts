import { strict as assert } from 'node:assert';
import { canCounterCombo } from '../src/lib/game/comboCompare';
import { scanCombos } from '../src/lib/game/comboScanner';
import {
  createCounterBattle,
  getPlayerActions,
  playerChooseCombo,
  playerPass,
  useCounterSkill
} from '../src/lib/game/counterBattleEngine';
import type { Card, Rank, Suit } from '../src/lib/game/types';

function card(rank: Rank, suit: Suit): Card {
  return { id: `${rank}-${suit}`, rank, suit };
}

const hand = [
  card('8', 'club'),
  card('8', 'spade'),
  card('J', 'club'),
  card('J', 'diamond'),
  card('J', 'heart'),
  card('A', 'spade'),
  card('2', 'club'),
  card('4', 'heart')
];
const combos = scanCombos(hand);
assert.ok(combos.some((combo) => combo.type === 'pair'), 'scans pairs');
assert.ok(combos.some((combo) => combo.type === 'triple'), 'scans triples');

const pair8 = combos.find((combo) => combo.type === 'pair' && combo.cards[0].rank === '8')!;
const pairJ = combos.find((combo) => combo.type === 'pair' && combo.cards[0].rank === 'J')!;
assert.equal(canCounterCombo(pairJ, pair8), true, 'larger pair counters smaller pair');
assert.equal(canCounterCombo(pair8, pairJ), false, 'smaller pair cannot counter larger pair');

let battle = createCounterBattle('fighter', 'aggressive');
assert.equal(battle.player.hand.length, 8);
assert.equal(battle.enemy.hand.length, 8);
assert.equal(getPlayerActions(battle).length > 0, true);

const opening = getPlayerActions(battle).find((combo) => combo.type !== 'single') ?? getPlayerActions(battle)[0];
battle = playerChooseCombo(battle, opening.id);
assert.equal(battle.player.hand.length, 8, 'player refills after acting');
assert.equal(battle.enemy.hand.length, 8, 'enemy refills after responding');
assert.ok(battle.events.length > 1, 'battle logs action');

for (let i = 0; i < 120 && battle.phase === 'playing'; i += 1) {
  if (battle.defendingSide === 'player') {
    const counter = getPlayerActions(battle)[0];
    battle = counter ? playerChooseCombo(battle, counter.id) : playerPass(battle);
  } else {
    battle = useCounterSkill(battle, 'power-strike');
    const action = getPlayerActions(battle)[0];
    battle = playerChooseCombo(battle, action.id);
  }
}

assert.notEqual(battle.phase, 'playing', 'counter battle eventually ends under deterministic player policy');
console.log('counter ok');
