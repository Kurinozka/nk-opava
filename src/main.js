import './newStyle.css'
import './playerDetailStyle.css'
import './simulationModeStyle.css'
import './leagueMatchSetupStyle.css'
import { players, skills } from './playerData.js'
import { createHomeView, setupHomeHandlers as setupHomeViewHandlers } from './views/Home.js'
import { createTeamView, setupTeamHandlers } from './views/Team.js'
import { createSimulationView, setupSimulationHandlers } from './views/Simulation.js'
import { createSimulationModeView, setupSimulationModeHandlers } from './views/SimulationMode.js'
import { createPlayerDetailView, setupPlayerDetailHandlers } from './views/PlayerDetail.js'
import { createTeamRosterView, setupTeamRosterHandlers } from './views/TeamRosterView.js'
import { smecAnimation } from './animations/smec.js'
import { bokischSmecAnimation } from './animations/bokisch-smec.js'
import { kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation } from './animations/kurka-shaolin.js'
import { majstinikNonsenseAnimation } from './animations/majstinik-pozdrav.js'

// Mapa animací pro jednotlivé schopnosti (globální)
export const skillAnimations = {
  // 12: blok - video bude doplněno
}

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

// Globální funkce pro navigaci
window.navigateToView = navigateTo

// Globální funkce pro otevření player detailu
window.openPlayerDetail = function(playerId) {
  navigateTo('player', playerId)
}

// Globální funkce pro spuštění simulace
window.startSimulation = function(mode, opponentId, playersPerTeam = 3, substitutionMode = 'auto') {
  if (mode === 'training') {
    navigateTo('simulation-game', { mode: 'training', opponentId: null, playersPerTeam, substitutionMode })
  } else if (mode === 'league') {
    navigateTo('simulation-game', { mode: 'league', opponentId: opponentId, playersPerTeam: 3, substitutionMode })
  } else if (mode === 'extraliga') {
    navigateTo('simulation-game', { mode: 'extraliga', opponentId: opponentId, playersPerTeam: 3, substitutionMode })
  }
}

// Navigace
function createNavigation() {
  return `
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <img src="/images/logo-mini.jpg" alt="NK Opava" />
          <div class="nav-logo-text">
            <p>1. LIGA MUŽŮ</p>
          </div>
        </div>
        <ul class="nav-links">
          <li><a class="nav-link ${currentView === 'home' ? 'active' : ''}" data-view="home">Domů</a></li>
          <li><a class="nav-link ${currentView === 'team' ? 'active' : ''}" data-view="team">Tým</a></li>
          <li><a class="nav-link ${currentView === 'simulation' ? 'active' : ''}" data-view="simulation">Simulace</a></li>
        </ul>
      </div>
    </nav>
  `
}

// Funkce pro navigaci mezi views
function navigateTo(view, playerId = null, isExtraliga = false) {
  currentView = view

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
    // Přepnout na starý CSS pro hru
    const oldStyleLink = document.querySelector('link[href*="style.css"]')
    if (!oldStyleLink) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/src/style.css'
      document.head.appendChild(link)
    }

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

// Inicializace
navigateTo('home')
