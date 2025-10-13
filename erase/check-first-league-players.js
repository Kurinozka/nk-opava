import { players } from '../src/playerData.js'

console.log('=== KONTROLA HRÁČŮ PRVNÍ LIGY ===\n')

const firstLeaguePlayers = []

for (const player of players) {
  // Přeskočit trenéry
  if (!player.stats || player.position === 'Trenér') continue

  // Zkontrolovat, jestli má hráč zápasy v 1. lize
  const has1stLeague = player.seasonStats && player.seasonStats.some(s =>
    s.league && (s.league.includes('1. liga') || s.league.includes('Extraliga'))
  )

  if (has1stLeague) {
    const avg = Object.values(player.stats).reduce((a, b) => a + b, 0) / 9
    const latestLeague = player.seasonStats[0]?.league || 'N/A'

    firstLeaguePlayers.push({
      name: player.name,
      avg: avg,
      latestLeague: latestLeague,
      team: player.team || 'NK Opava'
    })

    console.log(`${player.name}`)
    console.log(`  Aktuální tým/liga: ${latestLeague}`)
    console.log(`  Průměrné hodnocení: ${avg.toFixed(1)}`)
    console.log(`  Očekávaný base rating: ${latestLeague.includes('Extraliga') ? '85' : '80'}`)
    console.log('')
  }
}

console.log(`\n=== CELKEM ${firstLeaguePlayers.length} hráčů z 1. ligy/Extraligy ===`)
