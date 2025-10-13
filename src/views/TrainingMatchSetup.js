import { players } from '../playerData.js'

// Vytvoření view pro výběr sestavy v tréninkovém režimu
export function createTrainingMatchSetupView(playersPerTeam, substitutionMode) {
  const benchLimit = playersPerTeam === 1 ? 0 : playersPerTeam === 2 ? 1 : 2

  return `
    <div class="league-match-setup">
      <div class="match-info-header">
        <h1>Tréninkový zápas</h1>

        <div class="discipline-selection">
          <label>Disciplína:</label>
          <div class="discipline-buttons">
            <button class="discipline-btn ${playersPerTeam === 3 ? 'active' : ''}" data-players="3">
              Trojice (3 vs 3)
            </button>
            <button class="discipline-btn ${playersPerTeam === 2 ? 'active' : ''}" data-players="2">
              Dvojice (2 vs 2)
            </button>
            <button class="discipline-btn ${playersPerTeam === 1 ? 'active' : ''}" data-players="1">
              Singl (1 vs 1)
            </button>
          </div>
        </div>

        <p class="match-type" id="match-type-description">${playersPerTeam === 1 ? 'Singl' : playersPerTeam === 2 ? 'Dvojice' : 'Trojice'} - ${playersPerTeam} hráči na každé straně</p>
      </div>

      <div class="teams-setup">
        <!-- Tým 1 -->
        <div class="team-setup opava-team">
          <h2 id="team1-name">Tým 1</h2>
          <div class="lineup-bench-container">
            <div class="lineup-section">
              <h3>Základní sestava (<span id="team1-count">0</span>/${playersPerTeam})</h3>
              <div class="lineup-players" id="team1-lineup"></div>
            </div>
            <div class="bench-section" style="${playersPerTeam === 1 ? 'display: none;' : ''}">
              <h3>Lavička (<span id="team1-bench-count">0</span>/${benchLimit})</h3>
              <div class="bench-players" id="team1-bench"></div>
            </div>
          </div>
          <div class="available-section">
            <h3>Dostupní hráči</h3>
            <div class="available-players" id="team1-available"></div>
          </div>
        </div>

        <!-- Tým 2 -->
        <div class="team-setup opponent-team">
          <h2 id="team2-name">Tým 2</h2>
          <div class="lineup-bench-container">
            <div class="lineup-section">
              <h3>Základní sestava (<span id="team2-count">0</span>/${playersPerTeam})</h3>
              <div class="lineup-players" id="team2-lineup"></div>
            </div>
            <div class="bench-section" style="${playersPerTeam === 1 ? 'display: none;' : ''}">
              <h3>Lavička (<span id="team2-bench-count">0</span>/${benchLimit})</h3>
              <div class="bench-players" id="team2-bench"></div>
            </div>
          </div>
          <div class="available-section">
            <h3>Dostupní hráči</h3>
            <div class="available-players" id="team2-available"></div>
          </div>
        </div>
      </div>

      <div class="coach-mode-selection">
        <h3>⚙️ Nastavení trenéra</h3>
        <p class="coach-mode-description">Určete, jak aktivní bude trenér během zápasu</p>
        <div class="coach-mode-options">
          <label class="coach-mode-option">
            <input type="radio" name="coach-mode" value="passive" />
            <div class="coach-mode-card">
              <div class="coach-mode-icon">😴</div>
              <h4>Pasivní trenér</h4>
              <p>Střídání probíhá manuálně. Trenér pouze komentuje situace, ale nekoná.</p>
            </div>
          </label>
          <label class="coach-mode-option">
            <input type="radio" name="coach-mode" value="active" checked />
            <div class="coach-mode-card">
              <div class="coach-mode-icon">👔</div>
              <h4>Aktivní trenér</h4>
              <p>Trenér automaticky střídá hráče podle jejich výkonu.</p>
            </div>
          </label>
          <label class="coach-mode-option">
            <input type="radio" name="coach-mode" value="hyperactive" />
            <div class="coach-mode-card">
              <div class="coach-mode-icon">🔥</div>
              <h4>Hyperaktivní trenér</h4>
              <p>Vyberte 4 konkrétní dovednosti pro každého hráče + automatické střídání.</p>
            </div>
          </label>
        </div>
      </div>

      <div class="setup-actions">
        <button class="confirm-lineup-btn" disabled>Potvrdit sestavy a začít zápas</button>
      </div>
    </div>
  `
}

