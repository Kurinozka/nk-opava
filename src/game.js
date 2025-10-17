import { players, skills } from './playerData.js'
import { getTeamWithStats } from './leagueTeams.js'
import { smecAnimation } from './animations/smec.js'
import { bokischSmecAnimation } from './animations/bokisch-smec.js'
import { kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation } from './animations/kurka-shaolin.js'
import { majstinikNonsenseAnimation } from './animations/majstinik-pozdrav.js'
import { soundManager } from './soundManager.js'
import { schoolVideos } from './data/schoolVideos.js'

// Mapa animací pro jednotlivé schopnosti (globální)
const skillAnimations = {
  // Animace budou přidány postupně
}

// Mapa animací specifických pro jednotlivé hráče a jejich dovednosti
const playerSkillAnimations = {
  1: {
    3: bokischSmecAnimation,  // Radim Bokisch - Smeč po noze/do áčka
    5: bokischSmecAnimation,  // Radim Bokisch - Klepák
    15: null
  },
  4: {
    15: [kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation]  // Ondřej Kurka - Shaolin
  },
  7: {
    15: majstinikNonsenseAnimation  // David Majštiník - Pozdrav přítelkyni
  }
}

// Funkce pro získání animace pro hráče a dovednost
function getSkillAnimation(playerId, skillId) {
  // Zkusit nejdříve hráčově specifickou animaci
  if (playerSkillAnimations[playerId] && playerSkillAnimations[playerId][skillId]) {
    return playerSkillAnimations[playerId][skillId]
  }
  // Pak zkusit globální animaci pro dovednost
  if (skillAnimations[skillId]) {
    return skillAnimations[skillId]
  }
  // Jinak vrátit null (zobrazí se placeholder)
  return null
}

// Funkce pro určení, která obrana funguje proti útoku (s ohledem na dominantní nohu)
function getEffectiveDefenseSkill(attackSkill, attackerFoot, defenderFoot) {
  // Pokud oba mají stejnou dominantní nohu, použij původní mapping
  const sameFoot = (attackerFoot === defenderFoot)

  // Původní mapping (pro praváka vs praváka nebo leváka vs leváka)
  const defaultMapping = {
    2: 14,  // Smeč do béčka/do paty → Slabší noha
    3: 13,  // Smeč po noze/do áčka → Skluz
    6: 14,  // Pata → Slabší noha
    7: 13,  // Kraťas pod sebe → Skluz
    8: 13,  // Kraťas za blok → Skluz
    5: 12,  // Klepák → Blok
    9: 12,  // Šlapaný kraťas → Blok
    4: 12,  // Tupá rána kamkoliv → Blok
    1: 12   // Smeč do středu/přes blok → Blok
  }

  // Pokud stejná noha, vrátit původní mapping
  if (sameFoot) {
    return defaultMapping[attackSkill]
  }

  // Opačná noha → otočit Skluz a Slabší nohu pro skills 2, 3, 6, 7
  if (attackSkill === 2 || attackSkill === 6) {
    return 13  // Smeč do béčka/Pata → Skluz (místo Slabší noha)
  }
  if (attackSkill === 3 || attackSkill === 7) {
    return 14  // Smeč do áčka/Kraťas pod sebe → Slabší noha (místo Skluz)
  }

  // Pro ostatní skills zůstává původní mapping
  return defaultMapping[attackSkill]
}

let gameState = {
  mode: null,
  gameMode: 'training',  // 'training' nebo 'league'
  opponentTeamId: null,  // ID soupeře v ligovém režimu
  team1Name: null,  // Název týmu 1
  team2Name: null,  // Název týmu 2
  substitutionMode: 'auto',  // 'auto', 'manual', 'none'
  team1: [],
  team2: [],
  hasShownInitialOpavaZbecnikQuote: false,  // Pro sledování první speciální hlášky
  score: { team1: [0, 0, 0], team2: [0, 0, 0] },
  successfulDefenses: { team1: [0, 0, 0], team2: [0, 0, 0] },
  currentSet: 0,
  isPlaying: false,
  isPaused: false,
  lastActivatedSkills: { team1: [], team2: [] },
  pointsPlayed: 0,
  ultimateCooldowns: {},
  matchInterval: null,
  skipToEnd: false,
  skipTarget: null,  // 'endOfSet', 'endOfMatch', 'endOfLeague'
  skipTargetSet: null,  // Číslo cílového setu při skipTarget === 'endOfSet'
  speedMultiplier: 1,
  eventHistory: [],
  substitutedPlayers: [],
  // Systém historie výměn pro navigaci zpět/vpřed
  rallyHistory: [],  // Pole snapshotů stavu před každou výměnou + výsledek výměny
  currentRallyIndex: -1,  // Aktuální pozice v historii (-1 = žádná výměna ještě neproběhla)
  isReplayingHistory: false,  // Příznak, zda se přehrává historie místo generování nových výměn
  nonsenseDebuffs: { team1: false, team2: false },
  nonsenseAttempts: [],
  // Nové vlastnosti pro střídání
  team1AllPlayers: [],  // Všichni hráči, kteří se objevili v týmu 1 během setu
  team2AllPlayers: [],  // Všichni hráči, kteří se objevili v týmu 2 během setu
  team1Bench: [],       // Hráči na lavičce týmu 1
  team2Bench: [],       // Hráči na lavičce týmu 2
  team1StartingPlayers: [],  // Původní sestava týmu 1 (pro kontrolu, že 1 musí zůstat)
  team2StartingPlayers: [],  // Původní sestava týmu 2
  team1SubstitutionsThisSet: 0,  // Počet střídání v aktuálním setu
  team2SubstitutionsThisSet: 0,
  playerPerformance: {},  // Sledování výkonu hráčů pro automatické střídání
  playerPointsContribution: {},  // Sledování bodů, které hráč udělal nebo zablokoval (pro pochvalu každé 2 body)
  // Ligové zápasy - systém 10 dílčích zápasů
  matchesScore: { team1: 0, team2: 0 },  // Skóre dílčích zápasů (max 10)
  currentMatch: 0,  // Aktuální dílčí zápas (0-9)
  matchSchedule: [],  // Pořadí zápasů: [{type: 'dvojice1', position: 1}, ...]
  leagueEnded: false,  // Zda liga skončila (6 bodů nebo 5:5)
  // Sledování hráčů v disciplínách (pro ligová pravidla)
  // Pravidla: Hráč nesmí být současně v 1. a 2. trojici, a může nastoupit pouze v jedné dvojici
  playersInDisciplines: {
    team1: {
      dvojice1: [],
      dvojice2: [],
      dvojice3: [],
      trojice1: [],  // 1. trojice
      trojice2: []   // 2. trojice
    },
    team2: {
      dvojice1: [],
      dvojice2: [],
      dvojice3: [],
      trojice1: [],  // 1. trojice
      trojice2: []   // 2. trojice
    }
  },
  // Systém rozhodčích - karty a napomenutí (pouze ligový režim)
  playerWarnings: {},  // { playerId: počet_napomenutí }
  playerYellowCards: {},  // { playerId: počet_žlutých }
  playerRedCards: {},  // { playerId: true/false }
  // Extrémní počasí (pouze ligový režim)
  extremeWeather: null,  // null nebo { type: 'rain'/'wind'/'hail'/'snow', active: true }
  weatherDebuff: false,  // true pokud je aktivní 20% debuff na parametry
  // Coach mood tracking
  team1CoachMood: 0,  // 0 = nejlepší, 4 = nejhorší
  team2CoachMood: 0,
  // Coaches
  team1Coach: null,
  team2Coach: null,
  // Sledování posledního inkasujícího týmu (pro střídavé vyhodnocování)
  lastScoredAgainst: null,  // 'team1' nebo 'team2' - tým, který naposledy inkasoval
  // Deck počátečních hlášek (pro zamíchání bez opakování)
  startQuotesDeck: [],
  opavaZbecnikQuotesDeck: [],
  // Advance selection mode (pro výběr hráčů před zápasem)
  advanceSelectionMode: false,
  currentDisciplineIndex: 0,  // Index aktuální vybírané disciplíny (0-5)
  disciplineLineups: [],  // Uložené sestavy pro všechny disciplíny
  disciplineNames: ['1. dvojice', '2. dvojice', '3. dvojice', '1. trojice', '2. trojice', 'Singl'],
  // Time-out systém
  timeoutsTaken: { team1: [false, false, false], team2: [false, false, false] },  // Jeden timeout na tým na set
  skillPerformance: {},  // { playerId_skillId: pointsScored } - sledování bodů pro každou dovednost
  nextRallySkills: { team1: [], team2: [] }  // Předvybrané schopnosti pro příští výměnu (z time-outu)
}

// Coach mood levels (from best to worst)
const COACH_MOODS = [
  { emoji: '😊', text: 'Stále vidím detaily k vyladění' },
  { emoji: '🤨', text: 'Je na čem pracovat' },
  { emoji: '😠', text: 'Co to tam děláte?' },
  { emoji: '😡', text: 'To snad není možné' },
  { emoji: '🤬', text: 'To si ze mě ku*va děláte pr*el do *íči!' }
]

// Update coach mood based on performance
function updateCoachMood(team, didWin) {
  const moodKey = team === 'team1' ? 'team1CoachMood' : 'team2CoachMood'

  if (didWin) {
    // Win improves mood (go down one level, but not below 0)
    gameState[moodKey] = Math.max(0, gameState[moodKey] - 1)
  } else {
    // Loss worsens mood (go up one level, but not above 4)
    gameState[moodKey] = Math.min(4, gameState[moodKey] + 1)
  }

  // Update UI
  updateCoachMoodUI(team)
}

// Show coach quote overlay (stays visible until replaced by next quote)
function showCoachQuote(team, quote) {
  // Panel trenéra a komentář
  const panelId = team === 'team1' ? 'coach1-panel-side' : 'coach2-panel-side'
  const commentId = team === 'team1' ? 'coach1-comment' : 'coach2-comment'

  const panel = document.getElementById(panelId)
  const comment = document.getElementById(commentId)

  if (panel && comment) {
    // Aktualizovat text v komentáři
    comment.innerHTML = `<p>${quote}</p>`

    // Zobrazit komentář přidáním třídy "active"
    comment.classList.add('active')

    // Automaticky skrýt komentář po 8 sekundách
    setTimeout(() => {
      comment.classList.remove('active')
    }, 8000)
  }
}

// Funkce pro inicializaci panelů trenérů
function initializeCoachCards() {
  // Zkontrolovat, jestli jsou týmy načteny
  if (!gameState.team1 || !gameState.team2) {
    return
  }

  // Najít trenéry v týmech (v sestavě nebo na lavičce)
  const team1Players = gameState.team1 || []
  const team1Bench = gameState.team1Bench || []
  const team2Players = gameState.team2 || []
  const team2Bench = gameState.team2Bench || []

  const team1Coach = [...team1Players, ...team1Bench].find(p => p.position === 'Trenér')
  const team2Coach = [...team2Players, ...team2Bench].find(p => p.position === 'Trenér')

  // Nastavit panel trenéra týmu 1
  if (team1Coach) {
    const photo = document.getElementById('coach1-photo')
    const name = document.getElementById('coach1-name')
    const mood = document.getElementById('coach1-mood')

    if (photo) photo.src = team1Coach.photo
    if (name) name.textContent = team1Coach.name
    if (mood) mood.textContent = '😊' // Výchozí nálada
  }

  // Nastavit panel trenéra týmu 2
  if (team2Coach) {
    const photo = document.getElementById('coach2-photo')
    const name = document.getElementById('coach2-name')
    const mood = document.getElementById('coach2-mood')

    if (photo) photo.src = team2Coach.photo
    if (name) name.textContent = team2Coach.name
    if (mood) mood.textContent = '😊' // Výchozí nálada
  }

  // Nastavit event listenery pro tlačítka TIME-OUT
  setupTimeoutButtons()
}

// Funkce pro nastavení tlačítek TIME-OUT v panelech trenérů
function setupTimeoutButtons() {
  const timeout1Btn = document.getElementById('timeout-team1-btn-coach')
  const timeout2Btn = document.getElementById('timeout-team2-btn-coach')

  if (timeout1Btn) {
    timeout1Btn.addEventListener('click', () => {
      // Zavolat stejnou funkci jako původní TIME-OUT tlačítko
      const originalBtn = document.getElementById('timeout-team1-btn')
      if (originalBtn) originalBtn.click()
    })
  }

  if (timeout2Btn) {
    timeout2Btn.addEventListener('click', () => {
      // Zavolat stejnou funkci jako původní TIME-OUT tlačítko
      const originalBtn = document.getElementById('timeout-team2-btn')
      if (originalBtn) originalBtn.click()
    })
  }
}

// Funkce pro přidání bodu hráči (útok nebo blokovaná obrana) a případnou pochvalu
function addPlayerPointContribution(player, team) {
  if (!player || !player.id) return

  // Inicializovat počítadlo, pokud ještě neexistuje
  if (!gameState.playerPointsContribution[player.id]) {
    gameState.playerPointsContribution[player.id] = 0
  }

  // Přidat bod
  gameState.playerPointsContribution[player.id]++

  // Každé 2 body pochválit
  if (gameState.playerPointsContribution[player.id] % 2 === 0) {
    const playerVocative = getPlayerVocative(player)
    const praiseQuote = `Výborně, ${playerVocative}!`
    showCoachQuote(team, praiseQuote)
  }
}

// Helper funkce pro zamíchání pole (Fisher-Yates shuffle)
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Funkce pro získání náhodné počáteční hlášky trenéra (bez opakování, dokud se nevyčerpají všechny)
function getRandomStartQuote(teamName, opponentName) {
  // Standardní počáteční hlášky
  const standardQuotes = [
    "Pojďme na to!",
    "Makáme, chlapi!",
    "Rozbijem je!",
    "Máte na to!",
    "Koukejte se a pošlete to tam, kde nikdo není!",
    "Plán je - dejte bod!",
    "Plán je - dejte více bodů než soupeř!"
  ]

  // Speciální hlášky pro souboj Opava vs Zbečník
  const opavaVsZbecnikQuotesCommon = [
    "Za dva roky spolu hrajem snad popatnácté.",
    "2. liga, základní část 2x, play off 2x, 1. liga 2x, play out 3x a ještě baráž?",
    "Doma se mě ptají, jestli jsou v té naší lize jen dvě družstva."
  ]

  const opavaQuote = "Takhle to dál nejde, vyplatilo by se zajet do Zbečníku na týden a zahrát si všechny utkání na rok dopředu, odhadem jich bude 8."
  const zbecnikQuote = "Takhle to dál nejde, vyplatilo by se zajet do Opavy na týden a zahrát si všechny utkání na rok dopředu, odhadem jich bude 8."

  // Pokud je to souboj Opava vs Zbečník
  const isOpavaVsZbecnik = (teamName && opponentName) &&
    ((teamName.includes('Opava') && opponentName.includes('Zbečník')) ||
     (teamName.includes('Zbečník') && opponentName.includes('Opava')))

  if (isOpavaVsZbecnik) {
    // První hláška (úvodní pro daný tým)
    if (!gameState.hasShownInitialOpavaZbecnikQuote) {
      gameState.hasShownInitialOpavaZbecnikQuote = true
      if (teamName.includes('Opava')) {
        return "Už zase ten Zbečník!"
      } else {
        return "Už zase ta Opava!"
      }
    }

    // Následující hlášky - z decku bez opakování
    if (gameState.opavaZbecnikQuotesDeck.length === 0) {
      // Deck je prázdný - zamíchat znovu
      // Přidat specifickou hlášku podle týmu
      const teamSpecificQuote = teamName.includes('Opava') ? opavaQuote : zbecnikQuote
      const allQuotes = [...opavaVsZbecnikQuotesCommon, teamSpecificQuote]
      gameState.opavaZbecnikQuotesDeck = shuffleArray(allQuotes)
    }
    return gameState.opavaZbecnikQuotesDeck.pop()
  }

  // Pro ostatní zápasy - z decku standardních hlášek bez opakování
  if (gameState.startQuotesDeck.length === 0) {
    // Deck je prázdný - zamíchat znovu
    gameState.startQuotesDeck = shuffleArray(standardQuotes)
  }
  return gameState.startQuotesDeck.pop()
}

// Funkce pro získání křestního jména nebo přezdívky hráče
function getPlayerFirstNameOrNickname(player) {
  // Pokud má přezdívku, použij ji
  if (player.nickname) {
    return player.nickname
  }

  // Jinak vrať křestní jméno (první slovo z celého jména)
  if (player.name) {
    return player.name.split(' ')[0]
  }

  return 'hráči'
}

// Funkce pro získání vokativu (5. pádu) křestního jména nebo přezdívky
function getPlayerVocative(player) {
  // Slovník vokativů pro konkrétní jména a přezdívky
  const vocativeMap = {
    // Křestní jména
    'Radim': 'Radime',
    'Roman': 'Romane',
    'Ondřej': 'Ondřeji',
    'Josef': 'Josefe',
    'David': 'Davide',
    'Jan': 'Jane',
    'Jakub': 'Jakube',
    'Martin': 'Martine',
    'Tomáš': 'Tomáši',
    'Petr': 'Petře',
    'Pavel': 'Pavle',
    'Michal': 'Michale',
    'Jiří': 'Jiří',
    'Václav': 'Václave',
    'Stanislav': 'Stanislave',
    'Jaroslav': 'Jaroslave',
    'Miroslav': 'Miroslave',
    'Zdeněk': 'Zdeňku',
    'Marek': 'Marku',
    'Lukáš': 'Lukáši',
    // Přezdívky
    'Švestka': 'Švestko',
    'Kvardič': 'Kvardiči',
    'Kurka': 'Kurko',
    'Majda': 'Majdo',
    'Nezval': 'Nezvale',
    'Franta': 'Franto',
    'Bokisch': 'Bokischi'
  }

  const name = player.nickname || (player.name ? player.name.split(' ')[0] : null)

  if (!name) {
    return 'hráči'
  }

  // Pokud máme vokativ ve slovníku, použij ho
  if (vocativeMap[name]) {
    return vocativeMap[name]
  }

  // Jinak zkus automatickou konverzi
  // Jména končící na -a -> změň na -o
  if (name.endsWith('a')) {
    return name.slice(0, -1) + 'o'
  }

  // Jména končící na souhlásku -> přidej -e
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'á', 'é', 'í', 'ó', 'ú', 'ý']
  if (!vowels.includes(name[name.length - 1].toLowerCase())) {
    return name + 'e'
  }

  // Jinak vrať původní jméno
  return name
}

// Komentáře trenéra k útokům
function getCoachAttackComment(coach, isSuccess) {
  if (!coach || !coach.coachQuotes) {
    // Fallback hlášky pokud trenér nemá definované
    return isSuccess ? "Výborně!" : "Soustřeď se!"
  }

  if (isSuccess && coach.coachQuotes.offensiveSuccess) {
    const quotes = coach.coachQuotes.offensiveSuccess
    return quotes[Math.floor(Math.random() * quotes.length)]
  } else if (!isSuccess && coach.coachQuotes.offensiveFail) {
    const quotes = coach.coachQuotes.offensiveFail
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  // Fallback
  return isSuccess ? "Výborně!" : "Zlepši se!"
}

// Zkontrolovat a provést střídání po 3 neúspěšných útocích
async function checkAndSubstituteAfterFailedAttacks(player, team) {
  const perf = gameState.playerPerformance[player.id]

  if (!perf || perf.consecutiveFailures < 3) {
    return null
  }

  // Hráč má 3 neúspěšné útoky v řadě
  if (gameState.substitutedPlayers.includes(player.id)) {
    // Již byl vystřídán
    return null
  }

  const isTeam1 = team === 'team1'
  const bench = isTeam1 ? gameState.team1Bench : gameState.team2Bench
  const teamPlayers = isTeam1 ? gameState.team1 : gameState.team2

  // Filtrovat trenéry z lavičky
  const playersOnly = bench.filter(p => p.position !== 'Trenér')

  if (playersOnly.length === 0) {
    return null // Není za koho střídat
  }

  // Najít nejlepšího náhradníka (použít první dostupný)
  const substitute = playersOnly[0]

  return {
    teamName: team,
    playerOut: player,
    playerIn: substitute,
    playerId: player.id
  }
}

// Update coach mood display
function updateCoachMoodUI(team) {
  const moodKey = team === 'team1' ? 'team1CoachMood' : 'team2CoachMood'
  const moodLevel = gameState[moodKey]
  const mood = COACH_MOODS[moodLevel]

  // Aktualizovat emoji nálady v novém panelu
  const moodId = team === 'team1' ? 'coach1-mood' : 'coach2-mood'
  const moodElement = document.getElementById(moodId)

  if (moodElement) {
    moodElement.textContent = mood.emoji
  }

  // Aktualizovat text nálady
  const moodTextId = team === 'team1' ? 'coach1-mood-text' : 'coach2-mood-text'
  const moodTextElement = document.getElementById(moodTextId)

  if (moodTextElement) {
    moodTextElement.textContent = mood.text
  }

  // Show quote overlay if mood is not the best
  if (moodLevel > 0) {
    showCoachQuote(team, mood.text)
  }
}

// Funkce pro nastavení herního režimu
export function setGameMode(mode, opponentTeamId = null) {
  gameState.gameMode = mode
  gameState.opponentTeamId = opponentTeamId

  // Nastavit názvy týmů
  gameState.team1Name = 'NK Opava'
  if (mode === 'league' && opponentTeamId) {
    const opponentTeam = getTeamWithStats(opponentTeamId)
    gameState.team2Name = opponentTeam ? opponentTeam.name : null
  } else {
    gameState.team2Name = 'NK Opava'  // Tréningový režim
  }

  if (mode === 'league') {
    // Zobrazit počítadlo dílčích zápasů
    const matchesScoreDisplay = document.getElementById('matches-score-display')
    if (matchesScoreDisplay) {
      matchesScoreDisplay.style.display = 'block'
    }

    // Zobrazit checkbox pro předběžný výběr hráčů
    const advanceSelectionContainer = document.querySelector('.advance-selection-container')
    if (advanceSelectionContainer) {
      advanceSelectionContainer.style.display = 'block'
    }

    // Zobrazit time-out tlačítka
    const timeoutButtons = document.querySelector('.timeout-buttons')
    if (timeoutButtons) {
      timeoutButtons.style.display = 'flex'
    }
  } else {
    // Skrýt checkbox v tréninkovém režimu
    const advanceSelectionContainer = document.querySelector('.advance-selection-container')
    if (advanceSelectionContainer) {
      advanceSelectionContainer.style.display = 'none'
    }

    // Skrýt time-out tlačítka v tréninkovém režimu
    const timeoutButtons = document.querySelector('.timeout-buttons')
    if (timeoutButtons) {
      timeoutButtons.style.display = 'none'
    }
  }
}

// Funkce pro nastavení týmů v ligovém režimu
// Funkce pro nastavení názvů týmů
export function setTeamNames(team1Name, team2Name) {
  gameState.team1Name = team1Name
  gameState.team2Name = team2Name
}

export function setLeagueTeams(opavaLineup, opavaBench, opponentLineup, opponentBench, playersPerTeam, substitutionMode = 'auto', coachMode = 'active') {
  gameState.team1 = opavaLineup
  gameState.team2 = opponentLineup
  gameState.team1Bench = opavaBench
  gameState.team2Bench = opponentBench

  // Najít a uložit trenéry do bench (pokud tam ještě nejsou)
  // Pro team1 - zkusit najít trenéra v dostupných hráčích
  if (window.leagueSetupState && window.leagueSetupState.opavaPlayers) {
    const team1CoachInRoster = window.leagueSetupState.opavaPlayers.find(p => p.position === 'Trenér')
    if (team1CoachInRoster && !opavaBench.some(p => p.position === 'Trenér')) {
      gameState.team1Bench = [...opavaBench, team1CoachInRoster]
    }
  }

  // Pro team2 - zkusit najít trenéra v dostupných hráčích
  if (window.leagueSetupState && window.leagueSetupState.opponentPlayers) {
    const team2CoachInRoster = window.leagueSetupState.opponentPlayers.find(p => p.position === 'Trenér')
    if (team2CoachInRoster && !opponentBench.some(p => p.position === 'Trenér')) {
      gameState.team2Bench = [...opponentBench, team2CoachInRoster]
    }
  }

  // Automaticky nastavit názvy týmů podle režimu
  if (gameState.gameMode === 'training') {
    // Pro tréningový režim použít příjmení prvního hráče
    const team1FirstPlayer = opavaLineup[0]
    const team2FirstPlayer = opponentLineup[0]

    if (team1FirstPlayer && team2FirstPlayer) {
      const team1LastName = team1FirstPlayer.name.split(' ').pop()
      const team2LastName = team2FirstPlayer.name.split(' ').pop()
      gameState.team1Name = `${team1LastName}ův tým`
      gameState.team2Name = `${team2LastName}ův tým`
    }
  } else if (gameState.gameMode === 'extraliga') {
    // Pro extraligu použít názvy týmů z window.leagueSetupState
    if (window.leagueSetupState) {
      gameState.team1Name = window.leagueSetupState.team1Name || 'Tým 1'
      gameState.team2Name = window.leagueSetupState.team2Name || 'Tým 2'
    }
  }
  // Pro league mode jsou názvy už nastaveny v setGameMode

  // Nastavit mód podle počtu hráčů
  if (playersPerTeam === 1) {
    gameState.mode = '1v1'
  } else if (playersPerTeam === 2) {
    gameState.mode = '2v2'
  } else {
    gameState.mode = '3v3'
  }

  // Nastavit režim střídání
  gameState.substitutionMode = substitutionMode

  // Nastavit režim trenéra (passive, active, hyperactive)
  gameState.coachMode = coachMode
}

// Funkce pro vykreslení herní obrazovky bez menu
export function renderGameScreen() {
  return `
    <div class="game-container">
      <div class="game-court" style="display: block;">
        <button class="back-to-home-btn" onclick="window.location.reload()">← Zpět na úvodní stránku</button>
        <div class="game-layout-unified">

          <!-- TOP BAR - Skóre + Ovládání (kompaktní horní lišta) -->
          <div class="top-bar-unified">
            <div class="controls-unified">
              <div class="playback-controls-unified">
                <button class="control-btn-unified" id="restart-match-btn" title="Na začátek">|◄</button>
                <button class="control-btn-unified" id="previous-rally-btn" title="Předchozí">◄◄</button>
                <button class="control-btn-unified" id="pause-rally-btn" title="Pauza">❚❚</button>
                <button class="control-btn-unified" id="next-rally-btn" title="Další">►►</button>
                <button class="control-btn-unified" id="skip-to-result-btn" title="Konec">►|</button>
                <button class="control-btn-unified back-menu-btn" title="Menu">🏠</button>
                <div class="speed-control-unified">
                  <label for="playback-speed">⚡</label>
                  <input type="range" id="playback-speed" min="0" max="100" value="30" step="5">
                  <span id="speed-percentage">30%</span>
                </div>
              </div>

              <div class="score-display-unified">
                <div class="score-item">
                  <span class="score-label-unified">Body:</span>
                  <span class="score-value-unified" id="current-set-score">0 : 0</span>
                </div>
                <div class="score-separator">|</div>
                <div class="score-item">
                  <span class="score-label-unified">Sety:</span>
                  <span class="score-value-unified" id="sets-score">0 : 0</span>
                </div>
                <div class="score-separator">|</div>
                <div class="score-item" id="matches-score-display" style="display: flex;">
                  <span class="score-label-unified">Stav:</span>
                  <span class="score-value-unified" id="matches-score">0 : 0</span>
                </div>
              </div>

              <div class="action-buttons-unified">
                <button class="action-btn-unified" id="mute-crowd-btn" title="Ztlumit diváky">👥🔊</button>
                <button class="action-btn-unified" id="mute-all-btn" title="Ztlumit vše">🔊</button>
              </div>
            </div>

            <div class="timeout-row">
              <button class="coach-timeout-btn" id="timeout-team1-btn-coach" title="TIME-OUT pro ${gameState.team1Name || 'Tým 1'}">TIME OUT</button>
              <div class="team-names-centered">
                <span class="team-name-left" id="team-name-left">${gameState.team1Name || 'Tým 1'}</span>
                <span class="team-name-right" id="team-name-right">${gameState.team2Name || 'Tým 2'}</span>
              </div>
              <button class="coach-timeout-btn" id="timeout-team2-btn-coach" title="TIME-OUT pro ${gameState.team2Name || 'Tým 2'}">TIME OUT</button>
            </div>

            <div class="match-info-unified" id="current-match-info"></div>

            <!-- Hidden helper elements -->
            <div style="display: none;">
              <b id="t1-s1">0</b>
              <b id="t1-s2">0</b>
              <b id="t1-s3">5</b>
              <b id="t2-s1">0</b>
              <b id="t2-s2">0</b>
              <b id="t2-s3">5</b>
            </div>
          </div>

          <!-- MAIN AREA - Hřiště + Trenéři + Dovednosti -->
          <div class="main-area-unified">
            <!-- Persistentní zobrazení trenérů, hráčů a dovedností -->
            <div id="skill-reveal" class="skill-reveal-persistent"></div>

            <!-- Vyhodnocovací okno -->
            <div class="game-info">
              <div id="current-phase"></div>
              <div id="evaluation-phase"></div>
              <div id="decisive-skill-video"></div>
            </div>
          </div>

          <!-- BOTTOM BAR - Komentáře -->
          <div class="bottom-bar-unified" id="bottom-bar-unified">
            <div class="commentary-split">
              <!-- Levý sloupec - Tým 1 -->
              <div class="commentary-team commentary-team-1">
                <div class="commentary-team-content" id="team1-commentary">
                  <p class="commentary-placeholder">Čeká se na akci...</p>
                </div>
              </div>

              <!-- Pravý sloupec - Tým 2 -->
              <div class="commentary-team commentary-team-2">
                <div class="commentary-team-content" id="team2-commentary">
                  <p class="commentary-placeholder">Čeká se na akci...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="substitution-modal" style="display: none;">
          <div class="substitution-modal-content">
            <button class="modal-close">&times;</button>
            <h2>Střídání hráčů</h2>
            <div class="substitution-teams">
              <div class="substitution-team">
                <h3>${gameState.team1Name}</h3>
                <div class="current-lineup" id="sub-team1-current"></div>
                <div class="bench-players" id="sub-team1-bench"></div>
              </div>
              <div class="substitution-team">
                <h3>${gameState.team2Name}</h3>
                <div class="current-lineup" id="sub-team2-current"></div>
                <div class="bench-players" id="sub-team2-bench"></div>
              </div>
            </div>
            <div class="substitution-info">
              <p id="sub-info-text">Vyberte hráče, kterého chcete vystřídat, a pak vyberte náhradníka z lavičky.</p>
            </div>
          </div>
        </div>

        <!-- Timeout modal pro výběr dovedností -->
        <div class="timeout-modal" style="display: none;">
          <div class="timeout-modal-content">
            <button class="timeout-modal-close">&times;</button>
            <h2>⏸️ TIME-OUT - Výběr dovedností</h2>
            <p class="timeout-instruction">Vyberte dovednost pro každého hráče v příští výměně:</p>
            <div class="timeout-players" id="timeout-players-list"></div>
            <div class="timeout-actions">
              <button class="timeout-confirm-btn" id="confirm-timeout-skills">Potvrdit dovednosti</button>
              <button class="timeout-cancel-btn" id="cancel-timeout">Zrušit</button>
            </div>
          </div>
        </div>
      </div>

      <div class="game-over" style="display: none;">
        <h1>Konec zápasu!</h1>
        <div id="final-score"></div>
        <button class="new-game-btn">Nová hra</button>
      </div>
    </div>
  `
}

// Funkce pro spuštění ligového zápasu
export function startLeagueMatch() {
  // Počet hráčů na hřišti (základní sestava) - ne celkový počet včetně lavičky
  let playersPerTeam = parseInt(gameState.mode[0])

  // Inicializovat střídání
  gameState.team1StartingPlayers = [...gameState.team1]
  gameState.team2StartingPlayers = [...gameState.team2]
  gameState.team1AllPlayers = [...gameState.team1]
  gameState.team2AllPlayers = [...gameState.team2]
  gameState.team1SubstitutionsThisSet = 0
  gameState.team2SubstitutionsThisSet = 0
  gameState.substitutedPlayers = []

  // Nastavit nové playback ovládací prvky
  setupPlaybackControls()

  // Inicializovat jednoduchý scoreboard
  updateSimpleScoreboard()

  // Inicializovat karty trenérů v komentářových oknech
  initializeCoachCards()

  // Inicializovat ligový režim pouze pro ligové zápasy
  if (gameState.gameMode === 'league') {
    gameState.matchSchedule = createLeagueMatchSchedule(playersPerTeam)
    gameState.currentMatch = 0
    gameState.matchesScore = { team1: 0, team2: 0 }
    gameState.leagueEnded = false
  }

  // Aktualizovat UI (pro oba režimy - zobrazí název disciplíny)
  updateMatchesScore()

  // Automaticky spustit zápas
  startAutomaticMatch()
}

// Validační funkce pro kontrolu, zda hráče mohou nastoupit v dané disciplíně
// Pravidla:
// 1. Hráč nesmí být současně v 1. a 2. trojici
// 2. Hráč může nastoupit pouze v jedné dvojici (z 1., 2., 3.)
export function validatePlayerSelection(team, discipline, playerIds) {
  const teamDisciplines = gameState.playersInDisciplines[team]

  for (const playerId of playerIds) {
    // Kontrola pro trojice
    if (discipline === 'trojice1') {
      // Hráč nesmí být v 2. trojici
      if (teamDisciplines.trojice2.includes(playerId)) {
        return {
          valid: false,
          message: `Hráč ${playerId} již nastoupil ve 2. trojici a nemůže nastoupit v 1. trojici!`
        }
      }
    } else if (discipline === 'trojice2') {
      // Hráč nesmí být v 1. trojici
      if (teamDisciplines.trojice1.includes(playerId)) {
        return {
          valid: false,
          message: `Hráč ${playerId} již nastoupil v 1. trojici a nemůže nastoupit ve 2. trojici!`
        }
      }
    }

    // Kontrola pro dvojice
    if (discipline === 'dvojice1' || discipline === 'dvojice2' || discipline === 'dvojice3') {
      // Hráč nesmí být v jiné dvojici
      const otherDoubleDisciplines = ['dvojice1', 'dvojice2', 'dvojice3'].filter(d => d !== discipline)
      for (const otherDiscipline of otherDoubleDisciplines) {
        if (teamDisciplines[otherDiscipline].includes(playerId)) {
          return {
            valid: false,
            message: `Hráč ${playerId} již nastoupil v ${otherDiscipline} a nemůže nastoupit v ${discipline}!`
          }
        }
      }
    }
  }

  return { valid: true }
}

// Funkce pro registraci hráčů v disciplíně (po zahájení zápasu)
export function registerPlayersInDiscipline(team, discipline, playerIds) {
  const teamDisciplines = gameState.playersInDisciplines[team]

  if (!teamDisciplines[discipline]) {
    teamDisciplines[discipline] = []
  }

  for (const playerId of playerIds) {
    if (!teamDisciplines[discipline].includes(playerId)) {
      teamDisciplines[discipline].push(playerId)
    }
  }
}

// Funkce pro vytvoření rozvrhu ligových zápasů
function createLeagueMatchSchedule(playersPerTeam) {
  // Pořadí dílčích zápasů podle oficiálních pravidel 1. ligy mužů nohejbalu a extraligy
  // VŽDY se hraje 8 zápasů v tomto pořadí (platí pro ligu i extraligu):
  // 1) 1. dvojice vs. 1. dvojice
  // 2) 1. trojice vs. 1. trojice
  // 3) 2. dvojice (mezinárodní) vs. 2. dvojice (mezinárodní)
  // 4) 2. trojice (mezinárodní) vs. 2. trojice (mezinárodní)
  // 5) Singl (1 vs. 1)
  // 6) 3. dvojice vs. 3. dvojice
  // 7) 1. trojice domácích vs. 2. trojice hostů (zrcadlový)
  // 8) 2. trojice domácích vs. 1. trojice hostů (zrcadlový)
  return [
    { type: 'dvojice1', homePos: 1, awayPos: 1 },
    { type: 'trojice1', homePos: 1, awayPos: 1 },
    { type: 'dvojice2', homePos: 2, awayPos: 2 },
    { type: 'trojice2', homePos: 2, awayPos: 2 },
    { type: 'singl', homePos: 1, awayPos: 1 },
    { type: 'dvojice3', homePos: 3, awayPos: 3 },
    { type: 'trojice1-vs-2', homePos: 1, awayPos: 2 },
    { type: 'trojice2-vs-1', homePos: 2, awayPos: 1 }
  ]
}

// Funkce pro kontrolu, zda liga skončila
function checkLeagueEnd() {
  if (gameState.gameMode !== 'league') return false

  const t1Score = gameState.matchesScore.team1
  const t2Score = gameState.matchesScore.team2

  // Konec při 6 bodech
  if (t1Score >= 6 || t2Score >= 6) {
    gameState.leagueEnded = true
    return true
  }

  // Konec při 5:5
  if (t1Score === 5 && t2Score === 5) {
    gameState.leagueEnded = true
    return true
  }

  return false
}

// Funkce pro získání oslovení hráče
function getPlayerNickname(playerName) {
  // Rozdělit jméno a použít křestní jméno
  const firstName = playerName.split(' ')[0]

  // Speciální oslovení pro některé hráče
  const nicknames = {
    'Josef': 'Pepo',
    'Radim': 'Radime',
    'Tomáš': 'Tomáši',
    'Ondřej': 'Ondro',
    'Roman': 'Romane',
    'David': 'Davide',
    'Jan': 'Honzo',
    'Jakub': 'Kubo',
    'Rudolf': 'Rudo',
    'Filip': 'Filipe'
  }

  return nicknames[firstName] || firstName
}

// Funkce pro náhodný výběr obranné varianty
function getRandomBlockedText(defensiveSkillId = null) {
  // Pro Blok (skill 12) vždy vracet "ZABLOKOVÁNO"
  if (defensiveSkillId === 12) {
    return 'ZABLOKOVÁNO'
  }
  // Pro ostatní obranné schopnosti náhodně vybrat
  const variants = ['VYBRÁNO', 'CHYCENO', 'UBRÁNĚNO']
  return variants[Math.floor(Math.random() * variants.length)]
}

// Funkce pro sledování výkonu hráče
function trackPlayerPerformance(playerId, success) {
  if (!gameState.playerPerformance[playerId]) {
    gameState.playerPerformance[playerId] = {
      attempts: 0,
      successes: 0,
      failures: 0,
      consecutiveFailures: 0
    }
  }

  gameState.playerPerformance[playerId].attempts++

  if (success) {
    gameState.playerPerformance[playerId].successes++
    gameState.playerPerformance[playerId].consecutiveFailures = 0
  } else {
    gameState.playerPerformance[playerId].failures++
    gameState.playerPerformance[playerId].consecutiveFailures++
  }
}

// Funkce pro získání nejhoršího hráče v týmu
function getWorstPerformer(team) {
  let worstPlayer = null
  let worstRatio = 1

  // Filtrovat trenéry - trenéři nemohou být střídáni
  const playersOnly = team.filter(p => p.position !== 'Trenér')

  for (const player of playersOnly) {
    const perf = gameState.playerPerformance[player.id]
    if (!perf || perf.attempts < 2) continue // Minimum 2 pokusy (sníženo z 3)

    const successRatio = perf.successes / perf.attempts

    // Priorita: 2+ po sobě jdoucích neúspěchů nebo nejhorší poměr
    if (perf.consecutiveFailures >= 2 || successRatio < worstRatio) {
      worstRatio = successRatio
      worstPlayer = player
    }
  }

  return worstPlayer
}

// Funkce pro nalezení nejlepšího náhradníka
// Priorita: 1) hráči, kteří ještě nehráli, 2) hráči nejdéle na lavičce, 3) stejná pozice
function findBestSubstitute(playerOut, bench, team) {
  if (bench.length === 0) return null

  // Filtrovat trenéry - trenéři nemohou hrát na hřišti
  const playersOnly = bench.filter(p => p.position !== 'Trenér')
  if (playersOnly.length === 0) return null

  // Získat hráče, kteří v aktuálním týmu ještě nehráli (nejsou v allPlayers)
  const isTeam1 = gameState.team1.includes(playerOut) || gameState.team1.some(p => p.id === playerOut.id)
  const allPlayers = isTeam1 ? gameState.team1AllPlayers : gameState.team2AllPlayers

  // Hráči, kteří ještě nehráli
  const freshPlayers = playersOnly.filter(p => !allPlayers.some(ap => ap.id === p.id))

  if (freshPlayers.length > 0) {
    // Preferovat čerstvé hráče - vybrat dle pozice
    const samePosition = freshPlayers.filter(p => p.position === playerOut.position)
    if (samePosition.length > 0) return samePosition[0]

    const compatiblePosition = getCompatiblePlayers(freshPlayers, playerOut.position)
    if (compatiblePosition.length > 0) return compatiblePosition[0]

    return freshPlayers[0]
  }

  // Všichni už hráli - vybrat toho, kdo je nejdéle na lavičce
  // (předpokládáme, že první v poli playersOnly je nejdéle tam)
  const samePosition = playersOnly.filter(p => p.position === playerOut.position)
  if (samePosition.length > 0) return samePosition[0]

  const compatiblePosition = getCompatiblePlayers(playersOnly, playerOut.position)
  if (compatiblePosition.length > 0) return compatiblePosition[0]

  return playersOnly[0]
}

// Pomocná funkce pro získání kompatibilních hráčů podle pozice
function getCompatiblePlayers(players, position) {
  if (position.includes('Polař')) {
    return players.filter(p => p.position.includes('Polař') || p.position.includes('Nahravač'))
  } else if (position.includes('Smečař') || position.includes('Blokař')) {
    return players.filter(p => p.position.includes('Smečař') || p.position.includes('Blokař'))
  } else if (position.includes('Nahravač')) {
    return players.filter(p => p.position.includes('Nahravač') || p.position.includes('Polař'))
  }
  return []
}

// Funkce pro provedení střídání
async function performSubstitution(teamName, playerOut, playerIn) {
  const isTeam1 = teamName === 'team1'
  const team = isTeam1 ? gameState.team1 : gameState.team2
  const bench = isTeam1 ? gameState.team1Bench : gameState.team2Bench
  const allPlayers = isTeam1 ? gameState.team1AllPlayers : gameState.team2AllPlayers

  // Najít index hráče v týmu
  const playerIndex = team.findIndex(p => p.id === playerOut.id)
  if (playerIndex === -1) {
    console.warn(`Hráč ${playerOut.name} nenalezen v týmu, střídání přeskočeno`)
    return false
  }

  // Vyměnit hráče
  team[playerIndex] = playerIn

  // Aktualizovat lavičku
  const benchIndex = bench.findIndex(p => p.id === playerIn.id)
  if (benchIndex !== -1) {
    bench.splice(benchIndex, 1)
  }
  bench.push(playerOut)

  // Přidat nového hráče do allPlayers pokud tam ještě není
  if (!allPlayers.some(p => p.id === playerIn.id)) {
    allPlayers.push(playerIn)
  }

  // Zvýšit počet střídání
  if (isTeam1) {
    gameState.team1SubstitutionsThisSet++
  } else {
    gameState.team2SubstitutionsThisSet++
  }

  // Vygenerovat trenérův komentář
  const perf = gameState.playerPerformance[playerOut.id]
  let reason = 'špatný výkon'

  if (perf) {
    if (perf.consecutiveFailures >= 2) {
      reason = `${perf.consecutiveFailures} neúspěchy v řadě`
    } else {
      const successRate = Math.round((perf.successes / perf.attempts) * 100)
      reason = `pouze ${successRate}% úspěšnost`
    }
  }

  const coachComments = [
    `${getPlayerVocative(playerOut)}, ${reason}! ${getPlayerFirstNameOrNickname(playerIn)} jde dovnitř!`,
    `Střídáme! ${getPlayerFirstNameOrNickname(playerOut)} ven, ${getPlayerFirstNameOrNickname(playerIn)} dovnitř. Důvod: ${reason}.`,
    `${getPlayerVocative(playerOut)}, sedni si! ${getPlayerVocative(playerIn)}, jdi na to! Proč? ${reason}!`,
    `Potřebujeme změnu. ${getPlayerFirstNameOrNickname(playerOut)} ven (${reason}), ${getPlayerFirstNameOrNickname(playerIn)} dovnitř!`
  ]

  const comment = coachComments[Math.floor(Math.random() * coachComments.length)]

  // Zobrazit střídání
  const evalDiv = getEvaluationDiv()
  evalDiv.innerHTML = `
    <div class="substitution-announcement">
      <h2>🔄 STŘÍDÁNÍ!</h2>
      <div class="substitution-details">
        <div class="player-out">
          <span class="sub-label">VEN</span>
          <img src="${playerOut.photo}" alt="${playerOut.name}" />
          <span>${playerOut.name}</span>
          <span class="position">${playerOut.position}</span>
        </div>
        <div class="sub-arrow">➡️</div>
        <div class="player-in">
          <span class="sub-label">DOVNITŘ</span>
          <img src="${playerIn.photo}" alt="${playerIn.name}" />
          <span>${playerIn.name}</span>
          <span class="position">${playerIn.position}</span>
        </div>
      </div>
    </div>
  `

  updateCoachBubble(`"${comment}"`)
  await smartDelay(4000)

  return true
}

// Funkce pro zobrazení komentáře pasivního trenéra
async function showPassiveCoachComment(playerOut) {
  const perf = gameState.playerPerformance[playerOut.id]
  let reason = 'špatný výkon'

  if (perf) {
    if (perf.consecutiveFailures >= 2) {
      reason = `${perf.consecutiveFailures} neúspěchy v řadě`
    } else {
      const successRate = Math.round((perf.successes / perf.attempts) * 100)
      reason = `${successRate}% úspěšnost`
    }
  }

  const passiveComments = [
    `${getPlayerNickname(playerOut.name)} by měl jít ven (${reason}), ale je mi to vlastně jedno...`,
    `Ten ${getPlayerNickname(playerOut.name)} už by neměl hrát (${reason}), ale třeba se zvedne.`,
    `Hrozný výkon od ${getPlayerNickname(playerOut.name)} (${reason}), ale aspoň budu brzo doma.`,
    `Normálně bych ${getPlayerNickname(playerOut.name)} vystřídal (${reason}), ale dneska se mi nechce.`,
    `${getPlayerNickname(playerOut.name)} hraje špatně (${reason}), ale co už... ať si to užije.`,
    `Měl bych střídát ${getPlayerNickname(playerOut.name)} (${reason}), ale nechci se hýbat z lavičky.`
  ]

  const comment = passiveComments[Math.floor(Math.random() * passiveComments.length)]

  // Zobrazit pouze komentář trenéra, bez skutečného střídání
  updateCoachBubble(`"${comment}"`)
  await smartDelay(3000)
}

// Funkce pro získání trenéra soupeřského týmu
function getOpponentCoach(teamId) {
  if (!teamId) return null
  const team = getTeamWithStats(teamId)
  if (team && team.players) {
    return team.players.find(p => p.position === 'Trenér')
  }
  return null
}

// Funkce pro získání náhodné trenérovy hlášky
function getCoachQuote(type, playerName) {
  const coach = players.find(p => p.position === 'Trenér')
  if (!coach || !coach.coachQuotes || !coach.coachQuotes[type]) {
    return null
  }
  const quotes = coach.coachQuotes[type]
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  const nickname = getPlayerNickname(playerName)

  return `${nickname}, ${quote.toLowerCase()}`
}

// Funkce pro přidání komentáře do týmového komentářového panelu
function addActionCommentary(message, type = 'info', teamNumber = 1) {
  // Určit správný panel podle týmu
  const panelId = `team${teamNumber}-commentary`
  const panel = document.getElementById(panelId)
  if (!panel) return

  // Odstranit placeholder pokud existuje
  const placeholder = panel.querySelector('.commentary-placeholder')
  if (placeholder) {
    placeholder.remove()
  }

  // Vytvořit nový entry jako <p> element
  const entry = document.createElement('p')
  entry.className = 'action-entry'
  entry.innerHTML = message

  // Přidat na začátek (nejnovější nahoře)
  panel.insertBefore(entry, panel.firstChild)

  // Omezit na posledních 8 komentářů
  const entries = panel.querySelectorAll('.action-entry')
  if (entries.length > 8) {
    entries[entries.length - 1].remove()
  }

  // Automaticky scrollovat nahoru
  panel.scrollTop = 0
}

// Globální counter pro čísla akcí
let actionCounter = 0

// Funkce pro reset counteru akcí (při startu nového setu)
function resetActionCounter() {
  actionCounter = 0
}

// Funkce pro získání evaluation div, ale přesměrovat na commentary panel
function getEvaluationDiv() {
  // Vrátit wrapper, který zapisuje do obou týmových panelů
  const team1Panel = document.getElementById('team1-commentary')
  const team2Panel = document.getElementById('team2-commentary')

  if (!team1Panel || !team2Panel) {
    // Fallback na původní evaluation-phase pokud panely neexistují
    return document.getElementById('evaluation-phase')
  }

  // Vytvořit wrapper objekt, který zapisuje do obou panelů
  return {
    innerHTML: '',
    set innerHTML(value) {
      // Odstranit placeholdery z obou panelů
      [team1Panel, team2Panel].forEach(panel => {
        const placeholder = panel.querySelector('.commentary-placeholder')
        if (placeholder) {
          placeholder.remove()
        }
      })

      // Inkrementovat counter akce
      actionCounter++

      // Přidat content do obou panelů
      [team1Panel, team2Panel].forEach(panel => {
        // Vytvořit nový entry jako <p> element
        const entry = document.createElement('p')
        entry.className = 'action-entry'
        entry.setAttribute('data-action-number', actionCounter)

        // Přidat oddělovač s číslem akce
        const separator = document.createElement('p')
        separator.className = 'action-separator'
        separator.innerHTML = `<strong>Akce #${actionCounter}</strong>`
        panel.appendChild(separator)

        // Přidat samotný obsah
        entry.innerHTML = value
        panel.appendChild(entry)
      })

      // BEZ automatického scrollu - nechat informace viditelné
    },
    get innerHTML() {
      return team1Panel ? team1Panel.innerHTML : ''
    },
    appendChild(child) {
      // Přidat do obou panelů
      [team1Panel, team2Panel].forEach(panel => {
        // Odstranit placeholder pokud existuje
        const placeholder = panel.querySelector('.commentary-placeholder')
        if (placeholder) {
          placeholder.remove()
        }
        // Klonovat child pro každý panel
        const clonedChild = child.cloneNode(true)
        panel.appendChild(clonedChild)
      })
      // BEZ automatického scrollu - nechat informace viditelné
    },
    // Přidat metodu pro vyčištění (např. při startu nového setu)
    clear() {
      [team1Panel, team2Panel].forEach(panel => {
        panel.innerHTML = '<p class="commentary-placeholder">Čekám na první akci...</p>'
      })
      resetActionCounter()
    }
  }
}

// Funkce pro aktualizaci bubliny trenéra
function updateCoachBubble(message) {
  const coachBubble = document.getElementById('coach-bubble')
  if (coachBubble) {
    coachBubble.innerHTML = `<p>${message}</p>`
  }
}

// Funkce pro přidání události do historie
function addEventToHistory(event) {
  gameState.eventHistory.push({
    timestamp: new Date().toLocaleTimeString(),
    message: event
  })

  const historyDiv = document.getElementById('event-history')
  if (historyDiv) {
    const eventElement = document.createElement('div')
    eventElement.className = 'history-event'
    eventElement.innerHTML = `
      <span class="event-time">[${new Date().toLocaleTimeString()}]</span>
      <span class="event-message">${event}</span>
    `
    historyDiv.appendChild(eventElement)

    // Automatické scrollování dolů
    historyDiv.scrollTop = historyDiv.scrollHeight
  }
}

// Kategorizace schopností
const defensiveSkills = [12, 13, 14, 16, 17] // Blok, Skluz, Slabší noha, Hruď, Silnější noha
const offensiveSkills = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // Včetně Tupé rány a Smečovaného servisu
const specialSkills = [10, 11, 19] // Skákaná smeč, Smečovaný servis, Vytlučený blok - speciální mechanika s házeními mincí

// Mapa videí specifických pro jednotlivé hráče a jejich dovednosti
const playerSkillVideos = {
  1: {
    3: '/videos/bokisch-smec.mp4',
    5: '/videos/bokisch-smec.mp4'
  },
  4: {
    15: {
      success: '/videos/kurka-shaolin-success.mp4',
      fail: '/videos/kurka-shaolin-fail.mp4'
    }
  },
  7: {
    15: {
      success: '/videos/majstinik-pozdrav.mp4',
      fail: '/videos/majstinik-pozdrav.mp4'
    }
  },
  'CAKO_7': {
    17: '/videos/kucera-silnejsi-noha.mp4'
  },
  'CAKO_6': {
    16: '/videos/soucek-hrud.mp4',
    3: '/videos/soucek-smec-becko.mp4'
  },
  'CAKO_3': {
    3: '/videos/kalous-smec-becko.mp4'
  },
  'CAKO_1': {
    14: {
      video: '/videos/chadim-slabsi-noha.mp4',
      condition: 'blocks_pata' // Přehrát jen když slabší noha ubrání patu (skill 6)
    },
    7: '/videos/chadim-kratas-uspesny.mp4'
  },
  'CAKO_2': {
    1: '/videos/chadim-t-smec-stred.mp4'
  },
  'CAKO_4': {
    11: '/videos/j-kalous-smecovany-servis.mp4'
  },
  'VSET_3': {
    16: '/videos/chalupa-hrud.mp4',
    8: '/videos/chalupa-kratas-za-blok.mp4',
    19: '/videos/chalupa-vytluceny-blok.mp4'
  },
  'VSET_5': {
    19: '/videos/zbranek-vytluceny-blok.mp4',
    15: '/videos/zbranek-bodlo-do-kouli.mp4',
    12: '/videos/zbranek-blok.mp4'
  },
  'VSET_6': {
    11: '/videos/dan-bily-smecovany-servis.mp4'
  },
  'VSET_8': {
    17: '/videos/dvorak-silnejsi-noha.mp4',
    5: '/videos/dvorak-klepak.mp4'
  },
  'VSET_13': {
    15: {
      success: '/videos/staricny-nesmysl-success.mp4',
      fail: '/videos/staricny-nesmysl-fail.mp4'
    },
    4: '/videos/staricny-tupa-rana.mp4'
  },
  'VSET_14': {
    4: '/videos/tomek-tupa-rana.mp4'
  },
  'CELA_1': {
    11: '/videos/andris-pata.mp4',
    4: '/videos/andris-tupa-rana.mp4'
  },
  'CELA_3': {
    14: '/videos/holas-slabsi-noha.mp4',
    11: '/videos/holas-smecovany-servis.mp4'
  },
  'CELA_5': {
    6: '/videos/matura-skakana-smec.mp4'
  },
  'CELA_6': {
    12: '/videos/nesladek-blok.mp4',
    2: '/videos/nesladek-smec-acko.mp4',
    4: '/videos/nesladek-tupa-rana.mp4',
    15: {
      success: '/videos/nesladek-nesmysl.mp4',
      fail: null
    }
  },
  'CELA_8': {
    18: '/videos/vojtisek-hlava.mp4',
    12: '/videos/vojtisek-blok.mp4',
    7: '/videos/vojtisek-kratas-pod-sebe.mp4'
  }
}

// Mapa hudby pro nesmysly jednotlivých hráčů
const playerNonsenseMusic = {
  4: '/audio/everybody-fighting.mp3'  // Ondřej Kurka - Everybody has come for fighting
}

// Epická hudba a wow zvuky pro úspěšné nesmysly
const epicNonsenseMusic = '/audio/epic-success.mp3'
const wowSound = '/audio/wow-crowd.mp3'

// Funkce pro získání videa pro hráče a dovednost
function getPlayerSkillVideo(playerId, skillId, successType = null, interaction = null) {
  // NEJDŘÍV zkontrolovat playerSkillVideos (pro speciální případy s podmínkami)
  if (playerSkillVideos[playerId] && playerSkillVideos[playerId][skillId]) {
    const video = playerSkillVideos[playerId][skillId]

    // Pokud je video objekt s podmínkou, zkontroluj podmínku
    if (typeof video === 'object' && video.condition) {
      // Podmínka blocks_pata: přehrát jen když slabší noha (skill 14) ubrání patu (skill 6)
      if (video.condition === 'blocks_pata') {
        if (interaction && interaction.attacker && interaction.attacker.skill === 6) {
          return video.video || null
        }
        // Pokud podmínka není splněna, nevrátit video
        return null
      }
      // Pro další podmínky v budoucnu přidat další bloky
    }

    // Pokud je video objekt s success/fail, vrátit správnou verzi
    if (typeof video === 'object' && successType) {
      return video[successType] || null
    }

    // Pokud je video string, ale byl požadován specifický success/fail typ,
    // vrátit video pouze pro 'success', pro 'fail' vrátit null
    // (protože generické video je obvykle úspěšná verze)
    if (typeof video === 'string') {
      if (successType === 'fail') {
        // Pokud hráč nemá fail video, nevrátit nic
        return null
      }
      // Pro success nebo když není specifikováno, vrátit video
      return video
    }
  }

  // FALLBACK: Hledat ve schoolVideos databázi
  if (schoolVideos[skillId] && schoolVideos[skillId].videos) {
    const videos = schoolVideos[skillId].videos

    // Najít všechna videa pro daného hráče
    const playerVideos = videos.filter(v => v.playerId === playerId || v.playerId === parseInt(playerId))

    if (playerVideos.length > 0) {
      // Pokud je specifikován successType, preferovat video s odpovídající hodnotou success
      if (successType === 'success') {
        const successVideo = playerVideos.find(v => v.success === true)
        if (successVideo) return successVideo.video
      } else if (successType === 'fail') {
        const failVideo = playerVideos.find(v => v.success === false)
        if (failVideo) return failVideo.video
      }

      // Jinak vrátit první video (preferovat úspěšné)
      const successVideo = playerVideos.find(v => v.success === true)
      if (successVideo) return successVideo.video
      return playerVideos[0].video
    }
  }

  return null
}

// Funkce pro náhodný výběr 4 skills pro hráče
function assignRandomSkills(player) {
  // POKUD má hráč availableSkills v profilu, použít ty (obsahují dovednosti, pro které má videa)
  if (player.availableSkills && player.availableSkills.length > 0) {
    // Filtrovat obranné a útočné dovednosti
    const playerDefensive = player.availableSkills.filter(id =>
      defensiveSkills.includes(id) && id !== 16 && id !== 17 && id !== 18
    )
    const playerOffensive = player.availableSkills.filter(id =>
      offensiveSkills.includes(id) && id !== 10 && id !== 11 && id !== 19
    )

    // Pokud má alespoň jednu obrannou a dvě útočné, použít je
    if (playerDefensive.length > 0 && playerOffensive.length >= 2) {
      const defensive = playerDefensive[Math.floor(Math.random() * playerDefensive.length)]
      const shuffledOffensive = [...playerOffensive].sort(() => Math.random() - 0.5)
      const offensive1 = shuffledOffensive[0]
      const offensive2 = shuffledOffensive[1]

      // Ultimate z dostupných dovedností (kromě speciálních)
      const validUltimate = player.availableSkills.filter(id =>
        id !== 16 && id !== 17 && id !== 18 && id !== 10 && id !== 11 && id !== 19
      )
      const ultimate = validUltimate.length > 0
        ? validUltimate[Math.floor(Math.random() * validUltimate.length)]
        : defensive

      return {
        ...player,
        assignedSkills: [defensive, offensive1, offensive2, ultimate],
        ultimateSkill: ultimate
      }
    }
  }

  // FALLBACK: Vybrat náhodné dovednosti (původní logika)
  const defensive = defensiveSkills[Math.floor(Math.random() * defensiveSkills.length)]

  const shuffledOffensive = [...offensiveSkills].sort(() => Math.random() - 0.5)
  const offensive1 = shuffledOffensive[0]
  const offensive2 = shuffledOffensive[1]

  const allSkillsExceptSpecial = [
    ...defensiveSkills.filter(s => s !== 16 && s !== 17 && s !== 18),
    ...offensiveSkills.filter(s => s !== 10 && s !== 11 && s !== 19)
  ]
  const ultimate = allSkillsExceptSpecial[Math.floor(Math.random() * allSkillsExceptSpecial.length)]

  return {
    ...player,
    assignedSkills: [defensive, offensive1, offensive2, ultimate],
    ultimateSkill: ultimate
  }
}

// Funkce pro výpočet úspěšnosti dovednosti
function calculateSkillSuccessRate(player, skillId, teamDebuff = false) {
  const skill = skills[skillId]

  // Nesmysl má vždy 10% úspěšnost
  if (skillId === 15) return 10

  // Univerzální obrany (Hruď a Silnější noha) mají vždy 100% úspěšnost
  if (skillId === 16 || skillId === 17) return 100

  if (!skill || !skill.stats) return 100
  if (!player.stats) return 0

  // Zkontrolovat, zda je hráč debuffnutý nesmyslem
  const isDebuffed = gameState.nonsenseDebuffedPlayers && gameState.nonsenseDebuffedPlayers.has(player.id)

  const statValues = skill.stats.map(statName => {
    let statValue = player.stats[statName] || 0
    // Pokud je hráč debuffnutý z nesmyslu, statistiky na polovinu
    if (isDebuffed || teamDebuff) {
      statValue = Math.floor(statValue / 2)
    }
    // Pokud je aktivní extrémní počasí, statistiky -20%
    if (gameState.weatherDebuff) {
      statValue = Math.floor(statValue * 0.8)
    }
    return statValue
  })
  const average = statValues.reduce((sum, val) => sum + val, 0) / statValues.length

  return Math.round(average)
}

// Funkce pro testování úspěchu dovednosti
function testSkillSuccess(player, skillId) {
  const successRate = calculateSkillSuccessRate(player, skillId)
  const roll = Math.random() * 100
  return roll < successRate
}

// Zvukové efekty (Web Audio API)
// Staré syntetické zvuky byly odstraněny - nyní používáme soundManager.js

// Funkce pro sledování výkonu dovedností (přidání bodů za dovednost)
function trackSkillPerformance(playerId, skillId, pointsScored) {
  const key = `${playerId}_${skillId}`
  if (!gameState.skillPerformance[key]) {
    gameState.skillPerformance[key] = 0
  }
  gameState.skillPerformance[key] += pointsScored
}

// Funkce pro získání nejlepších dovedností hráčů týmu
function getBestPerformingSkills(team, count = 3) {
  const teamPlayers = team === 'team1' ? gameState.team1 : gameState.team2
  const skillScores = []

  // Projít všechny dovednosti všech hráčů týmu
  for (const player of teamPlayers) {
    // Zkontrolovat, zda hráč má definované skills a je to pole
    if (!player.skills || !Array.isArray(player.skills)) continue

    for (const skillId of player.skills) {
      const key = `${player.id}_${skillId}`
      const score = gameState.skillPerformance[key] || 0
      if (score > 0) {
        skillScores.push({
          player: player,
          skill: skillId,
          score: score
        })
      }
    }
  }

  // Seřadit podle skóre sestupně
  skillScores.sort((a, b) => b.score - a.score)

  // Vrátit top N dovedností
  return skillScores.slice(0, count)
}

// Funkce pro kontrolu a provedení time-outu
async function checkAndPerformTimeout() {
  const currentSet = gameState.currentSet
  const t1Score = gameState.score.team1[currentSet]
  const t2Score = gameState.score.team2[currentSet]
  const diff = Math.abs(t1Score - t2Score)

  // Pokud rozdíl není 3+, timeout se nevolá
  if (diff < 3) return

  // Zjistit, který tým prohrává
  const losingTeam = t1Score < t2Score ? 'team1' : 'team2'
  const losingTeamName = losingTeam === 'team1' ? gameState.team1Name : gameState.team2Name
  const coach = losingTeam === 'team1' ? gameState.team1Coach : gameState.team2Coach

  // Zkontrolovat, zda tým už vzal timeout v tomto setu
  if (gameState.timeoutsTaken[losingTeam][currentSet]) {
    return  // Timeout už byl použit
  }

  // Označit timeout jako použitý
  gameState.timeoutsTaken[losingTeam][currentSet] = true

  // Komentář trenéra
  const coachName = coach ? (coach.nickname || coach.name.split(' ')[0]) : 'Trenér'
  const timeoutQuotes = [
    `${coachName} volá TIME-OUT! Musíme se soustředit!`,
    `TIME-OUT! ${coachName}: "Pojďme na to jinak!"`,
    `${coachName}: "Stáhneme to! TIME-OUT!"`,
    `TIME-OUT od ${coachName}! "Změníme taktiku!"`,
    `${coachName} bere TIME-OUT: "Makáme, chlapi!"`
  ]
  const timeoutQuote = timeoutQuotes[Math.floor(Math.random() * timeoutQuotes.length)]

  showCoachQuote(losingTeam, timeoutQuote)

  // Zobrazit oznámení o time-outu
  const evalDiv = getEvaluationDiv()
  evalDiv.innerHTML = `
    <div class="timeout-announcement" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; margin: 20px 0; border-radius: 15px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <h2 style="font-size: 2rem; margin: 0 0 15px 0;">⏸️ TIME-OUT ⏸️</h2>
      <p style="font-size: 1.3rem; margin: 10px 0;"><strong>${losingTeamName}</strong></p>
      <p style="font-size: 1.1rem; margin: 10px 0;">${timeoutQuote}</p>
      <p style="font-size: 0.9rem; margin-top: 20px; opacity: 0.9;">Trenér vybírá nejlepší dovednosti pro příští výměnu...</p>
    </div>
  `

  await smartDelay(1500)

  // Vybrat nejlepší dovednosti nebo ultimate
  const bestSkills = getBestPerformingSkills(losingTeam, gameState.playersPerTeam || 3)
  const teamPlayers = losingTeam === 'team1' ? gameState.team1 : gameState.team2

  // Pokud jsou dostupné nejlepší dovednosti, použij je
  if (bestSkills.length > 0) {
    gameState.nextRallySkills[losingTeam] = bestSkills

    evalDiv.innerHTML = `
      <div class="timeout-skills" style="background: rgba(0,0,0,0.8); padding: 20px; margin: 20px 0; border-radius: 15px; color: white;">
        <h3 style="margin: 0 0 15px 0;">📊 Vybrané dovednosti pro příští výměnu:</h3>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          ${bestSkills.map(skill => {
            const skillData = skills[skill.skill]
            return `<div style="background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 10px;">
              <strong>${skill.player.name}</strong><br>
              ${skillData ? skillData.name : 'Dovednost'}<br>
              <span style="color: #4ade80;">${skill.score} bodů</span>
            </div>`
          }).join('')}
        </div>
      </div>
    `
  } else {
    // Fallback: vybrat ultimate dovednosti
    const selectedSkills = []
    for (const player of teamPlayers) {
      // Zajistit, že hráč má přiřazené skills
      if (!player.assignedSkills) {
        const playerWithSkills = assignRandomSkills(player)
        player.assignedSkills = playerWithSkills.assignedSkills
        player.ultimateSkill = playerWithSkills.ultimateSkill
      }

      // Vybrat ultimate dovednost hráče
      if (player.ultimateSkill) {
        selectedSkills.push({
          player: player,
          skill: player.ultimateSkill,
          score: 0
        })
      }
    }

    gameState.nextRallySkills[losingTeam] = selectedSkills

    evalDiv.innerHTML = `
      <div class="timeout-skills" style="background: rgba(0,0,0,0.8); padding: 20px; margin: 20px 0; border-radius: 15px; color: white;">
        <h3 style="margin: 0 0 15px 0;">⭐ Vybrány ULTIMATE dovednosti pro příští výměnu!</h3>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          ${selectedSkills.map(skill => {
            const skillData = skills[skill.skill]
            return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 10px 15px; border-radius: 10px;">
              <strong>${skill.player.name}</strong><br>
              ${skillData ? skillData.name : 'Ultimate'}
            </div>`
          }).join('')}
        </div>
      </div>
    `
  }

  await smartDelay(1500)
}

export function initGame() {
  return `
    <div class="game-container">
      <div class="game-menu">
        <h1>Nohejbalová hra - NK Opava</h1>
        <div class="mode-selection">
          <h2>Vyber herní mód</h2>
          <button class="mode-btn" data-mode="1v1">1 vs 1</button>
          <button class="mode-btn" data-mode="2v2">2 vs 2</button>
          <button class="mode-btn" data-mode="3v3">3 vs 3</button>
        </div>
      </div>

      <div class="player-selection" style="display: none;">
        <h2>Vyber hráče</h2>

        <div class="teams-selection">
          <div class="team-select">
            <h3>${gameState.team1Name}</h3>

            <div class="team-sub-mode-selection">
              <label>Režim střídání:</label>
              <div class="sub-mode-buttons">
                <button class="team1-sub-mode-btn active" data-mode="auto" data-team="team1">
                  🤖 Trenér
                </button>
                <button class="team1-sub-mode-btn" data-mode="manual" data-team="team1">
                  👤 Manuální
                </button>
                <button class="team1-sub-mode-btn" data-mode="none" data-team="team1">
                  ⛔ Bez střídání
                </button>
              </div>
            </div>

            <div class="selected-players" id="team1-selected"></div>
            <div class="bench-players-selection" id="team1-bench-selected"></div>
            <h4 class="available-label">Dostupní hráči</h4>
            <div class="available-players" id="team1-available"></div>
          </div>
          <div class="team-select">
            <h3>${gameState.team2Name}</h3>

            <div class="team-sub-mode-selection">
              <label>Režim střídání:</label>
              <div class="sub-mode-buttons">
                <button class="team2-sub-mode-btn active" data-mode="auto" data-team="team2">
                  🤖 Trenér
                </button>
                <button class="team2-sub-mode-btn" data-mode="manual" data-team="team2">
                  👤 Manuální
                </button>
                <button class="team2-sub-mode-btn" data-mode="none" data-team="team2">
                  ⛔ Bez střídání
                </button>
              </div>
            </div>

            <div class="selected-players" id="team2-selected"></div>
            <div class="bench-players-selection" id="team2-bench-selected"></div>
            <h4 class="available-label">Dostupní hráči</h4>
            <div class="available-players" id="team2-available"></div>
          </div>
        </div>
        <div class="advance-selection-container" style="display: none;">
          <label class="advance-selection-checkbox">
            <input type="checkbox" id="advance-selection-mode" />
            <span>Vybrat hráče předem do všech disciplín</span>
          </label>
        </div>
        <div class="current-discipline-info" style="display: none;"></div>
        <button class="start-game-btn" style="display: none;">Začít hru</button>
      </div>

      <div class="game-court" style="display: none;">
        <button class="back-to-home-btn" onclick="window.location.reload()">← Zpět na úvodní stránku</button>
        <div class="game-layout-new">
          <!-- Horní část - Dvě pole vedle sebe -->
          <div class="top-bar">
            <!-- Levé pole - Skóre -->
            <div class="scoreboard-panel">
              <!-- Body - nad sebou -->
              <div class="current-set-score">
                <span class="score-label">Body:</span>
                <div class="score-display score-display-inline">
                  <span class="score-value" id="current-set-score">0 : 0</span>
                </div>
              </div>

              <!-- Sety -->
              <div class="sets-score">
                <span class="score-label">Sety:</span>
                <div class="score-display">
                  <span class="score-value" id="sets-score">0 : 0</span>
                </div>
              </div>

              <!-- Ligový režim - celkový stav -->
              <div class="matches-score" id="matches-score-display" style="display: none;">
                <span class="score-label">Celkový stav:</span>
                <div class="score-display">
                  <span class="score-value" id="matches-score">0 : 0</span>
                </div>
                <div class="current-match-info" id="current-match-info"></div>
              </div>
              <!-- Hidden helper elements for compatibility -->
              <div style="display: none;">
                <b id="t1-s1">0</b>
                <b id="t1-s2">0</b>
                <b id="t1-s3">5</b>
                <b id="t2-s1">0</b>
                <b id="t2-s2">0</b>
                <b id="t2-s3">5</b>
              </div>
            </div>

            <!-- Pravé pole - Vyhodnocení akcí a komentáře -->
            <div class="action-commentary-panel" id="action-commentary">
              <div class="commentary-content">
                <p class="commentary-placeholder">Připravte se na zápas...</p>
              </div>
            </div>
          </div>

          <!-- Hlavní pole - Animace, dovednosti a vyhodnocování -->
          <div class="game-center-main">
            <!-- Persistentní zobrazení trenérů, hráčů a dovedností -->
            <div id="skill-reveal" class="skill-reveal-persistent"></div>

            <!-- Vyhodnocovací okno -->
            <div class="game-info">
              <div id="current-phase"></div>
              <div id="evaluation-phase"></div>
              <div id="decisive-skill-video"></div>
            </div>
          </div>
        </div>

        <div class="substitution-modal" style="display: none;">
          <div class="substitution-modal-content">
            <button class="modal-close">&times;</button>
            <h2>Střídání hráčů</h2>
            <div class="substitution-teams">
              <div class="substitution-team">
                <h3>${gameState.team1Name}</h3>
                <div class="current-lineup" id="sub-team1-current"></div>
                <div class="bench-players" id="sub-team1-bench"></div>
              </div>
              <div class="substitution-team">
                <h3>${gameState.team2Name}</h3>
                <div class="current-lineup" id="sub-team2-current"></div>
                <div class="bench-players" id="sub-team2-bench"></div>
              </div>
            </div>
            <div class="substitution-info">
              <p id="sub-info-text">Vyberte hráče, kterého chcete vystřídat, a pak vyberte náhradníka z lavičky.</p>
            </div>
          </div>
        </div>

        <!-- Timeout modal pro výběr dovedností -->
        <div class="timeout-modal" style="display: none;">
          <div class="timeout-modal-content">
            <button class="timeout-modal-close">&times;</button>
            <h2>⏸️ TIME-OUT - Výběr dovedností</h2>
            <p class="timeout-instruction">Vyberte dovednost pro každého hráče v příští výměně:</p>
            <div class="timeout-players" id="timeout-players-list"></div>
            <div class="timeout-actions">
              <button class="timeout-confirm-btn" id="confirm-timeout-skills">Potvrdit dovednosti</button>
              <button class="timeout-cancel-btn" id="cancel-timeout">Zrušit</button>
            </div>
          </div>
        </div>
      </div>

      <div class="game-over" style="display: none;">
        <h1>Konec zápasu!</h1>
        <div id="final-score"></div>
        <button class="new-game-btn">Nová hra</button>
      </div>
    </div>
  `
}

export function setupGameHandlers() {
  // Mode selection
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameState.mode = btn.dataset.mode
      showPlayerSelection()
    })
  })

  // Substitution mode selection for Team 1
  document.querySelectorAll('.team1-sub-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.team1-sub-mode-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      gameState.team1SubstitutionMode = btn.dataset.mode
    })
  })

  // Substitution mode selection for Team 2
  document.querySelectorAll('.team2-sub-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.team2-sub-mode-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      gameState.team2SubstitutionMode = btn.dataset.mode
    })
  })

  // Back to menu
  document.querySelector('.back-menu-btn')?.addEventListener('click', () => {
    // Zastavit všechny zvuky
    if (typeof soundManager !== 'undefined' && soundManager.stopAll) {
      soundManager.stopAll()
    }
    // Vyčistit game state ze session storage
    sessionStorage.removeItem('gameState')
    // Navigovat zpět na výběr režimu simulace
    if (window.navigateToView) {
      window.navigateToView('simulation')
    } else {
      window.location.href = '/simulation'
    }
  })

  // New game
  document.querySelector('.new-game-btn')?.addEventListener('click', () => {
    resetGame()
    showPlayerSelection()
  })

  // Advance selection mode checkbox
  const advanceSelectionCheckbox = document.getElementById('advance-selection-mode')
  if (advanceSelectionCheckbox) {
    advanceSelectionCheckbox.addEventListener('change', (e) => {
      gameState.advanceSelectionMode = e.target.checked

      if (e.target.checked) {
        // Začít výběr první disciplíny
        gameState.currentDisciplineIndex = 0
        gameState.disciplineLineups = []
        // Reset výběru hráčů
        gameState.team1 = []
        gameState.team2 = []
        gameState.team1Bench = []
        gameState.team2Bench = []
        // Zobrazit info o aktuální disciplíně
        updateDisciplineInfo()
        // Re-render výběr hráčů
        const playersPerTeam = parseInt(gameState.mode[0])
        renderPlayerSelection(playersPerTeam)
      } else {
        // Vypnout advance selection mode
        gameState.disciplineLineups = []
        gameState.currentDisciplineIndex = 0
        const disciplineInfoDiv = document.querySelector('.current-discipline-info')
        if (disciplineInfoDiv) {
          disciplineInfoDiv.style.display = 'none'
        }
      }
    })
  }

  // Mobile landscape scroll-based UI state changes
  let lastScrollTop = 0
  const gameContainer = document.querySelector('.game-container')

  if (gameContainer && window.matchMedia('(max-width: 768px) and (orientation: landscape)').matches) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      if (scrollTop > lastScrollTop) {
        // Scrolling down - show coaches, hide commentary
        gameContainer.classList.remove('scroll-up')
        gameContainer.classList.add('scroll-down')
      } else if (scrollTop < lastScrollTop) {
        // Scrolling up - show score, hide commentary
        gameContainer.classList.remove('scroll-down')
        gameContainer.classList.add('scroll-up')
      }

      // Reset to default state when at top
      if (scrollTop === 0) {
        gameContainer.classList.remove('scroll-up')
        gameContainer.classList.remove('scroll-down')
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
    }, false)
  }
}

// Funkce pro zobrazení informace o aktuální vyb��rané disciplíně
function updateDisciplineInfo() {
  const disciplineInfoDiv = document.querySelector('.current-discipline-info')
  if (!disciplineInfoDiv) return

  if (gameState.advanceSelectionMode && gameState.gameMode === 'league') {
    const disciplineName = gameState.disciplineNames[gameState.currentDisciplineIndex]
    const total = gameState.disciplineNames.length
    const current = gameState.currentDisciplineIndex + 1

    disciplineInfoDiv.style.display = 'block'
    disciplineInfoDiv.innerHTML = `
      <div class="discipline-progress">
        <h3>Výběr hráčů pro disciplínu: <strong>${disciplineName}</strong></h3>
        <p>Disciplína ${current} z ${total}</p>
      </div>
    `
  } else {
    disciplineInfoDiv.style.display = 'none'
  }
}

function showPlayerSelection() {
  document.querySelector('.game-menu').style.display = 'none'
  document.querySelector('.player-selection').style.display = 'block'

  const playersPerTeam = parseInt(gameState.mode[0])

  // Skrýt/zobrazit výběr režimu střídání podle módu
  const subModeSelection = document.querySelector('.substitution-mode-selection')
  if (gameState.mode === '1v1') {
    subModeSelection.style.display = 'none'
    gameState.substitutionMode = 'none' // Ve hře 1v1 není střídání
  } else {
    subModeSelection.style.display = 'block'
  }

  // Skrýt/zobrazit sekce lavičky podle módu a režimu střídání
  if (gameState.mode === '1v1' || gameState.substitutionMode === 'none') {
    // Skrýt lavičku pro Tým 1
    const team1BenchLabel = document.querySelector('#team1-bench-selected').previousElementSibling
    const team1BenchContainer = document.querySelector('#team1-bench-selected')
    team1BenchLabel.style.display = 'none'
    team1BenchContainer.style.display = 'none'

    // Skrýt lavičku pro Tým 2
    const team2BenchLabel = document.querySelector('#team2-bench-selected').previousElementSibling
    const team2BenchContainer = document.querySelector('#team2-bench-selected')
    team2BenchLabel.style.display = 'none'
    team2BenchContainer.style.display = 'none'
  } else {
    // Zobrazit lavičku pro Tým 1
    const team1BenchLabel = document.querySelector('#team1-bench-selected').previousElementSibling
    const team1BenchContainer = document.querySelector('#team1-bench-selected')
    team1BenchLabel.style.display = 'block'
    team1BenchContainer.style.display = 'block'

    // Zobrazit lavičku pro Tým 2
    const team2BenchLabel = document.querySelector('#team2-bench-selected').previousElementSibling
    const team2BenchContainer = document.querySelector('#team2-bench-selected')
    team2BenchLabel.style.display = 'block'
    team2BenchContainer.style.display = 'block'
  }

  renderPlayerSelection(playersPerTeam)
}

function renderPlayerSelection(playersPerTeam) {
  const team1Available = document.getElementById('team1-available')
  const team2Available = document.getElementById('team2-available')

  // Aktualizovat počty
  document.getElementById('team1-needed').textContent = playersPerTeam
  document.getElementById('team2-needed').textContent = playersPerTeam

  // Filtrovat hráče - vyloučit trenéra
  const availablePlayers = players.filter(p => p.position !== 'Trenér')

  // Získat ID hráčů v obou týmech
  const team1PlayerIds = [...gameState.team1.map(p => p.id), ...gameState.team1Bench.map(p => p.id)]
  const team2PlayerIds = [...gameState.team2.map(p => p.id), ...gameState.team2Bench.map(p => p.id)]

  team1Available.innerHTML = availablePlayers.map(p => {
    const isInTeam1 = team1PlayerIds.includes(p.id)
    const isInTeam2 = team2PlayerIds.includes(p.id)
    const isDisabled = isInTeam2 // V týmu 1 zakázat hráče, kteří jsou v týmu 2
    const disabledClass = isDisabled ? 'disabled' : ''
    const selectedClass = isInTeam1 ? 'selected' : ''

    return `
      <div class="selectable-player ${disabledClass} ${selectedClass}" data-player-id="${p.id}" data-team="1">
        <img src="${p.photo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2230%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${p.number}%3C/text%3E%3C/svg%3E'" />
        <span>${p.name}</span>
      </div>
    `
  }).join('')

  team2Available.innerHTML = availablePlayers.map(p => {
    const isInTeam1 = team1PlayerIds.includes(p.id)
    const isInTeam2 = team2PlayerIds.includes(p.id)
    const isDisabled = isInTeam1 // V týmu 2 zakázat hráče, kteří jsou v týmu 1
    const disabledClass = isDisabled ? 'disabled' : ''
    const selectedClass = isInTeam2 ? 'selected' : ''

    return `
      <div class="selectable-player ${disabledClass} ${selectedClass}" data-player-id="${p.id}" data-team="2">
        <img src="${p.photo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2230%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${p.number}%3C/text%3E%3C/svg%3E'" />
        <span>${p.name}</span>
      </div>
    `
  }).join('')

  // Player selection handlers - jeden klik na kartu
  document.querySelectorAll('.selectable-player').forEach(card => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('disabled')) {
        selectPlayer(card, playersPerTeam)
      }
    })
  })
}

// Inicializovat bench arrays
if (!gameState.team1Bench) gameState.team1Bench = []
if (!gameState.team2Bench) gameState.team2Bench = []

function selectPlayer(el, playersPerTeam, location = 'lineup') {
  const playerId = parseInt(el.dataset.playerId)
  const team = el.dataset.team
  const player = players.find(p => p.id === playerId)

  const teamLineup = team === '1' ? gameState.team1 : gameState.team2
  const teamBench = team === '1' ? gameState.team1Bench : gameState.team2Bench
  const otherTeamLineup = team === '1' ? gameState.team2 : gameState.team1
  const otherTeamBench = team === '1' ? gameState.team2Bench : gameState.team1Bench

  // Kontrola, zda hráč už není vybrán někde
  const isInThisLineup = teamLineup.some(p => p.id === playerId)
  const isInThisBench = teamBench.some(p => p.id === playerId)
  const isInOtherLineup = otherTeamLineup.some(p => p.id === playerId)
  const isInOtherBench = otherTeamBench.some(p => p.id === playerId)

  // DŮLEŽITÉ: Hráč nesmí být současně v obou týmech (ani na lavičce)
  if (isInOtherLineup || isInOtherBench) {
    return // Tiše ignorovat - hráč je disabled
  }

  // Zjistit maximální počet hráčů na lavičce podle módu a režimu střídání
  const maxBench = (gameState.mode === '1v1' || gameState.substitutionMode === 'none') ? 0 : (playersPerTeam === 3 ? 2 : 1)

  // Pokud hráč už je vybrán v tomto týmu, odebrat ho
  if (isInThisLineup) {
    const index = teamLineup.findIndex(p => p.id === playerId)
    teamLineup.splice(index, 1)
  } else if (isInThisBench) {
    const index = teamBench.findIndex(p => p.id === playerId)
    teamBench.splice(index, 1)
  } else {
    // Přidat hráče - podle pořadí buď do sestavy nebo na lavičku
    if (teamLineup.length < playersPerTeam) {
      // Sestava není plná -> přidat do sestavy
      teamLineup.push(player)
    } else if (teamBench.length < maxBench) {
      // Sestava je plná, ale lavička není -> přidat na lavičku
      teamBench.push(player)
    } else {
      // Obojí je plné - ignorovat (hráč nemůže být přidán)
      return
    }
  }

  // Update displays
  updateTeamDisplay(team, teamLineup, teamBench, playersPerTeam)

  // Show start button if both teams are complete
  const startBtn = document.querySelector('.start-game-btn')
  if (gameState.team1.length === playersPerTeam && gameState.team2.length === playersPerTeam) {
    startBtn.style.display = 'block'

    // V advance selection mode měnit text tlačítka a funkci
    if (gameState.advanceSelectionMode) {
      const isLastDiscipline = gameState.currentDisciplineIndex >= gameState.disciplineNames.length - 1

      if (isLastDiscipline) {
        startBtn.textContent = 'Potvrdit a začít zápas'
        startBtn.onclick = confirmLastDisciplineAndStart
      } else {
        startBtn.textContent = 'Potvrdit sestavy'
        startBtn.onclick = confirmDisciplineLineup
      }
    } else {
      startBtn.textContent = 'Začít hru'
      startBtn.onclick = startGame
    }
  } else {
    startBtn.style.display = 'none'
  }

  // Update available players display
  renderPlayerSelection(playersPerTeam)
}

// Funkce pro potvrzení sestavy aktuální disciplíny a přechod na další
function confirmDisciplineLineup() {
  // Uložit současnou sestavu
  gameState.disciplineLineups.push({
    disciplineName: gameState.disciplineNames[gameState.currentDisciplineIndex],
    team1Lineup: [...gameState.team1],
    team2Lineup: [...gameState.team2],
    team1Bench: [...gameState.team1Bench],
    team2Bench: [...gameState.team2Bench]
  })

  // Přejít na další disciplínu
  gameState.currentDisciplineIndex++

  // Reset výběru hráčů pro další disciplínu
  gameState.team1 = []
  gameState.team2 = []
  gameState.team1Bench = []
  gameState.team2Bench = []

  // Aktualizovat UI
  updateDisciplineInfo()
  const playersPerTeam = parseInt(gameState.mode[0])
  renderPlayerSelection(playersPerTeam)

  // Skrýt tlačítko start (dokud nebudou vybrány týmy pro další disciplínu)
  const startBtn = document.querySelector('.start-game-btn')
  if (startBtn) {
    startBtn.style.display = 'none'
  }

  // Vyčistit displeje týmů
  updateTeamDisplay('1', [], [], playersPerTeam)
  updateTeamDisplay('2', [], [], playersPerTeam)
}

// Funkce pro potvrzení poslední disciplíny a začátek zápasu
function confirmLastDisciplineAndStart() {
  // Uložit sestavu poslední disciplíny
  gameState.disciplineLineups.push({
    disciplineName: gameState.disciplineNames[gameState.currentDisciplineIndex],
    team1Lineup: [...gameState.team1],
    team2Lineup: [...gameState.team2],
    team1Bench: [...gameState.team1Bench],
    team2Bench: [...gameState.team2Bench]
  })

  // Nyní máme všechny sestavy - načíst první sestavu a začít zápas
  const firstLineup = gameState.disciplineLineups[0]
  gameState.team1 = [...firstLineup.team1Lineup]
  gameState.team2 = [...firstLineup.team2Lineup]
  gameState.team1Bench = [...firstLineup.team1Bench]
  gameState.team2Bench = [...firstLineup.team2Bench]

  // Začít zápas
  startGame()
}

function updateTeamDisplay(team, lineup, bench, playersPerTeam) {
  const lineupContainer = document.getElementById(`team${team}-selected`)
  const benchContainer = document.getElementById(`team${team}-bench-selected`)
  const lineupCount = document.getElementById(`team${team}-count`)
  const benchCount = document.getElementById(`team${team}-bench-count`)

  // Skrýt/zobrazit sekci lavičky podle herního módu a režimu střídání
  const benchLabel = benchContainer.previousElementSibling // h4 element
  if (gameState.mode === '1v1' || gameState.substitutionMode === 'none') {
    benchContainer.style.display = 'none'
    benchLabel.style.display = 'none'
  } else {
    benchContainer.style.display = 'block'
    benchLabel.style.display = 'block'
  }

  // Update lineup
  lineupContainer.innerHTML = lineup.map(p => `
    <div class="selected-player-card" data-player-id="${p.id}">
      <img src="${p.photo}" alt="${p.name}" style="width: 40px; height: 40px; border-radius: 50%;" />
      <span>${p.name}</span>
      <button class="remove-player" title="Odebrat">❌</button>
    </div>
  `).join('')

  // Update bench (pouze pokud není 1v1)
  if (gameState.mode !== '1v1') {
    benchContainer.innerHTML = bench.map(p => `
      <div class="selected-player-card bench" data-player-id="${p.id}">
        <img src="${p.photo}" alt="${p.name}" style="width: 40px; height: 40px; border-radius: 50%;" />
        <span>${p.name}</span>
        <button class="remove-player" title="Odebrat">❌</button>
      </div>
    `).join('')
  }

  // Update counts
  lineupCount.textContent = lineup.length
  if (gameState.mode !== '1v1') {
    benchCount.textContent = bench.length
  }

  // Add remove handlers
  lineupContainer.querySelectorAll('.remove-player').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const card = btn.closest('.selected-player-card')
      const playerId = parseInt(card.dataset.playerId)
      const player = players.find(p => p.id === playerId)
      const index = lineup.findIndex(p => p.id === playerId)
      lineup.splice(index, 1)
      updateTeamDisplay(team, lineup, bench, playersPerTeam)
      renderPlayerSelection(playersPerTeam)
    })
  })

  benchContainer.querySelectorAll('.remove-player').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const card = btn.closest('.selected-player-card')
      const playerId = parseInt(card.dataset.playerId)
      const index = bench.findIndex(p => p.id === playerId)
      bench.splice(index, 1)
      updateTeamDisplay(team, lineup, bench, playersPerTeam)
      renderPlayerSelection(playersPerTeam)
    })
  })
}

// Pomocné funkce pro navigaci podle herních milníků
function findStartOfSet(targetSet) {
  // Najít v historii bod, kde začíná daný set (skóre 0:0)
  for (let i = 0; i < gameState.rallyHistory.length; i++) {
    const snapshot = gameState.rallyHistory[i].snapshotBefore
    if (snapshot.currentSet === targetSet &&
        snapshot.score.team1[targetSet] === 0 &&
        snapshot.score.team2[targetSet] === 0) {
      return i
    }
  }
  return -1
}

function findEndOfSet(targetSet) {
  // Najít v historii bod, kde set končí (někdo má 10 bodů)
  for (let i = gameState.rallyHistory.length - 1; i >= 0; i--) {
    const snapshot = gameState.rallyHistory[i].snapshotAfter
    if (snapshot && snapshot.currentSet === targetSet) {
      const t1 = snapshot.score.team1[targetSet]
      const t2 = snapshot.score.team2[targetSet]
      if (t1 === 10 || t2 === 10) {
        return i
      }
    }
  }
  return -1
}

function findEndOfMatch() {
  // Najít v historii bod, kde dílčí zápas končí (někdo vyhrál 2 sety)
  for (let i = gameState.rallyHistory.length - 1; i >= 0; i--) {
    const snapshot = gameState.rallyHistory[i].snapshotAfter
    if (snapshot) {
      const t1Wins = snapshot.score.team1.filter((s, idx) => s > snapshot.score.team2[idx]).length
      const t2Wins = snapshot.score.team2.filter((s, idx) => s > snapshot.score.team1[idx]).length
      if (t1Wins >= 2 || t2Wins >= 2) {
        return i
      }
    }
  }
  return -1
}

function findEndOfLeague() {
  // Najít v historii bod, kde ligový zápas končí (někdo vyhrál 4 dílčí zápasy)
  for (let i = gameState.rallyHistory.length - 1; i >= 0; i--) {
    const snapshot = gameState.rallyHistory[i].snapshotAfter
    if (snapshot && snapshot.matchesScore) {
      if (snapshot.matchesScore.team1 >= 4 || snapshot.matchesScore.team2 >= 4) {
        return i
      }
    }
  }
  return -1
}

// Funkce pro otevření timeout modalu a výběr dovedností
function openTimeoutModal(team) {
  const teamKey = team === 'team1' ? 'team1' : 'team2'
  const teamPlayers = gameState[teamKey]
  const modal = document.querySelector('.timeout-modal')
  const playersList = document.getElementById('timeout-players-list')

  // Vyčistit seznam hráčů
  playersList.innerHTML = ''

  // Pro každého hráče vytvořit výběr dovedností
  teamPlayers.forEach(player => {
    if (!player.assignedSkills) {
      const playerWithSkills = assignRandomSkills(player)
      player.assignedSkills = playerWithSkills.assignedSkills
      player.ultimateSkill = playerWithSkills.ultimateSkill
    }

    const availableSkills = [...player.assignedSkills]

    // Vytvořit kartu hráče s výběrem dovedností
    const playerCard = document.createElement('div')
    playerCard.className = 'timeout-player-card'
    playerCard.style.cssText = 'background: rgba(255,255,255,0.1); padding: 15px; margin: 10px 0; border-radius: 10px;'

    // Vytvořit grid s video náhledy pro dovednosti
    const skillsGridHTML = availableSkills.map((skillId, index) => {
      const skillData = skills[skillId]
      const videoSrc = getPlayerSkillVideo(player.id, skillId, 'success')
      const isFirst = index === 0

      return `
        <div class="skill-option ${isFirst ? 'selected' : ''}" data-skill-id="${skillId}" data-player-id="${player.id}" style="
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          background: ${isFirst ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255,255,255,0.05)'};
          border: 2px solid ${isFirst ? '#4a90e2' : 'transparent'};
          transition: all 0.2s;
          text-align: center;
        ">
          <div style="margin-bottom: 8px; font-weight: bold; font-size: 0.9rem;">
            ${skillData ? skillData.name : 'Dovednost'}
          </div>
          ${videoSrc ? `
            <video
              src="${videoSrc}"
              style="width: 100%; max-width: 150px; border-radius: 5px; aspect-ratio: 16/9; object-fit: cover;"
              muted
              loop
              playsinline
            ></video>
          ` : `
            <div style="width: 100%; max-width: 150px; height: 84px; background: rgba(0,0,0,0.3); border-radius: 5px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 2rem;">?</span>
            </div>
          `}
        </div>
      `
    }).join('')

    playerCard.innerHTML = `
      <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 15px;">
        <img src="${player.photo}" alt="${player.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />
        <h3 style="margin: 0;">${player.name}</h3>
      </div>
      <div class="skills-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
        ${skillsGridHTML}
      </div>
      <input type="hidden" class="skill-selector" data-player-id="${player.id}" value="${availableSkills[0]}" />
    `

    playersList.appendChild(playerCard)

    // Přidat click handlers pro výběr dovednosti
    const skillOptions = playerCard.querySelectorAll('.skill-option')
    const hiddenInput = playerCard.querySelector('.skill-selector')

    skillOptions.forEach(option => {
      const video = option.querySelector('video')

      // Přehrát video při hover
      if (video) {
        option.addEventListener('mouseenter', () => {
          video.play().catch(() => {})
        })
        option.addEventListener('mouseleave', () => {
          video.pause()
          video.currentTime = 0
        })
      }

      // Výběr dovednosti kliknutím
      option.addEventListener('click', () => {
        const skillId = option.dataset.skillId

        // Odstranit selected ze všech options
        skillOptions.forEach(opt => {
          opt.classList.remove('selected')
          opt.style.background = 'rgba(255,255,255,0.05)'
          opt.style.borderColor = 'transparent'
        })

        // Přidat selected na kliknutou option
        option.classList.add('selected')
        option.style.background = 'rgba(74, 144, 226, 0.3)'
        option.style.borderColor = '#4a90e2'

        // Uložit výběr do hidden inputu
        hiddenInput.value = skillId
      })
    })
  })

  // Zobrazit modal
  modal.style.display = 'flex'

  // Nastavit handler pro potvrzení
  const confirmBtn = document.getElementById('confirm-timeout-skills')
  const cancelBtn = document.getElementById('cancel-timeout')
  const closeBtn = document.querySelector('.timeout-modal-close')

  // Odstranit staré handlery
  const newConfirmBtn = confirmBtn.cloneNode(true)
  const newCancelBtn = cancelBtn.cloneNode(true)
  const newCloseBtn = closeBtn.cloneNode(true)
  confirmBtn.replaceWith(newConfirmBtn)
  cancelBtn.replaceWith(newCancelBtn)
  closeBtn.replaceWith(newCloseBtn)

  // Přidat nové handlery
  newConfirmBtn.addEventListener('click', async () => {
    const selectors = playersList.querySelectorAll('.skill-selector')
    const selectedSkills = []

    selectors.forEach(selector => {
      const playerId = parseInt(selector.dataset.playerId)
      const skillId = parseInt(selector.value)
      const player = teamPlayers.find(p => p.id === playerId)

      if (player) {
        selectedSkills.push({
          player: player,
          skill: skillId
        })
      }
    })

    // Uložit vybrané dovednosti
    gameState.nextRallySkills[teamKey] = selectedSkills

    // Zavřít modal
    modal.style.display = 'none'

    // Zobrazit potvrzení
    const evalDiv = getEvaluationDiv()
    evalDiv.innerHTML = `
      <div class="timeout-confirmation" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; margin: 20px 0; border-radius: 15px; color: white; text-align: center;">
        <h3>⏸️ TIME-OUT vzat!</h3>
        <p>Dovednosti pro příští výměnu byly vybrány.</p>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 15px;">
          ${selectedSkills.map(skill => {
            const skillData = skills[skill.skill]
            return `<div style="background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 10px;">
              <strong>${skill.player.name}</strong><br>
              ${skillData ? skillData.name : 'Dovednost'}
            </div>`
          }).join('')}
        </div>
      </div>
    `

    // Počkat chvíli, aby uživatel viděl potvrzení
    await smartDelay(2000)

    // Obnovit hru
    if (gameState.isPlaying) {
      gameState.isPaused = false
      // Pokračovat ve hře
      playNextPoint()
    }
  })

  newCancelBtn.addEventListener('click', () => {
    modal.style.display = 'none'
    // Obnovit hru pokud byla pozastavena
    if (gameState.isPlaying && gameState.isPaused) {
      gameState.isPaused = false
      playNextPoint()
    }
  })

  newCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none'
    // Obnovit hru pokud byla pozastavena
    if (gameState.isPlaying && gameState.isPaused) {
      gameState.isPaused = false
      playNextPoint()
    }
  })
}

function setupPlaybackControls() {
  // Playback speed slider
  const speedSlider = document.getElementById('playback-speed')
  const speedPercentage = document.getElementById('speed-percentage')
  if (speedSlider && speedPercentage) {
    speedSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value)
      speedPercentage.textContent = `${value}%`
      // Update game speed multiplier (0% = 0.02x velmi pomalé, 50% = 1x normální, 100% = 2x velmi rychlé)
      gameState.speedMultiplier = Math.max(value, 1) / 50
    })
  }

  // 1. TLAČÍTKO: Na začátek celého zápasu
  const restartBtn = document.getElementById('restart-match-btn')
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (gameState.rallyHistory.length > 0) {
        // Zastavit hru
        gameState.isPlaying = false
        gameState.isPaused = false

        // Jít na začátek historie
        gameState.currentRallyIndex = 0
        const rallyRecord = gameState.rallyHistory[0]

        // Obnovit stav PŘED první výměnou
        restoreGameSnapshot(rallyRecord.snapshotBefore)

        // Zobrazit hráče a dovednosti
        displayPlayersAndSkills()

        const evalDiv = getEvaluationDiv()
        evalDiv.innerHTML = `
          <div class="history-navigation">
            <h3>⏮️ Začátek zápasu</h3>
            <p>Jste na začátku historie</p>
            <p class="history-hint">Použijte tlačítko ►► pro přehrávání</p>
          </div>
        `
      } else {
        const evalDiv = getEvaluationDiv()
        evalDiv.innerHTML = '<h3>⚠️ Žádná historie k zobrazení</h3>'
      }
    })
  }

  // 2. TLAČÍTKO: Single = začátek výměny, Double = začátek setu (0:0)
  const previousBtn = document.getElementById('previous-rally-btn')
  let previousBtnClickTime = 0
  if (previousBtn) {
    previousBtn.addEventListener('click', () => {
      const now = Date.now()
      const isDoubleClick = (now - previousBtnClickTime) < 500
      previousBtnClickTime = now

      if (isDoubleClick) {
        // Double-click: Začátek aktuálního setu (0:0), pokud už je 0:0 → začátek předchozího setu
        const currentSet = gameState.currentSet
        const t1Score = gameState.score.team1[currentSet]
        const t2Score = gameState.score.team2[currentSet]

        let targetSet = currentSet
        // Pokud už jsme na 0:0, jdi na předchozí set
        if (t1Score === 0 && t2Score === 0 && currentSet > 0) {
          targetSet = currentSet - 1
        }

        const index = findStartOfSet(targetSet)
        if (index >= 0) {
          gameState.isPlaying = false
          gameState.isPaused = false
          gameState.currentRallyIndex = index
          restoreGameSnapshot(gameState.rallyHistory[index].snapshotBefore)
          displayPlayersAndSkills()

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏪ Začátek ${targetSet + 1}. setu (0:0)</h3>`
        }
      } else {
        // Single click: Začátek aktuální výměny (current rally index)
        if (gameState.currentRallyIndex >= 0 && gameState.rallyHistory.length > 0) {
          gameState.isPlaying = false
          gameState.isPaused = false
          restoreGameSnapshot(gameState.rallyHistory[gameState.currentRallyIndex].snapshotBefore)
          displayPlayersAndSkills()

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏪ Začátek výměny #${gameState.currentRallyIndex + 1}</h3>`
        }
      }
    })
  }

  // 3. TLAČÍTKO: Pauza / Spuštění zápasu
  const pauseBtn = document.getElementById('pause-rally-btn')
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!gameState.isPlaying) {
        // Spustit hru
        gameState.isPlaying = true
        gameState.isPaused = false
        playNextPoint()
        const icon = pauseBtn.querySelector('.btn-icon')
        icon.textContent = '❚❚'
        pauseBtn.title = 'Zastavit'
      } else {
        // Pozastavit/obnovit
        gameState.isPaused = !gameState.isPaused
        const icon = pauseBtn.querySelector('.btn-icon')
        if (gameState.isPaused) {
          icon.textContent = '▶'
          pauseBtn.title = 'Pokračovat'
        } else {
          icon.textContent = '❚❚'
          pauseBtn.title = 'Zastavit'
        }
      }
    })
  }

  // 4. TLAČÍTKO: Single = konec setu (10 bodů), Double = konec dílčího zápasu (2 sety)
  const nextBtn = document.getElementById('next-rally-btn')
  let nextBtnClickTime = 0
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const now = Date.now()
      const isDoubleClick = (now - nextBtnClickTime) < 500
      nextBtnClickTime = now

      if (isDoubleClick) {
        // Double-click: Konec dílčího zápasu (někdo vyhrál 2 sety)
        const index = findEndOfMatch()
        if (index >= 0) {
          // Je v historii - skočit na něj
          gameState.isPlaying = false
          gameState.isPaused = false
          gameState.currentRallyIndex = index
          restoreGameSnapshot(gameState.rallyHistory[index].snapshotAfter)
          displayPlayersAndSkills()

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏩ Konec dílčího zápasu</h3>`
        } else {
          // Není v historii - simulovat až do konce dílčího zápasu
          gameState.skipToEnd = true
          gameState.skipTarget = 'endOfMatch'

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏩ Simuluji až do konce dílčího zápasu...</h3>`

          if (!gameState.isPlaying) {
            gameState.isPlaying = true
            playNextPoint()
          }
        }
      } else {
        // Single click: Konec aktuálního setu (někdo dal 10. bod)
        const index = findEndOfSet(gameState.currentSet)
        if (index >= 0) {
          // Je v historii - skočit na něj
          gameState.isPlaying = false
          gameState.isPaused = false
          gameState.currentRallyIndex = index
          restoreGameSnapshot(gameState.rallyHistory[index].snapshotAfter)
          displayPlayersAndSkills()

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏩ Konec ${gameState.currentSet + 1}. setu</h3>`
        } else {
          // Není v historii - simulovat až do konce setu
          gameState.skipToEnd = true
          gameState.skipTarget = 'endOfSet'
          gameState.skipTargetSet = gameState.currentSet

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏩ Simuluji až do konce ${gameState.currentSet + 1}. setu...</h3>`

          if (!gameState.isPlaying) {
            gameState.isPlaying = true
            playNextPoint()
          }
        }
      }
    })
  }

  // 5. TLAČÍTKO: Konec celého ligového zápasu (někdo vyhrál 4 dílčí zápasy)
  const skipBtn = document.getElementById('skip-to-result-btn')
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      if (gameState.gameMode === 'league') {
        // Ligový režim - najít konec celého ligového zápasu v historii
        const index = findEndOfLeague()
        if (index >= 0) {
          gameState.isPlaying = false
          gameState.isPaused = false
          gameState.currentRallyIndex = index
          restoreGameSnapshot(gameState.rallyHistory[index].snapshotAfter)
          displayPlayersAndSkills()

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏩ Konec ligového zápasu</h3>`
        } else {
          // Pokud ještě není v historii, přeskočit na konec
          gameState.skipToEnd = true
          gameState.skipToLeagueEnd = true
          gameState.skipTarget = 'endOfLeague'

          const evalDiv = document.getElementById('evaluation')
          if (evalDiv) {
            evalDiv.innerHTML = '<h3>⏩⏩ Simuluji až do konce celého ligového zápasu...</h3>'
          }

          if (!gameState.isPlaying) {
            gameState.isPlaying = true
            playNextPoint()
          }
        }
      } else {
        // Tréningový režim - najít konec dílčího zápasu
        const index = findEndOfMatch()
        if (index >= 0) {
          gameState.isPlaying = false
          gameState.isPaused = false
          gameState.currentRallyIndex = index
          restoreGameSnapshot(gameState.rallyHistory[index].snapshotAfter)
          displayPlayersAndSkills()

          const evalDiv = getEvaluationDiv()
          evalDiv.innerHTML = `<h3>⏩ Konec zápasu</h3>`
        } else {
          // Pokud ještě není v historii, přeskočit
          if (confirm('Zápas ještě neskončil. Přeskočit na konečný výsledek?')) {
            gameState.skipToEnd = true

            const evalDiv = document.getElementById('evaluation')
            if (evalDiv) {
              evalDiv.innerHTML = '<h3>⏩ Přeskakuji na výsledek...</h3>'
            }

            // Pokud hra není spuštěná, spustit ji
            if (!gameState.isPlaying) {
              gameState.isPlaying = true
              playNextPoint()
            }
          }
        }
      }
    })
  }

  // Timeout tlačítka
  const timeoutTeam1Btn = document.getElementById('timeout-team1-btn')
  const timeoutTeam2Btn = document.getElementById('timeout-team2-btn')

  if (timeoutTeam1Btn) {
    timeoutTeam1Btn.addEventListener('click', () => {
      // Pozastavit hru
      if (gameState.isPlaying) {
        gameState.isPaused = true
      }
      openTimeoutModal('team1')
    })
  }

  if (timeoutTeam2Btn) {
    timeoutTeam2Btn.addEventListener('click', () => {
      // Pozastavit hru
      if (gameState.isPlaying) {
        gameState.isPaused = true
      }
      openTimeoutModal('team2')
    })
  }

  // Zvuková tlačítka
  const muteCrowdBtn = document.getElementById('mute-crowd-btn')
  const muteAllBtn = document.getElementById('mute-all-btn')

  if (muteCrowdBtn) {
    muteCrowdBtn.addEventListener('click', () => {
      // Toggle crowd sounds
      if (soundManager.crowdVolume > 0) {
        soundManager.setCrowdVolume(0)
        const iconEl = muteCrowdBtn.querySelector('.btn-icon')
        if (iconEl) iconEl.textContent = '👥🔇'
        muteCrowdBtn.title = 'Zapnout diváky'
      } else {
        soundManager.setCrowdVolume(0.2)
        const iconEl = muteCrowdBtn.querySelector('.btn-icon')
        if (iconEl) iconEl.textContent = '👥🔊'
        muteCrowdBtn.title = 'Ztlumit diváky'
      }
    })
  }

  if (muteAllBtn) {
    muteAllBtn.addEventListener('click', () => {
      // Toggle all sounds
      if (soundManager.enabled) {
        soundManager.enabled = false
        soundManager.stopAll()
        const iconEl = muteAllBtn.querySelector('.btn-icon')
        if (iconEl) iconEl.textContent = '🔇'
        muteAllBtn.title = 'Zapnout všechny zvuky'
      } else {
        soundManager.enabled = true
        // Restartovat crowd sounds pokud hra běží
        if (gameState.isPlaying && !gameState.isPaused) {
          soundManager.startCrowdSounds()
        }
        const iconEl = muteAllBtn.querySelector('.btn-icon')
        if (iconEl) iconEl.textContent = '🔊'
        muteAllBtn.title = 'Ztlumit všechny zvuky'
      }
    })
  }
}

function startGame() {
  const playersPerTeam = parseInt(gameState.mode[0])

  // Zjistit požadovaný celkový počet hráčů podle módu a režimu střídání
  let requiredTotal = playersPerTeam
  if (gameState.substitutionMode !== 'none' && gameState.mode !== '1v1') {
    requiredTotal = playersPerTeam === 3 ? 5 : 3 // 3v3 = 5 hráčů (3+2), 2v2 = 3 hráči (2+1)
  }

  // Validace celkového počtu hráčů
  const team1Total = gameState.team1.length + gameState.team1Bench.length
  const team2Total = gameState.team2.length + gameState.team2Bench.length

  if (gameState.substitutionMode !== 'none' && gameState.mode !== '1v1') {
    const benchRequired = requiredTotal - playersPerTeam
    if (team1Total < requiredTotal) {
      alert(`${gameState.team1Name} potřebuje celkem ${requiredTotal} hráčů (${playersPerTeam} na hřišti + ${benchRequired} na lavičce). Momentálně má jen ${team1Total}.`)
      return
    }
    if (team2Total < requiredTotal) {
      alert(`${gameState.team2Name} potřebuje celkem ${requiredTotal} hráčů (${playersPerTeam} na hřišti + ${benchRequired} na lavičce). Momentálně má jen ${team2Total}.`)
      return
    }
  }

  document.querySelector('.player-selection').style.display = 'none'
  document.querySelector('.game-court').style.display = 'block'

  // Inicializovat střídání
  gameState.team1StartingPlayers = [...gameState.team1]
  gameState.team2StartingPlayers = [...gameState.team2]
  gameState.team1AllPlayers = [...gameState.team1]
  gameState.team2AllPlayers = [...gameState.team2]
  // DŮLEŽITÉ: Nemazat bench - je již nastaven při výběru týmů!
  // gameState.team1Bench a gameState.team2Bench už obsahují vybrané hráče z výběru týmů
  gameState.team1SubstitutionsThisSet = 0
  gameState.team2SubstitutionsThisSet = 0
  gameState.substitutedPlayers = []

  // Nastavit nové playback ovládací prvky
  setupPlaybackControls()

  // Inicializovat jednoduchý scoreboard
  updateSimpleScoreboard()

  // Inicializovat karty trenérů v komentářových oknech
  initializeCoachCards()

  // Inicializovat ligový režim pokud je potřeba
  if (gameState.gameMode === 'league') {
    gameState.matchSchedule = createLeagueMatchSchedule(playersPerTeam)
    gameState.currentMatch = 0
    gameState.matchesScore = { team1: 0, team2: 0 }
    gameState.leagueEnded = false

    // Zobrazit počítadlo dílčích zápasů
    const matchesScoreDisplay = document.getElementById('matches-score-display')
    if (matchesScoreDisplay) {
      matchesScoreDisplay.style.display = 'block'
    }

    // Aktualizovat UI
    updateMatchesScore()
  }

  // Automaticky spustit zápas
  startAutomaticMatch()
}

let selectedPlayerOut = null
let selectedTeam = null

function openSubstitutionModal() {
  const modal = document.querySelector('.substitution-modal')
  modal.style.display = 'flex'

  // Reset selection
  selectedPlayerOut = null
  selectedTeam = null
  document.getElementById('sub-info-text').textContent = 'Vyberte hráče, kterého chcete vystřídat, a pak vyberte náhradníka z lavičky.'

  // Render current lineups
  renderSubstitutionTeam('team1')
  renderSubstitutionTeam('team2')

  // Close button
  modal.querySelector('.modal-close').onclick = () => {
    modal.style.display = 'none'
  }

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none'
    }
  }
}

function renderSubstitutionTeam(teamName) {
  const isTeam1 = teamName === 'team1'
  const team = isTeam1 ? gameState.team1 : gameState.team2
  const bench = isTeam1 ? gameState.team1Bench : gameState.team2Bench
  const currentDiv = document.getElementById(`sub-${teamName}-current`)
  const benchDiv = document.getElementById(`sub-${teamName}-bench`)

  // Render current players
  currentDiv.innerHTML = team.map(p => `
    <div class="sub-player-card" data-player-id="${p.id}" data-team="${teamName}" data-location="current">
      <img src="${p.photo}" alt="${p.name}" />
      <div class="sub-player-info">
        <span class="sub-player-name">${p.name}</span>
        <span class="sub-player-position">${p.position}</span>
      </div>
    </div>
  `).join('')

  // Filtrovat trenéry z lavičky - trenéři nemohou být střídáni na hřiště
  const benchPlayersOnly = bench.filter(p => p.position !== 'Trenér')

  // Render bench players
  if (benchPlayersOnly.length === 0) {
    benchDiv.innerHTML = '<p class="no-bench">Žádní hráči na lavičce</p>'
  } else {
    benchDiv.innerHTML = benchPlayersOnly.map(p => `
      <div class="sub-player-card bench" data-player-id="${p.id}" data-team="${teamName}" data-location="bench">
        <img src="${p.photo}" alt="${p.name}" />
        <div class="sub-player-info">
          <span class="sub-player-name">${p.name}</span>
          <span class="sub-player-position">${p.position}</span>
        </div>
      </div>
    `).join('')
  }

  // Add click handlers
  currentDiv.querySelectorAll('.sub-player-card').forEach(card => {
    card.onclick = () => selectPlayerForSubstitution(card, teamName, 'current')
  })

  benchDiv.querySelectorAll('.sub-player-card').forEach(card => {
    card.onclick = () => selectPlayerForSubstitution(card, teamName, 'bench')
  })
}

function selectPlayerForSubstitution(card, teamName, location) {
  const playerId = parseInt(card.dataset.playerId)
  const isTeam1 = teamName === 'team1'
  const team = isTeam1 ? gameState.team1 : gameState.team2
  const bench = isTeam1 ? gameState.team1Bench : gameState.team2Bench
  const startingPlayers = isTeam1 ? gameState.team1StartingPlayers : gameState.team2StartingPlayers
  const allPlayers = isTeam1 ? gameState.team1AllPlayers : gameState.team2AllPlayers
  const subsThisSet = isTeam1 ? gameState.team1SubstitutionsThisSet : gameState.team2SubstitutionsThisSet
  const playersPerTeam = parseInt(gameState.mode[0])
  const maxSubs = playersPerTeam === 3 ? 4 : 2
  const maxPlayers = playersPerTeam === 3 ? 5 : 3

  if (location === 'current') {
    // Selecting player to substitute out
    const player = team.find(p => p.id === playerId)

    // Check if at least one starting player must remain
    const isStarting = startingPlayers.some(p => p.id === playerId)
    const startingStillOnCourt = team.filter(p => startingPlayers.some(sp => sp.id === p.id)).length

    if (isStarting && startingStillOnCourt <= 1) {
      document.getElementById('sub-info-text').textContent = '❌ Alespoň jeden hráč z původní sestavy musí zůstat na hřišti!'
      return
    }

    if (bench.length === 0) {
      document.getElementById('sub-info-text').textContent = '❌ Na lavičce nejsou žádní hráči k dispozici!'
      return
    }

    // Remove previous selection
    document.querySelectorAll('.sub-player-card.selected-out').forEach(c => c.classList.remove('selected-out'))
    card.classList.add('selected-out')
    selectedPlayerOut = player
    selectedTeam = teamName
    document.getElementById('sub-info-text').textContent = `Vybrán hráč: ${player.name}. Nyní vyberte náhradníka z lavičky.`
  } else if (location === 'bench') {
    // Selecting player to substitute in
    if (!selectedPlayerOut || selectedTeam !== teamName) {
      document.getElementById('sub-info-text').textContent = '❌ Nejdříve vyberte hráče z aktuální sestavy!'
      return
    }

    if (subsThisSet >= maxSubs) {
      document.getElementById('sub-info-text').textContent = `❌ Dosažen maximální počet střídání (${maxSubs}) pro tento set!`
      return
    }

    const playerIn = bench.find(p => p.id === playerId)

    // Perform substitution
    performManualSubstitution(teamName, selectedPlayerOut, playerIn)

    // Close modal
    document.querySelector('.substitution-modal').style.display = 'none'
  }
}

async function performManualSubstitution(teamName, playerOut, playerIn) {
  await performSubstitution(teamName, playerOut, playerIn)
}

// Funkce renderCourt() odstraněna - vizualizace kurtu s hráči se již nepoužívá

// Funkce pro automatický zápas
function startAutomaticMatch() {
  gameState.isPlaying = true
  gameState.isPaused = false

  // Spustit pozadové crowd sounds
  soundManager.startCrowdSounds()

  playNextPoint()
}

function pauseMatch() {
  gameState.isPaused = true

  // Pozastavit pozadové crowd sounds
  soundManager.stopCrowdSounds()

  document.querySelector('.pause-match-btn').style.display = 'none'
  document.querySelector('.resume-match-btn').style.display = 'inline-block'
}

function resumeMatch() {
  gameState.isPaused = false

  // Obnovit pozadové crowd sounds
  soundManager.startCrowdSounds()

  document.querySelector('.resume-match-btn').style.display = 'none'
  document.querySelector('.pause-match-btn').style.display = 'inline-block'
  // Není třeba volat playNextPoint(), smartDelay automaticky pokračuje
}

function skipToEnd() {
  gameState.skipToEnd = true
  gameState.isPaused = false
  document.querySelector('.skip-to-end-btn').disabled = true
  document.querySelector('.skip-to-end-btn').textContent = '⏭️ Přeskakování...'
}

// Funkce pro kontrolu rozhodčích rozhodnutí (pouze ligový režim)
async function checkRefereeDecision() {
  // Pouze v ligovém režimu
  if (gameState.gameMode !== 'league') return null

  const evalDiv = getEvaluationDiv()

  // Získat hráče na hřišti (bez trenérů)
  const playersOnCourt = [...gameState.team1, ...gameState.team2].filter(p => p.position !== 'Trenér')
  if (playersOnCourt.length === 0) return null

  // 1% šance na napomenutí
  if (Math.random() * 100 < 1) {
    const player = playersOnCourt[Math.floor(Math.random() * playersOnCourt.length)]
    const team = gameState.team1.includes(player) ? 'team1' : 'team2'

    // Inicializovat napomenutí pokud neexistuje
    if (!gameState.playerWarnings[player.id]) {
      gameState.playerWarnings[player.id] = 0
    }

    gameState.playerWarnings[player.id]++

    // Zobrazit rozhodčího
    await showRefereeAnimation('warning')

    // Kontrola 2. napomenutí = žlutá karta
    if (gameState.playerWarnings[player.id] >= 2) {
      gameState.playerWarnings[player.id] = 0
      if (!gameState.playerYellowCards[player.id]) {
        gameState.playerYellowCards[player.id] = 0
      }
      gameState.playerYellowCards[player.id]++

      evalDiv.innerHTML = `
        <div class="referee-decision yellow-card-decision">
          <h2>🟨 ŽLUTÁ KARTA!</h2>
          <p><strong>${player.name}</strong> dostal druhé napomenutí a dostává žlutou kartu!</p>
          <p>💬 <strong>Trenér ${team === 'team1' ? gameState.team1Coach?.name : gameState.team2Coach?.name}:</strong> "To je hanba! To není žádný faul!"</p>
        </div>
      `
      await smartDelay(3000)

      // Soupeř získává bod
      const opponentTeam = team === 'team1' ? 'team2' : 'team1'
      addEventToHistory(`🟨 ${getPlayerFirstNameOrNickname(player)} dostal žlutou kartu! ${opponentTeam === 'team1' ? gameState.team1Name : gameState.team2Name} získává bod.`)

      // Kontrola druhé žluté = červená
      if (gameState.playerYellowCards[player.id] >= 2) {
        gameState.playerRedCards[player.id] = true

        evalDiv.innerHTML = `
          <div class="referee-decision red-card-decision">
            <h2>🟥 ČERVENÁ KARTA!</h2>
            <p><strong>${player.name}</strong> dostal druhou žlutou a je vyloučen ze zápasu!</p>
            <p>💬 <strong>Trenér ${team === 'team1' ? gameState.team1Coach?.name : gameState.team2Coach?.name}:</strong> "Skandál! Neuvěřitelné rozhodnutí!"</p>
          </div>
        `
        await smartDelay(3000)

        addEventToHistory(`🟥 ${getPlayerFirstNameOrNickname(player)} dostal červenou kartu a je vyloučen!`)

        return {
          type: 'red_card',
          player,
          team,
          opponentTeam,
          pointForOpponent: true
        }
      }

      return {
        type: 'yellow_card',
        player,
        team,
        opponentTeam,
        pointForOpponent: true
      }
    }

    evalDiv.innerHTML = `
      <div class="referee-decision warning-decision">
        <h2>⚠️ NAPOMENUTÍ!</h2>
        <p>Rozhodčí napomíná <strong>${player.name}</strong> za nesportovní chování!</p>
        <p>💬 <strong>Trenér ${team === 'team1' ? gameState.team1Coach?.name : gameState.team2Coach?.name}:</strong> "Cože?! To snad není možné!"</p>
      </div>
    `
    await smartDelay(2500)

    addEventToHistory(`⚠️ ${getPlayerFirstNameOrNickname(player)} byl napomenut rozhodčím (${gameState.playerWarnings[player.id]}/2)`)

    return {
      type: 'warning',
      player,
      team,
      pointForOpponent: false
    }
  }

  // 0.5% šance na přímou žlutou kartu
  if (Math.random() * 100 < 0.5) {
    const player = playersOnCourt[Math.floor(Math.random() * playersOnCourt.length)]
    const team = gameState.team1.includes(player) ? 'team1' : 'team2'

    if (!gameState.playerYellowCards[player.id]) {
      gameState.playerYellowCards[player.id] = 0
    }
    gameState.playerYellowCards[player.id]++

    // Zobrazit rozhodčího
    await showRefereeAnimation('yellow_card')

    evalDiv.innerHTML = `
      <div class="referee-decision yellow-card-decision">
        <h2>🟨 ŽLUTÁ KARTA!</h2>
        <p>Rozhodčí uděluje <strong>${player.name}</strong> žlutou kartu za hrubé nesportovní chování!</p>
        <p>💬 <strong>Trenér ${team === 'team1' ? gameState.team1Coach?.name : gameState.team2Coach?.name}:</strong> "Rozhodčí zbláznil! Měl by se jít léčit!"</p>
      </div>
    `
    await smartDelay(3000)

    const opponentTeam = team === 'team1' ? 'team2' : 'team1'
    addEventToHistory(`🟨 ${getPlayerFirstNameOrNickname(player)} dostal žlutou kartu! ${opponentTeam === 'team1' ? gameState.team1Name : gameState.team2Name} získává bod.`)

    // Kontrola druhé žluté = červená
    if (gameState.playerYellowCards[player.id] >= 2) {
      gameState.playerRedCards[player.id] = true

      evalDiv.innerHTML = `
        <div class="referee-decision red-card-decision">
          <h2>🟥 ČERVENÁ KARTA!</h2>
          <p><strong>${player.name}</strong> dostal druhou žlutou a je vyloučen ze zápasu!</p>
          <p>💬 <strong>Trenér ${team === 'team1' ? gameState.team1Coach?.name : gameState.team2Coach?.name}:</strong> "Skandální! Tohle nikdy neviděl žádný nohejbal!"</p>
        </div>
      `
      await smartDelay(3000)

      addEventToHistory(`🟥 ${getPlayerFirstNameOrNickname(player)} dostal červenou kartu a je vyloučen!`)

      return {
        type: 'red_card',
        player,
        team,
        opponentTeam,
        pointForOpponent: true
      }
    }

    return {
      type: 'yellow_card',
      player,
      team,
      opponentTeam,
      pointForOpponent: true
    }
  }

  return null
}

// Funkce pro zobrazení animace rozhodčího
async function showRefereeAnimation(type) {
  const court = document.querySelector('.game-court')
  if (!court) return

  const referee = document.createElement('div')
  referee.className = 'referee-character angry'
  referee.innerHTML = `
    <div class="referee-icon">
      <div class="referee-body angry-referee">😠</div>
      <div class="referee-whistle">📢</div>
      <div class="referee-card ${type === 'yellow_card' ? 'yellow' : type === 'warning' ? 'warning' : 'yellow'}">
        ${type === 'warning' ? '⚠️' : '🟨'}
      </div>
      <div class="referee-anger-lines">
        <div class="anger-line"></div>
        <div class="anger-line"></div>
        <div class="anger-line"></div>
      </div>
    </div>
  `

  court.appendChild(referee)

  // Animace - objevení se zleva s třesením
  setTimeout(() => {
    referee.classList.add('visible')
  }, 100)

  // Odstranění po 2 sekundách
  setTimeout(() => {
    referee.classList.remove('visible')
    setTimeout(() => {
      referee.remove()
    }, 500)
  }, 2000)

  await smartDelay(2500)
}

// Funkce pro kontrolu extrémního počasí (pouze ligový režim)
async function checkExtremeWeather() {
  // Pouze v ligovém režimu
  if (gameState.gameMode !== 'league') return

  // 0.5% šance na extrémní počasí
  if (Math.random() * 100 < 0.5 && !gameState.extremeWeather) {
    const weatherTypes = [
      { type: 'rain', name: 'Prudký déšť', icon: '🌧️', description: 'začal prudký déšť' },
      { type: 'wind', name: 'Silný vítr', icon: '💨', description: 'začal foukat silný vítr' },
      { type: 'hail', name: 'Kroupy', icon: '🌨️', description: 'začaly padat kroupy' },
      { type: 'snow', name: 'Sněžení', icon: '❄️', description: 'začalo hustě sněžit' },
      { type: 'storm', name: 'Bouřka', icon: '⛈️', description: 'přišla bouřka s blesky' }
    ]

    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
    gameState.extremeWeather = { ...weather, active: true }
    gameState.weatherDebuff = true

    const evalDiv = getEvaluationDiv()
    evalDiv.innerHTML = `
      <div class="extreme-weather-event">
        <h2>${weather.icon} EXTRÉMNÍ POČASÍ!</h2>
        <p>Uprostřed výměny ${weather.description}!</p>
        <p><strong>Rozhodčí odmítají přerušit zápas!</strong></p>
        <p class="weather-effect">⚠️ Všichni hráči mají parametry snížené o 20%</p>
        <p class="coach-quote">💬 <strong>Oba trenéři:</strong> "To je šílenství! Jak můžeme hrát v tomhle?"</p>
      </div>
    `
    await smartDelay(3500)

    addEventToHistory(`${weather.icon} ${weather.name}! Parametry všech hráčů -20%`)

    // Spustit vizuální animaci počasí
    showWeatherAnimation(weather.type)
  }
}

// Funkce pro zobrazení vizuální animace počasí
function showWeatherAnimation(weatherType) {
  const court = document.querySelector('.game-court')
  if (!court) return

  // Odstranit předchozí počasí
  const existingWeather = document.querySelector('.weather-animation')
  if (existingWeather) {
    existingWeather.remove()
  }

  const weatherContainer = document.createElement('div')
  weatherContainer.className = `weather-animation weather-${weatherType}`

  switch (weatherType) {
    case 'rain':
      // Vytvořit kapky deště - OPTIMALIZOVÁNO: snížen počet na 20
      for (let i = 0; i < 20; i++) {
        const drop = document.createElement('div')
        drop.className = 'rain-drop'
        drop.style.left = `${Math.random() * 100}%`
        drop.style.animationDelay = `${Math.random() * 2}s`
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`
        drop.style.willChange = 'transform'
        weatherContainer.appendChild(drop)
      }
      break

    case 'snow':
      // Vytvořit sněhové vločky - OPTIMALIZOVÁNO: snížen počet na 15
      for (let i = 0; i < 15; i++) {
        const flake = document.createElement('div')
        flake.className = 'snow-flake'
        flake.textContent = '❄'
        flake.style.left = `${Math.random() * 100}%`
        flake.style.animationDelay = `${Math.random() * 3}s`
        flake.style.animationDuration = `${2 + Math.random() * 2}s`
        flake.style.fontSize = `${10 + Math.random() * 10}px`
        flake.style.willChange = 'transform'
        weatherContainer.appendChild(flake)
      }
      break

    case 'hail':
      // Vytvořit kroupy - OPTIMALIZOVÁNO: snížen počet na 15
      for (let i = 0; i < 15; i++) {
        const hailstone = document.createElement('div')
        hailstone.className = 'hail-stone'
        hailstone.style.left = `${Math.random() * 100}%`
        hailstone.style.animationDelay = `${Math.random() * 1}s`
        hailstone.style.animationDuration = `${0.3 + Math.random() * 0.3}s`
        hailstone.style.willChange = 'transform'
        weatherContainer.appendChild(hailstone)
      }
      break

    case 'wind':
      // Vytvořit vítr (létající listy/prach) - OPTIMALIZOVÁNO: snížen počet na 10
      for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div')
        particle.className = 'wind-particle'
        particle.style.top = `${Math.random() * 100}%`
        particle.style.animationDelay = `${Math.random() * 2}s`
        particle.style.animationDuration = `${1 + Math.random() * 1}s`
        particle.style.willChange = 'transform'
        weatherContainer.appendChild(particle)
      }
      break

    case 'storm':
      // Vytvořit blesky
      const lightning = document.createElement('div')
      lightning.className = 'lightning-flash'
      weatherContainer.appendChild(lightning)

      // Přidat i déšť pro bouřku - OPTIMALIZOVÁNO: snížen počet na 20
      for (let i = 0; i < 20; i++) {
        const drop = document.createElement('div')
        drop.className = 'rain-drop storm-rain'
        drop.style.left = `${Math.random() * 100}%`
        drop.style.animationDelay = `${Math.random() * 2}s`
        drop.style.animationDuration = `${0.4 + Math.random() * 0.4}s`
        drop.style.willChange = 'transform'
        weatherContainer.appendChild(drop)
      }
      break
  }

  court.appendChild(weatherContainer)
}

// Pomocná funkce pro delay - zohledňuje rychlost, skipToEnd a pauzu
async function smartDelay(normalMs) {
  if (gameState.skipToEnd) {
    return
  }

  // Čekání na pauzu
  while (gameState.isPaused) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const delay = normalMs / gameState.speedMultiplier
  await new Promise(resolve => setTimeout(resolve, delay))
}

async function playNextPoint() {
  if (!gameState.isPlaying || gameState.isPaused) {
    console.log('❌ playNextPoint zastaveno - isPlaying:', gameState.isPlaying, 'isPaused:', gameState.isPaused)
    return
  }

  console.log('▶️ playNextPoint začíná - currentSet:', gameState.currentSet, 'skóre:', gameState.score.team1[gameState.currentSet], ':', gameState.score.team2[gameState.currentSet])

  await playPointWithPhases()

  console.log('✅ playPointWithPhases dokončeno - isPlaying:', gameState.isPlaying, 'isPaused:', gameState.isPaused)

  if (gameState.isPlaying && !gameState.isPaused) {
    const delay = gameState.skipToEnd ? 0 : (2000 / gameState.speedMultiplier)
    console.log('⏱️ Plánuji další playNextPoint za', delay, 'ms')
    setTimeout(() => playNextPoint(), delay)
  } else {
    console.log('⛔ Další playNextPoint se NEPLÁNUJE - isPlaying:', gameState.isPlaying, 'isPaused:', gameState.isPaused)
  }
}

// Funkce pro vytvoření snapshotu stavu hry před výměnou
function createGameSnapshot() {
  // Hluboká kopie relevantních částí gameState
  return {
    score: JSON.parse(JSON.stringify(gameState.score)),
    successfulDefenses: JSON.parse(JSON.stringify(gameState.successfulDefenses)),
    currentSet: gameState.currentSet,
    pointsPlayed: gameState.pointsPlayed,
    team1: JSON.parse(JSON.stringify(gameState.team1)),
    team2: JSON.parse(JSON.stringify(gameState.team2)),
    team1Bench: JSON.parse(JSON.stringify(gameState.team1Bench)),
    team2Bench: JSON.parse(JSON.stringify(gameState.team2Bench)),
    ultimateCooldowns: JSON.parse(JSON.stringify(gameState.ultimateCooldowns)),
    substitutedPlayers: [...gameState.substitutedPlayers],
    team1SubstitutionsThisSet: gameState.team1SubstitutionsThisSet,
    team2SubstitutionsThisSet: gameState.team2SubstitutionsThisSet,
    playerPerformance: JSON.parse(JSON.stringify(gameState.playerPerformance)),
    playerPointsContribution: JSON.parse(JSON.stringify(gameState.playerPointsContribution)),
    team1CoachMood: gameState.team1CoachMood,
    team2CoachMood: gameState.team2CoachMood,
    lastScoredAgainst: gameState.lastScoredAgainst,
    // Ligové vlastnosti
    matchesScore: JSON.parse(JSON.stringify(gameState.matchesScore)),
    currentMatch: gameState.currentMatch,
    playerWarnings: JSON.parse(JSON.stringify(gameState.playerWarnings)),
    playerYellowCards: JSON.parse(JSON.stringify(gameState.playerYellowCards)),
    playerRedCards: JSON.parse(JSON.stringify(gameState.playerRedCards)),
    extremeWeather: gameState.extremeWeather ? JSON.parse(JSON.stringify(gameState.extremeWeather)) : null,
    weatherDebuff: gameState.weatherDebuff,
    lastActivatedSkills: JSON.parse(JSON.stringify(gameState.lastActivatedSkills))
  }
}

// Funkce pro obnovení stavu hry ze snapshotu
function restoreGameSnapshot(snapshot) {
  gameState.score = JSON.parse(JSON.stringify(snapshot.score))
  gameState.successfulDefenses = JSON.parse(JSON.stringify(snapshot.successfulDefenses))
  gameState.currentSet = snapshot.currentSet
  gameState.pointsPlayed = snapshot.pointsPlayed
  gameState.team1 = JSON.parse(JSON.stringify(snapshot.team1))
  gameState.team2 = JSON.parse(JSON.stringify(snapshot.team2))
  gameState.team1Bench = JSON.parse(JSON.stringify(snapshot.team1Bench))
  gameState.team2Bench = JSON.parse(JSON.stringify(snapshot.team2Bench))
  gameState.ultimateCooldowns = JSON.parse(JSON.stringify(snapshot.ultimateCooldowns))
  gameState.substitutedPlayers = [...snapshot.substitutedPlayers]
  gameState.team1SubstitutionsThisSet = snapshot.team1SubstitutionsThisSet
  gameState.team2SubstitutionsThisSet = snapshot.team2SubstitutionsThisSet
  gameState.playerPerformance = JSON.parse(JSON.stringify(snapshot.playerPerformance))
  gameState.playerPointsContribution = JSON.parse(JSON.stringify(snapshot.playerPointsContribution))
  gameState.team1CoachMood = snapshot.team1CoachMood
  gameState.team2CoachMood = snapshot.team2CoachMood
  gameState.lastScoredAgainst = snapshot.lastScoredAgainst
  // Ligové vlastnosti
  gameState.matchesScore = JSON.parse(JSON.stringify(snapshot.matchesScore))
  gameState.currentMatch = snapshot.currentMatch
  gameState.playerWarnings = JSON.parse(JSON.stringify(snapshot.playerWarnings))
  gameState.playerYellowCards = JSON.parse(JSON.stringify(snapshot.playerYellowCards))
  gameState.playerRedCards = JSON.parse(JSON.stringify(snapshot.playerRedCards))
  gameState.extremeWeather = snapshot.extremeWeather ? JSON.parse(JSON.stringify(snapshot.extremeWeather)) : null
  gameState.weatherDebuff = snapshot.weatherDebuff
  gameState.lastActivatedSkills = JSON.parse(JSON.stringify(snapshot.lastActivatedSkills))

  // Aktualizovat UI
  updateScoreDisplay()
  updateCoachMoodUI('team1')
  updateCoachMoodUI('team2')
}

async function playPointWithPhases() {
  // Pokud nejsme v režimu přehrávání historie, uložit snapshot PŘED výměnou
  let rallyHistoryIndex = -1
  if (!gameState.isReplayingHistory) {
    const snapshotBefore = createGameSnapshot()

    // Pokud uživatel šel zpět v historii a pak zahral novou výměnu,
    // odstranit všechny budoucí záznamy
    if (gameState.currentRallyIndex < gameState.rallyHistory.length - 1) {
      gameState.rallyHistory = gameState.rallyHistory.slice(0, gameState.currentRallyIndex + 1)
    }

    // Přidat nový záznam do historie
    rallyHistoryIndex = gameState.rallyHistory.length
    gameState.rallyHistory.push({
      snapshotBefore: snapshotBefore,
      snapshotAfter: null,
      pointNumber: gameState.pointsPlayed + 1,
      setNumber: gameState.currentSet + 1
    })

    gameState.currentRallyIndex = rallyHistoryIndex
  }

  // Zvýšit počítadlo výměn
  gameState.pointsPlayed++

  let rallyWinner = null
  let rallyCount = 0
  const maxRallies = 20 // Maximální počet opakování výměny

  // Opakovat výměnu dokud není určen vítěz
  while (!rallyWinner && rallyCount < maxRallies) {
    rallyCount++

    // Check for pause
    while (gameState.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (rallyCount > 1) {
      showPhase(`POKRAČUJEME! (Pokus ${rallyCount})`)
      await smartDelay(1000)
    }

    // FÁZE 1: Aktivovat náhodné schopnosti
    showPhase('FÁZE 1: Aktivace schopností')
    const team1Skills = activateRandomSkills(gameState.team1)
    const team2Skills = activateRandomSkills(gameState.team2)
    gameState.lastActivatedSkills = { team1: team1Skills, team2: team2Skills }

    // Aktualizovat cooldowny ultimate (pouze při prvním pokusu)
    if (rallyCount === 1) {
      const allSkills = team1Skills.concat(team2Skills)
      allSkills.forEach(skill => {
        if (skill.isUltimate) {
          gameState.ultimateCooldowns[skill.player.id] = gameState.pointsPlayed
        }
      })
    }

    // FÁZE 2: Postupné odkrývání schopností
    await revealSkillsGradually(team1Skills, team2Skills)

    // FÁZE 3: Vyhodnocení
    showPhase('FÁZE 2: Vyhodnocení')
    const result = await evaluatePointWithPhases(team1Skills, team2Skills)

    // Pokud je vítěz, ukončit smyčku
    if (result.winner) {
      rallyWinner = result.winner

      // OKAMŽITĚ AKTUALIZOVAT SKÓRE PO ROZHODNUTÍ
      const team1PointsToAdd = Math.max(0, result.team1Points || 0)
      const team2PointsToAdd = Math.max(0, result.team2Points || 0)

      // Sledovat výkon dovedností PŘED aktualizací skóre
      if (result.interactions && result.interactions.length > 0) {
        for (const interaction of result.interactions) {
          if (interaction.attacker && interaction.pointChange > 0) {
            trackSkillPerformance(interaction.attacker.player.id, interaction.attacker.skill, interaction.pointChange)
          }
          if (interaction.defender && interaction.result === 'blocked') {
            trackSkillPerformance(interaction.defender.player.id, interaction.defender.skill, 1)
          }
        }
      }

      console.log('📊 Aktualizuji skóre OKAMŽITĚ:', team1PointsToAdd, ':', team2PointsToAdd)
      const scoreUpdated = await updateScore('both', team1PointsToAdd, team2PointsToAdd)
      console.log('✅ Skóre aktualizováno:', scoreUpdated)

      // ZOBRAZIT KOMENTÁŘ K VÝSLEDKU
      const evalDiv = getEvaluationDiv()
      const winnerName = rallyWinner === 'team1' ? gameState.team1Name : gameState.team2Name
      const currentScore = `${gameState.score.team1[gameState.currentSet]}:${gameState.score.team2[gameState.currentSet]}`

      evalDiv.innerHTML += `
        <div class="point-result-commentary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; margin: 15px 0; border-radius: 12px; text-align: center; border: 3px solid #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
          <h3 style="margin: 0 0 10px 0; color: white; font-size: 1.8rem; font-weight: 700;">🎯 ${winnerName} získává bod!</h3>
          <p style="margin: 0; color: white; font-size: 1.4rem; font-weight: 600;">Aktuální skóre: ${currentScore}</p>
          ${result.reason ? `<p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 1.1rem;">${result.reason}</p>` : ''}
        </div>
      `
      await smartDelay(2000)

      // FÁZE 4: Přehrání klíčových akcí s videem
      // Vyzdvihnout schopnosti, které měly vliv na výsledek
      if (result.interactions && result.interactions.length > 0) {
        // Sledovat, která videa byla již přehrána, aby se nepřehrávala vícekrát
        const playedVideos = new Set()

        // Nejdřív přehrát obranná videa (schopnosti, které zabránily bodu soupeře)
        for (const interaction of result.interactions) {
          if (interaction.result === 'blocked' && interaction.defender && interaction.hasDefenderVideo) {
            const videoKey = `${interaction.defender.player.id}_${interaction.defender.skill}_defense`
            if (!playedVideos.has(videoKey)) {
              const defenderVideo = getPlayerSkillVideo(interaction.defender.player.id, interaction.defender.skill, 'success', interaction)
              if (defenderVideo) {
                await showActionVideo(interaction, defenderVideo, true)
                playedVideos.add(videoKey)
              }
            }
          }
        }

        // Pak přehrát útočná videa (schopnosti, které daly bod) - POUZE úspěchy
        for (const interaction of result.interactions) {
          // Přehrát success video POUZE když útok byl úspěšný A dal bod
          if (interaction.result === 'success' && interaction.pointChange > 0) {
            const videoKey = `${interaction.attacker.player.id}_${interaction.attacker.skill}_success`
            if (!playedVideos.has(videoKey)) {
              const attackerVideo = getPlayerSkillVideo(interaction.attacker.player.id, interaction.attacker.skill, 'success')
              if (attackerVideo) {
                await showActionVideo(interaction, attackerVideo, false)
                playedVideos.add(videoKey)
              }
            }
          }
        }

        // Nakonec přehrát neúspěšné útoky (které NEDALY bod nebo daly bod soupeři)
        for (const interaction of result.interactions) {
          // Přehrát fail video POUZE když útok selhal nebo dal bod soupeři
          if (interaction.result === 'failed' || interaction.pointChange < 0 || (interaction.pointChange === 0 && interaction.result !== 'success')) {
            const videoKey = `${interaction.attacker.player.id}_${interaction.attacker.skill}_fail`
            if (!playedVideos.has(videoKey)) {
              const attackerVideo = getPlayerSkillVideo(interaction.attacker.player.id, interaction.attacker.skill, 'fail')
              // POUZE přehrát video pokud existuje fail verze
              if (attackerVideo) {
                await showActionVideo(interaction, attackerVideo, false, true) // true = failed
                playedVideos.add(videoKey)
              }
              // POKUD NEEXISTUJE FAIL VIDEO, NEPŘEHRÁVAT ŽÁDNÉ VIDEO
            }
          }
        }

        // Přehrát videa nesmyslů (skill 15) - vždy, ať už úspěšné nebo neúspěšné
        for (const interaction of result.interactions) {
          if (interaction.attacker && interaction.attacker.skill === 15) {
            console.log('🎬 Zpracovávám nesmysl od:', interaction.attacker.player.name)
            const successType = (interaction.result === 'success' || interaction.pointChange > 0) ? 'success' : 'fail'
            console.log('  Typ výsledku:', successType)

            // Uložit výsledek do skill objektu
            interaction.attacker.successType = successType

            // Aktualizovat video v ikoně
            const icons = document.querySelectorAll(`.skill-ball-container[data-player-id="${interaction.attacker.player.id}"]`)
            for (const icon of icons) {
              const videoElement = icon.querySelector('.skill-icon-video')
              if (videoElement) {
                const correctVideo = getPlayerSkillVideo(interaction.attacker.player.id, 15, successType)
                if (correctVideo) {
                  videoElement.src = correctVideo
                }
              }
            }

            const nonsenseVideo = getPlayerSkillVideo(interaction.attacker.player.id, 15, successType)
            console.log('  Video nalezeno:', !!nonsenseVideo)
            if (nonsenseVideo) {
              console.log('  Přehrávám video:', nonsenseVideo)
              await showActionVideo(interaction, nonsenseVideo, false, successType === 'fail')
              console.log('  Video přehráno')
            } else {
              console.log('  Video nenalezeno, přeskakuji přehrávání')
            }
          }
        }
        console.log('✅ Všechna videa nesmyslů přehrána')
      }

      // Zkontrolovat možnost time-outu (pokud skóre bylo aktualizováno)
      if (scoreUpdated) {
        await checkAndPerformTimeout()
      }

      // TEPRVE TEĎ provést střídání po nesmyslu, pokud je potřeba (AŽ PO AKTUALIZACI SKÓRE)
      if (result.substitution) {
        const sub = result.substitution
        console.log('🔄 Provádím střídání po nesmyslu:', sub.playerOut.name, '->', sub.playerIn.name)
        try {
          gameState.substitutedPlayers.push(sub.playerId)
          await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
          console.log('✅ Střídání dokončeno')
        } catch (error) {
          console.error('❌ Chyba při střídání po nesmyslu:', error)
        }
      } else {
        console.log('ℹ️ Žádné střídání po nesmyslu není potřeba')
      }

      // Pokud skóre nebylo aktualizováno (10:10), výměna pokračuje
      if (!scoreUpdated) {
        // Výměna musí pokračovat kvůli pravidlu 10:10
        await smartDelay(2000)
        // Nastavit výsledek jako null, aby se výměna opakovala
        result.winner = null
      }
    }

    // Pokud je 0:0, výměna pokračuje se stejnými hráči
    if (!result.winner) {
      const evalDiv = getEvaluationDiv()
      evalDiv.innerHTML = `
        <div class="rally-continues">
          <h2>🔄 Výměna pokračuje!</h2>
          <p>Nové schopnosti se aktivují...</p>
        </div>
      `
      await smartDelay(1500)
    } else if (result.winner === 'draw') {
      // Stejný počet bodů - body se připočítají a začne nová výměna
      const evalDiv = getEvaluationDiv()
      evalDiv.innerHTML = `
        <div class="rally-continues draw">
          <h2>⚖️ Stejný počet bodů: ${result.team1Points}:${result.team2Points}</h2>
          <p>Body se připočítají oběma týmům.</p>
          <p>Začíná nová výměna...</p>
        </div>
      `
      await smartDelay(2000)
      // Nastavit winner na null, aby while cyklus skončil
      rallyWinner = 'draw'
    }
  }

  // Zkontrolovat možnost střídání (pouze v auto režimu a pokud výměna skončila)
  if (rallyWinner && gameState.substitutionMode === 'auto' && gameState.mode !== '1v1') {
    await checkAndPerformSubstitutions()
  }

  // Zkontrolovat rozhodčího a počasí (pouze v ligovém režimu)
  if (rallyWinner && gameState.gameMode === 'league') {
    // Nejprve zkontrolovat počasí
    await checkExtremeWeather()

    // Pak zkontrolovat rozhodčího
    const refereeDecision = await checkRefereeDecision()

    // Zpracovat rozhodčí rozhodnutí
    if (refereeDecision) {
      // Pokud byl udělena žlutá nebo červená karta, soupeř získává bod
      if (refereeDecision.pointForOpponent) {
        if (refereeDecision.opponentTeam === 'team1') {
          await updateScore('team1', 1, 0)
        } else {
          await updateScore('team2', 0, 1)
        }
      }

      // Střídání hráče po kartě
      if (refereeDecision.type !== 'warning') {
        // Pro žlutou nebo červenou kartu provést střídání
        try {
          const teamName = refereeDecision.team
          const playerOut = refereeDecision.player
          const bench = teamName === 'team1' ? gameState.team1Bench : gameState.team2Bench

          // Filtrovat trenéry z lavičky
          const playersOnBench = bench.filter(p => p.position !== 'Trenér')

          if (playersOnBench.length > 0) {
            const playerIn = playersOnBench[0]  // První hráč z lavičky
            await performSubstitution(teamName, playerOut, playerIn)

            const evalDiv = getEvaluationDiv()
            evalDiv.innerHTML = `
              <div class="substitution-after-card">
                <h3>🔄 STŘÍDÁNÍ PO KARTĚ</h3>
                <p>Trenér stahuje <strong>${playerOut.name}</strong> z hřiště!</p>
                <p>Na hřiště jde <strong>${playerIn.name}</strong>.</p>
              </div>
            `
            await smartDelay(2000)
          } else {
            // Žádný hráč na lavičce - hráč zůstává (kromě červené)
            if (refereeDecision.type === 'red_card') {
              // Červená karta - hráč musí opustit hřiště, tým pokračuje s méně hráči
              const teamPlayers = teamName === 'team1' ? gameState.team1 : gameState.team2
              const index = teamPlayers.findIndex(p => p.id === playerOut.id)
              if (index !== -1) {
                teamPlayers.splice(index, 1)

                const evalDiv = getEvaluationDiv()
                evalDiv.innerHTML = `
                  <div class="red-card-removal">
                    <h3>🟥 VYLOUČENÍ Z HŘIŠTĚ</h3>
                    <p><strong>${playerOut.name}</strong> opouští hřiště!</p>
                    <p>${teamName === 'team1' ? gameState.team1Name : gameState.team2Name} pokračuje s ${teamPlayers.length} hráči!</p>
                  </div>
                `
                await smartDelay(2500)
              }
            }
          }
        } catch (error) {
          console.error('Chyba při střídání po kartě:', error)
        }
      }
    }
  }

  // Uložit snapshot PO výměně (pokud nejsme v režimu přehrávání)
  if (!gameState.isReplayingHistory && rallyHistoryIndex >= 0) {
    const snapshotAfter = createGameSnapshot()
    gameState.rallyHistory[rallyHistoryIndex].snapshotAfter = snapshotAfter
  }

  // Zkontrolovat konec hry
  checkGameEnd()
}

// Funkce pro kontrolu a provedení automatických střídání
async function checkAndPerformSubstitutions() {
  const playersPerTeam = parseInt(gameState.mode[0])

  // Pasivní trenér - pouze komentuje, neměří
  const isPassiveCoach = gameState.coachMode === 'passive'

  // Kontrola týmu 1
  const maxSubs1 = playersPerTeam === 3 ? 4 : (playersPerTeam === 2 ? 2 : 0)
  if (gameState.team1SubstitutionsThisSet < maxSubs1 && gameState.team1Bench.length > 0) {
    const worstPlayer = getWorstPerformer(gameState.team1)
    if (worstPlayer) {
      // Ověřit, že hráč není z původní sestavy nebo že zbývá alespoň 1 z původní sestavy
      const isStarting = gameState.team1StartingPlayers.some(p => p.id === worstPlayer.id)
      const startingStillOnCourt = gameState.team1.filter(p =>
        gameState.team1StartingPlayers.some(sp => sp.id === p.id)
      ).length

      // Střídat lze pouze pokud na hřišti zůstane alespoň 1 hráč z původní sestavy
      if (!isStarting || startingStillOnCourt > 1) {
        const substitute = findBestSubstitute(worstPlayer, gameState.team1Bench, gameState.team1)
        if (substitute) {
          try {
            if (isPassiveCoach) {
              // Pasivní trenér pouze komentuje
              await showPassiveCoachComment(worstPlayer)
            } else {
              // Aktivní nebo hyperaktivní trenér střídá
              await performSubstitution('team1', worstPlayer, substitute)
            }
          } catch (error) {
            console.error('Chyba při automatickém střídání týmu 1:', error)
          }
        }
      }
    }
  }

  // Kontrola týmu 2
  const maxSubs2 = playersPerTeam === 3 ? 4 : (playersPerTeam === 2 ? 2 : 0)
  if (gameState.team2SubstitutionsThisSet < maxSubs2 && gameState.team2Bench.length > 0) {
    const worstPlayer = getWorstPerformer(gameState.team2)
    if (worstPlayer) {
      const isStarting = gameState.team2StartingPlayers.some(p => p.id === worstPlayer.id)
      const startingStillOnCourt = gameState.team2.filter(p =>
        gameState.team2StartingPlayers.some(sp => sp.id === p.id)
      ).length

      if (!isStarting || startingStillOnCourt > 1) {
        const substitute = findBestSubstitute(worstPlayer, gameState.team2Bench, gameState.team2)
        if (substitute) {
          try {
            if (isPassiveCoach) {
              // Pasivní trenér pouze komentuje
              await showPassiveCoachComment(worstPlayer)
            } else {
              // Aktivní nebo hyperaktivní trenér střídá
              await performSubstitution('team2', worstPlayer, substitute)
            }
          } catch (error) {
            console.error('Chyba při automatickém střídání týmu 2:', error)
          }
        }
      }
    }
  }
}

function activateRandomSkills(team) {
  const activatedSkills = []

  // Zjistit, zda se jedná o team1 nebo team2
  const isTeam1 = team === gameState.team1
  const teamKey = isTeam1 ? 'team1' : 'team2'

  // Zkontrolovat, zda jsou předvybrané schopnosti z time-outu
  const preselectedSkills = gameState.nextRallySkills[teamKey]
  if (preselectedSkills && preselectedSkills.length > 0) {
    // Použít předvybrané schopnosti
    preselectedSkills.forEach(skillObj => {
      const isDefensive = defensiveSkills.includes(skillObj.skill)
      const isOffensive = offensiveSkills.includes(skillObj.skill)
      const isSpecial = specialSkills.includes(skillObj.skill)

      activatedSkills.push({
        player: skillObj.player,
        skill: skillObj.skill,
        isUltimate: skillObj.skill === skillObj.player.ultimateSkill,
        isDefensive: isDefensive,
        isOffensive: isOffensive,
        isSpecial: isSpecial,
        isNonsense: skillObj.skill === 15
      })
    })

    // Vymazat předvybrané schopnosti po použití
    gameState.nextRallySkills[teamKey] = []
    return activatedSkills
  }

  // Pokud nejsou předvybrané schopnosti, pokračovat normálně
  // Projít všechny hráče a aktivovat náhodné schopnosti
  team.forEach(player => {
    // Pokud hráč ještě nemá přiřazené skills, přiřadit je
    if (!player.assignedSkills) {
      const playerWithSkills = assignRandomSkills(player)
      player.assignedSkills = playerWithSkills.assignedSkills
      player.ultimateSkill = playerWithSkills.ultimateSkill
    }

    let availableSkills = [...player.assignedSkills]

    // Zkontrolovat cooldown ultimate
    const lastUltimateUse = gameState.ultimateCooldowns[player.id]
    const canUseUltimate = !lastUltimateUse || (gameState.pointsPlayed - lastUltimateUse) >= 5

    // Odebrat ultimate ze seznamu, pokud je na cooldownu
    if (!canUseUltimate) {
      availableSkills = availableSkills.filter(s => s !== player.ultimateSkill)
    }

    // Zkontrolovat, zda hráč nebyl vystřídán za nesmysl
    if (gameState.substitutedPlayers.includes(player.id)) {
      return
    }

    // Zkontrolovat, zda hráč nemá červenou kartu (vyloučení ze hry)
    if (gameState.playerRedCards[player.id]) {
      return
    }

    // 1% šance na nesmysl místo normální schopnosti
    const nonsenseRoll = Math.random() * 100
    let selectedSkill

    if (nonsenseRoll < 1) {
      selectedSkill = 15
    } else if (availableSkills.length > 0) {
      selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)]
    } else {
      return
    }

    const isDefensive = defensiveSkills.includes(selectedSkill)
    const isOffensive = offensiveSkills.includes(selectedSkill)
    const isSpecial = specialSkills.includes(selectedSkill)
    const isNonsense = selectedSkill === 15

    activatedSkills.push({
      player: player,
      skill: selectedSkill,
      isUltimate: selectedSkill === player.ultimateSkill,
      isDefensive: isDefensive,
      isOffensive: isOffensive,
      isSpecial: isSpecial,
      isNonsense: isNonsense
    })
  })

  return activatedSkills
}

// Funkce pro přehrání audio souboru
function playAudio(audioPath, volume = 1.0) {
  return new Promise((resolve) => {
    const audio = new Audio(audioPath)
    audio.volume = volume
    audio.addEventListener('ended', resolve)
    audio.addEventListener('error', () => {
      console.warn(`Audio file not found: ${audioPath}`)
      resolve()
    })
    audio.play().catch(() => {
      console.warn(`Could not play audio: ${audioPath}`)
      resolve()
    })
  })
}

// Funkce pro přehrání audio na pozadí (bez čekání)
function playAudioBackground(audioPath, volume = 1.0) {
  const audio = new Audio(audioPath)
  audio.volume = volume
  audio.addEventListener('error', () => {
    console.warn(`Audio file not found: ${audioPath}`)
  })
  audio.play().catch(() => {
    console.warn(`Could not play audio: ${audioPath}`)
  })
  return audio
}

// Zobrazit aktuální fázi - DEAKTIVOVÁNO (zbytečné názvy fází)
function showPhase(phaseText) {
  const phaseDiv = document.getElementById('current-phase')
  phaseDiv.innerHTML = '' // Nezobrazovat název fáze
}

// Určit, který hráč v trojici jde k síti (priorita: blok aktivovaný > blok mezi schopnostmi > nahravač > blokař > náhodný)
function getNetPlayerIndex(teamSkills) {
  if (teamSkills.length !== 3) return -1 // Platí jen pro trojice

  // 1. Priorita: hráč s aktivovanou schopností Blok (skill ID 12)
  const activeBlockPlayerIndex = teamSkills.findIndex(s => s.skill === 12)
  if (activeBlockPlayerIndex !== -1) return activeBlockPlayerIndex

  // 2. Priorita: hráč, který má Blok mezi svými 4 přidělenými schopnostmi
  const blockInAssignedIndex = teamSkills.findIndex(s =>
    s.player.assignedSkills && s.player.assignedSkills.includes(12)
  )
  if (blockInAssignedIndex !== -1) return blockInAssignedIndex

  // 3. Priorita: hráč s pozicí Nahravač
  const setterIndex = teamSkills.findIndex(s => s.player.position === 'Nahravač')
  if (setterIndex !== -1) return setterIndex

  // 4. Priorita: hráč s pozicí Blokař
  const blockerIndex = teamSkills.findIndex(s => s.player.position === 'Blokař')
  if (blockerIndex !== -1) return blockerIndex

  // 5. Jinak náhodný hráč (prostřední index - index 1)
  return 1
}

// Okamžité zobrazení hráčů a dovedností (bez animací) - pro navigaci historií
function displayPlayersAndSkills() {
  const team1Skills = gameState.lastActivatedSkills.team1
  const team2Skills = gameState.lastActivatedSkills.team2

  // Pokud nejsou žádné aktivované dovednosti, vyčistit zobrazení
  if (!team1Skills || !team2Skills || team1Skills.length === 0 || team2Skills.length === 0) {
    const revealDiv = document.getElementById('skill-reveal')
    if (revealDiv) {
      revealDiv.innerHTML = '<div class="no-skills-message"><p>Žádné aktivované dovednosti v této výměně</p></div>'
    }
    return
  }

  const revealDiv = document.getElementById('skill-reveal')

  // Získat trenéry týmů - použít již načtené z gameState nebo fallback
  const team1Coach = gameState.team1Coach || players.find(p => p.position === 'Trenér')
  const team2Coach = gameState.team2Coach || (gameState.opponentTeamId ? getOpponentCoach(gameState.opponentTeamId) : team1Coach)

  // Get current mood for each team
  const team1Mood = COACH_MOODS[gameState.team1CoachMood]
  const team2Mood = COACH_MOODS[gameState.team2CoachMood]

  // Určit, kdo jde k síti v trojicích
  const team1NetPlayerIndex = getNetPlayerIndex(team1Skills)
  const team2NetPlayerIndex = getNetPlayerIndex(team2Skills)

  revealDiv.innerHTML = `
    <div class="skills-reveal-container">
      <!-- Levý trenérský panel -->
      <div class="coach-panel coach-panel-left" id="coach1-panel-side">
        <div class="coach-panel-header">
          <img class="coach-photo" id="coach1-photo" src="${team1Coach?.photo || '/players/sirocky.jpg'}" alt="Trenér">
          <div class="coach-name" id="coach1-name">${team1Coach?.name || 'Trenér'}</div>
        </div>
        <div class="coach-comment" id="coach1-comment"></div>
      </div>

      <!-- Hřiště uprostřed -->
      <div class="court-center">
        <div class="court-area">
          <div class="court-lines">
            <div class="court-net"></div>
            <div class="court-service-line court-service-line-left"></div>
            <div class="court-service-line court-service-line-right"></div>
          </div>

          <div class="team-section team-left">
            <div class="team-horizontal-layout">
              <div id="team1-players-skills-list" class="team-players-skills-list"></div>
            </div>
          </div>

          <div class="team-section team-right">
            <div class="team-horizontal-layout">
              <div id="team2-players-skills-list" class="team-players-skills-list"></div>
            </div>
          </div>

          <!-- Hráči u sítě (jen pro trojice) -->
          <div class="net-players-section">
            <div id="team1-net-player" class="net-player team1-net-player"></div>
            <div id="team2-net-player" class="net-player team2-net-player"></div>
          </div>
        </div>
      </div>

      <!-- Pravý trenérský panel -->
      <div class="coach-panel coach-panel-right" id="coach2-panel-side">
        <div class="coach-panel-header">
          <img class="coach-photo" id="coach2-photo" src="${team2Coach?.photo || '/images/avatar-placeholder.png'}" alt="Trenér">
          <div class="coach-name" id="coach2-name">${team2Coach?.name || 'Trenér'}</div>
        </div>
        <div class="coach-comment" id="coach2-comment"></div>
      </div>
    </div>
  `

  const team1PlayerSkillsList = document.getElementById('team1-players-skills-list')
  const team2PlayerSkillsList = document.getElementById('team2-players-skills-list')
  const team1NetPlayerEl = document.getElementById('team1-net-player')
  const team2NetPlayerEl = document.getElementById('team2-net-player')

  const team1SkillIcons = []
  const team2SkillIcons = []

  // Zobrazit všechny dovednosti týmu 1 OKAMŽITĚ (bez delay)
  for (let i = 0; i < team1Skills.length; i++) {
    const skill = team1Skills[i]
    const isNetPlayer = (i === team1NetPlayerIndex)
    let skillType, typeIcon
    if (skill.isNonsense || skill.skill === 15) {
      // Nesmysl: speciální růžová pulsující ikona
      skillType = 'nonsense'
      typeIcon = '🏐'
    } else if (skill.isUltimate) {
      // Ultimate schopnosti: černá barva + ikona nohejbalového míče
      if (skill.isDefensive) {
        skillType = 'ultimate-defensive'
        typeIcon = '🏐'
      } else {
        skillType = 'ultimate-offensive'
        typeIcon = '🏐'
      }
    } else if (skill.isSpecial) {
      if (skill.skill === 4) {
        skillType = 'offensive'
        typeIcon = '🏐'
      } else if (skill.skill === 11) {
        skillType = 'defensive'
        typeIcon = '🏐'
      }
    } else if (skill.isDefensive) {
      skillType = 'defensive'
      typeIcon = '🏐'
    } else {
      skillType = 'offensive'
      typeIcon = '🏐'
    }
    const skillName = skill.isNonsense ? (skill.player.nonsenseName || 'Nesmysl') : skills[skill.skill].name

    const isDebuffed = gameState.nonsenseDebuffedPlayers && gameState.nonsenseDebuffedPlayers.has(skill.player.id)
    let avgStats = Math.round((skill.player.stats.rychlost + skill.player.stats.obratnost + skill.player.stats.sila + skill.player.stats.svih + skill.player.stats.technika + skill.player.stats.obetavost + skill.player.stats.psychika + skill.player.stats.cteniHry + skill.player.stats.odolnost) / 9)

    if (isDebuffed) {
      avgStats = Math.round(avgStats / 2)
    }

    const playerSkillPair = document.createElement('div')
    playerSkillPair.className = `player-skill-pair ${isNetPlayer ? 'net-player-pair' : ''}`
    const displayStats = skill.player.stats || {}
    playerSkillPair.innerHTML = `
      <div class="game-hexagon-card opava-card">
        <div class="game-player-image">
          <img src="${skill.player.photo}" alt="${skill.player.name}" />
        </div>
        <div class="game-card-badge">
          <div class="game-card-badge-rating">${avgStats}</div>
        </div>
        <div class="game-player-number">${skill.player.number || ''}</div>
        <div class="game-player-info">
          <h3 class="game-player-name">${skill.player.name}</h3>
          <p class="game-player-position">${skill.player.position || 'Univerzál'}</p>
          <div class="game-player-stats-mini">
            <div class="game-stat"><span class="game-stat-value">${displayStats.rychlost || '-'}</span><span class="game-stat-label">Rychlost</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.obratnost || '-'}</span><span class="game-stat-label">Obratnost</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.sila || '-'}</span><span class="game-stat-label">Rána</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.technika || '-'}</span><span class="game-stat-label">Technika</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.obetavost || '-'}</span><span class="game-stat-label">Obětavost</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.svih || '-'}</span><span class="game-stat-label">Svih</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.psychika || '-'}</span><span class="game-stat-label">Psychika</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.cteniHry || '-'}</span><span class="game-stat-label">Čtení hry</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats.odolnost || '-'}</span><span class="game-stat-label">Odolnost</span></div>
          </div>
        </div>
      </div>
      <div class="skill-ball-container" data-skill-index="${i}" data-team="team1" data-player-id="${skill.player.id}">
        <div class="skill-ball ${skillType}">
          <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
        </div>
        <div class="skill-ball-string"></div>
        <div class="skill-ball-tag ${skillType}">
          <p class="skill-ball-tag-text">${skillName}</p>
        </div>
      </div>
    `

    if (isNetPlayer) {
      team1NetPlayerEl.appendChild(playerSkillPair)
    } else {
      team1PlayerSkillsList.appendChild(playerSkillPair)
    }

    const skillIcon = playerSkillPair.querySelector('.skill-ball-container')
    team1SkillIcons.push(skillIcon)
  }

  // Zobrazit všechny dovednosti týmu 2 OKAMŽITĚ (bez delay)
  for (let i = 0; i < team2Skills.length; i++) {
    const skill = team2Skills[i]
    const isNetPlayer = (i === team2NetPlayerIndex)

    let skillType, typeIcon
    if (skill.isNonsense || skill.skill === 15) {
      // Nesmysl: speciální růžová pulsující ikona
      skillType = 'nonsense'
      typeIcon = '🏐'
    } else if (skill.isUltimate) {
      // Ultimate schopnosti: černá barva + ikona nohejbalového míče
      if (skill.isDefensive) {
        skillType = 'ultimate-defensive'
        typeIcon = '🏐'
      } else {
        skillType = 'ultimate-offensive'
        typeIcon = '🏐'
      }
    } else if (skill.isSpecial) {
      if (skill.skill === 4) {
        skillType = 'offensive'
        typeIcon = '🏐'
      } else if (skill.skill === 11) {
        skillType = 'defensive'
        typeIcon = '🏐'
      }
    } else if (skill.isDefensive) {
      skillType = 'defensive'
      typeIcon = '🏐'
    } else {
      skillType = 'offensive'
      typeIcon = '🏐'
    }
    const skillName = skill.isNonsense ? (skill.player.nonsenseName || 'Nesmysl') : skills[skill.skill].name

    const isDebuffed = gameState.nonsenseDebuffedPlayers && gameState.nonsenseDebuffedPlayers.has(skill.player.id)
    let avgStats = Math.round((skill.player.stats.rychlost + skill.player.stats.obratnost + skill.player.stats.sila + skill.player.stats.svih + skill.player.stats.technika + skill.player.stats.obetavost + skill.player.stats.psychika + skill.player.stats.cteniHry + skill.player.stats.odolnost) / 9)

    if (isDebuffed) {
      avgStats = Math.round(avgStats / 2)
    }

    const playerSkillPair = document.createElement('div')
    playerSkillPair.className = `player-skill-pair`
    const displayStats2 = skill.player.stats || {}
    playerSkillPair.innerHTML = `
      <div class="skill-ball-container" data-skill-index="${i}" data-team="team2" data-player-id="${skill.player.id}">
        <div class="skill-ball ${skillType}">
          <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
        </div>
        <div class="skill-ball-string"></div>
        <div class="skill-ball-tag ${skillType}">
          <p class="skill-ball-tag-text">${skillName}</p>
        </div>
      </div>
      <div class="game-hexagon-card opponent-card">
        <div class="game-player-image">
          <img src="${skill.player.photo}" alt="${skill.player.name}" />
        </div>
        <div class="game-card-badge">
          <div class="game-card-badge-rating">${avgStats}</div>
        </div>
        <div class="game-player-number">${skill.player.number || ''}</div>
        <div class="game-player-info">
          <h3 class="game-player-name">${skill.player.name}</h3>
          <p class="game-player-position">${skill.player.position || 'Univerzál'}</p>
          <div class="game-player-stats-mini">
            <div class="game-stat"><span class="game-stat-value">${displayStats2.rychlost || '-'}</span><span class="game-stat-label">Rychlost</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.obratnost || '-'}</span><span class="game-stat-label">Obratnost</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.sila || '-'}</span><span class="game-stat-label">Rána</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.technika || '-'}</span><span class="game-stat-label">Technika</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.obetavost || '-'}</span><span class="game-stat-label">Obětavost</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.svih || '-'}</span><span class="game-stat-label">Svih</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.psychika || '-'}</span><span class="game-stat-label">Psychika</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.cteniHry || '-'}</span><span class="game-stat-label">Čtení hry</span></div>
            <div class="game-stat"><span class="game-stat-value">${displayStats2.odolnost || '-'}</span><span class="game-stat-label">Odolnost</span></div>
          </div>
        </div>
      </div>
    `

    if (isNetPlayer) {
      team2NetPlayerEl.appendChild(playerSkillPair)
    } else {
      team2PlayerSkillsList.appendChild(playerSkillPair)
    }

    const skillIcon = playerSkillPair.querySelector('.skill-ball-container')
    team2SkillIcons.push(skillIcon)
  }

  // Uložit odkazy na ikony
  gameState.team1SkillIcons = team1SkillIcons
  gameState.team2SkillIcons = team2SkillIcons
  gameState.team1Skills = team1Skills
  gameState.team2Skills = team2Skills

  // Po vykreslení aplikovat inteligentní pozicování visaček
  setTimeout(() => positionTagsIntelligently(), 100)

  // Nastavit event listenery pro tlačítka TIME-OUT v panelech trenérů
  setupTimeoutButtons()
}

// Funkce pro inteligentní pozicování visaček s detekcí kolizí
function positionTagsIntelligently() {
  const allContainers = document.querySelectorAll('.game-container .skill-ball-container')
  if (allContainers.length === 0) return

  const tags = []
  const balls = []

  // Shromáždit všechny balony a visačky s jejich pozicemi
  allContainers.forEach((container, index) => {
    const ball = container.querySelector('.skill-ball')
    const tag = container.querySelector('.skill-ball-tag')
    const string = container.querySelector('.skill-ball-string')
    const team = container.dataset.team

    if (!ball || !tag || !string) return

    const ballRect = ball.getBoundingClientRect()
    const ballCenter = {
      x: ballRect.left + ballRect.width / 2,
      y: ballRect.top + ballRect.height / 2
    }

    balls.push({ element: ball, rect: ballRect, center: ballCenter })
    tags.push({
      element: tag,
      string: string,
      container: container,
      team: team,
      ballCenter: ballCenter,
      index: index
    })
  })

  // Najít nejvyššího hráče každého týmu (ten s nejmenší Y pozicí)
  const team1Tags = tags.filter(t => t.team === 'team1')
  const team2Tags = tags.filter(t => t.team === 'team2')

  const topTeam1Player = team1Tags.length > 0
    ? team1Tags.reduce((top, current) => current.ballCenter.y < top.ballCenter.y ? current : top)
    : null

  const topTeam2Player = team2Tags.length > 0
    ? team2Tags.reduce((top, current) => current.ballCenter.y < top.ballCenter.y ? current : top)
    : null

  // Pro každou visačku najít optimální pozici
  tags.forEach((tagData, i) => {
    const { element: tag, string, team, ballCenter, container } = tagData

    // Detekovat, zda je to horní hráč (net player) - má container v net-players-section
    const isNetPlayer = container.closest('.net-player') !== null

    // Detekovat, zda je to nejvyšší hráč v týmu (podle Y pozice)
    const isTopPlayer = (team === 'team1' && tagData === topTeam1Player) ||
                        (team === 'team2' && tagData === topTeam2Player)

    // Možné směry podle týmu a pozice hráče
    let directions

    if (isNetPlayer || isTopPlayer) {
      // Pro horního/síťového hráče preferovat směr k soupeři (horizontálně)
      directions = team === 'team1'
        ? [
            { angle: 0, name: 'right' },       // doprava k soupeři (priorita #1)
            { angle: 45, name: 'right-down' }, // doprava dolů
            { angle: -45, name: 'right-up' },  // doprava nahoru
            { angle: 90, name: 'down' },       // dolů
            { angle: -90, name: 'up' },        // nahoru
            { angle: 135, name: 'left-down' }  // doleva dolů
          ]
        : [
            { angle: 180, name: 'left' },      // doleva k soupeři (priorita #1)
            { angle: 135, name: 'left-down' }, // doleva dolů
            { angle: -135, name: 'left-up' },  // doleva nahoru
            { angle: 90, name: 'down' },       // dolů
            { angle: -90, name: 'up' },        // nahoru
            { angle: 45, name: 'right-down' }  // doprava dolů
          ]
    } else {
      // Pro ostatní hráče standardní směry
      directions = team === 'team1'
        ? [
            { angle: 90, name: 'down' },       // dolů (výchozí)
            { angle: 45, name: 'right-down' }, // doprava dolů (preferovaný)
            { angle: 0, name: 'right' },       // doprava
            { angle: -45, name: 'right-up' },  // doprava nahoru
            { angle: 135, name: 'left-down' }, // doleva dolů
            { angle: -90, name: 'up' }         // nahoru
          ]
        : [
            { angle: 90, name: 'down' },       // dolů (výchozí)
            { angle: 135, name: 'left-down' }, // doleva dolů (preferovaný)
            { angle: 180, name: 'left' },      // doleva
            { angle: -135, name: 'left-up' },  // doleva nahoru
            { angle: 45, name: 'right-down' }, // doprava dolů
            { angle: -90, name: 'up' }         // nahoru
          ]
    }

    let bestDirection = directions[0]
    let minCollisions = Infinity

    // Pro horní hráče preferovat horizontální směr (první v pořadí) pokud nemá více než 1 kolizi
    if (isNetPlayer || isTopPlayer) {
      const firstDirection = directions[0]
      const firstPosition = calculateTagPosition(ballCenter, firstDirection.angle, 50)
      const firstCollisionCount = countCollisions(firstPosition, tags, i)

      // Použít horizontální směr pokud má max 1 kolizi
      if (firstCollisionCount <= 1) {
        bestDirection = firstDirection
      } else {
        // Jinak vyzkoušet další směry
        for (const direction of directions) {
          const testPosition = calculateTagPosition(ballCenter, direction.angle, 50)
          const collisionCount = countCollisions(testPosition, tags, i)

          if (collisionCount < minCollisions) {
            minCollisions = collisionCount
            bestDirection = direction
          }

          if (collisionCount === 0) break
        }
      }
    } else {
      // Pro ostatní hráče standardní logika
      for (const direction of directions) {
        const testPosition = calculateTagPosition(ballCenter, direction.angle, 50)
        const collisionCount = countCollisions(testPosition, tags, i)

        if (collisionCount < minCollisions) {
          minCollisions = collisionCount
          bestDirection = direction
        }

        // Pokud najdeme směr bez kolizí, použijeme ho
        if (collisionCount === 0) break
      }
    }

    // Aplikovat nejlepší směr
    applyTagDirection(tag, string, ballCenter, bestDirection.angle)
  })
}

// Vypočítat pozici visačky pro daný úhel
function calculateTagPosition(ballCenter, angle, distance) {
  const radians = (angle * Math.PI) / 180
  return {
    x: ballCenter.x + Math.cos(radians) * distance,
    y: ballCenter.y + Math.sin(radians) * distance,
    width: 120,  // min-width visačky
    height: 40   // přibližná výška
  }
}

// Spočítat počet kolizí s ostatními visačkami
function countCollisions(position, allTags, currentIndex) {
  let collisions = 0

  allTags.forEach((otherTag, index) => {
    if (index === currentIndex) return

    const otherRect = otherTag.element.getBoundingClientRect()

    // Kontrola překrytí obdélníků (AABB collision detection)
    if (!(position.x + position.width < otherRect.left ||
          position.x > otherRect.right ||
          position.y + position.height < otherRect.top ||
          position.y > otherRect.bottom)) {
      collisions++
    }
  })

  return collisions
}

// Aplikovat směr na visačku a šňůrku
function applyTagDirection(tag, string, ballCenter, angle) {
  const distance = 50
  const stringLength = 40
  const radians = (angle * Math.PI) / 180

  // Vypočítat pozici konce šňůrky (kde začíná visačka)
  const stringEndX = Math.cos(radians) * stringLength
  const stringEndY = Math.sin(radians) * stringLength

  // Nastavit šňůrku
  string.style.height = `${stringLength}px`
  string.style.width = '2px'
  string.style.transform = `rotate(${angle}deg)`
  string.style.transformOrigin = 'top center'
  string.style.top = '60px'  // od středu balonu (120px / 2)
  string.style.left = '50%'

  // Vypočítat pozici visačky
  const tagX = Math.cos(radians) * distance
  const tagY = Math.sin(radians) * distance

  // Nastavit visačku
  tag.style.left = `calc(50% + ${tagX}px)`
  tag.style.top = `calc(60px + ${tagY}px)`
  tag.style.transform = 'translate(-50%, -50%)'

  // Přesunout díru ve visačce podle úhlu
  const holeBefore = tag.querySelector('.skill-ball-tag::before') || tag
  const holeAngle = angle + 180 // opačný směr
  const holeRadians = (holeAngle * Math.PI) / 180
  const holeDistance = 15

  // Díru umístit na straně směřující k balonu
  tag.style.setProperty('--hole-x', `calc(50% + ${Math.cos(holeRadians) * holeDistance}px)`)
  tag.style.setProperty('--hole-y', `calc(50% + ${Math.sin(holeRadians) * holeDistance}px)`)
}

// Postupné odkrývání schopností - S TRENÉRY U TÝMŮ
async function revealSkillsGradually(team1Skills, team2Skills) {
  const revealDiv = document.getElementById('skill-reveal')

  // Získat trenéry týmů - hledat v bench nebo použít getOpponentCoach pro ID-based týmy
  let team1Coach = null
  let team2Coach = null

  // Pro team1 - zkusit najít trenéra v benchi, pak v players (Opava)
  if (gameState.team1Bench && gameState.team1Bench.length > 0) {
    team1Coach = gameState.team1Bench.find(p => p.position === 'Trenér')
  }
  if (!team1Coach) {
    team1Coach = players.find(p => p.position === 'Trenér')
  }

  // Pro team2 - zkusit najít trenéra v benchi, nebo použít getOpponentCoach
  if (gameState.team2Bench && gameState.team2Bench.length > 0) {
    team2Coach = gameState.team2Bench.find(p => p.position === 'Trenér')
  }
  if (!team2Coach && gameState.opponentTeamId) {
    team2Coach = getOpponentCoach(gameState.opponentTeamId)
  }
  if (!team2Coach) {
    team2Coach = team1Coach  // Fallback - v tréninkovém režimu jsou oba trenéři stejní
  }

  // Uložit trenéry do gameState
  gameState.team1Coach = team1Coach
  gameState.team2Coach = team2Coach

  // Get current mood for each team
  const team1Mood = COACH_MOODS[gameState.team1CoachMood]
  const team2Mood = COACH_MOODS[gameState.team2CoachMood]

  // Určit, kdo jde k síti v trojicích
  const team1NetPlayerIndex = getNetPlayerIndex(team1Skills)
  const team2NetPlayerIndex = getNetPlayerIndex(team2Skills)

  revealDiv.innerHTML = `
    <div class="skills-reveal-container">
      <!-- Levý trenérský panel -->
      <div class="coach-panel coach-panel-left" id="coach1-panel-side">
        <div class="coach-panel-header">
          <img class="coach-photo" id="coach1-photo" src="${team1Coach?.photo || '/players/sirocky.jpg'}" alt="Trenér">
          <div class="coach-name" id="coach1-name">${team1Coach?.name || 'Trenér'}</div>
        </div>
        <div class="coach-comment" id="coach1-comment"></div>
      </div>

      <!-- Hřiště uprostřed -->
      <div class="court-center">
        <div class="court-area">
          <div class="court-lines">
            <div class="court-net"></div>
            <div class="court-service-line court-service-line-left"></div>
            <div class="court-service-line court-service-line-right"></div>
          </div>

          <div class="team-section team-left">
            <div class="team-horizontal-layout">
              <div id="team1-players-skills-list" class="team-players-skills-list"></div>
            </div>
          </div>

          <div class="team-section team-right">
            <div class="team-horizontal-layout">
              <div id="team2-players-skills-list" class="team-players-skills-list"></div>
            </div>
          </div>

          <!-- Hráči u sítě (jen pro trojice) -->
          <div class="net-players-section">
            <div id="team1-net-player" class="net-player team1-net-player"></div>
            <div id="team2-net-player" class="net-player team2-net-player"></div>
          </div>
        </div>
      </div>

      <!-- Pravý trenérský panel -->
      <div class="coach-panel coach-panel-right" id="coach2-panel-side">
        <div class="coach-panel-header">
          <img class="coach-photo" id="coach2-photo" src="${team2Coach?.photo || '/images/avatar-placeholder.png'}" alt="Trenér">
          <div class="coach-name" id="coach2-name">${team2Coach?.name || 'Trenér'}</div>
        </div>
        <div class="coach-comment" id="coach2-comment"></div>
      </div>
    </div>
  `

  const team1PlayerSkillsList = document.getElementById('team1-players-skills-list')
  const team2PlayerSkillsList = document.getElementById('team2-players-skills-list')
  const team1NetPlayerEl = document.getElementById('team1-net-player')
  const team2NetPlayerEl = document.getElementById('team2-net-player')

  // Pole pro uložení ikon dovedností
  const team1SkillIcons = []
  const team2SkillIcons = []

  // Postupně odkrýt schopnosti týmu 1
  for (let i = 0; i < team1Skills.length; i++) {
    const skill = team1Skills[i]
    const isNetPlayer = (i === team1NetPlayerIndex)
    let skillType, typeIcon
    if (skill.isNonsense || skill.skill === 15) {
      // Nesmysl: speciální růžová pulsující ikona
      skillType = 'nonsense'
      typeIcon = '🏐'
    } else if (skill.isUltimate) {
      // Ultimate schopnosti: černá barva + ikona nohejbalového míče
      if (skill.isDefensive) {
        skillType = 'ultimate-defensive'
        typeIcon = '🏐'
      } else {
        skillType = 'ultimate-offensive'
        typeIcon = '🏐'
      }
    } else if (skill.isSpecial) {
      // Pro speciální schopnosti (Skákaná smeč ID 10, Vytlučený blok ID 19 jsou útočné, Smečovaný servis ID 11 je obranný)
      if (skill.skill === 10 || skill.skill === 19) {
        skillType = 'offensive'
        typeIcon = '🏐'
      } else if (skill.skill === 11) {
        skillType = 'defensive'
        typeIcon = '🏐'
      }
    } else if (skill.isDefensive) {
      skillType = 'defensive'
      typeIcon = '🏐'
    } else {
      skillType = 'offensive'
      typeIcon = '🏐'
    }
    const skillName = skill.isNonsense ? (skill.player.nonsenseName || 'Nesmysl') : skills[skill.skill].name

    // Calculate rating from stats
    const isDebuffed = gameState.nonsenseDebuffedPlayers && gameState.nonsenseDebuffedPlayers.has(skill.player.id)
    let avgStats = 0
    if (skill.player.stats) {
      avgStats = Math.round((skill.player.stats.rychlost + skill.player.stats.obratnost + skill.player.stats.sila + skill.player.stats.svih + skill.player.stats.technika + skill.player.stats.obetavost + skill.player.stats.psychika + skill.player.stats.cteniHry + skill.player.stats.odolnost) / 9)

      // Pokud je hráč debuffnutý, hodnocení na polovinu
      if (isDebuffed) {
        avgStats = Math.round(avgStats / 2)
      }
    }

    // Určit emoji ikonu podle typu dovednosti
    let skillEmoji = ''
    if (skill.isNonsense || skill.skill === 15) {
      skillEmoji = '🎭' // Nesmysl
    } else if (skill.isUltimate) {
      skillEmoji = skill.isDefensive ? '🛡️' : '⚔️'
    } else if (skill.isDefensive) {
      skillEmoji = '🛡️'
    } else {
      skillEmoji = '⚔️'
    }

    // Určit speciální třídy pro speciální dovednosti
    let specialClasses = ''
    if (skill.isSpecial) {
      specialClasses += ' special-rotating'
      // Pro smečovaný servis (ID 11) přidat alternující ikonu
      if (skill.skill === 11) {
        specialClasses += ' alternating-icon'
      }
    }

    // Pár hráč + dovednost
    const playerSkillPair = document.createElement('div')
    playerSkillPair.className = `player-skill-pair reveal-animation ${isNetPlayer ? 'net-player-pair' : ''}`
    playerSkillPair.innerHTML = `
      <div class="game-hexagon-card opava-card">
        <div class="game-player-image">
          <img src="${skill.player.photo}" alt="${skill.player.name}" />
        </div>
        <div class="game-card-badge">
          <div class="game-card-badge-rating">${avgStats}</div>
        </div>
        <div class="game-player-number">${skill.player.number || ''}</div>
        <div class="game-player-info">
          <h3 class="game-player-name">${skill.player.name}</h3>
        </div>
      </div>
      <div class="skill-ball-container" data-skill-index="${i}" data-team="team1" data-player-id="${skill.player.id}" data-skill-id="${skill.skill}">
        <div class="skill-ball ${skillType}${specialClasses}" data-skill-emoji="${skillEmoji}">
          <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
        </div>
        <div class="skill-ball-string"></div>
        <div class="skill-ball-tag ${skillType}">
          <p class="skill-ball-tag-text">${skillName}</p>
        </div>
      </div>
    `

    // Přidat do správného kontejneru (síť nebo normální seznam)
    if (isNetPlayer) {
      team1NetPlayerEl.appendChild(playerSkillPair)
    } else {
      team1PlayerSkillsList.appendChild(playerSkillPair)
    }

    // Uložit referenci na ikonu dovednosti
    const skillIcon = playerSkillPair.querySelector('.skill-ball-container')
    team1SkillIcons.push(skillIcon)

    await smartDelay(500)
  }

  // Postupně odkrýt schopnosti týmu 2
  for (let i = 0; i < team2Skills.length; i++) {
    const skill = team2Skills[i]
    const isNetPlayer = (i === team2NetPlayerIndex)

    let skillType, typeIcon
    if (skill.isNonsense || skill.skill === 15) {
      // Nesmysl: speciální růžová pulsující ikona
      skillType = 'nonsense'
      typeIcon = '🏐'
    } else if (skill.isUltimate) {
      // Ultimate schopnosti: černá barva + ikona nohejbalového míče
      if (skill.isDefensive) {
        skillType = 'ultimate-defensive'
        typeIcon = '🏐'
      } else {
        skillType = 'ultimate-offensive'
        typeIcon = '🏐'
      }
    } else if (skill.isSpecial) {
      // Pro speciální schopnosti (Skákaná smeč ID 10, Vytlučený blok ID 19 jsou útočné, Smečovaný servis ID 11 je obranný)
      if (skill.skill === 10 || skill.skill === 19) {
        skillType = 'offensive'
        typeIcon = '🏐'
      } else if (skill.skill === 11) {
        skillType = 'defensive'
        typeIcon = '🏐'
      }
    } else if (skill.isDefensive) {
      skillType = 'defensive'
      typeIcon = '🏐'
    } else {
      skillType = 'offensive'
      typeIcon = '🏐'
    }
    const skillName = skill.isNonsense ? (skill.player.nonsenseName || 'Nesmysl') : skills[skill.skill].name

    // Calculate rating from stats
    const isDebuffed = gameState.nonsenseDebuffedPlayers && gameState.nonsenseDebuffedPlayers.has(skill.player.id)
    let avgStats = 0
    if (skill.player.stats) {
      avgStats = Math.round((skill.player.stats.rychlost + skill.player.stats.obratnost + skill.player.stats.sila + skill.player.stats.svih + skill.player.stats.technika + skill.player.stats.obetavost + skill.player.stats.psychika + skill.player.stats.cteniHry + skill.player.stats.odolnost) / 9)

      // Pokud je hráč debuffnutý, hodnocení na polovinu
      if (isDebuffed) {
        avgStats = Math.round(avgStats / 2)
      }
    }

    // Určit emoji ikonu podle typu dovednosti
    let skillEmoji = ''
    if (skill.isNonsense || skill.skill === 15) {
      skillEmoji = '🎭' // Nesmysl
    } else if (skill.isUltimate) {
      skillEmoji = skill.isDefensive ? '🛡️' : '⚔️'
    } else if (skill.isDefensive) {
      skillEmoji = '🛡️'
    } else {
      skillEmoji = '⚔️'
    }

    // Určit speciální třídy pro speciální dovednosti
    let specialClasses = ''
    if (skill.isSpecial) {
      specialClasses += ' special-rotating'
      // Pro smečovaný servis (ID 11) přidat alternující ikonu
      if (skill.skill === 11) {
        specialClasses += ' alternating-icon'
      }
    }

    // Pár hráč + dovednost (zrcadlově - dovednost vlevo)
    const playerSkillPair = document.createElement('div')
    playerSkillPair.className = `player-skill-pair reveal-animation`
    playerSkillPair.innerHTML = `
      <div class="skill-ball-container" data-skill-index="${i}" data-team="team2" data-player-id="${skill.player.id}" data-skill-id="${skill.skill}">
        <div class="skill-ball ${skillType}${specialClasses}" data-skill-emoji="${skillEmoji}">
          <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
        </div>
        <div class="skill-ball-string"></div>
        <div class="skill-ball-tag ${skillType}">
          <p class="skill-ball-tag-text">${skillName}</p>
        </div>
      </div>
      <div class="game-hexagon-card opponent-card">
        <div class="game-player-image">
          <img src="${skill.player.photo}" alt="${skill.player.name}" />
        </div>
        <div class="game-card-badge">
          <div class="game-card-badge-rating">${avgStats}</div>
        </div>
        <div class="game-player-number">${skill.player.number || ''}</div>
        <div class="game-player-info">
          <h3 class="game-player-name">${skill.player.name}</h3>
        </div>
      </div>
    `

    if (isNetPlayer) {
      team2NetPlayerEl.appendChild(playerSkillPair)
    } else {
      team2PlayerSkillsList.appendChild(playerSkillPair)
    }

    // Uložit referenci na ikonu dovednosti
    const skillIcon = playerSkillPair.querySelector('.skill-ball-container')
    team2SkillIcons.push(skillIcon)

    await smartDelay(500)
  }

  await smartDelay(1000)

  // Uložit odkazy na ikony pro animaci
  gameState.team1SkillIcons = team1SkillIcons
  gameState.team2SkillIcons = team2SkillIcons
  gameState.team1Skills = team1Skills
  gameState.team2Skills = team2Skills

  // Po vykreslení aplikovat inteligentní pozicování visaček
  setTimeout(() => positionTagsIntelligently(), 100)

  // Počáteční hláška trenérů na začátku prvního setu
  setTimeout(() => {
    const team1Quote = getRandomStartQuote(gameState.team1Name, gameState.team2Name)
    const team2Quote = getRandomStartQuote(gameState.team2Name, gameState.team1Name)
    showCoachQuote('team1', team1Quote)
    showCoachQuote('team2', team2Quote)
  }, 500)
}

// Funkce pro aktualizaci ikony speciální schopnosti (Skákaná smeč, Smečovaný servis, Vytlučený blok)
function updateSpecialSkillIcon(skillObj, team, effectType, numTails = null) {
  const teamSkillIcons = team === 'team1' ? gameState.team1SkillIcons : gameState.team2SkillIcons
  const teamSkills = team === 'team1' ? gameState.team1Skills : gameState.team2Skills

  const skillIndex = teamSkills.findIndex(s =>
    s.player.id === skillObj.player.id && s.skill === skillObj.skill
  )

  if (skillIndex === -1 || !teamSkillIcons[skillIndex]) return

  const iconContainer = teamSkillIcons[skillIndex]
  const skillBall = iconContainer.querySelector('.skill-ball')

  if (!skillBall) return

  // Odstranit rotující rámečky a alternující ikonu
  skillBall.classList.remove('special-rotating', 'alternating-icon')

  // Odstranit všechny předchozí třídy typu
  skillBall.classList.remove('offensive', 'defensive', 'offensive-skill', 'defensive-skill',
    'ultimate-offensive', 'ultimate-defensive', 'special-red-border', 'special-black-border')

  // Určit emoji a třídy podle typu efektu
  let newEmoji = ''
  let newClasses = []

  if (effectType === 'offensive') {
    newEmoji = '⚔️'
    newClasses = ['offensive', 'special-red-border']
  } else if (effectType === 'defensive') {
    newEmoji = '🛡️'
    newClasses = ['defensive', 'special-red-border']
  } else if (effectType === 'ultimate-offensive') {
    newEmoji = '⚔️'
    newClasses = ['ultimate-offensive', 'special-black-border']
  } else if (effectType === 'ultimate-defensive') {
    newEmoji = '🛡️'
    newClasses = ['ultimate-defensive', 'special-black-border']
  }

  // Aktualizovat emoji
  if (newEmoji) {
    skillBall.setAttribute('data-skill-emoji', newEmoji)
    // Také aktualizovat type-icon element, pokud existuje
    const typeIcon = skillBall.querySelector('.type-icon')
    if (typeIcon) {
      typeIcon.textContent = newEmoji
    }
  }

  // Přidat nové třídy
  newClasses.forEach(cls => skillBall.classList.add(cls))
}

// Funkce pro resetování ikon speciálních schopností na začátku výměny
// Funkce pro resetování animací všech ikon na začátku výměny
function resetAllSkillIconAnimations() {
  // Odstranit všechny animační třídy ze všech ikon
  if (gameState.team1SkillIcons) {
    for (const icon of gameState.team1SkillIcons) {
      if (icon) {
        icon.classList.remove('shatter', 'skill-shatter', 'skill-highlight', 'skill-blink',
          'attacking-right', 'attacking-left', 'bounce-back-left', 'bounce-back-right',
          'attack-success-right', 'attack-success-left', 'attack-net-right', 'attack-net-left',
          'attack-out-right', 'attack-out-left', 'collision-left', 'collision-right')
      }
    }
  }

  if (gameState.team2SkillIcons) {
    for (const icon of gameState.team2SkillIcons) {
      if (icon) {
        icon.classList.remove('shatter', 'skill-shatter', 'skill-highlight', 'skill-blink',
          'attacking-right', 'attacking-left', 'bounce-back-left', 'bounce-back-right',
          'attack-success-right', 'attack-success-left', 'attack-net-right', 'attack-net-left',
          'attack-out-right', 'attack-out-left', 'collision-left', 'collision-right')
      }
    }
  }
}

function resetSpecialSkillIcons() {
  // Projít všechny schopnosti obou týmů
  if (!gameState.team1Skills || !gameState.team2Skills) return

  const allSkills = [
    ...gameState.team1Skills.map(s => ({ ...s, team: 'team1' })),
    ...gameState.team2Skills.map(s => ({ ...s, team: 'team2' }))
  ]

  for (const skillData of allSkills) {
    const { skill, team } = skillData

    // Resetovat pouze Tupou ránu (4) a Smečovaný servis (11)
    if (skill === 4 || skill === 11) {
      const teamSkillIcons = team === 'team1' ? gameState.team1SkillIcons : gameState.team2SkillIcons
      const teamSkills = team === 'team1' ? gameState.team1Skills : gameState.team2Skills

      const skillIndex = teamSkills.findIndex(s =>
        s.player.id === skillData.player.id && s.skill === skillData.skill
      )

      if (skillIndex === -1 || !teamSkillIcons[skillIndex]) continue

      const iconElement = teamSkillIcons[skillIndex]
      const typeIconElement = iconElement.querySelector('.skill-type-icon')

      if (!typeIconElement) continue

      // Odstranit všechny třídy
      iconElement.classList.remove('offensive-skill', 'defensive-skill', 'ultimate-skill')

      // Nastavit původní ikonu podle typu schopnosti
      if (skill === 10 || skill === 19) {
        // Skákaná smeč, Vytlučený blok = útočné
        typeIconElement.textContent = '⚔️'
        iconElement.classList.add('offensive-skill')
      } else if (skill === 11) {
        // Smečovaný servis = obranný
        typeIconElement.textContent = '🛡️'
        iconElement.classList.add('defensive-skill')
      }
    }
  }
}

// Funkce pro animaci vyhodnocení schopnosti
async function animateSkillEvaluation(attackerSkill, defenderSkill, result) {
  // Bezpečnostní kontrola - pokud nejsou inicializovány ikony, nezobrazovat animaci
  if (!gameState.team1SkillIcons || !gameState.team2SkillIcons ||
      !gameState.team1Skills || !gameState.team2Skills) {
    return
  }

  // Určit, který tým útočí
  const isTeam1Attacker = gameState.team1Skills.some(s =>
    s.player.id === attackerSkill.player.id && s.skill === attackerSkill.skill
  )

  const attackerIcons = isTeam1Attacker ? gameState.team1SkillIcons : gameState.team2SkillIcons
  const defenderIcons = isTeam1Attacker ? gameState.team2SkillIcons : gameState.team1SkillIcons

  // Najít index útočné schopnosti
  const attackerSkills = isTeam1Attacker ? gameState.team1Skills : gameState.team2Skills
  const attackerIndex = attackerSkills.findIndex(s =>
    s.player.id === attackerSkill.player.id && s.skill === attackerSkill.skill
  )

  if (attackerIndex === -1) return

  const attackerIcon = attackerIcons[attackerIndex]
  if (!attackerIcon) return

  // Zablikat útočnou schopností
  attackerIcon.classList.add('skill-blink')
  await smartDelay(800)
  attackerIcon.classList.remove('skill-blink')

  // Pokud je obránce, zablikat i obrannou schopností
  if (defenderSkill) {
    const defenderSkills = isTeam1Attacker ? gameState.team2Skills : gameState.team1Skills
    const defenderIndex = defenderSkills.findIndex(s =>
      s.player.id === defenderSkill.player.id && s.skill === defenderSkill.skill
    )

    if (defenderIndex !== -1) {
      const defenderIcon = defenderIcons[defenderIndex]
      if (defenderIcon) {
        defenderIcon.classList.add('skill-blink')
        await smartDelay(600)
        defenderIcon.classList.remove('skill-blink')
      }
    }
  }

  await smartDelay(300)

  // Animace podle výsledku
  if (result === 'success') {
    // Úspěšný útok - ikona přeletí na druhou stranu
    // Animace přeletu míče na druhou stranu
    attackerIcon.classList.add(isTeam1Attacker ? 'slide-to-right' : 'slide-to-left')

    await smartDelay(600)

    // Odebrat třídu pro přelet a vrátit zpět
    attackerIcon.classList.remove(isTeam1Attacker ? 'slide-to-right' : 'slide-to-left')
    attackerIcon.classList.add(isTeam1Attacker ? 'bounce-back-left' : 'bounce-back-right')

    await smartDelay(600)

    // Odebrat bounce-back třídu
    attackerIcon.classList.remove(isTeam1Attacker ? 'bounce-back-left' : 'bounce-back-right')

  } else if (result === 'failed') {
    // Neúspěšný útok - ikona se rozpadne (shatter animace)
    attackerIcon.classList.add('shatter')
    const isNet = Math.random() < 0.5
    addActionCommentary(`<p>⚠️ Útok skončil v <strong>${isNet ? 'síti' : 'autu'}</strong>!</p>`)
    await smartDelay(800)
  } else if (result === 'blocked') {
    // Zablokovaný útok - ikony se srazí, zatřesou a útočná se rozpadne
    if (defenderSkill) {
      const defenderSkills = isTeam1Attacker ? gameState.team2Skills : gameState.team1Skills
      const defenderIndex = defenderSkills.findIndex(s =>
        s.player.id === defenderSkill.player.id && s.skill === defenderSkill.skill
      )
      const defenderIcon = defenderIcons[defenderIndex]

      // Obě ikony se pohybují k sobě (srážka)
      attackerIcon.classList.add(isTeam1Attacker ? 'collision-left' : 'collision-right')

      if (defenderIcon) {
        defenderIcon.classList.add(isTeam1Attacker ? 'collision-right' : 'collision-left')
      }

      await smartDelay(600)

      // Zatřesení při srážce
      attackerIcon.classList.add('shake')
      if (defenderIcon) {
        defenderIcon.classList.add('shake')
      }

      await smartDelay(400)

      // Odstranit srážku a zatřesení
      attackerIcon.classList.remove(isTeam1Attacker ? 'collision-left' : 'collision-right', 'shake')

      if (defenderIcon) {
        defenderIcon.classList.remove(isTeam1Attacker ? 'collision-right' : 'collision-left', 'shake')
      }

      // Útočná ikona se rozpadne (shatter)
      attackerIcon.classList.add('shatter')

      // Zvýraznit obrannou ikonu (úspěšná obrana)
      if (defenderIcon) {
        defenderIcon.classList.add('skill-highlight')
        await smartDelay(800)
        defenderIcon.classList.remove('skill-highlight')
      }
    } else {
      // Pokud není obránce, ikona se jen rozpadne
      attackerIcon.classList.add('shatter')
      await smartDelay(800)
    }
  }
}

// Animace střetu schopností
async function showSkillClash(attacker, defender, result) {
  // Určit týmy útočníka a obránce
  const attackerTeam = gameState.team1 && gameState.team1.some(p => p.id === attacker.player.id) ? 1 : 2
  const defenderTeam = defender ? (gameState.team1 && gameState.team1.some(p => p.id === defender.player.id) ? 1 : 2) : null

  // Zobrazit křížek mezi okny
  const clashIndicator = document.getElementById('skill-clash-indicator')
  if (clashIndicator) {
    clashIndicator.style.display = 'block'
  }

  // Získat panely
  const team1Panel = document.getElementById('team1-commentary')
  const team2Panel = document.getElementById('team2-commentary')

  // Vyčistit předchozí obsah
  if (team1Panel) team1Panel.innerHTML = ''
  if (team2Panel) team2Panel.innerHTML = ''

  // Spustit animaci střetu dovedností
  await animateSkillEvaluation(attacker, defender, result)

  // Přehrát zvuk útoku
  if (attacker.isUltimate) {
    soundManager.playUltimateAttack()
  } else {
    soundManager.playBallHit()
  }
  await smartDelay(500)

  // Přehrát zvuk obrany (pokud existuje)
  if (defender) {
    if (defender.isUltimate) {
      soundManager.playUltimateDefense()
    } else {
      soundManager.playBallHit()
    }
    await smartDelay(500)
  }

  // Určit výsledek
  let resultEmoji = ''
  let resultText = ''
  if (result === 'blocked') {
    const defensiveSkillId = defender ? defender.skill : null
    resultEmoji = '🛡️'
    resultText = getRandomBlockedText(defensiveSkillId)
    soundManager.playDefenseBlock()
  } else if (result === 'success') {
    resultEmoji = '✅'
    resultText = 'ÚSPĚCH'
    soundManager.playBallHit()
  }

  // Vytvoření kompaktních jednořádkových notifikací s výsledkem
  const attackerEmoji = attacker.isUltimate ? '⭐' : '⚔️'
  const attackerText = `
    <span class="skill-emoji">${attackerEmoji}</span>
    <span class="player-name">${attacker.player.name}</span>
    <span class="skill-name">${skills[attacker.skill].name}</span>
    <span class="result-emoji">${resultEmoji}</span>
    <span class="result-text">${resultText}</span>
  `

  const attackerPanel = attackerTeam === 1 ? team1Panel : team2Panel
  if (attackerPanel) {
    const notification = document.createElement('div')
    notification.className = `clash-notification ${result}`
    notification.innerHTML = attackerText
    attackerPanel.appendChild(notification)
  }

  // Notifikace pro obránce (pokud existuje) - bez výsledku
  if (defender && defenderTeam) {
    const defenderEmoji = defender.isUltimate ? '⭐' : '🛡️'
    const defenderText = `
      <span class="skill-emoji">${defenderEmoji}</span>
      <span class="player-name">${defender.player.name}</span>
      <span class="skill-name">${skills[defender.skill].name}</span>
    `

    const defenderPanel = defenderTeam === 1 ? team1Panel : team2Panel
    if (defenderPanel) {
      const notification = document.createElement('div')
      notification.className = 'clash-notification'
      notification.innerHTML = defenderText
      defenderPanel.appendChild(notification)
    }
  }

  await smartDelay(1500)

  // Skrýt křížek po skončení střetu
  if (clashIndicator) {
    clashIndicator.style.display = 'none'
  }
}

// Zobrazit rozhodující schopnost
async function showDecisiveSkill(decisiveSkill) {
  const phaseDiv = document.getElementById('evaluation-phase')
  phaseDiv.innerHTML = `
    <div class="decisive-skill-display">
      <h2>🎯 Rozhodující schopnost!</h2>
      <div class="decisive-player">
        <img src="${decisiveSkill.player.photo}" alt="${decisiveSkill.player.name}" />
        <h3>${decisiveSkill.player.name}</h3>
      </div>
      <div class="decisive-skill-name">
        ${decisiveSkill.isUltimate ? '⭐ ' : ''}${skills[decisiveSkill.skill].name}
      </div>
    </div>
  `
  await smartDelay(2000)
}

// Přehrát animaci/video schopnosti - pouze pokud existuje video
async function showSkillVideo(decisiveSkill) {
  // NEPŘEHRÁVAT VIDEA - tato funkce je deaktivována
  // Videa se přehrají pouze když budou konkrétní videa nahrána
  return
}

// Funkce pro zobrazení videa akce přímo na hřišti
async function showActionVideo(interaction, videoSrc, isDefender = false, isFailed = false) {
  const courtDiv = document.querySelector('.court')

  const player = isDefender ? interaction.defender.player : interaction.attacker.player
  const skill = isDefender ? interaction.defender.skill : interaction.attacker.skill
  const skillName = skills[skill].name

  let resultLabel = ''
  let resultClass = ''
  let soundType = null

  if (isDefender) {
    resultLabel = '🛡️ ÚSPĚŠNÁ OBRANA!'
    resultClass = 'defense-success'
    soundType = 'defend'
  } else if (isFailed || interaction.result === 'failed') {
    resultLabel = '❌ NEÚSPĚŠNÝ ÚTOK!'
    resultClass = 'failed'
    soundType = 'fail'
  } else if (interaction.result === 'success') {
    resultLabel = '✅ ÚSPĚŠNÝ ÚTOK!'
    resultClass = 'success'
    soundType = 'success'
  } else if (interaction.result === 'blocked') {
    const defensiveSkillId = interaction.defender ? interaction.defender.skill : null
    resultLabel = `🛡️ ${getRandomBlockedText(defensiveSkillId)}!`
    resultClass = 'blocked'
    soundType = 'blocked'
  } else {
    // Fallback pro neznámý stav - nemělo by se stát
    resultLabel = '⚠️ NEZNÁMÝ VÝSLEDEK'
    resultClass = 'unknown'
    soundType = null
  }

  // SKRÝT IKONKY A KARTY před přehráním videa
  const skillsContainer = document.querySelector('.skills-container')
  const playerCardsTeam1 = document.querySelectorAll('.team1-players .player-card')
  const playerCardsTeam2 = document.querySelectorAll('.team2-players .player-card')
  const allElementsToHide = [skillsContainer, ...playerCardsTeam1, ...playerCardsTeam2]

  allElementsToHide.forEach(el => {
    if (el) {
      el.style.opacity = '0'
      el.style.pointerEvents = 'none'
    }
  })

  const videoOverlay = document.createElement('div')
  videoOverlay.className = 'video-overlay'
  videoOverlay.innerHTML = `
    <div class="video-overlay-content">
      <div class="video-header">
        <h3>${player.name}</h3>
        <span class="video-result ${resultClass}">
          ${resultLabel}
        </span>
      </div>
      <video playsinline class="action-video" id="action-video-player" volume="1.0">
        <source src="${videoSrc}" type="video/mp4">
      </video>
    </div>
  `

  document.body.appendChild(videoOverlay)

  // Přehrát zvukový efekt podle výsledku
  if (soundType) {
    if (soundType === 'defend' || soundType === 'success') {
      soundManager.playBallHit()
    } else if (soundType === 'blocked') {
      soundManager.playDefenseBlock()
    } else if (soundType === 'fail') {
      soundManager.playSkillFail()
    }
  }

  // Počkat na dokončení videa (v plné délce)
  const videoElement = videoOverlay.querySelector('#action-video-player')
  videoElement.volume = 1.0 // Plná hlasitost videa

  await new Promise((resolve) => {
    let resolved = false
    const doResolve = () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    }

    // Přidat event listenery PŘED spuštěním videa
    videoElement.addEventListener('ended', doResolve, { once: true })
    videoElement.addEventListener('error', (e) => {
      console.error('Chyba při načítání videa:', videoSrc, e)
      doResolve()
    }, { once: true })

    // Kontrola, zda video existuje
    videoElement.addEventListener('loadedmetadata', () => {
      console.log('Video načteno:', videoSrc, 'délka:', videoElement.duration)
    }, { once: true })

    // Fallback timeout pro případ, že se video nenačte (5 sekund)
    setTimeout(doResolve, 5000)

    // TEĎ TEPRVE spustit video
    videoElement.play().catch(e => {
      console.error('Chyba při přehrávání videa:', videoSrc, e)
      doResolve()
    })
  })

  // Odstranit video overlay
  videoOverlay.remove()

  // ZNOVU ZOBRAZIT IKONKY A KARTY po přehrání videa
  allElementsToHide.forEach(el => {
    if (el) {
      el.style.opacity = '1'
      el.style.pointerEvents = 'auto'
    }
  })
}

async function showActivatedSkills(team1Skills, team2Skills) {
  const skillDiv = document.getElementById('skill-activation')

  skillDiv.innerHTML = `
    <div class="skills-display">
      <div class="team-skills">
        <h3>${gameState.team1Name}</h3>
        ${team1Skills.map(s => `
          <div class="skill-item-with-card ${s.isUltimate ? 'ultimate' : ''}">
            <div class="mini-player-card team1-card small">
              <img src="${s.player.photo}" alt="${s.player.name}" />
              <div class="mini-player-name">${s.player.name}</div>
            </div>
            <div class="skill-info">
              <strong>${skills[s.skill].name}</strong>
              ${s.isUltimate ? '⭐' : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="team-skills">
        <h3>${gameState.team2Name}</h3>
        ${team2Skills.map(s => `
          <div class="skill-item-with-card ${s.isUltimate ? 'ultimate' : ''}">
            <div class="mini-player-card team2-card small">
              <img src="${s.player.photo}" alt="${s.player.name}" />
              <div class="mini-player-name">${s.player.name}</div>
            </div>
            <div class="skill-info">
              <strong>${skills[s.skill].name}</strong>
              ${s.isUltimate ? '⭐' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  // Animace
  await smartDelay(2000)
}

// Animace hodu mincí
async function showCoinFlip(numCoins, results) {
  const evalDiv = getEvaluationDiv()

  const coinsHTML = results.map((isTails, index) => `
    <div class="coin">
      <div class="coin-face ${isTails ? 'coin-tails' : 'coin-heads'}">
        ${isTails ? '👑' : 'H'}
      </div>
    </div>
  `).join('')

  evalDiv.innerHTML = `
    <div class="coin-flip-container">
      <h3>🪙 Hod ${numCoins === 1 ? 'mincí' : 'dvěma mincemi'}...</h3>
      <div class="coins-wrapper">
        ${coinsHTML}
      </div>
    </div>
  `

  // Čekáme na dokončení animace
  await smartDelay(2000)

  // Zobrazit výsledek
  const tailsCount = results.filter(r => r).length
  let resultText = ''

  if (numCoins === 1) {
    resultText = results[0] ? '👑 Panna!' : 'H Hlava!'
  } else {
    if (tailsCount === 0) {
      resultText = 'H + H (Hlava + Hlava)'
    } else if (tailsCount === 1) {
      resultText = 'Jedna panna'
    } else {
      resultText = '👑 + 👑 (Dvě panny)'
    }
  }

  evalDiv.innerHTML += `<div class="coin-result">${resultText}</div>`
  await smartDelay(1000)
}

// Funkce pro animaci rozpadnutí ikony neúspěšné dovednosti
async function shatterSkillIcon(skillObj) {
  // Najít ikonu podle player.id
  const icons = document.querySelectorAll(`.skill-ball-container[data-player-id="${skillObj.player.id}"]`)

  for (const icon of icons) {
    // Přidat třídu pro animaci - ikona zůstane rozbitá až do výměny schopností
    icon.classList.add('shatter')
  }

  // Počkat na animaci
  await smartDelay(600)
}

// Funkce pro zobrazení detailního komentáře dovednosti
// Funkce pro náhodný výběr mezi "do autu" a "do sítě"
function getFailedAttackMessage(skillObj, winningTeam) {
  const skill = skills[skillObj.skill]
  const playerFirstName = skillObj.player.name.split(' ')[0]

  // Různé typy chyb útočícího hráče
  const failTypes = [
    'do autu',
    'do sítě',
    'těsně vedle',
    'dvojdotek',
    `${playerFirstName} se při hraní dotkl sítě`
  ]

  const failType = failTypes[Math.floor(Math.random() * failTypes.length)]

  // Pro variantu s dotykem sítě nemá smysl přidávat název útoku
  if (failType.includes('dotkl sítě')) {
    return `${failType}. ${winningTeam}: +1 bod`
  }

  return `${skill.name} ${failType}. ${winningTeam}: +1 bod`
}

async function showSkillComment(skillObj, successRate, isSuccess, additionalInfo = '', skillType = null) {
  const evalDiv = getEvaluationDiv()
  const skill = skills[skillObj.skill]
  const statNames = skill.stats.map(stat => {
    const czechNames = {
      rychlost: 'Rychlost',
      obratnost: 'Obratnost',
      rana: 'Rána',
      technika: 'Technika',
      obetavost: 'Obětavost',
      psychickaOdolnost: 'Psychická odolnost',
      obrana: 'Obrana'
    }
    return `${czechNames[stat]}: ${skillObj.player.stats[stat]}`
  }).join(', ')

  // Získat trenérovu hlášku pokud byl neúspěch
  let coachQuote = ''
  let quote = null
  if (!isSuccess) {
    const quoteType = skillType === 'defensive' ? 'defensiveFail' : 'offensiveFail'
    quote = getCoachQuote(quoteType, skillObj.player.name)
    if (quote) {
      coachQuote = `<p class="coach-quote">🗣️ <strong>Trenér Širocký:</strong> "${quote}"</p>`
      updateCoachBubble(quote) // Aktualizovat bublinu trenéra
    }
  }

  // Přidat do historie
  const historyMessage = `<strong>${skillObj.player.name}</strong> použil <em>${skill.name}</em> - ${isSuccess ? '✓ ÚSPĚCH' : '✗ NEÚSPĚCH'} (${successRate}%)${additionalInfo ? ` - ${additionalInfo.replace(/<[^>]*>/g, '')}` : ''}`
  addEventToHistory(historyMessage)

  if (quote) {
    addEventToHistory(`💬 Trenér: "${quote}"`)
  }

  evalDiv.innerHTML = `
    <div class="skill-commentary modern">
      <div class="commentary-header" style="background: linear-gradient(135deg, ${isSuccess ? '#10b981' : '#ef4444'} 0%, ${isSuccess ? '#059669' : '#dc2626'} 100%); padding: 15px 20px; border-radius: 12px 12px 0 0; border-bottom: 3px solid rgba(255,255,255,0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="margin: 0; color: white; font-size: 1.4rem; font-weight: 600;">⚡ ${skill.name}</h3>
          <span style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; color: white; font-weight: bold;">${successRate}%</span>
        </div>
      </div>
      <div class="commentary-body" style="background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 0.95rem;">👤 Hráč</p>
          <p style="margin: 0; font-size: 1.15rem; font-weight: 600; color: #111827;">${skillObj.player.name}</p>
        </div>
        <div style="margin-bottom: 15px; padding: 12px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 0.9rem;">📊 Klíčové atributy</p>
          <p style="margin: 0; color: #374151; font-weight: 500;">${statNames}</p>
        </div>
        <div style="padding: 16px; background: ${isSuccess ? '#d1fae5' : '#fee2e2'}; border-radius: 10px; border: 2px solid ${isSuccess ? '#10b981' : '#ef4444'};">
          <p style="margin: 0; font-size: 1.2rem; font-weight: bold; color: ${isSuccess ? '#065f46' : '#991b1b'}; text-align: center;">
            ${isSuccess ? '✓ ÚSPĚCH' : '✗ NEÚSPĚCH'}
          </p>
        </div>
        ${additionalInfo ? `<div style="margin-top: 12px; padding: 10px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;"><p style="margin: 0; color: #92400e;">${additionalInfo}</p></div>` : ''}
      </div>
    </div>
  `
  await smartDelay(3000)
}

// Aktualizovat ikonu speciální schopnosti na základě hodu mincí
function reclassifySpecialSkillIcon(specialSkill, isTeam1, skillIndex, teamFlag) {
  // Najít kontejner ikony
  const teamSkillsContainers = document.querySelectorAll('.game-container .skill-ball-container')

  // Najít správný kontejner (musíme projít všechny a najít ten s odpovídajícím hráčem)
  let targetContainer = null
  for (const container of teamSkillsContainers) {
    const playerId = container.getAttribute('data-player-id')
    const team = container.getAttribute('data-team')
    if (playerId == specialSkill.player.id && ((isTeam1 && team === 'team1') || (!isTeam1 && team === 'team2'))) {
      targetContainer = container
      break
    }
  }

  if (!targetContainer) return

  const skillBall = targetContainer.querySelector('.skill-ball')
  const skillTag = targetContainer.querySelector('.skill-ball-tag')

  if (!skillBall || !skillTag) return

  // Odstranit všechny staré třídy
  skillBall.classList.remove('offensive', 'defensive', 'ultimate-offensive', 'ultimate-defensive', 'special')
  skillTag.classList.remove('offensive', 'defensive', 'ultimate-offensive', 'ultimate-defensive', 'special')

  // Přidat nové třídy podle výsledku
  if (specialSkill.isFailedSpecial) {
    // Neudělat nic - ponechat původní vzhled, protože hra končí
  } else if (specialSkill.coinFlipResult === 'ultimate') {
    if (specialSkill.isOffensive) {
      skillBall.classList.add('ultimate-offensive')
      skillTag.classList.add('ultimate-offensive')
    } else if (specialSkill.isDefensive) {
      skillBall.classList.add('ultimate-defensive')
      skillTag.classList.add('ultimate-defensive')
    }
  } else if (specialSkill.coinFlipResult === 'standard') {
    if (specialSkill.isOffensive) {
      skillBall.classList.add('offensive')
      skillTag.classList.add('offensive')
    } else if (specialSkill.isDefensive) {
      skillBall.classList.add('defensive')
      skillTag.classList.add('defensive')
    }
  }
}

// Zpracování speciálních schopností - hození mincí a reklasifikace
async function processSpecialSkillsCoinFlip(team1Skills, team2Skills, evalDiv) {
  // Najít všechny speciální schopnosti (ID 10, 11, 19)
  const specialSkills = [...team1Skills, ...team2Skills].filter(s => s.isSpecial && (s.skill === 10 || s.skill === 11 || s.skill === 19))

  if (specialSkills.length === 0) return

  // Získat komentářové panely
  const team1Panel = document.getElementById('team1-commentary')
  const team2Panel = document.getElementById('team2-commentary')

  // Pro každou speciální schopnost hodit mincemi
  for (const specialSkill of specialSkills) {
    const isTeam1 = team1Skills.includes(specialSkill)
    const skillData = skills[specialSkill.skill]
    const targetPanel = isTeam1 ? team1Panel : team2Panel

    // Hodit dvěma mincemi (true = panna/tails, false = hlava/heads)
    const coin1 = Math.random() < 0.5 // true = panna
    const coin2 = Math.random() < 0.5 // true = panna
    const pannyCount = (coin1 ? 1 : 0) + (coin2 ? 1 : 0)

    // Vytvořit výsledný typ schopnosti
    let resultType = ''
    let resultEmoji = ''

    // Reklasifikovat schopnost na základě výsledku
    if (pannyCount === 0) {
      // 0 panen = prohraná výměna
      specialSkill.coinFlipResult = 'failed'
      specialSkill.isFailedSpecial = true
      resultType = 'Prohraná výměna'
      resultEmoji = '❌'

    } else if (pannyCount === 1) {
      // 1 panna = standardní útok
      specialSkill.coinFlipResult = 'standard'

      // Určit, zda jde o útočnou nebo obrannou schopnost
      if (specialSkill.skill === 10 || specialSkill.skill === 19 || specialSkill.skill === 11) {
        specialSkill.isOffensive = true
        specialSkill.isDefensive = false
        specialSkill.isUltimate = false
        resultType = 'Standardní útok'
        resultEmoji = '⚔️'
      }

    } else if (pannyCount === 2) {
      // 2 panny = ultimate
      specialSkill.coinFlipResult = 'ultimate'
      specialSkill.isUltimate = true

      // Určit typ ultimate
      if (specialSkill.skill === 10 || specialSkill.skill === 19) {
        // Skákaná smeč a Vytlučený blok = útočná ultimate
        specialSkill.isOffensive = true
        specialSkill.isDefensive = false
        resultType = 'Útočná ULTIMATE'
        resultEmoji = '⭐'
      } else if (specialSkill.skill === 11) {
        // Smečovaný servis = obranná ultimate
        specialSkill.isOffensive = false
        specialSkill.isDefensive = true
        resultType = 'Obranná ULTIMATE'
        resultEmoji = '⭐'
      }
    }

    // Kompaktní zobrazení v komentářovém okně
    if (targetPanel) {
      const coinText = `${coin1 ? '🟡' : '⚪'}${coin2 ? '🟡' : '⚪'}`
      const notification = document.createElement('div')
      notification.className = 'clash-notification coin-flip'
      notification.innerHTML = `
        <span class="skill-emoji">🪙</span>
        <span class="player-name">${specialSkill.player.name}</span>
        <span class="skill-name">${skillData.name}</span>
        <span class="coin-result">${coinText}</span>
        <span class="result-emoji">${resultEmoji}</span>
        <span class="result-text">${resultType}</span>
      `
      targetPanel.appendChild(notification)
    }

    await smartDelay(2000)

    // Aktualizovat ikonu schopnosti
    reclassifySpecialSkillIcon(specialSkill, isTeam1, team1Skills.indexOf(specialSkill) !== -1 ? team1Skills.indexOf(specialSkill) : team2Skills.indexOf(specialSkill), isTeam1)
  }
}

// Fázové vyhodnocení s animacemi - NOVÝ BODOVÝ SYSTÉM
async function evaluatePointWithPhases(team1Skills, team2Skills) {
  const evalDiv = getEvaluationDiv()

  // Resetovat všechny animace ikon na začátku výměny (rozbitá ikona se opraví)
  resetAllSkillIconAnimations()

  // Resetovat ikony speciálních schopností na začátku výměny
  resetSpecialSkillIcons()

  // FÁZE 0: Hodit mincemi pro všechny speciální schopnosti a reklasifikovat je
  await processSpecialSkillsCoinFlip(team1Skills, team2Skills, evalDiv)

  // FÁZE 0B: Zpracovat neúspěšné speciální schopnosti (0 panen)
  const failedSpecialSkills = [...team1Skills, ...team2Skills].filter(s => s.isFailedSpecial)

  if (failedSpecialSkills.length > 0) {
    // Pokud je nějaká neúspěšná speciální schopnost, bod pro soupeře
    const failedSkill = failedSpecialSkills[0] // Použít první neúspěšnou
    const isTeam1 = team1Skills.includes(failedSkill)
    const skillData = skills[failedSkill.skill]

    evalDiv.innerHTML = `
      <div style="background: rgba(255,0,0,0.3); padding: 25px; margin: 20px 0; border-radius: 15px; color: white; text-align: center;">
        <h2>❌ Speciální schopnost selhala!</h2>
        <p><strong>${failedSkill.player.name}</strong>: ${skillData.name}</p>
        <p style="font-size: 1.2rem; margin-top: 15px;">⚠️ Bod pro soupeře!</p>
      </div>
    `
    await smartDelay(2500)

    // Přehrát animaci selhání
    await animateSkillEvaluation(failedSkill, null, 'failed')

    return {
      winner: isTeam1 ? 'team2' : 'team1',
      reason: `${failedSkill.player.name} neuspěl se speciální schopností ${skillData.name}`,
      team1Points: isTeam1 ? 0 : 1,
      team2Points: isTeam1 ? 1 : 0,
      interactions: []
    }
  }

  // FÁZE 0A: Zpracovat NESMYSL (priorita před všemi ostatními schopnostmi)
  const nonsenseAttempts = [...team1Skills, ...team2Skills].filter(s => s.isNonsense)

  for (const nonsenseSkill of nonsenseAttempts) {
    const isTeam1 = team1Skills.includes(nonsenseSkill)
    const teamName = isTeam1 ? gameState.team1Name : gameState.team2Name
    const opponentTeam = isTeam1 ? 'team2' : 'team1'
    const playerNonsenseName = nonsenseSkill.player.nonsenseName || 'Nesmysl'
    const playerId = nonsenseSkill.player.id

    // Přehrát specifickou hudbu pro hráče, pokud existuje
    let backgroundMusic = null
    if (playerNonsenseMusic[playerId]) {
      backgroundMusic = playAudioBackground(playerNonsenseMusic[playerId], 0.5)
    }

    evalDiv.innerHTML = `
      <div class="nonsense-attempt">
        <h2>🎪 ${nonsenseSkill.player.name} se pokouší o ${playerNonsenseName}!</h2>
        <p>Šance na úspěch: <strong>10%</strong></p>
      </div>
    `
    await smartDelay(2000)

    const nonsenseSuccess = Math.random() < 0.1

    if (nonsenseSuccess) {
      // ÚSPĚCH! Nebránitelný bod + debuff soupeře
      // Aplikovat debuff pouze na hráče v aktuální sestavě soupeře
      const opponentLineup = isTeam1 ? gameState.team2 : gameState.team1
      if (!gameState.nonsenseDebuffedPlayers) {
        gameState.nonsenseDebuffedPlayers = new Set()
      }

      // Označit všechny hráče v sestavě soupeře jako debuffnuté
      opponentLineup.forEach(player => {
        gameState.nonsenseDebuffedPlayers.add(player.id)
      })

      // Zastavit specifickou hudbu
      if (backgroundMusic) {
        backgroundMusic.pause()
      }

      // Přehrát epickou hudbu a wow zvuky
      const epicMusic = playAudioBackground(epicNonsenseMusic, 0.6)
      playAudioBackground(wowSound, 0.7)

      // Přehrát zvuk úspěšného nesmyslu
      soundManager.playNonsenseSuccess()

      evalDiv.innerHTML = `
        <div class="nonsense-success">
          <h2>🎉 NESMYSL SE PODAŘIL!</h2>
          <p><strong>${nonsenseSkill.player.name}</strong> úspěšně provedl ${playerNonsenseName}!</p>
          <p class="effect">✅ Nebránitelný bod pro ${teamName}</p>
          <p class="effect">⚠️ Hráči soupeře v sestavě mají poloviční statistiky do konce dílčího zápasu!</p>
          <p class="wow-text">WOOOOOOW! 😱🔥</p>
        </div>
      `
      await smartDelay(2000)

      // Přehrát úspěšné video, pokud existuje
      const video = getPlayerSkillVideo(playerId, 15, 'success')
      if (video) {
        await showActionVideo({
          attacker: nonsenseSkill,
          result: 'success'
        }, video, false)
      }

      // Zastavit epickou hudbu
      if (epicMusic) {
        epicMusic.pause()
      }

      return {
        winner: isTeam1 ? 'team1' : 'team2',
        reason: `${teamName} vyhrál nesmyslem ${playerNonsenseName}!`,
        team1Points: isTeam1 ? 1 : 0,
        team2Points: isTeam1 ? 0 : 1,
        interactions: []
      }
    } else {
      // NEÚSPĚCH! Vystřídání + trenérovy poznámky

      // Zastavit hudbu
      if (backgroundMusic) {
        backgroundMusic.pause()
      }

      gameState.nonsenseAttempts.push({
        playerId: playerId,
        playerName: nonsenseSkill.player.name,
        nonsenseName: playerNonsenseName
      })

      const coachQuote = getCoachQuote('offensiveFail', nonsenseSkill.player.name)

      // Zkontrolovat, zda je možné provést střídání
      const teamName = isTeam1 ? 'team1' : 'team2'
      const team = isTeam1 ? gameState.team1 : gameState.team2
      const bench = isTeam1 ? gameState.team1Bench : gameState.team2Bench
      const subsThisSet = isTeam1 ? gameState.team1SubstitutionsThisSet : gameState.team2SubstitutionsThisSet
      const playersPerTeam = gameState.playersPerTeam
      const maxSubs = playersPerTeam === 3 ? 4 : (playersPerTeam === 2 ? 2 : 0)

      let substitutionPossible = false
      let substitute = null
      let canSubstitute = subsThisSet < maxSubs

      // Pokud je na lavičce nějaký hráč a je možné střídat, zkusit najít náhradníka
      if (bench.length > 0 && canSubstitute) {
        substitute = findBestSubstitute(nonsenseSkill.player, bench, team)
        if (substitute) {
          substitutionPossible = true
        }
      }

      // Zobrazit výsledek
      // Přehrát zvuk neúspěchu
      soundManager.playSkillFail()

      evalDiv.innerHTML = `
        <div class="nonsense-fail">
          <h2>❌ NESMYSL SELHAL!</h2>
          <p><strong>${nonsenseSkill.player.name}</strong> neuspěl s pokusem o ${playerNonsenseName}</p>
          <p class="effect">⚠️ Bod pro soupeře!</p>
        </div>
      `
      await smartDelay(2000)

      // NEJDŘÍV přehrát video neúspěchu, pokud existuje
      const failVideo = getPlayerSkillVideo(playerId, 15, 'fail')
      if (failVideo) {
        await showActionVideo({
          attacker: nonsenseSkill,
          result: 'failed'
        }, failVideo, false)
      }

      // PAK zobrazit trenérovu hlášku
      await smartDelay(1000)

      // Pokud nemůžeme střídat kvůli limitu, zobrazit speciální hlášku
      let finalCoachQuote = coachQuote
      if (!canSubstitute && bench.length > 0) {
        finalCoachQuote = "Máš štěstí, že už nemůžu střídat!"
      }

      updateCoachBubble(`"${finalCoachQuote}"`)
      await smartDelay(2000)

      // Nesmysl selhal - bod pro soupeře
      // Vrátit informaci o střídání v result objektu
      return {
        winner: isTeam1 ? 'team2' : 'team1',
        reason: `${nonsenseSkill.player.name} neuspěl s nesmyslem. Bod pro soupeře.`,
        team1Points: isTeam1 ? 0 : 1,
        team2Points: isTeam1 ? 1 : 0,
        interactions: [],
        substitution: substitutionPossible && substitute ? {
          teamName: teamName,
          playerOut: nonsenseSkill.player,
          playerIn: substitute,
          playerId: playerId
        } : null
      }
    }
  }

  // FÁZE 1: Zpracovat SKUTEČNÉ ULTIMATE (kromě Tupé rány a Smečovaného servisu)
  // DŮLEŽITÉ: Vyhodnocovat podle TYPU schopnosti, ne podle týmu!
  const team1SuccessfulUltimateOffensive = []
  const team2SuccessfulUltimateOffensive = []
  const team1SuccessfulUltimateDefensive = []
  const team2SuccessfulUltimateDefensive = []

  // Spojit všechny skutečné ultimate schopnosti (kromě ID 4 a 11)
  const allUltimateSkills = [
    ...team1Skills.filter(s => s.isUltimate && s.skill !== 4 && s.skill !== 11),
    ...team2Skills.filter(s => s.isUltimate && s.skill !== 4 && s.skill !== 11)
  ]

  // Roztřídit je podle typu (obranné/útočné)
  for (const skillObj of allUltimateSkills) {
    const isTeam1 = team1Skills.includes(skillObj)
    if (skillObj.isDefensive) {
      // Obranné ultimate
      if (isTeam1) {
        team1SuccessfulUltimateDefensive.push(skillObj)
      } else {
        team2SuccessfulUltimateDefensive.push(skillObj)
      }
    } else if (skillObj.isOffensive) {
      // Útočné ultimate
      if (isTeam1) {
        team1SuccessfulUltimateOffensive.push(skillObj)
      } else {
        team2SuccessfulUltimateOffensive.push(skillObj)
      }
    }
  }

  // ====================================================================
  // POZNÁMKA: SPECIÁLNÍ SCHOPNOSTI (4, 11) se vyhodnotí AŽ PO ultimate!
  // ====================================================================

  // ====================================================================
  // VYHODNOTIT OBRANNÉ ULTIMATE (mají přednost!)
  // ====================================================================
  const t1DefCount = team1SuccessfulUltimateDefensive.length
  const t2DefCount = team2SuccessfulUltimateDefensive.length

  // Zobrazit obranné ultimate
  if (t1DefCount > 0 || t2DefCount > 0) {
    let defensiveHTML = '<div class="ultimates-check">'
    if (t1DefCount > 0 && t2DefCount > 0) {
      defensiveHTML += `<p>🛡️ ${t1DefCount}x obranná ultimate (levá strana) vs ${t2DefCount}x obranná ultimate (pravá strana)</p>`
    } else if (t1DefCount > 0) {
      defensiveHTML += `<p>🛡️ ${t1DefCount}x obranná ultimate (levá strana)</p>`
    } else {
      defensiveHTML += `<p>🛡️ ${t2DefCount}x obranná ultimate (pravá strana)</p>`
    }
    defensiveHTML += '</div>'
    evalDiv.innerHTML = defensiveHTML
    await smartDelay(1500)
  }

  // Obranné ultimate se vzájemně ruší (stejný počet)
  const minDefensive = Math.min(t1DefCount, t2DefCount)
  const activeT1Defensive = t1DefCount - minDefensive
  const activeT2Defensive = t2DefCount - minDefensive

  if (minDefensive > 0) {
    evalDiv.innerHTML = `<p class="ultimate-cancel">↔️ ${minDefensive}x obranné ultimate se vzájemně zrušily</p>`
    await smartDelay(1500)
  }

  // Určit, které týmy mají aktivní obrannou ultimate
  const team1HasDefense = activeT1Defensive > 0
  const team2HasDefense = activeT2Defensive > 0

  if (team1HasDefense) {
    evalDiv.innerHTML = '<p class="ultimate-active">🛡️ Aktivní obranná ultimate (levá) blokuje všechny útoky zprava!</p>'
    await smartDelay(2000)
  }

  if (team2HasDefense) {
    evalDiv.innerHTML = '<p class="ultimate-active">🛡️ Aktivní obranná ultimate (pravá) blokuje všechny útoky zleva!</p>'
    await smartDelay(2000)
  }

  // ====================================================================
  // VYHODNOTIT ÚTOČNÉ ULTIMATE
  // ====================================================================
  const t1OffCount = team1SuccessfulUltimateOffensive.length
  const t2OffCount = team2SuccessfulUltimateOffensive.length

  // Zobrazit útočné ultimate
  if (t1OffCount > 0 || t2OffCount > 0) {
    let offensiveHTML = '<div class="ultimates-check">'
    if (t1OffCount > 0 && t2OffCount > 0) {
      offensiveHTML += `<p>⚔️ ${t1OffCount}x útočná ultimate (levá) vs ${t2OffCount}x útočná ultimate (pravá)</p>`
    } else if (t1OffCount > 0) {
      offensiveHTML += `<p>⚔️ ${t1OffCount}x útočná ultimate (levá strana)</p>`
    } else {
      offensiveHTML += `<p>⚔️ ${t2OffCount}x útočná ultimate (pravá strana)</p>`
    }
    offensiveHTML += '</div>'
    evalDiv.innerHTML = offensiveHTML
    await smartDelay(1500)
  }

  // Určit, které útoky jsou zablokované obranou
  let team1OffensiveBlocked = team2HasDefense
  let team2OffensiveBlocked = team1HasDefense

  // Zobrazit blokování útočných ultimate, pokud došlo
  if (team2HasDefense && t1OffCount > 0) {
    const chosenDefensive = team2SuccessfulUltimateDefensive[Math.floor(Math.random() * team2SuccessfulUltimateDefensive.length)]
    const chosenOffensive = team1SuccessfulUltimateOffensive[Math.floor(Math.random() * team1SuccessfulUltimateOffensive.length)]
    await showSkillClash(chosenOffensive, chosenDefensive, 'blocked')
    evalDiv.innerHTML = '<p class="ultimate-blocked">🛡️ Obranná ultimate (pravá) zablokovala útočnou ultimate (levá)!</p>'
    await smartDelay(2000)
  }

  if (team1HasDefense && t2OffCount > 0) {
    const chosenDefensive = team1SuccessfulUltimateDefensive[Math.floor(Math.random() * team1SuccessfulUltimateDefensive.length)]
    const chosenOffensive = team2SuccessfulUltimateOffensive[Math.floor(Math.random() * team2SuccessfulUltimateOffensive.length)]
    await showSkillClash(chosenOffensive, chosenDefensive, 'blocked')
    evalDiv.innerHTML = '<p class="ultimate-blocked">🛡️ Obranná ultimate (levá) zablokovala útočnou ultimate (pravá)!</p>'
    await smartDelay(2000)
  }

  // Uložit si ultimátní obrany pro pozdější použití (srážky se standardními útoky)
  let ultimateDefenseTeam1 = null
  let ultimateDefenseTeam2 = null
  if (team1HasDefense && team1SuccessfulUltimateDefensive.length > 0) {
    ultimateDefenseTeam1 = team1SuccessfulUltimateDefensive[Math.floor(Math.random() * team1SuccessfulUltimateDefensive.length)]
  }
  if (team2HasDefense && team2SuccessfulUltimateDefensive.length > 0) {
    ultimateDefenseTeam2 = team2SuccessfulUltimateDefensive[Math.floor(Math.random() * team2SuccessfulUltimateDefensive.length)]
  }

  // Určit, kdo získává body z útočných ultimate (pouze ty nezablokované)
  let team1UltimatePoints = 0
  let team2UltimatePoints = 0

  if (t1OffCount > 0 && !team1OffensiveBlocked) {
    team1UltimatePoints = t1OffCount
  }

  if (t2OffCount > 0 && !team2OffensiveBlocked) {
    team2UltimatePoints = t2OffCount
  }

  // Zobrazit úspěšné útočné ultimate
  if (team1UltimatePoints > 0 || team2UltimatePoints > 0) {
    // Zobrazit úspěšnou ultimate
    if (team1UltimatePoints > 0) {
      const chosenUltimate = team1SuccessfulUltimateOffensive[Math.floor(Math.random() * team1SuccessfulUltimateOffensive.length)]
      await showSkillClash(chosenUltimate, null, 'success')
      evalDiv.innerHTML = `<p class="ultimate-success">⚔️ ${gameState.team1Name} získal ${team1UltimatePoints} bod(y) z útočné ultimate!</p>`
      await smartDelay(1500)
    }
    if (team2UltimatePoints > 0) {
      const chosenUltimate = team2SuccessfulUltimateOffensive[Math.floor(Math.random() * team2SuccessfulUltimateOffensive.length)]
      await showSkillClash(chosenUltimate, null, 'success')
      evalDiv.innerHTML = `<p class="ultimate-success">⚔️ ${gameState.team2Name} získal ${team2UltimatePoints} bod(y) z útočné ultimate!</p>`
      await smartDelay(1500)
    }

    // DŮLEŽITÉ: Po úspěšné útočné ultimate se běžné dovednosti nevyhodnocují
    // Přejít rovnou k výsledku
    evalDiv.innerHTML = `
      <div class="points-summary">
        <h3>Součet bodů z ultimate:</h3>
        <div class="team-points">
          <div class="team-point-box">
            <h4>${gameState.team1Name}</h4>
            <div class="point-value ${team1UltimatePoints > 0 ? 'positive' : 'neutral'}">${team1UltimatePoints > 0 ? '+' : ''}${team1UltimatePoints}</div>
          </div>
          <div class="team-point-box">
            <h4>${gameState.team2Name}</h4>
            <div class="point-value ${team2UltimatePoints > 0 ? 'positive' : 'neutral'}">${team2UltimatePoints > 0 ? '+' : ''}${team2UltimatePoints}</div>
          </div>
        </div>
      </div>
    `
    await smartDelay(2000)

    // Vrátit výsledek s body z ultimate, pokud není remíza na 10+
    if (team1UltimatePoints > team2UltimatePoints) {
      // Vytvořit interakce pro úspěšné útočné ultimate týmu 1
      const ultimateInteractions = team1SuccessfulUltimateOffensive.map(ultimate => ({
        attacker: ultimate,
        defender: null,
        result: 'success',
        attackingTeam: 'team1',
        pointChange: 1
      }))

      return {
        winner: 'team1',
        reason: `${gameState.team1Name} získal výměnu z útočné ultimate (${team1UltimatePoints}:${team2UltimatePoints})`,
        team1Points: team1UltimatePoints,
        team2Points: team2UltimatePoints,
        interactions: ultimateInteractions
      }
    } else if (team2UltimatePoints > team1UltimatePoints) {
      // Vytvořit interakce pro úspěšné útočné ultimate týmu 2
      const ultimateInteractions = team2SuccessfulUltimateOffensive.map(ultimate => ({
        attacker: ultimate,
        defender: null,
        result: 'success',
        attackingTeam: 'team2',
        pointChange: 1
      }))

      return {
        winner: 'team2',
        reason: `${gameState.team2Name} získal výměnu z útočné ultimate (${team2UltimatePoints}:${team1UltimatePoints})`,
        team1Points: team1UltimatePoints,
        team2Points: team2UltimatePoints,
        interactions: ultimateInteractions
      }
    } else if (team1UltimatePoints >= 10 && team2UltimatePoints >= 10 && team1UltimatePoints === team2UltimatePoints) {
      // SPECIÁLNÍ PŘÍPAD: Pokud oba týmy mají 10+ bodů a je to stejný počet,
      // pokračujeme vyhodnocením běžných schopností, abychom našli vítěze 10:9
      evalDiv.innerHTML = `
        <div class="special-situation">
          <h3>⚖️ Speciální situace!</h3>
          <p>Oba týmy mají ${team1UltimatePoints} bodů z ultimate.</p>
          <p>Pokračujeme vyhodnocením dalších schopností pro určení vítěze 10:9...</p>
        </div>
      `
      await smartDelay(2500)
      // NEPŘERUŠUJEME - pokračujeme dál běžnými schopnostmi
      // Nastavíme počáteční body z ultimate
      team1Points = team1UltimatePoints
      team2Points = team2UltimatePoints
    } else {
      // Stejný počet bodů z ultimate - OBA TÝMY ZÍSKÁVAJÍ BODY!
      // Důvod: Útočné ultimate jsou na stejné úrovni, obě mají právo na bod
      evalDiv.innerHTML = `
        <div class="equal-ultimates">
          <h3>⚖️ Rovnocenné ultimate!</h3>
          <p>Oba týmy mají po ${team1UltimatePoints} bodech z útočných ultimate.</p>
          <p class="ultimate-equal">✅ Obě strany dostávají body! (${team1UltimatePoints}:${team2UltimatePoints})</p>
        </div>
      `
      await smartDelay(2500)

      // Vytvořit interakce pro oba týmy
      const allUltimateInteractions = [
        ...team1SuccessfulUltimateOffensive.map(ultimate => ({
          attacker: ultimate,
          defender: null,
          result: 'success',
          attackingTeam: 'team1',
          pointChange: 1
        })),
        ...team2SuccessfulUltimateOffensive.map(ultimate => ({
          attacker: ultimate,
          defender: null,
          result: 'success',
          attackingTeam: 'team2',
          pointChange: 1
        }))
      ]

      return {
        winner: 'draw',
        reason: `Rovnocenné útočné ultimate - body pro oba týmy (${team1UltimatePoints}:${team2UltimatePoints})`,
        team1Points: team1UltimatePoints,
        team2Points: team2UltimatePoints,
        interactions: allUltimateInteractions
      }
    }
  }

  // Pokud obranná ultimate zablokovala všechny útoky jedné strany, poznamenat si to
  const team1AllAttacksBlocked = team2HasDefense
  const team2AllAttacksBlocked = team1HasDefense

  // ====================================================================
  // FÁZE SPECIÁLNÍCH SCHOPNOSTÍ: Vyhodnotit Tupou ránu (4) a Smečovaný servis (11)
  // Tyto schopnosti se vyhodnocují AŽ PO ultimate
  // ====================================================================

  // Sledovat, které speciální schopnosti mají standardní efekt (1 panna)
  const specialSkillsWithStandardEffect = new Set()

  // Najít univerzální obrany (budou potřeba později)
  const team1UniversalDefenses = team1Skills.filter(s => (s.skill === 16 || s.skill === 17) && !s.isUltimate)
  const team2UniversalDefenses = team2Skills.filter(s => (s.skill === 16 || s.skill === 17) && !s.isUltimate)

  // Smečovaný servis Týmu 1 (ID 11)
  for (const skillObj of team1Skills.filter(s => s.skill === 11)) {
    const successRate = calculateSkillSuccessRate(skillObj.player, 11, gameState.nonsenseDebuffs.team1)
    const coin1 = Math.random() < 0.5
    const coin2 = Math.random() < 0.5
    const tails = (coin1 ? 1 : 0) + (coin2 ? 1 : 0)
    const coin1Text = coin1 ? 'Panna' : 'Hlava'
    const coin2Text = coin2 ? 'Panna' : 'Hlava'

    await showCoinFlip(2, [coin1, coin2])

    if (tails === 0) {
      // Hlava + Hlava = prohraná výměna
      updateSpecialSkillIcon(skillObj, 'team1', 'offensive')
      const failureType = Math.random() < 0.5 ? 'do autu' : 'do sítě'
      const comment = `Smečovaný servis: ${coin1Text} + ${coin2Text} = <strong>Prohraná výměna!</strong>`
      await showSkillComment(skillObj, successRate, false, comment)
      // Přehrát zvuk neúspěchu
      soundManager.playSkillFail()
      await showSkillClash(skillObj, null, 'failed')

      const failedVideo = getPlayerSkillVideo(skillObj.player.id, 11, 'fail')
      if (failedVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'failed' }, failedVideo, false, true)
      }

      return {
        winner: 'team2',
        reason: `Smečovaný servis...${failureType}!`,
        team1Points: 0,
        team2Points: 1,
        decisiveSkill: skillObj,
        interactions: []
      }
    } else if (tails === 1) {
      // 1 panna = standardní útok
      updateSpecialSkillIcon(skillObj, 'team1', 'offensive')
      const comment = `Smečovaný servis: ${coin1Text} + ${coin2Text} = <strong>Standardní útok</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      specialSkillsWithStandardEffect.add(skillObj)
      // Přehrát zvuk kontaktu s míčem pro standardní útok ze smečovaného servisu
      soundManager.playBallHit()
    } else {
      // 2 panny = nebránitelný bod! Transformovat na obrannou ultimate
      skillObj.isOffensive = false
      skillObj.isDefensive = true
      skillObj.isUltimate = true
      skillObj.coinFlipResult = 'ultimate'

      updateSpecialSkillIcon(skillObj, 'team1', 'ultimate-defensive')
      const comment = `Smečovaný servis: ${coin1Text} + ${coin2Text} = <strong>Efekt obranné ultimate - nebránitelný bod!</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      // Přehrát zvuk obranné ultimate
      soundManager.playUltimateDefense()
      await showSkillClash(skillObj, null, 'success')

      const successVideo = getPlayerSkillVideo(skillObj.player.id, 11, 'success')
      if (successVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'success' }, successVideo, false)
      }

      return {
        winner: 'team1',
        reason: `Smečovaný servis s efektem obranné ultimate - nebránitelný bod!`,
        team1Points: 1,
        team2Points: 0,
        decisiveSkill: skillObj,
        interactions: [{
          attacker: skillObj,
          defender: null,
          result: 'success',
          attackingTeam: 'team1',
          pointChange: 1
        }]
      }
    }
  }

  // Smečovaný servis Týmu 2 (ID 11)
  for (const skillObj of team2Skills.filter(s => s.skill === 11)) {
    const successRate = calculateSkillSuccessRate(skillObj.player, 11, gameState.nonsenseDebuffs.team2)
    const coin1 = Math.random() < 0.5
    const coin2 = Math.random() < 0.5
    const tails = (coin1 ? 1 : 0) + (coin2 ? 1 : 0)
    const coin1Text = coin1 ? 'Panna' : 'Hlava'
    const coin2Text = coin2 ? 'Panna' : 'Hlava'

    await showCoinFlip(2, [coin1, coin2])

    if (tails === 0) {
      // Hlava + Hlava = prohraná výměna
      updateSpecialSkillIcon(skillObj, 'team2', 'offensive')
      const failureType = Math.random() < 0.5 ? 'do autu' : 'do sítě'
      const comment = `Smečovaný servis: ${coin1Text} + ${coin2Text} = <strong>Prohraná výměna!</strong>`
      await showSkillComment(skillObj, successRate, false, comment)
      // Přehrát zvuk neúspěchu
      soundManager.playSkillFail()
      await showSkillClash(skillObj, null, 'failed')

      const failedVideo = getPlayerSkillVideo(skillObj.player.id, 11, 'fail')
      if (failedVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'failed' }, failedVideo, false, true)
      }

      return {
        winner: 'team1',
        reason: `Smečovaný servis...${failureType}!`,
        team1Points: 1,
        team2Points: 0,
        decisiveSkill: skillObj,
        interactions: []
      }
    } else if (tails === 1) {
      // 1 panna = standardní útok
      updateSpecialSkillIcon(skillObj, 'team2', 'offensive')
      const comment = `Smečovaný servis: ${coin1Text} + ${coin2Text} = <strong>Standardní útok</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      specialSkillsWithStandardEffect.add(skillObj)
      // Přehrát zvuk kontaktu s míčem pro standardní útok ze smečovaného servisu
      soundManager.playBallHit()
    } else {
      // 2 panny = nebránitelný bod! Transformovat na obrannou ultimate
      skillObj.isOffensive = false
      skillObj.isDefensive = true
      skillObj.isUltimate = true
      skillObj.coinFlipResult = 'ultimate'

      updateSpecialSkillIcon(skillObj, 'team2', 'ultimate-defensive')
      const comment = `Smečovaný servis: ${coin1Text} + ${coin2Text} = <strong>Efekt obranné ultimate - nebránitelný bod!</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      // Přehrát zvuk obranné ultimate
      soundManager.playUltimateDefense()
      await showSkillClash(skillObj, null, 'success')

      const successVideo = getPlayerSkillVideo(skillObj.player.id, 11, 'success')
      if (successVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'success' }, successVideo, false)
      }

      return {
        winner: 'team2',
        reason: `Smečovaný servis s efektem obranné ultimate - nebránitelný bod!`,
        team1Points: 0,
        team2Points: 1,
        decisiveSkill: skillObj,
        interactions: [{
          attacker: skillObj,
          defender: null,
          result: 'success',
          attackingTeam: 'team2',
          pointChange: 1
        }]
      }
    }
  }

  // Skákaná smeč Týmu 1 (ID 10)
  for (const skillObj of team1Skills.filter(s => s.skill === 10)) {
    const successRate = calculateSkillSuccessRate(skillObj.player, 10, gameState.nonsenseDebuffs.team1)
    const coin1 = Math.random() < 0.5
    const coin2 = Math.random() < 0.5
    const tails = (coin1 ? 1 : 0) + (coin2 ? 1 : 0)
    const coin1Text = coin1 ? 'Panna' : 'Hlava'
    const coin2Text = coin2 ? 'Panna' : 'Hlava'

    await showCoinFlip(2, [coin1, coin2])

    if (tails === 0) {
      // Hlava + Hlava = prohraná výměna
      updateSpecialSkillIcon(skillObj, 'team1', 'defensive')
      const failureType = Math.random() < 0.5 ? 'do autu' : 'do sítě'
      const comment = `Skákaná smeč: ${coin1Text} + ${coin2Text} = <strong>Prohraná výměna!</strong>`
      await showSkillComment(skillObj, successRate, false, comment)
      // Přehrát zvuk neúspěchu
      soundManager.playSkillFail()
      await showSkillClash(skillObj, null, 'failed')

      const failedVideo = getPlayerSkillVideo(skillObj.player.id, 10, 'fail')
      if (failedVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'failed' }, failedVideo, false, true)
      }

      return {
        winner: 'team2',
        reason: `Skákaná smeč...${failureType}!`,
        team1Points: 0,
        team2Points: 1,
        decisiveSkill: skillObj,
        interactions: []
      }
    } else if (tails === 1) {
      // 1 panna = standardní útok
      updateSpecialSkillIcon(skillObj, 'team1', 'offensive')
      const comment = `Skákaná smeč: ${coin1Text} + ${coin2Text} = <strong>Standardní útok</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      specialSkillsWithStandardEffect.add(skillObj)
      // Přehrát zvuk kontaktu s míčem pro standardní útok ze skákané smeče
      soundManager.playBallHit()
    } else {
      // 2 panny = nebránitelný bod! Transformovat na útočnou ultimate
      skillObj.isOffensive = true
      skillObj.isDefensive = false
      skillObj.isUltimate = true
      skillObj.coinFlipResult = 'ultimate'

      updateSpecialSkillIcon(skillObj, 'team1', 'ultimate-offensive')
      const comment = `Skákaná smeč: ${coin1Text} + ${coin2Text} = <strong>Efekt útočné ultimate - nebránitelný bod!</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      // Přehrát zvuk útočné ultimate
      soundManager.playUltimateAttack()
      await showSkillClash(skillObj, null, 'success')

      const successVideo = getPlayerSkillVideo(skillObj.player.id, 10, 'success')
      if (successVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'success' }, successVideo, false)
      }

      return {
        winner: 'team1',
        reason: `Skákaná smeč s efektem útočné ultimate - nebránitelný bod!`,
        team1Points: 1,
        team2Points: 0,
        decisiveSkill: skillObj,
        interactions: [{
          attacker: skillObj,
          defender: null,
          result: 'success',
          attackingTeam: 'team1',
          pointChange: 1
        }]
      }
    }
  }

  // Skákaná smeč Týmu 2 (ID 10)
  for (const skillObj of team2Skills.filter(s => s.skill === 10)) {
    const successRate = calculateSkillSuccessRate(skillObj.player, 10, gameState.nonsenseDebuffs.team2)
    const coin1 = Math.random() < 0.5
    const coin2 = Math.random() < 0.5
    const tails = (coin1 ? 1 : 0) + (coin2 ? 1 : 0)
    const coin1Text = coin1 ? 'Panna' : 'Hlava'
    const coin2Text = coin2 ? 'Panna' : 'Hlava'

    await showCoinFlip(2, [coin1, coin2])

    if (tails === 0) {
      // Hlava + Hlava = prohraná výměna
      updateSpecialSkillIcon(skillObj, 'team2', 'defensive')
      const failureType = Math.random() < 0.5 ? 'do autu' : 'do sítě'
      const comment = `Skákaná smeč: ${coin1Text} + ${coin2Text} = <strong>Prohraná výměna!</strong>`
      await showSkillComment(skillObj, successRate, false, comment)
      // Přehrát zvuk neúspěchu
      soundManager.playSkillFail()
      await showSkillClash(skillObj, null, 'failed')

      const failedVideo = getPlayerSkillVideo(skillObj.player.id, 10, 'fail')
      if (failedVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'failed' }, failedVideo, false, true)
      }

      return {
        winner: 'team1',
        reason: `Skákaná smeč...${failureType}!`,
        team1Points: 1,
        team2Points: 0,
        decisiveSkill: skillObj,
        interactions: []
      }
    } else if (tails === 1) {
      // 1 panna = standardní útok
      updateSpecialSkillIcon(skillObj, 'team2', 'offensive')
      const comment = `Skákaná smeč: ${coin1Text} + ${coin2Text} = <strong>Standardní útok</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      specialSkillsWithStandardEffect.add(skillObj)
      // Přehrát zvuk kontaktu s míčem pro standardní útok ze skákané smeče
      soundManager.playBallHit()
    } else {
      // 2 panny = nebránitelný bod! Transformovat na útočnou ultimate
      skillObj.isOffensive = true
      skillObj.isDefensive = false
      skillObj.isUltimate = true
      skillObj.coinFlipResult = 'ultimate'

      updateSpecialSkillIcon(skillObj, 'team2', 'ultimate-offensive')
      const comment = `Skákaná smeč: ${coin1Text} + ${coin2Text} = <strong>Efekt útočné ultimate - nebránitelný bod!</strong>`
      await showSkillComment(skillObj, successRate, true, comment)
      // Přehrát zvuk útočné ultimate
      soundManager.playUltimateAttack()
      await showSkillClash(skillObj, null, 'success')

      const successVideo = getPlayerSkillVideo(skillObj.player.id, 10, 'success')
      if (successVideo) {
        await showActionVideo({ attacker: skillObj, defender: null, result: 'success' }, successVideo, false)
      }

      return {
        winner: 'team2',
        reason: `Skákaná smeč s efektem útočné ultimate - nebránitelný bod!`,
        team1Points: 0,
        team2Points: 1,
        decisiveSkill: skillObj,
        interactions: [{
          attacker: skillObj,
          defender: null,
          result: 'success',
          attackingTeam: 'team2',
          pointChange: 1
        }]
      }
    }
  }

  // ====================================================================
  // UNIVERZÁLNÍ OBRANY PROTI SPECIÁLNÍM SCHOPNOSTEM (50% šance)
  // ====================================================================
  // Univerzální obrany (Hruď 16 a Silnější noha 17) mohou zablokovat speciální schopnosti
  // se standardním efektem (1 panna) s 50% šancí

  // Tým 1 universal defense vs Tým 2 special skills se standardním efektem
  for (const univDef of team1UniversalDefenses) {
    const targetSpecialSkill = Array.from(specialSkillsWithStandardEffect).find(s => team2Skills.includes(s))

    if (targetSpecialSkill) {
      const blockSuccess = Math.random() < 0.5

      if (blockSuccess) {
        const defenseSuccessRate = calculateSkillSuccessRate(univDef.player, univDef.skill, gameState.nonsenseDebuffs.team1)
        await showSkillComment(univDef, defenseSuccessRate, true, `${getPlayerFirstNameOrNickname(univDef.player)} použil ${skills[univDef.skill].name} a zablokoval ${skills[targetSpecialSkill.skill].name}! (50% šance)`, 'defensive')
        await showSkillClash(targetSpecialSkill, univDef, 'blocked')

        return {
          winner: 'team1',
          reason: `${gameState.team2Name} prohrál výměnu - ${skills[targetSpecialSkill.skill].name} byl zablokován univerzální obranou!`,
          team1Points: 1,
          team2Points: 0,
          decisiveSkill: univDef,
          interactions: [{
            attacker: targetSpecialSkill,
            defender: univDef,
            result: 'blocked_by_universal_defense',
            attackingTeam: 'team2',
            defendingTeam: 'team1',
            pointChange: +1
          }]
        }
      }
    }
  }

  // Tým 2 universal defense vs Tým 1 special skills se standardním efektem
  for (const univDef of team2UniversalDefenses) {
    const targetSpecialSkill = Array.from(specialSkillsWithStandardEffect).find(s => team1Skills.includes(s))

    if (targetSpecialSkill) {
      const blockSuccess = Math.random() < 0.5

      if (blockSuccess) {
        const defenseSuccessRate = calculateSkillSuccessRate(univDef.player, univDef.skill, gameState.nonsenseDebuffs.team2)
        await showSkillComment(univDef, defenseSuccessRate, true, `${getPlayerFirstNameOrNickname(univDef.player)} použil ${skills[univDef.skill].name} a zablokoval ${skills[targetSpecialSkill.skill].name}! (50% šance)`, 'defensive')
        await showSkillClash(targetSpecialSkill, univDef, 'blocked')

        return {
          winner: 'team2',
          reason: `${gameState.team1Name} prohrál výměnu - ${skills[targetSpecialSkill.skill].name} byl zablokován univerzální obranou!`,
          team1Points: 0,
          team2Points: 1,
          decisiveSkill: univDef,
          interactions: [{
            attacker: targetSpecialSkill,
            defender: univDef,
            result: 'blocked_by_universal_defense',
            attackingTeam: 'team1',
            defendingTeam: 'team2',
            pointChange: +1
          }]
        }
      }
    }
  }

  // ====================================================================
  // FÁZE 2: Vyhodnocení standardních schopností
  // DŮLEŽITÉ: Vyhodnocovat podle TYPU, ne podle týmů!
  evalDiv.innerHTML = '<h3>🔍 Vyhodnocení útoků a obran...</h3>'
  await smartDelay(1000)

  // Pokud nejsou již nastaveny body z ultimate (speciální případ 10:10+), inicializovat na 0
  if (typeof team1Points === 'undefined') {
    var team1Points = 0
  }
  if (typeof team2Points === 'undefined') {
    var team2Points = 0
  }
  const interactions = []

  // Mapování útoků na obrany (které útoky blokují které obrany)
  const attackDefenseMap = {
    1: [12],  // Smeč přes blok -> Blok
    2: [14],  // Smeč do béčka/do paty -> Levá noha
    3: [13],  // Smeč po noze -> Skluz
    4: [12],  // Tupá rána kamkoliv -> Blok
    5: [12],  // Klepák -> Blok
    6: [14],  // Pata -> Levá noha
    7: [13],  // Kraťas -> Skluz
    8: [13],  // Kraťas za blok -> Skluz
    9: [12],  // Šlapaný kraťas -> Blok
    10: [],   // Skákaná smeč - už zpracováno ve FÁZI SPECIÁLNÍCH SCHOPNOSTÍ
    11: [],   // Smečovaný servis - už zpracováno ve FÁZI SPECIÁLNÍCH SCHOPNOSTÍ
    19: []    // Vytlučený blok - už zpracováno ve FÁZI SPECIÁLNÍCH SCHOPNOSTÍ
  }

  // Získat všechny standardní útočné a obranné schopnosti
  // Nyní zahrnujeme i skills 10, 11, 19, pokud mají standardní efekt (1 panna)
  const team1Attacks = team1Skills.filter(s =>
    s.isOffensive &&
    !s.isUltimate &&
    !team1SuccessfulUltimateOffensive.includes(s) &&
    !team1SuccessfulUltimateDefensive.includes(s) &&
    ((s.skill !== 10 && s.skill !== 11 && s.skill !== 19) || specialSkillsWithStandardEffect.has(s))
  )

  const team2Attacks = team2Skills.filter(s =>
    s.isOffensive &&
    !s.isUltimate &&
    !team2SuccessfulUltimateOffensive.includes(s) &&
    !team2SuccessfulUltimateDefensive.includes(s) &&
    ((s.skill !== 10 && s.skill !== 11 && s.skill !== 19) || specialSkillsWithStandardEffect.has(s))
  )

  const team1Defenses = team1Skills.filter(s =>
    s.isDefensive &&
    !s.isUltimate &&
    s.skill !== 10 &&
    s.skill !== 11 &&
    s.skill !== 19 &&
    !team1SuccessfulUltimateOffensive.includes(s) &&
    !team1SuccessfulUltimateDefensive.includes(s)
  )

  const team2Defenses = team2Skills.filter(s =>
    s.isDefensive &&
    !s.isUltimate &&
    s.skill !== 10 &&
    s.skill !== 11 &&
    s.skill !== 19 &&
    !team2SuccessfulUltimateOffensive.includes(s) &&
    !team2SuccessfulUltimateDefensive.includes(s)
  )

  // Sledovat, které schopnosti byly už zpracované
  const processedAttacks = new Set()
  const processedDefenses = new Set()

  // Sledovat, zda byla na dané straně zablokována nějaká útočná schopnost (pro nepřímou blokaci)
  let team1SideBlocked = team2AllAttacksBlocked || team1AllAttacksBlocked  // Pokud ultimate zablokovala
  let team2SideBlocked = team1AllAttacksBlocked || team2AllAttacksBlocked
  let blockingDefenseTeam1 = null  // Která obrana blokuje tým 1
  let blockingDefenseTeam2 = null  // Která obrana blokuje tým 2

  // KROK 0.5: UNIVERZÁLNÍ OBRANY PROTI BĚŽNÝM ÚTOKŮM (30% šance)
  // Univerzální obrany (Hruď 16 a Silnější noha 17) mohou zablokovat JAKÝKOLIV běžný útok s 30% šancí

  // Team1 univerzální obrany vs Team2 útoky
  for (const univDef of team1UniversalDefenses) {
    // Vybrat náhodný útok z team2, který ještě nebyl zpracován
    const availableAttacks = team2Attacks.filter(a => !processedAttacks.has(a))
    if (availableAttacks.length > 0) {
      const randomAttack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)]

      // Test úspěšnosti útoku nejdříve
      const attackSuccessRate = calculateSkillSuccessRate(randomAttack.player, randomAttack.skill, gameState.nonsenseDebuffs.team2)
      const attackSuccess = Math.random() * 100 < attackSuccessRate

      if (attackSuccess) {
        // Útok byl úspěšně aktivován, teď test univerzální obrany (30% šance)
        // Přehrát zvuk kontaktu s míčem pro úspěšně aktivovaný standardní útok
        soundManager.playBallHit()

        const universalBlockSuccess = Math.random() < 0.3

        if (universalBlockSuccess) {
          trackPlayerPerformance(randomAttack.player.id, false)

          const coachComment = getCoachAttackComment(gameState.team2Coach, false)
          showCoachQuote('team2', coachComment)

          const defenseSuccessRate = calculateSkillSuccessRate(univDef.player, univDef.skill, gameState.nonsenseDebuffs.team1)
          await showSkillComment(randomAttack, attackSuccessRate, true, `Útok byl úspěšně proveden, ale ${getPlayerFirstNameOrNickname(univDef.player)} ho ubránil univerzální obranou <strong>${skills[univDef.skill].name}</strong>! (30% šance)`, 'defensive')

          // Přehrát zvuk úspěšně zablokovaného útoku
          soundManager.playDefenseBlock()

          // VŽDY zobrazit animaci ikon
          await showSkillClash(randomAttack, univDef, 'blocked')

          // PAK přehrát video (pokud existuje)
          const interaction = {
            attacker: randomAttack,
            defender: univDef,
            result: 'blocked'
          }
          const defenseVideo = getPlayerSkillVideo(univDef.player.id, univDef.skill, 'success', interaction)
          if (defenseVideo) {
            await showActionVideo(interaction, defenseVideo, true)
          }

          addPlayerPointContribution(univDef.player, 'team1')
          interactions.push({
            attacker: randomAttack,
            defender: univDef,
            result: 'blocked_by_universal_defense',
            attackingTeam: 'team2',
            defendingTeam: 'team1',
            pointChange: 0,
            hasDefenderVideo: !!defenseVideo
          })

          team2SideBlocked = true
          blockingDefenseTeam1 = univDef

          evalDiv.innerHTML = `
            <div class="defense-successful">
              <h3>🛡️ Úspěšná univerzální obrana!</h3>
              <p><strong>${getPlayerFirstNameOrNickname(univDef.player)}</strong> ubránil útok ${getPlayerFirstNameOrNickname(randomAttack.player)} univerzální obranou!</p>
              <p class="effect">${gameState.team2Name} už nemůže získat body z útoků ve této výměně!</p>
            </div>
          `
          await smartDelay(2000)

          processedAttacks.add(randomAttack)
          processedDefenses.add(univDef)
          break
        }
      }
    }
  }

  // Team2 univerzální obrany vs Team1 útoky
  for (const univDef of team2UniversalDefenses) {
    // Vybrat náhodný útok z team1, který ještě nebyl zpracován
    const availableAttacks = team1Attacks.filter(a => !processedAttacks.has(a))
    if (availableAttacks.length > 0) {
      const randomAttack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)]

      // Test úspěšnosti útoku nejdříve
      const attackSuccessRate = calculateSkillSuccessRate(randomAttack.player, randomAttack.skill, gameState.nonsenseDebuffs.team1)
      const attackSuccess = Math.random() * 100 < attackSuccessRate

      if (attackSuccess) {
        // Útok byl úspěšně aktivován, teď test univerzální obrany (30% šance)
        // Přehrát zvuk kontaktu s míčem pro úspěšně aktivovaný standardní útok
        soundManager.playBallHit()

        const universalBlockSuccess = Math.random() < 0.3

        if (universalBlockSuccess) {
          trackPlayerPerformance(randomAttack.player.id, false)

          const coachComment = getCoachAttackComment(gameState.team1Coach, false)
          showCoachQuote('team1', coachComment)

          const defenseSuccessRate = calculateSkillSuccessRate(univDef.player, univDef.skill, gameState.nonsenseDebuffs.team2)
          await showSkillComment(randomAttack, attackSuccessRate, true, `Útok byl úspěšně proveden, ale ${getPlayerFirstNameOrNickname(univDef.player)} ho ubránil univerzální obranou <strong>${skills[univDef.skill].name}</strong>! (30% šance)`, 'defensive')

          // Přehrát zvuk úspěšně zablokovaného útoku
          soundManager.playDefenseBlock()

          // VŽDY zobrazit animaci ikon
          await showSkillClash(randomAttack, univDef, 'blocked')

          // PAK přehrát video (pokud existuje)
          const interaction = {
            attacker: randomAttack,
            defender: univDef,
            result: 'blocked'
          }
          const defenseVideo = getPlayerSkillVideo(univDef.player.id, univDef.skill, 'success', interaction)
          if (defenseVideo) {
            await showActionVideo(interaction, defenseVideo, true)
          }

          addPlayerPointContribution(univDef.player, 'team2')
          interactions.push({
            attacker: randomAttack,
            defender: univDef,
            result: 'blocked_by_universal_defense',
            attackingTeam: 'team1',
            defendingTeam: 'team2',
            pointChange: 0,
            hasDefenderVideo: !!defenseVideo
          })

          team1SideBlocked = true
          blockingDefenseTeam2 = univDef

          evalDiv.innerHTML = `
            <div class="defense-successful">
              <h3>🛡️ Úspěšná univerzální obrana!</h3>
              <p><strong>${getPlayerFirstNameOrNickname(univDef.player)}</strong> ubránil útok ${getPlayerFirstNameOrNickname(randomAttack.player)} univerzální obranou!</p>
              <p class="effect">${gameState.team1Name} už nemůže získat body z útoků ve této výměně!</p>
            </div>
          `
          await smartDelay(2000)

          processedAttacks.add(randomAttack)
          processedDefenses.add(univDef)
          break
        }
      }
    }
  }

  // KROK 1: Najít a vyhodnotit přímé blokace (obrana + odpovídající útok)
  // Kontrola team1 defenses vs team2 attacks
  for (const defense of team1Defenses) {
    // Najít útok z týmu 2, který tato obrana blokuje
    const matchingAttack = team2Attacks.find(attack => {
      // Použít getEffectiveDefenseSkill pro dynamické určení správné obrany
      const requiredDefense = getEffectiveDefenseSkill(
        attack.skill,
        attack.player.dominantFoot || 'right',
        defense.player.dominantFoot || 'right'
      )
      return requiredDefense === defense.skill && !processedAttacks.has(attack)
    })

    if (matchingAttack) {
      // NEJPRVE test úspěšnosti útoku (má přednost před blokací)
      const attackSuccessRate = calculateSkillSuccessRate(matchingAttack.player, matchingAttack.skill, gameState.nonsenseDebuffs.team2)
      const attackSuccess = Math.random() * 100 < attackSuccessRate

      if (!attackSuccess) {
        // Útok selhal při aktivaci - obrana se vůbec nevyhodnocuje
        trackPlayerPerformance(matchingAttack.player.id, false)

        // Komentář trenéra
        const coachComment = getCoachAttackComment(gameState.team2Coach, false)
        showCoachQuote('team2', coachComment)

        // Animace rozpadnutí ikony
        await shatterSkillIcon(matchingAttack)

        await showSkillComment(matchingAttack, attackSuccessRate, false, getFailedAttackMessage(matchingAttack, gameState.team1Name), 'offensive')

        // Přehrát video neúspěšné útočné dovednosti (pokud existuje)
        const failedVideo = getPlayerSkillVideo(matchingAttack.player.id, matchingAttack.skill, 'fail')
        if (failedVideo) {
          await showActionVideo({ attacker: matchingAttack, defender: null, result: 'failed' }, failedVideo, false, true)
        }

        team1Points += 1
        gameState.lastScoredAgainst = 'team2'  // Tým 2 inkasoval
        interactions.push({
          attacker: matchingAttack,
          defender: null,
          result: 'failed',
          attackingTeam: 'team2',
          defendingTeam: 'team1',
          pointChange: +1
        })
        processedAttacks.add(matchingAttack)

        // Zkontrolovat střídání
        const sub = await checkAndSubstituteAfterFailedAttacks(matchingAttack.player, 'team2')
        if (sub) {
          gameState.substitutedPlayers.push(sub.playerId)
          await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
        }

        continue
      }

      // Útok byl úspěšně aktivován, nyní kontrola blokace
      // Přehrát zvuk kontaktu s míčem pro úspěšně aktivovaný standardní útok
      soundManager.playBallHit()

      // KONTROLA: Pokud je aktivní obranná ultimate týmu 1, všechny útoky týmu 2 automaticky selhávají
      if (team1HasDefense) {
        trackPlayerPerformance(matchingAttack.player.id, false)

        const coachComment = getCoachAttackComment(gameState.team2Coach, false)
        showCoachQuote('team2', coachComment)

        // Zobrazit srážku útoku s obrannou ultimate
        await showSkillClash(matchingAttack, ultimateDefenseTeam1, 'blocked')

        // Přehrát zvuk úspěšně zablokovaného útoku
        soundManager.playDefenseBlock()

        await showSkillComment(matchingAttack, attackSuccessRate, true, `🛡️ Útok byl zablokován obrannou ultimate! ${gameState.team1Name}: +1 bod`, 'defensive')
        team1Points += 1
        gameState.lastScoredAgainst = 'team2'
        interactions.push({
          attacker: matchingAttack,
          defender: ultimateDefenseTeam1,
          result: 'blocked',
          hasDefenderVideo: true,
          attackingTeam: 'team2',
          defendingTeam: 'team1',
          pointChange: +1
        })
        processedAttacks.add(matchingAttack)

        const sub = await checkAndSubstituteAfterFailedAttacks(matchingAttack.player, 'team2')
        if (sub) {
          gameState.substitutedPlayers.push(sub.playerId)
          await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
        }

        continue
      }

      // Test úspěšnosti obrany
      let defenseSuccessful = true
      if (gameState.nonsenseDebuffs.team1) {
        const defenseSuccessRate = calculateSkillSuccessRate(defense.player, defense.skill, true)
        defenseSuccessful = Math.random() * 100 < defenseSuccessRate
      }

      if (!defenseSuccessful) {
        // Obrana selhala - útok úspěšný
        trackPlayerPerformance(matchingAttack.player.id, true)

        // Komentář trenéra na úspěšný útok
        const coachComment = getCoachAttackComment(gameState.team2Coach, true)
        showCoachQuote('team2', coachComment)

        // Animace rozpadnutí ikony obranné dovednosti
        await shatterSkillIcon(defense)

        await showSkillComment(matchingAttack, attackSuccessRate, true, `${defense.player.name} se pokusil bránit dovedností <strong>${skills[defense.skill].name}</strong>, ale kvůli debuffu selhal! ${gameState.team2Name}: +1 bod`, 'offensive')
        team2Points += 1
        gameState.lastScoredAgainst = 'team1'  // Tým 1 inkasoval

        // Přidat bod útočníkovi a případně pochválit
        addPlayerPointContribution(matchingAttack.player, 'team2')
        interactions.push({
          attacker: matchingAttack,
          defender: defense,
          result: 'defense_failed',
          attackingTeam: 'team2',
          defendingTeam: 'team1',
          pointChange: +1,
          hasDefenderVideo: false
        })
        await showSkillClash(matchingAttack, null, 'success')
        processedAttacks.add(matchingAttack)
        processedDefenses.add(defense)
        continue
      }

      // PŘÍMÁ BLOKACE - obrana blokuje útok
      trackPlayerPerformance(matchingAttack.player.id, false)

      // Komentář trenéra na zablokovaný útok
      const coachComment = getCoachAttackComment(gameState.team2Coach, false)
      showCoachQuote('team2', coachComment)

      await showSkillComment(matchingAttack, attackSuccessRate, true, `Útok byl úspěšně proveden, ale ${getPlayerFirstNameOrNickname(defense.player)} ho ubránil dovedností <strong>${skills[defense.skill].name}</strong>. Útok byl zablokován.`, 'defensive')

      // Přehrát zvuk úspěšně zablokovaného útoku
      soundManager.playDefenseBlock()

      // Přidat bod obránci za zablokování (i když tým nezískal bod, obránce zabránil bodům soupeře)
      addPlayerPointContribution(defense.player, 'team1')

      // Vytvořit interaction objekt pro kontrolu videa
      const interaction = {
        attacker: matchingAttack,
        defender: defense,
        result: 'blocked',
        attackingTeam: 'team2',
        defendingTeam: 'team1',
        pointChange: 0
      }

      const defenseVideo = getPlayerSkillVideo(defense.player.id, defense.skill, 'success', interaction)
      interaction.hasDefenderVideo = !!defenseVideo

      interactions.push(interaction)

      // VŽDY zobrazit animaci ikon
      await showSkillClash(matchingAttack, defense, 'blocked')

      // PAK přehrát video (pokud existuje)
      if (defenseVideo) {
        await showActionVideo(interaction, defenseVideo, true)
      }

      // Nastavit nepřímou blokaci pro tým 2
      team2SideBlocked = true
      blockingDefenseTeam1 = defense

      evalDiv.innerHTML = `
        <div class="defense-successful">
          <h3>🛡️ Úspěšná obrana!</h3>
          <p><strong>${getPlayerFirstNameOrNickname(defense.player)}</strong> ubránil útok ${getPlayerFirstNameOrNickname(matchingAttack.player)}!</p>
          <p class="effect">${gameState.team2Name} už nemůže získat body z útoků ve této výměně!</p>
        </div>
      `
      await smartDelay(2000)

      processedAttacks.add(matchingAttack)
      processedDefenses.add(defense)

      // Zkontrolovat střídání
      const sub = await checkAndSubstituteAfterFailedAttacks(matchingAttack.player, 'team2')
      if (sub) {
        gameState.substitutedPlayers.push(sub.playerId)
        await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
      }

      break  // Pouze jedna obrana může zablokovat
    }
  }

  // Kontrola team2 defenses vs team1 attacks
  for (const defense of team2Defenses) {
    const matchingAttack = team1Attacks.find(attack => {
      // Použít getEffectiveDefenseSkill pro dynamické určení správné obrany
      const requiredDefense = getEffectiveDefenseSkill(
        attack.skill,
        attack.player.dominantFoot || 'right',
        defense.player.dominantFoot || 'right'
      )
      return requiredDefense === defense.skill && !processedAttacks.has(attack)
    })

    if (matchingAttack) {
      // NEJPRVE test úspěšnosti útoku (má přednost před blokací)
      const attackSuccessRate = calculateSkillSuccessRate(matchingAttack.player, matchingAttack.skill, gameState.nonsenseDebuffs.team1)
      const attackSuccess = Math.random() * 100 < attackSuccessRate

      if (!attackSuccess) {
        // Útok selhal při aktivaci - obrana se vůbec nevyhodnocuje
        trackPlayerPerformance(matchingAttack.player.id, false)

        // Komentář trenéra
        const coachComment = getCoachAttackComment(gameState.team1Coach, false)
        showCoachQuote('team1', coachComment)

        // Animace rozpadnutí ikony
        await shatterSkillIcon(matchingAttack)

        await showSkillComment(matchingAttack, attackSuccessRate, false, getFailedAttackMessage(matchingAttack, gameState.team2Name), 'offensive')

        // Přehrát video neúspěšné útočné dovednosti (pokud existuje)
        const failedVideo = getPlayerSkillVideo(matchingAttack.player.id, matchingAttack.skill, 'fail')
        if (failedVideo) {
          await showActionVideo({ attacker: matchingAttack, defender: null, result: 'failed' }, failedVideo, false, true)
        }

        team2Points += 1
        gameState.lastScoredAgainst = 'team1'  // Tým 1 inkasoval
        interactions.push({
          attacker: matchingAttack,
          defender: null,
          result: 'failed',
          attackingTeam: 'team1',
          defendingTeam: 'team2',
          pointChange: +1
        })
        processedAttacks.add(matchingAttack)

        // Zkontrolovat střídání
        const sub = await checkAndSubstituteAfterFailedAttacks(matchingAttack.player, 'team1')
        if (sub) {
          gameState.substitutedPlayers.push(sub.playerId)
          await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
        }

        continue
      }

      // Útok byl úspěšně aktivován, nyní kontrola blokace
      // Přehrát zvuk kontaktu s míčem pro úspěšně aktivovaný standardní útok
      soundManager.playBallHit()

      // KONTROLA: Pokud je aktivní obranná ultimate týmu 2, všechny útoky týmu 1 automaticky selhávají
      if (team2HasDefense) {
        trackPlayerPerformance(matchingAttack.player.id, false)

        const coachComment = getCoachAttackComment(gameState.team1Coach, false)
        showCoachQuote('team1', coachComment)

        // Zobrazit srážku útoku s obrannou ultimate
        await showSkillClash(matchingAttack, ultimateDefenseTeam2, 'blocked')

        // Přehrát zvuk úspěšně zablokovaného útoku
        soundManager.playDefenseBlock()

        await showSkillComment(matchingAttack, attackSuccessRate, true, `🛡️ Útok byl zablokován obrannou ultimate! ${gameState.team2Name}: +1 bod`, 'defensive')
        team2Points += 1
        gameState.lastScoredAgainst = 'team1'
        interactions.push({
          attacker: matchingAttack,
          defender: ultimateDefenseTeam2,
          result: 'blocked',
          hasDefenderVideo: true,
          attackingTeam: 'team1',
          defendingTeam: 'team2',
          pointChange: +1
        })
        processedAttacks.add(matchingAttack)

        const sub = await checkAndSubstituteAfterFailedAttacks(matchingAttack.player, 'team1')
        if (sub) {
          gameState.substitutedPlayers.push(sub.playerId)
          await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
        }

        continue
      }

      let defenseSuccessful = true
      if (gameState.nonsenseDebuffs.team2) {
        const defenseSuccessRate = calculateSkillSuccessRate(defense.player, defense.skill, true)
        defenseSuccessful = Math.random() * 100 < defenseSuccessRate
      }

      if (!defenseSuccessful) {
        // Animace rozpadnutí ikony obranné dovednosti
        await shatterSkillIcon(defense)

        await showSkillComment(matchingAttack, attackSuccessRate, true, `${defense.player.name} se pokusil bránit dovedností <strong>${skills[defense.skill].name}</strong>, ale kvůli debuffu selhal! ${gameState.team1Name}: +1 bod`, 'offensive')
        team1Points += 1

        // Přidat bod útočníkovi a případně pochválit
        addPlayerPointContribution(matchingAttack.player, 'team1')
        interactions.push({
          attacker: matchingAttack,
          defender: defense,
          result: 'defense_failed',
          attackingTeam: 'team1',
          defendingTeam: 'team2',
          pointChange: +1,
          hasDefenderVideo: false
        })
        await showSkillClash(matchingAttack, null, 'success')
        processedAttacks.add(matchingAttack)
        processedDefenses.add(defense)
        continue
      }

      await showSkillComment(matchingAttack, attackSuccessRate, true, `Útok byl úspěšně proveden, ale ${getPlayerFirstNameOrNickname(defense.player)} ho ubránil dovedností <strong>${skills[defense.skill].name}</strong>. Útok byl zablokován.`, 'defensive')

      // Přehrát zvuk úspěšně zablokovaného útoku
      soundManager.playDefenseBlock()

      // Přidat bod obránci za zablokování (i když tým nezískal bod, obránce zabránil bodům soupeře)
      addPlayerPointContribution(defense.player, 'team2')

      // Vytvořit interaction objekt pro kontrolu videa
      const interaction = {
        attacker: matchingAttack,
        defender: defense,
        result: 'blocked',
        attackingTeam: 'team1',
        defendingTeam: 'team2',
        pointChange: 0
      }

      const defenseVideo = getPlayerSkillVideo(defense.player.id, defense.skill, 'success', interaction)
      interaction.hasDefenderVideo = !!defenseVideo

      interactions.push(interaction)

      // VŽDY zobrazit animaci ikon
      await showSkillClash(matchingAttack, defense, 'blocked')

      // PAK přehrát video (pokud existuje)
      if (defenseVideo) {
        await showActionVideo(interaction, defenseVideo, true)
      }

      team1SideBlocked = true
      blockingDefenseTeam2 = defense

      evalDiv.innerHTML = `
        <div class="defense-successful">
          <h3>🛡️ Úspěšná obrana!</h3>
          <p><strong>${getPlayerFirstNameOrNickname(defense.player)}</strong> ubránil útok ${getPlayerFirstNameOrNickname(matchingAttack.player)}!</p>
          <p class="effect">${gameState.team1Name} už nemůže získat body z útoků ve této výměně!</p>
        </div>
      `
      await smartDelay(2000)

      processedAttacks.add(matchingAttack)
      processedDefenses.add(defense)
      break
    }
  }

  // KROK 2: Nepřímá blokace - ostatní útoky na zablokované straně
  if (team1SideBlocked && blockingDefenseTeam2) {
    for (const attack of team1Attacks) {
      if (!processedAttacks.has(attack)) {
        const successRate = calculateSkillSuccessRate(attack.player, attack.skill, gameState.nonsenseDebuffs.team1)
        const isSuccess = Math.random() * 100 < successRate

        if (!isSuccess) {
          // Útok selhal při aktivaci
          trackPlayerPerformance(attack.player.id, false)

          const coachComment = getCoachAttackComment(gameState.team1Coach, false)
          showCoachQuote('team1', coachComment)

          // Animace rozpadnutí ikony
          await shatterSkillIcon(attack)

          await showSkillComment(attack, successRate, false, getFailedAttackMessage(attack, gameState.team2Name), 'offensive')

          // Přehrát video neúspěšné útočné dovednosti (pokud existuje)
          const failedVideo = getPlayerSkillVideo(attack.player.id, attack.skill, 'fail')
          if (failedVideo) {
            await showActionVideo({ attacker: attack, defender: null, result: 'failed' }, failedVideo, false, true)
          }

          team2Points += 1
          gameState.lastScoredAgainst = 'team1'
          interactions.push({
            attacker: attack,
            defender: null,
            result: 'failed',
            attackingTeam: 'team1',
            defendingTeam: 'team2',
            pointChange: +1
          })

          const sub = await checkAndSubstituteAfterFailedAttacks(attack.player, 'team1')
          if (sub) {
            gameState.substitutedPlayers.push(sub.playerId)
            await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
          }
        } else {
          // Nepřímá blokace - útok je zablokován obranou, která zablokovala jiný útok
          trackPlayerPerformance(attack.player.id, false)

          const coachComment = getCoachAttackComment(gameState.team1Coach, false)
          showCoachQuote('team1', coachComment)

          await showSkillComment(attack, successRate, true, `Útok byl úspěšný, ale je nepřímo zablokován obranou ${blockingDefenseTeam2.player.name}.`, 'defensive')
          interactions.push({
            attacker: attack,
            defender: blockingDefenseTeam2,
            result: 'indirect_block',
            attackingTeam: 'team1',
            defendingTeam: 'team2',
            pointChange: 0
          })
          await showSkillClash(attack, blockingDefenseTeam2, 'blocked')

          const sub = await checkAndSubstituteAfterFailedAttacks(attack.player, 'team1')
          if (sub) {
            gameState.substitutedPlayers.push(sub.playerId)
            await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
          }
        }
        processedAttacks.add(attack)
      }
    }
  }

  if (team2SideBlocked && blockingDefenseTeam1) {
    for (const attack of team2Attacks) {
      if (!processedAttacks.has(attack)) {
        const successRate = calculateSkillSuccessRate(attack.player, attack.skill, gameState.nonsenseDebuffs.team2)
        const isSuccess = Math.random() * 100 < successRate

        if (!isSuccess) {
          // Útok selhal při aktivaci
          trackPlayerPerformance(attack.player.id, false)

          const coachComment = getCoachAttackComment(gameState.team2Coach, false)
          showCoachQuote('team2', coachComment)

          // Animace rozpadnutí ikony
          await shatterSkillIcon(attack)

          await showSkillComment(attack, successRate, false, getFailedAttackMessage(attack, gameState.team1Name), 'offensive')

          // Přehrát video neúspěšné útočné dovednosti (pokud existuje)
          const failedVideo = getPlayerSkillVideo(attack.player.id, attack.skill, 'fail')
          if (failedVideo) {
            await showActionVideo({ attacker: attack, defender: null, result: 'failed' }, failedVideo, false, true)
          }

          team1Points += 1
          gameState.lastScoredAgainst = 'team2'
          interactions.push({
            attacker: attack,
            defender: null,
            result: 'failed',
            attackingTeam: 'team2',
            defendingTeam: 'team1',
            pointChange: +1
          })

          const sub = await checkAndSubstituteAfterFailedAttacks(attack.player, 'team2')
          if (sub) {
            gameState.substitutedPlayers.push(sub.playerId)
            await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
          }
        } else {
          // Nepřímá blokace - útok je zablokován obranou, která zablokovala jiný útok
          trackPlayerPerformance(attack.player.id, false)

          const coachComment = getCoachAttackComment(gameState.team2Coach, false)
          showCoachQuote('team2', coachComment)

          await showSkillComment(attack, successRate, true, `Útok byl úspěšný, ale je nepřímo zablokován obranou ${blockingDefenseTeam1.player.name}.`, 'defensive')
          interactions.push({
            attacker: attack,
            defender: blockingDefenseTeam1,
            result: 'indirect_block',
            attackingTeam: 'team2',
            defendingTeam: 'team1',
            pointChange: 0
          })
          await showSkillClash(attack, blockingDefenseTeam1, 'blocked')

          const sub = await checkAndSubstituteAfterFailedAttacks(attack.player, 'team2')
          if (sub) {
            gameState.substitutedPlayers.push(sub.playerId)
            await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
          }
        }
        processedAttacks.add(attack)
      }
    }
  }

  // KROK 3: Zbylé útoky bez obrany - STŘÍDAVĚ
  // Vytvořit pole útoků, které se vyhodnotí střídavě
  const unprocessedTeam1Attacks = team1Attacks.filter(a => !processedAttacks.has(a))
  const unprocessedTeam2Attacks = team2Attacks.filter(a => !processedAttacks.has(a))

  // Určit, který tým začíná (tým, který naposledy inkasoval)
  let alternatingAttacks = []
  let startWithTeam1 = gameState.lastScoredAgainst === 'team1' || gameState.lastScoredAgainst === null

  // Střídavě přidávat útoky
  const maxLen = Math.max(unprocessedTeam1Attacks.length, unprocessedTeam2Attacks.length)
  for (let i = 0; i < maxLen; i++) {
    if (startWithTeam1) {
      if (i < unprocessedTeam1Attacks.length) alternatingAttacks.push(unprocessedTeam1Attacks[i])
      if (i < unprocessedTeam2Attacks.length) alternatingAttacks.push(unprocessedTeam2Attacks[i])
    } else {
      if (i < unprocessedTeam2Attacks.length) alternatingAttacks.push(unprocessedTeam2Attacks[i])
      if (i < unprocessedTeam1Attacks.length) alternatingAttacks.push(unprocessedTeam1Attacks[i])
    }
  }

  for (const attack of alternatingAttacks) {
    const isTeam1 = team1Attacks.includes(attack)

    // NEJPRVE test úspěšnosti útoku (má přednost před blokací)
    const successRate = calculateSkillSuccessRate(attack.player, attack.skill, isTeam1 ? gameState.nonsenseDebuffs.team1 : gameState.nonsenseDebuffs.team2)
    const isSuccess = Math.random() * 100 < successRate

    if (!isSuccess) {
      // Útok selhal při aktivaci - obrana se vůbec nevyhodnocuje
      trackPlayerPerformance(attack.player.id, false)

      const coachComment = getCoachAttackComment(isTeam1 ? gameState.team1Coach : gameState.team2Coach, false)
      showCoachQuote(isTeam1 ? 'team1' : 'team2', coachComment)

      // Animace rozpadnutí ikony
      await shatterSkillIcon(attack)

      await showSkillComment(attack, successRate, false, getFailedAttackMessage(attack, isTeam1 ? gameState.team2Name : gameState.team1Name), 'offensive')

      // Přehrát video neúspěšné útočné dovednosti (pokud existuje)
      const failedVideo = getPlayerSkillVideo(attack.player.id, attack.skill, 'fail')
      if (failedVideo) {
        await showActionVideo({ attacker: attack, defender: null, result: 'failed' }, failedVideo, false, true)
      }

      if (isTeam1) {
        team2Points += 1
        gameState.lastScoredAgainst = 'team1'  // Tým 1 inkasoval
      } else {
        team1Points += 1
        gameState.lastScoredAgainst = 'team2'  // Tým 2 inkasoval
      }
      interactions.push({
        attacker: attack,
        defender: null,
        result: 'failed',
        attackingTeam: isTeam1 ? 'team1' : 'team2',
        defendingTeam: isTeam1 ? 'team2' : 'team1',
        pointChange: +1
      })
      processedAttacks.add(attack)

      const sub = await checkAndSubstituteAfterFailedAttacks(attack.player, isTeam1 ? 'team1' : 'team2')
      if (sub) {
        gameState.substitutedPlayers.push(sub.playerId)
        await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
      }

      continue
    }

    // Útok byl úspěšně aktivován, nyní kontrola blokace
    // Přehrát zvuk kontaktu s míčem pro úspěšně aktivovaný standardní útok
    soundManager.playBallHit()

    // KONTROLA: Pokud je aktivní obranná ultimate druhého týmu, útok automaticky selže
    if ((isTeam1 && team2HasDefense) || (!isTeam1 && team1HasDefense)) {
      trackPlayerPerformance(attack.player.id, false)

      const coachComment = getCoachAttackComment(isTeam1 ? gameState.team1Coach : gameState.team2Coach, false)
      showCoachQuote(isTeam1 ? 'team1' : 'team2', coachComment)

      // Zobrazit srážku útoku s obrannou ultimate
      const blockingDefense = isTeam1 ? ultimateDefenseTeam2 : ultimateDefenseTeam1
      await showSkillClash(attack, blockingDefense, 'blocked')

      await showSkillComment(attack, successRate, true, `🛡️ Útok byl zablokován obrannou ultimate! ${isTeam1 ? gameState.team2Name : gameState.team1Name}: +1 bod`, 'defensive')
      if (isTeam1) {
        team2Points += 1
        gameState.lastScoredAgainst = 'team1'
      } else {
        team1Points += 1
        gameState.lastScoredAgainst = 'team2'
      }
      interactions.push({
        attacker: attack,
        defender: blockingDefense,
        result: 'blocked',
        hasDefenderVideo: true,
        attackingTeam: isTeam1 ? 'team1' : 'team2',
        defendingTeam: isTeam1 ? 'team2' : 'team1',
        pointChange: +1
      })
      processedAttacks.add(attack)

      const sub = await checkAndSubstituteAfterFailedAttacks(attack.player, isTeam1 ? 'team1' : 'team2')
      if (sub) {
        gameState.substitutedPlayers.push(sub.playerId)
        await performSubstitution(sub.teamName, sub.playerOut, sub.playerIn)
      }

      continue
    }

    // Útok je úspěšný a není blokován
    {
      await showSkillComment(attack, successRate, true, `Útok byl úspěšný a nebyl ubráněn. ${isTeam1 ? gameState.team1Name : gameState.team2Name}: +1 bod`, 'offensive')
      if (isTeam1) {
        team1Points += 1
        gameState.lastScoredAgainst = 'team2'  // Tým 2 inkasoval

        // Přidat bod útočníkovi a případně pochválit
        addPlayerPointContribution(attack.player, 'team1')
      } else {
        team2Points += 1
        gameState.lastScoredAgainst = 'team1'  // Tým 1 inkasoval

        // Přidat bod útočníkovi a případně pochválit
        addPlayerPointContribution(attack.player, 'team2')
      }
      interactions.push({
        attacker: attack,
        defender: null,
        result: 'success',
        attackingTeam: isTeam1 ? 'team1' : 'team2',
        pointChange: +1,
        hasDefenderVideo: false
      })
      await showSkillClash(attack, null, 'success')
    }
    processedAttacks.add(attack)
  }

  // KROK 4: Obrany bez útoku - komentář trenéra "To si šel na párek?"
  for (const defense of [...team1Defenses, ...team2Defenses]) {
    if (!processedDefenses.has(defense)) {
      const isTeam1 = team1Defenses.includes(defense)
      const coachMood = isTeam1 ? gameState.team1CoachMood : gameState.team2CoachMood

      const coachQuote = `${getPlayerVocative(defense.player)}, to si šel na párek?`
      const team = isTeam1 ? 'team1' : 'team2'
      showCoachQuote(team, coachQuote)

      evalDiv.innerHTML = `
        <div class="unused-defense-info">
          <p class="explanation">Obranná schopnost <strong>${skills[defense.skill].name}</strong> nebyla využita - soupeř nezahrál odpovídající útok.</p>
        </div>
      `
      await smartDelay(2500)

      processedDefenses.add(defense)
    }
  }

  // FÁZE 3: Útoky už byly zablokované v FÁZI 1/2, takže už není třeba upravovat body

  // Zobrazit součet dílčích bodů
  evalDiv.innerHTML = `
    <div class="points-summary">
      <h3>Součet dílčích bodů:</h3>
      <div class="team-points">
        <div class="team-point-box">
          <h4>${gameState.team1Name}</h4>
          <div class="point-value ${team1Points > 0 ? 'positive' : team1Points < 0 ? 'negative' : 'neutral'}">${team1Points > 0 ? '+' : ''}${team1Points}</div>
        </div>
        <div class="team-point-box">
          <h4>${gameState.team2Name}</h4>
          <div class="point-value ${team2Points > 0 ? 'positive' : team2Points < 0 ? 'negative' : 'neutral'}">${team2Points > 0 ? '+' : ''}${team2Points}</div>
        </div>
      </div>
    </div>
  `
  await smartDelay(2000)

  // Finální komentář vysvětlující výsledek výměny
  let finalCommentary = ''
  if (team1Points === 0 && team2Points === 0) {
    // Stav 0:0
    finalCommentary = `
      <div class="skill-commentary modern">
        <div class="commentary-header" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 15px 20px; border-radius: 12px 12px 0 0; border-bottom: 3px solid rgba(255,255,255,0.3);">
          <h3 style="margin: 0; color: white; font-size: 1.4rem; font-weight: 600;">⚖️ Výsledek výměny: 0:0</h3>
        </div>
        <div class="commentary-body" style="background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <p style="margin: 0; font-size: 1.1rem; color: #4b5563; text-align: center;">Výměna pokračuje.</p>
        </div>
      </div>
    `
  } else if (team1Points === 1 && team2Points === 0) {
    // Stav 1:0 pro Tým 1
    finalCommentary = `
      <div class="skill-commentary modern">
        <div class="commentary-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 15px 20px; border-radius: 12px 12px 0 0; border-bottom: 3px solid rgba(255,255,255,0.3);">
          <h3 style="margin: 0; color: white; font-size: 1.4rem; font-weight: 600;">🏆 Výměna byla zakončena bodem pro ${gameState.team1Name}!</h3>
        </div>
        <div class="commentary-body" style="background: linear-gradient(to bottom, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <p style="margin: 0; font-size: 1.1rem; color: #065f46; text-align: center; font-weight: 600;">Zahajuji novou výměnu...</p>
        </div>
      </div>
    `
  } else if (team1Points === 0 && team2Points === 1) {
    // Stav 0:1 pro Tým 2
    finalCommentary = `
      <div class="skill-commentary modern">
        <div class="commentary-header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 15px 20px; border-radius: 12px 12px 0 0; border-bottom: 3px solid rgba(255,255,255,0.3);">
          <h3 style="margin: 0; color: white; font-size: 1.4rem; font-weight: 600;">🏆 Výměna byla zakončena bodem pro ${gameState.team2Name}!</h3>
        </div>
        <div class="commentary-body" style="background: linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <p style="margin: 0; font-size: 1.1rem; color: #1e40af; text-align: center; font-weight: 600;">Zahajuji novou výměnu...</p>
        </div>
      </div>
    `
  } else {
    // Více bodů během výměny
    finalCommentary = `
      <div class="skill-commentary modern">
        <div class="commentary-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 15px 20px; border-radius: 12px 12px 0 0; border-bottom: 3px solid rgba(255,255,255,0.3);">
          <h3 style="margin: 0; color: white; font-size: 1.4rem; font-weight: 600;">🎯 Během této fáze zápasu se podařilo:</h3>
        </div>
        <div class="commentary-body" style="background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="display: flex; gap: 20px; margin-bottom: 15px;">
            <div style="flex: 1; padding: 15px; background: #d1fae5; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 0.9rem;">👥 ${gameState.team1Name}</p>
              <p style="margin: 0; font-size: 1.3rem; font-weight: bold; color: #065f46;">${team1Points} ${team1Points === 1 ? 'bod' : team1Points < 5 ? 'body' : 'bodů'}</p>
            </div>
            <div style="flex: 1; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 0.9rem;">👥 ${gameState.team2Name}</p>
              <p style="margin: 0; font-size: 1.3rem; font-weight: bold; color: #1e40af;">${team2Points} ${team2Points === 1 ? 'bod' : team2Points < 5 ? 'body' : 'bodů'}</p>
            </div>
          </div>
          <div style="padding: 12px; background: #fef3c7; border-radius: 8px; text-align: center; border: 2px solid #f59e0b;">
            <p style="margin: 0; font-size: 1.2rem; font-weight: bold; color: #92400e;">Bilance: ${team1Points}:${team2Points}</p>
          </div>
        </div>
      </div>
    `
  }

  evalDiv.innerHTML = finalCommentary
  await smartDelay(3000)

  // Určit vítěze podle součtu dílčích bodů
  if (team1Points > team2Points) {
    // Speciální případ: Pokud oba měli 10+ z ultimate a pak se rozhodlo běžnými schopnostmi
    let finalTeam1Points = team1Points
    let finalTeam2Points = team2Points
    if (team1Points >= 10 && team2Points >= 10) {
      finalTeam1Points = 10
      finalTeam2Points = 9
    }

    return {
      winner: 'team1',
      reason: `${gameState.team1Name} získal výměnu (${finalTeam1Points}:${finalTeam2Points})`,
      team1Points: finalTeam1Points,
      team2Points: finalTeam2Points,
      interactions
    }
  } else if (team2Points > team1Points) {
    // Speciální případ: Pokud oba měli 10+ z ultimate a pak se rozhodlo běžnými schopnostmi
    let finalTeam1Points = team1Points
    let finalTeam2Points = team2Points
    if (team1Points >= 10 && team2Points >= 10) {
      finalTeam1Points = 9
      finalTeam2Points = 10
    }

    return {
      winner: 'team2',
      reason: `${gameState.team2Name} získal výměnu (${finalTeam1Points}:${finalTeam2Points})`,
      team1Points: finalTeam1Points,
      team2Points: finalTeam2Points,
      interactions
    }
  } else {
    // Remíza - pokud oba týmy mají 0 bodů, výměna pokračuje
    // Pokud mají stejné nenulové body (např. 2:2), body se připíší a začne nová výměna
    if (team1Points === 0 && team2Points === 0) {
      return {
        winner: null,
        reason: `Výměna pokračuje`,
        team1Points,
        team2Points,
        interactions
      }
    } else if (team1Points >= 10 && team2Points >= 10 && team1Points === team2Points) {
      // Speciální případ: Po vyhodnocení všech schopností stále stejný počet 10+
      // Vrátit 9:9 a pokračovat další výměnou
      return {
        winner: 'draw',
        reason: `Stejný počet bodů ${team1Points}:${team2Points} - výsledek 9:9, další výměna`,
        team1Points: 9,
        team2Points: 9,
        interactions
      }
    } else {
      // Stejný počet nenulových bodů - připsat body a pokračovat novou výměnou
      return {
        winner: 'draw',  // Speciální hodnota pro remízu s body
        reason: `Stejný počet bodů ${team1Points}:${team2Points} - body se připočítají`,
        team1Points,
        team2Points,
        interactions
      }
    }
  }
}

function evaluatePoint(team1Skills, team2Skills) {
  const interactions = []

  // KONTROLA ULTIMÁTNÍCH SCHOPNOSTÍ (mají vždy přednost)
  const team1OffensiveUltimate = team1Skills.find(s => s.isOffensive && s.isUltimate)
  const team2OffensiveUltimate = team2Skills.find(s => s.isOffensive && s.isUltimate)
  const team1DefensiveUltimate = team1Skills.find(s => s.isDefensive && s.isUltimate)
  const team2DefensiveUltimate = team2Skills.find(s => s.isDefensive && s.isUltimate)

  // Pokud má nějaký tým obrannou ultimate, zabrání všem útokům (i ultimate útočným)
  if (team1DefensiveUltimate || team2DefensiveUltimate) {
    // Pokud má obě týmy obranné ultimate, nebo jedna strana má obrannou a druhá útočnou ultimate
    if (team1OffensiveUltimate && team2DefensiveUltimate) {
      interactions.push({
        attacker: team1OffensiveUltimate,
        defender: team2DefensiveUltimate,
        result: 'blocked',
        attackingTeam: 'team1'
      })
      return {
        winner: null,
        reason: 'Útočná ultimate zablokována obrannou ultimate - výměna pokračuje!',
        interactions
      }
    }

    if (team2OffensiveUltimate && team1DefensiveUltimate) {
      interactions.push({
        attacker: team2OffensiveUltimate,
        defender: team1DefensiveUltimate,
        result: 'blocked',
        attackingTeam: 'team2'
      })
      return {
        winner: null,
        reason: 'Útočná ultimate zablokována obrannou ultimate - výměna pokračuje!',
        interactions
      }
    }

    // Obranná ultimate blokuje všechny běžné útoky - výměna pokračuje
    if (team1DefensiveUltimate && !team2OffensiveUltimate) {
      return {
        winner: null,
        reason: 'Obranná ultimate zastavila všechny útoky - výměna pokračuje!',
        interactions
      }
    }

    if (team2DefensiveUltimate && !team1OffensiveUltimate) {
      return {
        winner: null,
        reason: 'Obranná ultimate zastavila všechny útoky - výměna pokračuje!',
        interactions
      }
    }
  }

  // Pokud má jeden tým útočnou ultimate a druhý nemá obrannou ultimate = bod
  if (team1OffensiveUltimate && !team2DefensiveUltimate) {
    interactions.push({
      attacker: team1OffensiveUltimate,
      defender: null,
      result: 'success',
      attackingTeam: 'team1'
    })
    return {
      winner: 'team1',
      reason: `${gameState.team1Name} dal bod útočnou ultimate!`,
      interactions
    }
  }

  if (team2OffensiveUltimate && !team1DefensiveUltimate) {
    interactions.push({
      attacker: team2OffensiveUltimate,
      defender: null,
      result: 'success',
      attackingTeam: 'team2'
    })
    return {
      winner: 'team2',
      reason: `${gameState.team2Name} dal bod útočnou ultimate!`,
      interactions
    }
  }

  // BĚŽNÁ HRA (žádná ultimate nebo pouze obranné ultimate)
  // Určit kdo začíná (náhodně)
  let attackingTeam = Math.random() < 0.5 ? 'team1' : 'team2'
  let attackingSkills = attackingTeam === 'team1' ? team1Skills : team2Skills
  let defendingSkills = attackingTeam === 'team1' ? team2Skills : team1Skills

  let rallyContinues = true
  let maxRallies = 10 // Ochrana před nekonečnou smyčkou
  let rallyCount = 0

  while (rallyContinues && rallyCount < maxRallies) {
    rallyCount++

    // Získat útočné schopnosti útočícího týmu
    const offensiveAttacks = attackingSkills.filter(s => s.isOffensive && !s.isUltimate)

    // Získat obrannou schopnost bránícího týmu
    const defensiveSkill = defendingSkills.find(s => s.isDefensive)

    // Vyhodnotit běžné útoky
    let attackBlocked = false

    for (const attack of offensiveAttacks) {
      const effect = skills[attack.skill].effect
      if (!effect) continue

      // Zkontrolovat zda obrana odpovídá
      if (effect.includes('pokud není v týmu soupeře aktivovaná schopnost')) {
        const requiredSkill = extractRequiredSkill(effect)

        if (defensiveSkill && skills[defensiveSkill.skill].name === requiredSkill) {
          // Obrana zablokovala tento útok - úspěšná obrana!
          const defendingTeam = attackingTeam === 'team1' ? 'team2' : 'team1'
          interactions.push({
            attacker: attack,
            defender: defensiveSkill,
            result: 'blocked',
            attackingTeam: attackingTeam,
            successfulDefense: true,
            defendingTeam: defendingTeam
          })
          attackBlocked = true
          break // Jakmile je jeden útok zablokován, bránící tým zachytil míč
        }
      } else if (effect.includes('pokud padne panna')) {
        if (Math.random() < 0.5) {
          // Útok úspěšný
          interactions.push({
            attacker: attack,
            defender: null,
            result: 'success',
            attackingTeam: attackingTeam
          })
          rallyContinues = false
          return {
            winner: attackingTeam,
            reason: `${attackingTeam === 'team1' ? gameState.team1Name : gameState.team2Name} dal bod!`,
            interactions
          }
        }
      } else if (effect.includes('Hoď dvěma mincemi')) {
        const heads = (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.5 ? 1 : 0)
        if (heads === 2) {
          // Bod pro útočící tým
          interactions.push({
            attacker: attack,
            defender: null,
            result: 'success',
            attackingTeam: attackingTeam
          })
          rallyContinues = false
          return {
            winner: attackingTeam,
            reason: `${attackingTeam === 'team1' ? gameState.team1Name : gameState.team2Name} dal bod (smečovaný servis - 2 panny)!`,
            interactions
          }
        } else if (heads === 0) {
          // Bod pro bránící tým
          const defendingTeam = attackingTeam === 'team1' ? 'team2' : 'team1'
          interactions.push({
            attacker: attack,
            defender: null,
            result: 'failed',
            attackingTeam: attackingTeam
          })
          rallyContinues = false
          return {
            winner: defendingTeam,
            reason: `${defendingTeam === 'team1' ? gameState.team1Name : gameState.team2Name} dal bod (smečovaný servis soupeře - 0 panny)!`,
            interactions
          }
        }
        // heads === 1: pokračuje hra
      }
    }

    if (attackBlocked) {
      // Bránící tým zachytil míč, teď útočí on
      const temp = attackingTeam
      attackingTeam = attackingTeam === 'team1' ? 'team2' : 'team1'
      attackingSkills = attackingTeam === 'team1' ? team1Skills : team2Skills
      defendingSkills = temp === 'team1' ? team1Skills : team2Skills
      continue
    }

    // Pokud žádný útok nebyl zablokován a žádný nebyl úspěšný, útočící tým dal bod
    const successfulAttack = offensiveAttacks.find(a => !a.isUltimate)
    if (successfulAttack) {
      interactions.push({
        attacker: successfulAttack,
        defender: null,
        result: 'success',
        attackingTeam: attackingTeam
      })
      rallyContinues = false
      return {
        winner: attackingTeam,
        reason: `${attackingTeam === 'team1' ? gameState.team1Name : gameState.team2Name} dal bod!`,
        interactions
      }
    }

    break
  }

  // Fallback - výměna pokračuje
  return {
    winner: null,
    reason: 'Výměna pokračuje!',
    interactions
  }
}

function extractRequiredSkill(effect) {
  const match = effect.match(/schopnost (.+)$/)
  return match ? match[1] : ''
}

async function showPointResult(result) {
  const resultDiv = document.getElementById('point-result')

  // Zobrazit interakce (útok -> obrana)
  if (result.interactions && result.interactions.length > 0) {
    for (const interaction of result.interactions) {
      const interactionHTML = `
        <div class="skill-interaction">
          <div class="interaction-step">
            <div class="interaction-player">
              <img src="${interaction.attacker.player.photo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2230%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${interaction.attacker.player.number}%3C/text%3E%3C/svg%3E'" />
              <p>${interaction.attacker.player.name}</p>
              <strong class="attack-skill">⚔️ ${skills[interaction.attacker.skill].name}</strong>
            </div>
            ${interaction.defender ? `
              <div class="interaction-arrow">${interaction.result === 'blocked' ? `🛡️ ${getRandomBlockedText(interaction.defender.skill)}!` : '→'}</div>
              <div class="interaction-player">
                <img src="${interaction.defender.player.photo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2230%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${interaction.defender.player.number}%3C/text%3E%3C/svg%3E'" />
                <p>${interaction.defender.player.name}</p>
                <strong class="defense-skill">🛡️ ${skills[interaction.defender.skill].name}</strong>
              </div>
            ` : `
              <div class="interaction-arrow">✅ ÚSPĚCH!</div>
            `}
          </div>
        </div>
      `

      resultDiv.innerHTML = interactionHTML
      await smartDelay(1500)
    }
  }

  // Zobrazit konečný výsledek
  if (result.winner) {
    resultDiv.innerHTML = `
      <div class="point-winner">
        <h2>${result.winner === 'team1' ? `BOD PRO ${gameState.team1Name.toUpperCase()}!` : `BOD PRO ${gameState.team2Name.toUpperCase()}!`}</h2>
        <p>${result.reason}</p>
      </div>
    `
  } else {
    resultDiv.innerHTML = `
      <div class="point-draw">
        <h2>🔄 VÝMĚNA POKRAČUJE!</h2>
        <p>${result.reason}</p>
      </div>
    `
  }

  await smartDelay(2000)
}

// Funkce pro aktualizaci jednoduchého skóre displeje
function updateSimpleScoreboard() {
  const currentSet = gameState.currentSet

  // Aktuální stav míčů v setu
  const ballsScore = `${gameState.ballsWon?.team1 || 0} : ${gameState.ballsWon?.team2 || 0}`
  const ballsEl = document.getElementById('balls-score')
  if (ballsEl) {
    ballsEl.textContent = ballsScore
  }

  // Aktuální set skóre
  const currentSetScore = `${gameState.score.team1[currentSet]} : ${gameState.score.team2[currentSet]}`
  const currentSetEl = document.getElementById('current-set-score')
  if (currentSetEl) {
    currentSetEl.textContent = currentSetScore
  }

  // Spočítat vítězné sety
  let team1SetsWon = 0
  let team2SetsWon = 0

  // První dva sety - vítěz má 10+ bodů
  for (let i = 0; i < 2; i++) {
    if (gameState.score.team1[i] >= 10 && gameState.score.team1[i] > gameState.score.team2[i]) {
      team1SetsWon++
    } else if (gameState.score.team2[i] >= 10 && gameState.score.team2[i] > gameState.score.team1[i]) {
      team2SetsWon++
    }
  }

  // Třetí set - vítěz má více než 5 bodů
  if (currentSet >= 2) {
    if (gameState.score.team1[2] > 5 && gameState.score.team1[2] > gameState.score.team2[2]) {
      team1SetsWon++
    } else if (gameState.score.team2[2] > 5 && gameState.score.team2[2] > gameState.score.team1[2]) {
      team2SetsWon++
    }
  }

  // Sety skóre
  const setsScore = `${team1SetsWon} : ${team2SetsWon}`
  const setsScoreEl = document.getElementById('sets-score')
  if (setsScoreEl) {
    setsScoreEl.textContent = setsScore
  }
}

async function updateScore(mode, team1PointsToAdd = 0, team2PointsToAdd = 0) {
  const set = gameState.currentSet

  // Přičíst body oběma týmům
  const newT1Score = gameState.score.team1[set] + team1PointsToAdd
  const newT2Score = gameState.score.team2[set] + team2PointsToAdd

  // Kontrola pravidla 10:10 - nesmí nastat, max 10:9 nebo 9:10
  if (newT1Score === 10 && newT2Score === 10) {
    // Speciální případ - nesmí být 10:10, výměna musí pokračovat
    // Neaktualizujeme skóre, zápas musí pokračovat

    const evalDiv = getEvaluationDiv()
    evalDiv.innerHTML = `
      <div class="skill-commentary modern special-rule">
        <div class="commentary-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 15px 20px; border-radius: 12px 12px 0 0; border-bottom: 3px solid rgba(255,255,255,0.3); box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);">
          <h3 style="margin: 0; color: white; font-size: 1.5rem; font-weight: 700; text-align: center;">⚠️ SPECIÁLNÍ PRAVIDLO ⚠️</h3>
        </div>
        <div class="commentary-body" style="background: linear-gradient(to bottom, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #f59e0b;">
          <div style="text-align: center; margin-bottom: 15px;">
            <p style="margin: 0 0 12px 0; font-size: 1.3rem; font-weight: bold; color: #92400e;">Skóre nemůže skončit 10:10!</p>
            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 5px solid #ef4444;">
              <p style="margin: 0; font-size: 1.1rem; color: #7c2d12; font-weight: 600;">Výměna pokračuje, dokud jeden tým nevyhraje 10:9.</p>
            </div>
          </div>
        </div>
      </div>
    `

    // Vrátit false = výměna musí pokračovat
    return false
  }

  // Pokud oba týmy mají >= 10, rozhodnout podle celkového počtu bodů
  if (newT1Score >= 10 && newT2Score >= 10) {
    // Vítězem je tým s větším celkovým počtem bodů
    if (newT1Score > newT2Score) {
      gameState.score.team1[set] = 10
      gameState.score.team2[set] = 9
    } else if (newT2Score > newT1Score) {
      gameState.score.team2[set] = 10
      gameState.score.team1[set] = 9
    } else {
      // Stejný počet bodů >= 10 - toto by nemělo nastat díky kontrole výše
      gameState.score.team1[set] = Math.min(newT1Score, 10)
      gameState.score.team2[set] = Math.min(newT2Score, 10)
    }
  } else if (newT1Score >= 10) {
    // Pouze tým 1 dosáhl 10+, automaticky vítězí
    gameState.score.team1[set] = 10
    gameState.score.team2[set] = Math.min(newT2Score, 9)
  } else if (newT2Score >= 10) {
    // Pouze tým 2 dosáhl 10+, automaticky vítězí
    gameState.score.team2[set] = 10
    gameState.score.team1[set] = Math.min(newT1Score, 9)
  } else {
    // Normální přičítání, max 10
    gameState.score.team1[set] = Math.min(newT1Score, 10)
    gameState.score.team2[set] = Math.min(newT2Score, 10)
  }

  // Update display - staré elementy
  document.getElementById(`t1-s${set + 1}`).textContent = gameState.score.team1[set]
  document.getElementById(`t2-s${set + 1}`).textContent = gameState.score.team2[set]

  // Update simple scoreboard
  updateSimpleScoreboard()

  // Zkontrolovat, jestli soupeř dosáhl 9 bodů a zobrazit povzbuzení trenéra
  const t1Score = gameState.score.team1[set]
  const t2Score = gameState.score.team2[set]

  if (t1Score === 9 && t2Score > t1Score) {
    const coach = players.find(p => p.position === 'Trenér')
    if (coach && coach.coachQuotes && coach.coachQuotes.encouragement) {
      const quotes = coach.coachQuotes.encouragement
      const quote = quotes[Math.floor(Math.random() * quotes.length)]
      const evalDiv = getEvaluationDiv()
      evalDiv.innerHTML += `
        <div class="coach-encouragement" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; margin: 15px 0; border-radius: 12px; text-align: center; border: 3px solid #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
          <p style="font-size: 1.3rem; margin: 0; color: white; font-weight: bold;">💪 ${coach.name}: "${quote}"</p>
        </div>
      `
    }
  } else if (t2Score === 9 && t1Score > t2Score) {
    const coach = players.find(p => p.position === 'Trenér')
    if (coach && coach.coachQuotes && coach.coachQuotes.encouragement) {
      const quotes = coach.coachQuotes.encouragement
      const quote = quotes[Math.floor(Math.random() * quotes.length)]
      const evalDiv = getEvaluationDiv()
      evalDiv.innerHTML += `
        <div class="coach-encouragement" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; margin: 15px 0; border-radius: 12px; text-align: center; border: 3px solid #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
          <p style="font-size: 1.3rem; margin: 0; color: white; font-weight: bold;">💪 ${coach.name}: "${quote}"</p>
        </div>
      `
    }
  }

  // Zkontrolovat konec setu
  if (set < 2) {
    // První dva sety do 10 (ale ne 10:10)
    if ((t1Score === 10 && t2Score < 10) || (t2Score === 10 && t1Score < 10)) {
      await endSet()
    }
  } else {
    // Třetí set do 10 (ale ne 10:10)
    if ((t1Score === 10 && t2Score < 10) || (t2Score === 10 && t1Score < 10)) {
      await endSet()
    }
  }

  return true // Skóre bylo úspěšně aktualizováno
}

async function endSet() {
  const currentSet = gameState.currentSet

  // Zkontrolovat rovnost bodů - pokud ano, rozhodují úspěšné obrany
  const t1Score = gameState.score.team1[currentSet]
  const t2Score = gameState.score.team2[currentSet]

  if (t1Score === t2Score) {
    if (gameState.successfulDefenses.team1[currentSet] > gameState.successfulDefenses.team2[currentSet]) {
      gameState.score.team1[currentSet]++
    } else if (gameState.successfulDefenses.team2[currentSet] > gameState.successfulDefenses.team1[currentSet]) {
      gameState.score.team2[currentSet]++
    }
  }

  // Spočítat vítěze POUZE dokončených setů
  let t1CompletedSetWins = 0
  let t2CompletedSetWins = 0

  // První dva sety - dokončené když někdo má 10+ bodů
  for (let i = 0; i < 2; i++) {
    if (gameState.score.team1[i] >= 10 && gameState.score.team1[i] !== gameState.score.team2[i]) {
      t1CompletedSetWins++
    } else if (gameState.score.team2[i] >= 10 && gameState.score.team2[i] !== gameState.score.team1[i]) {
      t2CompletedSetWins++
    }
  }

  // Třetí set - dokončený když někdo má 10+ bodů
  if (gameState.score.team1[2] >= 10 && gameState.score.team1[2] !== gameState.score.team2[2]) {
    t1CompletedSetWins++
  } else if (gameState.score.team2[2] >= 10 && gameState.score.team2[2] !== gameState.score.team1[2]) {
    t2CompletedSetWins++
  }

  // Determine set winner and update coach mood
  const setWinner = gameState.score.team1[currentSet] > gameState.score.team2[currentSet] ? 'team1' : 'team2'
  const setLoser = setWinner === 'team1' ? 'team2' : 'team1'

  updateCoachMood(setWinner, true)
  updateCoachMood(setLoser, false)

  console.log('🏁 endSet() - Kontrola vítězů setů:', t1CompletedSetWins, ':', t2CompletedSetWins)

  // Zkontrolovat, zda bylo dosaženo cíle skipTarget
  if (gameState.skipTarget === 'endOfSet' && gameState.skipTargetSet === currentSet) {
    // Dosáhli jsme konce cílového setu - přepnout na normální rychlost a pokračovat
    gameState.skipToEnd = false
    gameState.skipTarget = null
    gameState.skipTargetSet = null
    gameState.speedMultiplier = 1
    const evalDiv = getEvaluationDiv()
    evalDiv.innerHTML = `<h3>✅ Konec ${currentSet + 1}. setu dosažen - pokračuji dál</h3>`
    // Nepřerušujeme hru - zápas pokračuje normální rychlostí
  }

  // Konec zápasu pokud někdo vyhrál 2 sety
  if (t1CompletedSetWins === 2 || t2CompletedSetWins === 2) {
    console.log('🏆 Někdo vyhrál 2 sety, volám endGame()')

    // Zkontrolovat, zda bylo dosaženo cíle skipTarget
    if (gameState.skipTarget === 'endOfMatch') {
      // Dosáhli jsme konce dílčího zápasu - přepnout na normální rychlost a pokračovat
      gameState.skipToEnd = false
      gameState.skipTarget = null
      gameState.speedMultiplier = 1
      const evalDiv = getEvaluationDiv()
      evalDiv.innerHTML = `<h3>✅ Konec dílčího zápasu dosažen - pokračuji dál</h3>`
      // Nepřerušujeme hru - ligový zápas pokračuje normální rychlostí
    }

    endGame()
  } else {
    console.log('➡️ Pokračujeme dalším setem, currentSet:', gameState.currentSet)
    // Pokud nikdo nevyhrál 2 sety, přejít na další set (pokud ještě nejsme ve třetím)
    if (gameState.currentSet < 2) {
      // Pokud není skipToEnd, zobrazit zprávu o konci setu
      if (!gameState.skipToEnd) {
        // Výrazná zpráva o konci setu
        const evalDiv = getEvaluationDiv()
        const setScore = `${gameState.score.team1[currentSet]}:${gameState.score.team2[currentSet]}`
        const winnerName = setWinner === 'team1' ? gameState.team1Name : gameState.team2Name

        evalDiv.innerHTML = `
          <div class="set-end-announcement" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; margin: 20px 0; border-radius: 15px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="font-size: 2rem; margin: 0 0 15px 0;">🏆 KONEC ${currentSet + 1}. SETU 🏆</h2>
            <p style="font-size: 1.5rem; margin: 10px 0;"><strong>${winnerName}</strong> vyhrává set <strong>${setScore}</strong></p>
            <p style="font-size: 1.2rem; margin: 15px 0;">Aktuální stav zápasu: <strong>${t1CompletedSetWins}:${t2CompletedSetWins}</strong></p>
            <p style="font-size: 1.1rem; margin-top: 20px; opacity: 0.9;">⏳ Za chvíli začíná ${currentSet + 2}. set...</p>
          </div>
        `

        // Počkat 4 sekundy, aby hráč viděl oznámení o konci setu
        await smartDelay(4000)
      }

      // Přejít na další set
      gameState.currentSet++

      // NEMAZAT historii - pokračuje přes všechny sety
      // Historie se vymaže jen při restartu celého zápasu

      // Reset hlášek trenérů na začátku nového setu
      const team1Quote = getRandomStartQuote(gameState.team1Name, gameState.team2Name)
      const team2Quote = getRandomStartQuote(gameState.team2Name, gameState.team1Name)
      showCoachQuote('team1', team1Quote)
      showCoachQuote('team2', team2Quote)

      if (gameState.currentSet === 2) {
        // Třetí set začíná od 0:0 a končí na 10
        gameState.score.team1[2] = 0
        gameState.score.team2[2] = 0
        gameState.successfulDefenses.team1[2] = 0
        gameState.successfulDefenses.team2[2] = 0
        document.getElementById('t1-s3').textContent = 0
        document.getElementById('t2-s3').textContent = 0
      }

      // Aktualizovat skóre displej
      updateSimpleScoreboard()

      console.log('🎮 Nový set začíná, currentSet:', gameState.currentSet, 'isPlaying:', gameState.isPlaying)
    }
  }
}

function checkGameEnd() {
  // Počítáme pouze dokončené sety (do 10 bodů v 1. a 2. setu, do 10 bodů ve 3. setu)
  let t1CompletedSetWins = 0
  let t2CompletedSetWins = 0

  // První dva sety - dokončené když někdo má 10 bodů
  for (let i = 0; i < 2; i++) {
    if (gameState.score.team1[i] >= 10) {
      t1CompletedSetWins++
    } else if (gameState.score.team2[i] >= 10) {
      t2CompletedSetWins++
    }
  }

  // Třetí set - dokončený když někdo má 10 bodů
  if (gameState.currentSet === 2) {
    if (gameState.score.team1[2] >= 10) {
      t1CompletedSetWins++
    } else if (gameState.score.team2[2] >= 10) {
      t2CompletedSetWins++
    }
  }

  // Konec zápasu pouze když někdo vyhrál 2 sety
  if (t1CompletedSetWins === 2 || t2CompletedSetWins === 2) {
    endGame()
  }
}

// Funkce pro aktualizaci UI skóre dílčích zápasů
function updateMatchesScore() {
  const matchesScoreEl = document.getElementById('matches-score')
  const currentMatchInfo = document.getElementById('current-match-info')

  // Aktualizovat skóre dílčích zápasů (pouze v ligovém režimu)
  if (matchesScoreEl && gameState.gameMode === 'league') {
    matchesScoreEl.textContent = `${gameState.matchesScore.team1} : ${gameState.matchesScore.team2}`
  }

  // Určit a zobrazit název aktuální disciplíny
  if (currentMatchInfo) {
    let matchLabel = ''

    if (gameState.gameMode === 'league') {
      // V ligovém režimu: použít pevně daný rozvrh podle oficiálních pravidel
      if (gameState.currentMatch < gameState.matchSchedule.length) {
        const match = gameState.matchSchedule[gameState.currentMatch]

        if (match.type === 'dvojice1') {
          matchLabel = '1. dvojice vs. 1. dvojice'
        } else if (match.type === 'dvojice2') {
          matchLabel = '2. dvojice (mezinárodní) vs. 2. dvojice (mezinárodní)'
        } else if (match.type === 'dvojice3') {
          matchLabel = '3. dvojice vs. 3. dvojice'
        } else if (match.type === 'dvojice') {
          matchLabel = 'Dvojice (2 vs. 2)'
        } else if (match.type === 'trojice1') {
          matchLabel = '1. trojice vs. 1. trojice'
        } else if (match.type === 'trojice2') {
          matchLabel = '2. trojice (mezinárodní) vs. 2. trojice (mezinárodní)'
        } else if (match.type === 'singl') {
          matchLabel = 'Singl (1 vs. 1)'
        } else if (match.type === 'trojice1-vs-2') {
          matchLabel = '1. trojice domácích vs. 2. trojice hostů'
        } else if (match.type === 'trojice2-vs-1') {
          matchLabel = '2. trojice domácích vs. 1. trojice hostů'
        }
      }
    } else {
      // V tréninkovém režimu: určit podle režimu hry (gameState.mode)
      const playersPerTeam = parseInt(gameState.mode[0])

      if (playersPerTeam === 1) {
        matchLabel = 'Singl (1 vs. 1)'
      } else if (playersPerTeam === 2) {
        matchLabel = 'Dvojice (2 vs. 2)'
      } else if (playersPerTeam === 3) {
        matchLabel = 'Trojice (3 vs. 3)'
      } else {
        // Nestandardní počet hráčů
        matchLabel = `${playersPerTeam} vs. ${playersPerTeam}`
      }
    }

    currentMatchInfo.innerHTML = `<strong>${matchLabel}</strong>`
  }
}

// Funkce pro reset stavu mezi dílčími zápasy
function resetMatchState() {
  // Reset skóre setů
  gameState.score = { team1: [0, 0, 0], team2: [0, 0, 0] }
  gameState.successfulDefenses = { team1: [0, 0, 0], team2: [0, 0, 0] }
  gameState.currentSet = 0
  gameState.pointsPlayed = 0

  // Vymazat historii akcí a výměn při startu nového dílčího zápasu
  getEvaluationDiv().clear()
  gameState.rallyHistory = []
  gameState.currentRallyIndex = -1

  // Reset UI
  for (let i = 1; i <= 3; i++) {
    const t1El = document.getElementById(`t1-s${i}`)
    const t2El = document.getElementById(`t2-s${i}`)
    if (t1El) t1El.textContent = i === 3 ? '5' : '0'
    if (t2El) t2El.textContent = i === 3 ? '5' : '0'
  }

  // Reset střídání
  gameState.team1SubstitutionsThisSet = 0
  gameState.team2SubstitutionsThisSet = 0
  gameState.substitutedPlayers = []
  gameState.playerPerformance = {}

  // Vyčistit debuff z nesmyslu (platí jen pro jeden dílčí zápas)
  if (gameState.nonsenseDebuffedPlayers) {
    gameState.nonsenseDebuffedPlayers.clear()
  }

  // NERESTARTOVAT náladu trenéra - přenáší se mezi dílčími zápasy
}

// Funkce pro zobrazení výběru sestavy před dalším zápasem
function showLineupSelectionBeforeMatch() {
  // Skrýt kurt a zobrazit výběr sestavy
  document.querySelector('.game-court').style.display = 'none'

  // Vyvolat event, který Simulation.js zachytí
  const event = new CustomEvent('showLineupSelection', {
    detail: {
      matchIndex: gameState.currentMatch
    }
  })
  window.dispatchEvent(event)
}

// Funkce pro spuštění dalšího dílčího zápasu
async function startNextLeagueMatch() {
  if (gameState.currentMatch >= gameState.matchSchedule.length) {
    showLeagueFinalResult()
    return
  }

  const match = gameState.matchSchedule[gameState.currentMatch]

  // Info o novém zápasu
  const coachBubble = document.getElementById('coach-bubble')
  if (coachBubble) {
    coachBubble.innerHTML = `<p>Začíná ${match.label}! Aktuální stav: ${gameState.matchesScore.team1}:${gameState.matchesScore.team2}</p>`
  }

  // Aktualizovat info o aktuálním zápasu
  updateMatchesScore()

  // Spustit automatické přehrávání
  await sleep(2000)
  gameState.isPlaying = true
  gameState.isPaused = false
  startAutoMatch()
}

// Funkce pro zobrazení finálního výsledku ligy
function showLeagueFinalResult() {
  gameState.isPlaying = false
  gameState.isPaused = false

  // Zastavit pozadové crowd sounds
  soundManager.stopCrowdSounds()

  document.querySelector('.game-court').style.display = 'none'
  document.querySelector('.game-over').style.display = 'block'

  const finalScore = document.getElementById('final-score')
  const t1Score = gameState.matchesScore.team1
  const t2Score = gameState.matchesScore.team2

  let resultText = ''
  if (t1Score === 6 || t2Score === 6) {
    resultText = `<h2>${t1Score === 6 ? `Vyhrál ${gameState.team1Name}!` : `Vyhrál ${gameState.team2Name}!`}</h2>`
  } else if (t1Score === 5 && t2Score === 5) {
    resultText = '<h2>Remíza 5:5!</h2>'
  }

  finalScore.innerHTML = `
    ${resultText}
    <div class="final-sets">
      <h3>Finální skóre ligového zápasu</h3>
      <p style="font-size: 2rem; font-weight: bold;">${t1Score} : ${t2Score}</p>
      <p>Odehráno dílčích zápasů: ${gameState.currentMatch}</p>
    </div>
  `
}

function endGame() {
  // Zastavit automatický průběh
  gameState.isPlaying = false
  gameState.isPaused = false
  gameState.skipToEnd = false  // Reset skipToEnd flag

  // Zastavit pozadové crowd sounds
  soundManager.stopCrowdSounds()

  console.log('🏁 endGame() - Zápas skončil')

  const t1Wins = gameState.score.team1.filter((s, i) => s > gameState.score.team2[i]).length
  const t2Wins = gameState.score.team2.filter((s, i) => s > gameState.score.team1[i]).length

  // Ligový režim - přidat bod do dílčích zápasů a pokračovat dalším zápasem
  if (gameState.gameMode === 'league') {
    // Přidat bod vítězi
    if (t1Wins > t2Wins) {
      gameState.matchesScore.team1++
    } else {
      gameState.matchesScore.team2++
    }

    // Aktualizovat UI
    updateMatchesScore()

    // Zkontrolovat, zda liga skončila
    if (checkLeagueEnd()) {
      // Zkontrolovat, zda bylo dosaženo cíle skipTarget
      if (gameState.skipTarget === 'endOfLeague') {
        // Dosáhli jsme konce ligového zápasu - přepnout na normální rychlost
        gameState.skipToEnd = false
        gameState.skipToLeagueEnd = false
        gameState.skipTarget = null
        gameState.speedMultiplier = 1
        const evalDiv = getEvaluationDiv()
        evalDiv.innerHTML = `<h3>✅ Konec ligového zápasu dosažen</h3>`
        // Liga je u konce, showLeagueFinalResult() se zavolá níže
      }

      // Ukázat finální výsledek ligy
      showLeagueFinalResult()
      return
    }

    // Pokračovat dalším dílčím zápasem
    gameState.currentMatch++

    // Zobrazit informaci o dokončeném zápasu
    const matchInfo = gameState.matchSchedule[gameState.currentMatch - 1]
    const coachBubble = document.getElementById('coach-bubble')
    if (coachBubble) {
      coachBubble.innerHTML = `<p>${matchInfo.label} dokončen! ${t1Wins > t2Wins ? gameState.team1Name : gameState.team2Name} vyhrává ${t1Wins}:${t2Wins}. Připravte se na další zápas...</p>`
    }

    // Resetovat skóre setů pro další zápas
    setTimeout(() => {
      resetMatchState()

      // Pokud je aktivní skipToLeagueEnd, pokračovat automaticky
      if (gameState.skipToLeagueEnd) {
        gameState.isPlaying = true
        gameState.skipToEnd = true
        playNextPoint()
      } else {
        // Zobrazit výběr sestavy před dalším zápasem
        showLineupSelectionBeforeMatch()
      }
    }, gameState.skipToEnd ? 0 : 3000)

    return
  }

  // Tréningový režim - původní konec zápasu
  document.querySelector('.game-court').style.display = 'none'
  document.querySelector('.game-over').style.display = 'block'

  const finalScore = document.getElementById('final-score')

  // Sestavit seznam jmen hráčů pro oba týmy
  const team1Names = gameState.team1.map(p => p.name.split(' ')[0]).join(', ')
  const team2Names = gameState.team2.map(p => p.name.split(' ')[0]).join(', ')

  finalScore.innerHTML = `
    <h2>${t1Wins > t2Wins ? `Vyhráli: ${team1Names}` : `Vyhráli: ${team2Names}`}</h2>
    <p style="font-size: 1.2rem; margin: 1rem 0; color: #ccc;">nad týmem: ${t1Wins > t2Wins ? team2Names : team1Names}</p>
    <div class="final-sets">
      <h3>Výsledky setů</h3>
      <p>Set 1: ${gameState.score.team1[0]} - ${gameState.score.team2[0]}</p>
      <p>Set 2: ${gameState.score.team1[1]} - ${gameState.score.team2[1]}</p>
      ${gameState.currentSet === 2 ? `<p>Set 3: ${gameState.score.team1[2]} - ${gameState.score.team2[2]}</p>` : ''}
    </div>
  `
}

function resetGame() {
  gameState = {
    mode: null,
    team1: [],
    team2: [],
    score: { team1: [0, 0, 0], team2: [0, 0, 0] },
    successfulDefenses: { team1: [0, 0, 0], team2: [0, 0, 0] },
    currentSet: 0,
    isPlaying: false,
    isPaused: false,
    lastActivatedSkills: { team1: [], team2: [] },
    pointsPlayed: 0,
    ultimateCooldowns: {},
    matchInterval: null,
    skipToEnd: false,
    skipTarget: null,
    skipTargetSet: null,
    speedMultiplier: 1
  }

  // Reset UI prvků
  const speedSlider = document.getElementById('speed-slider')
  const speedValue = document.getElementById('speed-value')
  const skipBtn = document.querySelector('.skip-to-end-btn')

  if (speedSlider) {
    speedSlider.value = 1
  }
  if (speedValue) {
    speedValue.textContent = '1'
  }
  if (skipBtn) {
    skipBtn.disabled = false
    skipBtn.textContent = '⏭️ Přeskočit na výsledek'
  }
}

function showMenu() {
  document.querySelector('.game-menu').style.display = 'block'
  document.querySelector('.player-selection').style.display = 'none'
  document.querySelector('.game-court').style.display = 'none'
  document.querySelector('.game-over').style.display = 'none'
}
