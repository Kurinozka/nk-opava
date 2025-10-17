import { initGame, setupGameHandlers, setGameMode, setLeagueTeams, renderGameScreen, startLeagueMatch } from '../game.js'
import { createLeagueMatchSetupView, setupLeagueMatchSetupHandlers, initializeLeagueSetup } from './LeagueMatchSetup.js'
import { createTrainingMatchSetupView, setupTrainingMatchSetupHandlers } from './TrainingMatchSetup.js'
import { players } from '../playerData.js'
import { getTeamWithStats } from '../leagueTeams.js'
import { getTeamWithStats as getExtraligaTeamWithStats } from '../extraligaTeams.js'

let currentGameMode = 'training'
let currentOpponentId = null
let currentExtraligaTeams = null // { team1: id, team2: id }
let currentMatchIndex = 0
let leagueSchedule = []
let currentPlayersPerTeam = 3
let currentSubstitutionMode = 'auto'

export function createSimulationView(gameMode = 'training', opponentTeamId = null, playersPerTeam = 3, substitutionMode = 'auto') {
  currentGameMode = gameMode
  currentPlayersPerTeam = playersPerTeam
  currentSubstitutionMode = substitutionMode

  // Pro extraligu zpracovat speciálně
  if (gameMode === 'extraliga') {
    currentExtraligaTeams = opponentTeamId // { team1: id, team2: id }
    currentOpponentId = null
  } else {
    currentOpponentId = opponentTeamId
    currentExtraligaTeams = null
  }

  // Nastavit herní režim
  setGameMode(gameMode, opponentTeamId)

  // Pro ligový režim zobrazit setup pro první zápas
  if (gameMode === 'league') {
    // Vytvořit rozvrh zápasů podle oficiálních pravidel 1. ligy mužů nohejbalu
    leagueSchedule = [
      { type: 'dvojice1', label: '1. dvojice vs. 1. dvojice', position: 1 },
      { type: 'trojice1', label: '1. trojice vs. 1. trojice', position: 1 },
      { type: 'dvojice2', label: '2. dvojice (mezinárodní) vs. 2. dvojice (mezinárodní)', position: 2 },
      { type: 'trojice2', label: '2. trojice (mezinárodní) vs. 2. trojice (mezinárodní)', position: 2 },
      { type: 'singl', label: 'Singl (1 vs. 1)', position: null },
      { type: 'dvojice3', label: '3. dvojice vs. 3. dvojice', position: 3 },
      { type: 'trojice1-vs-2', label: '1. trojice domácích vs. 2. trojice hostů', position: 1 },
      { type: 'trojice2-vs-1', label: '2. trojice domácích vs. 1. trojice hostů', position: 2 }
    ]
    currentMatchIndex = 0

    return createLeagueMatchSetupView(leagueSchedule[0], opponentTeamId, substitutionMode)
  }

  // Pro extraligový režim zobrazit setup pro první zápas
  if (gameMode === 'extraliga') {
    // Stejný rozvrh jako pro ligový zápas
    leagueSchedule = [
      { type: 'dvojice1', label: '1. dvojice vs. 1. dvojice', position: 1 },
      { type: 'trojice1', label: '1. trojice vs. 1. trojice', position: 1 },
      { type: 'dvojice2', label: '2. dvojice (mezinárodní) vs. 2. dvojice (mezinárodní)', position: 2 },
      { type: 'trojice2', label: '2. trojice (mezinárodní) vs. 2. trojice (mezinárodní)', position: 2 },
      { type: 'singl', label: 'Singl (1 vs. 1)', position: null },
      { type: 'dvojice3', label: '3. dvojice vs. 3. dvojice', position: 3 },
      { type: 'trojice1-vs-2', label: '1. trojice domácích vs. 2. trojice hostů', position: 1 },
      { type: 'trojice2-vs-1', label: '2. trojice domácích vs. 1. trojice hostů', position: 2 }
    ]
    currentMatchIndex = 0

    // Pro extraligu použít speciální view (vytvoříme později)
    return createExtraligaMatchSetupView(leagueSchedule[0], currentExtraligaTeams, substitutionMode)
  }

  // Pro tréningový režim zobrazit setup s kartami
  return createTrainingMatchSetupView(playersPerTeam, substitutionMode)
}

