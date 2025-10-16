// Správce zvuků pro simulaci
class SoundManager {
  constructor() {
    // Zvuky pro pozadovou atmosféru (crowd cheering) - přehrávají se souvisle
    this.crowdSounds = [
      '/sounds/crowd/481776__gregorquendel__crowd-cheering-strong-cheering-1.wav',
      '/sounds/crowd/481781__gregorquendel__crowd-cheering-strong-cheering-2-short.wav',
      '/sounds/crowd/481779__gregorquendel__crowd-cheering-soft-cheering-1.wav',
      '/sounds/crowd/481777__gregorquendel__crowd-cheering-soft-cheering-and-chatter.wav',
      '/sounds/crowd/481775__gregorquendel__crowd-cheering-ambience-and-cheering.wav',
      '/sounds/crowd/481772__gregorquendel__crowd-cheering-rhythmic-cheering.wav',
      '/sounds/crowd/481780__gregorquendel__crowd-cheering-strong-cheering-and-soft-rhythmic-cheering.wav',
      '/sounds/crowd/481774__gregorquendel__crowd-cheering-ambience.wav',
      '/sounds/crowd/481773__gregorquendel__crowd-cheering-full-recording.wav',
      '/sounds/crowd/481778__gregorquendel__crowd-cheering-soft-cheering-2.wav',
      '/sounds/crowd/481782__gregorquendel__crowd-cheering-strong-cheering-and-strong-rhythmic-cheering.wav'
    ]

    // Zvuky pro kontakt s míčem
    this.ballHitSounds = [
      '/sounds/ball/attack.wav',
      '/sounds/ball/attack2.wav'
    ]

    // Zvuk pro úspěšně zablokovaný útok
    this.defenseBlockSound = '/sounds/ball/block.wav'

    // Speciální zvuky pro ultimate a nesmysl
    this.ultimateAttackSound = '/sounds/special/ultimate-attack.wav'
    this.ultimateDefenseSound = '/sounds/special/ultimate-defense.wav'
    this.nonsenseSuccessSound = '/sounds/special/nonsense-succes.mp3'
    this.skillFailSound = '/sounds/special/skill-fail.mp3'

    // Zvuk rozhodčího
    this.whistleSound = '/sounds/90743__pablo-f__referee-whistle.wav'

    this.crowdAudioElements = []
    this.ballHitAudioPool = []
    this.defenseBlockAudioPool = []
    this.ultimateAttackAudioPool = []
    this.ultimateDefenseAudioPool = []
    this.nonsenseSuccessAudioPool = []
    this.skillFailAudioPool = []
    this.whistleAudioPool = []
    this.shuffledCrowdIndexes = []
    this.currentCrowdIndex = 0
    this.isCrowdPlaying = false
    this.volume = 0.3 // Výchozí hlasitost (30%)
    this.crowdVolume = 0.2 // Crowd je tišší aby nerušil
    this.specialVolume = 0.5 // Ultimate a nesmysl jsou hlasitější
    this.enabled = true

    this.initAudio()
  }

  // Inicializace všech audio elementů
  initAudio() {
    // Vytvořit audio elementy pro crowd sounds
    this.crowdSounds.forEach(soundPath => {
      const audio = new Audio(soundPath)
      audio.volume = this.crowdVolume
      audio.preload = 'auto'

      audio.addEventListener('ended', () => {
        if (this.isCrowdPlaying) {
          this.playNextCrowdSound()
        }
      })

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst crowd zvuk: ${soundPath}`, e)
      })

      this.crowdAudioElements.push(audio)
    })

    // Vytvořit pool pro ball hit zvuky (10 instancí každého pro překrývání)
    this.ballHitSounds.forEach(soundPath => {
      for (let i = 0; i < 10; i++) {
        const audio = new Audio(soundPath)
        audio.volume = this.volume
        audio.preload = 'auto'

        audio.addEventListener('error', (e) => {
          console.warn(`Nepodařilo se načíst ball hit zvuk: ${soundPath}`, e)
        })

        this.ballHitAudioPool.push({ audio, isPlaying: false })
      }
    })

    // Vytvořit pool pro defense block zvuk (5 instancí pro překrývání)
    for (let i = 0; i < 5; i++) {
      const audio = new Audio(this.defenseBlockSound)
      audio.volume = this.volume
      audio.preload = 'auto'

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst defense block zvuk: ${this.defenseBlockSound}`, e)
      })

