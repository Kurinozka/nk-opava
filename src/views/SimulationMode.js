import { getOpponentTeams } from '../leagueTeams.js'
import { getOpponentTeams as getExtraligaTeams } from '../extraligaTeams.js'

export function createSimulationModeView() {
  const opponents = getOpponentTeams()
  const extraligaTeams = getExtraligaTeams()

  // Přidat NK Opavu do seznamu týmů 1. ligy
  const allLeagueTeams = [
    {
      id: "OPAVA",
      name: "NK Opava",
      shortName: "OPAVA",
      logo: "/images/logo-full.jpg"
    },
    ...opponents
  ]

  return `
    <div class="simulation-mode-container">
      <div class="mode-selection-wrapper">
        <div class="league-selector-top">
          <button class="league-selector-btn league-btn-red" data-league="league">1. liga</button>
          <button class="league-selector-btn league-btn-black" data-league="extraliga">Extraliga</button>
        </div>

        <!-- Původní výběr režimů -->
        <div id="mode-selection-view">
          <h1 class="mode-title">Vyber režim simulace</h1>

          <div class="mode-cards">
          <div class="mode-card training-mode" data-mode="training">
            <div class="mode-icon">🏋️</div>
            <h2>Trénink</h2>
            <p>Hráči NK Opava proti sobě</p>
            <p class="mode-description">Procvič sestavy a otestuj různé kombinace hráčů v tréninkovém režimu.</p>

            <button class="mode-button training-button">Zahájit trénink</button>
          </div>

          <div class="mode-card league-mode" data-mode="league">
            <div class="mode-icon">🏆</div>
            <h2>Ligový zápas</h2>
            <p>NK Opava vs. soupeř z 1. ligy</p>
            <p class="mode-description">Vyber soupeře a odehraj ligový zápas s novými pravidly 8 dílčích zápasů.</p>

            <div class="opponent-selection">
              <label for="opponent-select">Vyber soupeře:</label>
              <select id="opponent-select" class="opponent-dropdown">
                <option value="">-- Vyber tým --</option>
                ${opponents.map(team => `
                  <option value="${team.id}">${team.shortName}</option>
                `).join('')}
              </select>
            </div>

            <button class="mode-button league-button" disabled>Zahájit ligový zápas</button>
          </div>

          <div class="mode-card extraliga-mode" data-mode="extraliga">
            <div class="mode-icon">⭐</div>
            <h2>Extraliga</h2>
            <p>Dva extraligové týmy proti sobě</p>
            <p class="mode-description">Vyber dva týmy z Extraligy a odehraj mezi nimi ligový zápas.</p>

            <div class="opponent-selection">
              <label for="extraliga-team1-select">Domácí tým:</label>
              <select id="extraliga-team1-select" class="opponent-dropdown">
                <option value="">-- Vyber tým --</option>
                ${extraligaTeams.map(team => `
                  <option value="${team.id}">${team.shortName}</option>
                `).join('')}
              </select>
            </div>

            <div class="opponent-selection">
              <label for="extraliga-team2-select">Hostující tým:</label>
              <select id="extraliga-team2-select" class="opponent-dropdown">
                <option value="">-- Vyber tým --</option>
                ${extraligaTeams.map(team => `
                  <option value="${team.id}">${team.shortName}</option>
                `).join('')}
              </select>
            </div>

            <button class="mode-button extraliga-button" disabled>Zahájit extraligový zápas</button>
          </div>
        </div>
        </div>

        <!-- View pro zobrazení týmů 1. ligy -->
        <div id="league-teams-view" style="display: none;">
          <h1 class="mode-title">Týmy 1. ligy</h1>
          <div class="teams-logos-grid">
            ${allLeagueTeams.map(team => `
              <div class="team-logo-card" data-team-id="${team.id}">
                <img src="${team.logo}" alt="${team.name}" class="team-logo-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22white%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${team.shortName}%3C/text%3E%3C/svg%3E'" />
                <p class="team-logo-name">${team.shortName}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- View pro zobrazení týmů Extraligy -->
        <div id="extraliga-teams-view" style="display: none;">
          <h1 class="mode-title">Týmy Extraligy</h1>
          <div class="teams-logos-grid">
            ${extraligaTeams.map(team => `
              <div class="team-logo-card" data-team-id="${team.id}">
                <img src="${team.logo}" alt="${team.name}" class="team-logo-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23000%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22white%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${team.shortName}%3C/text%3E%3C/svg%3E'" />
                <p class="team-logo-name">${team.shortName}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `
}

export function setupSimulationModeHandlers() {
  const trainingButton = document.querySelector('.training-button')
  const leagueButton = document.querySelector('.league-button')
  const extraligaButton = document.querySelector('.extraliga-button')
  const opponentSelect = document.getElementById('opponent-select')
  const extraligaTeam1Select = document.getElementById('extraliga-team1-select')
  const extraligaTeam2Select = document.getElementById('extraliga-team2-select')

  // Načíst extraligové týmy pro validaci
  const extraligaTeams = getExtraligaTeams()

  // Handler pro tlačítka výběru ligy nahoře
  const leagueSelectorBtns = document.querySelectorAll('.league-selector-btn')
  const modeSelectionView = document.getElementById('mode-selection-view')
  const leagueTeamsView = document.getElementById('league-teams-view')
  const extraligaTeamsView = document.getElementById('extraliga-teams-view')

  leagueSelectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLeague = btn.dataset.league
      const isCurrentlyActive = btn.classList.contains('active')

      // Pokud je tlačítko již aktivní, vrátit se na výběr režimů
      if (isCurrentlyActive) {
        modeSelectionView.style.display = 'block'
        leagueTeamsView.style.display = 'none'
        extraligaTeamsView.style.display = 'none'

        // Odebrat active ze všech tlačítek
        leagueSelectorBtns.forEach(b => b.classList.remove('active'))
        return
      }

      // Odebrat active ze všech
      leagueSelectorBtns.forEach(b => b.classList.remove('active'))
      // Přidat active na kliknuté
      btn.classList.add('active')

      // Přepnout views
      if (selectedLeague === 'league') {
        modeSelectionView.style.display = 'none'
        leagueTeamsView.style.display = 'block'
        extraligaTeamsView.style.display = 'none'
      } else if (selectedLeague === 'extraliga') {
        modeSelectionView.style.display = 'none'
        leagueTeamsView.style.display = 'none'
        extraligaTeamsView.style.display = 'block'
      }
    })
  })

  // Trénink - vždy trojice s automatickým střídáním
  trainingButton.addEventListener('click', (e) => {
    e.stopPropagation()
    window.startSimulation('training', null, 3, 'auto')
  })

  // Výběr soupeře - aktivuje tlačítko
  opponentSelect.addEventListener('change', (e) => {
    const selectedTeam = e.target.value
    leagueButton.disabled = !selectedTeam

    if (selectedTeam) {
      leagueButton.dataset.opponent = selectedTeam
    }
  })

  // Ligový zápas - vždy s automatickým střídáním
  leagueButton.addEventListener('click', () => {
    const opponentId = leagueButton.dataset.opponent
    if (opponentId) {
      window.startSimulation('league', opponentId, 3, 'auto')
    }
  })

  // Funkce pro aktualizaci možností v dropdown podle výběru druhého týmu
  const updateExtraligaTeamOptions = () => {
    const team1Value = extraligaTeam1Select.value
    const team2Value = extraligaTeam2Select.value

    // Zakázat vybraný team1 v team2 dropdown
    Array.from(extraligaTeam2Select.options).forEach(option => {
      if (option.value && option.value === team1Value) {
        option.disabled = true
        option.style.display = 'none'
      } else if (option.value) {
        option.disabled = false
        option.style.display = ''
      }
    })

    // Zakázat vybraný team2 v team1 dropdown
    Array.from(extraligaTeam1Select.options).forEach(option => {
      if (option.value && option.value === team2Value) {
        option.disabled = true
        option.style.display = 'none'
      } else if (option.value) {
        option.disabled = false
        option.style.display = ''
      }
    })
  }

  // Výběr extraligových týmů - aktivuje tlačítko když jsou oba vybrané
  const checkExtraligaSelection = () => {
    const team1 = extraligaTeam1Select.value
    const team2 = extraligaTeam2Select.value

    updateExtraligaTeamOptions()

    extraligaButton.disabled = !team1 || !team2

    if (team1 && team2) {
      extraligaButton.dataset.team1 = team1
      extraligaButton.dataset.team2 = team2
    }
  }

  extraligaTeam1Select.addEventListener('change', checkExtraligaSelection)
  extraligaTeam2Select.addEventListener('change', checkExtraligaSelection)

  // Extraligový zápas - vždy s automatickým střídáním
  extraligaButton.addEventListener('click', () => {
    const team1Id = extraligaButton.dataset.team1
    const team2Id = extraligaButton.dataset.team2
    if (team1Id && team2Id) {
      window.startSimulation('extraliga', { team1: team1Id, team2: team2Id }, 3, 'auto')
    }
  })

  // Kliknutí na logo týmu v 1. lize - otevře soupisku týmu
  document.querySelectorAll('#league-teams-view .team-logo-card').forEach(card => {
    card.addEventListener('click', () => {
      const teamId = card.dataset.teamId
      if (teamId && window.navigateToView) {
        // Pro NK Opavu navigovat na hlavní tým view, pro ostatní na team-roster
        if (teamId === 'OPAVA') {
          window.navigateToView('team')
        } else {
          window.navigateToView('team-roster', teamId, false) // false = 1. liga
        }
      }
    })
  })

  // Kliknutí na logo týmu v Extralize - otevře soupisku týmu
  document.querySelectorAll('#extraliga-teams-view .team-logo-card').forEach(card => {
    card.addEventListener('click', () => {
      const teamId = card.dataset.teamId
      if (teamId && window.navigateToView) {
        window.navigateToView('team-roster', teamId, true) // true = extraliga
      }
    })
  })
}