// Vykreslení karty hráče - EA FC style stejně jako v LeagueMatchSetup
function renderPlayerCard(player, status, grayed = false) {
  const rating = calculatePlayerRating(player)
  const displayStats = player.stats || {}

  const statusBadge = status === 'lineup' ? '<div class="setup-status-badge lineup-badge">✓ V SESTAVĚ</div>' :
                      status === 'bench' ? '<div class="setup-status-badge bench-badge">↓ LAVIČKA</div>' : ''

  return `
    <div class="setup-hexagon-card opava-card ${grayed ? 'grayed-out' : ''} ${status === 'available' ? 'available' : ''}"
         data-player-id="${player.id}"
         ${status !== 'available' ? `data-status="${status}"` : ''}
         ${!grayed ? 'draggable="true"' : ''}>
      <div class="setup-player-image">
        <img src="${player.photo || '/players/default.jpg'}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number || '?'}%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="setup-card-badge">
        <div class="setup-card-badge-rating">${rating}</div>
      </div>
      <div class="setup-player-number">${player.number || ''}</div>
      <div class="setup-player-info">
        <h3 class="setup-player-name">${player.name}</h3>
        <p class="setup-player-position">${player.position || 'Univerzál'}</p>
        <div class="setup-player-stats-mini">
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.rychlost || '-'}</span><span class="setup-stat-label">Rychlost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obratnost || '-'}</span><span class="setup-stat-label">Obratnost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.rana || '-'}</span><span class="setup-stat-label">Rána</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.technika || '-'}</span><span class="setup-stat-label">Technika</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obetavost || '-'}</span><span class="setup-stat-label">Obětavost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.psychickaOdolnost || '-'}</span><span class="setup-stat-label">Psychická odolnost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obrana || '-'}</span><span class="setup-stat-label">Obrana</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.cteniHry || '-'}</span><span class="setup-stat-label">Čtení hry</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.vydrz || '-'}</span><span class="setup-stat-label">Výdrž</span></div>
        </div>
      </div>
      ${statusBadge}
    </div>
  `
}

// Pomocná funkce pro výpočet ratingu hráče
function calculatePlayerRating(player) {
  if (!player.stats) {
    return 'N/A'
  }
  const stats = player.stats
  const avg = Object.values(stats).reduce((sum, val) => sum + val, 0) / Object.keys(stats).length
  return Math.round(avg)
}

// Inicializace stavu
export function initializeTrainingSetup(playersPerTeam, substitutionMode, state) {
  // Filtrovat trenéry - oba týmy používají stejný pool hráčů Opavy
  const availablePlayers = players.filter(p => !p.coachQuotes)

  // Inicializovat seznamy hráčů (oba týmy sdílí stejný pool)
  state.team1Lineup = []
  state.team1Bench = []
  state.team1SubstitutionMode = substitutionMode

  state.team2Lineup = []
  state.team2Bench = []
  state.team2SubstitutionMode = substitutionMode

  state.allPlayers = availablePlayers

  // Vykreslit dostupné hráče
  renderAvailablePlayers('team1', state, playersPerTeam)
  renderAvailablePlayers('team2', state, playersPerTeam)

  // Aktualizovat počty a názvy týmů
  updateTeamNames(state)
  updateCounts(playersPerTeam, state)
}

