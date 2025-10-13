// Automatická oprava statistik všech hráčů extraligy
import { extraligaTeams } from './src/extraligaTeams.js'
import https from 'https'
import { JSDOM } from 'jsdom'

// Funkce pro načtení HTML ze stránky
async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// Funkce pro extrakci statistik ze stránky hráče
async function getPlayerStats(playerId) {
  try {
    const html = await fetchHTML(`https://www.nohejbal.org/hrac/${playerId}`)
    const dom = new JSDOM(html)
    const doc = dom.window.document

    const stats = []
    const tables = doc.querySelectorAll('table')

    for (const table of tables) {
      const rows = table.querySelectorAll('tr')
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td')
        if (cells.length >= 10) {
          const season = cells[0]?.textContent?.trim()
          const league = cells[1]?.textContent?.trim()
          const Z = parseInt(cells[2]?.textContent?.trim() || '0')
          const ZV = parseInt(cells[3]?.textContent?.trim() || '0')
          const S = parseInt(cells[4]?.textContent?.trim() || '0')
          const SV = parseInt(cells[5]?.textContent?.trim() || '0')
          const D = parseInt(cells[6]?.textContent?.trim() || '0')
          const DV = parseInt(cells[7]?.textContent?.trim() || '0')
          const T = parseInt(cells[8]?.textContent?.trim() || '0')
          const TV = parseInt(cells[9]?.textContent?.trim() || '0')

          if (season && league) {
            stats.push({ season, league, Z, ZV, S, SV, D, DV, T, TV })
          }
        }
      }
    }

    return stats
  } catch (error) {
    console.error(`Chyba při načítání hráče ${playerId}:`, error.message)
    return []
  }
}

// Hlavní funkce
async function main() {
  console.log('=== AUTOMATICKÁ KONTROLA A OPRAVA STATISTIK ===\n')

  let totalPlayers = 0
  let playersWithErrors = 0
  let playersToFix = []

  for (const team of extraligaTeams) {
    console.log(`\n📋 Tým: ${team.name}`)

    for (const player of team.players) {
      if (!player.seasonStats || player.coachQuotes) continue

      totalPlayers++

      // Extrahuj player ID z photo URL
      const match = player.photo.match(/player_(\d+)\.jpg/)
      if (!match) {
        console.log(`  ⚠️  ${player.name} - nelze extrahovat ID z foto`)
        continue
      }

      const playerId = match[1]
      console.log(`  🔍 ${player.name} (ID: ${playerId})...`)

      // Načti statistiky z webu
      const webStats = await getPlayerStats(playerId)

      if (webStats.length === 0) {
        console.log(`    ❌ Nelze načíst statistiky`)
        continue
      }

      // Porovnej s aktuálními daty
      let hasError = false

      for (const seasonData of player.seasonStats) {
        const webSeason = webStats.find(ws =>
          ws.season.includes(seasonData.season.split(' - ')[0]) &&
          ws.league.includes(seasonData.league.split(' ')[0])
        )

        if (!webSeason) continue

        const { disciplines } = seasonData

        // Kontrola správnosti
        if (disciplines.singl.matches !== webSeason.S ||
            disciplines.singl.wins !== webSeason.SV ||
            disciplines.dvojice.matches !== webSeason.D ||
            disciplines.dvojice.wins !== webSeason.DV ||
            disciplines.trojice.matches !== webSeason.T ||
            disciplines.trojice.wins !== webSeason.TV) {
          hasError = true
          break
        }
      }

      if (hasError) {
        playersWithErrors++
        playersToFix.push({ team: team.name, player: player.name, id: playerId })
        console.log(`    ❌ CHYBA v statistikách`)
      } else {
        console.log(`    ✅ OK`)
      }

      // Pauza mezi requesty
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('\n\n=== SOUHRN ===')
  console.log(`Celkem hráčů: ${totalPlayers}`)
  console.log(`Hráčů s chybami: ${playersWithErrors}`)
  console.log(`Správných hráčů: ${totalPlayers - playersWithErrors}`)

  if (playersToFix.length > 0) {
    console.log('\n=== HRÁČI K OPRAVĚ ===')
    playersToFix.forEach(p => {
      console.log(`- ${p.player} (${p.team}) - ID ${p.id}`)
    })
  }
}

main().catch(console.error)
