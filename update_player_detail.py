import json
import re

# Load animation info
with open('created_animations.json', 'r', encoding='utf-8') as f:
    animations = json.load(f)

print(f"Loading {len(animations)} animations...")

# Group by player
player_animations = {}
for anim in animations:
    player_id = anim['player_id']
    if player_id not in player_animations:
        player_animations[player_id] = []
    player_animations[player_id].append(anim)

print(f"Found animations for {len(player_animations)} players")

# Read PlayerDetail.js
with open('src/views/PlayerDetail.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Generate import statements
import_statements = []
for anim in sorted(animations, key=lambda x: x['const_name']):
    import_line = f"import {{ {anim['const_name']} }} from '../animations/{anim['anim_file']}'"
    import_statements.append(import_line)

# Find the import section and add new imports after existing animation imports
# Look for the last animation import
last_import_match = re.search(r"(import \{[^}]+\} from '\.\./animations/[^']+\.js')", content)
if last_import_match:
    insert_pos = content.find('\n', last_import_match.end())
    new_imports = '\n'.join(import_statements)
    content = content[:insert_pos] + '\n' + new_imports + content[insert_pos:]
    print("Added import statements")

# Generate playerSkillAnimations object
player_skill_map = {}
for player_id, player_anims in player_animations.items():
    player_skill_map[player_id] = {}
    for anim in player_anims:
        skill_id = anim['skill_id']
        const_name = anim['const_name']
        player_skill_map[player_id][skill_id] = const_name

# Find the playerSkillAnimations const
pattern = r'const playerSkillAnimations = \{[^}]*(?:\{[^}]*\}[^}]*)*\}'
match = re.search(pattern, content, re.DOTALL)

if match:
    # Build new mapping
    lines = ["const playerSkillAnimations = {"]

    for player_id in sorted(player_skill_map.keys(), key=str):
        lines.append(f"  '{player_id}': {{")
        for skill_id in sorted(player_skill_map[player_id].keys()):
            const_name = player_skill_map[player_id][skill_id]
            lines.append(f"    {skill_id}: {const_name},")
        lines.append("  },")

    lines.append("}")
    new_mapping = '\n'.join(lines)

    # Replace old mapping
    content = content[:match.start()] + new_mapping + content[match.end():]
    print("Updated playerSkillAnimations mapping")

# Write updated file
with open('src/views/PlayerDetail.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\\nPlayerDetail.js has been updated!")
print(f"  - Added {len(import_statements)} import statements")
print(f"  - Updated mappings for {len(player_animations)} players")
