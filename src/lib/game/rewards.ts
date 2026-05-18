import { ALL_SKILLS } from './skills';
import type { BattleResult, BattleState, Skill } from './types';

export function resolveBattleResult(state: BattleState): BattleResult {
  const player = state.players[0];
  const rank = player.finishedRank ?? 4;
  const remaining = player.hand.length;
  const table: Record<number, { result: string; damage: number; choices: number }> = {
    1: { result: '完勝', damage: 0, choices: 3 },
    2: { result: '小勝', damage: 0, choices: 2 },
    3: { result: '受傷', damage: remaining, choices: 1 },
    4: { result: '慘敗', damage: remaining + 3, choices: 0 }
  };
  const outcome = table[rank];

  return {
    rank,
    damage: outcome.damage,
    result: outcome.result,
    choices: rewardChoices(player.skills, outcome.choices)
  };
}

function rewardChoices(currentSkills: Skill[], count: number): Skill[] {
  if (count === 0) return [];
  const owned = new Set(currentSkills.map((skill) => skill.id));
  const pool = ALL_SKILLS.filter((skill) => !owned.has(skill.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
