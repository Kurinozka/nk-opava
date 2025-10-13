const fs = require('fs');
const fileContent = fs.readFileSync('C:\Users\ASUS\Desktop\muj-web\src\extraligaTeams.js', 'utf8');
const match = fileContent.match(/export const extraligaTeams\s*=\s*(\[\s\S]*?\n\])\s*\n/);
if (\!match) { console.log('Data not found'); process.exit(1); }
let extraligaTeams;
try { extraligaTeams = eval(match[1]); } catch (e) { console.log('Parse error:', e.message); process.exit(1); }
const problematicPlayers = [];
extraligaTeams.forEach(team => {
  if (\!team.players) return;
  team.players.forEach(player => {
    if (\!player.seasonStats) return;
    const issues = [];
    player.seasonStats.forEach(stat => {
      const singl = stat.disciplines && stat.disciplines.singl ? stat.disciplines.singl.matches || 0 : 0;
      const dvojice = stat.disciplines && stat.disciplines.dvojice ? stat.disciplines.dvojice.matches || 0 : 0;
      const trojice = stat.disciplines && stat.disciplines.trojice ? stat.disciplines.trojice.matches || 0 : 0;
      if (singl > 0 && (dvojice > 0 || trojice > 0)) {
        issues.push({ season: stat.season, chybne: { singl: singl, dvojice: dvojice, trojice: trojice }, spravne: { singl: 0, dvojice: dvojice, trojice: trojice, celkem: singl } });
      }
    });
    if (issues.length > 0) {
      problematicPlayers.push({ playerName: player.name, playerId: player.id, teamName: team.name, teamId: team.id, issues: issues });
    }
  });
});
const result = { summary: { totalProblematicPlayers: problematicPlayers.length, totalProblematicRecords: problematicPlayers.reduce((sum, p) => sum + p.issues.length, 0) }, explanation: { problem: 'V nohejbale NELZE hrat soucasne singl (jednotlivci) A dvojice/trojice (tymove discipliny)', rules: [ 'POUZE singl (pak dvojice = 0, trojice = 0)', 'POUZE dvojice/trojice (pak singl = 0)' ], fix: [ 'Nastavit disciplines.singl.matches = 0', 'Hodnotu z disciplines.singl.matches presunout do matches (celkovy pocet zapasu)', 'Hodnoty disciplines.dvojice a disciplines.trojice zachovat' ] }, problematicPlayers: problematicPlayers };
console.log(JSON.stringify(result, null, 2));
