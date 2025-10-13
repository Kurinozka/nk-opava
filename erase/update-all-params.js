// Automatická aktualizace parametrů všech hráčů podle správného klíče
import { extraligaTeams } from './src/extraligaTeams.js'
import fs from 'fs'

// Mapa skill ID na potřebné parametry
const skillAttributes = {
  1: ['technika', 'cteniHry'],          // běžná nahrávka
  2: ['technika', 'obratnost'],         // šlapaný kraťas
  3: ['rana', 'rychlost'],              // smeč do áčka
  4: ['technika', 'obratnost'],         // kraťas pod sebe
  5: ['rana', 'obratnost'],             // klepák
  6: ['rana', 'rychlost', 'obratnost'], // skákaná smeč
  7: ['technika', 'rana'],              // úder do béčka
  8: ['technika', 'cteniHry'],          // lob
  9: ['technika', 'obratnost'],         // pata
  10: ['technika', 'rana'],             // forhend
  11: ['technika', 'obratnost'],        // bekhend
  12: ['obrana', 'rychlost', 'obratnost'], // blok
  13: ['obrana', 'cteniHry'],           // čtení hry
  14: ['vydrz', 'psychickaOdolnost'],   // mentální síla
  15: ['obetavost', 'vydrz'],           // bojovnost
  16: ['rychlost', 'obratnost'],        // základní pohyb
  17: ['obrana', 'cteniHry']            // základní obrana
}

// Vypočítá parametry podle pozice tak, aby průměr byl targetAvg
function calculateStatsForPosition(position, targetAvg, availableSkills = []) {
  const baseStats = {
    rychlost: targetAvg,
    obratnost: targetAvg,
    rana: targetAvg,
    technika: targetAvg,
    obetavost: targetAvg,
    psychickaOdolnost: targetAvg,
    obrana: targetAvg,
    cteniHry: targetAvg,
    vydrz: targetAvg
  }

  // Úpravy podle pozice (vyvážené - když někde přidám, jinde uberu)
  const adjustments = {
    rychlost: 0, obratnost: 0, rana: 0, technika: 0,
    obetavost: 0, psychickaOdolnost: 0, obrana: 0, cteniHry: 0, vydrz: 0
  }

  if (position.includes('Smečař') && position.includes('Blokař')) {
    // Vysoká rana, rychlost, obratnost, obrana
    adjustments.rana = 6
    adjustments.rychlost = 4
    adjustments.obratnost = 3
    adjustments.obrana = 4
    // Kompenzace
    adjustments.technika = -5
    adjustments.cteniHry = -5
    adjustments.psychickaOdolnost = -4
    adjustments.vydrz = -3
  } else if (position.includes('Nahravač') && position.includes('Polař')) {
    // Vysoká technika, čtení hry, obrana
    adjustments.technika = 6
    adjustments.cteniHry = 5
    adjustments.obrana = 5
    // Kompenzace
    adjustments.rana = -6
    adjustments.rychlost = -4
    adjustments.obratnost = -3
    adjustments.vydrz = -3
  } else if (position.includes('Polař') && position.includes('Smečař')) {
    // Vyvážené, trochu víc technika a obrana
    adjustments.technika = 4
    adjustments.obrana = 4
    adjustments.cteniHry = 3
    // Kompenzace
    adjustments.rana = -4
    adjustments.rychlost = -3
    adjustments.obratnost = -2
    adjustments.vydrz = -2
  } else if (position === 'Univerzál') {
    // Rovnoměrně rozložené - menší variance
    adjustments.rychlost = Math.floor(Math.random() * 5) - 2
    adjustments.obratnost = Math.floor(Math.random() * 5) - 2
    adjustments.rana = Math.floor(Math.random() * 5) - 2
    adjustments.technika = Math.floor(Math.random() * 5) - 2
    adjustments.obetavost = Math.floor(Math.random() * 5) - 2
    adjustments.psychickaOdolnost = Math.floor(Math.random() * 5) - 2
    adjustments.obrana = Math.floor(Math.random() * 5) - 2
    adjustments.cteniHry = Math.floor(Math.random() * 5) - 2
    adjustments.vydrz = Math.floor(Math.random() * 5) - 2

    // Vyrovnat na nulu
    const sum = Object.values(adjustments).reduce((a, b) => a + b, 0)
    adjustments.vydrz -= sum
  } else {
    // Výchozí - malé náhodné rozdíly
    adjustments.rychlost = Math.floor(Math.random() * 7) - 3
    adjustments.obratnost = Math.floor(Math.random() * 7) - 3
    adjustments.rana = Math.floor(Math.random() * 7) - 3
    adjustments.technika = Math.floor(Math.random() * 7) - 3
    adjustments.obetavost = Math.floor(Math.random() * 7) - 3
    adjustments.psychickaOdolnost = Math.floor(Math.random() * 7) - 3
    adjustments.obrana = Math.floor(Math.random() * 7) - 3
    adjustments.cteniHry = Math.floor(Math.random() * 7) - 3
    adjustments.vydrz = Math.floor(Math.random() * 7) - 3

    const sum = Object.values(adjustments).reduce((a, b) => a + b, 0)
    adjustments.vydrz -= sum
  }

  // Aplikuj úpravy
  Object.keys(adjustments).forEach(key => {
    baseStats[key] = Math.round(baseStats[key] + adjustments[key])
  })

  // Bonusy za oblíbené údery (skill ID 16, 17 jsou základní, nebereme)
  const specialSkills = availableSkills.filter(id => id !== 16 && id !== 17)
  if (specialSkills.length > 0) {
    const bonusPerSkill = specialSkills.length === 1 ? 3 : 2
    const totalBonus = specialSkills.length * bonusPerSkill

    // Přidej bonusy k relevantním atributům
    const boostedAttrs = new Set()
    specialSkills.forEach(skillId => {
      const attrs = skillAttributes[skillId] || []
      attrs.forEach(attr => boostedAttrs.add(attr))
    })

    const boostPerAttr = Math.ceil(totalBonus / boostedAttrs.size)
    boostedAttrs.forEach(attr => {
      baseStats[attr] += boostPerAttr
    })

    // Kompenzace - ubrat stejně bodů z ostatních atributů
    const otherAttrs = Object.keys(baseStats).filter(attr => !boostedAttrs.has(attr))
    const penaltyPerAttr = Math.ceil(totalBonus / otherAttrs.length)
    otherAttrs.forEach(attr => {
      baseStats[attr] -= penaltyPerAttr
    })
  }

  // Zajisti, že jsou v rozumných mezích (min 65, max 99)
  Object.keys(baseStats).forEach(key => {
    baseStats[key] = Math.max(65, Math.min(99, baseStats[key]))
  })

  return baseStats
}

