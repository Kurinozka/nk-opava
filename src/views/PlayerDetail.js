import { players, skills, skillDetails } from '../playerData.js'
import { getTeamWithStats as getExtraligaTeam, extraligaTeams } from '../extraligaTeams.js'
import { getTeamWithStats as getLeagueTeam, leagueTeams } from '../leagueTeams.js'
import { bokischSmecAnimation } from '../animations/bokisch-smec.js'
import { kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation } from '../animations/kurka-shaolin.js'
import { majstinikNonsenseAnimation } from '../animations/majstinik-pozdrav.js'
import { kuceraNohaAnimation } from '../animations/kucera-silnejsi-noha.js'
import { soucekHrudAnimation } from '../animations/soucek-hrud.js'
import { soucekSmecBeckoAnimation } from '../animations/soucek-smec-becko.js'
import { kalousSmecBeckoAnimation } from '../animations/kalous-smec-becko.js'
import { chadimSlabsiNohaAnimation } from '../animations/chadim-slabsi-noha.js'
import { chadimKratasAnimation } from '../animations/chadim-kratas.js'
import { chadimTSmecStredAnimation } from '../animations/chadim-t-smec-stred.js'
import { getTeamColors } from '../teamColors.js'

// Funkce pro nalezení hráče napříč všemi týmy
function findPlayerById(playerId) {
  // Nejprve hledat v hráčích NK Opavy
  let player = players.find(p => p.id == playerId)
  if (player) return { player, teamId: 'OPAVA', isExtraliga: false }

  // Hledat v extraligových týmech
  for (const teamData of extraligaTeams) {
    const team = getExtraligaTeam(teamData.id)
    if (team) {
      player = team.players.find(p => p.id == playerId)
      if (player) return { player, teamId: team.id, teamName: team.name, isExtraliga: true }
    }
  }

  // Hledat v týmech 1. ligy
  for (const teamData of leagueTeams) {
    const team = getLeagueTeam(teamData.id)
    if (team) {
      player = team.players.find(p => p.id == playerId)
      if (player) return { player, teamId: team.id, teamName: team.name, isExtraliga: false }
    }
  }

  return null
}

// Mapa animací pro jednotlivé schopnosti (globální)
const skillAnimations = {
  // 12: blok - video bude doplněno
}

// Mapa animací specifických pro jednotlivé hráče a jejich dovednosti
const playerSkillAnimations = {
  1: {
    3: bokischSmecAnimation,
    5: bokischSmecAnimation,
    15: null
  },
  4: {
    15: [kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation]
  },
  7: {
    15: majstinikNonsenseAnimation
  },
  'CAKO_7': {
    17: kuceraNohaAnimation
  },
  'CAKO_6': {
    16: soucekHrudAnimation,
    2: soucekSmecBeckoAnimation
  },
  'CAKO_3': {
    2: kalousSmecBeckoAnimation
  },
  'CAKO_1': {
    14: chadimSlabsiNohaAnimation,
    7: chadimKratasAnimation
  },
  'CAKO_2': {
    1: chadimTSmecStredAnimation
  }
}

