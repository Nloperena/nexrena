let audioCtx: AudioContext | null = null

export function unlockNotificationSound() {
  if (typeof window === 'undefined') return
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
}

/** Short two-tone chime for new form leads. Requires unlock via user gesture first. */
export function playNewFormSound() {
  if (typeof window === 'undefined') return

  try {
    unlockNotificationSound()
    if (!audioCtx) return

    const now = audioCtx.currentTime

    const playTone = (frequency: number, start: number, duration: number, volume = 0.12) => {
      const osc = audioCtx!.createOscillator()
      const gain = audioCtx!.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      osc.connect(gain)
      gain.connect(audioCtx!.destination)
      osc.start(start)
      osc.stop(start + duration + 0.02)
    }

    playTone(880, now, 0.12)
    playTone(1174, now + 0.14, 0.18)
  } catch {
    // Autoplay blocked or AudioContext unavailable — ignore
  }
}
