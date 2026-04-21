/**
 * AudioManager — tiny Web Audio API wrapper.
 * Generates all sounds procedurally (no audio files needed).
 */

let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  // Resume on first user interaction
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** Simple oscillator-based tone */
function playTone({ freq = 440, type = 'sine', vol = 0.18, duration = 0.12, delay = 0 }) {
  try {
    const ac = getCtx()
    const osc  = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)

    osc.type      = type
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay)

    gain.gain.setValueAtTime(0, ac.currentTime + delay)
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration)

    osc.start(ac.currentTime + delay)
    osc.stop(ac.currentTime + delay + duration + 0.05)
  } catch (e) {
    // Silently fail — audio is non-critical
  }
}

/** Countdown tick: short mid beep */
export function playCountdownBeep(isLast = false) {
  playTone({ freq: isLast ? 880 : 440, type: 'square', vol: 0.12, duration: 0.1 })
}

/** SHOOT! triple blip */
export function playShoot() {
  playTone({ freq: 660, type: 'square', vol: 0.1, duration: 0.07, delay: 0 })
  playTone({ freq: 770, type: 'square', vol: 0.1, duration: 0.07, delay: 0.08 })
  playTone({ freq: 990, type: 'square', vol: 0.15, duration: 0.1, delay: 0.16 })
}

/** Win fanfare */
export function playWin() {
  const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
  notes.forEach((f, i) => {
    playTone({ freq: f, type: 'sine', vol: 0.15, duration: 0.18, delay: i * 0.12 })
  })
}

/** Lose "wah-wah" */
export function playLose() {
  playTone({ freq: 300, type: 'sawtooth', vol: 0.12, duration: 0.22, delay: 0 })
  playTone({ freq: 240, type: 'sawtooth', vol: 0.10, duration: 0.22, delay: 0.2 })
  playTone({ freq: 190, type: 'sawtooth', vol: 0.10, duration: 0.3,  delay: 0.38 })
}

/** Draw neutral chord */
export function playDraw() {
  playTone({ freq: 440, type: 'sine', vol: 0.1, duration: 0.25, delay: 0 })
  playTone({ freq: 554, type: 'sine', vol: 0.1, duration: 0.25, delay: 0 })
}
