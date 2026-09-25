<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Phaser from 'phaser'
import { gameConfig } from '../game/gameConfig'
const root = ref<HTMLElement | null>(null)
let game: Phaser.Game | undefined
onMounted(() => { if (root.value) game = new Phaser.Game(gameConfig(root.value)) })
onBeforeUnmount(() => { game?.destroy(true); game = undefined })
</script>
<template><div ref="root" class="game-canvas" /></template>
