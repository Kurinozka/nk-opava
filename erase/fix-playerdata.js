import { players } from '../src/playerData.js'
import fs from 'fs'

// Funkce pro detekci robotů (rozdíl mezi min a max < 3)
function isRobot(stats) {
  if (!stats) return false
  const values = Object.values(stats)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return (max - min) < 3
}

// Funkce pro výpočet průměru z reálných výsledků
function calculateAverageFromSeasonStats(player) {
  if (!player.seasonStats || player.seasonStats.length === 0) return null

  // Použít nejnovější sezónu (první v poli)
  const latestSeason = player.seasonStats[0]
  const winRate = latestSeason.winRate

  // Převést winRate na průměrné hodnocení (např. 70% winRate = 83 rating)
  // Vzorec: rating = 60 + (winRate * 0.35)
  // 0% winRate = 60 rating
  // 50% winRate = 77.5 rating
  // 100% winRate = 95 rating
  const rating = 60 + (winRate * 0.35)
  return rating
}

// Pozice adjustments (same as fix-all-players.js)
function getPositionAdjustments(position, playerIndex) {
  const adjustments = {}

  // Použijeme playerIndex pro vytvoření unikátních variací
  const seed = playerIndex || 0

  if (position === 'Blokař/Smečař' || position === 'Smečař/Blokař') {
    // Variace pro blokaře/smečaře
    const variations = [
      { rychlost: 3, obratnost: 2, rana: 3, technika: -3, obrana: 2, cteniHry: -3, vydrz: -2, obetavost: -1, psychickaOdolnost: -1 },
      { rychlost: 2, obratnost: 3, rana: 2, technika: -2, obrana: 3, cteniHry: -3, vydrz: -2, obetavost: -2, psychickaOdolnost: -1 },
      { rychlost: 3, obratnost: 1, rana: 4, technika: -3, obrana: 1, cteniHry: -2, vydrz: -3, obetavost: -1, psychickaOdolnost: 0 }
    ]
    const variation = variations[seed % variations.length]
    return variation
  } else if (position === 'Nahravač/Polař' || position === 'Polař/Nahravač') {
    adjustments.technika = 3
    adjustments.cteniHry = 3
    adjustments.obrana = 2
    adjustments.rana = -3
    adjustments.rychlost = -2
    adjustments.obratnost = -1
    adjustments.vydrz = -2
    adjustments.obetavost = 0
    adjustments.psychickaOdolnost = 0
  } else if (position === 'Polař/Smečař' || position === 'Smečař/Polař') {
    const variations = [
      { technika: 2, cteniHry: 2, obratnost: 2, rana: -2, rychlost: -1, obrana: 1, vydrz: -2, obetavost: -1, psychickaOdolnost: -1 },
      { technika: 2, cteniHry: 1, obratnost: 3, rana: -2, rychlost: -2, obrana: 1, vydrz: -1, obetavost: -1, psychickaOdolnost: -1 },
      { technika: 3, cteniHry: 2, obratnost: 1, rana: -3, rychlost: -1, obrana: 2, vydrz: -2, obetavost: -1, psychickaOdolnost: -1 }
    ]
    const variation = variations[seed % variations.length]
    return variation
  } else if (position === 'Univerzál') {
    adjustments.technika = 3
    adjustments.obrana = 3
    adjustments.cteniHry = 2
    adjustments.rana = -3
    adjustments.rychlost = -2
    adjustments.obratnost = -1
    adjustments.vydrz = -2
    adjustments.obetavost = 0
    adjustments.psychickaOdolnost = 0
  }

  return adjustments
}

let fixed = 0

console.log('=== FIX PLAYERDATA.JS ===\n')

for (let i = 0; i < players.length; i++) {
  const player = players[i]

  // Přeskočit trenéry
  if (!player.stats || player.position === 'Trenér') continue

  // Kontrola, zda je robot
  if (!isRobot(player.stats)) continue

  console.log(`\n🤖 Robot detekován: ${player.name} (${player.position})`)

  // Vypočítat cílový průměr
  const currentAvg = Object.values(player.stats).reduce((a, b) => a + b, 0) / 9
  let targetAvg = calculateAverageFromSeasonStats(player)

  if (!targetAvg) {
    targetAvg = currentAvg // Pokud nemáme seasonStats, ponechat současný průměr
  }

  console.log(`  Současný průměr: ${currentAvg.toFixed(1)}`)
  console.log(`  Cílový průměr: ${targetAvg.toFixed(1)}`)

  // Získat adjustmenty podle pozice (s indexem pro variaci)
  const adjustments = getPositionAdjustments(player.position, i)

  // Aplikovat adjustmenty
  const newStats = {}
  const statKeys = Object.keys(player.stats)

  for (const key of statKeys) {
    newStats[key] = currentAvg + (adjustments[key] || 0)
  }

  // Škálovat tak, aby průměr seděl
  const newAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9
  const scale = targetAvg / newAvg

  for (const key of statKeys) {
    newStats[key] = Math.round(newStats[key] * scale)
  }

  // Aktualizovat
  player.stats = newStats

  const finalAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9
  const min = Math.min(...Object.values(newStats))
  const max = Math.max(...Object.values(newStats))

  console.log(`  ✓ Opraveno! Nový průměr: ${finalAvg.toFixed(1)}, Rozdíl: ${max - min}`)
  fixed++
}

console.log(`\n=== HOTOVO ===`)
console.log(`Opraveno ${fixed} robotů`)

// Zapsat zpět do souboru
const fileContent = `export const skills = ${JSON.stringify({ /* zkráceno */ }, null, 2)}

// ... zbytek zůstane stejný, pouze upravíme hráče
export const players = ${JSON.stringify(players, null, 2)}`

console.log('\n⚠️  Script pouze detekoval roboty. Statistiky je třeba upravit ručně v playerData.js')
