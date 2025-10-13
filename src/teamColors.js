// Definice barev týmů podle jejich log
export const teamColors = {
  // 1. liga muži
  OPAVA: {
    primary: '#DC2F3E',    // Červená
    secondary: '#FFFFFF',  // Bílá
    accent: '#000000'      // Černá
  },

  // Extraliga muži
  MODR: {
    primary: '#0052A5',    // Modrá
    secondary: '#FFFFFF',  // Bílá
    accent: '#FFD700'      // Zlatá
  },
  CAKO: {
    primary: '#1E3A8A',    // Tmavě modrá
    secondary: '#FFFFFF',  // Bílá
    accent: '#DC2626'      // Červená
  },
  KVAR: {
    primary: '#DC2626',    // Červená
    secondary: '#FFFFFF',  // Bílá
    accent: '#1E40AF'      // Modrá
  },
  VSET: {
    primary: '#059669',    // Zelená
    secondary: '#FFFFFF',  // Bílá
    accent: '#000000'      // Černá
  },
  ZATEC: {
    primary: '#7C3AED',    // Fialová
    secondary: '#FFFFFF',  // Bílá
    accent: '#FCD34D'      // Žlutá
  },
  RADO: {
    primary: '#059669',    // Zelená
    secondary: '#FCD34D',  // Žlutá
    accent: '#000000'      // Černá
  },
  SOLI: {
    primary: '#DC2626',    // Červená
    secondary: '#FFFFFF',  // Bílá
    accent: '#1E3A8A'      // Modrá
  },
  CELA: {
    primary: '#1E40AF',    // Modrá
    secondary: '#FFFFFF',  // Bílá
    accent: '#DC2626'      // Červená
  },
  HOLU: {
    primary: '#0891B2',    // Tyrkysová
    secondary: '#FFFFFF',  // Bílá
    accent: '#64748B'      // Šedá
  },

  // 1. liga muži - ostatní týmy
  REPO: {
    primary: '#DC2626',    // Červená
    secondary: '#FFFFFF',  // Bílá
    accent: '#000000'      // Černá
  },
  PEKLO: {
    primary: '#DC2626',    // Červená
    secondary: '#F59E0B',  // Oranžová
    accent: '#000000'      // Černá
  },
  CBROD: {
    primary: '#1E40AF',    // Modrá
    secondary: '#FFFFFF',  // Bílá
    accent: '#DC2626'      // Červená
  },
  ZBEC: {
    primary: '#059669',    // Zelená
    secondary: '#FFFFFF',  // Bílá
    accent: '#000000'      // Černá
  },
  MODR_B: {
    primary: '#0052A5',    // Modrá (stejná jako Modřice A)
    secondary: '#FFFFFF',  // Bílá
    accent: '#FFD700'      // Zlatá
  },
  CELA_B: {
    primary: '#1E40AF',    // Modrá (stejná jako Čelákovice A)
    secondary: '#FFFFFF',  // Bílá
    accent: '#DC2626'      // Červená
  }
}

// Funkce pro získání barev týmu
export function getTeamColors(teamId) {
  return teamColors[teamId] || teamColors.OPAVA  // Default na barvy Opavy
}
