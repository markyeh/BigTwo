<script lang="ts">
  import PlayerPanel from './PlayerPanel.svelte';
  import type { PlayerState } from '$lib/game/types';

  export let enemies: PlayerState[] = [];
  export let currentPlayerId = '';
</script>

<div class="enemy-row">
  {#each enemies as enemy (enemy.id)}
    <PlayerPanel player={enemy} active={enemy.id === currentPlayerId} />
  {/each}
</div>
