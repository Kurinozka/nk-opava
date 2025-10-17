import { players } from '../playerData.js'
import { getTeamWithStats } from '../leagueTeams.js'
import teamLineups from '../teamLineups.json'
import { getTeamColors } from '../teamColors.js'

export function createLeagueMatchSetupView(matchInfo, opponentTeamId, substitutionMode = 'auto') {
  const opponentTeam = getTeamWithStats(opponentTeamId)

  // Určit počet hráčů na základě typu zápasu
  let playersPerTeam = 2 // default pro dvojice
  let matchTypeLabel = 'Dvojice'

  // Detekce typu podle začátku názvu
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
        <!-- Tým Opava -->
        <div class="team-setup opava-team">
          <h2>NK Opava</h2>
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

        <!-- Soupeř -->
        <div class="team-setup opponent-team">
          <h2>${opponentTeam.shortName}</h2>
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

export function setupLeagueMatchSetupHandlers(matchInfo, opponentTeamId, onConfirm) {
  // Určit počet hráčů podle typu zápasu
  let playersPerTeam = 2
  if (matchInfo.type.startsWith('trojice')) playersPerTeam = 3
  else if (matchInfo.type === 'singl') playersPerTeam = 1
  else if (matchInfo.type.startsWith('dvojice')) playersPerTeam = 2

  // Použít hráče z globálního state (pokud existuje) nebo načíst z dat
  let opavaPlayersWithoutCoach, opponentPlayersWithoutCoach, opponentTeam, state

  if (window.leagueSetupState) {
    // Pro extraligu nebo když je state už inicializovaný
    state = window.leagueSetupState.state
    opavaPlayersWithoutCoach = window.leagueSetupState.opavaPlayers.filter(p => !p.coachQuotes)
    opponentPlayersWithoutCoach = window.leagueSetupState.opponentPlayers.filter(p => !p.coachQuotes)
    opponentTeam = { players: window.leagueSetupState.opponentPlayers }
  } else {
    // Pro běžné ligové zápasy
    opponentTeam = getTeamWithStats(opponentTeamId)

    state = {
      opavaLineup: [],
      opavaBench: [],
      opponentLineup: [],
      opponentBench: [],
      coachMode: 'active'
    }

    opavaPlayersWithoutCoach = players.filter(p => p.id !== 11)
    opponentPlayersWithoutCoach = opponentTeam.players.filter(p => !p.coachQuotes)
  }

  // Automaticky předvyplnit sestavy na základě typických pozic
  // Pro extraligu i ligu předvyplnit oba týmy
  const isExtraliga = window.leagueSetupState !== null && window.leagueSetupState !== undefined

  if (isExtraliga) {
    // Extraliga - předvyplnit oba týmy
    const team1Data = { players: opavaPlayersWithoutCoach }
    autofillTeamLineup(team1Data, matchInfo, state, playersPerTeam, 'opava')
    autofillTeamLineup(opponentTeam, matchInfo, state, playersPerTeam, 'opponent')
  } else {
    // Liga - předvyplnit oba týmy (Opava + soupeř)
    const opavaTeamData = { players: opavaPlayersWithoutCoach }
    autofillTeamLineup(opavaTeamData, matchInfo, state, playersPerTeam, 'opava')
    autofillTeamLineup(opponentTeam, matchInfo, state, playersPerTeam, 'opponent')
  }

  // Renderovat výběr hráčů
  renderTeamSelection('opava', opavaPlayersWithoutCoach, state, playersPerTeam, null)
  renderTeamSelection('opponent', opponentPlayersWithoutCoach, state, playersPerTeam, opponentTeamId)

  // Event listenery pro režim trenéra
  const coachModeBtns = document.querySelectorAll('.coach-mode-btn')
  coachModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Odebrat active ze všech tlačítek
      coachModeBtns.forEach(b => b.classList.remove('active'))
      // Přidat active na kliknuté
      btn.classList.add('active')
      // Uložit režim
      state.coachMode = btn.dataset.mode
      console.log('Coach mode changed to:', state.coachMode)
    })
  })

  // Tlačítko pro potvrzení
  const confirmBtn = document.querySelector('.confirm-lineup-btn')
  confirmBtn.addEventListener('click', async () => {
    if (state.opavaLineup.length === playersPerTeam && state.opponentLineup.length === playersPerTeam) {
      // Pro hyperaktivní režim nejdříve otevřít dialog pro výběr dovedností
      if (state.coachMode === 'hyperactive') {
        const success = await showSkillSelectionDialog(
          state.opavaLineup,
          state.opavaBench,
          state.opponentLineup,
          state.opponentBench
        )
        if (!success) return // Uživatel zrušil
      }

      // Předat režim trenéra do callback
      onConfirm(state.opavaLineup, state.opavaBench, state.opponentLineup, state.opponentBench, playersPerTeam, state.coachMode)
    }
  })

  // Aktualizovat stav tlačítka
  updateConfirmButton(state, playersPerTeam)

  // Nastavit drag-and-drop
  setupDragAndDrop(state, playersPerTeam, opavaPlayersWithoutCoach, opponentPlayersWithoutCoach)
}

// Globální proměnná pro přetahovaný prvek
let draggedElement = null

