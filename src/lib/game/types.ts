export type Suit = 'club' | 'diamond' | 'heart' | 'spade';
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type ComboType =
  | 'single'
  | 'pair'
  | 'triple'
  | 'straight'
  | 'flush'
  | 'fullHouse'
  | 'fourOfAKind'
  | 'straightFlush';

export interface Combo {
  type: ComboType;
  cards: Card[];
  rankValue: number;
  suitValue: number;
  comboValue: number;
}

export type PlayerRole = 'human' | 'ai' | 'boss';
export type AiPersonality = 'basic' | 'conservative' | 'aggressive' | 'boss';

export interface PlayerState {
  id: string;
  name: string;
  role: PlayerRole;
  aiPersonality?: AiPersonality;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  hand: Card[];
  finishedRank?: number;
  skills: Skill[];
  equippedRuleChangingSkillIds: string[];
}

export type SkillType = 'assist' | 'ruleChange' | 'passive';
export type SkillTiming = 'battleStart' | 'beforePlay' | 'afterPlay' | 'onPass' | 'roundClear';

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  timing: SkillTiming;
  energyCost: number;
  oncePerBattle?: boolean;
  usedThisBattle?: boolean;
}

export interface BattleLogEntry {
  id: string;
  message: string;
}

export interface BattleState {
  battleId: string;
  kind: 'normal' | 'boss';
  players: PlayerState[];
  currentPlayerIndex: number;
  lastCombo: Combo | null;
  lastComboPlayerId: string | null;
  passPlayerIds: string[];
  finishedPlayerIds: string[];
  roundNumber: number;
  phase: 'dealing' | 'playing' | 'reward' | 'finished';
  selectedCardIds: string[];
  highlightedCardIds: string[];
  battleLog: BattleLogEntry[];
  mustIncludeCardId?: string;
  activeRuleModifiers: RuleModifier[];
  playedCards: Card[];
  reward?: BattleReward;
}

export interface RuleModifier {
  id: string;
  sourceSkillId: string;
  expiresAt: 'afterPlay' | 'battleEnd';
  effect: 'allowTwoInStraight' | 'aceAsTwo' | 'wildSuit';
  targetCardId?: string;
  targetSuit?: Suit;
}

export interface AdventureState {
  stageIndex: number;
  maxStages: number;
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  exp: number;
  level: number;
  status: 'notStarted' | 'inBattle' | 'reward' | 'finished' | 'gameOver';
  playerSkills: Skill[];
  equippedRuleChangingSkillIds: string[];
}

export interface BattleReward {
  rank: number;
  result: string;
  damage: number;
  choices: Skill[];
  stageCleared: boolean;
}

export interface BattleResult {
  rank: number;
  damage: number;
  result: string;
  choices: Skill[];
}
