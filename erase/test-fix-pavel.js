// Test opravy Pavla Gregora
import { extraligaTeams } from '../src/extraligaTeams.js'

const player = extraligaTeams.find(t => t.id === 'KVAR').players.find(p => p.name === 'Pavel Gregor')

console.log('Pavel Gregor - aktuální stav:')
console.log('Pozice:', player.position)
console.log('Skills:', player.availableSkills)
console.log('Stats:', player.stats)
console.log('Průměr:', Object.values(player.stats).reduce((a,b)=>a+b,0)/9)

// Výpočet cílového průměru
let wr2025 = null, wr2024 = null
for (const season of player.seasonStats) {
  if (season.season.includes('2025') || season.season.includes('2024/2025')) {
    if (!wr2025 || season.matches > 5) wr2025 = season.winRate
  } else if (season.season.includes('2024') && !season.season.includes('2025') && !season.season.includes('2024/2025')) {
    if (!wr2024 || season.matches > 5) wr2024 = season.winRate
  }
}

const weightedWR = (2 * wr2025 + wr2024) / 3
const adjustment = weightedWR >= 50 ? ((weightedWR - 50) / 50) * 15 : -((50 - weightedWR) / 50) * 15
const targetAvg = Math.round(85 * (1 + adjustment / 100) * 10) / 10

console.log('\nCílový průměr:', targetAvg)
console.log('WR 2025:', wr2025)
console.log('WR 2024:', wr2024)
console.log('Weighted WR:', weightedWR.toFixed(1))

// Zkusit přepočítat stats
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

// Pro Univerzály nejsou žádné adjustmenty
console.log('\nNové stats (měly by být všechny =', targetAvg, '):')
Object.keys(baseStats).forEach(key => {
  baseStats[key] = Math.max(65, Math.min(99, Math.round(baseStats[key])))
  console.log(`  ${key}: ${baseStats[key]}`)
})

const newAvg = Object.values(baseStats).reduce((a,b)=>a+b,0)/9
console.log('\nNový průměr:', newAvg)
console.log('Rozdíl od cíle:', Math.abs(newAvg - targetAvg))