function setupDragAndDrop(state, playersPerTeam, opavaPlayers, opponentPlayers) {
  // Dragstart - začátek přetahování
  document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('setup-hexagon-card')) {
      draggedElement = e.target
      e.target.style.opacity = '0.5'
      e.dataTransfer.effectAllowed = 'move'
    }
  })

  // Dragend - konec přetahování
  document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('setup-hexagon-card')) {
      e.target.style.opacity = '1'
      draggedElement = null
    }
  })

  // Dragover - povolení drop
  const dropZones = [
    '#opava-lineup', '#opava-bench', '#opava-available',
    '#opponent-lineup', '#opponent-bench', '#opponent-available'
  ]

  dropZones.forEach(selector => {
    const zone = document.querySelector(selector)
    if (!zone) return

    zone.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      zone.classList.add('drag-over')
    })

    zone.addEventListener('dragleave', (e) => {
      zone.classList.remove('drag-over')
    })

    zone.addEventListener('drop', (e) => {
      e.preventDefault()
      zone.classList.remove('drag-over')

      if (!draggedElement) return

      const playerId = draggedElement.dataset.playerId
      const sourceTeam = draggedElement.dataset.team
      const sourceStatus = draggedElement.dataset.status

      // Určit cílovou zónu
      const targetZoneId = zone.id
      let targetTeam, targetStatus

      if (targetZoneId.includes('opava')) targetTeam = 'opava'
      else if (targetZoneId.includes('opponent')) targetTeam = 'opponent'

      if (targetZoneId.includes('lineup')) targetStatus = 'lineup'
      else if (targetZoneId.includes('bench')) targetStatus = 'bench'
      else if (targetZoneId.includes('available')) targetStatus = 'available'

      // Nelze přesouvat mezi týmy
      if (sourceTeam !== targetTeam) return

      // Přesunout hráče
      movePlayer(state, sourceTeam, playerId, sourceStatus, targetStatus, playersPerTeam, opavaPlayers, opponentPlayers)
    })
  })

  // Přidat click handler pro přidání/odebrání hráčů
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.setup-hexagon-card')
    if (!card) return

    const playerId = card.dataset.playerId
    const team = card.dataset.team
    const status = card.dataset.status

    // Klik na hráče v sestavě = vrátit do dostupných
    if (status === 'lineup') {
      movePlayer(state, team, playerId, 'lineup', 'available', playersPerTeam, opavaPlayers, opponentPlayers)
    }
    // Klik na hráče na lavičce = vrátit do dostupných
    else if (status === 'bench') {
      movePlayer(state, team, playerId, 'bench', 'available', playersPerTeam, opavaPlayers, opponentPlayers)
    }
    // Klik na dostupného hráče = přidat do sestavy (nebo lavičky pokud je sestava plná)
    else if (card.classList.contains('available')) {
      const lineupKey = team === 'opava' ? 'opavaLineup' : 'opponentLineup'
      if (state[lineupKey].length < playersPerTeam) {
        movePlayer(state, team, playerId, 'available', 'lineup', playersPerTeam, opavaPlayers, opponentPlayers)
      } else {
        movePlayer(state, team, playerId, 'available', 'bench', playersPerTeam, opavaPlayers, opponentPlayers)
      }
    }
  })
}

function movePlayer(state, team, playerId, fromStatus, toStatus, playersPerTeam, opavaPlayers, opponentPlayers) {
  const allPlayers = team === 'opava' ? opavaPlayers : opponentPlayers
  const player = allPlayers.find(p => String(p.id) === String(playerId))
  if (!player) return

  const lineupKey = team === 'opava' ? 'opavaLineup' : 'opponentLineup'
  const benchKey = team === 'opava' ? 'opavaBench' : 'opponentBench'

  // Odstranit ze zdrojové pozice
  if (fromStatus === 'lineup') {
    state[lineupKey] = state[lineupKey].filter(p => String(p.id) !== String(playerId))
  } else if (fromStatus === 'bench') {
    state[benchKey] = state[benchKey].filter(p => String(p.id) !== String(playerId))
  }

  // Určit limit lavičky: singl 0, dvojice 1, trojice 2
  const benchLimit = playersPerTeam === 1 ? 0 : playersPerTeam === 2 ? 1 : 2

  // Přidat do cílové pozice
  if (toStatus === 'lineup') {
    if (state[lineupKey].length < playersPerTeam) {
      state[lineupKey].push(player)
    } else {
      // Pokud je sestava plná, vrátit zpět
      if (fromStatus === 'lineup') state[lineupKey].push(player)
      else if (fromStatus === 'bench') state[benchKey].push(player)
      return
    }
  } else if (toStatus === 'bench') {
    if (state[benchKey].length < benchLimit) {
      state[benchKey].push(player)
    } else {
      // Pokud je lavička plná, vrátit zpět
      if (fromStatus === 'lineup') state[lineupKey].push(player)
      else if (fromStatus === 'bench') state[benchKey].push(player)
      return
    }
  }
  // Pro 'available' nic nedělat - hráč zůstane dostupný

  // Re-render
  renderTeamSelection(team, allPlayers, state, playersPerTeam, team === 'opponent' ? (window.leagueSetupState ? window.leagueSetupState.opponentTeamId : null) : null)
  updateConfirmButton(state, playersPerTeam)
}

