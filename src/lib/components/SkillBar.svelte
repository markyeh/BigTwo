<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PlayerState, Suit } from '$lib/game/types';

  export let player: PlayerState;
  export let selectedCardIds: string[] = [];

  const suits: Suit[] = ['club', 'diamond', 'heart', 'spade'];
  const dispatch = createEventDispatcher<{ skill: { skillId: string; targetCardId?: string; targetSuit: Suit } }>();
  let targetSuit: Suit = 'spade';
</script>

<section class="skill-bar">
  <div class="energy">Energy {player.energy}/{player.maxEnergy}</div>
  <div class="skill-actions">
    {#each player.skills as skill (skill.id)}
      <button
        class="skill-button"
        disabled={player.energy < skill.energyCost || (skill.oncePerBattle && skill.usedThisBattle)}
        title={skill.description}
        on:click={() => dispatch('skill', { skillId: skill.id, targetCardId: selectedCardIds[0], targetSuit })}
      >
        {skill.name}
        <small>{skill.energyCost}E</small>
      </button>
    {/each}
  </div>
  <label class="suit-pick">
    花色
    <select bind:value={targetSuit}>
      {#each suits as suit}
        <option value={suit}>{suit}</option>
      {/each}
    </select>
  </label>
</section>
