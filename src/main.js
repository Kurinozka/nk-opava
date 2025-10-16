import './style.css'
import './newStyle.css'
import './playerDetailStyle.css'
import './simulationModeStyle.css'
import './leagueMatchSetupStyle.css'
import './schoolOfNohejbalStyle.css'
import { players, skills } from './playerData.js'
import { createHomeView, setupHomeHandlers as setupHomeViewHandlers } from './views/Home.js'
import { createTeamView, setupTeamHandlers } from './views/Team.js'
import { createSimulationView, setupSimulationHandlers } from './views/Simulation.js'
import { createSimulationModeView, setupSimulationModeHandlers } from './views/SimulationMode.js'
import { createPlayerDetailView, setupPlayerDetailHandlers } from './views/PlayerDetail.js'
import { createTeamRosterView, setupTeamRosterHandlers } from './views/TeamRosterView.js'
import { createSchoolOfNohejbalView, setupSchoolOfNohejbalHandlers } from './views/SchoolOfNohejbal.js'
import { skillAnimations } from './skillAnimations.js'
import { bokischSmecAnimation } from './animations/bokisch-smec.js'
import { kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation } from './animations/kurka-shaolin.js'
import { majstinikNonsenseAnimation } from './animations/majstinik-pozdrav.js'

// Re-export pro zpětnou kompatibilitu
export { skillAnimations }
// Force reload

// Mapa animací specifických pro jednotlivé hráče a jejich dovednosti
export const playerSkillAnimations = {
  1: {
    3: bokischSmecAnimation,  // Radim Bokisch - Smeč po noze/do áčka
    5: bokischSmecAnimation,  // Radim Bokisch - Klepák (použijeme stejné video)
    15: null
  },
  4: {
    15: [kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation]  // Ondřej Kurka - Shaolin
  },
  7: {
    15: majstinikNonsenseAnimation  // David Majštiník - Pozdrav přítelkyni
  }
}

const app = document.querySelector('#app')
let currentView = 'home'

// Funkce pro výpočet úspěšnosti dovednosti
export function calculateSkillSuccessRate(player, skillId) {
  const skill = skills[skillId]
  if (!skill || !skill.stats) return 100
  if (!player.stats) return 0

  const statValues = skill.stats.map(statName => player.stats[statName] || 0)
  const average = statValues.reduce((sum, val) => sum + val, 0) / statValues.length

  return Math.round(average)
}

