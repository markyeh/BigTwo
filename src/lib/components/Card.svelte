<script lang="ts">
  import { getCardLabel } from '$lib/game/cards';
  import type { Card } from '$lib/game/types';

  export let card: Card;
  export let selected = false;
  export let highlighted = false;
  export let disabled = false;
  export let onToggle: (cardId: string) => void = () => {};

  $: red = card.suit === 'diamond' || card.suit === 'heart';
  $: label = getCardLabel(card);
</script>

<button
  class:selected
  class:highlighted
  class:red
  class:disabled
  class="card"
  disabled={disabled}
  aria-pressed={selected}
  on:click={() => onToggle(card.id)}
  title={selected ? `已選擇 ${label}` : label}
>
  <span>{card.rank}</span>
  <strong>{label.replace(card.rank, '')}</strong>
  {#if selected}
    <em>已選</em>
  {/if}
</button>
