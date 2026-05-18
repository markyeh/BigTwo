<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { BattleReward } from '$lib/game/types';

  export let reward: BattleReward;
  const dispatch = createEventDispatcher<{ reward: string | undefined }>();
</script>

<section class="reward-screen">
  <h2>{reward.result}</h2>
  <p>本場第 {reward.rank} 名，受到 {reward.damage} 點傷害。</p>

  {#if reward.choices.length}
    <div class="reward-grid">
      {#each reward.choices as skill (skill.id)}
        <button class="reward-card" on:click={() => dispatch('reward', skill.id)}>
          <strong>{skill.name}</strong>
          <span>{skill.description}</span>
        </button>
      {/each}
    </div>
  {:else}
    <p>這次沒有技能獎勵。</p>
    <button class="primary" on:click={() => dispatch('reward', undefined)}>繼續</button>
  {/if}
</section>
