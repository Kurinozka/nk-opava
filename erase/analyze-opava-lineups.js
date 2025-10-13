import { players } from '../src/playerData.js'

console.log('=== ANALÝZA SESTAV NK OPAVA ===\n')

// Najít hráče NK Opava
const opavaPlayers = players.filter(p =>
  p.seasonStats &&
  p.seasonStats.some(s => s.season.includes('2025')) &&
  p.position !== 'Trenér'
)

console.log(`Nalezeno ${opavaPlayers.length} hráčů NK Opava\n`)

// Analyzovat play off/out 2025
console.log('=== PLAY OFF/OUT 2025 ===')
opavaPlayers.forEach(p => {
  const playOffStats = p.seasonStats.find(s =>
    s.season.includes('2025') && s.season.toLowerCase().includes('play')
  )

  if (playOffStats && playOffStats.matches > 0) {
    console.log(`${p.name}:`)
    console.log(`  Celkem zápasů: ${playOffStats.matches}`)
    console.log(`  Singl: ${playOffStats.disciplines.singl.matches} zápasů`)
    console.log(`  Dvojice: ${playOffStats.disciplines.dvojice.matches} zápasů`)
    console.log(`  Trojice: ${playOffStats.disciplines.trojice.matches} zápasů`)
  }
})

// Analyzovat základní část 2025 (pro hráče bez play off/out)
console.log('\n=== ZÁKLADNÍ ČÁST 2025 ===')
opavaPlayers.forEach(p => {
  const basicStats = p.seasonStats.find(s =>
    s.season.includes('2025') && !s.season.toLowerCase().includes('play')
  )

  if (basicStats && basicStats.matches > 0) {
    console.log(`${p.name}:`)
    console.log(`  Celkem zápasů: ${basicStats.matches}`)
    console.log(`  Singl: ${basicStats.disciplines.singl.matches} zápasů`)
    console.log(`  Dvojice: ${basicStats.disciplines.dvojice.matches} zápasů`)
    console.log(`  Trojice: ${basicStats.disciplines.trojice.matches} zápasů`)
  }
})

// Doporučené sestavy na základě dat
console.log('\n=== DOPORUČENÍ ===')
console.log('Na základě počtu odehraných zápasů v jednotlivých disciplínách:')

// Singl - hráči s nejvíce singly v play off/out, pokud ne tak ze základní části
const singlCandidates = opavaPlayers.map(p => {
  const playOff = p.seasonStats.find(s =>
    s.season.includes('2025') && s.season.toLowerCase().includes('play')
  )
  const basic = p.seasonStats.find(s =>
    s.season.includes('2025') && !s.season.toLowerCase().includes('play')
  )

  const singlMatches = (playOff?.disciplines.singl.matches || 0) + (basic?.disciplines.singl.matches || 0)
  const playOffSingl = playOff?.disciplines.singl.matches || 0

  return {
    name: p.name,
    id: p.id,
    singlMatches,
    playOffSingl,
    source: playOffSingl > 0 ? 'play off/out' : 'základní část'
  }
}).filter(p => p.singlMatches > 0)
  .sort((a, b) => b.singlMatches - a.singlMatches)

console.log('\nSingl (podle počtu odehraných singlů):')
singlCandidates.slice(0, 3).forEach((p, i) => {
  console.log(`  ${i+1}. ${p.name} - ${p.singlMatches} zápasů (${p.source})`)
})

// Dvojice a trojice - potřebovali bychom data o konkrétních kombinacích
console.log('\n⚠️  Pro přesné dvojice a trojice potřebujeme data z nohejbal.org API')
console.log('    které obsahují informace o spoluhráčích v jednotlivých zápasech.')
