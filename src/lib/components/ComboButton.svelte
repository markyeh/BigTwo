<script lang="ts">
  import type { CounterCombo } from '$lib/game/counterTypes';

  export let combo: CounterCombo;
  export let disabled = false;
  export let mode: 'attack' | 'counter' = 'attack';
  export let projectedDamage = combo.baseDamage;
  export let chain = 1;
  export let onPick: (comboId: string) => void = () => {};
</script>

<button class="combo-button combo-{combo.type} {mode}" {disabled} on:click={() => onPick(combo.id)}>
  <span class="combo-name">{combo.label}</span>
  <b>Damage {projectedDamage}</b>
  <small>{mode === 'counter' ? `Momentum +1 / Chain x${chain}` : `Chain starts / ${combo.cards.length} card${combo.cards.length > 1 ? 's' : ''}`}</small>
</button>