// Funkce pro získání animace pro konkrétního hráče a skill
function getPlayerSkillAnimation(playerId, skillId) {
  if (playerSkillAnimations[playerId] && playerSkillAnimations[playerId][skillId] !== undefined) {
    return playerSkillAnimations[playerId][skillId]
  }
  return skillAnimations[skillId] || null
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

// Funkce pro generování vysvětlení statistik
function generateStatsExplanation(player, teamId = null) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    return ''
  }

  // Zjistit nejvyšší ligu (pokud hraje více soutěží, počítá se ta vyšší)
  let highestLeague = '2. liga'
  let baseRating = 75

  for (const season of player.seasonStats) {
    if (season.league.includes('Extraliga')) {
      highestLeague = 'Extraligu'
      baseRating = 85
      break // Extraliga je nejvyšší, nemusíme dále hledat
    } else if (season.league.includes('1. liga') && highestLeague !== 'Extraligu') {
      highestLeague = '1. ligu'
      baseRating = 80
    }
  }

  // Vypočítat váženou úspěšnost za poslední 2 roky (aktuální sezóna má 2x větší váhu)
  let weightedMatches = 0
  let weightedWins = 0

  player.seasonStats.forEach((season, index) => {
    // Aktuální sezóna (index 0) má váhu 2, předchozí mají váhu 1
    const weight = index === 0 ? 2 : 1
    weightedMatches += season.matches * weight
    weightedWins += season.wins * weight
  })

  const overallWinRate = weightedMatches > 0 ? Math.round((weightedWins / weightedMatches) * 100) : 0

  // Celkový počet zápasů za poslední 2 roky
  const totalMatches = player.seasonStats.reduce((sum, s) => sum + s.matches, 0)
  const totalWins = player.seasonStats.reduce((sum, s) => sum + s.wins, 0)

  let explanation = `Hodnocení hráče vychází z jeho účasti a výkonů v soutěžích. `

  explanation += `V aktuální sezóně hraje hráč ${highestLeague}. `

  const leagueName = highestLeague === 'Extraligu' ? 'extraligy' : (highestLeague === '1. ligu' ? 'první ligy' : 'druhé ligy')
  explanation += `Hráči ${leagueName} mají základní hodnocení ${baseRating}. `

  explanation += `Celková úspěšnost hráče za poslední 2 roky činí ${overallWinRate}% (${totalWins}/${totalMatches} zápasů). `

  explanation += `Tato úspěšnost se rovněž odráží v parametrech hráče, s tím, že aktuální sezóna má dvakrát větší váhu než předchozí sezóna. `

  // Jiný text pro hráče Opavy vs ostatní týmy
  if (teamId === 'OPAVA') {
    explanation += `Účast na tréninku může parametry hráče pouze zvýšit, a to maximálně o 5% v případě 100% účasti na tréninku.`
  } else {
    explanation += `Účast na tréninku může parametry hráče jen zvýšit, a to maximálně o 5% v případě 100% účasti. Má to ale jeden háček. Evidujeme pouze účast na trenínku hráčů NK Opava.`
  }

  return explanation
}

