import type { CounterCombo } from './counterTypes';

export function canCounterCombo(candidate: CounterCombo, target: CounterCombo): boolean {
  if (candidate.type !== target.type) return false;
  if (candidate.rankValue !== target.rankValue) return candidate.rankValue > target.rankValue;
  if (candidate.type === 'triple') return false;
  return candidate.suitValue > target.suitValue;
}