// Vykreslení dostupných hráčů s gray-out logikou
function renderAvailablePlayers(team, state, playersPerTeam) {
  const container = document.getElementById(`${team}-available`)
  if (!container) return

  const otherTeam = team === 'team1' ? 'team2' : 'team1'
  const otherLineup = state[`${otherTeam}Lineup`]
  const otherBench = state[`${otherTeam}Bench`]
  const otherPlayerIds = [...otherLineup, ...otherBench].map(p => p.id)

  // Vyfiltrovat hráče, kteří jsou již v aktuálním týmu
  const currentLineup = state[`${team}Lineup`]
  const currentBench = state[`${team}Bench`]
  const currentPlayerIds = [...currentLineup, ...currentBench].map(p => p.id)

  const html = state.allPlayers
    .filter(p => !currentPlayerIds.includes(p.id))
    .map(p => {
      const isGrayed = otherPlayerIds.includes(p.id)
      return renderPlayerCard(p, 'available', isGrayed)
    }).join('')

  container.innerHTML = html
}

// Vykreslení sestavy nebo lavičky
function renderLineupOrBench(team, status, state, playersPerTeam) {
  const container = team === 'team1'
    ? document.getElementById(`team1-${status}`)
    : document.getElementById(`team2-${status}`)

  if (!container) return

  const listKey = `${team}${status.charAt(0).toUpperCase() + status.slice(1)}`
  const html = state[listKey].map(p => renderPlayerCard(p, status, false)).join('')
  container.innerHTML = html
}

// Aktualizace počtů
function updateCounts(playersPerTeam, state) {
  const benchLimit = playersPerTeam === 1 ? 0 : playersPerTeam === 2 ? 1 : 2

  // Team 1
  const team1CountSpan = document.getElementById('team1-count')
  if (team1CountSpan) {
    team1CountSpan.textContent = state.team1Lineup.length
  }

  const team1BenchCountSpan = document.getElementById('team1-bench-count')
  if (team1BenchCountSpan) {
    team1BenchCountSpan.textContent = state.team1Bench.length
  }

  // Team 2
  const team2CountSpan = document.getElementById('team2-count')
  if (team2CountSpan) {
    team2CountSpan.textContent = state.team2Lineup.length
  }

  const team2BenchCountSpan = document.getElementById('team2-bench-count')
  if (team2BenchCountSpan) {
    team2BenchCountSpan.textContent = state.team2Bench.length
  }

  // Kontrola, zda můžeme začít
  const confirmBtn = document.querySelector('.confirm-lineup-btn')
  if (confirmBtn) {
    const canStart = state.team1Lineup.length === playersPerTeam && state.team2Lineup.length === playersPerTeam
    confirmBtn.disabled = !canStart
  }
}

// Aktualizace názvů týmů podle prvního hráče
function updateTeamNames(state) {
  const team1Name = document.getElementById('team1-name')
  const team2Name = document.getElementById('team2-name')

  if (team1Name) {
    if (state.team1Lineup.length > 0) {
      const firstName = state.team1Lineup[0].name.split(' ')[0]
      team1Name.textContent = `${firstName}ův výběr`
    } else {
      team1Name.textContent = 'Tým 1'
    }
  }

  if (team2Name) {
    if (state.team2Lineup.length > 0) {
      const firstName = state.team2Lineup[0].name.split(' ')[0]
      team2Name.textContent = `${firstName}ův výběr`
    } else {
      team2Name.textContent = 'Tým 2'
    }
  }
}

