// Pomocný script pro opravu statistik hráčů
// Tento script pomůže identifikovat hráče s chybnými statistikami

import { extraligaTeams } from './src/extraligaTeams.js'

console.log('=== KONTROLA STATISTIK VŠECH HRÁČŮ ===\n')

let errorCount = 0
let playerCount = 0

extraligaTeams.forEach(teamData => {
  const teamName = teamData.name

  teamData.players.forEach(player => {
    if (!player.seasonStats) return
    playerCount++

    player.seasonStats.forEach(season => {
      if (!season.disciplines) return

      const { singl, dvojice, trojice } = season.disciplines
      const totalMatches = season.matches
      const totalWins = season.wins

      // Kontrola: součet disciplín by se měl rovnat celkovému počtu
      const disciplineMatchesSum = singl.matches + dvojice.matches + trojice.matches
      const disciplineWinsSum = singl.wins + dvojice.wins + trojice.wins

      if (disciplineMatchesSum !== totalMatches || disciplineWinsSum !== totalWins) {
        errorCount++
        console.log(`❌ ${player.name} (${teamName})`)
        console.log(`   Sezóna: ${season.season}`)
        console.log(`   Celkem: ${totalMatches} zápasů, ${totalWins} výher`)
        console.log(`   Singl: ${singl.matches}/${singl.wins}`)
        console.log(`   Dvojice: ${dvojice.matches}/${dvojice.wins}`)
        console.log(`   Trojice: ${trojice.matches}/${trojice.wins}`)
        console.log(`   Součet: ${disciplineMatchesSum} zápasů, ${disciplineWinsSum} výher`)
        console.log(`   URL: https://www.nohejbal.org/hrac/${player.photo.match(/player_(\d+)\.jpg/)?.[1] || 'unknown'}`)
        console.log()
      }
    })
  })
})

console.log(`\n=== SOUHRN ===`)
console.log(`Celkem hráčů: ${playerCount}`)
console.log(`Chyb nalezeno: ${errorCount}`)
console.log(`Správných hráčů: ${playerCount - errorCount}`)
