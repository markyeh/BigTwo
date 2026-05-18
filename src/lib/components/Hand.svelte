<script lang="ts">
  import CardView from './Card.svelte';
  import type { Card } from '$lib/game/types';

  export let cards: Card[] = [];
  export let selectedCardIds: string[] = [];
  export let highlightedCardIds: string[] = [];
  export let disabled = false;
  export let onToggle: (cardId: string) => void = () => {};
</script>

<div class="hand" aria-label="玩家手牌">
  {#each cards as card (card.id)}
    <CardView
      {card}
      selected={selectedCardIds.includes(card.id)}
      highlighted={highlightedCardIds.includes(card.id)}
      {disabled}
      {onToggle}
    />
  {/each}
</div>