// Upravit sestavy při změně disciplíny
function adjustLineupForNewDiscipline(state, newPlayersPerTeam, newBenchLimit) {
  // Pro oba týmy
  for (const team of ['team1', 'team2']) {
    const lineupKey = `${team}Lineup`
    const benchKey = `${team}Bench`

    // Pokud je v sestavě více hráčů než nový limit, přesunout přebytečné na lavičku nebo do available
    if (state[lineupKey].length > newPlayersPerTeam) {
      const excess = state[lineupKey].splice(newPlayersPerTeam)

      // Pokud existuje lavička a není plná, přesunout tam
      if (newBenchLimit > 0) {
        const canFitInBench = newBenchLimit - state[benchKey].length
        if (canFitInBench > 0) {
          state[benchKey].push(...excess.splice(0, canFitInBench))
        }
      }
      // Zbytek (nebo vše pokud není lavička) zůstane v available (= nebudou v žádném seznamu)
    }

    // Pokud je na lavičce více hráčů než nový limit, přebytečné do available
    if (state[benchKey].length > newBenchLimit) {
      state[benchKey].splice(newBenchLimit)
    }

    // Pokud je lavička zakázána (singl), přesunout všechny z lavičky do available
    if (newBenchLimit === 0 && state[benchKey].length > 0) {
      state[benchKey] = []
    }
  }

  // Aktualizovat zobrazení benchLimit v nadpisech
  updateLineupHeaders(newPlayersPerTeam, newBenchLimit)
}

// Aktualizovat nadpisy s počty míst
function updateLineupHeaders(playersPerTeam, benchLimit) {
  // Team 1
  const team1LineupHeader = document.querySelector('#team1-lineup')?.previousElementSibling
  if (team1LineupHeader) {
    team1LineupHeader.innerHTML = `Základní sestava (<span id="team1-count">0</span>/${playersPerTeam})`
  }

  const team1BenchHeader = document.querySelector('#team1-bench')?.previousElementSibling
  if (team1BenchHeader) {
    team1BenchHeader.innerHTML = `Lavička (<span id="team1-bench-count">0</span>/${benchLimit})`
  }

  // Team 2
  const team2LineupHeader = document.querySelector('#team2-lineup')?.previousElementSibling
  if (team2LineupHeader) {
    team2LineupHeader.innerHTML = `Základní sestava (<span id="team2-count">0</span>/${playersPerTeam})`
  }

  const team2BenchHeader = document.querySelector('#team2-bench')?.previousElementSibling
  if (team2BenchHeader) {
    team2BenchHeader.innerHTML = `Lavička (<span id="team2-bench-count">0</span>/${benchLimit})`
  }

  // Skrýt/zobrazit lavičku podle disciplíny
  document.querySelectorAll('.bench-section').forEach(section => {
    section.style.display = benchLimit === 0 ? 'none' : 'block'
  })
}