// Funkce pro vytvoření player modalu
function createPlayerModal(player) {
  const modal = document.createElement('div')
  modal.className = 'modal'

  if (!player.stats && player.coachQuotes) {
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-header">
          <h2>${player.name}</h2>
          <p class="modal-position">${player.position} • #${player.number}</p>
        </div>

        <div class="coach-quotes-section">
          <h3>🗣️ Trenérovy hlášky</h3>

          <div class="quote-category">
            <h4>📉 Při neúspěšném útoku:</h4>
            <ul>
              ${player.coachQuotes.offensiveFail.map(quote => `<li>"${quote}"</li>`).join('')}
            </ul>
          </div>

          <div class="quote-category">
            <h4>🛡️ Při neúspěšné obraně:</h4>
            <ul>
              ${player.coachQuotes.defensiveFail.map(quote => `<li>"${quote}"</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `
  } else {
    const allSkillIds = Object.keys(skills).map(Number)

    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-header">
          <h2>${player.name}</h2>
          <p class="modal-position">${player.position} • #${player.number}</p>
        </div>

        ${player.seasonStats && player.seasonStats.length > 0 ? `
        <div class="season-stats-section">
          <h3>📊 Statistiky sezón</h3>
          <div class="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Sezóna</th>
                  <th>Liga</th>
                  <th>Zápasy</th>
                  <th>Výhry</th>
                  <th>Prohry</th>
                  <th>Úspěšnost</th>
                </tr>
              </thead>
              <tbody>
                ${player.seasonStats.map(stat => `
                  <tr>
                    <td>${stat.season}</td>
                    <td>${stat.league}</td>
                    <td>${stat.matches}</td>
                    <td class="wins">${stat.wins}</td>
                    <td class="losses">${stat.losses}</td>
                    <td class="win-rate"><strong>${stat.winRate}%</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        <div class="skills-videos">
          ${allSkillIds.map(skillId => {
            let animation = null
            if (playerSkillAnimations[player.id] && playerSkillAnimations[player.id][skillId]) {
              animation = playerSkillAnimations[player.id][skillId]
            } else {
              animation = skillAnimations[skillId]
            }

            const successRate = calculateSkillSuccessRate(player, skillId)
            const skillType = skills[skillId].type

            const skillName = skillId === 15 && player.nonsenseName ? player.nonsenseName : skills[skillId].name
            const skillSuccessRate = skillId === 15 ? 10 : successRate

            // Pokud je animace pole (úspěch + neúspěch), vytvoř dvě samostatné položky
            if (Array.isArray(animation)) {
              return `
                <div class="skill-video-item ${skillType}">
                  <div class="skill-header">
                    <h3 class="skill-video-title">${skillName} - ÚSPĚŠNÝ</h3>
                    <div class="skill-success-rate">
                      <span class="success-percentage">${skillSuccessRate}%</span>
                      <span class="success-label">úspěšnost</span>
                    </div>
                  </div>
                  <div class="animation-box">
                    ${animation[0]}
                  </div>
                </div>
                <div class="skill-video-item ${skillType}">
                  <div class="skill-header">
                    <h3 class="skill-video-title">${skillName} - NEÚSPĚŠNÝ</h3>
                    <div class="skill-success-rate">
                      <span class="success-percentage">${100 - skillSuccessRate}%</span>
                      <span class="success-label">pravděpodobnost</span>
                    </div>
                  </div>
                  <div class="animation-box">
                    ${animation[1]}
                  </div>
                </div>
              `
            }

            return `
              <div class="skill-video-item ${skillType}">
                <div class="skill-header">
                  <h3 class="skill-video-title">${skillName}</h3>
                  <div class="skill-success-rate">
                    <span class="success-percentage">${skillSuccessRate}%</span>
                    <span class="success-label">úspěšnost</span>
                  </div>
                </div>
                ${animation ? `
                <div class="animation-box">
                  ${animation}
                </div>
              ` : `
                <div class="video-placeholder">
                  <div class="video-icon">🎥</div>
                  <p>Animace/video bude přidáno</p>
                  <small>${skills[skillId].name}</small>
                </div>
              `}
            </div>
          `
        }).join('')}
      </div>
    </div>
    `
  }

  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove()
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })

  return modal
}

// Funkce pro vytvoření URL podle view
function getUrlForView(view, params = null) {
  switch (view) {
    case 'home':
      return '/'
    case 'team':
      return '/team'
    case 'school':
      return '/school'
    case 'simulation':
      return '/simulation'
    case 'player':
      return `/player/${params}`
    case 'team-roster':
      // Pro team-roster může být params buď string (teamId) nebo objekt {teamId, isExtraliga}
      if (params && typeof params === 'object' && params.teamId) {
        return params.isExtraliga
          ? `/team-roster/${params.teamId}?extraliga=true`
          : `/team-roster/${params.teamId}`
      }
      return `/team-roster/${params}`
    case 'simulation-game':
      if (params && params.mode) {
        // Pro extraligu serializovat object jako JSON
        let opponentIdParam = params.opponentId || ''
        if (params.mode === 'extraliga' && typeof params.opponentId === 'object') {
          opponentIdParam = JSON.stringify(params.opponentId)
        }

        const queryParams = new URLSearchParams({
          mode: params.mode,
          opponentId: opponentIdParam,
          playersPerTeam: params.playersPerTeam || 3,
          substitutionMode: params.substitutionMode || 'auto'
        })
        return `/simulation-game?${queryParams.toString()}`
      }
      return '/simulation-game'
    default:
      return '/'
  }
}

// Funkce pro parsování URL a získání view + params
function parseUrl(url = window.location.pathname + window.location.search) {
  const path = url.split('?')[0]
  const searchParams = new URLSearchParams(url.split('?')[1] || '')

  // Odstranit trailing slash
  const cleanPath = path.replace(/\/$/, '') || '/'

  if (cleanPath === '/' || cleanPath === '') {
    return { view: 'home', params: null }
  }

  if (cleanPath === '/team') {
    return { view: 'team', params: null }
  }

  if (cleanPath === '/school') {
    return { view: 'school', params: null }
  }

  if (cleanPath === '/simulation') {
    return { view: 'simulation', params: null }
  }

  if (cleanPath.startsWith('/player/')) {
    const playerId = cleanPath.replace('/player/', '')
    return { view: 'player', params: playerId }
  }

  if (cleanPath.startsWith('/team-roster/')) {
    const teamId = cleanPath.replace('/team-roster/', '')
    // Zkontrolovat, jestli je v query parametru isExtraliga
    const isExtraliga = searchParams.get('extraliga') === 'true'
    return { view: 'team-roster', params: { teamId, isExtraliga } }
  }

  if (cleanPath === '/simulation-game') {
    const mode = searchParams.get('mode') || 'training'
    let opponentId = searchParams.get('opponentId') || null

    // Pro extraligu deserializovat JSON zpět na object
    if (mode === 'extraliga' && opponentId && opponentId.startsWith('{')) {
      try {
        opponentId = JSON.parse(opponentId)
      } catch (e) {
        console.error('Failed to parse extraliga teams from URL:', e)
        opponentId = null
      }
    }

    const playersPerTeam = parseInt(searchParams.get('playersPerTeam')) || 3
    const substitutionMode = searchParams.get('substitutionMode') || 'auto'

    return {
      view: 'simulation-game',
      params: { mode, opponentId, playersPerTeam, substitutionMode }
    }
  }

  // Fallback na home
  return { view: 'home', params: null }
}

// Globální funkce pro navigaci
window.navigateToView = navigateTo

// Globální funkce pro otevření player detailu
window.openPlayerDetail = function(playerId) {
  navigateTo('player', playerId, true)
}

// Globální funkce pro spuštění simulace
window.startSimulation = function(mode, opponentId, playersPerTeam = 3, substitutionMode = 'auto') {
  if (mode === 'training') {
    navigateTo('simulation-game', { mode: 'training', opponentId: null, playersPerTeam, substitutionMode }, true)
  } else if (mode === 'league') {
    navigateTo('simulation-game', { mode: 'league', opponentId: opponentId, playersPerTeam: 3, substitutionMode }, true)
  } else if (mode === 'extraliga') {
    navigateTo('simulation-game', { mode: 'extraliga', opponentId: opponentId, playersPerTeam: 3, substitutionMode }, true)
  }
}

// Navigace
function createNavigation() {
  return `
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <img src="/images/logo-nove.jpg" alt="NK Opava" />
          <div class="nav-logo-text">
            <p>1. LIGA MUŽŮ</p>
          </div>
        </div>
        <ul class="nav-links">
          <li><a class="nav-link ${currentView === 'home' ? 'active' : ''}" data-view="home">Domů</a></li>
          <li><a class="nav-link ${currentView === 'team' ? 'active' : ''}" data-view="team">Tým</a></li>
          <li><a class="nav-link ${currentView === 'simulation' ? 'active' : ''}" data-view="simulation">Simulace</a></li>
          <li><a class="nav-link ${currentView === 'school' ? 'active' : ''}" data-view="school">Škola nohejbalu</a></li>
        </ul>
      </div>
    </nav>
  `
}

// Funkce pro navigaci mezi views
function navigateTo(view, playerId = null, isExtraliga = false, skipHistoryUpdate = false) {
  currentView = view

  // Aktualizovat URL v prohlížeči (pokud není skipHistoryUpdate)
  if (!skipHistoryUpdate) {
    const url = getUrlForView(view, playerId || (isExtraliga !== undefined ? { teamId: playerId, isExtraliga } : null))
    history.pushState({ view, playerId, isExtraliga }, '', url)
  }

  // Pro team-roster view (karty hráčů libovolného týmu)
  if (view === 'team-roster') {
    // Povolit nový CSS
    const oldStyleLinks = document.querySelectorAll('link[href*="style.css"]:not([href*="newStyle"]):not([href*="simulationMode"])')
    oldStyleLinks.forEach(link => link.disabled = true)

    const newStyleLinks = document.querySelectorAll('link[href*="newStyle.css"]')
    newStyleLinks.forEach(link => link.disabled = false)

    const simulationModeLinks = document.querySelectorAll('link[href*="simulationModeStyle.css"]')
    simulationModeLinks.forEach(link => link.disabled = true)

    // playerId obsahuje teamId
    const teamId = playerId
    const content = createTeamRosterView(teamId, isExtraliga)

    app.innerHTML = createNavigation() + content

    setupNavigationHandlers()
    setupTeamRosterHandlers()
    return
  }

  // Pro výběr režimu simulace: navigace + obsah
  if (view === 'simulation') {
    // Povolit nový CSS
    const oldStyleLinks = document.querySelectorAll('link[href*="style.css"]:not([href*="newStyle"]):not([href*="simulationMode"])')
    oldStyleLinks.forEach(link => link.disabled = true)

    const newStyleLinks = document.querySelectorAll('link[href*="newStyle.css"], link[href*="simulationModeStyle.css"]')
    newStyleLinks.forEach(link => link.disabled = false)

    app.innerHTML = createNavigation() + createSimulationModeView()
    setupNavigationHandlers()
    setupSimulationModeHandlers()
    return
  }

  // Pro samotnou hru: celá obrazovka bez navigace, použít starý CSS
  if (view === 'simulation-game') {
    // Aktivovat starý CSS pro hru
    const oldStyleLinks = document.querySelectorAll('link[href*="style.css"]:not([href*="newStyle"]):not([href*="simulationMode"]):not([href*="playerDetail"]):not([href*="leagueMatchSetup"]):not([href*="schoolOfNohejbal"])')
    oldStyleLinks.forEach(link => link.disabled = false)

    // Skrýt nový CSS
    const newStyleLinks = document.querySelectorAll('link[href*="newStyle.css"], link[href*="simulationModeStyle.css"]')
    newStyleLinks.forEach(link => link.disabled = true)

    // Celá obrazovka bez navigace
    // playerId obsahuje objekt {mode, opponentId, playersPerTeam, substitutionMode}
    const gameMode = playerId && playerId.mode ? playerId.mode : 'training'
    const opponentId = playerId && playerId.opponentId ? playerId.opponentId : null
    const playersPerTeam = playerId && playerId.playersPerTeam ? playerId.playersPerTeam : 3
    const substitutionMode = playerId && playerId.substitutionMode ? playerId.substitutionMode : 'auto'

    app.innerHTML = createSimulationView(gameMode, opponentId, playersPerTeam, substitutionMode)
    setupSimulationHandlers()
    return
  }

  // Pro ostatní views: navigace + obsah, nový CSS
  const oldStyleLinks = document.querySelectorAll('link[href*="style.css"]:not([href*="newStyle"]):not([href*="simulationMode"])')
  oldStyleLinks.forEach(link => link.disabled = true)

  const newStyleLinks = document.querySelectorAll('link[href*="newStyle.css"]')
  newStyleLinks.forEach(link => link.disabled = false)

  const simulationModeLinks = document.querySelectorAll('link[href*="simulationModeStyle.css"]')
  simulationModeLinks.forEach(link => link.disabled = true)

  let content = ''

  if (view === 'home') {
    content = createHomeView()
  } else if (view === 'team') {
    content = createTeamView()
  } else if (view === 'school') {
    content = createSchoolOfNohejbalView()
  } else if (view === 'player') {
    content = createPlayerDetailView(playerId)
  }

  app.innerHTML = createNavigation() + content

  // Setup event listeners
  setupNavigationHandlers()

  if (view === 'home') {
    setupHomeHandlers()
  } else if (view === 'team') {
    setupTeamHandlers()
  } else if (view === 'school') {
    setupSchoolOfNohejbalHandlers()
  } else if (view === 'player') {
    setupPlayerDetailHandlers()
  }
}

// Setup navigation handlers
function setupNavigationHandlers() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const view = link.dataset.view
      navigateTo(view)
    })
  })
}

// Setup home view handlers
function setupHomeHandlers() {
  // CTA buttons
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.nav
      navigateTo(view)
    })
  })

  // Setup match details handlers from Home.js
  setupHomeViewHandlers()
}

// Handler pro zpětné tlačítko prohlížeče
window.addEventListener('popstate', (event) => {
  if (event.state) {
    // Máme uložený stav, použijeme ho
    navigateTo(event.state.view, event.state.playerId, event.state.isExtraliga, true)
  } else {
    // Nemáme stav, musíme parsovat URL
    const { view, params } = parseUrl()
    if (view === 'team-roster' && params) {
      navigateTo(view, params.teamId, params.isExtraliga, true)
    } else {
      navigateTo(view, params, false, true)
    }
  }
})

// Inicializace - parsovat URL a navigovat na správný view
const initialUrl = parseUrl()
if (initialUrl.view === 'team-roster' && initialUrl.params) {
  navigateTo(initialUrl.view, initialUrl.params.teamId, initialUrl.params.isExtraliga, true)
} else {
  navigateTo(initialUrl.view, initialUrl.params, false, true)
}
