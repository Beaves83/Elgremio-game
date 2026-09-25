type Score = 'intro' | 'village'
type Instrument = 'lute' | 'flute' | 'drone'

const scores: Record<Score, { chords: number[][]; melody: number[][]; bpm: number }> = {
  intro: {
    bpm: 68,
    chords: [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]],
    melody: [[69, 72, 76, 72], [69, 72, 77, 72], [67, 72, 76, 72], [67, 71, 74, 71]],
  },
  village: {
    bpm: 78,
    chords: [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]],
    melody: [[69, 74, 77, 74], [70, 74, 77, 74], [69, 72, 77, 72], [67, 72, 76, 72]],
  },
}

class GameMusic {
  private context?: AudioContext
  private master?: GainNode
  private score: Score = 'intro'
  private timer?: ReturnType<typeof setInterval>
  private nextTime = 0
  private step = 0
  muted = false

  private prepare() {
    if (this.context) return
    const context = new AudioContext()
    const master = context.createGain()
    master.gain.value = this.muted ? 0 : .16
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.ratio.value = 3
    master.connect(compressor)
    compressor.connect(context.destination)
    this.context = context
    this.master = master
  }

  private note(midi: number, at: number, duration: number, instrument: Instrument) {
    const context = this.context, master = this.master
    if (!context || !master) return
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    const filter = context.createBiquadFilter()
    oscillator.type = instrument === 'flute' ? 'sine' : 'triangle'
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12)
    filter.type = 'lowpass'
    filter.frequency.value = instrument === 'lute' ? 1450 : 850
    const peak = instrument === 'drone' ? .105 : instrument === 'flute' ? .16 : .21
    const attack = instrument === 'flute' ? .11 : .018
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(peak, at + attack)
    if (instrument === 'lute') envelope.gain.exponentialRampToValueAtTime(.003, at + duration)
    else {
      envelope.gain.setValueAtTime(peak * .68, at + Math.min(duration * .55, .7))
      envelope.gain.linearRampToValueAtTime(0, at + duration)
    }
    oscillator.connect(filter).connect(envelope).connect(master)
    oscillator.start(at)
    oscillator.stop(at + duration + .02)
    oscillator.onended = () => { oscillator.disconnect(); filter.disconnect(); envelope.disconnect() }
  }

  private schedule() {
    const context = this.context
    if (!context || context.state !== 'running') return
    const score = scores[this.score]
    const beat = 60 / score.bpm
    const halfBeat = beat / 2
    while (this.nextTime < context.currentTime + .22) {
      const bar = Math.floor(this.step / 8) % 4
      const position = this.step % 8
      const chord = score.chords[bar]!
      if (position === 0) this.note(chord[0]! - 12, this.nextTime, beat * 3.5, 'drone')
      this.note(chord[[0, 2, 1, 3, 0, 2, 1, 3][position]!]!, this.nextTime, beat * .82, 'lute')
      if (position % 2 === 0) {
        const melodic = score.melody[bar]![position / 2]!
        if (position !== 2 || bar % 2 === 0) this.note(melodic, this.nextTime, beat * 1.7, 'flute')
      }
      this.nextTime += halfBeat
      this.step++
    }
  }

  play(score: Score) {
    this.prepare()
    this.context!.resume().catch(() => {})
    if (this.score !== score || !this.timer) {
      this.score = score
      this.step = 0
      this.nextTime = this.context!.currentTime + .08
    }
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 70)
    this.schedule()
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : .16, this.context.currentTime, .12)
      if (!this.muted) this.context.resume().catch(() => {})
    }
    return this.muted
  }
}

export const gameMusic = new GameMusic()
