import { playerData } from '../playerData.js'

let currentUser = null

const ADMIN_CREDENTIALS = {
  email: 'admin@nkopava.cz',
  password: 'nkopava2025'
}

function checkAuth() {
  const user = localStorage.getItem('adminUser')
  if (user) {
    currentUser = JSON.parse(user)
    return true
  }
  return false
}

function login(email, password) {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    currentUser = { email, loginTime: Date.now() }
    localStorage.setItem('adminUser', JSON.stringify(currentUser))
    return true
  }
  return false
}

function logout() {
  localStorage.removeItem('adminUser')
  currentUser = null
  renderAdmin()
}

function renderLoginForm() {
  return `
    <div class="admin-login-container">
      <div class="admin-login-card">
        <h1>🏠 NK Opava - Admin</h1>
        <form id="admin-login-form" class="admin-login-form">
          <div class="admin-form-group">
            <label>Email:</label>
            <input type="email" id="admin-email" required placeholder="admin@nkopava.cz">
          </div>
          <div class="admin-form-group">
            <label>Heslo:</label>
            <input type="password" id="admin-password" required placeholder="••••••••">
          </div>
          <button type="submit" class="admin-btn-primary">Přihlásit se</button>
          <div id="login-error" class="admin-error"></div>
        </form>
      </div>
    </div>
  `
}

function renderDashboard() {
  return `
    <div class="admin-container">
      <div class="admin-header">
        <h1>🏠 NK Opava - Admin Panel</h1>
        <div class="admin-user-info">
          <span>${currentUser.email}</span>
          <button id="admin-logout-btn" class="admin-btn-secondary">Odhlásit se</button>
        </div>
      </div>

      <div class="admin-menu">
        <button class="admin-menu-btn active" data-section="videos">
          📹 Správa videí
        </button>
        <button class="admin-menu-btn" data-section="players">
          👥 Správa hráčů
        </button>
        <button class="admin-menu-btn" data-section="teams">
          🏆 Správa týmů
        </button>
        <button class="admin-menu-btn" data-section="stats">
          📊 Statistiky
        </button>
        <button class="admin-menu-btn" data-section="settings">
          ⚙️ Nastavení
        </button>
      </div>

      <div id="admin-content" class="admin-content">
        ${renderVideoManagement()}
      </div>
    </div>
  `
}