function autofillTeamLineup(team, matchInfo, state, playersPerTeam, teamKey) {
  const matchType = matchInfo.type // 'singl', 'dvojice1', 'dvojice2', 'trojice1', atd.
  const lineupKey = teamKey === 'opava' ? 'opavaLineup' : 'opponentLineup'
  const benchKey = teamKey === 'opava' ? 'opavaBench' : 'opponentBench'

  // Zkontrolovat, zda je to skutečně NK Opava (ne extraligový tým)
  const isActuallyOpava = team.players && team.players.length > 0 &&
    team.players.some(p => typeof p.id === 'number' && p.id >= 1 && p.id <= 20)

  // Speciální předvyplnění pro NK Opavu podle pevných sestav
  if (teamKey === 'opava' && isActuallyOpava) {
    const lineupIds = []
    const benchIds = []

    // Definice sestav podle typu zápasu
    switch (matchType) {
      case 'singl':
        lineupIds.push(1) // Radim Bokisch
        break

      case 'dvojice1':
        lineupIds.push(7, 1) // David Majštiník, Radim Bokisch
        benchIds.push(5) // Roman Kvarda
        break

      case 'dvojice2':
        lineupIds.push(4, 9) // Ondřej Kurka, Josef Nezval
        benchIds.push(12) // Jan Stařičný
        break

      case 'trojice1':
      case 'trojice1-vs-2':
        lineupIds.push(4, 9, 2) // Ondřej Kurka, Josef Nezval, Tomáš Hyžák
        benchIds.push(17, 5) // Jan Němčík, Roman Kvarda
        break

      case 'trojice2':
      case 'trojice2-vs-1':
        lineupIds.push(1, 7, 12) // Radim Bokisch, David Majštiník, Jan Stařičný
        benchIds.push(13, 15) // Tomáš Volman, Jakub Václavek
        break

      // Pro neuvedené typy (dvojice3, trojice3) použít fallback
      default:
        console.log(`Použití fallback sestavy pro ${matchType}`)
        const allPlayersSorted = [...team.players]
          .filter(p => !p.coachQuotes)
          .sort((a, b) => {
            const aWinRate = a.regularSeason ? a.regularSeason.winRate : 0
            const bWinRate = b.regularSeason ? b.regularSeason.winRate : 0
            return bWinRate - aWinRate
          })
        state[lineupKey] = allPlayersSorted.slice(0, playersPerTeam)
        if (playersPerTeam > 1) {
          const benchSize = playersPerTeam === 3 ? 2 : 1
          state[benchKey] = allPlayersSorted.slice(playersPerTeam, playersPerTeam + benchSize)
        }
        return
    }

    // Najít hráče podle ID
    state[lineupKey] = lineupIds.map(id => team.players.find(p => p.id === id)).filter(p => p)
    state[benchKey] = benchIds.map(id => team.players.find(p => p.id === id)).filter(p => p)
    return
  }

  // Pro extraligové týmy - zkusit použít data z teamLineups.json
  if (team.players && team.players.length > 0) {
    // Extrahovat kód týmu z ID prvního hráče (např. "VSET_5" -> "VSET")
    const firstPlayerId = String(team.players[0].id)
    const teamCode = firstPlayerId.includes('_') ? firstPlayerId.split('_')[0] : null

    if (teamCode && teamLineups[teamCode]) {
      const teamLineupData = teamLineups[teamCode].lineups[matchType]

      if (teamLineupData && teamLineupData.players) {
        // Najít hráče podle ID z JSON
        const lineupPlayers = teamLineupData.players
          .map(playerId => team.players.find(p => String(p.id) === String(playerId)))
          .filter(p => p) // Odfiltrovat undefined (pokud hráč není v týmu)

        if (lineupPlayers.length > 0) {
          // Naplnit lineup podle JSON dat
          state[lineupKey] = lineupPlayers.slice(0, playersPerTeam)

          // Naplnit lavičku - použít další nejlepší hráče podle winRate
          if (playersPerTeam > 1) {
            const benchSize = playersPerTeam === 3 ? 2 : 1
            const lineupIds = state[lineupKey].map(p => String(p.id))
            const remainingPlayers = team.players
              .filter(p => !p.coachQuotes && !lineupIds.includes(String(p.id)))
              .sort((a, b) => {
                const aWinRate = a.regularSeason ? a.regularSeason.winRate : 0
                const bWinRate = b.regularSeason ? b.regularSeason.winRate : 0
                return bWinRate - aWinRate
              })
            state[benchKey] = remainingPlayers.slice(0, benchSize)
          }

          console.log(`✓ Použity reálné sestavy pro ${teamCode} - ${matchType} (${teamLineupData.comment || 'z analýzy zápasů'})`)
          return
        }
      }
    }
  }

  // Fallback - původní logika podle winRate a typicalPositions
  console.log(`Použití fallback sestavy podle winRate pro ${matchType}`)

  // Seřadit hráče podle úspěšnosti
  const allPlayersSorted = [...team.players]
    .filter(p => !p.coachQuotes)
    .sort((a, b) => {
      const aWinRate = a.regularSeason ? a.regularSeason.winRate : 0
      const bWinRate = b.regularSeason ? b.regularSeason.winRate : 0
      return bWinRate - aWinRate
    })

  // Nejprve zkusit najít hráče s typicalPositions, pokud existují
  const position = matchInfo.position
  let suitablePlayers = []

  if (position) {
    suitablePlayers = team.players.filter(player => {
      if (!player.typicalPositions || player.typicalPositions.length === 0) return false

      if (matchType === 'singl') {
        return player.typicalPositions.some(pos => pos === 'singl' || pos.includes('singl'))
      }

      if (matchType.startsWith('dvojice')) {
        const targetPos = `dvojice${position}`
        return player.typicalPositions.includes(targetPos)
      }

      if (matchType.startsWith('trojice')) {
        const targetPos = `trojice${position}`
        return player.typicalPositions.includes(targetPos)
      }

      return false
    })

    suitablePlayers.sort((a, b) => {
      const aWinRate = a.regularSeason ? a.regularSeason.winRate : 0
      const bWinRate = b.regularSeason ? b.regularSeason.winRate : 0
      return bWinRate - aWinRate
    })
  }

  // Pokud nebyli nalezeni žádní vhodní hráči podle typicalPositions, použít všechny seřazené podle winRate
  if (suitablePlayers.length < playersPerTeam) {
    suitablePlayers = allPlayersSorted
  }

  state[lineupKey] = suitablePlayers.slice(0, playersPerTeam)
  if (playersPerTeam > 1) {
    const benchSize = playersPerTeam === 3 ? 2 : 1
    state[benchKey] = suitablePlayers.slice(playersPerTeam, playersPerTeam + benchSize)
  }
}

