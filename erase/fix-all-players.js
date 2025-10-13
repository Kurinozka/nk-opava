// Kompletní oprava všech hráčů - extraliga, Opava, 1. liga
import { extraligaTeams } from '../src/extraligaTeams.js'
import { players as opavaPlayers } from '../src/playerData.js'
import { leagueTeams } from '../src/leagueTeams.js'
import fs from 'fs'

// Skill ID -> atributy které ovlivňuje
const skillAttributes = {
  1: ['technika', 'cteniHry'],
  2: ['rana', 'obratnost'],
  3: ['rana', 'rychlost'],
  4: ['obratnost', 'obetavost'],
  5: ['obratnost', 'obetavost'],
  6: ['technika', 'psychickaOdolnost'],
  7: ['technika', 'cteniHry'],
  8: ['technika', 'cteniHry'],
  9: ['technika', 'psychickaOdolnost'],
  10: ['obratnost', 'obetavost'],
  11: ['rana', 'psychickaOdolnost'],
  12: ['obrana', 'rychlost'],
  16: ['obrana', 'psychickaOdolnost'],
  17: ['obrana', 'rychlost']
}

// Detekce "robotů" - hráčů s téměř identickými parametry
function isRobot(stats) {
  if (!stats) return false
  const values = Object.values(stats)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // Pokud rozdíl mezi min a max je menší než 3, je to robot
  return (max - min) < 3
}

// Kontrola, zda se změnily individuální parametry (ne jen průměr)
function statsChanged(oldStats, newStats) {
  if (!oldStats || !newStats) return true

  const keys = Object.keys(newStats)
  for (const key of keys) {
    if (Math.abs(oldStats[key] - newStats[key]) > 0.5) {
      return true
    }
  }
  return false
}

// Výpočet cílového průměru
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

  let adjustment = 0
  if (weightedWR >= 50) {
    adjustment = ((weightedWR - 50) / 50) * 15
  } else {
    adjustment = -((50 - weightedWR) / 50) * 15
  }

  const targetWithBonus = (baseRating + trainingBonus) * (1 + adjustment / 100)
  return Math.round(targetWithBonus * 10) / 10
}

