import { defineStore } from 'pinia'
export const useGameStore = defineStore('game', {
  state: () => ({ started: false, dialogue: false, quest: false, attackPulse: 0 }),
  actions: {
    start() { this.started = true },
    speak() { this.dialogue = true },
    acceptQuest() { this.quest = true; this.dialogue = false },
    closeDialogue() { this.dialogue = false },
    attack() { if (this.started && !this.dialogue) this.attackPulse++ },
  },
})
