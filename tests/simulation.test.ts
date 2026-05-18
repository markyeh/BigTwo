import { strict as assert } from 'node:assert';
import { chooseAiAction } from '../src/lib/game/ai';
import { applyBattleReward, battleKindForStage, createAdventure } from '../src/lib/game/adventure';
import { createBattle, passTurn, playCards, startBattle } from '../src/lib/game/battleEngine';
import type { AdventureState } from '../src/lib/game/types';

let adventure: AdventureState = { ...createAdventure(), status: 'inBattle' };

for (let stage = 0; stage < adventure.maxStages; stage += 1) {
  let battle = startBattle(createBattle(adventure, battleKindForStage(adventure.stageIndex)));

  for (let turn = 0; turn < 500 && battle.phase === 'playing'; turn += 1) {
    const actor = battle.players[battle.currentPlayerIndex];
    const action = chooseAiAction(battle, actor.id);
    battle = action.type === 'play' ? playCards(battle, actor.id, action.cardIds) : passTurn(battle);
  }

  assert.equal(battle.phase, 'reward', `stage ${stage + 1} battle reaches reward`);
  assert.equal(new Set(battle.finishedPlayerIds).size, 4, `stage ${stage + 1} has four unique ranks`);
  assert.ok(battle.reward, `stage ${stage + 1} creates reward`);

  adventure = applyBattleReward(adventure, 0, battle.reward?.choices[0]);
  if (adventure.status !== 'inBattle') break;
}

assert.equal(adventure.status, 'finished', 'three-stage adventure can finish');
assert.ok(adventure.playerSkills.filter((skill) => skill.type === 'ruleChange').length <= 1, 'rule-change skill limit holds');
assert.ok(adventure.playerSkills.filter((skill) => skill.type !== 'ruleChange').length <= 3, 'assist/passive skill limit holds');

console.log('simulation ok');
