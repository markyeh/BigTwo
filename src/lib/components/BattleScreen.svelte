<script lang="ts">
  import { CHARACTERS, ENEMIES } from '$lib/game/counterContent';
  import { chainMultiplier, momentumMultiplier } from '$lib/game/momentum';
  import { battleStore, playerActions, playerCombos } from '$lib/stores/battleStore';
  import { cardListLabel } from '$lib/game/format';
  import ComboButton from './ComboButton.svelte';
  import MomentumBar from './MomentumBar.svelte';
  import type { BattleSide, CounterActor, CounterBattleState } from '$lib/game/counterTypes';

  export let battle: CounterBattleState;

  $: defending = battle.defendingSide === 'player';
  $: actionTitle = defending ? '可 Counter 牌型' : '可出招牌型';
  $: allowedIds = new Set($playerActions.map((combo) => combo.id));
  $: shownCombos = defending ? $playerActions : $playerCombos;
  $: incomingDamage = battle.currentAttack ? projectedDamage(battle.currentAttack.baseDamage, 0) : 0;
  $: intent = getIntent(battle.currentAttack, battle.activeSide, incomingDamage);

  function actorClass(side: BattleSide): string {
    return [
      'counter-actor',
      side,
      battle.defendingSide === side ? 'defending' : '',
      battle.activeSide === side ? 'active' : ''
    ].join(' ');
  }

  function hpPercent(actor: CounterActor): number {
    return Math.max(0, Math.round((actor.hp / actor.maxHp) * 100));
  }

  function projectedDamage(baseDamage: number, extraBonus: number): number {
    return Math.ceil(baseDamage * chainMultiplier(Math.max(1, battle.chain)) * momentumMultiplier(battle.momentum) * (1 + extraBonus + battle.nextDamageBonus));
  }

  function getIntent(
    currentAttack: CounterBattleState['currentAttack'],
    activeSide: CounterBattleState['activeSide'],
    damage: number
  ): { label: string; damage: number; combo: string } {
    if (!currentAttack) {
      return {
        label: activeSide === 'enemy' ? 'Charging' : 'Waiting',
        damage: 0,
        combo: 'None'
      };
    }
    const typeLabel =
      currentAttack.type === 'single'
        ? 'Single Attack'
        : currentAttack.type === 'pair'
          ? 'Pair Attack'
          : 'Triple Strike';
    return {
      label: activeSide === 'enemy' ? typeLabel : 'Counter Stance',
      damage,
      combo: currentAttack.label
    };
  }
</script>

