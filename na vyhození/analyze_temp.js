// Skript pro nalezení hráčů s nemožnou kombinací disciplín
const fs = require('fs');

// Načtení dat
const fileContent = fs.readFileSync('C:\Users\ASUS\Desktop\muj-web\src\extraligaTeams.js', 'utf8');

// Extrakce dat - soubor obsahuje export const extraligaTeams = [...]
const match = fileContent.match(/export const extraligaTeams\s*=\s*(\[[\s\S]*\]);/);
if (!match) {
  console.log('Nepodařilo se najít extraligaTeams v souboru');
  process.exit(1);
}

let extraligaTeams;
try {
  // Použijeme eval pro parsování (v reálném prostředí by bylo lepší použít jiný přístup)
  eval('extraligaTeams = ' + match[1]);
} catch (e) {
  console.log('Chyba při parsování dat:', e.message);
  process.exit(1);
}

// Hledání problematických hráčů
const problematicPlayers = [];

extraligaTeams.forEach(team => {
  if (!team.players) return;

  team.players.forEach(player => {
    if (!player.seasonStats) return;

    const issues = [];

    player.seasonStats.forEach(stat => {
      const singl = stat.singl?.matches || 0;
      const dvojice = stat.dvojice?.matches || 0;
      const trojice = stat.trojice?.matches || 0;

      // Kontrola nemožné kombinace: singl > 0 A ZÁROVEŇ (dvojice > 0 NEBO trojice > 0)
      if (singl > 0 && (dvojice > 0 || trojice > 0)) {
        issues.push({
          season: stat.season,
          singl: singl,
          dvojice: dvojice,
          trojice: trojice
        });
      }
    });

    if (issues.length > 0) {
      problematicPlayers.push({
        name: player.name,
        id: player.id,
        team: team.name,
        issues: issues
      });
    }
  });
});

// Výpis výsledků
if (problematicPlayers.length === 0) {
  console.log('Žádní hráči s nemožnou kombinací disciplín nebyli nalezeni.');
} else {
  console.log(`NALEZENO ${problematicPlayers.length} HRÁČŮ S NEMOŽNOU KOMBINACÍ DISCIPLÍN:\n`);
  console.log('='.repeat(80));

  problematicPlayers.forEach(player => {
    console.log(`\n${player.name} (ID: ${player.id})`);
    console.log(`  Tým: ${player.team}`);
    player.issues.forEach(issue => {
      console.log(`  Sezóna ${issue.season}: singl=${issue.singl}, dvojice=${issue.dvojice}, trojice=${issue.trojice}`);
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\nCelkem problematických záznamů: ${problematicPlayers.reduce((sum, p) => sum + p.issues.length, 0)}`);
}
