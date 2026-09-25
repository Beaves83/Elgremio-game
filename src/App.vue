<script setup lang="ts">
import { useGameStore } from './stores/game'
import GameCanvas from './components/GameCanvas.vue'
const game = useGameStore()
function key(event: KeyboardEvent) { if (event.key === 'Escape') game.closeDialogue() }
</script>
<template><main @keydown="key"><GameCanvas v-if="game.started" /><section v-if="!game.started" class="menu"><div class="panel"><span class="mark">◆</span><small>UNA AVENTURA EN LAS TIERRAS ANTIGUAS</small><h1>EL GREMIO<br>DE LOS DRAGONES</h1><p>La Aldea de Arthen te espera.</p><button @click="game.start()">Nueva partida</button><button disabled>Continuar</button><span class="version">V0.1.2a · Reconstrucción visual</span></div></section><header v-if="game.started" class="hud"><b>EL GREMIO DE LOS DRAGONES</b><span>ETHAN · ALDEA DE ARTHEN</span><small>WASD / flechas · E: hablar con Aldric</small><p v-if="game.quest">MISIÓN: Sangre en el camino</p></header><section v-if="game.dialogue" class="dialogue"><b>Aldric</b><p>Ha ocurrido algo en el camino. Necesitamos que vayas a investigar.</p><button v-if="!game.quest" @click="game.acceptQuest()">Aceptar: Sangre en el camino</button><button v-else @click="game.closeDialogue()">Cerrar</button></section></main></template>
