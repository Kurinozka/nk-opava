// Script to add availableSkills [16, 17] to all extraliga players

import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'extraligaTeams.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace patterns for players that don't have availableSkills yet
// This regex finds player objects and adds availableSkills before typicalPositions or seasonStats

// Pattern 1: Before typicalPositions
content = content.replace(
  /(\s+)(seasonStats:\s*\[[\s\S]*?\]\s*)(,?\s*typicalPositions:)/g,
  '$1$2,\n$1availableSkills: [16, 17]$3'
);

// Pattern 2: Before closing brace (for players without typicalPositions)
// Find seasonStats array followed by closing brace with no availableSkills in between
content = content.replace(
  /(\s+seasonStats:\s*\[[\s\S]*?\]\s*)(,?\s*)(\n\s+}(?=,?\s*\n\s+\{|\n\s+\]|$))/g,
  (match, p1, p2, p3) => {
    // Only add if not already present
    if (match.includes('availableSkills')) {
      return match;
    }
    return p1 + ',\n        availableSkills: [16, 17]' + p3;
  }
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully added availableSkills [16, 17] to all players!');