// Výpočet parametrů podle pozice
function calculateStatsForPosition(position, targetAvg, availableSkills = []) {
  // Nejdříve simuluj adjustmenty, abychom zjistili, jak moc se změní průměr
  const testStats = {
    rychlost: targetAvg, obratnost: targetAvg, rana: targetAvg,
    technika: targetAvg, obetavost: targetAvg,
    psychickaOdolnost: targetAvg, obrana: targetAvg,
    cteniHry: targetAvg, vydrz: targetAvg
  }

  const adjustments = {
    rychlost: 0, obratnost: 0, rana: 0, technika: 0,
    obetavost: 0, psychickaOdolnost: 0, obrana: 0, cteniHry: 0, vydrz: 0
  }

  // Úpravy podle pozice (jsou zero-sum, takže by neměly měnit průměr)
  if (position.includes('Smečař') && position.includes('Blokař')) {
    adjustments.rana = 6
    adjustments.rychlost = 4
    adjustments.obratnost = 3
    adjustments.obrana = 4
    adjustments.technika = -5
    adjustments.cteniHry = -5
    adjustments.psychickaOdolnost = -4
    adjustments.vydrz = -3
  } else if (position.includes('Nahravač') && position.includes('Polař')) {
    adjustments.technika = 6
    adjustments.cteniHry = 5
    adjustments.obrana = 5
    adjustments.rana = -6
    adjustments.rychlost = -4
    adjustments.obratnost = -3
    adjustments.vydrz = -3
  } else if (position.includes('Polař') && position.includes('Smečař')) {
    adjustments.technika = 4
    adjustments.obrana = 4
    adjustments.cteniHry = 3
    adjustments.rana = -4
    adjustments.rychlost = -3
    adjustments.obratnost = -2
    adjustments.vydrz = -2
  } else if (position === 'Univerzál') {
    // Pro Univerzály - menší adjustmenty než specializované pozice, ale stále viditelné
    adjustments.technika = 3
    adjustments.obrana = 3
    adjustments.cteniHry = 2
    adjustments.rana = -3
    adjustments.rychlost = -2
    adjustments.obratnost = -1
    adjustments.vydrz = -2
  } else if (position === 'Polař') {
    adjustments.technika = 5
    adjustments.obrana = 5
    adjustments.cteniHry = 4
    adjustments.rana = -5
    adjustments.rychlost = -4
    adjustments.obratnost = -3
    adjustments.vydrz = -2
  } else if (position.includes('Blokař') && position.includes('Smečař')) {
    adjustments.rana = 6
    adjustments.rychlost = 4
    adjustments.obratnost = 3
    adjustments.obrana = 4
    adjustments.technika = -5
    adjustments.cteniHry = -5
    adjustments.psychickaOdolnost = -4
    adjustments.vydrz = -3
  } else if (position.includes('Smečař')) {
    adjustments.rana = 5
    adjustments.rychlost = 3
    adjustments.obratnost = 2
    adjustments.technika = -3
    adjustments.cteniHry = -3
    adjustments.psychickaOdolnost = -2
    adjustments.vydrz = -2
  } else if (position.includes('Blokař')) {
    adjustments.obrana = 5
    adjustments.rana = 3
    adjustments.rychlost = 2
    adjustments.technika = -3
    adjustments.cteniHry = -3
    adjustments.psychickaOdolnost = -2
    adjustments.vydrz = -2
  } else if (position.includes('Nahravač')) {
    adjustments.technika = 5
    adjustments.cteniHry = 4
    adjustments.obrana = 3
    adjustments.rana = -4
    adjustments.rychlost = -3
    adjustments.obratnost = -2
    adjustments.vydrz = -3
  }

  // Aplikuj poziční adjustmenty
  Object.keys(adjustments).forEach(key => {
    testStats[key] = testStats[key] + adjustments[key]
  })

  // Bonusy za oblíbené údery (zero-sum)
  const specialSkills = availableSkills.filter(id => id !== 16 && id !== 17)
  if (specialSkills.length > 0) {
    const bonusPerSkill = specialSkills.length === 1 ? 3 : 2
    const totalBonus = specialSkills.length * bonusPerSkill

    const boostedAttrs = new Set()
    specialSkills.forEach(skillId => {
      const attrs = skillAttributes[skillId] || []
      attrs.forEach(attr => boostedAttrs.add(attr))
    })

    const boostPerAttr = Math.ceil(totalBonus / boostedAttrs.size)
    boostedAttrs.forEach(attr => {
      testStats[attr] += boostPerAttr
    })

    const otherAttrs = Object.keys(testStats).filter(attr => !boostedAttrs.has(attr))
    const penaltyPerAttr = Math.ceil(totalBonus / otherAttrs.length)
    otherAttrs.forEach(attr => {
      testStats[attr] -= penaltyPerAttr
    })
  }

  // Aplikuj omezení (65-99) a zjisti skutečný průměr po omezení
  const clampedStats = {}
  Object.keys(testStats).forEach(key => {
    clampedStats[key] = Math.max(65, Math.min(99, Math.round(testStats[key])))
  })

  const actualAvg = Object.values(clampedStats).reduce((a, b) => a + b, 0) / 9
  const avgDiff = targetAvg - actualAvg

  // Kompenzuj rozdíl tím, že upravíš základní hodnoty
  const baseStats = {
    rychlost: targetAvg + avgDiff,
    obratnost: targetAvg + avgDiff,
    rana: targetAvg + avgDiff,
    technika: targetAvg + avgDiff,
    obetavost: targetAvg + avgDiff,
    psychickaOdolnost: targetAvg + avgDiff,
    obrana: targetAvg + avgDiff,
    cteniHry: targetAvg + avgDiff,
    vydrz: targetAvg + avgDiff
  }

  // Aplikuj poziční adjustmenty znovu
  Object.keys(adjustments).forEach(key => {
    baseStats[key] = baseStats[key] + adjustments[key]
  })

  // Aplikuj skill bonusy znovu
  if (specialSkills.length > 0) {
    const bonusPerSkill = specialSkills.length === 1 ? 3 : 2
    const totalBonus = specialSkills.length * bonusPerSkill

    const boostedAttrs = new Set()
    specialSkills.forEach(skillId => {
      const attrs = skillAttributes[skillId] || []
      attrs.forEach(attr => boostedAttrs.add(attr))
    })

    const boostPerAttr = Math.ceil(totalBonus / boostedAttrs.size)
    boostedAttrs.forEach(attr => {
      baseStats[attr] += boostPerAttr
    })

    const otherAttrs = Object.keys(baseStats).filter(attr => !boostedAttrs.has(attr))
    const penaltyPerAttr = Math.ceil(totalBonus / otherAttrs.length)
    otherAttrs.forEach(attr => {
      baseStats[attr] -= penaltyPerAttr
    })
  }

  // Finální omezení
  Object.keys(baseStats).forEach(key => {
    baseStats[key] = Math.max(65, Math.min(99, Math.round(baseStats[key])))
  })

  return baseStats
}

