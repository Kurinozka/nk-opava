const fs = require('fs');

// Načtu soubory
const playerDataPath = 'C:\\Users\\ASUS\\Desktop\\muj-web\\src\\playerData.js';
const extraligaTeamsPath = 'C:\\Users\\ASUS\\Desktop\\muj-web\\src\\extraligaTeams.js';

// Pro NK Opava - načtu přímo export
delete require.cache[require.resolve(playerDataPath)];
const { players } = require(playerDataPath);

// Pro extraligu - načtu textově a ručně parsuji, protože může být příliš velký
const extraligaContent = fs.readFileSync(extraligaTeamsPath, 'utf8');

// Najdu všechny players array v extraligaTeams
function extractExtraligaPlayers() {
  const allPlayers = [];
  const teamRegex = /{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*shortName:[^,]+,\s*logo:[^,]+,\s*players:\s*\[/g;
  const teams = [];

  let match;
  let lastIndex = 0;
  while ((match = teamRegex.exec(extraligaContent)) !== null) {
    teams.push({
      id: match[1],
      name: match[2],
      startIndex: match.index
    });
  }

  // Pro každý tým najdu jeho hráče
  teams.forEach((team, idx) => {
    const startIdx = team.startIndex;
    const endIdx = idx < teams.length - 1 ? teams[idx + 1].startIndex : extraligaContent.length;
    const teamSection = extraligaContent.substring(startIdx, endIdx);

    // Najdu sekci players
    const playersStart = teamSection.indexOf('players: [');
    if (playersStart === -1) return;

    // Najdu konec players array - hledám odpovídající ]
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    let playersEnd = -1;

    for (let i = playersStart + 9; i < teamSection.length; i++) {
      const char = teamSection[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '[') depth++;
      if (char === ']') {
        if (depth === 0) {
          playersEnd = i;
          break;
        }
        depth--;
      }
    }

    if (playersEnd === -1) return;

    const playersSection = teamSection.substring(playersStart, playersEnd + 1);

    // Extrahuji jednotlivé hráče pomocí regex
    const playerMatches = playersSection.matchAll(/{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[\s\S]*?(?=(?:{\s*id:|$))/g);

    for (const playerMatch of playerMatches) {
      const playerText = playerMatch[0];
      const playerId = playerMatch[1];
      const playerName = playerMatch[2];

      // Kontrola, zda není trenér
      if (playerText.includes('position: "Trenér"') || playerText.includes("position: 'Trenér'")) {
        continue;
      }

      // Najdi seasonStats
      const seasonStatsMatch = playerText.match(/seasonStats:\s*\[([\s\S]*?)\]/);
      if (!seasonStatsMatch) continue;

      const seasonStatsText = seasonStatsMatch[0];
      const seasons = [];

      // Extrahuji jednotlivé sezóny
      const seasonMatches = seasonStatsText.matchAll(/{\s*season:\s*"([^"]+)",[\s\S]*?disciplines:\s*{([\s\S]*?)}/g);

      for (const seasonMatch of seasonMatches) {
        const seasonName = seasonMatch[1];
        const seasonText = seasonMatch[0];
        const disciplinesText = seasonMatch[2];

        // Extrahuji matches
        const matchesMatch = seasonText.match(/matches:\s*(\d+)/);
        const matches = matchesMatch ? parseInt(matchesMatch[1]) : 0;

        // Extrahuji disciplíny
        const singlMatch = disciplinesText.match(/singl:\s*{\s*matches:\s*(\d+),\s*wins:\s*(\d+)/);
        const dvojiceMatch = disciplinesText.match(/dvojice:\s*{\s*matches:\s*(\d+),\s*wins:\s*(\d+)/);
        const trojiceMatch = disciplinesText.match(/trojice:\s*{\s*matches:\s*(\d+),\s*wins:\s*(\d+)/);

        seasons.push({
          season: seasonName,
          matches: matches,
          disciplines: {
            singl: singlMatch ? { matches: parseInt(singlMatch[1]), wins: parseInt(singlMatch[2]) } : { matches: 0, wins: 0 },
            dvojice: dvojiceMatch ? { matches: parseInt(dvojiceMatch[1]), wins: parseInt(dvojiceMatch[2]) } : { matches: 0, wins: 0 },
            trojice: trojiceMatch ? { matches: parseInt(trojiceMatch[1]), wins: parseInt(trojiceMatch[2]) } : { matches: 0, wins: 0 }
          }
        });
      }

      if (seasons.length > 0) {
        allPlayers.push({
          name: playerName,
          team: team.name,
          seasonStats: seasons
        });
      }
    }
  });

  return allPlayers;
}

const extraligaPlayers = extractExtraligaPlayers();

const errors = {
  disciplineSum: [],
  seasonOrder: [],
  dataValidity: []
};

// Očekávané pořadí sezón
const expectedSeasonOrder = [
  "2024/2025 Play Out",
  "2024/2025 Play Off",
  "2024/2025",
  "2025",
  "2024 Play-off",
  "2024 Play Out",
  "2024"
];

function getSeasonPriority(season) {
  const index = expectedSeasonOrder.indexOf(season);
  return index === -1 ? 999 : index;
}

function validatePlayer(player, teamName) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    return;
  }

  // 1. Kontrola součtu disciplín
  player.seasonStats.forEach((season) => {
    const { season: seasonName, matches, disciplines } = season;
    const singlMatches = disciplines.singl?.matches || 0;
    const dvojiceMatches = disciplines.dvojice?.matches || 0;
    const trojiceMatches = disciplines.trojice?.matches || 0;
    const sum = singlMatches + dvojiceMatches + trojiceMatches;

    if (sum !== matches) {
      errors.disciplineSum.push({
        player: player.name,
        team: teamName,
        season: seasonName,
        expected: matches,
        actual: sum,
        details: {
          singl: singlMatches,
          dvojice: dvojiceMatches,
          trojice: trojiceMatches
        }
      });
    }
  });

  // 2. Kontrola řazení sezón
  for (let i = 0; i < player.seasonStats.length - 1; i++) {
    const currentSeason = player.seasonStats[i].season;
    const nextSeason = player.seasonStats[i + 1].season;
    const currentPriority = getSeasonPriority(currentSeason);
    const nextPriority = getSeasonPriority(nextSeason);

    if (currentPriority > nextPriority) {
      errors.seasonOrder.push({
        player: player.name,
        team: teamName,
        issue: `Špatné pořadí: "${currentSeason}" by mělo být po "${nextSeason}"`,
        currentOrder: player.seasonStats.map(s => s.season)
      });
      break;
    }
  }

  // 3. Kontrola správnosti dat disciplín
  player.seasonStats.forEach((season) => {
    const { season: seasonName, disciplines } = season;

    ['singl', 'dvojice', 'trojice'].forEach(discipline => {
      const disc = disciplines[discipline];
      if (disc && disc.wins > disc.matches) {
        errors.dataValidity.push({
          player: player.name,
          team: teamName,
          season: seasonName,
          discipline,
          issue: `wins (${disc.wins}) > matches (${disc.matches})`
        });
      }
    });
  });
}

// Validuji hráče z NK Opava
players.forEach(player => {
  if (player.position !== 'Trenér') {
    validatePlayer(player, 'NK Opava');
  }
});

// Validuji hráče z extraligy
extraligaPlayers.forEach(player => {
  validatePlayer(player, player.team);
});

// Vytisknu výsledky
console.log('=== VÝSLEDKY VALIDACE HRÁČŮ ===\n');
console.log(`Zkontrolováno hráčů z NK Opava: ${players.filter(p => p.position !== 'Trenér').length}`);
console.log(`Zkontrolováno hráčů z extraligy: ${extraligaPlayers.length}`);
console.log(`Celkem zkontrolováno: ${players.filter(p => p.position !== 'Trenér').length + extraligaPlayers.length}\n`);

if (errors.disciplineSum.length > 0) {
  console.log('1. CHYBY V SOUČTU DISCIPLÍN:');
  console.log('─'.repeat(80));
  errors.disciplineSum.forEach(err => {
    console.log(`\nHráč: ${err.player} (${err.team})`);
    console.log(`Sezóna: ${err.season}`);
    console.log(`Očekávaný počet zápasů: ${err.expected}`);
    console.log(`Skutečný součet: ${err.actual} (singl: ${err.details.singl}, dvojice: ${err.details.dvojice}, trojice: ${err.details.trojice})`);
    console.log(`Rozdíl: ${err.actual - err.expected}`);
  });
  console.log('\n' + '─'.repeat(80));
  console.log(`Celkem chyb: ${errors.disciplineSum.length}\n`);
} else {
  console.log('1. CHYBY V SOUČTU DISCIPLÍN: Žádné chyby nenalezeny ✓\n');
}

if (errors.seasonOrder.length > 0) {
  console.log('2. CHYBY V ŘAZENÍ SEZÓN:');
  console.log('─'.repeat(80));
  errors.seasonOrder.forEach(err => {
    console.log(`\nHráč: ${err.player} (${err.team})`);
    console.log(`Problém: ${err.issue}`);
    console.log(`Aktuální pořadí: ${err.currentOrder.join(' → ')}`);
  });
  console.log('\n' + '─'.repeat(80));
  console.log(`Celkem chyb: ${errors.seasonOrder.length}\n`);
} else {
  console.log('2. CHYBY V ŘAZENÍ SEZÓN: Žádné chyby nenalezeny ✓\n');
}

if (errors.dataValidity.length > 0) {
  console.log('3. CHYBY VE SPRÁVNOSTI DAT DISCIPLÍN:');
  console.log('─'.repeat(80));
  errors.dataValidity.forEach(err => {
    console.log(`\nHráč: ${err.player} (${err.team})`);
    console.log(`Sezóna: ${err.season}`);
    console.log(`Disciplína: ${err.discipline}`);
    console.log(`Problém: ${err.issue}`);
  });
  console.log('\n' + '─'.repeat(80));
  console.log(`Celkem chyb: ${errors.dataValidity.length}\n`);
} else {
  console.log('3. CHYBY VE SPRÁVNOSTI DAT DISCIPLÍN: Žádné chyby nenalezeny ✓\n');
}

// Shrnutí
const totalErrors = errors.disciplineSum.length + errors.seasonOrder.length + errors.dataValidity.length;
console.log('=== SHRNUTÍ ===');
console.log(`Celkový počet nalezených chyb: ${totalErrors}`);

if (totalErrors > 0) {
  console.log('\n=== NÁVRHY OPRAV ===\n');

  // Návrhy oprav pro součet disciplín
  if (errors.disciplineSum.length > 0) {
    console.log('OPRAVY SOUČTU DISCIPLÍN:');
    errors.disciplineSum.forEach(err => {
      console.log(`\n${err.player} (${err.team}) - ${err.season}:`);
      if (err.actual > err.expected) {
        console.log(`  ✓ DOPORUČENÍ: Změnit "matches" z ${err.expected} na ${err.actual}`);
      } else {
        console.log(`  ✓ DOPORUČENÍ: Zkontrolovat disciplíny - součet je ${err.actual}, ale mělo by být ${err.expected}`);
        console.log(`    Chybí ${err.expected - err.actual} zápasů`);
      }
    });
  }

  if (errors.seasonOrder.length > 0) {
    console.log('\n\nOPRAVY ŘAZENÍ SEZÓN:');
    errors.seasonOrder.forEach(err => {
      const sortedSeasons = [...err.currentOrder].sort((a, b) =>
        getSeasonPriority(a) - getSeasonPriority(b)
      );
      console.log(`\n${err.player} (${err.team}):`);
      console.log(`  Aktuální: ${err.currentOrder.join(' → ')}`);
      console.log(`  ✓ SPRÁVNÉ: ${sortedSeasons.join(' → ')}`);
    });
  }
}
