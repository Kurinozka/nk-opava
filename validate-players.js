import { extraligaTeams } from './src/extraligaTeams.js'

console.log('=== VALIDACE HRÁČSKÝCH STATISTIK ===\n')

let foundIssues = false

extraligaTeams.forEach(teamData => {
  const teamName = teamData.name

  teamData.players.forEach(player => {
    if (!player.seasonStats) return

    player.seasonStats.forEach(season => {
      if (!season.disciplines) return

      const { singl, dvojice, trojice } = season.disciplines
      const totalMatches = season.matches
      const totalWins = season.wins

      const disciplineMatchesSum = singl.matches + dvojice.matches + trojice.matches
      const disciplineWinsSum = singl.wins + dvojice.wins + trojice.wins

      // Kontrola 1: Součet disciplín musí být roven celkovému počtu
      if (disciplineMatchesSum !== totalMatches || disciplineWinsSum !== totalWins) {
        foundIssues = true
        console.log(`❌ ${player.name} (${teamName}) - ${season.season}`)
        console.log(`   Celkem: ${totalMatches} zápasů, ${totalWins} výher`)
        console.log(`   Singl: ${singl.matches}/${singl.wins}`)
        console.log(`   Dvojice: ${dvojice.matches}/${dvojice.wins}`)
        console.log(`   Trojice: ${trojice.matches}/${trojice.wins}`)
        console.log(`   Součet: ${disciplineMatchesSum} zápasů, ${disciplineWinsSum} výher`)
        console.log(`   ROZDÍL: ${totalMatches - disciplineMatchesSum} zápasů, ${totalWins - disciplineWinsSum} výher\n`)
      }

      // Kontrola 2: Singl má stejné hodnoty jako celkem (pravděpodobně chyba jako u Jana Vaňkeho)
      if (singl.matches === totalMatches && singl.wins === totalWins && totalMatches > 0) {
        foundIssues = true
        console.log(`⚠️  PODEZŘELÉ: ${player.name} (${teamName}) - ${season.season}`)
        console.log(`   Singl má STEJNÉ hodnoty jako celkem: ${singl.matches}/${singl.wins}`)
        console.log(`   Pravděpodobně chyba - singl obsahuje celkové statistiky!\n`)
      }
    })
  })
})

if (!foundIssues) {
  console.log('✅ Všechny statistiky jsou v pořádku!')
} else {
  console.log('\n=== Nalezeny problémy ve statistikách ===')
}
