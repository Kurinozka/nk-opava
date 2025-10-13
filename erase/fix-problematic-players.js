// Script pro automatickou opravu parametrů problematických hráčů
import { extraligaTeams } from '../src/extraligaTeams.js'
import { players as opavaPlayers } from '../src/playerData.js'
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

// Výpočet cílového průměru
function calculateTargetAverage(player, baseRating, trainingBonus = 0) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    return baseRating + trainingBonus
  }

  let wr2025 = null, wr2024 = null

  for (const season of player.seasonStats) {
    if (season.season.includes('2025') || season.season.includes('2024/2025')) {
      if (!wr2025 || season.matches > 5) wr2025 = season.winRate
    } else if (season.season.includes('2024') && !season.season.includes('2025') && !season.season.includes('2024/2025')) {
      if (!wr2024 || season.matches > 5) wr2024 = season.winRate
    }
  }

  if (!wr2025 && !wr2024) return baseRating + trainingBonus

  let weightedWR
  if (wr2025 !== null && wr2024 !== null) {
    weightedWR = (2 * wr2025 + wr2024) / 3
  } else if (wr2025 !== null) {
    weightedWR = wr2025
  } else {
    weightedWR = wr2024
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

  const adjustments = {
    rychlost: 0, obratnost: 0, rana: 0, technika: 0,
    obetavost: 0, psychickaOdolnost: 0, obrana: 0, cteniHry: 0, vydrz: 0
  }

  // Úpravy podle pozice
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
    // Malé náhodné odchylky
    const variance = [-2, -1, 0, 1, 2]
    Object.keys(adjustments).forEach(key => {
      adjustments[key] = variance[Math.floor(Math.random() * variance.length)]
    })
    const sum = Object.values(adjustments).reduce((a, b) => a + b, 0)
    adjustments.vydrz -= sum
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
  }

  // Aplikuj úpravy
  Object.keys(adjustments).forEach(key => {
    baseStats[key] = baseStats[key] + adjustments[key]
  })

  // Bonusy za oblíbené údery (kromě 16, 17)
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
      baseStats[attr] += boostPerAttr
    })

    const otherAttrs = Object.keys(baseStats).filter(attr => !boostedAttrs.has(attr))
    const penaltyPerAttr = Math.ceil(totalBonus / otherAttrs.length)
    otherAttrs.forEach(attr => {
      baseStats[attr] -= penaltyPerAttr
    })
  }

  // Omezení (65-99)
  Object.keys(baseStats).forEach(key => {
    baseStats[key] = Math.max(65, Math.min(99, Math.round(baseStats[key])))
  })

  return baseStats
}

console.log('=== OPRAVA PROBLEMATICKÝCH HRÁČŮ ===\n')

// Seznam problematických hráčů z validace
const problematicPlayers = [
  { team: 'KVAR', name: 'Jan Vanke' },
  { team: 'KVAR', name: 'Michal Kokštein' },
  { team: 'KVAR', name: 'Karel Hron' },
  { team: 'KVAR', name: 'Tomáš Bíbr' },
  { team: 'KVAR', name: 'Lukáš Tolar' },
  { team: 'KVAR', name: 'Jakub Medek' },
  { team: 'VSET', name: 'Jan Chalupa' },
  { team: 'VSET', name: 'Martin Zbranek' },
  { team: 'VSET', name: 'Rastislav Tabaka' },
  { team: 'VSET', name: 'Jakub Halašta' },
  { team: 'VSET', name: 'Kryštof Ptáček' },
  { team: 'VSET', name: 'Matúš Rácik' },
  { team: 'VSET', name: 'Martin Tomek' }
]

// Oprava extraligy
for (const { team: teamId, name } of problematicPlayers) {
  const team = extraligaTeams.find(t => t.id === teamId)
  if (!team) continue

  const player = team.players.find(p => p.name === name)
  if (!player) continue

  const targetAvg = calculateTargetAverage(player, 85, 0)
  const newStats = calculateStatsForPosition(player.position, targetAvg, player.availableSkills || [])
  const actualAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9

  console.log(`✓ ${player.name} (${team.shortName})`)
  console.log(`  Cíl: ${targetAvg.toFixed(1)} | Nový: ${actualAvg.toFixed(1)}`)

  player.stats = newStats
}

// Uložení extraligy
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
console.log('\n✅ Extraliga opravena\n')

// Oprava Opavy
console.log('📋 OPRAVA NK OPAVA\n')

const opavaProblematic = [
  'Radim Bokisch', 'Ondřej Kurka', 'David Majštiník',
  'Jan Stařičný', 'Tomáš Volman', 'Radim Adámek',
  'Jakub Václavek', 'Jan Němčík'
]

for (const name of opavaProblematic) {
  const player = opavaPlayers.find(p => p.name === name)
  if (!player || !player.stats) continue

  const trainingBonus = player.trainingAttendance2025 ? (80 * player.trainingAttendance2025 / 100 * 0.05) : 0
  const targetAvg = calculateTargetAverage(player, 80, trainingBonus)
  const newStats = calculateStatsForPosition(player.position, targetAvg, player.availableSkills || [])
  const actualAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9

  console.log(`✓ ${player.name}`)
  console.log(`  Trénink: ${player.trainingAttendance2025}% (+${trainingBonus.toFixed(1)})`)
  console.log(`  Cíl: ${targetAvg.toFixed(1)} | Nový: ${actualAvg.toFixed(1)}`)

  player.stats = newStats
}

// Najít správnou část playerData.js se skills a players
const playerDataPath = './src/playerData.js'
const originalContent = fs.readFileSync(playerDataPath, 'utf-8')

// Najít začátek players array
const playersStart = originalContent.indexOf('export const players = [')
const beforePlayers = originalContent.substring(0, playersStart)

const playersContent = `export const players = ${JSON.stringify(opavaPlayers, null, 2)}\n`

fs.writeFileSync(playerDataPath, beforePlayers + playersContent, 'utf-8')
console.log('\n✅ Opava opravena')

console.log('\n=== HOTOVO ===')
