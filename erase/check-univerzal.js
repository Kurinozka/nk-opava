import { extraligaTeams } from '../src/extraligaTeams.js'

// Najít univerzály
const univerzalPlayers = []
for (const team of extraligaTeams) {
  for (const player of team.players) {
    if (player.position === 'Univerzál' && player.stats) {
      univerzalPlayers.push({
        name: player.name,
        team: team.shortName,
        stats: player.stats
      })
    }
  }
}

console.log(`=== UNIVERZÁLOVÉ (${univerzalPlayers.length} hráčů) ===\n`)

for (const p of univerzalPlayers.slice(0, 5)) { // Prvních 5
  const avg = Object.values(p.stats).reduce((a,b)=>a+b,0)/9
  const min = Math.min(...Object.values(p.stats))
  const max = Math.max(...Object.values(p.stats))

  console.log(`${p.name} (${p.team}):`)
  console.log(`  Průměr: ${avg.toFixed(1)}, Min: ${min}, Max: ${max}, Rozdíl: ${max-min}`)
  console.log(`  Technika: ${p.stats.technika}, Obrana: ${p.stats.obrana}, Rana: ${p.stats.rana}`)
  console.log()
}
