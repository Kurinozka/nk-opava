const fs = require('fs');
const content = fs.readFileSync('C:/Users/ASUS/Desktop/muj-web/src/extraligaTeams.js', 'utf8');

const match = content.match(/export const extraligaTeams = (\[[\s\S]*\]);?$/m);
if (!match) {
  console.log('Could not find extraligaTeams array');
  process.exit(1);
}

let extraligaTeams;
try {
  extraligaTeams = eval(match[1].replace(/;$/, ''));
} catch (e) {
  console.log('Error parsing data:', e.message);
  process.exit(1);
}

const problematicPlayers = [];

extraligaTeams.forEach(team => {
  team.players.forEach(player => {
    if (!player.seasonStats) return;
    
    player.seasonStats.forEach(season => {
      const totalMatches = season.matches || 0;
      const totalWins = season.wins || 0;

      const singleMatches = season.disciplines?.singl?.matches || 0;
      const singleWins = season.disciplines?.singl?.wins || 0;
      const doubleMatches = season.disciplines?.dvojice?.matches || 0;
      const doubleWins = season.disciplines?.dvojice?.wins || 0;
      const tripleMatches = season.disciplines?.trojice?.matches || 0;
      const tripleWins = season.disciplines?.trojice?.wins || 0;

      const sumMatches = singleMatches + doubleMatches + tripleMatches;
      const sumWins = singleWins + doubleWins + tripleWins;

      const matchesMismatch = totalMatches !== sumMatches;
      const winsMismatch = totalWins !== sumWins;

      if (matchesMismatch || winsMismatch) {
        const singleEqualsTotal = (singleMatches === totalMatches && singleWins === totalWins);

        problematicPlayers.push({
          name: player.name,
          team: team.name,
          season: season.season,
          total: { matches: totalMatches, wins: totalWins },
          singl: { matches: singleMatches, wins: singleWins },
          dvojice: { matches: doubleMatches, wins: doubleWins },
          trojice: { matches: tripleMatches, wins: tripleWins },
          sum: { matches: sumMatches, wins: sumWins },
          matchesDiff: totalMatches - sumMatches,
          winsDiff: totalWins - sumWins,
          singleEqualsTotal: singleEqualsTotal
        });
      }
    });
  });
});

console.log(JSON.stringify(problematicPlayers, null, 2));
