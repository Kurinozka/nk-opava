/**
 * Script pro automatické načtení statistik hráčů za roky 2024 a 2025
 * Pro všechny týmy Extraligy a 1. ligy
 */

// Konfigurace týmů
const TEAMS = {
  extraliga: [
    { id: 1, name: "MNK mobilprovás Modřice", shortName: "MODR" },
    { id: 2, name: "TJ AVIA Čakovice", shortName: "CAKO" },
    { id: 3, name: "SK Liapor Karlovy Vary", shortName: "KVAR" },
    { id: 4, name: "NK AUSTIN Vsetín", shortName: "VSET" },
    { id: 5, name: "SKN Žatec", shortName: "ZATEC" },
    { id: 6, name: "Tělovýchovná jednota Radomyšl", shortName: "RADO" },
    { id: 7, name: "TJ Solidarita Praha", shortName: "SOLI" },
    { id: 8, name: "TJ Spartak VOTOČEK team Čelákovice", shortName: "CELA" },
    { id: 9, name: "NK Holubice", shortName: "HOLU" }
  ],
  liga1: [
    { id: 10, name: "Nohejbalový klub Opava", shortName: "OPAVA" },
    { id: 11, name: "Tělocvičná jednota Sokol Řeporyje", shortName: "REPO" },
    { id: 12, name: "TJ Spartak Čelákovice B", shortName: "CELA_B" },
    { id: 13, name: "Tělovýchovná jednota Peklo nad Zdobnicí", shortName: "PEKLO" },
    { id: 14, name: "TJ SLAVOJ Český Brod", shortName: "CBROD" },
    { id: 15, name: "R.U.M. NK Holubice", shortName: "HOLU" },
    { id: 16, name: "T.J. Sokol Zbečník", shortName: "ZBEC" },
    { id: 17, name: "MNK mobilprovás Modřice B", shortName: "MODR_B" }
  ]
};

// Sezóny, které načítáme
const SEASONS = {
  2025: { league: 145, playoffLeague: 153 }, // Extraliga 2025
  2024: { league: 132, playoffLeague: 133 }  // Extraliga 2024
};

console.log("🚀 Spouštím načítání statistik pro všechny týmy...");
console.log(`📊 Týmy Extraligy: ${TEAMS.extraliga.length}`);
console.log(`📊 Týmy 1. ligy: ${TEAMS.liga1.length}`);
console.log(`📅 Sezóny: 2024, 2025\n`);

// Toto je placeholder - skutečné načítání dat by vyžadovalo HTTP requesty
// které Claude Code neumí dělat přímo v Node.js scriptu bez knihoven

console.log("⚠️  Pro dokončení tohoto scriptu je potřeba:");
console.log("1. Nainstalovat 'node-fetch' nebo 'axios' pro HTTP requesty");
console.log("2. Implementovat parsování HTML odpovědí z nohejbal.org");
console.log("3. Vytvořit logiku pro generování seasonStats struktury");
console.log("4. Upravit soubory leagueTeams.js a extraligaTeams.js\n");

console.log("💡 Alternativní řešení: Implementovat dynamické načítání v PlayerDetail.js");
console.log("   - Rychlejší implementace");
console.log("   - Vždy aktuální data");
console.log("   - Automatická kontrola nových sezón");