console.log('=== KOMPLETNÍ OPRAVA VŠECH HRÁČŮ ===\n')

let totalFixed = 0

// 1. OPRAVA EXTRALIGY
console.log('📋 EXTRALIGA\n')
let extraligaFixed = 0

for (const team of extraligaTeams) {
  for (const player of team.players) {
    if (player.coachQuotes) continue

    const targetAvg = calculateTargetAverage(player, 85, 0)
    const newStats = calculateStatsForPosition(player.position, targetAvg, player.availableSkills || [])
    const actualAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9

    const oldAvg = player.stats ? Object.values(player.stats).reduce((a, b) => a + b, 0) / 9 : 0
    const diffFromTarget = Math.abs(actualAvg - targetAvg)

    // Aktualizuj, pokud: parametry se změnily NEBO hráč nemá stats NEBO je robot
    if (statsChanged(player.stats, newStats) || !player.stats || isRobot(player.stats)) {
      console.log(`✓ ${player.name} (${team.shortName})`)
      if (isRobot(player.stats)) {
        console.log(`  🤖 Robot detekován - force přepočítání`)
      }
      console.log(`  Starý: ${oldAvg.toFixed(1)} → Cíl: ${targetAvg.toFixed(1)} → Nový: ${actualAvg.toFixed(1)}`)
      player.stats = newStats
      extraligaFixed++
    }
  }
}

console.log(`\n✅ Extraliga: ${extraligaFixed} hráčů opraveno\n`)
totalFixed += extraligaFixed

// 2. OPRAVA OPAVY
console.log('📋 NK OPAVA (1. LIGA)\n')
let opavaFixed = 0

for (const player of opavaPlayers) {
  if (!player.stats && !player.seasonStats) continue

  const trainingBonus = player.trainingAttendance2025 ? (80 * player.trainingAttendance2025 / 100 * 0.05) : 0
  const targetAvg = calculateTargetAverage(player, 80, trainingBonus)
  const newStats = calculateStatsForPosition(player.position, targetAvg, player.availableSkills || [])
  const actualAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9

  const oldAvg = player.stats ? Object.values(player.stats).reduce((a, b) => a + b, 0) / 9 : 0
  const diffFromTarget = Math.abs(actualAvg - targetAvg)

  if (statsChanged(player.stats, newStats) || !player.stats || isRobot(player.stats)) {
    console.log(`✓ ${player.name}`)
    if (isRobot(player.stats)) {
      console.log(`  🤖 Robot detekován - force přepočítání`)
    }
    console.log(`  Trénink: ${player.trainingAttendance2025}% (+${trainingBonus.toFixed(1)})`)
    console.log(`  Starý: ${oldAvg.toFixed(1)} → Cíl: ${targetAvg.toFixed(1)} → Nový: ${actualAvg.toFixed(1)}`)
    player.stats = newStats
    opavaFixed++
  }
}

console.log(`\n✅ Opava: ${opavaFixed} hráčů opraveno\n`)
totalFixed += opavaFixed