function renderTeamSelection(team, allPlayers, state, playersPerTeam, opponentTeamId = null) {
  const isOpava = team === 'opava'
  const lineup = isOpava ? state.opavaLineup : state.opponentLineup
  const bench = isOpava ? state.opavaBench : state.opponentBench

  const lineupEl = document.getElementById(`${team}-lineup`)
  const benchEl = document.getElementById(`${team}-bench`)
  const availableEl = document.getElementById(`${team}-available`)
  const countEl = document.getElementById(`${team}-count`)
  const benchCountEl = document.getElementById(`${team}-bench-count`)

  // Získat barvy týmu
  // Pro extraligu použít ID obou týmů, pro běžnou ligu jen soupeře
  let teamColors = null
  if (isOpava && window.leagueSetupState && window.leagueSetupState.opavaTeamId) {
    // Extraliga - první tým má své ID
    teamColors = getTeamColors(window.leagueSetupState.opavaTeamId)
  } else if (!isOpava && opponentTeamId) {
    // Druhý tým (soupeř)
    teamColors = getTeamColors(opponentTeamId)
  }

  // Nastavit CSS proměnné pro barvy týmu
  const colorStyle = teamColors ? `style="--team-primary: ${teamColors.primary}; --team-accent: ${teamColors.accent};"` : ''

  // Render lineup - EA FC style karty přesně jako v sekci Tým
  lineupEl.innerHTML = lineup.map(p => {
    const rating = calculatePlayerRating(p)
    const displayStats = p.stats || generateStatsFromSeason(p)

    return `
    <div class="setup-hexagon-card ${isOpava ? 'opava-card' : 'opponent-card'}" data-player-id="${p.id}" data-status="lineup" data-team="${team}" ${colorStyle} draggable="true">
      <div class="setup-player-image">
        <img src="${p.photo || '/players/default.jpg'}" alt="${p.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${p.number || '?'}%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="setup-card-badge">
        <div class="setup-card-badge-rating">${rating}</div>
      </div>
      <div class="setup-player-number">${p.number || ''}</div>
      <div class="setup-player-info">
        <h3 class="setup-player-name">${p.name}</h3>
        <p class="setup-player-position">${p.position || 'Univerzál'}</p>
        <div class="setup-player-stats-mini">
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.rychlost || '-'}</span><span class="setup-stat-label">Rychlost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obratnost || '-'}</span><span class="setup-stat-label">Obratnost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.sila || '-'}</span><span class="setup-stat-label">Rána</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.technika || '-'}</span><span class="setup-stat-label">Technika</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obetavost || '-'}</span><span class="setup-stat-label">Obětavost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.psychika || '-'}</span><span class="setup-stat-label">Psychická odolnost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.odolnost || '-'}</span><span class="setup-stat-label">Obrana</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.cteniHry || '-'}</span><span class="setup-stat-label">Čtení hry</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.svih || '-'}</span><span class="setup-stat-label">Švih</span></div>
        </div>
      </div>
      <div class="setup-status-badge lineup-badge">✓ V SESTAVĚ</div>
    </div>
  `}).join('')

  // Render bench
  if (playersPerTeam > 1) {
    benchEl.innerHTML = bench.map(p => {
      const rating = calculatePlayerRating(p)
      const displayStats = p.stats || generateStatsFromSeason(p)

      return `
      <div class="setup-hexagon-card ${isOpava ? 'opava-card' : 'opponent-card'}" data-player-id="${p.id}" data-status="bench" data-team="${team}" ${colorStyle} draggable="true">
        <div class="setup-player-image">
          <img src="${p.photo || '/players/default.jpg'}" alt="${p.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${p.number || '?'}%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="setup-card-badge">
          <div class="setup-card-badge-rating">${rating}</div>
        </div>
        <div class="setup-player-number">${p.number || ''}</div>
        <div class="setup-player-info">
          <h3 class="setup-player-name">${p.name}</h3>
          <p class="setup-player-position">${p.position || 'Univerzál'}</p>
          <div class="setup-player-stats-mini">
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.rychlost || '-'}</span><span class="setup-stat-label">Rychlost</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.obratnost || '-'}</span><span class="setup-stat-label">Obratnost</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.sila || '-'}</span><span class="setup-stat-label">Rána</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.technika || '-'}</span><span class="setup-stat-label">Technika</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.obetavost || '-'}</span><span class="setup-stat-label">Obětavost</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.psychika || '-'}</span><span class="setup-stat-label">Psychická odolnost</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.odolnost || '-'}</span><span class="setup-stat-label">Obrana</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.cteniHry || '-'}</span><span class="setup-stat-label">Čtení hry</span></div>
            <div class="setup-stat"><span class="setup-stat-value">${displayStats.svih || '-'}</span><span class="setup-stat-label">Švih</span></div>
          </div>
        </div>
        <div class="setup-status-badge bench-badge">↓ LAVIČKA</div>
      </div>
    `}).join('')
  }

  // Render available
  const usedIds = [...lineup, ...bench].map(p => String(p.id))
  const available = allPlayers.filter(p => !usedIds.includes(String(p.id)))

  availableEl.innerHTML = available.map(p => {
    const rating = calculatePlayerRating(p)
    const displayStats = p.stats || generateStatsFromSeason(p)

    return `
    <div class="setup-hexagon-card ${isOpava ? 'opava-card' : 'opponent-card'} available" data-player-id="${p.id}" data-team="${team}" ${colorStyle} draggable="true">
      <div class="setup-player-image">
        <img src="${p.photo || '/players/default.jpg'}" alt="${p.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${p.number || '?'}%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="setup-card-badge">
        <div class="setup-card-badge-rating">${rating}</div>
      </div>
      <div class="setup-player-number">${p.number || ''}</div>
      <div class="setup-player-info">
        <h3 class="setup-player-name">${p.name}</h3>
        <p class="setup-player-position">${p.position || 'Univerzál'}</p>
        <div class="setup-player-stats-mini">
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.rychlost || '-'}</span><span class="setup-stat-label">Rychlost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obratnost || '-'}</span><span class="setup-stat-label">Obratnost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.sila || '-'}</span><span class="setup-stat-label">Rána</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.technika || '-'}</span><span class="setup-stat-label">Technika</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.obetavost || '-'}</span><span class="setup-stat-label">Obětavost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.psychika || '-'}</span><span class="setup-stat-label">Psychická odolnost</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.odolnost || '-'}</span><span class="setup-stat-label">Obrana</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.cteniHry || '-'}</span><span class="setup-stat-label">Čtení hry</span></div>
          <div class="setup-stat"><span class="setup-stat-value">${displayStats.svih || '-'}</span><span class="setup-stat-label">Švih</span></div>
        </div>
      </div>
    </div>
  `}).join('')

  // Update counts
  countEl.textContent = lineup.length
  if (benchCountEl) benchCountEl.textContent = bench.length
}

