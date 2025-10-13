import { players } from '../src/playerData.js'
import fs from 'fs'

console.log('=== PŘEPOČET OPAVSKÝCH HRÁČŮ S TRÉNINKOVÝM BONUSEM ===\n')

// Funkce pro výpočet vážené úspěšnosti z reálných výsledků
function calculateWeightedWinRate(player) {
  if (!player.seasonStats || player.seasonStats.length === 0) return null

  // Sečíst všechny zápasy a výhry z roku 2025 (včetně play off/out)
  let wins2025 = 0
  let matches2025 = 0

  // Sečíst všechny zápasy a výhry z roku 2024 (včetně play off/out)
  let wins2024 = 0
  let matches2024 = 0

  for (const season of player.seasonStats) {
    if (season.season.includes('2025')) {
      wins2025 += season.wins
      matches2025 += season.matches
    } else if (season.season.includes('2024')) {
      wins2024 += season.wins
      matches2024 += season.matches
    }
  }

  // Pokud nemáme žádná data, vrátit null
  if (matches2025 === 0 && matches2024 === 0) return null

  // Vypočítat úspěšnost pro každý rok
  const winRate2025 = matches2025 > 0 ? (wins2025 / matches2025) * 100 : 0
  const winRate2024 = matches2024 > 0 ? (wins2024 / matches2024) * 100 : 0

  // Vážená úspěšnost závisí na počtu zápasů v roce 2025
  let weightedWinRate
  if (matches2025 > 0 && matches2024 > 0) {
    // Pokud hráč odehrál v 2025 alespoň 10 zápasů, použít dvojnásobnou váhu
    if (matches2025 >= 10) {
      // (winRate2025 * 2 + winRate2024) / 3
      weightedWinRate = (winRate2025 * 2 + winRate2024) / 3
    } else {
      // Méně než 10 zápasů v 2025 -> stejná váha pro oba roky
      // (winRate2025 + winRate2024) / 2
      weightedWinRate = (winRate2025 + winRate2024) / 2
    }
  } else if (matches2025 > 0) {
    // Pouze data z 2025
    weightedWinRate = winRate2025
  } else {
    // Pouze data z 2024
    weightedWinRate = winRate2024
  }

  return weightedWinRate
}

// Funkce pro výpočet základního ratingu na základě vážené úspěšnosti
function calculateBaseRating(weightedWinRate, teamLeague = '1. liga') {
  // Základní rating podle ligy týmu (ne hráče!)
  // NK Opava hraje v 1. lize -> základní rating 80
  let baseRating
  if (teamLeague === 'Extraliga' || teamLeague.includes('Extraliga')) {
    baseRating = 85 // Extraliga
  } else if (teamLeague === '1. liga' || teamLeague.includes('1. liga')) {
    baseRating = 80 // První liga
  } else {
    baseRating = 75 // Druhá liga a níže
  }

  if (weightedWinRate === null) return baseRating // Defaultní hodnota

  if (weightedWinRate > 50) {
    // Zvýšení o 1-15% podle úspěšnosti nad 50%
    // 50.01% -> 1% zvýšení, 100% -> 15% zvýšení
    const increasePercent = 1 + ((weightedWinRate - 50) / 50) * 14
    return baseRating * (1 + increasePercent / 100)
  } else if (weightedWinRate < 50) {
    // Snížení o 1-15% podle úspěšnosti pod 50%
    // 49.99% -> 1% snížení, 0% -> 15% snížení
    const decreasePercent = 1 + ((50 - weightedWinRate) / 50) * 14
    return baseRating * (1 - decreasePercent / 100)
  } else {
    // Přesně 50% = žádná změna
    return baseRating
  }
}

