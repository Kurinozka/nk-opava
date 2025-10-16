import { getTeamWithStats as getLeagueTeam } from '../leagueTeams.js'
import { getTeamWithStats as getExtraligaTeam } from '../extraligaTeams.js'
import { getTeamColors } from '../teamColors.js'

// Funkce pro výpočet průměrného ratingu
function calculateAvgRating(player) {
  if (!player.stats) return 0
  const { rychlost, obratnost, sila, svih, technika, obetavost, psychika, cteniHry, odolnost } = player.stats
  return Math.round((rychlost + obratnost + sila + svih + technika + obetavost + psychika + cteniHry + odolnost) / 9)
}

// Funkce pro vytvoření player karty
function createPlayerCard(player, teamId) {
  const teamColors = getTeamColors(teamId)
  if (!player.stats) {
    // Trenér
    return `
      <div class="hexagon-card coach-card" data-player-id="${player.id}" style="--team-primary: ${teamColors.primary}; --team-secondary: ${teamColors.secondary}; --team-accent: ${teamColors.accent};">
        <div class="player-image">
          <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22${encodeURIComponent(teamColors.primary)}%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22${encodeURIComponent(teamColors.secondary)}%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="card-badge">
          <div class="card-badge-rating">⭐</div>
        </div>
        <div class="player-number">${player.number}</div>
        <div class="player-info">
          <h3 class="player-name">${player.name}</h3>
          <p class="player-position">${player.position}</p>
          <div class="player-stats-mini">
            <div class="stat">
              <span class="stat-value">🗣️</span>
              <span class="stat-label">KOUČ</span>
            </div>
          </div>
        </div>
      </div>
    `
  }

  const avgRating = calculateAvgRating(player)

  return `
    <div class="hexagon-card" data-player-id="${player.id}" style="--team-primary: ${teamColors.primary}; --team-secondary: ${teamColors.secondary}; --team-accent: ${teamColors.accent};">
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
          <div class="stat"><span class="stat-value">${player.stats.sila}</span><span class="stat-label">Rána</span></div>
          <div class="stat"><span class="stat-value">${player.stats.technika}</span><span class="stat-label">Technika</span></div>
          <div class="stat"><span class="stat-value">${player.stats.obetavost}</span><span class="stat-label">Obětavost</span></div>
          <div class="stat"><span class="stat-value">${player.stats.psychika}</span><span class="stat-label">Psychika</span></div>
          <div class="stat"><span class="stat-value">${player.stats.odolnost}</span><span class="stat-label">Obrana</span></div>
          <div class="stat"><span class="stat-value">${player.stats.cteniHry}</span><span class="stat-label">Čtení hry</span></div>
          <div class="stat"><span class="stat-value">${player.stats.svih}</span><span class="stat-label">Švih</span></div>
        </div>
      </div>
    </div>
  `
}

export function createTeamRosterView(teamId, isExtraliga = false) {
  // Načíst tým podle toho, zda je z extraligy nebo 1. ligy
  const team = isExtraliga ? getExtraligaTeam(teamId) : getLeagueTeam(teamId)

  if (!team) {
    return `
      <div class="team-container">
        <div class="team-header">
          <h1>Tým nenalezen</h1>
        </div>
      </div>
    `
  }

  const leagueName = isExtraliga ? 'Extraliga mužů' : '1. liga mužů'
  const teamColors = getTeamColors(teamId)

  return `
    <div class="team-container">
      <div class="team-header">
        <img src="${team.logo}" alt="${team.name} Logo" class="team-logo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22${encodeURIComponent(teamColors.primary)}%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22white%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${team.shortName}%3C/text%3E%3C/svg%3E'" />
        <div class="team-header-text">
          <h1>${team.name}</h1>
          <p class="team-subtitle">Sezóna 2024/2025 • ${leagueName}</p>
        </div>
      </div>

      ${teamId === 'CAKO' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/cakovice-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'MODR' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/modrice-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'CELA' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/celakovice-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'KVAR' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/karlovy-vary-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'VSET' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/vsetin-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'ZATEC' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/zatec-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'RADO' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/radomysl-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      ${teamId === 'SOLI' ? `
        <div class="team-video-section" style="margin: 30px 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <video autoplay loop muted playsinline style="width: 100%; display: block;">
            <source src="/videos/solidarita-team.mov" type="video/quicktime">
          </video>
        </div>
      ` : ''}

      <div class="players-section">
        <div class="players-grid">
          ${team.players.map(player => createPlayerCard(player, teamId)).join('')}
        </div>
      </div>
    </div>
  `
}

export function setupTeamRosterHandlers() {
  // Otevření detailu hráče
  document.querySelectorAll('.hexagon-card').forEach(card => {
    card.addEventListener('click', () => {
      const playerId = card.dataset.playerId
      // Tato funkce bude definována v main.js
      if (window.openPlayerDetail) {
        window.openPlayerDetail(playerId)
      }
    })
  })
}
