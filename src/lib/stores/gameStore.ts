import { derived, get, writable } from 'svelte/store';
import { chooseAiAction } from '$lib/game/ai';
import { applyBattleReward, battleKindForStage, createAdventure } from '$lib/game/adventure';
import {
  clearSelection as engineClearSelection,
  createBattle,
  passTurn as enginePassTurn,
  playCards,
  playSelectedCards as enginePlaySelectedCards,
  selectCard as engineSelectCard,
  setSelection as engineSetSelection,
  startBattle
} from '$lib/game/battleEngine';
import { useSkillOnBattle } from '$lib/game/skills';
import type { AdventureState, BattleState, Skill, Suit } from '$lib/game/types';

interface GameStoreState {
  adventure: AdventureState;
  battle: BattleState | null;
}

const initialAdventure = createAdventure();

function createGameStore() {
  const store = writable<GameStoreState>({
    adventure: initialAdventure,
    battle: null
  });

  let aiTimer: ReturnType<typeof setTimeout> | null = null;

  function updateBattle(mutator: (battle: BattleState) => BattleState): void {
    store.update((state) => {
      if (!state.battle) return state;
      return { ...state, battle: mutator(state.battle) };
    });
    queueAi();
  }

  function startNewAdventure(): void {
    const adventure = { ...createAdventure(), status: 'inBattle' as const };
    const battle = startBattle(createBattle(adventure, 'normal'));
    store.set({ adventure, battle });
    queueAi();
  }

  function startNextBattle(): void {
    const state = get(store);
    const adventure = { ...state.adventure, status: 'inBattle' as const };
    const battle = startBattle(createBattle(adventure, battleKindForStage(adventure.stageIndex)));
    store.set({ adventure, battle });
    queueAi();
  }

  function chooseReward(skillId?: string): void {
    const state = get(store);
    if (!state.battle?.reward) return;
    const chosen = skillId ? state.battle.reward.choices.find((skill) => skill.id === skillId) : undefined;
    const adventure = applyBattleReward(state.adventure, state.battle.reward.damage, chosen);
    store.set({ adventure: { ...adventure, status: adventure.status === 'inBattle' ? 'reward' : adventure.status }, battle: null });
  }

  function continueAdventure(): void {
    const state = get(store);
    if (state.adventure.status === 'reward') {
      startNextBattle();
    }
  }

  function useSkill(skillId: string, options?: { targetCardId?: string; targetSuit?: Suit }): void {
    updateBattle((battle) => useSkillOnBattle(battle, skillId, options));
  }

  function queueAi(): void {
    if (aiTimer) clearTimeout(aiTimer);
    const state = get(store);
    const battle = state.battle;
    if (!battle || battle.phase !== 'playing') return;
    const current = battle.players[battle.currentPlayerIndex];
    if (!current || current.role === 'human') return;

    aiTimer = setTimeout(() => {
      const latest = get(store).battle;
      if (!latest || latest.phase !== 'playing') return;
      const actor = latest.players[latest.currentPlayerIndex];
      if (actor.id !== current.id || actor.role === 'human') return;
      const action = chooseAiAction(latest, actor.id);
      const next = action.type === 'play' ? playCards(latest, actor.id, action.cardIds) : enginePassTurn(latest);
      store.update((snapshot) => ({ ...snapshot, battle: next }));
      queueAi();
    }, 420);
  }

  return {
    subscribe: store.subscribe,
    startNewAdventure,
    startNextBattle,
    selectCard: (cardId: string) => updateBattle((battle) => engineSelectCard(battle, cardId)),
    setSelection: (cardIds: string[]) => updateBattle((battle) => engineSetSelection(battle, cardIds)),
    clearSelection: () => updateBattle(engineClearSelection),
    playSelectedCards: () => updateBattle(enginePlaySelectedCards),
    passTurn: () => updateBattle(enginePassTurn),
    useSkill,
    chooseReward,
    continueAdventure,
    restartAdventure: startNewAdventure
  };
}

export const gameStore = createGameStore();

export const currentBattle = derived(gameStore, ($game) => $game.battle);
export const currentAdventure = derived(gameStore, ($game) => $game.adventure);

export type { GameStoreState, Skill };
