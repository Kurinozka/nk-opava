import { leagueTable } from '../data/leagueData.js'
import { matchDetails } from '../matchDetails.js'

export function createHomeView() {
  return `
    <div class="home-container">
      <!-- Hero sekce -->
      <section class="hero-section">
        <div class="hero-content">
          <img src="/images/logo-full.jpg" alt="NK Opava Logo" class="hero-logo" />
          <h1>Nohejbalový Klub Opava</h1>
          <p class="hero-subtitle">1. liga mužů • Sezóna 2024/2025</p>
          <div class="hero-cta">
            <button class="cta-button primary" data-nav="simulation">
              <span class="hexagon-bg"></span>
              <span class="button-text">🎮 Vyzkoušet simulaci zápasu</span>
            </button>
            <button class="cta-button secondary" data-nav="team">
              <span class="hexagon-bg"></span>
              <span class="button-text">👥 Náš tým</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Nadcházející baráž -->
      <section class="upcoming-baraz-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Baráž o 1. ligu
        </h2>
        <div class="baraz-card">
          <div class="baraz-date">26. 10. 2025</div>
          <div class="baraz-teams">
            <div class="team home">
              <img src="/images/logo-mini.jpg" alt="NK Opava" />
              <span>NK Opava</span>
            </div>
            <div class="vs">VS</div>
            <div class="team away">
              <div class="placeholder-logo">JN</div>
              <span>Janovice</span>
            </div>
          </div>
          <div class="baraz-info">Rozhodující zápas o setrvání v 1. lize</div>
        </div>
      </section>

      <!-- Play-Out odehrané zápasy -->
      <section class="playoff-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Play-Out - Odehrané zápasy
        </h2>
        <div class="matches-grid">
          <div class="match-card past clickable" data-match-id="4222">
            <div class="match-date">4. 10. 2025</div>
            <div class="match-teams">
              <div class="team home">
                <div class="placeholder-logo">ZB</div>
                <span>Sokol Zbečník</span>
              </div>
              <div class="result loss">1:5</div>
              <div class="team away">
                <img src="/images/logo-mini.jpg" alt="NK Opava" />
                <span>NK Opava</span>
              </div>
            </div>
            <div class="match-location">📍 Zbečník</div>
            <div class="match-badge decisive">ROZHODUJÍCÍ</div>
          </div>
          <div class="match-card past clickable" data-match-id="4221">
            <div class="match-date">28. 9. 2025</div>
            <div class="match-teams">
              <div class="team home">
                <img src="/images/logo-mini.jpg" alt="NK Opava" />
                <span>NK Opava</span>
              </div>
              <div class="result win">5:4</div>
              <div class="team away">
                <div class="placeholder-logo">ZB</div>
                <span>Sokol Zbečník</span>
              </div>
            </div>
            <div class="match-location">📍 Opava</div>
          </div>
          <div class="match-card past clickable" data-match-id="4220">
            <div class="match-date">20. 9. 2025</div>
            <div class="match-teams">
              <div class="team home">
                <div class="placeholder-logo">ZB</div>
                <span>Sokol Zbečník</span>
              </div>
              <div class="result loss">5:1</div>
              <div class="team away">
                <img src="/images/logo-mini.jpg" alt="NK Opava" />
                <span>NK Opava</span>
              </div>
            </div>
            <div class="match-location">📍 Zbečník</div>
          </div>
        </div>
      </section>

      <!-- Tabulka ligy -->
      <section class="league-table-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          1. liga mužů po základní části
        </h2>
        <div class="table-container">
          <table class="league-table">
            <thead>
              <tr>
                <th>Pořadí</th>
                <th>Tým</th>
                <th>Z</th>
                <th>V</th>
                <th>R</th>
                <th>P</th>
                <th>Skóre</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              ${leagueTable.map((team, index) => `
                <tr class="${team.name === 'NK Opava' ? 'our-team' : ''}">
                  <td class="position">${index + 1}</td>
                  <td class="team-name">${team.name}</td>
                  <td>${team.matches}</td>
                  <td>${team.wins}</td>
                  <td>${team.draws}</td>
                  <td>${team.losses}</td>
                  <td class="score">${team.goalsFor}:${team.goalsAgainst}</td>
                  <td class="points"><strong>${team.points}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Další odehrané zápasy -->
      <section class="past-matches-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Další odehrané zápasy
        </h2>
        <div class="matches-grid">
          <div class="match-card past">
            <div class="match-date">1. 12. 2024</div>
            <div class="match-teams">
              <div class="team home">
                <img src="/images/logo-mini.jpg" alt="NK Opava" />
                <span>NK Opava</span>
              </div>
              <div class="result win">5:1</div>
              <div class="team away">
                <div class="placeholder-logo">ZB</div>
                <span>Sokol Zbečník</span>
              </div>
            </div>
            <div class="match-gallery">
              <button class="gallery-btn">📸 Fotogalerie (0)</button>
              <button class="gallery-btn">🎥 Videa (0)</button>
            </div>
          </div>
          <div class="match-card past">
            <div class="match-date">17. 11. 2024</div>
            <div class="match-teams">
              <div class="team away">
                <div class="placeholder-logo">HO</div>
                <span>NK Holubice</span>
              </div>
              <div class="result loss">1:5</div>
              <div class="team home">
                <img src="/images/logo-mini.jpg" alt="NK Opava" />
                <span>NK Opava</span>
              </div>
            </div>
            <div class="match-gallery">
              <button class="gallery-btn">📸 Fotogalerie (0)</button>
              <button class="gallery-btn">🎥 Videa (0)</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Napsali o nás -->
      <section class="media-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Napsali o nás
        </h2>
        <div class="media-grid">
          <div class="media-card">
            <a href="https://www.nohec.tv/1l-fries-katem-celakovic/" target="_blank" class="media-link">
              <div class="media-source">📺 nohec.tv</div>
              <h3>1L: Fries katem Čelákovického béčka</h3>
              <p class="media-excerpt">Opava doslova vstala z popela, když dokázala otočit nepříznivý vývoj 1:4 a porazila Zbečník nejtěsnějším způsobem.</p>
              <p class="media-date">2. 10. 2025</p>
            </a>
          </div>
          <div class="media-card">
            <a href="https://www.nohec.tv/1l-v-semifinale-si-prvni-bod-pripsali-favoriti/" target="_blank" class="media-link">
              <div class="media-source">📺 nohec.tv</div>
              <h3>1L: V semifinále si první bod připsali favoriti</h3>
              <p class="media-excerpt">V play out si první dílčí bod připsal Zbečník a Opava je tak na hraně vyřazení ze soutěže.</p>
              <p class="media-date">18. 9. 2025</p>
            </a>
          </div>
        </div>
      </section>

      <!-- Sponzoři -->
      <section class="sponsors-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Naši sponzoři
        </h2>
        <div class="sponsors-grid">
          <div class="sponsor-card">
            <div class="sponsor-placeholder">SPONZOR 1</div>
          </div>
          <div class="sponsor-card">
            <div class="sponsor-placeholder">SPONZOR 2</div>
          </div>
          <div class="sponsor-card">
            <div class="sponsor-placeholder">SPONZOR 3</div>
          </div>
          <div class="sponsor-card">
            <div class="sponsor-placeholder">SPONZOR 4</div>
          </div>
        </div>
      </section>

      <!-- Nábor -->
      <section class="recruitment-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Přidej se k nám!
        </h2>
        <div class="recruitment-content">
          <p>Hledáme nové hráče do našeho týmu. Ať už jsi zkušený nohejbalista nebo začátečník, u nás najdeš přátelskou atmosféru a možnost růstu.</p>
          <ul class="recruitment-benefits">
            <li>✓ Pravidelné tréninky</li>
            <li>✓ Účast v 1. lize mužů</li>
            <li>✓ Zkušený trenér Jan Širocký</li>
            <li>✓ Skvělý kolektiv</li>
          </ul>
          <button class="cta-button primary">Kontaktuj nás</button>
        </div>
      </section>

      <!-- Facebook aktuality -->
      <section class="facebook-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Sledujte nás na Facebooku
        </h2>
        <div class="facebook-feed">
          <a href="https://www.facebook.com/profile.php?id=61550943021274" target="_blank" class="facebook-link">
            <img src="/images/logo-mini.jpg" alt="NK Opava" />
            <div class="facebook-info">
              <h3>Nohejbalový klub Opava</h3>
              <p>@nkopava • Sledovat</p>
            </div>
          </a>
          <div class="facebook-posts">
            <p class="facebook-placeholder">Aktuality z Facebooku se načítají...</p>
          </div>
        </div>
      </section>
    </div>
  `
}

export function setupHomeHandlers() {
  // Event listener pro kliknutí na zápasy - otevře odkaz na nohejbal.org
  const matchCards = document.querySelectorAll('.match-card.clickable')

  // Mapa ID zápasů na URL
  const matchUrls = {
    '4220': 'https://www.nohejbal.org/utkani/4220-zbec-opav',
    '4221': 'https://www.nohejbal.org/utkani/4221-opav-zbec',
    '4222': 'https://www.nohejbal.org/utkani/4222-zbec-opav'
  }

  matchCards.forEach(card => {
    card.addEventListener('click', () => {
      const matchId = card.dataset.matchId
      const url = matchUrls[matchId]

      if (url) {
        window.open(url, '_blank')
      } else {
        console.error('Match URL not found for ID:', matchId)
      }
    })
  })
}
