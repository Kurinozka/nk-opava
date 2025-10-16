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
          <div class="baraz-date">25. 10. 2025 • 14:00</div>
          <div class="baraz-teams">
            <div class="team home">
              <div class="team-logo-link" data-nav="team" title="NK Opava - Náš tým">
                <img src="/images/logo-nove.jpg" alt="NK Opava" />
              </div>
              <span>NK Opava</span>
            </div>
            <div class="vs">VS</div>
            <div class="team away">
              <a href="https://www.nohejbal.org/klub/26-nk-janovice-nad-uhlavou?season=2025&league=154#submenu" target="_blank" title="NK Janovice nad Úhlavou">
                <img src="https://www.nohejbal.org/photo/team/team_26.png" alt="NK Janovice nad Úhlavou" />
              </a>
              <span>Janovice nad Úhlavou</span>
            </div>
          </div>
          <div class="baraz-location">📍 Tělocvična Obchodní akademie Opava, Hany Kvapilové 20, Opava</div>
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

      <!-- Škola nohejbalu -->
      <section class="school-promo-section">
        <h2 class="section-title">
          <span class="hexagon-icon"></span>
          Škola nohejbalu
        </h2>
        <div class="school-promo-card">
          <div class="school-promo-content">
            <div class="school-promo-icon">🎓</div>
            <h3>Chcete začít hrát nohejbal?</h3>
            <p>Nebo nohejbal hrajete a chcete se naučit nebo zlepšit některé údery? Učte se od těch nejlepších.... jak to dělat i jak to nedělat. Samozvaný kouč <strong>Okurka</strong> možná přispěje troškou své vlastní teorie.</p>
            <ul class="school-features">
              <li>📹 Videa úspěšných i neúspěšných dovedností</li>
              <li>🎯 Filtrování podle dovedností a hráčů</li>
              <li>🐌 Možnost zpomalit videa pro lepší analýzu</li>
              <li>💬 Komentáře Okurky k jednotlivým technikám</li>
            </ul>
            <button class="cta-button primary" data-nav="school">
              <span class="hexagon-bg"></span>
              <span class="button-text">Vstoupit do školy</span>
            </button>
          </div>
          <div class="school-promo-image">
            <img src="/players/kurka.jpg" alt="Okurka - kouč" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%2370B85E%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🥒%3C/text%3E%3C/svg%3E'" />
            <div class="coach-badge">Samozvaný kouč Okurka</div>
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
