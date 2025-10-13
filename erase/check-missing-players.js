// Script pro kontrolu chybějících hráčů v extralize
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

console.log('=== KONTROLA CHYBĚJÍCÍCH HRÁČŮ V EXTRALIZE ===\n')

// Vytvoř mapu všech hráčů v naší databázi podle ID
const ourPlayers = new Map()
for (const team of extraligaTeams) {
  for (const player of team.players) {
    if (player.coachQuotes) continue // Přeskoč trenéry

    // Extrahuj ID z photo URL
    const match = player.photo.match(/player_(\d+)\.jpg/)
    if (match) {
      const playerId = match[1]
      ourPlayers.set(playerId, {
        name: player.name,
        team: team.name,
        teamId: team.id
      })
    }
  }
}

console.log(`V naší databázi máme ${ourPlayers.size} hráčů\n`)

// Načti statistiky extraligy 2025
console.log('Načítám statistiky extraligy 2025...\n')
const html = await fetchHTML('https://www.nohejbal.org/soutez/statistiky/119-extraliga-muzi?stage=1&order=10&order_type=')
const dom = new JSDOM(html)
const doc = dom.window.document

// Najdi tabulku statistik
const table = doc.querySelector('table')
if (!table) {
  console.error('Tabulka statistik nebyla nalezena')
  process.exit(1)
}

const rows = table.querySelectorAll('tbody tr')
console.log(`Nalezeno ${rows.length} hráčů ve statistikách extraligy 2025\n`)

const missingPlayers = []
const webPlayers = []

for (const row of rows) {
  const cells = row.querySelectorAll('td')
  if (cells.length < 3) continue

  // Extrahuj data
  const nameCell = cells[0]
  const teamCell = cells[1]
  const matchesCell = cells[2]

  const nameLink = nameCell.querySelector('a')
  if (!nameLink) continue

  const name = nameLink.textContent.trim()
  const href = nameLink.getAttribute('href')
  const playerIdMatch = href.match(/\/hrac\/(\d+)/)
  if (!playerIdMatch) continue

  const playerId = playerIdMatch[1]
  const team = teamCell.textContent.trim()
  const matches = parseInt(matchesCell.textContent.trim() || '0')

  webPlayers.push({ playerId, name, team, matches })

  // Zkontroluj, zda je v naší databázi
  if (!ourPlayers.has(playerId)) {
    missingPlayers.push({ playerId, name, team, matches })
  }
}

console.log('=== CHYBĚJÍCÍ HRÁČI ===\n')

if (missingPlayers.length === 0) {
  console.log('✅ Všichni hráči jsou v databázi!\n')
} else {
  console.log(`❌ Chybí ${missingPlayers.length} hráčů:\n`)

  // Seřaď podle týmů
  missingPlayers.sort((a, b) => a.team.localeCompare(b.team))

  let currentTeam = ''
  for (const player of missingPlayers) {
    if (player.team !== currentTeam) {
      currentTeam = player.team
      console.log(`\n📋 ${currentTeam}:`)
    }
    console.log(`  - ${player.name} (ID: ${player.playerId}, ${player.matches} zápasů)`)
  }

  console.log(`\n\nCelkem chybí: ${missingPlayers.length} hráčů`)
  console.log(`Kritérium splňuje (5+ zápasů): ${missingPlayers.filter(p => p.matches >= 5).length} hráčů`)
}

// Zkontroluj také, zda v naší databázi nejsou hráči, kteří už nehrají
console.log('\n\n=== HRÁČI V NAŠÍ DATABÁZI, KTEŘÍ NEHRAJÍ V ROCE 2025 ===\n')
const webPlayerIds = new Set(webPlayers.map(p => p.playerId))
const notPlayingAnymore = []

for (const [playerId, playerInfo] of ourPlayers) {
  if (!webPlayerIds.has(playerId)) {
    notPlayingAnymore.push({ playerId, ...playerInfo })
  }
}

if (notPlayingAnymore.length === 0) {
  console.log('✅ Všichni hráči v databázi hrají v roce 2025\n')
} else {
  console.log(`⚠️  ${notPlayingAnymore.length} hráčů v databázi nehraje v roce 2025:\n`)
  for (const player of notPlayingAnymore) {
    console.log(`  - ${player.name} (${player.team}, ID: ${player.playerId})`)
  }
}
