// Script to analyze players with less than 4 total matches in 2024 and 2025 seasons

import { leagueTeams } from './muj-web/src/leagueTeams.js';
import { extraligaTeams } from './muj-web/src/extraligaTeams.js';

function analyzeTeams(teams, leagueName) {
  const results = [];

  teams.forEach(team => {
    team.players.forEach(player => {
      // Skip coaches (players without stats or with position "Trenér")
      if (player.position === "Trenér" || !player.seasonStats) {
        return;
      }

      let matches2025 = 0;
      let matches2024 = 0;

      // Check if seasonStats exists and is an array
      if (Array.isArray(player.seasonStats)) {
        player.seasonStats.forEach(stat => {
          // Handle variations like "2025", "2025 - základní část", "2025 Play-off", etc.
          if (stat.season && stat.season.includes("2025")) {
            matches2025 += stat.matches || 0;
          }
          if (stat.season && stat.season.includes("2024")) {
            matches2024 += stat.matches || 0;
          }
        });
      }

      const totalMatches = matches2025 + matches2024;

      // Only include players with less than 4 total matches
      if (totalMatches < 4) {
        results.push({
          teamId: team.id,
          teamName: team.shortName,
          playerId: player.id,
          playerName: player.name,
          matches2025: matches2025,
          matches2024: matches2024,
          totalMatches: totalMatches
        });
      }
    });
  });

  return results;
}

console.log("**1. liga (leagueTeams.js):**");
const leagueResults = analyzeTeams(leagueTeams, "1. liga");
leagueResults.forEach(player => {
  console.log(`- ${player.teamId} / ${player.playerId} / ${player.playerName} / ${player.totalMatches} (2025: ${player.matches2025}, 2024: ${player.matches2024})`);
});

console.log("\n**Extraliga (extraligaTeams.js):**");
const extraligaResults = analyzeTeams(extraligaTeams, "Extraliga");
extraligaResults.forEach(player => {
  console.log(`- ${player.teamId} / ${player.playerId} / ${player.playerName} / ${player.totalMatches} (2025: ${player.matches2025}, 2024: ${player.matches2024})`);
});

console.log(`\n\nTotal players with < 4 matches:`);
console.log(`1. liga: ${leagueResults.length} players`);
console.log(`Extraliga: ${extraligaResults.length} players`);
console.log(`Grand Total: ${leagueResults.length + extraligaResults.length} players`);
