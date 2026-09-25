import { defineStore } from 'pinia'
export const useGameStore = defineStore('game', {
  state: () => ({ started: false, dialogue: false, quest: false }),
  actions: {
    start() { this.started = true },
    speak() { this.dialogue = true },
    acceptQuest() { this.quest = true; this.dialogue = false },
    closeDialogue() { this.dialogue = false },
  },
})
