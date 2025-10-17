/**
 * Centralizovaný systém pro správu všech videí dovedností
 * Agreguje videa z playerSkillAnimations (ProfileDetail.js) a schoolVideos.js
 */

import { schoolVideos } from '../data/schoolVideos.js'
import { players } from '../playerData.js'
import { extraligaTeams } from '../extraligaTeams.js'

/**
 * Extrahuje URL videa z HTML stringu
 * @param {string} htmlString - HTML string obsahující video tag
 * @returns {string|null} - URL videa nebo null
 */
function extractVideoUrl(htmlString) {
  if (typeof htmlString !== 'string') return null

  const match = htmlString.match(/src="([^"]+)"/)
  return match ? match[1] : null
}

/**
 * Získá všechna videa z playerSkillAnimations
 * Importuje je dynamicky z PlayerDetail.js
 */
async function getPlayerSkillAnimationsVideos() {
  try {
    // Importovat playerSkillAnimations z PlayerDetail.js
    const module = await import('../views/PlayerDetail.js')

    // PlayerDetail.js exportuje pouze funkce, ne playerSkillAnimations
    // Musíme videa extrahovat přímo ze schoolVideos nebo jiným způsobem
    // Pro teď vrátíme prázdný objekt a spoléháme se na schoolVideos
    return {}
  } catch (error) {
    console.error('Chyba při načítání playerSkillAnimations:', error)
    return {}
  }
}

/**
 * Najde hráče podle ID napříč všemi týmy
 */
function findPlayerById(playerId) {
  // Hledat v NK Opava
  let player = players.find(p => p.id == playerId)
  if (player) return { player, teamId: 'OPAVA' }

  // Hledat v extraligových týmech
  for (const teamData of extraligaTeams) {
    if (teamData.players) {
      player = teamData.players.find(p => p.id == playerId)
      if (player) return { player, teamId: teamData.id }
    }
  }

  return null
}

/**
 * Agreguje všechna videa ze všech zdrojů
 * @returns {Object} - Objekt ve formátu { skillId: { name, videos: [...] } }
 */
export async function getAllVideos() {
  const aggregatedVideos = {}

  // 1. Začít se schoolVideos jako základem
  for (const [skillId, skillData] of Object.entries(schoolVideos)) {
    aggregatedVideos[skillId] = {
      name: skillData.name,
      videos: [...skillData.videos] // Zkopírovat existující videa
    }
  }

  // 2. Přidat videa z playerSkillAnimations (pokud existují)
  // Zatím se spoléháme pouze na schoolVideos, protože playerSkillAnimations
  // obsahuje HTML stringy a je třeba je zpracovat jinak

  return aggregatedVideos
}

/**
 * Získá videa pro konkrétního hráče a dovednost
 * @param {string|number} playerId - ID hráče
 * @param {number} skillId - ID dovednosti
 * @returns {Array} - Pole videí [{success: true/false, video: url, playerName, teamCode}]
 */
export function getPlayerSkillVideos(playerId, skillId) {
  const videos = []

  // Hledat ve schoolVideos
  if (schoolVideos[skillId] && schoolVideos[skillId].videos) {
    const playerVideos = schoolVideos[skillId].videos.filter(v =>
      v.playerId === playerId || v.playerId === parseInt(playerId)
    )
    videos.push(...playerVideos)
  }

  return videos
}

/**
 * Získá náhled (preview) videa pro dovednost - preferuje úspěšné video
 * @param {number} skillId - ID dovednosti
 * @param {string|number} playerId - (Volitelné) ID hráče pro specifické video
 * @returns {Object|null} - {videoUrl, isSuccess, playerName} nebo null
 */
export function getSkillPreview(skillId, playerId = null) {
  if (!schoolVideos[skillId] || !schoolVideos[skillId].videos || schoolVideos[skillId].videos.length === 0) {
    return null
  }

  let videos = schoolVideos[skillId].videos

  // Pokud je zadán playerId, filtrovat podle něj
  if (playerId) {
    const playerVideos = videos.filter(v =>
      v.playerId === playerId || v.playerId === parseInt(playerId)
    )
    if (playerVideos.length > 0) {
      videos = playerVideos
    }
  }

  // Preferovat úspěšné video
  let selectedVideo = videos.find(v => v.success === true)

  // Pokud není úspěšné, vzít jakékoliv
  if (!selectedVideo && videos.length > 0) {
    selectedVideo = videos[0]
  }

  if (!selectedVideo) return null

  return {
    videoUrl: selectedVideo.video,
    isSuccess: selectedVideo.success,
    playerName: selectedVideo.playerName,
    playerId: selectedVideo.playerId,
    teamCode: selectedVideo.teamCode
  }
}

/**
 * Získá všechny dostupné dovednosti s videi
 * @returns {Array} - Pole ID dovedností, které mají alespoň jedno video
 */
export function getSkillsWithVideos() {
  return Object.keys(schoolVideos)
    .filter(skillId => schoolVideos[skillId].videos && schoolVideos[skillId].videos.length > 0)
    .map(skillId => parseInt(skillId))
}

/**
 * Statistiky videí
 * @returns {Object} - { totalVideos, skillsWithVideos, playerCount }
 */
export function getVideoStats() {
  let totalVideos = 0
  const uniquePlayers = new Set()
  const skillsWithVideos = new Set()

  for (const [skillId, skillData] of Object.entries(schoolVideos)) {
    if (skillData.videos && skillData.videos.length > 0) {
      skillsWithVideos.add(skillId)
      totalVideos += skillData.videos.length

      skillData.videos.forEach(video => {
        if (video.playerId) {
          uniquePlayers.add(video.playerId)
        }
      })
    }
  }

  return {
    totalVideos,
    skillsWithVideos: skillsWithVideos.size,
    playerCount: uniquePlayers.size
  }
}
