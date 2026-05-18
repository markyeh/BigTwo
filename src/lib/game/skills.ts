import type { BattleState, RuleModifier, Skill, Suit } from './types';
import { findPlayableCombos } from './handEvaluator';

export const ALL_SKILLS: Skill[] = [
  {
    id: 'combo-hint',
    name: '牌型提示',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 1,
    description: '高亮目前手牌中可以壓過桌面的最小牌型。'
  },
  {
    id: 'card-memory',
    name: '回憶牌局',
    type: 'assist',
    timing: 'beforePlay',
    energyCost: 1,
    description: '顯示本場已經出過的 A 與 2。'
  },
  {
    id: 'pass-charge',
    name: 'Pass 蓄能',
    type: 'passive',
    timing: 'onPass',
    energyCost: 0,
    description: '每場戰鬥第一次 Pass 時，回復 1 Energy。',
    oncePerBattle: true
  },
  {
    id: 'royal-two',
    name: '皇家二',
    type: 'ruleChange',
    timing: 'beforePlay',
    energyCost: 2,
    description: '本次出牌前，可以將一張 A 暫時視為 2。'
  },
  {
    id: 'wild-suit',
    name: '花色扭曲',
    type: 'ruleChange',
    timing: 'beforePlay',
    energyCost: 2,
    description: '本次出牌前，指定一張牌暫時變成任意花色。'
  },
  {
    id: 'forbidden-sequence',
    name: '禁忌順子',
    type: 'ruleChange',
    timing: 'beforePlay',
    energyCost: 3,
    description: '本次出牌允許 2 進入順子。'
  }
];

export function rookieSkills(): Skill[] {
  return cloneSkills(['combo-hint', 'pass-charge']);
}

export function cloneSkills(ids: string[]): Skill[] {
  return ids.map((id) => ({ ...ALL_SKILLS.find((skill) => skill.id === id)! }));
}

export function addOrReplaceSkill(currentSkills: Skill[], nextSkill: Skill): Skill[] {
  if (currentSkills.some((skill) => skill.id === nextSkill.id)) return currentSkills;
  const sameTypeLimit = nextSkill.type === 'ruleChange' ? 1 : 3;
  const partition = currentSkills.filter((skill) =>
    nextSkill.type === 'ruleChange' ? skill.type === 'ruleChange' : skill.type !== 'ruleChange'
  );
  const others = currentSkills.filter((skill) =>
    nextSkill.type === 'ruleChange' ? skill.type !== 'ruleChange' : skill.type === 'ruleChange'
  );

  const trimmed = partition.length >= sameTypeLimit ? partition.slice(1) : partition;
  return [...others, ...trimmed, { ...nextSkill, usedThisBattle: false }];
}

export function useSkillOnBattle(
  state: BattleState,
  skillId: string,
  options: { targetCardId?: string; targetSuit?: Suit } = {}
): BattleState {
  const player = state.players[0];
  const skill = player.skills.find((candidate) => candidate.id === skillId);
  if (!skill) return log(state, '尚未裝備這個技能。');
  if (player.energy < skill.energyCost) return log(state, 'Energy 不足。');
  if (skill.oncePerBattle && skill.usedThisBattle) return log(state, '這個技能本場已經使用過。');

  let next = spendEnergy(state, skillId, skill.energyCost);

  if (skillId === 'combo-hint') {
    const combos = findPlayableCombos(player.hand, state.lastCombo, state.activeRuleModifiers);
    const first = combos[0];
    return log(
      { ...next, highlightedCardIds: first?.cards.map((card) => card.id) ?? [] },
      first ? `牌型提示：建議出 ${first.cards.length} 張。` : '牌型提示：目前沒有可壓過桌面的牌。'
    );
  }

  if (skillId === 'card-memory') {
    const memory = state.playedCards
      .filter((card) => card.rank === 'A' || card.rank === '2')
      .map((card) => `${card.rank}${card.suit}`)
      .join('、');
    return log(next, memory ? `已出過的 A / 2：${memory}` : '目前還沒有 A 或 2 被打出。');
  }

  const modifier = createModifier(skillId, options);
  if (!modifier) return log(state, '請先選擇要套用技能的牌。');
  return log({ ...next, activeRuleModifiers: [...next.activeRuleModifiers, modifier] }, `${skill.name} 已套用到下一次出牌。`);
}

export function markSkillUsed(skills: Skill[], skillId: string): Skill[] {
  return skills.map((skill) => (skill.id === skillId ? { ...skill, usedThisBattle: true } : skill));
}

function createModifier(skillId: string, options: { targetCardId?: string; targetSuit?: Suit }): RuleModifier | null {
  if (skillId === 'royal-two' && options.targetCardId) {
    return {
      id: crypto.randomUUID(),
      sourceSkillId: skillId,
      expiresAt: 'afterPlay',
      effect: 'aceAsTwo',
      targetCardId: options.targetCardId
    };
  }

  if (skillId === 'wild-suit' && options.targetCardId && options.targetSuit) {
    return {
      id: crypto.randomUUID(),
      sourceSkillId: skillId,
      expiresAt: 'afterPlay',
      effect: 'wildSuit',
      targetCardId: options.targetCardId,
      targetSuit: options.targetSuit
    };
  }

  if (skillId === 'forbidden-sequence') {
    return {
      id: crypto.randomUUID(),
      sourceSkillId: skillId,
      expiresAt: 'afterPlay',
      effect: 'allowTwoInStraight'
    };
  }

  return null;
}

function spendEnergy(state: BattleState, skillId: string, cost: number): BattleState {
  return {
    ...state,
    players: state.players.map((player, index) =>
      index === 0
        ? {
            ...player,
            energy: Math.max(0, player.energy - cost),
            skills: markSkillUsed(player.skills, skillId)
          }
        : player
    )
  };
}

function log(state: BattleState, message: string): BattleState {
  return {
    ...state,
    battleLog: [{ id: crypto.randomUUID(), message }, ...state.battleLog].slice(0, 40)
  };
}
