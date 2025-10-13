import { players } from '../playerData.js'

// Funkce pro výpočet průměrného ratingu
function calculateAvgRating(player) {
  if (!player.stats) return 0
  const { rychlost, obratnost, rana, technika, obetavost, psychickaOdolnost, obrana, cteniHry, vydrz } = player.stats
  return Math.round((rychlost + obratnost + rana + technika + obetavost + psychickaOdolnost + obrana + cteniHry + vydrz) / 9)
}

// Funkce pro vytvoření player karty
function createPlayerCard(player) {
  if (!player.stats) {
    // Trenér
    return `
      <div class="hexagon-card coach-card" data-player-id="${player.id}">
        <div class="player-image">
          <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23FFD700%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22%23000%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'\" />
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
    <div class="hexagon-card" data-player-id="${player.id}">
      <div class="player-image">
        <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23DC2F3E%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'\" />
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
  `
}

export function createTeamView() {
  return `
    <div class="team-container">
      <div class="team-header">
        <img src="/images/logo-full.jpg" alt="NK Opava Logo" class="team-logo" />
        <div class="team-header-text">
          <h1>Náš tým</h1>
          <p class="team-subtitle">Sezóna 2024/2025 • 1. liga mužů</p>
        </div>
      </div>

      <div class="players-section">
        <div class="players-grid">
          ${players.map(player => createPlayerCard(player)).join('')}
        </div>
      </div>
    </div>
  `
}

export function setupTeamHandlers() {
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