// Vytvoří view pro extraligový zápas - podobné jako league setup ale pro dva extraligové týmy
function createExtraligaMatchSetupView(matchInfo, teams, substitutionMode) {
  const team1 = getExtraligaTeamWithStats(teams.team1)
  const team2 = getExtraligaTeamWithStats(teams.team2)

  // Kontrola, zda se podařilo načíst týmy
  if (!team1 || !team2) {
    console.error('Failed to load extraliga teams:', { team1Id: teams.team1, team2Id: teams.team2, team1, team2 })
    return `
      <div class="league-match-setup">
        <div class="error-message">
          <h2>Chyba při načítání týmů</h2>
          <p>Nepodařilo se načíst data pro vybrané týmy.</p>
          <button class="back-button" onclick="window.navigateToView('simulation-mode')">← Zpět na výběr režimu</button>
        </div>
      </div>
    `
  }

  // Určit počet hráčů na základě typu zápasu
  let playersPerTeam = 2
  let matchTypeLabel = 'Dvojice'

  if (matchInfo.type.startsWith('trojice')) {
    playersPerTeam = 3
    matchTypeLabel = 'Trojice'
  } else if (matchInfo.type === 'singl') {
    playersPerTeam = 1
    matchTypeLabel = 'Singl'
  } else if (matchInfo.type.startsWith('dvojice')) {
    playersPerTeam = 2
    matchTypeLabel = 'Dvojice'
  }

  const subModeLabel = substitutionMode === 'auto' ? '🤖 Trenér' : '👤 Manuální střídání'

  return `
    <div class="league-match-setup">
      <div class="match-info-header">
        <h1>${matchInfo.label}</h1>
        <p class="match-type">${matchTypeLabel} - ${playersPerTeam} hráči na každé straně | ${subModeLabel}</p>
      </div>

      <div class="teams-setup">
        <!-- Domácí tým -->
        <div class="team-setup opava-team">
          <h2>${team1.shortName}</h2>
          <div class="lineup-bench-container">
            <div class="lineup-section">
              <h3>Základní sestava (<span id="opava-count">0</span>/${playersPerTeam})</h3>
              <div class="lineup-players" id="opava-lineup"></div>
            </div>
            <div class="bench-section" style="${playersPerTeam === 1 ? 'display: none;' : ''}">
              <h3>Lavička (<span id="opava-bench-count">0</span>/${playersPerTeam === 1 ? 0 : playersPerTeam === 2 ? 1 : 2})</h3>
              <div class="bench-players" id="opava-bench"></div>
            </div>
          </div>
          <div class="available-section">
            <h3>Dostupní hráči</h3>
            <div class="available-players" id="opava-available"></div>
          </div>
        </div>

        <!-- Hostující tým -->
        <div class="team-setup opponent-team">
          <h2>${team2.shortName}</h2>
          <div class="lineup-bench-container">
            <div class="lineup-section">
              <h3>Základní sestava (<span id="opponent-count">0</span>/${playersPerTeam})</h3>
              <div class="lineup-players" id="opponent-lineup"></div>
            </div>
            <div class="bench-section" style="${playersPerTeam === 1 ? 'display: none;' : ''}">
              <h3>Lavička (<span id="opponent-bench-count">0</span>/${playersPerTeam === 1 ? 0 : playersPerTeam === 2 ? 1 : 2})</h3>
              <div class="bench-players" id="opponent-bench"></div>
            </div>
          </div>
          <div class="available-section">
            <h3>Dostupní hráči</h3>
            <div class="available-players" id="opponent-available"></div>
          </div>
        </div>
      </div>

      <div class="coach-mode-selection">
        <h2>⚙️ Režim trenéra</h2>
        <div class="coach-mode-buttons">
          <button class="coach-mode-btn" data-mode="passive">
            <div class="coach-mode-icon">😴</div>
            <h3>Pasivní</h3>
            <p>Trenér jen komentuje</p>
          </button>
          <button class="coach-mode-btn active" data-mode="active">
            <div class="coach-mode-icon">👔</div>
            <h3>Aktivní</h3>
            <p>Automatické střídání</p>
          </button>
          <button class="coach-mode-btn" data-mode="hyperactive">
            <div class="coach-mode-icon">🔥</div>
            <h3>Hyperaktivní</h3>
            <p>Výběr dovedností</p>
          </button>
        </div>
      </div>

      <div class="setup-actions">
        <button class="confirm-lineup-btn" disabled>Potvrdit sestavy a začít zápas</button>
      </div>
    </div>
  `
}

