<script lang="ts">
  import type { PlayerState } from '$lib/game/types';

  export let player: PlayerState;
  export let active = false;
</script>

<section class:active class="player-panel">
  <div>
    <strong>{player.name}</strong>
    {#if player.finishedRank}
      <span>第 {player.finishedRank} 名</span>
    {:else}
      <span>{player.hand.length} 張</span>
    {/if}
  </div>
  <small>HP {player.hp}/{player.maxHp}</small>
</section>
