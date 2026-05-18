<script lang="ts">
  import { getCardLabel } from '$lib/game/cards';
  import type { BattleState } from '$lib/game/types';

  export let battle: BattleState;

  $: current = battle.players[battle.currentPlayerIndex];
  $: lastPlayer = battle.players.find((player) => player.id === battle.lastComboPlayerId);
</script>

<section class="table-area">
  <div class="table-header">
    <span>第 {battle.roundNumber} 輪</span>
    <strong>輪到 {current?.name}</strong>
  </div>

  {#if battle.lastCombo}
    <div class="last-play">
      <span>{lastPlayer?.name} 的上一手</span>
      <div class="mini-cards">
        {#each battle.lastCombo.cards as card (card.id)}
          <b class:red={card.suit === 'diamond' || card.suit === 'heart'}>{getCardLabel(card)}</b>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-table">桌面已清空，可以自由出牌</div>
  {/if}
</section>
