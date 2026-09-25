<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useGameStore } from './stores/game'
import GameCanvas from './components/GameCanvas.vue'
const game = useGameStore()
const intro = [
  { image: '/assets/game/intro/home.webp', heading: 'Un hogar en las Tierras Antiguas', text: 'Ethan creció en una casa junto a sus padres, entre los cuidados de cada día y las historias contadas al caer la tarde.' },
  { image: '/assets/game/intro/lessons.webp', heading: 'Aprender a mirar', text: 'Su padre lo llevaba al bosque para enseñarle a cazar: reconocer huellas, escuchar el viento y moverse sin hacer ruido.' },
  { image: '/assets/game/intro/horizon.webp', heading: 'El camino por delante', text: 'Ethan aún tenía mucho que aprender. Con el arco al hombro, se preparaba para recorrer los senderos de aquel inmenso mundo.' },
]
const introActive = ref(false)
const introIndex = ref(0)
let introTimer: ReturnType<typeof setTimeout> | undefined
function clearIntroTimer() { if (introTimer) clearTimeout(introTimer); introTimer = undefined }
function scheduleIntro() { clearIntroTimer(); introTimer = setTimeout(nextIntro, 7000) }
function beginIntro() { introIndex.value = 0; introActive.value = true; scheduleIntro() }
function finishIntro() { clearIntroTimer(); introActive.value = false; game.start() }
function nextIntro() { if (introIndex.value < intro.length - 1) { introIndex.value++; scheduleIntro() } else finishIntro() }
const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') game.closeDialogue() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); clearIntroTimer() })
</script>
<template>
  <main>
    <GameCanvas v-if="game.started" />
    <section v-if="!game.started && !introActive" class="menu">
      <div class="panel">
        <div class="menu-emblem" aria-hidden="true">✦</div>
        <small class="eyebrow">UNA AVENTURA EN LAS TIERRAS ANTIGUAS</small>
        <h1>EL GREMIO<br><span>DE LOS DRAGONES</span></h1>
        <div class="divider" aria-hidden="true">◆</div>
        <p>El primer paso comienza en la Aldea de Arthen.</p>
        <button class="primary" @click="beginIntro()">Nueva partida <span aria-hidden="true">➜</span></button>
        <button class="secondary" disabled>Continuar</button>
        <span class="version">VERSIÓN DE PRUEBA · ALDEA DE ARTHEN</span>
      </div>
    </section>
    <section v-if="introActive" class="intro" aria-label="Introducción a la historia de Ethan">
      <Transition name="intro-fade" mode="out-in"><img :key="introIndex" class="intro-image" :src="intro[introIndex]!.image" alt="" /></Transition>
      <div class="intro-shade"></div>
      <button class="skip-intro" @click="finishIntro()">Saltar introducción <span aria-hidden="true">✕</span></button>
      <div class="intro-caption" aria-live="polite">
        <span class="intro-kicker">EL ORIGEN DE ETHAN · {{ introIndex + 1 }} / {{ intro.length }}</span>
        <h2>{{ intro[introIndex]!.heading }}</h2>
        <p>{{ intro[introIndex]!.text }}</p>
        <div class="intro-controls"><div class="intro-dots" aria-hidden="true"><span v-for="(_, index) in intro" :key="index" :class="{ active: index === introIndex }"></span></div><button class="primary" @click="nextIntro()">{{ introIndex === intro.length - 1 ? 'Comenzar aventura' : 'Siguiente' }} <span aria-hidden="true">➜</span></button></div>
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
