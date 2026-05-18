import type { Card, Skill } from './types';

export type CounterComboType = 'single' | 'pair' | 'triple';
export type BattleSide = 'player' | 'enemy';
export type CounterPhase = 'characterSelect' | 'playing' | 'victory' | 'defeat';
export type CharacterId = 'fighter' | 'gambler';
export type EnemyId = 'aggressive' | 'defensive' | 'trickster';

export interface CounterCombo {
  id: string;
  type: CounterComboType;
  cards: Card[];
  rankValue: number;
  suitValue: number;
  baseDamage: number;
  label: string;
}

export interface DeckZone {
  drawPile: Card[];
  discardPile: Card[];
}

export interface CounterActor {
  id: BattleSide;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  hand: Card[];
  deck: DeckZone;
  skills: Skill[];
  ruleSkillIds: string[];
}

export interface CounterEvent {
  id: string;
  text: string;
  tone: 'info' | 'hit' | 'counter' | 'skill';
}

export interface FloatingText {
  id: string;
  text: string;
  side: BattleSide;
  tone: 'damage' | 'counter' | 'block' | 'skill';
}

export interface CounterBattleState {
  phase: CounterPhase;
  character: CharacterId;
  enemyId: EnemyId;
  player: CounterActor;
  enemy: CounterActor;
  activeSide: BattleSide;
  defendingSide: BattleSide;
  currentAttack: CounterCombo | null;
  momentum: number;
  chain: number;
  turn: number;
  feedback: 'idle' | 'counter' | 'hit' | 'skill';
  events: CounterEvent[];
  floatingTexts: FloatingText[];
  selectedComboId: string | null;
  nextDamageBonus: number;
  playerRuleFlags: {
    aceAsTwo: boolean;
    pairAsTriple: boolean;
  };
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  role: string;
  passive: string;
  maxHp: number;
  skillIds: string[];
  ruleSkillIds: string[];
}

export interface EnemyDefinition {
  id: EnemyId;
  name: string;
  intent: string;
  maxHp: number;
}