// Pozice adjustments
function getPositionAdjustments(position) {
  const adjustments = {}

  if (position === 'Blokař/Smečař' || position === 'Smečař/Blokař') {
    adjustments.rychlost = 3
    adjustments.obratnost = 2
    adjustments.rana = 3
    adjustments.technika = -3
    adjustments.obrana = 2
    adjustments.cteniHry = -3
    adjustments.vydrz = -2
    adjustments.obetavost = -1
    adjustments.psychickaOdolnost = -1
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
    adjustments.technika = 2
    adjustments.cteniHry = 2
    adjustments.obratnost = 2
    adjustments.rana = -2
    adjustments.rychlost = -1
    adjustments.obrana = 1
    adjustments.vydrz = -2
    adjustments.obetavost = -1
    adjustments.psychickaOdolnost = -1
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

// Funkce pro přidání tréninkového bonusu
function applyTrainingBonus(stats, trainingAttendance) {
  if (!trainingAttendance || trainingAttendance === 0) {
    return stats // Žádný bonus
  }

  // Bonus podle docházky:
  // 100% = +2 body ke všem parametrům
  // 50% = +1 bod ke všem parametrům
  // 25% = +0.5 bodu (zaokrouhleno)
  const bonusMultiplier = trainingAttendance / 50 // 100% -> 2, 50% -> 1, 25% -> 0.5

  const boostedStats = {}
  for (const [key, value] of Object.entries(stats)) {
    boostedStats[key] = Math.round(value + bonusMultiplier)
  }

  return boostedStats
}

let recalculated = 0

for (const player of players) {
  // Přeskočit trenéry
  if (!player.stats || player.position === 'Trenér') continue

  console.log(`\n📊 ${player.name} (${player.position})`)
  console.log(`   Docházka na tréninky: ${player.trainingAttendance2025 || 0}%`)

  const oldStats = { ...player.stats }
  const oldAvg = Object.values(oldStats).reduce((a, b) => a + b, 0) / 9

  // Spočítat celkový počet zápasů v roce 2025
  let matches2025Total = 0
  if (player.seasonStats) {
    for (const season of player.seasonStats) {
      if (season.season.includes('2025')) {
        matches2025Total += season.matches
      }
    }
  }

  // Vypočítat váženou úspěšnost
  const weightedWinRate = calculateWeightedWinRate(player)

  if (weightedWinRate !== null) {
    const weightType = matches2025Total >= 10 ? '2:1 (≥10 zápasů v 2025)' : '1:1 (<10 zápasů v 2025)'
    console.log(`   Vážená úspěšnost: ${weightedWinRate.toFixed(1)}% (váha ${weightType})`)
  }

  // Vypočítat základní rating na základě vážené úspěšnosti
  // NK Opava hraje v 1. lize -> základní rating 80
  let baseTargetAvg = calculateBaseRating(weightedWinRate, '1. liga')

  if (!weightedWinRate) {
    baseTargetAvg = oldAvg
  }

  console.log(`   Základní cílový rating: ${baseTargetAvg.toFixed(1)} (liga týmu: 1. liga)`)

  // Získat pozice adjustmenty
  const adjustments = getPositionAdjustments(player.position)

  // Aplikovat pozice adjustmenty
  const newStats = {}
  const statKeys = Object.keys(player.stats)

  for (const key of statKeys) {
    newStats[key] = baseTargetAvg + (adjustments[key] || 0)
  }

  // Škálovat tak, aby průměr seděl
  let newAvg = Object.values(newStats).reduce((a, b) => a + b, 0) / 9
  const scale = baseTargetAvg / newAvg

  for (const key of statKeys) {
    newStats[key] = Math.round(newStats[key] * scale)
  }

  // APLIKOVAT TRÉNINKOVÝ BONUS
  const finalStats = applyTrainingBonus(newStats, player.trainingAttendance2025)

  // Aktualizovat hráče
  player.stats = finalStats

  const finalAvg = Object.values(finalStats).reduce((a, b) => a + b, 0) / 9
  const min = Math.min(...Object.values(finalStats))
  const max = Math.max(...Object.values(finalStats))

  const trainingBonus = player.trainingAttendance2025 ? (player.trainingAttendance2025 / 50) : 0

  console.log(`   ✓ Přepočteno!`)
  console.log(`   Starý průměr: ${oldAvg.toFixed(1)} → Nový: ${finalAvg.toFixed(1)} (bonus +${trainingBonus.toFixed(1)})`)
  console.log(`   Min: ${min}, Max: ${max}, Rozdíl: ${max - min}`)

  recalculated++
}

console.log(`\n=== HOTOVO ===`)
console.log(`Přepočteno ${recalculated} hráčů`)
console.log('\n=== NOVÉ STATISTIKY PRO PLAYERDATA.JS ===\n')

players.forEach(p => {
  if (p.stats && p.position !== 'Trenér') {
    console.log(`${p.name}:`)
    console.log(JSON.stringify(p.stats, null, 2))
    console.log('')
  }
})
