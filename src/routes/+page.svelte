<script lang="ts">
  import BattleScreen from '$lib/components/BattleScreen.svelte';
  import { battleStore } from '$lib/stores/battleStore';
</script>

<BattleScreen battle={$battleStore} />