      this.defenseBlockAudioPool.push({ audio, isPlaying: false })
    }

    // Vytvořit pool pro ultimate attack zvuk (3 instance)
    for (let i = 0; i < 3; i++) {
      const audio = new Audio(this.ultimateAttackSound)
      audio.volume = this.specialVolume
      audio.preload = 'auto'

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst ultimate attack zvuk: ${this.ultimateAttackSound}`, e)
      })

      this.ultimateAttackAudioPool.push({ audio, isPlaying: false })
    }

    // Vytvořit pool pro ultimate defense zvuk (3 instance)
    for (let i = 0; i < 3; i++) {
      const audio = new Audio(this.ultimateDefenseSound)
      audio.volume = this.specialVolume
      audio.preload = 'auto'

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst ultimate defense zvuk: ${this.ultimateDefenseSound}`, e)
      })

      this.ultimateDefenseAudioPool.push({ audio, isPlaying: false })
    }

    // Vytvořit pool pro nonsense success zvuk (2 instance)
    for (let i = 0; i < 2; i++) {
      const audio = new Audio(this.nonsenseSuccessSound)
      audio.volume = this.specialVolume
      audio.preload = 'auto'

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst nonsense success zvuk: ${this.nonsenseSuccessSound}`, e)
      })

      this.nonsenseSuccessAudioPool.push({ audio, isPlaying: false })
    }

    // Vytvořit pool pro skill fail zvuk (5 instancí)
    for (let i = 0; i < 5; i++) {
      const audio = new Audio(this.skillFailSound)
      audio.volume = this.volume
      audio.preload = 'auto'

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst skill fail zvuk: ${this.skillFailSound}`, e)
      })

      this.skillFailAudioPool.push({ audio, isPlaying: false })
    }

    // Vytvořit pool pro referee whistle zvuk (3 instance)
    for (let i = 0; i < 3; i++) {
      const audio = new Audio(this.whistleSound)
      audio.volume = this.volume
      audio.preload = 'auto'

      audio.addEventListener('error', (e) => {
        console.warn(`Nepodařilo se načíst referee whistle zvuk: ${this.whistleSound}`, e)
      })

      this.whistleAudioPool.push({ audio, isPlaying: false })
    }
  }

  // Zamíchat pořadí crowd sounds
  shuffleCrowdSounds() {
    this.shuffledCrowdIndexes = [...Array(this.crowdSounds.length).keys()]

    // Fisher-Yates shuffle
    for (let i = this.shuffledCrowdIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledCrowdIndexes[i], this.shuffledCrowdIndexes[j]] =
        [this.shuffledCrowdIndexes[j], this.shuffledCrowdIndexes[i]]
    }

    this.currentCrowdIndex = 0
  }

  // Spustit pozadové crowd sounds
  startCrowdSounds() {
    if (this.isCrowdPlaying || !this.enabled) return

    this.isCrowdPlaying = true
    this.shuffleCrowdSounds()
    this.playNextCrowdSound()
  }

  // Zastavit pozadové crowd sounds
  stopCrowdSounds() {
    this.isCrowdPlaying = false

    this.crowdAudioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  // Přehrát další crowd sound v pořadí
  playNextCrowdSound() {
    if (!this.isCrowdPlaying || !this.enabled) return

    // Pokud jsme na konci seznamu, zamícháme znovu
    if (this.currentCrowdIndex >= this.shuffledCrowdIndexes.length) {
      this.shuffleCrowdSounds()
    }

    const soundIndex = this.shuffledCrowdIndexes[this.currentCrowdIndex]
    const audio = this.crowdAudioElements[soundIndex]

    if (audio) {
      audio.currentTime = 0
      audio.volume = this.crowdVolume

      audio.play().catch(error => {
        console.warn('Chyba při přehrávání crowd zvuku:', error)
        // Pokud se nepodařilo přehrát, zkusíme další
        this.currentCrowdIndex++
        setTimeout(() => this.playNextCrowdSound(), 500)
      })
    }

    this.currentCrowdIndex++
  }

  // Najít volný audio element v ball hit poolu
  getAvailableBallHitAudio() {
    let available = this.ballHitAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.ballHitAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát náhodný zvuk kontaktu s míčem
  playBallHit() {
    if (!this.enabled) return

    const available = this.getAvailableBallHitAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.volume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání ball hit zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Najít volný audio element v defense block poolu
  getAvailableDefenseBlockAudio() {
    let available = this.defenseBlockAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.defenseBlockAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát zvuk úspěšně zablokovaného útoku
  playDefenseBlock() {
    if (!this.enabled) return

    const available = this.getAvailableDefenseBlockAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.volume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání defense block zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Najít volný audio element pro ultimate attack
  getAvailableUltimateAttackAudio() {
    let available = this.ultimateAttackAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.ultimateAttackAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát zvuk úspěšného útočného ultimate
  playUltimateAttack() {
    if (!this.enabled) return

    const available = this.getAvailableUltimateAttackAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.specialVolume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání ultimate attack zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Najít volný audio element pro ultimate defense
  getAvailableUltimateDefenseAudio() {
    let available = this.ultimateDefenseAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.ultimateDefenseAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát zvuk úspěšné obranné ultimate
  playUltimateDefense() {
    if (!this.enabled) return

    const available = this.getAvailableUltimateDefenseAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.specialVolume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání ultimate defense zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Najít volný audio element pro nonsense success
  getAvailableNonsenseSuccessAudio() {
    let available = this.nonsenseSuccessAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.nonsenseSuccessAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát zvuk úspěšného nesmyslu
  playNonsenseSuccess() {
    if (!this.enabled) return

    const available = this.getAvailableNonsenseSuccessAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.specialVolume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání nonsense success zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Najít volný audio element pro skill fail
  getAvailableSkillFailAudio() {
    let available = this.skillFailAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.skillFailAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát zvuk neúspěšné schopnosti
  playSkillFail() {
    if (!this.enabled) return

    const available = this.getAvailableSkillFailAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.volume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání skill fail zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Najít volný audio element pro referee whistle
  getAvailableWhistleAudio() {
    let available = this.whistleAudioPool.find(item => !item.isPlaying)

    if (!available) {
      available = this.whistleAudioPool[0]
      available.audio.pause()
      available.audio.currentTime = 0
    }

    return available
  }

  // Přehrát zvuk rozhodčího píšťalky
  playWhistle() {
    if (!this.enabled) return

    const available = this.getAvailableWhistleAudio()

    available.audio.currentTime = 0
    available.audio.volume = this.volume
    available.isPlaying = true

    available.audio.play().catch(error => {
      console.warn('Chyba při přehrávání whistle zvuku:', error)
    })

    available.audio.onended = () => {
      available.isPlaying = false
    }
  }

  // Nastavit hlasitost pro efekty (0.0 - 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))

    this.ballHitAudioPool.forEach(item => {
      item.audio.volume = this.volume
    })

    this.defenseBlockAudioPool.forEach(item => {
      item.audio.volume = this.volume
    })

    this.skillFailAudioPool.forEach(item => {
      item.audio.volume = this.volume
    })

    this.whistleAudioPool.forEach(item => {
      item.audio.volume = this.volume
    })
  }

  // Nastavit hlasitost pro speciální efekty (0.0 - 1.0)
  setSpecialVolume(volume) {
    this.specialVolume = Math.max(0, Math.min(1, volume))

    this.ultimateAttackAudioPool.forEach(item => {
      item.audio.volume = this.specialVolume
    })

    this.ultimateDefenseAudioPool.forEach(item => {
      item.audio.volume = this.specialVolume
    })

    this.nonsenseSuccessAudioPool.forEach(item => {
      item.audio.volume = this.specialVolume
    })
  }

  // Nastavit hlasitost pro crowd (0.0 - 1.0)
  setCrowdVolume(volume) {
    this.crowdVolume = Math.max(0, Math.min(1, volume))

    this.crowdAudioElements.forEach(audio => {
      audio.volume = this.crowdVolume
    })
  }

  // Zapnout/vypnout zvuky
  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  toggle() {
    this.enabled = !this.enabled
  }

  // Ztlumit
  mute() {
    this.setVolume(0)
  }

  // Obnovit hlasitost
  unmute() {
    this.setVolume(0.4)
  }

  // Toggle mute/unmute
  toggleMute() {
    if (this.volume === 0) {
      this.unmute()
    } else {
      this.mute()
    }
  }

  // Zastavit všechny přehrávané zvuky
  stopAll() {
    this.stopCrowdSounds()

    this.ballHitAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })

    this.defenseBlockAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })

    this.ultimateAttackAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })

    this.ultimateDefenseAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })

    this.nonsenseSuccessAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })

    this.skillFailAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })

    this.whistleAudioPool.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
      item.isPlaying = false
    })
  }

  // Obnovit hlasitost
  unmute() {
    this.setVolume(0.4)
    this.setCrowdVolume(0.2)
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
