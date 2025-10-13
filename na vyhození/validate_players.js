const fs = require('fs');
const path = require('path');

// Načtu oba soubory
const playerDataPath = 'C:\\Users\\ASUS\\Desktop\\muj-web\\src\\playerData.js';
const extraligaTeamsPath = 'C:\\Users\\ASUS\\Desktop\\muj-web\\src\\extraligaTeams.js';

// Dynamicky importuju moduly
async function validatePlayers() {
  // Načtu soubory jako text a vyhodnotím je
  const playerDataContent = fs.readFileSync(playerDataPath, 'utf8');
  const extraligaTeamsContent = fs.readFileSync(extraligaTeamsPath, 'utf8');

  // Extrahuji players z playerData.js
  const playersMatch = playerDataContent.match(/export const players = \[([\s\S]*?)\];/);
  const playersJson = '[' + playersMatch[1] + ']';
  const players = eval(playersJson);

  // Extrahuji extraligaTeams
  const extraligaMatch = extraligaTeamsContent.match(/export const extraligaTeams = \[([\s\S]*?)\];$/m);
  const extraligaJson = '[' + extraligaMatch[1] + ']';
  const extraligaTeams = eval(extraligaJson);

  const errors = {
    disciplineSum: [],
    seasonOrder: [],
    dataValidity: [],
    other: []
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

  function validatePlayer(player, teamName = 'NK Opava') {
    if (!player.seasonStats || player.seasonStats.length === 0) {
      return; // Hráč bez statistik
    }

    // 1. Kontrola součtu disciplín
    player.seasonStats.forEach((season, idx) => {
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
        break; // Pouze jedna chyba na hráče
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

  // Validuji hráče z extraligových týmů
  extraligaTeams.forEach(team => {
    team.players.forEach(player => {
      if (player.position !== 'Trenér') {
        validatePlayer(player, team.name);
      }
    });
  });

  // Vytisknu výsledky
  console.log('=== VÝSLEDKY VALIDACE HRÁČŮ ===\n');

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
        console.log(`  Změnit matches z ${err.expected} na ${err.actual}`);
        console.log(`  NEBO upravit součet disciplín tak, aby byl ${err.expected}`);
      });
    }
  }

  return errors;
}

validatePlayers().catch(console.error);
