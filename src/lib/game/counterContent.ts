import type { CharacterDefinition, EnemyDefinition } from './counterTypes';
import type { Skill } from './types';

export const COUNTER_SKILLS: Skill[] = [
  {
    id: 'power-strike',
    name: '重擊架勢',
    description: '下一次造成傷害 +30%。',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 0
  },
  {
    id: 'guard-up',
    name: '舉盾',
    description: '獲得 14 點護盾。',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 0
  },
  {
    id: 'focus-breath',
    name: '集中呼吸',
    description: 'Momentum +1。',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 0
  },
  {
    id: 'quick-mulligan',
    name: '快手換牌',
    description: '棄掉 2 張最低牌並補牌。',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 0
  },
  {
    id: 'revenge-spark',
    name: '反擊火花',
    description: '若正在防守，下一次 Counter 傷害 +25%。',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 0
  },
  {
    id: 'second-wind',
    name: '第二口氣',
    description: '回復 10 HP，每場一次。',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 0,
    oncePerBattle: true
  },
  {
    id: 'ace-overdrive',
    name: 'A 超頻',
    description: '規則：A 在壓制比較時視為 2。',
    type: 'ruleChange',
    timing: 'battleStart',
    energyCost: 0
  },
  {
    id: 'pair-echo',
    name: '對子殘響',
    description: '規則：對子可當作三條出招或 Counter。',
    type: 'ruleChange',
    timing: 'battleStart',
    energyCost: 0
  }
];

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    role: '對子反擊流',
    passive: '對子 Counter 傷害 +25%。',
    maxHp: 120,
    skillIds: ['power-strike', 'guard-up', 'revenge-spark'],
    ruleSkillIds: ['pair-echo']
  },
  {
    id: 'gambler',
    name: 'Gambler',
    role: '高風險抽牌流',
    passive: 'Pass 後抽 1 張牌再棄 1 張最低牌。',
    maxHp: 105,
    skillIds: ['quick-mulligan', 'focus-breath', 'second-wind'],
    ruleSkillIds: ['ace-overdrive']
  }
];

export const ENEMIES: EnemyDefinition[] = [
  {
    id: 'aggressive',
    name: 'Aggressive Rival',
    intent: '能 Counter 就用最小牌壓回來。',
    maxHp: 115
  },
  {
    id: 'defensive',
    name: 'Defensive Rival',
    intent: '常 Pass，保留 A、2 與高花色。',
    maxHp: 130
  },
  {
    id: 'trickster',
    name: 'Trickster Rival',
    intent: '持有 A 超頻規則，A 會變得很危險。',
    maxHp: 110
  }
];

export function getCounterSkill(id: string): Skill {
  return { ...COUNTER_SKILLS.find((skill) => skill.id === id)! };
}

export function getCharacter(id: string): CharacterDefinition {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}

export function getEnemy(id: string): EnemyDefinition {
  return ENEMIES.find((enemy) => enemy.id === id) ?? ENEMIES[0];
}