// Setup handlers pro drag & drop a klikání
export function setupTrainingMatchSetupHandlers(playersPerTeam, substitutionMode, onConfirm) {
  let currentPlayersPerTeam = playersPerTeam
  let benchLimit = playersPerTeam === 1 ? 0 : playersPerTeam === 2 ? 1 : 2

  const state = {
    team1Lineup: [],
    team1Bench: [],
    team1SubstitutionMode: substitutionMode,
    team2Lineup: [],
    team2Bench: [],
    team2SubstitutionMode: substitutionMode,
    allPlayers: [],
    coachMode: 'active' // 'passive', 'active', 'hyperactive'
  }

  // Inicializovat state
  initializeTrainingSetup(currentPlayersPerTeam, substitutionMode, state)

  // Handler pro změnu režimu trenéra
  const coachModeRadios = document.querySelectorAll('input[name="coach-mode"]')
  coachModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.coachMode = e.target.value
      console.log('Coach mode changed to:', state.coachMode)
    })
  })

  // Handler pro změnu disciplíny
  document.querySelectorAll('.discipline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Odebrat active ze všech tlačítek
      document.querySelectorAll('.discipline-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      // Aktualizovat počet hráčů
      currentPlayersPerTeam = parseInt(btn.dataset.players)
      benchLimit = currentPlayersPerTeam === 1 ? 0 : currentPlayersPerTeam === 2 ? 1 : 2

      // Aktualizovat popisek
      const disciplineName = currentPlayersPerTeam === 1 ? 'Singl' : currentPlayersPerTeam === 2 ? 'Dvojice' : 'Trojice'
      document.getElementById('match-type-description').textContent = `${disciplineName} - ${currentPlayersPerTeam} hráči na každé straně`

      // Přesunout hráče, kteří se nevejdou, zpět do available
      adjustLineupForNewDiscipline(state, currentPlayersPerTeam, benchLimit)

      // Překreslit vše
      renderAll(state, currentPlayersPerTeam)
    })
  })

  // Střídání je vždy automatické (trenér)
  state.team1SubstitutionMode = 'auto'
  state.team2SubstitutionMode = 'auto'

  let draggedElement = null

  // Drag start
  document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('setup-hexagon-card') && !e.target.classList.contains('grayed-out')) {
      draggedElement = e.target
      e.target.style.opacity = '0.5'
    }
  })

  // Drag end
  document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('setup-hexagon-card')) {
      e.target.style.opacity = '1'
    }
  })

  // Drag over - musí povolit drop na lineup i bench kontejnery
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
    const dropZone = e.target.closest('.lineup-players, .bench-players, .available-players')
    if (dropZone) {
      dropZone.classList.add('drag-over')
    }
  })

  // Drag leave
  document.addEventListener('dragleave', (e) => {
    const dropZone = e.target.closest('.lineup-players, .bench-players, .available-players')
    if (dropZone && !dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over')
    }
  })

  // Drop
  document.addEventListener('drop', (e) => {
    e.preventDefault()
    const zone = e.target.closest('.lineup-players, .bench-players, .available-players')
    if (zone) {
      zone.classList.remove('drag-over')
    }

    if (!draggedElement || draggedElement.classList.contains('grayed-out')) return

    const playerId = parseInt(draggedElement.dataset.playerId)
    const targetZone = e.target.closest('.lineup-players, .bench-players, .available-players')

    if (!targetZone) return

    movePlayerToZone(playerId, targetZone, state, playersPerTeam, benchLimit)
    draggedElement = null
  })

  // Klikání na karty
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.setup-hexagon-card')
    if (!card || card.classList.contains('grayed-out')) return

    const playerId = parseInt(card.dataset.playerId)
    const currentZone = card.closest('.lineup-players, .bench-players, .available-players')

    if (!currentZone) return

    // Určit tým z ID kontejneru
    let currentTeam = null
    if (currentZone.id && currentZone.id.includes('team1')) {
      currentTeam = 'team1'
    } else if (currentZone.id && currentZone.id.includes('team2')) {
      currentTeam = 'team2'
    }

    if (!currentTeam) {
      console.error('Nepodařilo se určit tým z zóny:', currentZone)
      return
    }

    // Z available -> lineup (nebo bench pokud je lineup plný)
    if (currentZone.classList.contains('available-players')) {
      const lineupCount = state[`${currentTeam}Lineup`].length
      const benchCount = state[`${currentTeam}Bench`].length

      // Pokud je lineup plný, dát na lavičku
      if (lineupCount >= playersPerTeam && benchLimit > 0 && benchCount < benchLimit) {
        const benchZone = document.getElementById(`${currentTeam}-bench`)
        if (benchZone) {
          movePlayerToZone(playerId, benchZone, state, playersPerTeam, benchLimit)
        }
      }
      // Jinak dát do lineup
      else if (lineupCount < playersPerTeam) {
        const lineupZone = document.getElementById(`${currentTeam}-lineup`)
        if (lineupZone) {
          movePlayerToZone(playerId, lineupZone, state, playersPerTeam, benchLimit)
        }
      }
      // Pokud je vše plné, nic nedělat (můžeme přidat vizuální feedback)
    }
    // Z lineup -> bench nebo zpět do available
    else if (currentZone.classList.contains('lineup-players')) {
      if (benchLimit > 0) {
        const benchZone = document.getElementById(`${currentTeam}-bench`)
        if (benchZone) {
          movePlayerToZone(playerId, benchZone, state, playersPerTeam, benchLimit)
        }
      } else {
        const availableZone = document.getElementById(`${currentTeam}-available`)
        if (availableZone) {
          movePlayerToZone(playerId, availableZone, state, playersPerTeam, benchLimit)
        }
      }
    }
    // Z bench -> available
    else if (currentZone.classList.contains('bench-players')) {
      const availableZone = document.getElementById(`${currentTeam}-available`)
      if (availableZone) {
        movePlayerToZone(playerId, availableZone, state, playersPerTeam, benchLimit)
      }
    }
  })

  // Confirm button
  document.querySelector('.confirm-lineup-btn')?.addEventListener('click', async () => {
    // Pro hyperaktivní režim nejdříve otevřít dialog pro výběr dovedností
    if (state.coachMode === 'hyperactive') {
      const success = await showSkillSelectionDialog(state.team1Lineup, state.team2Lineup)
      if (!success) return // Uživatel zrušil
    }

    // Předat režim trenéra do callback
    onConfirm(state.team1Lineup, state.team1Bench, state.team2Lineup, state.team2Bench, currentPlayersPerTeam, state.coachMode)
  })

  // Helper funkce pro přesun hráče
  function movePlayerToZone(playerId, targetZone, state, playersPerTeam, benchLimit) {
    // Najít hráče a odkud pochází
    const player = state.allPlayers.find(p => p.id === playerId)
    if (!player) return

    let sourceTeam = null
    let sourceList = null

    // Najít hráče v team1
    if (state.team1Lineup.find(p => p.id === playerId)) {
      sourceTeam = 'team1'
      sourceList = 'lineup'
      state.team1Lineup = state.team1Lineup.filter(p => p.id !== playerId)
    } else if (state.team1Bench.find(p => p.id === playerId)) {
      sourceTeam = 'team1'
      sourceList = 'bench'
      state.team1Bench = state.team1Bench.filter(p => p.id !== playerId)
    }
    // Najít hráče v team2
    else if (state.team2Lineup.find(p => p.id === playerId)) {
      sourceTeam = 'team2'
      sourceList = 'lineup'
      state.team2Lineup = state.team2Lineup.filter(p => p.id !== playerId)
    } else if (state.team2Bench.find(p => p.id === playerId)) {
      sourceTeam = 'team2'
      sourceList = 'bench'
      state.team2Bench = state.team2Bench.filter(p => p.id !== playerId)
    }

    // Určit cílový tým a status
    let targetTeam = null
    let targetStatus = null

    if (targetZone.id.includes('team1')) {
      targetTeam = 'team1'
    } else if (targetZone.id.includes('team2')) {
      targetTeam = 'team2'
    }

    if (targetZone.classList.contains('lineup-players')) {
      targetStatus = 'lineup'
    } else if (targetZone.classList.contains('bench-players')) {
      targetStatus = 'bench'
    } else if (targetZone.classList.contains('available-players')) {
      targetStatus = 'available'
    }

    // Kontrola - hráč nesmí být v obou týmech
    if (targetStatus !== 'available') {
      const otherTeam = targetTeam === 'team1' ? 'team2' : 'team1'
      const inOtherTeam = [...state[`${otherTeam}Lineup`], ...state[`${otherTeam}Bench`]].find(p => p.id === playerId)

      if (inOtherTeam) {
        // Vrátit hráče zpět
        if (sourceTeam && sourceList) {
          if (sourceList === 'lineup') {
            state[`${sourceTeam}Lineup`].push(player)
          } else if (sourceList === 'bench') {
            state[`${sourceTeam}Bench`].push(player)
          }
        }
        renderAll(state, playersPerTeam)
        return
      }
    }

    // Přidat do cíle s kontrolou limitů
    if (targetStatus === 'lineup') {
      if (state[`${targetTeam}Lineup`].length < playersPerTeam) {
        state[`${targetTeam}Lineup`].push(player)
      } else {
        // Lineup plný - vrátit zpět
        if (sourceTeam && sourceList === 'lineup') {
          state[`${sourceTeam}Lineup`].push(player)
        } else if (sourceTeam && sourceList === 'bench') {
          state[`${sourceTeam}Bench`].push(player)
        }
        renderAll(state, playersPerTeam)
        return
      }
    } else if (targetStatus === 'bench') {
      if (state[`${targetTeam}Bench`].length < benchLimit) {
        state[`${targetTeam}Bench`].push(player)
      } else {
        // Bench plný - vrátit zpět
        if (sourceTeam && sourceList === 'lineup') {
          state[`${sourceTeam}Lineup`].push(player)
        } else if (sourceTeam && sourceList === 'bench') {
          state[`${sourceTeam}Bench`].push(player)
        }
        renderAll(state, playersPerTeam)
        return
      }
    }
    // targetStatus === 'available' -> hráč se jen odebere ze seznamů (už jsme to udělali)

    // Překreslit vše
    renderAll(state, playersPerTeam)
  }

  function renderAll(state, playersPerTeam) {
    renderAvailablePlayers('team1', state, playersPerTeam)
    renderAvailablePlayers('team2', state, playersPerTeam)
    renderLineupOrBench('team1', 'lineup', state, playersPerTeam)
    renderLineupOrBench('team1', 'bench', state, playersPerTeam)
    renderLineupOrBench('team2', 'lineup', state, playersPerTeam)
    renderLineupOrBench('team2', 'bench', state, playersPerTeam)
    updateCounts(playersPerTeam, state)
    updateTeamNames(state)
  }
}

