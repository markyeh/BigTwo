import type { AdventureState, Skill } from './types';
import { addOrReplaceSkill, rookieSkills } from './skills';

export function createAdventure(): AdventureState {
  const skills = rookieSkills();
  return {
    stageIndex: 0,
    maxStages: 3,
    playerHp: 30,
    playerMaxHp: 30,
    gold: 0,
    exp: 0,
    level: 1,
    status: 'notStarted',
    playerSkills: skills,
    equippedRuleChangingSkillIds: skills.filter((skill) => skill.type === 'ruleChange').map((skill) => skill.id)
  };
}

export function applyBattleReward(adventure: AdventureState, damage: number, chosenSkill?: Skill): AdventureState {
  const nextHp = Math.max(0, adventure.playerHp - damage);
  const nextSkills = chosenSkill ? addOrReplaceSkill(adventure.playerSkills, chosenSkill) : adventure.playerSkills;
  const nextStage = adventure.stageIndex + 1;
  const bossLoss = adventure.stageIndex === 2 && damage > 0;
  const status =
    nextHp <= 0 || bossLoss ? 'gameOver' : nextStage >= adventure.maxStages ? 'finished' : 'inBattle';

  return {
    ...adventure,
    stageIndex: nextStage,
    playerHp: nextHp,
    exp: adventure.exp + 5,
    gold: adventure.gold + (damage === 0 ? 12 : 6),
    status,
    playerSkills: nextSkills,
    equippedRuleChangingSkillIds: nextSkills.filter((skill) => skill.type === 'ruleChange').map((skill) => skill.id)
  };
}

export function battleKindForStage(stageIndex: number): 'normal' | 'boss' {
  return stageIndex >= 2 ? 'boss' : 'normal';
}