// 3. OPRAVA 1. LIGY (OSTATNÍ TÝMY)
console.log('📋 1. LIGA (OSTATNÍ TÝMY)\n')
let firstLeagueFixed = 0

for (const team of leagueTeams) {
  for (const player of team.players) {
    if (player.coachQuotes) continue

    const targetAvg = calculateTargetAverage(player, 80, 0)
    const newStats = calculateStatsForPosition(player.position, targetAvg, player.availableSkills || [])
    const actualAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9

    const oldAvg = player.stats ? Object.values(player.stats).reduce((a, b) => a + b, 0) / 9 : 0
    const diffFromTarget = Math.abs(actualAvg - targetAvg)

    if (statsChanged(player.stats, newStats) || !player.stats || isRobot(player.stats)) {
      console.log(`✓ ${player.name} (${team.shortName})`)
      if (isRobot(player.stats)) {
        console.log(`  🤖 Robot detekován - force přepočítání`)
      }
      console.log(`  Starý: ${oldAvg.toFixed(1)} → Cíl: ${targetAvg.toFixed(1)} → Nový: ${actualAvg.toFixed(1)}`)
      player.stats = newStats
      firstLeagueFixed++
    }
  }
}

console.log(`\n✅ 1. liga: ${firstLeagueFixed} hráčů opraveno\n`)
totalFixed += firstLeagueFixed

// ULOŽENÍ SOUBORŮ

// 1. Extraliga
const extraligaContent = `// Data týmů Extraligy mužů sezóny 2025
// Aktualizováno na základě statistik z nohejbal.org

export const extraligaTeams = ${JSON.stringify(extraligaTeams, null, 2)}

// Funkce pro výpočet statistik hráče
function calculatePlayerStats(player) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    console.warn('Player missing seasonStats data:', player.name)
    return null
  }

  const baseValue = 85
  const recentSeasons = player.seasonStats
    .filter(s => s.season.includes("2025") || s.season.includes("2024"))
    .sort((a, b) => b.season.localeCompare(a.season))

  let totalMatches = 0
  let totalWins = 0
  let singlMatches = 0, singlWins = 0
  let dvojiceMatches = 0, dvojiceWins = 0
  let trojiceMatches = 0, trojiceWins = 0

  recentSeasons.forEach(season => {
    totalMatches += season.matches
    totalWins += season.wins

    if (season.disciplines.singl.matches >= 2) {
      singlMatches += season.disciplines.singl.matches
      singlWins += season.disciplines.singl.wins
    }
    if (season.disciplines.dvojice.matches >= 2) {
      dvojiceMatches += season.disciplines.dvojice.matches
      dvojiceWins += season.disciplines.dvojice.wins
    }
    if (season.disciplines.trojice.matches >= 2) {
      trojiceMatches += season.disciplines.trojice.matches
      trojiceWins += season.disciplines.trojice.wins
    }
  })

  if (totalMatches < 4) {
    return {
      rychlost: baseValue,
      obratnost: baseValue,
      rana: baseValue,
      technika: baseValue,
      obetavost: baseValue,
      psychickaOdolnost: baseValue,
      obrana: baseValue,
      cteniHry: baseValue,
      vydrz: baseValue
    }
  }

  const overallWinRate = (totalWins / totalMatches) * 100
  const performanceModifier = ((overallWinRate - 50) / 50) * 15

  const singlWinRate = singlMatches >= 2 ? (singlWins / singlMatches) * 100 : 50
  const dvojiceWinRate = dvojiceMatches >= 2 ? (dvojiceWins / dvojiceMatches) * 100 : 50
  const trojiceWinRate = trojiceMatches >= 2 ? (trojiceWins / trojiceMatches) * 100 : 50

  const stats = {
    rychlost: Math.round(baseValue * (1 + performanceModifier / 100) + ((singlWinRate - 50) / 50) * 3),
    obratnost: Math.round(baseValue * (1 + performanceModifier / 100) + ((singlWinRate + dvojiceWinRate - 100) / 100) * 3),
    rana: Math.round(baseValue * (1 + performanceModifier / 100) + ((singlWinRate - 50) / 50) * 3),
    technika: Math.round(baseValue * (1 + performanceModifier / 100) + ((dvojiceWinRate - 50) / 50) * 3),
    obetavost: Math.round(baseValue * (1 + performanceModifier / 100) + ((dvojiceWinRate + trojiceWinRate - 100) / 100) * 3),
    psychickaOdolnost: Math.round(baseValue * (1 + performanceModifier / 100)),
    obrana: Math.round(baseValue * (1 + performanceModifier / 100) + ((dvojiceWinRate + trojiceWinRate - 100) / 100) * 3),
    cteniHry: Math.round(baseValue * (1 + performanceModifier / 100)),
    vydrz: Math.round(baseValue * (1 + performanceModifier / 100) + ((trojiceWinRate - 50) / 50) * 3)
  }

  Object.keys(stats).forEach(key => {
    stats[key] = Math.max(50, Math.min(100, stats[key]))
  })

  return stats
}

export function getPlayerWithStats(teamId, playerId) {
  const team = extraligaTeams.find(t => t.id === teamId)
  if (!team) return null

  const player = team.players.find(p => p.id === playerId)
  if (!player) return null

  return {
    ...player,
    stats: player.stats || calculatePlayerStats(player)
  }
}

function hasMinimumMatches(player, minMatches = 5) {
  if (!player.seasonStats || player.seasonStats.length === 0) return false

  const relevantSeasons = player.seasonStats.filter(s =>
    s.season.includes("2024") || s.season.includes("2025")
  )

  const totalMatches = relevantSeasons.reduce((sum, s) => sum + (s.matches || 0), 0)
  return totalMatches >= minMatches
}

export function getTeamWithStats(teamId) {
  const team = extraligaTeams.find(t => t.id === teamId)
  if (!team) return null

  const filteredPlayers = team.players
    .filter(player => player.coachQuotes || hasMinimumMatches(player, 5))
    .map(player => ({
      ...player,
      stats: player.stats || calculatePlayerStats(player)
    }))

  return {
    ...team,
    players: filteredPlayers
  }
}

export function getOpponentTeams() {
  return extraligaTeams
}
`

