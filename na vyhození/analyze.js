const fs = require('fs');

const fileContent = fs.readFileSync('C:\\Users\\ASUS\\Desktop\\muj-web\\src\\extraligaTeams.js', 'utf8');

const match = fileContent.match(/export const extraligaTeams\s*=\s*(\[[\s\S]*?\n\])\s*\n/);
if (!match) {
  console.log('Data not found');
  process.exit(1);
}

let extraligaTeams;
try {
  extraligaTeams = eval(match[1]);
} catch (e) {
  console.log('Parse error:', e.message);
  process.exit(1);
}

const problematicPlayers = [];

extraligaTeams.forEach(team => {
  if (!team.players) return;

  team.players.forEach(player => {
    if (!player.seasonStats) return;

    const issues = [];

    player.seasonStats.forEach(stat => {
      const singl = stat.disciplines && stat.disciplines.singl ? stat.disciplines.singl.matches || 0 : 0;
      const dvojice = stat.disciplines && stat.disciplines.dvojice ? stat.disciplines.dvojice.matches || 0 : 0;
      const trojice = stat.disciplines && stat.disciplines.trojice ? stat.disciplines.trojice.matches || 0 : 0;

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

if (problematicPlayers.length === 0) {
  console.log('Zadni problemtaticti hraci nebyli nalezeni.');
} else {
  console.log('NALEZENO ' + problematicPlayers.length + ' HRACU S NEMOZNOU KOMBINACI DISCIPLIN:');
  console.log('');
  console.log('================================================================================');
  console.log('');
  console.log('VYSVETLENI PROBLEMU:');
  console.log('V nohejbale NELZE hrat soucasne:');
  console.log('- singl (jednotlivci) A dvojice/trojice (tymove discipliny)');
  console.log('');
  console.log('Hrac bud hraje:');
  console.log('1. POUZE singl (pak dvojice = 0, trojice = 0)');
  console.log('2. POUZE dvojice/trojice (pak singl = 0)');
  console.log('');
  console.log('U nasledujicich hracu je hodnota "singl" CHYBNA.');
  console.log('Spravne by mela byt singl = 0, protoze hraji dvojice/trojice.');
  console.log('Hodnota "singl" by mela byt presunuta do "celkem" (matches).');
  console.log('');
  console.log('================================================================================');

  problematicPlayers.forEach(player => {
    console.log('');
    console.log(player.name + ' (ID: ' + player.id + ')');
    console.log('  Tym: ' + player.team);
    player.issues.forEach(issue => {
      const celkem = issue.singl;
      const spravneDvojice = issue.dvojice;
      const spravneTrojice = issue.trojice;
      console.log('');
      console.log('  Sezona: ' + issue.season);
      console.log('  CHYBNE: singl=' + issue.singl + ', dvojice=' + issue.dvojice + ', trojice=' + issue.trojice);
      console.log('  SPRAVNE: singl=0, dvojice=' + spravneDvojice + ', trojice=' + spravneTrojice + ', celkem=' + celkem);
    });
  });

  console.log('');
  console.log('================================================================================');
  const total = problematicPlayers.reduce((sum, p) => sum + p.issues.length, 0);
  console.log('');
  console.log('SOUHRN:');
  console.log('Celkem problematickych hracu: ' + problematicPlayers.length);
  console.log('Celkem problematickych zaznamu: ' + total);
  console.log('');
  console.log('DOPORUCENI:');
  console.log('Pro kazdy zaznam vyse je potreba:');
  console.log('1. Nastavit disciplines.singl.matches = 0');
  console.log('2. Hodnotu z disciplines.singl.matches presunout do "matches" (celkovy pocet zapasu)');
  console.log('3. Hodnoty disciplines.dvojice a disciplines.trojice zachovat');
}
