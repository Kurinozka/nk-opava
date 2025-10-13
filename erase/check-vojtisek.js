import { extraligaTeams } from '../src/extraligaTeams.js'

const player = extraligaTeams.find(t => t.id === 'CELA').players.find(p => p.name === 'Marek Vojtíšek')

console.log('Marek Vojtíšek:')
console.log('Pozice:', player.position)
console.log('Stats:')
Object.entries(player.stats).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

const avg = Object.values(player.stats).reduce((a, b) => a + b, 0) / 9
const min = Math.min(...Object.values(player.stats))
const max = Math.max(...Object.values(player.stats))

console.log('\nPrůměr:', avg.toFixed(1))
console.log('Min:', min, 'Max:', max)
console.log('Rozdíl:', max - min)
console.log('Je robot:', (max - min) < 3)
