class AlarmSoundEngine {
  constructor() {
    this.audioCtx = null
    this.osc1 = null
    this.osc2 = null
    this.gainNode = null
    this.isPlaying = false
    this.pulseInterval = null
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass()
      }
    }
  }

  startAlarm() {
    if (this.isPlaying) return
    const isEnabled = localStorage.getItem("factory_alarm_enabled") === "true"
    if (!isEnabled) return

    try {
      this.init()
      if (!this.audioCtx) return

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume()
      }

      this.isPlaying = true

      // Industrial pulsing dual-tone (800 Hz & 960 Hz alternating)
      let highTone = true
      this.pulseInterval = setInterval(() => {
        if (!this.isPlaying || !this.audioCtx) return

        const osc = this.audioCtx.createOscillator()
        const gain = this.audioCtx.createGain()

        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(highTone ? 960 : 800, this.audioCtx.currentTime)
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22)

        osc.connect(gain)
        gain.connect(this.audioCtx.destination)

        osc.start()
        osc.stop(this.audioCtx.currentTime + 0.25)
        highTone = !highTone
      }, 350)
    } catch {
      // Audio playback prevented by browser policy
    }
  }

  stopAlarm() {
    this.isPlaying = false
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval)
      this.pulseInterval = null
    }
  }
}

export const alarmEngine = new AlarmSoundEngine()