// Generuje statistiky pro hráče na základě jejich výkonnosti v uplynulé sezóně
function generateStatsFromSeason(player) {
  if (!player.regularSeason || !player.regularSeason.winRate) {
    // Pokud nejsou žádné statistiky, základní hodnota 80 pro všechny
    return {
      rychlost: 80,
      obratnost: 80,
      rana: 80,
      technika: 80,
      obetavost: 80,
      psychickaOdolnost: 80,
      obrana: 80,
      cteniHry: 80,
      vydrz: 80
    }
  }

  const baseValue = 80
  const winRate = player.regularSeason.winRate

  // Výpočet modifikátoru podle úspěšnosti (-20% až +20%)
  // winRate 0% = modifier -20%, winRate 100% = modifier +20%
  const modifier = ((winRate - 50) / 50) * 0.2 // Rozsah -0.2 až +0.2

  // Specifické úpravy podle typu zápasů
  const singlWinRate = player.regularSeason.singl?.winRate || winRate
  const dvojiceWinRate = player.regularSeason.dvojice?.winRate || winRate
  const trojiceWinRate = player.regularSeason.trojice?.winRate || winRate

  // Rychlost a obratnost - důležité pro všechny typy
  const rychlostMod = ((singlWinRate - 50) / 50) * 0.2
  const obratnostMod = ((dvojiceWinRate - 50) / 50) * 0.2

  // Rána a technika - útočné parametry
  const ranaMod = ((singlWinRate - 50) / 50) * 0.2
  const technikaMod = ((dvojiceWinRate - 50) / 50) * 0.2

  // Obětavost a psychika - týmové parametry
  const obetavostMod = ((trojiceWinRate - 50) / 50) * 0.2
  const psychikaMod = modifier

  // Obrana a čtení hry - defenzivní parametry
  const obranaMod = ((trojiceWinRate - 50) / 50) * 0.2
  const cteniHryMod = modifier

  // Výdrž - podle počtu odehraných zápasů
  const matches = player.regularSeason.matches || 0
  const vydrzMod = matches > 20 ? 0.15 : (matches > 10 ? 0.05 : -0.1)

  return {
    rychlost: Math.round(baseValue * (1 + rychlostMod)),
    obratnost: Math.round(baseValue * (1 + obratnostMod)),
    rana: Math.round(baseValue * (1 + ranaMod)),
    technika: Math.round(baseValue * (1 + technikaMod)),
    obetavost: Math.round(baseValue * (1 + obetavostMod)),
    psychickaOdolnost: Math.round(baseValue * (1 + psychikaMod)),
    obrana: Math.round(baseValue * (1 + obranaMod)),
    cteniHry: Math.round(baseValue * (1 + cteniHryMod)),
    vydrz: Math.round(baseValue * (1 + vydrzMod))
  }
}

