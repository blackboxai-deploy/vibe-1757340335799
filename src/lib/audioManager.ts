// Audio Manager for retro 8-bit style sound effects and music

export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterVolume: number = 0.3
  private soundEnabled: boolean = true
  private backgroundMusic: OscillatorNode | null = null
  private backgroundGain: GainNode | null = null
  private musicPlaying: boolean = false
  
  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudio()
  }
  
  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Handle browser audio policy - resume context on user interaction
      if (this.audioContext.state === 'suspended') {
        const resumeAudio = async () => {
          if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
          }
          document.removeEventListener('click', resumeAudio)
          document.removeEventListener('keydown', resumeAudio)
        }
        
        document.addEventListener('click', resumeAudio)
        document.addEventListener('keydown', resumeAudio)
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
      this.soundEnabled = false
    }
  }
  
  // Create a simple oscillator-based sound effect
  private createSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.1
  ): void {
    if (!this.audioContext || !this.soundEnabled) return
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      
      // Create envelope for retro sound
      const now = this.audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)
      
      oscillator.start(now)
      oscillator.stop(now + duration)
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }
  
  // Create more complex sound with multiple frequencies
  private createComplexSound(
    frequencies: number[],
    durations: number[],
    types: OscillatorType[] = [],
    volume: number = 0.1
  ): void {
    if (!this.audioContext || !this.soundEnabled) return
    
    frequencies.forEach((freq, index) => {
      const delay = index * 0.1 // Slight delay between notes
      const duration = durations[index] || durations[0] || 0.2
      const type = types[index] || types[0] || 'square'
      
      setTimeout(() => {
        this.createSound(freq, duration, type, volume * 0.7) // Lower volume for complex sounds
      }, delay * 1000)
    })
  }
  
  // Game sound effects
  playJumpSound(): void {
    // Quick upward sweep
    if (!this.audioContext || !this.soundEnabled) return
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'square'
      const now = this.audioContext.currentTime
      
      // Frequency sweep upward
      oscillator.frequency.setValueAtTime(220, now)
      oscillator.frequency.linearRampToValueAtTime(440, now + 0.1)
      
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      oscillator.start(now)
      oscillator.stop(now + 0.15)
    } catch (error) {
      console.warn('Error playing jump sound:', error)
    }
  }
  
  playCollectSound(type: 'present' | 'cake' | 'balloon'): void {
    // Different sounds for different collectibles
    if (type === 'present') {
      // Happy arpeggio for presents
      this.createComplexSound([523, 659, 784], [0.1, 0.1, 0.2], ['sine'], 0.15)
    } else if (type === 'cake') {
      // Sweet bell sound for cake
      this.createComplexSound([784, 1047], [0.15, 0.25], ['sine'], 0.12)
    } else if (type === 'balloon') {
      // Light pop sound for balloons
      this.createSound(330, 0.1, 'triangle', 0.1)
    }
  }
  
  playPowerUpSound(): void {
    // Magical ascending sound
    this.createComplexSound(
      [392, 523, 659, 784, 1047],
      [0.08, 0.08, 0.08, 0.08, 0.2],
      ['sine', 'sine', 'sine', 'sine', 'triangle'],
      0.2
    )
  }
  
  playDamageSound(): void {
    // Harsh descending sound
    if (!this.audioContext || !this.soundEnabled) return
    
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'sawtooth'
      const now = this.audioContext.currentTime
      
      // Frequency sweep downward
      oscillator.frequency.setValueAtTime(400, now)
      oscillator.frequency.linearRampToValueAtTime(100, now + 0.3)
      
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      
      oscillator.start(now)
      oscillator.stop(now + 0.3)
    } catch (error) {
      console.warn('Error playing damage sound:', error)
    }
  }
  
  playLevelCompleteSound(): void {
    // Victory fanfare
    const notes = [523, 659, 784, 1047, 1319] // C, E, G, C, E
    const durations = [0.2, 0.2, 0.2, 0.4, 0.6]
    this.createComplexSound(notes, durations, ['triangle'], 0.25)
  }
  
  playGameOverSound(): void {
    // Sad descending sequence
    const notes = [392, 349, 294, 261] // G, F, D, C
    const durations = [0.3, 0.3, 0.3, 0.6]
    this.createComplexSound(notes, durations, ['sine'], 0.2)
  }
  
  playBirthdayFanfare(): void {
    // Special birthday celebration sound
    // Play "Happy Birthday" melody notes
    const birthdayMelody = [
      261, 261, 294, 261, 349, 330, // Happy birthday to you
      261, 261, 294, 261, 392, 349, // Happy birthday to you
      261, 261, 523, 440, 349, 330, 294, // Happy birthday dear Jam
      466, 466, 440, 349, 392, 349 // Happy birthday to you
    ]
    
    birthdayMelody.forEach((note, index) => {
      setTimeout(() => {
        this.createSound(note, 0.3, 'triangle', 0.15)
      }, index * 200)
    })
  }
  
  // Background music
  startBackgroundMusic(): void {
    if (!this.audioContext || !this.soundEnabled || this.musicPlaying) return
    
    try {
      // Create a simple looping birthday melody
      this.backgroundMusic = this.audioContext.createOscillator()
      this.backgroundGain = this.audioContext.createGain()
      
      this.backgroundMusic.connect(this.backgroundGain)
      this.backgroundGain.connect(this.audioContext.destination)
      
      this.backgroundMusic.type = 'sine'
      this.backgroundGain.gain.setValueAtTime(0.05 * this.masterVolume, this.audioContext.currentTime)
      
      // Play a simple repeating melody
      this.playBackgroundMelody()
      this.musicPlaying = true
      
    } catch (error) {
      console.warn('Error starting background music:', error)
    }
  }
  
  private playBackgroundMelody(): void {
    if (!this.audioContext || !this.backgroundMusic) return
    
    // Simple cheerful melody that loops
    const melody = [523, 587, 659, 523, 659, 784, 659, 523] // C, D, E, C, E, G, E, C
    const noteLength = 0.5
    let currentNote = 0
    
    const playNote = () => {
      if (this.backgroundMusic && this.musicPlaying) {
        this.backgroundMusic.frequency.setValueAtTime(
          melody[currentNote],
          this.audioContext!.currentTime
        )
        currentNote = (currentNote + 1) % melody.length
        
        setTimeout(playNote, noteLength * 1000)
      }
    }
    
    this.backgroundMusic.start()
    playNote()
  }
  
  stopBackgroundMusic(): void {
    if (this.backgroundMusic && this.musicPlaying) {
      try {
        this.backgroundMusic.stop()
        this.backgroundMusic = null
        this.backgroundGain = null
        this.musicPlaying = false
      } catch (error) {
        console.warn('Error stopping background music:', error)
      }
    }
  }
  
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    
    if (this.backgroundGain) {
      this.backgroundGain.gain.setValueAtTime(
        0.05 * this.masterVolume,
        this.audioContext!.currentTime
      )
    }
  }
  
  toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled
    
    if (!this.soundEnabled) {
      this.stopBackgroundMusic()
    }
    
    return this.soundEnabled
  }
  
  isSoundEnabled(): boolean {
    return this.soundEnabled
  }
  
  isMusicPlaying(): boolean {
    return this.musicPlaying
  }
}