fs.writeFileSync('./src/extraligaTeams.js', extraligaContent, 'utf-8')
console.log('💾 Extraliga uložena do src/extraligaTeams.js')

// 2. Opava
const playerDataPath = './src/playerData.js'
const originalContent = fs.readFileSync(playerDataPath, 'utf-8')
const playersStart = originalContent.indexOf('export const players = [')
const beforePlayers = originalContent.substring(0, playersStart)
const playersContent = `export const players = ${JSON.stringify(opavaPlayers, null, 2)}\n`

fs.writeFileSync(playerDataPath, beforePlayers + playersContent, 'utf-8')
console.log('💾 Opava uložena do src/playerData.js')

// 3. 1. liga
const leagueContent = `// Data týmů 1. ligy mužů sezóny 2025
// Aktualizováno na základě statistik z nohejbal.org

export const leagueTeams = ${JSON.stringify(leagueTeams, null, 2)}

// Funkce pro výpočet statistik hráče (1. liga)
function calculatePlayerStats(player) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    console.warn('Player missing seasonStats data:', player.name)
    return null
  }

  const baseValue = 80
  const recentSeasons = player.seasonStats
    .filter(s => s.season.includes("2025") || s.season.includes("2024"))
    .sort((a, b) => b.season.localeCompare(a.season))

  let totalMatches = 0
  let totalWins = 0
  let singlMatches = 0, singlWins = 0
  let dvojiceMatches = 0, dvojiceWins = 0
  let trojiceMatches = 0, trojiceWins = 0

  recentSeasons.forEach(season => {
    totalMatches += season.matches
    totalWins += season.wins

    if (season.disciplines.singl.matches >= 2) {
      singlMatches += season.disciplines.singl.matches
      singlWins += season.disciplines.singl.wins
    }
    if (season.disciplines.dvojice.matches >= 2) {
      dvojiceMatches += season.disciplines.dvojice.matches
      dvojiceWins += season.disciplines.dvojice.wins
    }
    if (season.disciplines.trojice.matches >= 2) {
      trojiceMatches += season.disciplines.trojice.matches
      trojiceWins += season.disciplines.trojice.wins
    }
  })

  if (totalMatches < 4) {
    return {
      rychlost: baseValue,
      obratnost: baseValue,
      rana: baseValue,
      technika: baseValue,
      obetavost: baseValue,
      psychickaOdolnost: baseValue,
      obrana: baseValue,
      cteniHry: baseValue,
      vydrz: baseValue
    }
  }

  const overallWinRate = (totalWins / totalMatches) * 100
  const performanceModifier = ((overallWinRate - 50) / 50) * 15

  const singlWinRate = singlMatches >= 2 ? (singlWins / singlMatches) * 100 : 50
  const dvojiceWinRate = dvojiceMatches >= 2 ? (dvojiceWins / dvojiceMatches) * 100 : 50
  const trojiceWinRate = trojiceMatches >= 2 ? (trojiceWins / trojiceMatches) * 100 : 50

  const stats = {
    rychlost: Math.round(baseValue * (1 + performanceModifier / 100) + ((singlWinRate - 50) / 50) * 3),
    obratnost: Math.round(baseValue * (1 + performanceModifier / 100) + ((singlWinRate + dvojiceWinRate - 100) / 100) * 3),
    rana: Math.round(baseValue * (1 + performanceModifier / 100) + ((singlWinRate - 50) / 50) * 3),
    technika: Math.round(baseValue * (1 + performanceModifier / 100) + ((dvojiceWinRate - 50) / 50) * 3),
    obetavost: Math.round(baseValue * (1 + performanceModifier / 100) + ((dvojiceWinRate + trojiceWinRate - 100) / 100) * 3),
    psychickaOdolnost: Math.round(baseValue * (1 + performanceModifier / 100)),
    obrana: Math.round(baseValue * (1 + performanceModifier / 100) + ((dvojiceWinRate + trojiceWinRate - 100) / 100) * 3),
    cteniHry: Math.round(baseValue * (1 + performanceModifier / 100)),
    vydrz: Math.round(baseValue * (1 + performanceModifier / 100) + ((trojiceWinRate - 50) / 50) * 3)
  }

  Object.keys(stats).forEach(key => {
    stats[key] = Math.max(50, Math.min(100, stats[key]))
  })

  return stats
}

export function getPlayerWithStats(teamId, playerId) {
  const team = leagueTeams.find(t => t.id === teamId)
  if (!team) return null

  const player = team.players.find(p => p.id === playerId)
  if (!player) return null

  return {
    ...player,
    stats: player.stats || calculatePlayerStats(player)
  }
}

function hasMinimumMatches(player, minMatches = 5) {
  if (!player.seasonStats || player.seasonStats.length === 0) return false

  const relevantSeasons = player.seasonStats.filter(s =>
    s.season.includes("2024") || s.season.includes("2025")
  )

  const totalMatches = relevantSeasons.reduce((sum, s) => sum + (s.matches || 0), 0)
  return totalMatches >= minMatches
}

export function getTeamWithStats(teamId) {
  const team = leagueTeams.find(t => t.id === teamId)
  if (!team) return null

  const filteredPlayers = team.players
    .filter(player => player.coachQuotes || hasMinimumMatches(player, 5))
    .map(player => ({
      ...player,
      stats: player.stats || calculatePlayerStats(player)
    }))

  return {
    ...team,
    players: filteredPlayers
  }
}

export function getOpponentTeams() {
  return leagueTeams
}
`

fs.writeFileSync('./src/leagueTeams.js', leagueContent, 'utf-8')
console.log('💾 1. liga uložena do src/leagueTeams.js')

console.log(`\n=== HOTOVO ===`)
console.log(`Celkem opraveno: ${totalFixed} hráčů`)
console.log(`  - Extraliga: ${extraligaFixed}`)
console.log(`  - Opava: ${opavaFixed}`)
console.log(`  - 1. liga: ${firstLeagueFixed}`)
