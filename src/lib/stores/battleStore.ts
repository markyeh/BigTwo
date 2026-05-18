import { derived, get, writable } from 'svelte/store';
import {
  createCounterBattle,
  getPlayerActions,
  getPlayerCombos,
  playerChooseCombo,
  playerPass,
  useCounterSkill
} from '$lib/game/counterBattleEngine';
import type { CharacterId, CounterBattleState, EnemyId } from '$lib/game/counterTypes';

function createBattleStore() {
  const store = writable<CounterBattleState>(createCounterBattle('fighter', 'aggressive'));

  return {
    subscribe: store.subscribe,
    start: (character: CharacterId, enemy: EnemyId) => store.set(createCounterBattle(character, enemy)),
    chooseCombo: (comboId: string) => store.update((state) => playerChooseCombo(state, comboId)),
    pass: () => store.update(playerPass),
    useSkill: (skillId: string) => store.update((state) => useCounterSkill(state, skillId)),
    restart: () => {
      const state = get(store);
      store.set(createCounterBattle(state.character, state.enemyId));
    }
  };
}

export const battleStore = createBattleStore();
export const playerCombos = derived(battleStore, ($battle) => getPlayerCombos($battle));
export const playerActions = derived(battleStore, ($battle) => getPlayerActions($battle));