// Dialog pro výběr dovedností v hyperaktivním režimu
async function showSkillSelectionDialog(team1Lineup, team2Lineup) {
  return new Promise((resolve) => {
    // Import skills z playerData
    import('../playerData.js').then(({ skills }) => {
      // Obranné a útočné dovednosti
      const defensiveSkills = [12, 13, 14] // Blok, Skluz, Levá noha
      const offensiveSkills = [1, 2, 3, 5, 6, 7, 8, 9, 10]

      const allPlayers = [...team1Lineup, ...team2Lineup]

      // Vytvořit modal dialog
      const modal = document.createElement('div')
      modal.className = 'skill-selection-modal'
      modal.innerHTML = `
        <div class="skill-selection-content">
          <h2>Hyperaktivní trenér - Výběr dovedností</h2>
          <p class="skill-selection-instructions">Pro každého hráče vyberte 4 dovednosti: 1 obrannou, 2 útočné a 1 ultimate</p>

          <div class="players-skill-selection">
            ${allPlayers.map(player => {
              // Ultimate dovednosti - všechny kromě speciálních (4, 11)
              const ultimateSkills = [...defensiveSkills, ...offensiveSkills.filter(s => s !== 4 && s !== 11)]

              return `
                <div class="player-skill-card" data-player-id="${player.id}">
                  <div class="player-skill-header">
                    <img src="${player.photo || '/players/default.jpg'}" alt="${player.name}" class="player-skill-photo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number || '?'}%3C/text%3E%3C/svg%3E'" />
                    <h3>${player.name}</h3>
                  </div>

                  <div class="skill-category">
                    <h4>Obranná dovednost (vyber 1):</h4>
                    <div class="skill-options defensive-skills" data-player-id="${player.id}">
                      ${defensiveSkills.map(skillId => `
                        <label class="skill-option">
                          <input type="radio" name="defensive-${player.id}" value="${skillId}" />
                          <span class="skill-name">${skills[skillId].name}</span>
                        </label>
                      `).join('')}
                    </div>
                  </div>

                  <div class="skill-category">
                    <h4>Útočné dovednosti (vyber 2):</h4>
                    <div class="skill-options offensive-skills" data-player-id="${player.id}">
                      ${offensiveSkills.map(skillId => `
                        <label class="skill-option">
                          <input type="checkbox" name="offensive-${player.id}" value="${skillId}" />
                          <span class="skill-name">${skills[skillId].name}</span>
                        </label>
                      `).join('')}
                    </div>
                  </div>

                  <div class="skill-category">
                    <h4>Ultimate dovednost (vyber 1):</h4>
                    <div class="skill-options ultimate-skills" data-player-id="${player.id}">
                      ${ultimateSkills.map(skillId => `
                        <label class="skill-option">
                          <input type="radio" name="ultimate-${player.id}" value="${skillId}" />
                          <span class="skill-name">${skills[skillId].name}</span>
                        </label>
                      `).join('')}
                    </div>
                  </div>

                  <div class="player-skill-status" data-player-id="${player.id}">
                    ⚠️ Vyberte všechny dovednosti
                  </div>
                </div>
              `
            }).join('')}
          </div>

          <div class="skill-selection-actions">
            <button class="skill-selection-cancel">Zrušit</button>
            <button class="skill-selection-confirm" disabled>Potvrdit a začít zápas</button>
          </div>
        </div>
      `

      document.body.appendChild(modal)

      // Validace výběru dovedností
      function validatePlayerSkills(playerId) {
        const defensiveSelected = document.querySelector(`input[name="defensive-${playerId}"]:checked`)
        const offensiveCheckboxes = document.querySelectorAll(`input[name="offensive-${playerId}"]:checked`)
        const ultimateSelected = document.querySelector(`input[name="ultimate-${playerId}"]:checked`)

        const isValid = defensiveSelected && offensiveCheckboxes.length === 2 && ultimateSelected

        const statusDiv = document.querySelector(`.player-skill-status[data-player-id="${playerId}"]`)
        if (statusDiv) {
          if (isValid) {
            statusDiv.innerHTML = '✅ Dovednosti vybrány'
            statusDiv.classList.add('valid')
          } else {
            statusDiv.innerHTML = '⚠️ Vyberte všechny dovednosti'
            statusDiv.classList.remove('valid')
          }
        }

        return isValid
      }

      // Validace všech hráčů
      function validateAllPlayers() {
        const allValid = allPlayers.every(p => validatePlayerSkills(p.id))
        const confirmBtn = modal.querySelector('.skill-selection-confirm')
        if (confirmBtn) {
          confirmBtn.disabled = !allValid
        }
        return allValid
      }

      // Omezit výběr útočných dovedností na max 2
      modal.querySelectorAll('.offensive-skills').forEach(container => {
        const playerId = container.dataset.playerId
        const checkboxes = container.querySelectorAll('input[type="checkbox"]')

        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', () => {
            const checked = container.querySelectorAll('input[type="checkbox"]:checked')
            if (checked.length > 2) {
              checkbox.checked = false
            }
            validateAllPlayers()
          })
        })
      })

      // Event listeners pro validaci
      modal.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
          validateAllPlayers()
        })
      })

      // Cancel button
      modal.querySelector('.skill-selection-cancel').addEventListener('click', () => {
        modal.remove()
        resolve(false)
      })

      // Confirm button
      modal.querySelector('.skill-selection-confirm').addEventListener('click', () => {
        // Uložit vybrané dovednosti do player objektů
        allPlayers.forEach(player => {
          const defensive = parseInt(document.querySelector(`input[name="defensive-${player.id}"]:checked`).value)
          const offensiveCheckboxes = document.querySelectorAll(`input[name="offensive-${player.id}"]:checked`)
          const offensive1 = parseInt(offensiveCheckboxes[0].value)
          const offensive2 = parseInt(offensiveCheckboxes[1].value)
          const ultimate = parseInt(document.querySelector(`input[name="ultimate-${player.id}"]:checked`).value)

          player.assignedSkills = [defensive, offensive1, offensive2, ultimate]
          player.ultimateSkill = ultimate
        })

        modal.remove()
        resolve(true)
      })

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove()
          resolve(false)
        }
      })
    })
  })
}
