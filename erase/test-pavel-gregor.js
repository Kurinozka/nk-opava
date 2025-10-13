// Test výpočtu pro Pavla Gregora
const player = {
  seasonStats: [
    {season:'2025 Play-off/out', matches:2, winRate:50},
    {season:'2025 - základní část', matches:25, winRate:32},
    {season:'2024 Play-off/out', matches:2, winRate:50},
    {season:'2024 - základní část', matches:1, winRate:100}
  ]
}

let wr2025 = null, wr2024 = null

for(const s of player.seasonStats){
  if(s.season.includes('2025') || s.season.includes('2024/2025')){
    if(!wr2025 || s.matches > 5) {
      console.log(`Setting wr2025 to ${s.winRate}% from season ${s.season} (${s.matches} matches)`)
      wr2025 = s.winRate
    } else {
      console.log(`Skipping ${s.season} (${s.matches} matches, wr2025 already set)`)
    }
  } else if(s.season.includes('2024') && !s.season.includes('2025') && !s.season.includes('2024/2025')){
    if(!wr2024 || s.matches > 5) {
      console.log(`Setting wr2024 to ${s.winRate}% from season ${s.season} (${s.matches} matches)`)
      wr2024 = s.winRate
    } else {
      console.log(`Skipping ${s.season} (${s.matches} matches, wr2024 already set)`)
    }
  }
}

const wWR = (2*wr2025 + wr2024)/3
const adj = wWR >= 50 ? ((wWR-50)/50)*15 : -((50-wWR)/50)*15
const target = 85*(1+adj/100)

console.log('\nVýsledek:')
console.log(`wr2025: ${wr2025}%`)
console.log(`wr2024: ${wr2024}%`)
console.log(`Vážený WR: ${wWR.toFixed(1)}%`)
console.log(`Úprava: ${adj.toFixed(1)}%`)
console.log(`Cílový rating: ${target.toFixed(1)}`)
