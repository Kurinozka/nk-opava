// Validační script pro kontrolu parametrů a statistik všech hráčů
import { extraligaTeams } from '../src/extraligaTeams.js'
import { players as opavaPlayers } from '../src/playerData.js'
import { leagueTeams } from '../src/leagueTeams.js'

console.log('=== VALIDACE VŠECH HRÁČŮ ===\n')

// Funkce pro výpočet cílového průměru
function calculateTargetAverage(player, baseRating, trainingBonus = 0) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    return baseRating + trainingBonus
  }

  // Sečíst všechny zápasy a výhry za rok 2025
  let matches2025 = 0, wins2025 = 0
  // Sečíst všechny zápasy a výhry za rok 2024
  let matches2024 = 0, wins2024 = 0

  for (const season of player.seasonStats) {
    if (season.season.includes('2025')) {
      matches2025 += season.matches
      wins2025 += season.wins
    } else if (season.season.includes('2024') && !season.season.includes('2025')) {
      matches2024 += season.matches
      wins2024 += season.wins
    }
  }

  // Pokud nemá data, vrať základní
  if (matches2025 === 0 && matches2024 === 0) {
    return baseRating + trainingBonus
  }

  // Celková úspěšnost za roky
  const winRate2025 = matches2025 > 0 ? (wins2025 / matches2025) * 100 : null
  const winRate2024 = matches2024 > 0 ? (wins2024 / matches2024) * 100 : null

  // Vážený průměr: (WR_2025 × 2 + WR_2024) / 3
  let weightedWR
  if (winRate2025 !== null && winRate2024 !== null) {
    weightedWR = (winRate2025 * 2 + winRate2024) / 3
  } else if (winRate2025 !== null) {
    weightedWR = winRate2025
  } else {
    weightedWR = winRate2024
  }

  // Úprava podle win rate
  let adjustment = 0
  if (weightedWR >= 50) {
    // 50% = 0%, 100% = 15%
    adjustment = ((weightedWR - 50) / 50) * 15
  } else {
    // 50% = 0%, 0% = -15%
    adjustment = -((50 - weightedWR) / 50) * 15
  }

  const targetWithBonus = (baseRating + trainingBonus) * (1 + adjustment / 100)
  return Math.round(targetWithBonus * 10) / 10
}

// Funkce pro výpočet skutečného průměru
function calculateActualAverage(stats) {
  if (!stats) return 0
  const values = [
    stats.rychlost, stats.obratnost, stats.rana, stats.technika,
    stats.obetavost, stats.psychickaOdolnost, stats.obrana,
    stats.cteniHry, stats.vydrz
  ]
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round((sum / 9) * 10) / 10
}

const issues = []

// 1. KONTROLA EXTRALIGY
console.log('📋 EXTRALIGA\n')
let extraligaCount = 0
let extraligaIssues = 0

for (const team of extraligaTeams) {
  for (const player of team.players) {
    if (player.coachQuotes) continue // Přeskoč trenéry

    extraligaCount++
    const targetAvg = calculateTargetAverage(player, 85, 0)
    const actualAvg = calculateActualAverage(player.stats)
    const diff = Math.abs(actualAvg - targetAvg)

    if (diff > 1.5) {
      extraligaIssues++
      issues.push({
        type: 'EXTRALIGA',
        team: team.name,
        player: player.name,
        position: player.position,
        target: targetAvg,
        actual: actualAvg,
        diff: diff.toFixed(1)
      })
      console.log(`❌ ${player.name} (${team.shortName})`)
      console.log(`   Cíl: ${targetAvg} | Skutečnost: ${actualAvg} | Rozdíl: ${diff.toFixed(1)}`)
    }
  }
}

console.log(`\n✅ Extraliga: ${extraligaCount} hráčů, ${extraligaIssues} problémů\n`)

// 2. KONTROLA OPAVY (1. LIGA)
console.log('📋 NK OPAVA (1. LIGA)\n')
let opavaCount = 0
let opavaIssues = 0

for (const player of opavaPlayers) {
  if (!player.stats) continue // Přeskoč trenéra

  opavaCount++

  // Bonus za trénink
  const trainingBonus = player.trainingAttendance2025 ? (80 * player.trainingAttendance2025 / 100 * 0.05) : 0

  const targetAvg = calculateTargetAverage(player, 80, trainingBonus)
  const actualAvg = calculateActualAverage(player.stats)
  const diff = Math.abs(actualAvg - targetAvg)

  if (diff > 1.5) {
    opavaIssues++
    issues.push({
      type: 'OPAVA',
      team: 'NK Opava',
      player: player.name,
      position: player.position,
      training: player.trainingAttendance2025 || 0,
      trainingBonus: trainingBonus.toFixed(1),
      target: targetAvg,
      actual: actualAvg,
      diff: diff.toFixed(1)
    })
    console.log(`❌ ${player.name}`)
    console.log(`   Trénink: ${player.trainingAttendance2025}% (+${trainingBonus.toFixed(1)})`)
    console.log(`   Cíl: ${targetAvg} | Skutečnost: ${actualAvg} | Rozdíl: ${diff.toFixed(1)}`)
  }
}

console.log(`\n✅ Opava: ${opavaCount} hráčů, ${opavaIssues} problémů\n`)

// 3. KONTROLA 1. LIGY (OSTATNÍ TÝMY)
console.log('📋 1. LIGA (OSTATNÍ TÝMY)\n')
let firstLeagueCount = 0
let firstLeagueIssues = 0

for (const team of leagueTeams) {
  for (const player of team.players) {
    if (player.coachQuotes) continue

    firstLeagueCount++
    const targetAvg = calculateTargetAverage(player, 80, 0)
    const actualAvg = calculateActualAverage(player.stats)
    const diff = Math.abs(actualAvg - targetAvg)

    if (diff > 1.5) {
      firstLeagueIssues++
      issues.push({
        type: '1. LIGA',
        team: team.name,
        player: player.name,
        position: player.position,
        target: targetAvg,
        actual: actualAvg,
        diff: diff.toFixed(1)
      })
      console.log(`❌ ${player.name} (${team.shortName})`)
      console.log(`   Cíl: ${targetAvg} | Skutečnost: ${actualAvg} | Rozdíl: ${diff.toFixed(1)}`)
    }
  }
}

console.log(`\n✅ 1. liga: ${firstLeagueCount} hráčů, ${firstLeagueIssues} problémů\n`)

// SOUHRN
console.log('\n=== SOUHRN ===')
console.log(`Celkem hráčů: ${extraligaCount + opavaCount + firstLeagueCount}`)
console.log(`Celkem problémů: ${issues.length}`)
console.log(`  - Extraliga: ${extraligaIssues}`)
console.log(`  - Opava: ${opavaIssues}`)
console.log(`  - 1. liga: ${firstLeagueIssues}`)

if (issues.length > 0) {
  console.log('\n=== SEZNAM PROBLÉMŮ ===\n')
  for (const issue of issues) {
    console.log(`${issue.player} (${issue.team})`)
    console.log(`  Pozice: ${issue.position}`)
    if (issue.training !== undefined) {
      console.log(`  Trénink: ${issue.training}% (+${issue.trainingBonus})`)
    }
    console.log(`  Cíl: ${issue.target} | Skutečnost: ${issue.actual} | Rozdíl: ${issue.diff}`)
    console.log()
  }
}
