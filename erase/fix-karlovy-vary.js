// Oprava parametrů hráčů Karlových Varů podle správného klíče
// Zajistí správný průměr podle win rate + pozice + oblíbené údery

const fixes = {
  "Jan Vanke": {
    target: 95.7,
    current: 90.9,
    position: "Smečař/Blokař",
    skills: [3, 12, 16, 17],
    newStats: {
      rychlost: 101, obratnost: 99, rana: 102, technika: 90,
      obetavost: 95, psychickaOdolnost: 91, obrana: 101,
      cteniHry: 90, vydrz: 92
    }
  },
  "Michal Kokštein": {
    target: 91,
    current: 87.7,
    position: "Nahravač/Polař",
    skills: [2, 4, 16, 17],
    newStats: {
      rychlost: 86, obratnost: 90, rana: 85, technika: 99,
      obetavost: 91, psychickaOdolnost: 91, obrana: 95,
      cteniHry: 95, vydrz: 87
    }
  },
  "Karel Hron": {
    target: 93.1,
    current: 83,
    position: "Polař/Smečař",
    skills: [7, 9, 16, 17],
    newStats: {
      rychlost: 89, obratnost: 92, rana: 90, technika: 100,
      obetavost: 93, psychickaOdolnost: 92, obrana: 97,
      cteniHry: 96, vydrz: 89
    }
  },
  "Tomáš Bíbr": {
    target: 81.9,
    current: 79,
    position: "Polař/Smečař",
    skills: [16, 17],
    newStats: {
      rychlost: 79, obratnost: 80, rana: 78, technika: 86,
      obetavost: 82, psychickaOdolnost: 82, obrana: 86,
      cteniHry: 85, vydrz: 79
    }
  },
  "Lukáš Tolar": {
    target: 93.8,
    current: 92,
    position: "Smečař/Polař",
    skills: [4, 5, 16, 17],
    newStats: {
      rychlost: 91, obratnost: 95, rana: 93, technika: 101,
      obetavost: 94, psychickaOdolnost: 93, obrana: 98,
      cteniHry: 96, vydrz: 93
    }
  },
  "Jakub Medek": {
    target: 85.8,
    current: 82.7,
    position: "Smečař/Blokář",
    skills: [3, 16, 17],
    newStats: {
      rychlost: 89, obratnost: 88, rana: 91, technika: 81,
      obetavost: 85, psychickaOdolnost: 81, obrana: 90,
      cteniHry: 81, vydrz: 87
    }
  }
}

console.log("Použij tyto opravy v extraligaTeams.js pro Karlovy Vary:\n")

for (const [name, data] of Object.entries(fixes)) {
  const avg = Object.values(data.newStats).reduce((a,b) => a+b, 0) / 9
  console.log(`${name}:`)
  console.log(`  Cíl: ${data.target} | Nový průměr: ${avg.toFixed(1)}`)
  console.log(`  stats: ${JSON.stringify(data.newStats)}`)
  console.log()
}
