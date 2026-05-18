<script lang="ts">
  export let momentum = 0;
</script>

<div class="momentum-bar" aria-label="Momentum">
  {#each Array(5) as _, index}
    <span class:filled={index < momentum}></span>
  {/each}
</div>
