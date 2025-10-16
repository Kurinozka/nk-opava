import { schoolVideos, okurkaComments } from '../data/schoolVideos.js'
import { skills } from '../playerData.js'

let currentVideoIndex = 0
let allVideos = []
let filteredVideos = []
let currentPlaybackRate = 1.0

export function createSchoolOfNohejbalView() {
  // Získat všechny videa a náhodně je zamíchat
  allVideos = []
  Object.keys(schoolVideos).forEach(skillId => {
    schoolVideos[skillId].videos.forEach(video => {
      allVideos.push({
        ...video,
        skillId: parseInt(skillId),
        skillName: schoolVideos[skillId].name
      })
    })
  })

  // Zamíchat videa náhodně
  allVideos = shuffleArray(allVideos)
  filteredVideos = [...allVideos]
  currentVideoIndex = 0

  // Získat všechny unikátní hráče
  const allPlayers = new Set()
  allVideos.forEach(video => {
    allPlayers.add(JSON.stringify({ id: video.playerId, name: video.playerName }))
  })
  const sortedPlayers = Array.from(allPlayers)
    .map(p => JSON.parse(p))
    .sort((a, b) => a.name.localeCompare(b.name, 'cs'))

  return `
    <div class="school-container">
      <div class="school-header">
        <h1>Škola nohejbalu</h1>
        <p class="school-subtitle">Učte se od těch nejlepších... jak to dělat i jak to nedělat</p>
        <p class="school-coach">🎓 Samozvaný kouč: <strong>Okurka</strong></p>
      </div>

      <div class="school-content">
        <!-- Video přehrávač -->
        <div class="school-video-section">
          <div class="video-player-container">
            <video id="school-video" class="school-video" controls>
              <source src="${filteredVideos[0]?.video || ''}" type="video/mp4">
              Váš prohlížeč nepodporuje video.
            </video>
            <div class="video-info">
              <div class="video-skill-badge ${filteredVideos[0]?.success ? 'success' : 'fail'}">
                ${filteredVideos[0]?.success ? '✓ Úspěšná' : '✗ Neúspěšná'}
              </div>
              <h3 class="video-skill-name">${filteredVideos[0]?.skillName || ''}</h3>
              <p class="video-player-name">👤 ${filteredVideos[0]?.playerName || ''}</p>
            </div>
          </div>

          <!-- Ovládání přehrávání -->
          <div class="video-controls">
            <button class="control-btn prev-btn" id="prev-video">
              ← Předchozí
            </button>
            <button class="control-btn random-btn" id="random-video">
              🎲 Náhodné
            </button>
            <button class="control-btn next-btn" id="next-video">
              Další →
            </button>
          </div>

          <!-- Rychlost přehrávání -->
          <div class="playback-speed">
            <label>Rychlost přehrávání:</label>
            <div class="speed-buttons">
              <button class="speed-btn" data-speed="0.25">0.25x</button>
              <button class="speed-btn" data-speed="0.5">0.5x</button>
              <button class="speed-btn" data-speed="0.75">0.75x</button>
              <button class="speed-btn active" data-speed="1">1x</button>
              <button class="speed-btn" data-speed="1.25">1.25x</button>
              <button class="speed-btn" data-speed="1.5">1.5x</button>
              <button class="speed-btn" data-speed="2">2x</button>
            </div>
          </div>
        </div>

        <!-- Filtry -->
        <div class="school-filters">
          <h2>Filtry</h2>

          <!-- Filtr dovedností -->
          <div class="filter-group">
            <label>Dovednost:</label>
            <select id="skill-filter" class="filter-select">
              <option value="all">Všechny dovednosti</option>
              ${Object.keys(schoolVideos).map(skillId => `
                <option value="${skillId}">${schoolVideos[skillId].name} (${schoolVideos[skillId].videos.length})</option>
              `).join('')}
            </select>
          </div>

          <!-- Filtr hráčů -->
          <div class="filter-group">
            <label>Hráč:</label>
            <select id="player-filter" class="filter-select">
              <option value="all">Všichni hráči</option>
              ${sortedPlayers.map(player => `
                <option value="${player.id}">${player.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Filtr úspěšnosti -->
          <div class="filter-group">
            <label>Typ:</label>
            <select id="success-filter" class="filter-select">
              <option value="all">Úspěšné i neúspěšné</option>
              <option value="success">Pouze úspěšné</option>
              <option value="fail">Pouze neúspěšné</option>
            </select>
          </div>

          <button class="reset-filters-btn" id="reset-filters">Resetovat filtry</button>

          <div class="video-counter">
            <p>Zobrazeno videí: <strong><span id="video-count">${filteredVideos.length}</span> z ${allVideos.length}</strong></p>
          </div>
        </div>
      </div>

      <!-- Komentář Okurky -->
      <div class="okurka-comment-section" id="okurka-comment" style="display: none;">
        <div class="okurka-avatar">
          <img src="/players/kurka.jpg" alt="Okurka" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%2370B85E%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22white%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E🥒%3C/text%3E%3C/svg%3E'">
          <div class="okurka-badge">Okurka</div>
        </div>
        <div class="okurka-comment-content">
          <h3 class="okurka-comment-title"></h3>
          <p class="okurka-comment-text"></p>
        </div>
      </div>
    </div>
  `
}

export function setupSchoolOfNohejbalHandlers() {
  const video = document.getElementById('school-video')
  const prevBtn = document.getElementById('prev-video')
  const nextBtn = document.getElementById('next-video')
  const randomBtn = document.getElementById('random-video')
  const skillFilter = document.getElementById('skill-filter')
  const playerFilter = document.getElementById('player-filter')
  const successFilter = document.getElementById('success-filter')
  const resetFiltersBtn = document.getElementById('reset-filters')
  const speedButtons = document.querySelectorAll('.speed-btn')

  // Nastavit rychlost přehrávání
  if (video) {
    video.playbackRate = currentPlaybackRate
  }

  // Ovládání rychlosti
  speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed)
      currentPlaybackRate = speed
      if (video) {
        video.playbackRate = speed
      }

      // Aktualizovat aktivní tlačítko
      speedButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    })
  })

  // Přepnutí na další video
  nextBtn.addEventListener('click', () => {
    currentVideoIndex = (currentVideoIndex + 1) % filteredVideos.length
    updateVideo()
  })

  // Přepnutí na předchozí video
  prevBtn.addEventListener('click', () => {
    currentVideoIndex = (currentVideoIndex - 1 + filteredVideos.length) % filteredVideos.length
    updateVideo()
  })

  // Náhodné video
  randomBtn.addEventListener('click', () => {
    currentVideoIndex = Math.floor(Math.random() * filteredVideos.length)
    updateVideo()
  })

  // Auto-play dalšího videa po dokončení - opakuj ve smyčce dokud se nezmění filtr
  video.addEventListener('ended', () => {
    if (filteredVideos.length === 0) return

    // Přejít na další video, pokud jsme na konci, začít znovu od začátku
    currentVideoIndex = (currentVideoIndex + 1) % filteredVideos.length
    updateVideo()
  })

  // Filtr dovedností
  skillFilter.addEventListener('change', (e) => {
    const selectedSkill = e.target.value
    applyFilters()

    // Zobrazit komentář Okurky, pokud je vybraná konkrétní dovednost
    if (selectedSkill !== 'all') {
      showOkurkaComment(parseInt(selectedSkill))
    } else {
      hideOkurkaComment()
    }
  })

  // Filtr hráčů
  playerFilter.addEventListener('change', () => {
    applyFilters()
  })

  // Filtr úspěšnosti
  successFilter.addEventListener('change', () => {
    applyFilters()
  })

  // Reset filtrů
  resetFiltersBtn.addEventListener('click', () => {
    skillFilter.value = 'all'
    playerFilter.value = 'all'
    successFilter.value = 'all'
    hideOkurkaComment()
    applyFilters()
  })

  function applyFilters() {
    const selectedSkill = skillFilter.value
    const selectedPlayer = playerFilter.value
    const selectedSuccess = successFilter.value

    filteredVideos = allVideos.filter(video => {
      // Filtr dovednosti
      if (selectedSkill !== 'all' && video.skillId !== parseInt(selectedSkill)) {
        return false
      }

      // Filtr hráče
      if (selectedPlayer !== 'all' && video.playerId !== selectedPlayer) {
        return false
      }

      // Filtr úspěšnosti
      if (selectedSuccess === 'success' && !video.success) {
        return false
      }
      if (selectedSuccess === 'fail' && video.success) {
        return false
      }

      return true
    })

    // Aktualizovat počítadlo
    document.getElementById('video-count').textContent = filteredVideos.length

    // Reset indexu a přehrát první video
    if (filteredVideos.length > 0) {
      currentVideoIndex = 0
      updateVideo()
    }
  }

  function updateVideo() {
    if (filteredVideos.length === 0) {
      return
    }

    const currentVideo = filteredVideos[currentVideoIndex]

    // Aktualizovat video
    video.src = currentVideo.video
    video.playbackRate = currentPlaybackRate
    video.load()

    // Automaticky přehrát video po načtení
    video.addEventListener('loadeddata', () => {
      video.play().catch(err => {
        console.log('Autoplay was prevented:', err)
      })
    }, { once: true })

    // Aktualizovat info
    document.querySelector('.video-skill-badge').textContent =
      currentVideo.success ? '✓ Úspěšná' : '✗ Neúspěšná'
    document.querySelector('.video-skill-badge').className =
      `video-skill-badge ${currentVideo.success ? 'success' : 'fail'}`
    document.querySelector('.video-skill-name').textContent = currentVideo.skillName
    document.querySelector('.video-player-name').textContent = `👤 ${currentVideo.playerName}`
  }

  function showOkurkaComment(skillId) {
    const comment = okurkaComments[skillId]
    if (!comment) {
      hideOkurkaComment()
      return
    }

    const commentSection = document.getElementById('okurka-comment')
    commentSection.style.display = 'flex'
    document.querySelector('.okurka-comment-title').textContent = comment.title
    document.querySelector('.okurka-comment-text').textContent = comment.comment
  }

  function hideOkurkaComment() {
    document.getElementById('okurka-comment').style.display = 'none'
  }

  // Automaticky přehrát první video při načtení stránky
  if (video && filteredVideos.length > 0) {
    video.addEventListener('loadeddata', () => {
      video.play().catch(err => {
        console.log('Autoplay was prevented:', err)
      })
    }, { once: true })
  }
}

// Pomocná funkce pro náhodné zamíchání pole
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