function calculatePlayerRating(player) {
  if (!player.stats) {
    // Pro hráče bez stats struktury vypočítat rating z regularSeason winRate
    if (player.regularSeason && player.regularSeason.winRate) {
      return player.regularSeason.winRate
    }
    return 'N/A'
  }

  const stats = player.stats
  const avg = Object.values(stats).reduce((sum, val) => sum + val, 0) / Object.keys(stats).length
  return Math.round(avg)
}

function updateConfirmButton(state, playersPerTeam) {
  const confirmBtn = document.querySelector('.confirm-lineup-btn')
  const isReady = state.opavaLineup.length === playersPerTeam &&
                  state.opponentLineup.length === playersPerTeam

  confirmBtn.disabled = !isReady
}

// Globální funkce pro manipulaci se sestavami
window.leagueSetupState = null

// Nová funkce pro přidání hráče - automaticky do sestavy nebo na lavičku
window.addPlayerToTeam = function(team, playerId) {
  if (!window.leagueSetupState) return

  const state = window.leagueSetupState.state
  const allPlayers = team === 'opava' ? window.leagueSetupState.opavaPlayers : window.leagueSetupState.opponentPlayers
  const player = allPlayers.find(p => String(p.id) === String(playerId))
  if (!player) return

  const playersPerTeam = window.leagueSetupState.playersPerTeam

  if (team === 'opava') {
    // Pokud je místo v sestavě, přidej do sestavy
    if (state.opavaLineup.length < playersPerTeam) {
      state.opavaLineup.push(player)
    }
    // Jinak přidej na lavičku (pokud je místo)
    else if (playersPerTeam > 1) {
      const maxBench = playersPerTeam === 3 ? 2 : 1
      if (state.opavaBench.length < maxBench) {
        state.opavaBench.push(player)
      }
    }
  } else {
    // Stejná logika pro soupeře
    if (state.opponentLineup.length < playersPerTeam) {
      state.opponentLineup.push(player)
    }
    else if (playersPerTeam > 1) {
      const maxBench = playersPerTeam === 3 ? 2 : 1
      if (state.opponentBench.length < maxBench) {
        state.opponentBench.push(player)
      }
    }
  }

  renderTeamSelection(team, allPlayers, state, playersPerTeam, window.leagueSetupState.opponentTeamId)
  updateConfirmButton(state, playersPerTeam)
}

window.removeFromLineup = function(team, playerId) {
  if (!window.leagueSetupState) return

  const state = window.leagueSetupState.state
  const allPlayers = team === 'opava' ? window.leagueSetupState.opavaPlayers : window.leagueSetupState.opponentPlayers

  if (team === 'opava') {
    state.opavaLineup = state.opavaLineup.filter(p => String(p.id) !== String(playerId))
  } else {
    state.opponentLineup = state.opponentLineup.filter(p => String(p.id) !== String(playerId))
  }

  renderTeamSelection(team, allPlayers, state, window.leagueSetupState.playersPerTeam, window.leagueSetupState.opponentTeamId)
  updateConfirmButton(state, window.leagueSetupState.playersPerTeam)
}

window.removeFromBench = function(team, playerId) {
  if (!window.leagueSetupState) return

  const state = window.leagueSetupState.state
  const allPlayers = team === 'opava' ? window.leagueSetupState.opavaPlayers : window.leagueSetupState.opponentPlayers

  if (team === 'opava') {
    state.opavaBench = state.opavaBench.filter(p => String(p.id) !== String(playerId))
  } else {
    state.opponentBench = state.opponentBench.filter(p => String(p.id) !== String(playerId))
  }

  renderTeamSelection(team, allPlayers, state, window.leagueSetupState.playersPerTeam, window.leagueSetupState.opponentTeamId)
  updateConfirmButton(state, window.leagueSetupState.playersPerTeam)
}