function renderVideoManagement() {
  const players = playerData.filter(p => p.position !== 'Trenér')

  return `
    <div class="admin-section">
      <h2>📹 Správa videí k dovednostem</h2>

      <div class="admin-search">
        <input type="text" id="player-search" placeholder="🔍 Hledej hráče..." class="admin-search-input">
      </div>

      <div id="players-list" class="admin-players-grid">
        ${players.map(player => `
          <div class="admin-player-card" data-player-id="${player.id}">
            <img src="${player.photo}" alt="${player.name}" class="admin-player-photo">
            <div class="admin-player-info">
              <h3>${player.name}</h3>
              <span class="admin-player-number">#${player.number}</span>
            </div>
            <button class="admin-btn-small" onclick="window.adminApp.openPlayerVideos(${player.id})">
              Spravovat videa
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function openPlayerVideos(playerId) {
  const player = playerData.find(p => p.id === playerId)
  if (!player) return

  const skills = [
    { id: 1, name: 'Smeč přes blok', param: 'smecPresBlok' },
    { id: 2, name: 'Smeč do béčka', param: 'smecDoBecka' },
    { id: 3, name: 'Smeč pod sebe', param: 'smecPodSebe' },
    { id: 4, name: 'Smeč do áčka', param: 'smecDoAcka' },
    { id: 5, name: 'Smeč do paty', param: 'smecDoPaty' },
    { id: 6, name: 'Smeč do středu', param: 'smecDoStredu' },
    { id: 7, name: 'Kraťas za blok', param: 'kratasZaBlok' },
    { id: 8, name: 'Kraťas pod sebe', param: 'kratasPodSebe' },
    { id: 9, name: 'Skákaná smeč', param: 'skakanáSmeč' },
    { id: 10, name: 'Tupá rána', param: 'tupáRána' },
    { id: 11, name: 'Klepák', param: 'klepák' },
    { id: 12, name: 'Blok', param: 'blok' },
    { id: 13, name: 'Vytlučený blok', param: 'vytlučenýBlok' },
    { id: 14, name: 'Smečovaný servis', param: 'smečovanýServis' },
    { id: 15, name: 'Nesmysl', param: 'nesmysl' }
  ]

  const content = `
    <div class="admin-section">
      <button class="admin-btn-back" onclick="window.adminApp.backToVideoManagement()">
        ← Zpět na seznam hráčů
      </button>

      <div class="admin-player-header">
        <img src="${player.photo}" alt="${player.name}" class="admin-player-photo-large">
        <div>
          <h2>${player.name} (#${player.number})</h2>
          <p>${player.team} - ${player.position}</p>
        </div>
      </div>

      <h3>Dovednosti a videa</h3>
      <div class="admin-skills-list">
        ${skills.map(skill => `
          <div class="admin-skill-item">
            <div class="admin-skill-info">
              <strong>${skill.name}</strong>
              <span class="admin-skill-status">
                ${player.videos?.[skill.param] ? '✅ Má video' : '⭕ Chybí video'}
              </span>
            </div>
            <button class="admin-btn-upload" onclick="window.adminApp.uploadVideo(${player.id}, '${skill.param}', '${skill.name}')">
              📹 ${player.videos?.[skill.param] ? 'Změnit' : 'Nahrát'} video
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `

  document.getElementById('admin-content').innerHTML = content
}

function uploadVideo(playerId, skillParam, skillName) {
  const player = playerData.find(p => p.id === playerId)

  const modal = document.createElement('div')
  modal.className = 'admin-modal'
  modal.innerHTML = `
    <div class="admin-modal-content">
      <h3>Nahrát video: ${skillName}</h3>
      <p>Hráč: ${player.name}</p>

      <div class="admin-upload-area" id="upload-area">
        <input type="file" id="video-file" accept="video/*" style="display: none">
        <div class="admin-upload-placeholder">
          <span class="admin-upload-icon">📹</span>
          <p>Klikni nebo přetáhni video sem</p>
          <small>Podporované formáty: MP4, MOV, AVI</small>
        </div>
      </div>

      <div id="upload-preview" style="display: none;">
        <video id="preview-video" controls style="max-width: 100%; max-height: 300px;"></video>
        <div class="admin-form-group">
          <label>Úspěšnost:</label>
          <select id="video-success">
            <option value="success">✅ Úspěšná</option>
            <option value="fail">❌ Neúspěšná</option>
          </select>
        </div>
      </div>

      <div class="admin-modal-actions">
        <button class="admin-btn-secondary" onclick="window.adminApp.closeModal()">Zrušit</button>
        <button class="admin-btn-primary" id="save-video-btn" disabled>Uložit</button>
      </div>

      <div id="upload-status" class="admin-upload-status"></div>
    </div>
  `

  document.body.appendChild(modal)

  const uploadArea = modal.querySelector('#upload-area')
  const fileInput = modal.querySelector('#video-file')
  const preview = modal.querySelector('#upload-preview')
  const previewVideo = modal.querySelector('#preview-video')
  const saveBtn = modal.querySelector('#save-video-btn')
  const statusDiv = modal.querySelector('#upload-status')

  uploadArea.onclick = () => fileInput.click()

  uploadArea.ondragover = (e) => {
    e.preventDefault()
    uploadArea.classList.add('dragover')
  }

  uploadArea.ondragleave = () => {
    uploadArea.classList.remove('dragover')
  }

  uploadArea.ondrop = (e) => {
    e.preventDefault()
    uploadArea.classList.remove('dragover')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      handleVideoFile(file)
    }
  }

  fileInput.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleVideoFile(file)
    }
  }

  function handleVideoFile(file) {
    const url = URL.createObjectURL(file)
    previewVideo.src = url
    preview.style.display = 'block'
    uploadArea.style.display = 'none'
    saveBtn.disabled = false
    saveBtn.dataset.file = url
    saveBtn.dataset.fileName = file.name
  }

  saveBtn.onclick = () => {
    const fileName = saveBtn.dataset.fileName
    const success = modal.querySelector('#video-success').value

    statusDiv.innerHTML = `
      <div class="admin-alert admin-alert-info">
        ℹ️ Ukládám video... (simulace)
      </div>
    `

    setTimeout(() => {
      statusDiv.innerHTML = `
        <div class="admin-alert admin-alert-success">
          ✅ Video "${fileName}" bylo úspěšně nahráno!<br>
          <small>V produkční verzi by se video nahrál do cloud storage a aktualizovaly se data.</small>
        </div>
      `

      setTimeout(() => {
        closeModal()
        openPlayerVideos(playerId)
      }, 2000)
    }, 1500)
  }
}

function closeModal() {
  const modal = document.querySelector('.admin-modal')
  if (modal) {
    modal.remove()
  }
}

function backToVideoManagement() {
  document.getElementById('admin-content').innerHTML = renderVideoManagement()
  setupSearch()
}

function setupSearch() {
  const searchInput = document.getElementById('player-search')
  if (searchInput) {
    searchInput.oninput = (e) => {
      const query = e.target.value.toLowerCase()
      const cards = document.querySelectorAll('.admin-player-card')
      cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase()
        card.style.display = name.includes(query) ? 'block' : 'none'
      })
    }
  }
}

export function renderAdmin() {
  const isAuth = checkAuth()

  const html = isAuth ? renderDashboard() : renderLoginForm()

  const appDiv = document.getElementById('app')
  appDiv.innerHTML = html

  if (!isAuth) {
    document.getElementById('admin-login-form').onsubmit = (e) => {
      e.preventDefault()
      const email = document.getElementById('admin-email').value
      const password = document.getElementById('admin-password').value

      if (login(email, password)) {
        renderAdmin()
      } else {
        document.getElementById('login-error').textContent = 'Nesprávné přihlašovací údaje'
      }
    }
  } else {
    document.getElementById('admin-logout-btn').onclick = logout

    document.querySelectorAll('.admin-menu-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.admin-menu-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        const section = btn.dataset.section
        const content = document.getElementById('admin-content')

        if (section === 'videos') {
          content.innerHTML = renderVideoManagement()
          setupSearch()
        } else {
          content.innerHTML = `
            <div class="admin-section">
              <h2>${btn.textContent}</h2>
              <p class="admin-placeholder">Tato sekce bude implementována v další fázi.</p>
            </div>
          `
        }
      }
    })

    setupSearch()
  }
}

window.adminApp = {
  openPlayerVideos,
  uploadVideo,
  closeModal,
  backToVideoManagement
}
