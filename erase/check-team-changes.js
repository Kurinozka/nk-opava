import { players } from '../src/playerData.js'

console.log('=== KONTROLA ZMĚN TÝMŮ U HRÁČŮ ===\n')

for (const player of players) {
  // Přeskočit trenéry
  if (!player.stats || player.position === 'Trenér') continue

  if (!player.seasonStats || player.seasonStats.length === 0) continue

  // Seskupit podle roku a zkontrolovat různé týmy
  const seasons2025 = player.seasonStats.filter(s => s.season.includes('2025'))
  const seasons2024 = player.seasonStats.filter(s => s.season.includes('2024'))

  // Získat unikátní ligy
  const leagues2025 = [...new Set(seasons2025.map(s => s.league))]
  const leagues2024 = [...new Set(seasons2024.map(s => s.league))]

  // Zkontrolovat, jestli je rozdíl v ligách mezi roky
  const isSecondLeague2024 = leagues2024.some(l => l.includes('2. liga'))
  const isFirstLeague2025 = leagues2025.some(l => l.includes('1. liga'))

  if (isSecondLeague2024 && isFirstLeague2025) {
    console.log(`⚠️  ${player.name}`)
    console.log(`   2024: ${leagues2024.join(', ')}`)
    console.log(`   2025: ${leagues2025.join(', ')}`)
    console.log(`   MOŽNÁ změna týmu (2. liga → 1. liga)`)
    console.log('')
  }
}

// Speciální kontrola pro Davida Majštiníka
const majstinik = players.find(p => p.name === 'David Majštiník')
if (majstinik) {
  console.log('\n=== SPECIÁLNÍ KONTROLA: David Majštiník ===')
  console.log('David hrál v roce 2024 za Vsetín (ne Opavu)')
  console.log('Jeho sezóna 2024 by měla mít poznámku o týmu\n')
}

console.log('\n=== HOTOVO ===')