// Vypočítá cílový průměr pro hráče
function calculateTargetAverage(player) {
  // Zjisti nejvyšší ligu
  let baseRating = 85 // Extraliga
  let hasExtraliga = false

  for (const season of player.seasonStats || []) {
    if (season.league.includes('Extraliga')) {
      hasExtraliga = true
      baseRating = 85
      break
    } else if (season.league.includes('1. liga') && !hasExtraliga) {
      baseRating = 80
    }
  }

  // Vypočítaj vážený win rate z posledních 2 let
  let wr2025 = 0, wr2024 = 0
  let found2025 = false, found2024 = false

  for (const season of player.seasonStats || []) {
    if (season.season.includes('2025')) {
      wr2025 = season.winRate || 0
      found2025 = true
    } else if (season.season.includes('2024')) {
      wr2024 = season.winRate || 0
      found2024 = true
    }
  }

  if (!found2025 && !found2024) {
    return baseRating // Pokud nemá data, vrať základní
  }

  // Vážený průměr: (2 × wr_2025 + wr_2024) / 3
  const weightedWR = found2025 && found2024
    ? (2 * wr2025 + wr2024) / 3
    : (found2025 ? wr2025 : wr2024)

  // Úprava podle win rate
  let adjustment = 0
  if (weightedWR >= 50) {
    // 50% = 0%, 100% = 15%
    adjustment = ((weightedWR - 50) / 50) * 15
  } else {
    // 50% = 0%, 0% = -15%
    adjustment = -((50 - weightedWR) / 50) * 15
  }

  const targetAvg = baseRating * (1 + adjustment / 100)
  return Math.round(targetAvg * 10) / 10 // Zaokrouhli na 1 des. místo
}

console.log('=== AKTUALIZACE PARAMETRŮ VŠECH HRÁČŮ ===\n')

let totalPlayers = 0
let updatedPlayers = 0

for (const team of extraligaTeams) {
  console.log(`\n📋 Tým: ${team.name}`)

  for (const player of team.players) {
    if (player.coachQuotes) continue // Přeskoč trenéry

    totalPlayers++

    const targetAvg = calculateTargetAverage(player)
    const newStats = calculateStatsForPosition(
      player.position || 'Univerzál',
      targetAvg,
      player.availableSkills || []
    )

    // Vypočítej skutečný průměr
    const actualAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9

    console.log(`  ✓ ${player.name}`)
    console.log(`    Pozice: ${player.position || 'Univerzál'}`)
    console.log(`    Cílový průměr: ${targetAvg.toFixed(1)}`)
    console.log(`    Skutečný průměr: ${actualAvg.toFixed(1)}`)
    console.log(`    Parametry: ${Object.values(newStats).join(', ')}`)

    player.stats = newStats
    updatedPlayers++
  }
}

console.log(`\n\n=== SOUHRN ===`)
console.log(`Celkem hráčů: ${totalPlayers}`)
console.log(`Aktualizováno: ${updatedPlayers}`)

// Ulož zpět do souboru
const outputContent = `// Data týmů Extraligy mužů sezóny 2025
// Aktualizováno na základě statistik z nohejbal.org

export const extraligaTeams = ${JSON.stringify(extraligaTeams, null, 2)}
`

fs.writeFileSync('./src/extraligaTeams.js', outputContent, 'utf-8')
console.log('\n✅ Soubor extraligaTeams.js byl aktualizován')
