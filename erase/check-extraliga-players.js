import { players } from '../src/playerData.js'

console.log('=== KONTROLA HRÁČŮ EXTRALIGY ===\n')

let extraligaCount = 0

for (const player of players) {
  // Přeskočit trenéry
  if (!player.stats || player.position === 'Trenér') continue

  // Zkontrolovat, jestli má hráč zápasy v extralíze
  const hasExtraliga = player.seasonStats && player.seasonStats.some(s =>
    s.league && s.league.toLowerCase().includes('extraliga')
  )

  if (hasExtraliga) {
    const avg = Object.values(player.stats).reduce((a, b) => a + b, 0) / 9
    const latestLeague = player.seasonStats[0]?.league || 'N/A'

    extraligaCount++

    console.log(`${player.name}`)
    console.log(`  Aktuální liga: ${latestLeague}`)
    console.log(`  Průměrné hodnocení: ${avg.toFixed(1)}`)
    console.log(`  Očekávaný base rating: 85`)
    console.log(`  Výsledek: ${avg >= 85 ? '✓ OK' : '⚠️  MŮŽE BÝT PROBLÉM (pokud nemá nízkou úspěšnost)'}`)
    console.log('')
  }
}

if (extraligaCount === 0) {
  console.log('✓ V databázi nejsou žádní hráči extraligy')
} else {
  console.log(`\n=== CELKEM ${extraligaCount} hráčů z extraligy ===`)
}
