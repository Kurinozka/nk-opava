import { players } from '../src/playerData.js'

console.log('=== VŠICHNI HRÁČI V DATABÁZI ===\n')

for (const player of players) {
  console.log(`${player.id}. ${player.name} - ${player.position}`)

  if (player.seasonStats && player.seasonStats.length > 0) {
    const latestSeason = player.seasonStats[0]
    console.log(`   Poslední sezóna: ${latestSeason.season} (${latestSeason.league})`)

    // Zkontrolovat všechny sezóny
    const allLeagues = [...new Set(player.seasonStats.map(s => s.league))]
    console.log(`   Všechny ligy: ${allLeagues.join(', ')}`)
  } else {
    console.log(`   Žádné statistiky`)
  }

  if (player.stats) {
    const avg = Object.values(player.stats).reduce((a, b) => a + b, 0) / 9
    console.log(`   Průměr: ${avg.toFixed(1)}`)
  }

  console.log('')
}

console.log(`\n=== CELKEM ${players.length} hráčů ===`)