// Funkce pro zobrazení dialogu pro výběr dovedností v hyperaktivním režimu
async function showSkillSelectionDialog(team1Lineup, team1Bench, team2Lineup, team2Bench) {
  return new Promise(async (resolve) => {
    // Import skills a animations z playerData
    const { skills } = await import('../playerData.js')

    // Import NK Opava animations
    const { bokischSmecAnimation } = await import('../animations/bokisch-smec.js')
    const { kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation } = await import('../animations/kurka-shaolin.js')
    const { majstinikNonsenseAnimation } = await import('../animations/majstinik-pozdrav.js')

    // Import extraliga animations (Čakovice)
    const { chadimSlabsiNohaAnimation } = await import('../animations/chadim-slabsi-noha.js')
    const { chadimKratasAnimation } = await import('../animations/chadim-kratas.js')
    const { chadimTSmecStredAnimation } = await import('../animations/chadim-t-smec-stred.js')
    const { soucekHrudAnimation } = await import('../animations/soucek-hrud.js')
    const { soucekSmecBeckoAnimation } = await import('../animations/soucek-smec-becko.js')
    const { kalousSmecBeckoAnimation } = await import('../animations/kalous-smec-becko.js')
    const { kuceraNohaAnimation } = await import('../animations/kucera-silnejsi-noha.js')

    // Animace pro jednotlivé hráče a dovednosti
    const playerSkillAnimations = {
      // NK Opava
      1: { 3: bokischSmecAnimation, 5: bokischSmecAnimation, 15: null },
      4: { 15: [kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation] },
      7: { 15: majstinikNonsenseAnimation },

      // Extraliga Čakovice
      'CAKO_1': { 14: chadimSlabsiNohaAnimation, 7: chadimKratasAnimation },
      'CAKO_2': { 1: chadimTSmecStredAnimation },
      'CAKO_3': { 2: kalousSmecBeckoAnimation },
      'CAKO_6': { 16: soucekHrudAnimation, 2: soucekSmecBeckoAnimation },
      'CAKO_7': { 17: kuceraNohaAnimation }
    }

    // Funkce pro získání animace
    function getPlayerSkillAnimation(playerId, skillId) {
      if (playerSkillAnimations[playerId] && playerSkillAnimations[playerId][skillId] !== undefined) {
        return playerSkillAnimations[playerId][skillId]
      }
      return null
    }

    // Funkce pro výpočet úspěšnosti dovednosti
    function calculateSkillSuccessRate(player, skillId) {
      const skill = skills[skillId]
      if (!skill || !skill.stats) return 100
      if (!player.stats) return 0
      const statValues = skill.stats.map(statName => player.stats[statName] || 0)
      const average = statValues.reduce((sum, val) => sum + val, 0) / statValues.length
      return Math.round(average)
    }

    const defensiveSkills = [12, 13, 14, 16, 17] // Blok, Skluz, Slabší noha, Hruď, Silnější noha
    const offensiveSkills = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // Včetně Tupé rány a Smečovaného servisu
    // Zahrnout hráče v základní sestavě i na lavičce
    const allPlayers = [...team1Lineup, ...team1Bench, ...team2Lineup, ...team2Bench]

    // Vytvořit modal dialog
    const modal = document.createElement('div')
    modal.className = 'skill-selection-modal'
    modal.innerHTML = `
      <div class="skill-selection-content">
        <div class="skill-selection-header">
          <h2>🔥 Hyperaktivní trenér</h2>
          <p class="skill-selection-instructions">Pro každého hráče vyberte 4 dovednosti: 1 obrannou, 2 útočné a 1 ultimate</p>
        </div>

        <div class="players-skill-selection">
          ${allPlayers.map(player => {
            // Vyloučit speciální schopnosti (4, 11) a univerzální obrany (16, 17) z ultimate
            const ultimateSkills = [
              ...defensiveSkills.filter(s => s !== 16 && s !== 17), // Vyloučit univerzální obrany
              ...offensiveSkills.filter(s => s !== 4 && s !== 11)
            ]

            return `
              <div class="player-skill-section" data-player-id="${player.id}">
                <div class="player-skill-header">
                  <img src="${player.photo || '/players/default.jpg'}" alt="${player.name}" class="player-skill-photo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number || '?'}%3C/text%3E%3C/svg%3E'" />
                  <h3>${player.name}</h3>
                </div>

                <div class="skill-category">
                  <h4>🛡️ Obranné dovednosti (vyber 1)</h4>
                  <div class="skills-grid">
                    ${defensiveSkills.map(skillId => {
                      const successRate = calculateSkillSuccessRate(player, skillId)
                      const animation = getPlayerSkillAnimation(player.id, skillId)
                      const skillName = skills[skillId].name
                      return `
                        <label class="skill-card-selectable defensive">
                          <input type="radio" name="defensive-${player.id}" value="${skillId}" />
                          <div class="skill-card-content">
                            <div class="skill-card-header">
                              <h5>${skillName}</h5>
                              <div class="skill-rate">
                                <span class="rate-number">${successRate}%</span>
                              </div>
                            </div>
                            ${animation ? `
                              <div class="animation-box-small">
                                ${animation}
                              </div>
                            ` : `
                              <div class="skill-video-placeholder-small">
                                <div class="video-icon">🎥</div>
                              </div>
                            `}
                          </div>
                          <div class="skill-card-checkmark">✓</div>
                        </label>
                      `
                    }).join('')}
                  </div>
                </div>

                <div class="skill-category">
                  <h4>⚔️ Útočné dovednosti (vyber 2)</h4>
                  <div class="skills-grid">
                    ${offensiveSkills.map(skillId => {
                      const successRate = calculateSkillSuccessRate(player, skillId)
                      const animation = getPlayerSkillAnimation(player.id, skillId)
                      const skillName = skills[skillId].name
                      return `
                        <label class="skill-card-selectable offensive">
                          <input type="checkbox" name="offensive-${player.id}" value="${skillId}" />
                          <div class="skill-card-content">
                            <div class="skill-card-header">
                              <h5>${skillName}</h5>
                              <div class="skill-rate">
                                <span class="rate-number">${successRate}%</span>
                              </div>
                            </div>
                            ${animation ? `
                              <div class="animation-box-small">
                                ${animation}
                              </div>
                            ` : `
                              <div class="skill-video-placeholder-small">
                                <div class="video-icon">🎥</div>
                              </div>
                            `}
                          </div>
                          <div class="skill-card-checkmark">✓</div>
                        </label>
                      `
                    }).join('')}
                  </div>
                </div>

                <div class="skill-category">
                  <h4>💫 Ultimate dovednost (vyber 1)</h4>
                  <div class="skills-grid">
                    ${ultimateSkills.map(skillId => {
                      const successRate = calculateSkillSuccessRate(player, skillId)
                      const animation = getPlayerSkillAnimation(player.id, skillId)
                      const skillName = skills[skillId].name
                      const isDefensive = defensiveSkills.includes(skillId)
                      return `
                        <label class="skill-card-selectable ultimate ${isDefensive ? 'defensive' : 'offensive'}">
                          <input type="radio" name="ultimate-${player.id}" value="${skillId}" />
                          <div class="skill-card-content">
                            <div class="skill-card-header">
                              <h5>${skillName}</h5>
                              <div class="skill-rate">
                                <span class="rate-number">${successRate}%</span>
                              </div>
                            </div>
                            ${animation ? `
                              <div class="animation-box-small">
                                ${animation}
                              </div>
                            ` : `
                              <div class="skill-video-placeholder-small">
                                <div class="video-icon">🎥</div>
                              </div>
                            `}
                          </div>
                          <div class="skill-card-checkmark">✓</div>
                        </label>
                      `
                    }).join('')}
                  </div>
                </div>

                <div class="player-skill-status" data-player-id="${player.id}">
                  ⚠️ Vyberte všechny dovednosti (1 obranná + 2 útočné + 1 ultimate)
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
          const missing = []
          if (!defensiveSelected) missing.push('obranná')
          if (offensiveCheckboxes.length < 2) missing.push(`útočné (${offensiveCheckboxes.length}/2)`)
          if (!ultimateSelected) missing.push('ultimate')
          statusDiv.innerHTML = `⚠️ Chybí: ${missing.join(', ')}`
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

    // Funkce pro aktualizaci dostupných ultimate dovedností pro hráče
    function updateUltimateAvailability(playerId) {
      const defensiveSelected = document.querySelector(`input[name="defensive-${playerId}"]:checked`)
      const offensiveSelected = document.querySelectorAll(`input[name="offensive-${playerId}"]:checked`)
      const ultimateInputs = modal.querySelectorAll(`input[name="ultimate-${playerId}"]`)

      // Získat ID již vybraných dovedností
      const selectedSkills = new Set()
      if (defensiveSelected) selectedSkills.add(parseInt(defensiveSelected.value))
      offensiveSelected.forEach(input => selectedSkills.add(parseInt(input.value)))

      // Zakázat již vybrané dovednosti v ultimate sekci
      ultimateInputs.forEach(input => {
        const skillId = parseInt(input.value)
        const label = input.closest('label')

        if (selectedSkills.has(skillId)) {
          // Pokud je již vybraná jako defensive/offensive, zakázat ji
          input.disabled = true
          label.style.opacity = '0.5'
          label.style.pointerEvents = 'none'
          // Odznačit pokud byla vybraná
          if (input.checked) input.checked = false
        } else {
          // Jinak povolit
          input.disabled = false
          label.style.opacity = '1'
          label.style.pointerEvents = 'auto'
        }
      })
    }

    // Omezit výběr útočných dovedností na max 2
    allPlayers.forEach(player => {
      const offensiveInputs = modal.querySelectorAll(`input[name="offensive-${player.id}"]`)
      offensiveInputs.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const checked = modal.querySelectorAll(`input[name="offensive-${player.id}"]:checked`)
          if (checked.length > 2) {
            checkbox.checked = false
          }
          updateUltimateAvailability(player.id)
          validatePlayerSkills(player.id)
          validateAllPlayers()
        })
      })

      // Pro ostatní inputy
      const defensiveInputs = modal.querySelectorAll(`input[name="defensive-${player.id}"]`)
      const ultimateInputs = modal.querySelectorAll(`input[name="ultimate-${player.id}"]`)

      defensiveInputs.forEach(input => {
        input.addEventListener('change', () => {
          updateUltimateAvailability(player.id)
          validatePlayerSkills(player.id)
          validateAllPlayers()
        })
      })

      ultimateInputs.forEach(input => {
        input.addEventListener('change', () => {
          validatePlayerSkills(player.id)
          validateAllPlayers()
        })
      })

      // Inicializovat dostupnost ultimate dovedností
      updateUltimateAvailability(player.id)
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
}

export function initializeLeagueSetup(matchInfo, opponentTeamId, playersPerTeam, opavaPlayers, opponentPlayers, state, opavaTeamId = null, team1Name = null, team2Name = null) {
  window.leagueSetupState = {
    state,
    playersPerTeam,
    opavaPlayers,
    opponentPlayers,
    opponentTeamId,
    opavaTeamId,  // Pro extraligu - ID prvního týmu
    team1Name,     // Název prvního týmu
    team2Name      // Název druhého týmu
  }
}
