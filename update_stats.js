const fs = require('fs');

// Read the file
let content = fs.readFileSync('C:\\Users\\ASUS\\Desktop\\muj-web\\src\\extraligaTeams.js', 'utf8');

// Ondřej Pachman updates (ID 556)
content = content.replace(
  /player_556\.jpg",\s*stats:\s*\{[^}]+\},\s*regularSeason:\s*\{[^}]+\},\s*seasonStats:\s*\[\s*\{[^}]+season:\s*"2025"[^}]+disciplines:\s*\{[^}]+\}\s*\}[^}]*\{[^}]+season:\s*"2024"[^}]+disciplines:\s*\{[^}]+\}\s*\}/gs,
  function(match) {
    if (match.includes('player_556')) {
      return match
        .replace(/regularSeason:\s*\{[^}]+\}/, 'regularSeason: { matches: 35, wins: 20, winRate: 57, singl: { matches: 14, wins: 8, winRate: 57 }, dvojice: { matches: 21, wins: 12, winRate: 57 }, trojice: { matches: 0, wins: 0, winRate: 0 } }')
        .replace(/(season:\s*"2025"[^}]+)matches:\s*\d+/, '$1matches: 35')
        .replace(/(season:\s*"2025"[^}]+)wins:\s*\d+/, '$1wins: 20')
        .replace(/(season:\s*"2025"[^}]+)losses:\s*\d+/, '$1losses: 15')
        .replace(/(season:\s*"2025"[^}]+)winRate:\s*\d+/, '$1winRate: 57')
        .replace(/(season:\s*"2025"[^}]+disciplines:\s*\{[^}]+)singl:\s*\{[^}]+\}/, '$1singl: { matches: 14, wins: 8, winRate: 57 }')
        .replace(/(season:\s*"2025"[^}]+disciplines:\s*\{[^}]+)dvojice:\s*\{[^}]+\}/, '$1dvojice: { matches: 21, wins: 12, winRate: 57 }')
        .replace(/(season:\s*"2025"[^}]+disciplines:\s*\{[^}]+)trojice:\s*\{[^}]+\}/, '$1trojice: { matches: 0, wins: 0, winRate: 0 }')
        .replace(/(season:\s*"2024"[^}]+disciplines:\s*\{[^}]+)singl:\s*\{[^}]+\}/, '$1singl: { matches: 9, wins: 5, winRate: 56 }')
        .replace(/(season:\s*"2024"[^}]+disciplines:\s*\{[^}]+)dvojice:\s*\{[^}]+\}/, '$1dvojice: { matches: 14, wins: 7, winRate: 50 }')
        .replace(/(season:\s*"2024"[^}]+disciplines:\s*\{[^}]+)trojice:\s*\{[^}]+\}/, '$1trojice: { matches: 0, wins: 0, winRate: 0 }');
    }
    return match;
  }
);

fs.writeFileSync('C:\\Users\\ASUS\\Desktop\\muj-web\\src\\extraligaTeams.js', content, 'utf8');
console.log('Updated Ondřej Pachman');
