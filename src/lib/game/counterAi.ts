import { canCounterCombo } from './comboCompare';
import { scanCombos } from './comboScanner';
import type { CounterBattleState, CounterCombo, EnemyId } from './counterTypes';

export function chooseEnemyAttack(state: CounterBattleState): CounterCombo {
  const combos = scanCombos(state.enemy.hand, enemyRuleOptions(state));
  if (state.enemyId === 'aggressive' || state.enemyId === 'trickster') {
    return [...combos].sort((a, b) => b.cards.length - a.cards.length || a.rankValue - b.rankValue)[0];
  }
  return combos.find((combo) => combo.type === 'pair' && combo.rankValue < 9) ?? combos[0];
}

export function chooseEnemyCounter(state: CounterBattleState): CounterCombo | null {
  if (!state.currentAttack) return null;
  const counters = scanCombos(state.enemy.hand, enemyRuleOptions(state))
    .filter((combo) => canCounterCombo(combo, state.currentAttack!))
    .sort((a, b) => a.rankValue - b.rankValue || a.suitValue - b.suitValue);

  if (!counters.length) return null;
  if (state.enemyId === 'defensive') {
    return counters.find((combo) => combo.rankValue < 10) ?? null;
  }
  return counters[0];
}

function enemyRuleOptions(state: { enemyId: EnemyId }): { aceAsTwo?: boolean } {
  return {
    aceAsTwo: state.enemyId === 'trickster'
  };
}