export function setupSimulationHandlers() {
  if (currentGameMode === 'league') {
    const matchInfo = leagueSchedule[currentMatchIndex]
    const opponentTeam = getTeamWithStats(currentOpponentId)

    console.log('Setup simulation handlers:', {
      currentOpponentId,
      opponentTeam,
      matchInfo,
      hasPlayers: opponentTeam?.players?.length
    })

    if (!opponentTeam) {
      console.error('Opponent team not found for ID:', currentOpponentId)
      return
    }

    if (!opponentTeam.players || opponentTeam.players.length === 0) {
      console.error('Opponent team has no players:', currentOpponentId)
      return
    }

    // Určit počet hráčů podle typu zápasu
    let playersPerTeam = 2
    if (matchInfo.type.startsWith('trojice')) playersPerTeam = 3
    else if (matchInfo.type === 'singl') playersPerTeam = 1
    else if (matchInfo.type.startsWith('dvojice')) playersPerTeam = 2

    // Inicializovat state
    const state = {
      opavaLineup: [],
      opavaBench: [],
      opponentLineup: [],
      opponentBench: []
    }

    // Inicializovat globální state
    initializeLeagueSetup(matchInfo, currentOpponentId, playersPerTeam, players, opponentTeam.players, state)

    // Setup handlers s callback pro potvrzení
    setupLeagueMatchSetupHandlers(matchInfo, currentOpponentId, (opavaLineup, opavaBench, opponentLineup, opponentBench, playersPerTeam, coachMode) => {
      // Nastavit týmy do game state
      setLeagueTeams(opavaLineup, opavaBench, opponentLineup, opponentBench, playersPerTeam, currentSubstitutionMode, coachMode)

      // Začít přímo hru (bez menu)
      const app = document.querySelector('#app')
      app.innerHTML = renderGameScreen()
      startLeagueMatch()
    })
  } else if (currentGameMode === 'extraliga') {
    // Extraligový režim - dva extraligové týmy proti sobě
    const matchInfo = leagueSchedule[currentMatchIndex]
    const team1 = getExtraligaTeamWithStats(currentExtraligaTeams.team1)
    const team2 = getExtraligaTeamWithStats(currentExtraligaTeams.team2)

    console.log('Setup extraliga handlers:', {
      currentExtraligaTeams,
      team1,
      team2,
      matchInfo
    })

    if (!team1 || !team2) {
      console.error('Extraliga teams not found:', currentExtraligaTeams)
      return
    }

    // Určit počet hráčů podle typu zápasu
    let playersPerTeam = 2
    if (matchInfo.type.startsWith('trojice')) playersPerTeam = 3
    else if (matchInfo.type === 'singl') playersPerTeam = 1
    else if (matchInfo.type.startsWith('dvojice')) playersPerTeam = 2

    // Inicializovat state
    const state = {
      opavaLineup: [],
      opavaBench: [],
      opponentLineup: [],
      opponentBench: []
    }

    // Inicializovat globální state s ID obou týmů a názvy týmů
    initializeLeagueSetup(matchInfo, currentExtraligaTeams.team2, playersPerTeam, team1.players, team2.players, state, currentExtraligaTeams.team1, team1.name, team2.name)

    // Setup handlers s callback pro potvrzení
    setupLeagueMatchSetupHandlers(matchInfo, currentExtraligaTeams.team2, (team1Lineup, team1Bench, team2Lineup, team2Bench, playersPerTeam, coachMode) => {
      // Nastavit týmy do game state
      setLeagueTeams(team1Lineup, team1Bench, team2Lineup, team2Bench, playersPerTeam, currentSubstitutionMode, coachMode)

      // Začít přímo hru (bez menu)
      const app = document.querySelector('#app')
      app.innerHTML = renderGameScreen()
      startLeagueMatch()
    })
  } else {
    // Tréningový režim - setup s kartami
    setupTrainingMatchSetupHandlers(currentPlayersPerTeam, currentSubstitutionMode, (team1Lineup, team1Bench, team2Lineup, team2Bench, playersPerTeam, coachMode) => {
      // Nastavit týmy do game state
      setLeagueTeams(team1Lineup, team1Bench, team2Lineup, team2Bench, playersPerTeam, currentSubstitutionMode, coachMode)

      // Začít přímo hru (bez menu)
      const app = document.querySelector('#app')
      app.innerHTML = renderGameScreen()
      startLeagueMatch()
    })
  }

  // Naslouchat eventu pro zobrazení výběru sestavy mezi dílčími zápasy
  window.addEventListener('showLineupSelection', (event) => {
    if (currentGameMode === 'league') {
      currentMatchIndex = event.detail.matchIndex
      const matchInfo = leagueSchedule[currentMatchIndex]
      const opponentTeam = getTeamWithStats(currentOpponentId)

      if (!matchInfo || !opponentTeam) {
        console.error('Cannot show lineup selection:', { matchInfo, opponentTeam })
        return
      }

      // Zobrazit výběr sestavy
      const app = document.querySelector('#app')
      app.innerHTML = createLeagueMatchSetupView(matchInfo, currentOpponentId, currentSubstitutionMode)

      // Určit počet hráčů podle typu zápasu
      let playersPerTeam = 2
      if (matchInfo.type.startsWith('trojice')) playersPerTeam = 3
      else if (matchInfo.type === 'singl') playersPerTeam = 1
      else if (matchInfo.type.startsWith('dvojice')) playersPerTeam = 2

      // Inicializovat state
      const state = {
        opavaLineup: [],
        opavaBench: [],
        opponentLineup: [],
        opponentBench: []
      }

      // Inicializovat globální state
      initializeLeagueSetup(matchInfo, currentOpponentId, playersPerTeam, players, opponentTeam.players, state)

      // Setup handlers s callback pro potvrzení
      setupLeagueMatchSetupHandlers(matchInfo, currentOpponentId, (opavaLineup, opavaBench, opponentLineup, opponentBench, playersPerTeam, coachMode) => {
        // Nastavit týmy do game state
        setLeagueTeams(opavaLineup, opavaBench, opponentLineup, opponentBench, playersPerTeam, currentSubstitutionMode, coachMode)

        // Začít další zápas
        const app = document.querySelector('#app')
        app.innerHTML = renderGameScreen()
        startLeagueMatch()
      })
    } else if (currentGameMode === 'extraliga') {
      currentMatchIndex = event.detail.matchIndex
      const matchInfo = leagueSchedule[currentMatchIndex]
      const team1 = getExtraligaTeamWithStats(currentExtraligaTeams.team1)
      const team2 = getExtraligaTeamWithStats(currentExtraligaTeams.team2)

      if (!matchInfo || !team1 || !team2) {
        console.error('Cannot show extraliga lineup selection:', { matchInfo, team1, team2 })
        return
      }

      // Zobrazit výběr sestavy
      const app = document.querySelector('#app')
      app.innerHTML = createExtraligaMatchSetupView(matchInfo, currentExtraligaTeams, currentSubstitutionMode)

      // Určit počet hráčů podle typu zápasu
      let playersPerTeam = 2
      if (matchInfo.type.startsWith('trojice')) playersPerTeam = 3
      else if (matchInfo.type === 'singl') playersPerTeam = 1
      else if (matchInfo.type.startsWith('dvojice')) playersPerTeam = 2

      // Inicializovat state
      const state = {
        opavaLineup: [],
        opavaBench: [],
        opponentLineup: [],
        opponentBench: []
      }

      // Inicializovat globální state s ID obou týmů
      initializeLeagueSetup(matchInfo, currentExtraligaTeams.team2, playersPerTeam, team1.players, team2.players, state, currentExtraligaTeams.team1)

      // Setup handlers s callback pro potvrzení
      setupLeagueMatchSetupHandlers(matchInfo, currentExtraligaTeams.team2, (team1Lineup, team1Bench, team2Lineup, team2Bench, playersPerTeam, coachMode) => {
        // Nastavit týmy do game state
        setLeagueTeams(team1Lineup, team1Bench, team2Lineup, team2Bench, playersPerTeam, currentSubstitutionMode, coachMode)

        // Začít další zápas
        const app = document.querySelector('#app')
        app.innerHTML = renderGameScreen()
        startLeagueMatch()
      })
    }
  })
}