<main class:shake={battle.feedback === 'counter'} class="counter-shell">
  <header class="counter-header">
    <div>
      <h1>Counter Battle</h1>
      <p>大老二牌型對招 Roguelike MVP</p>
    </div>
    <nav class="select-row">
      <select bind:value={battle.character} on:change={(event) => battleStore.start(event.currentTarget.value as never, battle.enemyId)}>
        {#each CHARACTERS as character}
          <option value={character.id}>{character.name}</option>
        {/each}
      </select>
      <select bind:value={battle.enemyId} on:change={(event) => battleStore.start(battle.character, event.currentTarget.value as never)}>
        {#each ENEMIES as enemy}
          <option value={enemy.id}>{enemy.name}</option>
        {/each}
      </select>
      <button on:click={battleStore.restart}>重開</button>
    </nav>
  </header>

  <section class="enemy-panel">
    <article class={actorClass('enemy')}>
      <div class="enemy-avatar">!</div>
      <div class="actor-block">
        <div class="actor-head">
          <strong>{battle.enemy.name}</strong>
          <span>{battle.enemy.shield ? `Shield ${battle.enemy.shield}` : intent.label}</span>
        </div>
        <div class="hp-row">
          <span>HP</span>
          <div class="hp-track"><i style={`width:${hpPercent(battle.enemy)}%`}></i></div>
          <b>{battle.enemy.hp}/{battle.enemy.maxHp}</b>
        </div>
        <div class="meter-row">
          <span>Momentum</span>
          <MomentumBar momentum={battle.momentum} />
          <b>{battle.momentum}/5</b>
        </div>
        <div class="intent-card">
          <span>Intent: {intent.label}</span>
          <strong>Incoming Damage: {intent.damage}</strong>
          <small>Current Combo: {intent.combo}</small>
        </div>
      </div>
      {#each battle.floatingTexts.filter((item) => item.side === 'enemy') as item (item.id)}
        <em class="float {item.tone}">{item.text}</em>
      {/each}
    </article>
  </section>

  <section class:counter-mode={defending} class="center-stage">
    <div class="battle-status">
      <span>Momentum x{battle.momentum}</span>
      <strong>CHAIN x{Math.max(1, battle.chain)}</strong>
      <span>Damage Bonus +{Math.round((chainMultiplier(Math.max(1, battle.chain)) * momentumMultiplier(battle.momentum) - 1) * 100)}%</span>
    </div>
    <div class="attack-card">
      {#if defending}
        <span class="counter-kicker">COUNTER WINDOW</span>
        <strong>COUNTER?</strong>
        {#if battle.currentAttack}
          <b>Enemy Used: {battle.currentAttack.label}</b>
          <em>Incoming Damage: {incomingDamage}</em>
        {/if}
      {:else if battle.currentAttack}
        <span>{battle.activeSide === 'player' ? '你的攻勢' : '敵人的攻勢'}</span>
        <strong>{battle.currentAttack.label}</strong>
        <b>{projectedDamage(battle.currentAttack.baseDamage, 0)} Damage</b>
      {:else}
        <span>主動回合</span>
        <strong>選一個 Combo 出招</strong>
        <b>Build pressure. Force a bad Pass.</b>
      {/if}
    </div>
    {#each battle.floatingTexts as item (item.id)}
      <em class="center-float {item.tone} side-{item.side}">{item.text}</em>
    {/each}
    {#if battle.phase === 'victory' || battle.phase === 'defeat'}
      <div class="end-banner">
        <strong>{battle.phase === 'victory' ? 'Victory' : 'Defeat'}</strong>
        <button on:click={battleStore.restart}>再戰一場</button>
      </div>
    {/if}
  </section>

  <section class="combo-panel">
    <div class="zone-title">
      <strong>{actionTitle}</strong>
      <span>{defending ? '選一個 Counter，或 Pass 承受傷害' : 'Combo 是主操作，手牌只是原料'}</span>
    </div>
    <div class:counter-list={defending} class="combo-grid">
      {#each shownCombos as combo (combo.id)}
        <ComboButton
          combo={combo}
          disabled={!allowedIds.has(combo.id) || battle.phase !== 'playing'}
          mode={defending ? 'counter' : 'attack'}
          chain={Math.max(1, battle.chain + (defending ? 1 : 0))}
          projectedDamage={projectedDamage(combo.baseDamage, defending ? 0.25 : 0)}
          onPick={battleStore.chooseCombo}
        />
      {/each}
    </div>
    {#if defending}
      <button class="pass-button" on:click={battleStore.pass} disabled={battle.phase !== 'playing'}>PASS -> Take {incomingDamage} damage</button>
    {/if}
  </section>

  <section class="lower-grid">
    <article class="player-panel-mini">
      <div class="zone-title">
        <strong>{battle.player.name}</strong>
        <span>{battle.player.shield ? `Shield ${battle.player.shield}` : 'Ready'}</span>
      </div>
      <div class="hp-row">
        <span>HP</span>
        <div class="hp-track"><i style={`width:${hpPercent(battle.player)}%`}></i></div>
        <b>{battle.player.hp}/{battle.player.maxHp}</b>
      </div>
      <div class="counter-hand compact">
        {#each battle.player.hand as card (card.id)}
          <span class:red={card.suit === 'diamond' || card.suit === 'heart'}>{cardListLabel([card])}</span>
        {/each}
      </div>
    </article>

    <article class="skill-panel">
      <div class="zone-title">
        <strong>Build / 技能</strong>
        <span>Rule Slot {battle.player.ruleSkillIds.length}/2</span>
      </div>
      <div class="skill-grid">
        {#each battle.player.skills as skill (skill.id)}
          <button
            class:rule={skill.type === 'ruleChange'}
            disabled={skill.type === 'ruleChange' || (skill.oncePerBattle && skill.usedThisBattle) || battle.phase !== 'playing'}
            title={skill.description}
            on:click={() => battleStore.useSkill(skill.id)}
          >
            <strong>{skill.name}</strong>
            <span>{skill.description}</span>
          </button>
        {/each}
      </div>
    </article>
  </section>

  <section class="event-log">
    {#each battle.events as event (event.id)}
      <p class={event.tone}>{event.text}</p>
    {/each}
  </section>
</main>
