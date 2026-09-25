<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useGameStore } from './stores/game'
import GameCanvas from './components/GameCanvas.vue'
const game = useGameStore()
const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') game.closeDialogue() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
<template>
  <main>
    <GameCanvas v-if="game.started" />
    <section v-if="!game.started" class="menu">
      <div class="panel">
        <div class="menu-emblem" aria-hidden="true">✦</div>
        <small class="eyebrow">UNA AVENTURA EN LAS TIERRAS ANTIGUAS</small>
        <h1>EL GREMIO<br><span>DE LOS DRAGONES</span></h1>
        <div class="divider" aria-hidden="true">◆</div>
        <p>El primer paso comienza en la Aldea de Arthen.</p>
        <button class="primary" @click="game.start()">Nueva partida <span aria-hidden="true">➜</span></button>
        <button class="secondary" disabled>Continuar</button>
        <span class="version">VERSIÓN DE PRUEBA · ALDEA DE ARTHEN</span>
      </div>
    </section>
    <header v-if="game.started" class="hud">
      <div class="hud-heading"><span class="hud-symbol" aria-hidden="true">✦</span><div><b>EL GREMIO DE LOS DRAGONES</b><span>ALDEA DE ARTHEN</span></div></div>
      <div class="hud-line"></div>
      <div class="quest-title"><span class="quest-symbol" aria-hidden="true">!</span><div><small>DIARIO DE MISIÓN</small><strong>{{ game.quest ? 'Sangre en el camino' : 'Habla con Aldric' }}</strong></div></div>
      <small class="controls">Muévete: WASD / flechas · Hablar: E<br>En móvil: toca el suelo o a Aldric</small>
    </header>
    <div v-if="game.dialogue" class="dialogue-backdrop" @click.self="game.closeDialogue()">
      <section class="dialogue" role="dialog" aria-modal="true" aria-label="Conversación con Aldric">
        <div class="dialogue-header"><span class="npc-seal" aria-hidden="true">✦</span><div><small>HABITANTE DE ARTHEN</small><h2>Aldric</h2></div><button class="close" aria-label="Cerrar diálogo" @click="game.closeDialogue()">×</button></div>
        <div class="dialogue-content"><img src="/assets/game/characters/aldric.png" alt="Aldric" /><p>Ha ocurrido algo en el camino. Necesitamos que vayas a investigar. ¿Podemos contar contigo, Ethan?</p></div>
        <div class="dialogue-actions"><button v-if="!game.quest" class="primary" @click="game.acceptQuest()"><span aria-hidden="true">!</span> Aceptar «Sangre en el camino»</button><button v-else class="primary" @click="game.closeDialogue()">Continuar</button></div>
      </section>
    </div>
  </main>
</template>