export function createPlayerDetailView(playerId) {
  const result = findPlayerById(playerId)

  if (!result) {
    return `
      <div class="player-detail-container">
        <div class="error-message">
          <h2>Hráč nenalezen</h2>
          <button class="back-button" onclick="window.history.back()">← Zpět na tým</button>
        </div>
      </div>
    `
  }

  const { player, teamId, teamName, isExtraliga } = result

  const allSkillIds = Object.keys(skills).map(Number)

  // Pro trenéra
  if (!player.stats && player.coachQuotes) {
    const backButton = teamId === 'OPAVA'
      ? `<button class="back-button" data-nav="team">← Zpět na tým</button>`
      : `<button class="back-button" data-nav-team="${teamId}" data-nav-extraliga="${isExtraliga}">← Zpět na ${teamName || 'tým'}</button>`

    return `
      <div class="player-detail-container" data-current-player-id="${player.id}">
        ${backButton}

        <div class="player-detail-header">
          <div class="player-detail-photo">
            <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23FFD700%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22%23000%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
          </div>
          <div class="player-detail-info">
            <h1>${player.name}</h1>
            <p class="player-detail-position">${player.position} • #${player.number}</p>
          </div>
        </div>

        <div class="coach-quotes-section">
          <h2>🗣️ Trenérovy hlášky</h2>

          <div class="quote-category">
            <h3>📉 Při neúspěšném útoku:</h3>
            <ul>
              ${player.coachQuotes.offensiveFail.map(quote => `<li>"${quote}"</li>`).join('')}
            </ul>
          </div>

          <div class="quote-category">
            <h3>🛡️ Při neúspěšné obraně:</h3>
            <ul>
              ${player.coachQuotes.defensiveFail.map(quote => `<li>"${quote}"</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `
  }

  // Pro hráče
  const avgRating = player.stats ? Math.round(
    (player.stats.rychlost + player.stats.obratnost + player.stats.rana +
     player.stats.technika + player.stats.obetavost + player.stats.psychickaOdolnost +
     player.stats.obrana + player.stats.cteniHry + player.stats.vydrz) / 9
  ) : 0

  // Vypočítat celkovou úspěšnost v disciplínách za poslední 2 roky
  const calculateDisciplineStats = () => {
    if (!player.seasonStats || player.seasonStats.length === 0) {
      return { singl: 0, dvojice: 0, trojice: 0 }
    }

    const disciplineData = { singl: { matches: 0, wins: 0 }, dvojice: { matches: 0, wins: 0 }, trojice: { matches: 0, wins: 0 } }

    player.seasonStats.forEach(season => {
      if (season.disciplines) {
        disciplineData.singl.matches += season.disciplines.singl.matches
        disciplineData.singl.wins += season.disciplines.singl.wins
        disciplineData.dvojice.matches += season.disciplines.dvojice.matches
        disciplineData.dvojice.wins += season.disciplines.dvojice.wins
        disciplineData.trojice.matches += season.disciplines.trojice.matches
        disciplineData.trojice.wins += season.disciplines.trojice.wins
      }
    })

    return {
      singl: disciplineData.singl.matches > 0 ? Math.round((disciplineData.singl.wins / disciplineData.singl.matches) * 100) : 0,
      dvojice: disciplineData.dvojice.matches > 0 ? Math.round((disciplineData.dvojice.wins / disciplineData.dvojice.matches) * 100) : 0,
      trojice: disciplineData.trojice.matches > 0 ? Math.round((disciplineData.trojice.wins / disciplineData.trojice.matches) * 100) : 0
    }
  }

  const disciplineStats = calculateDisciplineStats()

  const backButton = teamId === 'OPAVA'
    ? `<button class="back-button" data-nav="team">← Zpět na tým</button>`
    : `<button class="back-button" data-nav-team="${teamId}" data-nav-extraliga="${isExtraliga}">← Zpět na ${teamName || 'tým'}</button>`

  // Získat barvy týmu
  const teamColors = getTeamColors(teamId)

  // Top stats pro kartu
  const topStats = [
    { name: 'RYC', value: player.stats.rychlost },
    { name: 'OBR', value: player.stats.obratnost },
    { name: 'RÁN', value: player.stats.rana },
    { name: 'TEC', value: player.stats.technika },
    { name: 'OBĚ', value: player.stats.obetavost },
    { name: 'PSY', value: player.stats.psychickaOdolnost }
  ]

  return `
    <div class="player-detail-container" data-current-player-id="${player.id}">
      ${backButton}

      <!-- Player Card (hexagon style) -->
      <div style="display: flex; justify-content: center; margin: 2rem 0 3rem 0;">
        <div class="hexagon-card" style="max-width: 320px;">
          <style>
            .hexagon-card-${teamId}::before {
              background: linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.accent} 100%) !important;
            }
            .hexagon-card-${teamId}:hover {
              box-shadow: 0 20px 60px ${teamColors.primary}66, 0 0 0 2px ${teamColors.primary} inset !important;
            }
          </style>
          <div class="hexagon-card-${teamId}" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;"></div>
          <div class="player-image">
            <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22${encodeURIComponent(teamColors.primary)}%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
          </div>
          <div class="card-badge">
            <div class="card-badge-rating">${avgRating}</div>
          </div>
          <div class="player-number">${player.number}</div>
          <div class="player-info">
            <h3 class="player-name">${player.name}</h3>
            <p class="player-position">${player.position}</p>
            <div class="player-stats-mini">
              <div class="stat"><span class="stat-value">${player.stats.rychlost}</span><span class="stat-label">Rychlost</span></div>
              <div class="stat"><span class="stat-value">${player.stats.obratnost}</span><span class="stat-label">Obratnost</span></div>
              <div class="stat"><span class="stat-value">${player.stats.rana}</span><span class="stat-label">Rána</span></div>
              <div class="stat"><span class="stat-value">${player.stats.technika}</span><span class="stat-label">Technika</span></div>
              <div class="stat"><span class="stat-value">${player.stats.obetavost}</span><span class="stat-label">Obětavost</span></div>
              <div class="stat"><span class="stat-value">${player.stats.psychickaOdolnost}</span><span class="stat-label">Psychika</span></div>
              <div class="stat"><span class="stat-value">${player.stats.obrana}</span><span class="stat-label">Obrana</span></div>
              <div class="stat"><span class="stat-value">${player.stats.cteniHry}</span><span class="stat-label">Čtení hry</span></div>
              <div class="stat"><span class="stat-value">${player.stats.vydrz}</span><span class="stat-label">Výdrž</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="player-detail-header">
        <div class="player-detail-photo">
          <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22${encodeURIComponent(teamColors.primary)}%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="player-detail-info-wrapper">
          <div class="player-content-grid">
            <div class="player-stats-column">
              <div class="player-header-section">
                <div>
                  <h1>${player.name}</h1>
                  <p class="player-detail-position">${player.position} • #${player.number}</p>
                </div>
                <div class="player-rating-badge player-rating-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">${avgRating}</div>
              </div>

              <div class="player-detail-stats">
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.rychlost}</span>
                <span class="stat-name">Rychlost</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.obratnost}</span>
                <span class="stat-name">Obratnost</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.rana}</span>
                <span class="stat-name">Rána</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.technika}</span>
                <span class="stat-name">Technika</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.obetavost}</span>
                <span class="stat-name">Obětavost</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.psychickaOdolnost}</span>
                <span class="stat-name">Psychika</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.obrana}</span>
                <span class="stat-name">Obrana</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.cteniHry}</span>
                <span class="stat-name">Čtení hry</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${generateStatsExplanation(player, teamId)}">
                <span class="stat-value">${player.stats.vydrz}</span>
                <span class="stat-name">Výdrž</span>
              </div>
            </div>
            </div>

            <div class="player-extra-info">
              ${player.nickname ? `
                <div class="info-item">
                  <span class="info-label">🏷️ Přezdívka:</span>
                  <span class="info-value">${player.nickname}</span>
                </div>
              ` : ''}
              ${player.dominantFoot ? `
                <div class="info-item">
                  <span class="info-label">${player.dominantFoot === 'left' ? '⚽ Dominantní noha:' : '⚽ Dominantní noha:'}</span>
                  <span class="info-value">${player.dominantFoot === 'left' ? 'Levá' : 'Pravá'}</span>
                </div>
              ` : ''}
              ${player.trainingAttendance2025 !== undefined ? `
                <div class="info-item">
                  <span class="info-label">💪 Účast na tréninku (2025):</span>
                  <span class="info-value">${player.trainingAttendance2025}%</span>
                </div>
              ` : ''}
              ${player.seasonStats && player.seasonStats.length > 0 ? `
                <div class="info-item">
                  <span class="info-label">📊 Úspěšnost za poslední 2 roky:</span>
                  <div class="discipline-success-rates">
                    <span class="discipline-stat">👤 S: ${disciplineStats.singl}%</span>
                    <span class="discipline-stat">👥 D: ${disciplineStats.dvojice}%</span>
                    <span class="discipline-stat">👨‍👩‍👦 T: ${disciplineStats.trojice}%</span>
                  </div>
                </div>
              ` : ''}
              ${player.simulationStats ? `
                <div class="info-item">
                  <span class="info-label">🎮 Úspěšnost v simulaci:</span>
                  <div class="discipline-success-rates">
                    <span class="discipline-stat">👤 S: ${player.simulationStats.singl.winRate}% (${player.simulationStats.singl.wins}/${player.simulationStats.singl.matches})</span>
                    <span class="discipline-stat">👥 D: ${player.simulationStats.dvojice.winRate}% (${player.simulationStats.dvojice.wins}/${player.simulationStats.dvojice.matches})</span>
                    <span class="discipline-stat">👨‍👩‍👦 T: ${player.simulationStats.trojice.winRate}% (${player.simulationStats.trojice.wins}/${player.simulationStats.trojice.matches})</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      ${player.seasonStats && player.seasonStats.length > 0 ? `
      <section class="player-section">
        <h2>📊 Statistiky sezón</h2>
        ${player.seasonStats.map(stat => `
          <div class="season-stats-block">
            <h3 class="season-title">${stat.season} - ${stat.league}</h3>
            <div class="stats-overview">
              <div class="stat-box total">
                <span class="stat-label">Celkem</span>
                <span class="stat-number">${stat.matches}</span>
                <span class="stat-desc">zápasů</span>
                <span class="stat-winrate">${stat.winRate}%</span>
              </div>
              <div class="stat-box wins">
                <span class="stat-label">Výhry</span>
                <span class="stat-number">${stat.wins}</span>
              </div>
              <div class="stat-box losses">
                <span class="stat-label">Prohry</span>
                <span class="stat-number">${stat.losses}</span>
              </div>
            </div>

            ${stat.disciplines ? `
            <div class="disciplines-stats">
              <h4>Úspěšnost v disciplínách</h4>
              <div class="disciplines-grid">
                <div class="discipline-card">
                  <span class="discipline-name">👤 Jednotlivci (S)</span>
                  <span class="discipline-matches">${stat.disciplines.singl.matches} zápasů</span>
                  <span class="discipline-wins">${stat.disciplines.singl.wins} výher</span>
                  <span class="discipline-winrate">${stat.disciplines.singl.winRate}%</span>
                </div>
                <div class="discipline-card">
                  <span class="discipline-name">👥 Dvojice (D)</span>
                  <span class="discipline-matches">${stat.disciplines.dvojice.matches} zápasů</span>
                  <span class="discipline-wins">${stat.disciplines.dvojice.wins} výher</span>
                  <span class="discipline-winrate">${stat.disciplines.dvojice.winRate}%</span>
                </div>
                <div class="discipline-card">
                  <span class="discipline-name">👨‍👩‍👦 Trojice (T)</span>
                  <span class="discipline-matches">${stat.disciplines.trojice.matches} zápasů</span>
                  <span class="discipline-wins">${stat.disciplines.trojice.wins} výher</span>
                  <span class="discipline-winrate">${stat.disciplines.trojice.winRate}%</span>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      <section class="player-section">
        <div class="section-header-with-link">
          <h2>🎯 Dovednosti v simulaci</h2>
          <button class="simulation-link" data-nav="simulation">→ Zkusit simulaci</button>
        </div>

        <div class="skills-main-tabs">
          <button class="skill-main-tab active" data-main-tab="success">✅ Úspěšné údery</button>
          <button class="skill-main-tab" data-main-tab="fail">❌ Neúspěšné údery</button>
        </div>

        <!-- Úspěšné údery -->
        <div class="skill-main-content active" data-main-content="success">

          <h3 class="skill-category-title">⚔️ Útočné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'offensive' || skills[id].type === 'special').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              const animation = getPlayerSkillAnimation(player.id, skillId)
              return `
                <div class="skill-detail-card offensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${successRate}%</span>
                      <span class="rate-label">úspěšnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-video-placeholder">
                      <div class="video-icon">🎥</div>
                      <p>Video bude přidáno</p>
                    </div>
                  `}
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🛡️ Obranné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'defensive').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              const animation = getPlayerSkillAnimation(player.id, skillId)
              return `
                <div class="skill-detail-card defensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${successRate}%</span>
                      <span class="rate-label">úspěšnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-video-placeholder">
                      <div class="video-icon">🎥</div>
                      <p>Video bude přidáno</p>
                    </div>
                  `}
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🎲 Nesmyslné dovednosti</h3>
          <div class="skills-grid">
            ${(() => {
              const animation = getPlayerSkillAnimation(player.id, 15)

              // Pokud je animace pole (úspěch + neúspěch), zobraz pouze úspěšnou verzi
              if (Array.isArray(animation)) {
                return `
                  <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15">
                    <div class="skill-detail-header">
                      <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                      <div class="skill-rate">
                        <span class="rate-number">10%</span>
                        <span class="rate-label">úspěšnost</span>
                      </div>
                    </div>
                    <div class="animation-box">
                      ${animation[0]}
                    </div>
                  </div>
                `
              }

              // Jinak jedna karta
              return `
                <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15">
                  <div class="skill-detail-header">
                    <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">10%</span>
                      <span class="rate-label">úspěšnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-video-placeholder">
                      <div class="video-icon">🎥</div>
                      <p>Video bude přidáno</p>
                    </div>
                  `}
                </div>
              `
            })()}
          </div>
        </div>

        <!-- Neúspěšné údery -->
        <div class="skill-main-content" data-main-content="fail">

          <h3 class="skill-category-title">⚔️ Útočné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'offensive' || skills[id].type === 'special').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              const failRate = 100 - successRate
              return `
                <div class="skill-detail-card offensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${failRate}%</span>
                      <span class="rate-label">pravděpodobnost</span>
                    </div>
                  </div>
                  <div class="skill-video-placeholder">
                    <div class="video-icon">🎥</div>
                    <p>Video bude přidáno</p>
                  </div>
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🛡️ Obranné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'defensive').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              const failRate = 100 - successRate
              return `
                <div class="skill-detail-card defensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${failRate}%</span>
                      <span class="rate-label">pravděpodobnost</span>
                    </div>
                  </div>
                  <div class="skill-video-placeholder">
                    <div class="video-icon">🎥</div>
                    <p>Video bude přidáno</p>
                  </div>
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🎲 Nesmyslné dovednosti</h3>
          <div class="skills-grid">
            ${(() => {
              const animation = getPlayerSkillAnimation(player.id, 15)

              // Pokud je animace pole (úspěch + neúspěch), zobraz pouze neúspěšnou verzi
              if (Array.isArray(animation)) {
                return `
                  <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15">
                    <div class="skill-detail-header">
                      <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                      <div class="skill-rate">
                        <span class="rate-number">90%</span>
                        <span class="rate-label">pravděpodobnost</span>
                      </div>
                    </div>
                    <div class="animation-box">
                      ${animation[1]}
                    </div>
                  </div>
                `
              }

              // Jinak placeholder nebo animace
              return `
                <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15">
                  <div class="skill-detail-header">
                    <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">90%</span>
                      <span class="rate-label">pravděpodobnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-video-placeholder">
                      <div class="video-icon">🎥</div>
                      <p>Video bude přidáno</p>
                    </div>
                  `}
                </div>
              `
            })()}
          </div>
        </div>
      </section>
    </div>
  `
}

export function setupPlayerDetailHandlers() {
  // Handler pro běžná navigační tlačítka
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.nav
      // Import navigateTo z main.js
      if (window.navigateToView) {
        window.navigateToView(view)
      }
    })
  })

  // Handler pro zpět tlačítka s team ID
  document.querySelectorAll('[data-nav-team]').forEach(btn => {
    btn.addEventListener('click', () => {
      const teamId = btn.dataset.navTeam
      const isExtraliga = btn.dataset.navExtraliga === 'true'
      if (window.navigateToView) {
        window.navigateToView('team-roster', teamId, isExtraliga)
      }
    })
  })

  // Tab switching pro hlavní záložky (Úspěšné/Neúspěšné údery)
  document.querySelectorAll('.skill-main-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mainTabType = tab.dataset.mainTab

      // Odstranit active ze všech hlavních tabů
      document.querySelectorAll('.skill-main-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.skill-main-content').forEach(c => c.classList.remove('active'))

      // Přidat active k aktuálnímu tabu
      tab.classList.add('active')
      const activeContent = document.querySelector(`[data-main-content="${mainTabType}"]`)
      if (activeContent) {
        activeContent.classList.add('active')
      }
    })
  })

  // Handler pro kliknutí na skill cards - zobrazení modalu s detaily
  document.querySelectorAll('.skill-clickable').forEach(card => {
    card.addEventListener('click', () => {
      console.log('Skill card clicked!')
      const skillId = parseInt(card.dataset.skillId)
      const container = card.closest('.player-detail-container')
      const playerId = container ? container.dataset.currentPlayerId : null
      console.log('Opening modal for skill:', skillId, 'player:', playerId)
      showSkillDetailModal(skillId, playerId)
    })
  })
}

// Funkce pro zobrazení modalu s detaily schopnosti
function showSkillDetailModal(skillId, playerId = null) {
  console.log('showSkillDetailModal called with skillId:', skillId, 'playerId:', playerId)

  const skill = skills[skillId]
  const details = skillDetails[skillId]

  if (!skill || !details) {
    console.error(`Skill ${skillId} not found`)
    return
  }

  // Získat animaci pro daného hráče a skill (pokud máme playerId)
  const animation = playerId ? getPlayerSkillAnimation(playerId, skillId) : null

  // Získat jméno dovednosti (pro nonsense použít player-specific name)
  let skillName = skill.name
  if (playerId && skillId === 15) {
    const result = findPlayerById(playerId)
    if (result && result.player && result.player.nonsenseName) {
      skillName = result.player.nonsenseName
    }
  }

  console.log('Creating modal with skillName:', skillName)

  // Vytvořit modal overlay
  const modal = document.createElement('div')
  modal.className = 'skill-modal-overlay'
  modal.innerHTML = `
    <div class="skill-modal-content">
      <div class="skill-modal-header">
        <h2>${skillName}</h2>
        <button class="skill-modal-close">&times;</button>
      </div>
      <div class="skill-modal-body">
        ${animation ? `
          <div class="skill-detail-section skill-animation-large">
            <div class="animation-box-large">
              ${Array.isArray(animation) ? animation[0] : animation}
            </div>
          </div>
        ` : ''}

        <div class="skill-detail-section">
          <h3>📝 Popis</h3>
          <p>${details.description}</p>
        </div>

        <div class="skill-detail-section">
          <h3>📊 Klíčové atributy</h3>
          <p><strong>${details.keyStats}</strong></p>
          <p class="skill-detail-hint">Úspěšnost schopnosti se vypočítá jako průměr těchto atributů hráče.</p>
        </div>

        <div class="skill-detail-section">
          <h3>⚙️ Vyhodnocování</h3>
          <p>${details.evaluationPhase}</p>
        </div>

        <div class="skill-detail-section">
          <h3>🛡️ Nejlepší obrana</h3>
          <p>${details.bestCounter}</p>
        </div>

        <div class="skill-detail-section priority-section">
          <h3>🔢 Priorita</h3>
          <p>${details.priority}</p>
        </div>

        ${skill.effect ? `
          <div class="skill-detail-section effect-section">
            <h3>✨ Efekt</h3>
            <p>${skill.effect}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `

  // Přidat modal do body
  document.body.appendChild(modal)

  // Přidat event listener pro zavření
  const closeBtn = modal.querySelector('.skill-modal-close')
  closeBtn.addEventListener('click', () => {
    modal.remove()
  })

  // Zavřít při kliknutí mimo modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })

  // Zavřít při stisknutí ESC
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', escapeHandler)
    }
  }
  document.addEventListener('keydown', escapeHandler)
}
