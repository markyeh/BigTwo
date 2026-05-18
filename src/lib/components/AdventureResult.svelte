<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AdventureState } from '$lib/game/types';

  export let adventure: AdventureState;
  const dispatch = createEventDispatcher<{ restart: void }>();
</script>

<section class="result-screen">
  <h1>{adventure.status === 'finished' ? 'Victory' : 'Game Over'}</h1>
  <p>等級 {adventure.level}，EXP {adventure.exp}，Gold {adventure.gold}</p>
  <button class="primary" on:click={() => dispatch('restart')}>重新開始冒險</button>
</section>
