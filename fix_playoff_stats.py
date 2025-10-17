import json
import re

# Opravené playoff data - opravené jména aby odpovídaly formátu v souboru
playoff_data = {
    # Modřice
    "Jakub Pospíšil": {"matches": 3, "wins": 3, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 2, "winRate": 100}},
    "Lukáš Rosenberk": {"matches": 3, "wins": 3, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 2, "winRate": 100}},
    "David Višvader": {"matches": 2, "wins": 2, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 2, "wins": 2, "winRate": 100}},
    "Radek Pelikán": {"matches": 1, "wins": 1, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 1, "wins": 1, "winRate": 100}},
    "Pavel Kop": {"matches": 3, "wins": 2, "winRate": 67, "singl": {"matches": 1, "wins": 1, "winRate": 100}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "Michael Svoboda": {"matches": 3, "wins": 2, "winRate": 67, "singl": {"matches": 1, "wins": 1, "winRate": 100}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "Jan Hanus": {"matches": 4, "wins": 2, "winRate": 50, "singl": {"matches": 1, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "František Kalas": {"matches": 1, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 1, "wins": 0, "winRate": 0}},

    # Karlovy Vary
    "Matěj Medek": {"matches": 1, "wins": 1, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 1, "wins": 1, "winRate": 100}},
    "Lukáš Tolar": {"matches": 10, "wins": 9, "winRate": 90, "singl": {"matches": 2, "wins": 1, "winRate": 50}, "dvojice": {"matches": 3, "wins": 3, "winRate": 100}, "trojice": {"matches": 5, "wins": 5, "winRate": 100}},
    "Tobiáš Gregor": {"matches": 8, "wins": 5, "winRate": 63, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 5, "wins": 4, "winRate": 80}},

    # Vsetín
    "Martin Zbranek": {"matches": 4, "wins": 4, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 2, "wins": 2, "winRate": 100}, "trojice": {"matches": 2, "wins": 2, "winRate": 100}},
    "Jan Chalupa": {"matches": 13, "wins": 8, "winRate": 62, "singl": {"matches": 4, "wins": 3, "winRate": 75}, "dvojice": {"matches": 4, "wins": 2, "winRate": 50}, "trojice": {"matches": 5, "wins": 3, "winRate": 60}},
    "Matúš Rácik": {"matches": 5, "wins": 3, "winRate": 60, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 2, "wins": 1, "winRate": 50}, "trojice": {"matches": 3, "wins": 2, "winRate": 67}},
    "Rastislav Tabaka": {"matches": 4, "wins": 2, "winRate": 50, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 4, "wins": 2, "winRate": 50}},
    "Kryštof Ptáček": {"matches": 6, "wins": 3, "winRate": 50, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 0, "winRate": 0}, "trojice": {"matches": 5, "wins": 3, "winRate": 60}},
    "David Dvořák": {"matches": 9, "wins": 4, "winRate": 44, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 4, "wins": 2, "winRate": 50}, "trojice": {"matches": 5, "wins": 2, "winRate": 40}},
    "Daniel Bílý": {"matches": 9, "wins": 4, "winRate": 44, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 4, "wins": 2, "winRate": 50}, "trojice": {"matches": 5, "wins": 2, "winRate": 40}},
    "Rudolf Stařičný": {"matches": 5, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 2, "wins": 0, "winRate": 0}, "trojice": {"matches": 3, "wins": 0, "winRate": 0}},

    # Radomyšl
    "Michal Nepodal": {"matches": 1, "wins": 1, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 1, "wins": 1, "winRate": 100}},
    "Lukáš Hokr": {"matches": 3, "wins": 3, "winRate": 100, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 2, "winRate": 100}},
    "Lukáš Votava": {"matches": 6, "wins": 5, "winRate": 83, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 2, "winRate": 67}, "trojice": {"matches": 3, "wins": 3, "winRate": 100}},
    "Josef Slavíček": {"matches": 8, "wins": 6, "winRate": 75, "singl": {"matches": 2, "wins": 1, "winRate": 50}, "dvojice": {"matches": 3, "wins": 2, "winRate": 67}, "trojice": {"matches": 3, "wins": 3, "winRate": 100}},
    "Jakub Sekáč": {"matches": 6, "wins": 4, "winRate": 67, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 3, "wins": 3, "winRate": 100}},
    "Rudolf Toman": {"matches": 6, "wins": 3, "winRate": 50, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 2, "wins": 1, "winRate": 50}, "trojice": {"matches": 4, "wins": 2, "winRate": 50}},
    "Filip Hokr": {"matches": 7, "wins": 3, "winRate": 43, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 4, "wins": 2, "winRate": 50}},
    "Vladimír Babka": {"matches": 3, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 0, "winRate": 0}, "trojice": {"matches": 2, "wins": 0, "winRate": 0}},

    # Čakovice
    "Jakub Chadim": {"matches": 3, "wins": 2, "winRate": 67, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "Jaroslav Vacek": {"matches": 2, "wins": 1, "winRate": 50, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "Milan Kučera": {"matches": 4, "wins": 2, "winRate": 50, "singl": {"matches": 1, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "Daniel Fík": {"matches": 2, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 2, "wins": 0, "winRate": 0}},
    "Ondřej Pachman": {"matches": 3, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 0, "winRate": 0}, "trojice": {"matches": 2, "wins": 0, "winRate": 0}},
    "David Tůma": {"matches": 3, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 0, "winRate": 0}, "trojice": {"matches": 2, "wins": 0, "winRate": 0}},
    "Tomáš Zelba": {"matches": 2, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 0, "winRate": 0}, "trojice": {"matches": 1, "wins": 0, "winRate": 0}},

    # Čelákovice
    "Michal Kolenský": {"matches": 8, "wins": 3, "winRate": 38, "singl": {"matches": 3, "wins": 1, "winRate": 33}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 2, "wins": 1, "winRate": 50}},
    "Tomáš Andris": {"matches": 6, "wins": 2, "winRate": 33, "singl": {"matches": 3, "wins": 1, "winRate": 33}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 0, "wins": 0, "winRate": 0}},
    "Daniel Matura": {"matches": 3, "wins": 1, "winRate": 33, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Čestmír Čuřík": {"matches": 3, "wins": 1, "winRate": 33, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Vojtěch Holas": {"matches": 6, "wins": 2, "winRate": 33, "singl": {"matches": 3, "wins": 1, "winRate": 33}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Radek Šafr": {"matches": 6, "wins": 2, "winRate": 33, "singl": {"matches": 3, "wins": 1, "winRate": 33}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Petr Nesládek": {"matches": 6, "wins": 2, "winRate": 33, "singl": {"matches": 3, "wins": 1, "winRate": 33}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Václav Kalous": {"matches": 2, "wins": 0, "winRate": 0, "singl": {"matches": 1, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 0, "winRate": 0}, "trojice": {"matches": 0, "wins": 0, "winRate": 0}},

    # Solidarita - opravené jména
    "Tomáš Landrichter": {"matches": 4, "wins": 2, "winRate": 50, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 1, "wins": 1, "winRate": 100}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Martin Kozár": {"matches": 7, "wins": 3, "winRate": 43, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 2, "winRate": 67}, "trojice": {"matches": 4, "wins": 1, "winRate": 25}},
    "Jan Šafránek": {"matches": 7, "wins": 3, "winRate": 43, "singl": {"matches": 1, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 2, "winRate": 67}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Luděk Dvořák": {"matches": 8, "wins": 3, "winRate": 38, "singl": {"matches": 1, "wins": 1, "winRate": 100}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 4, "wins": 1, "winRate": 25}},
    "Ivo Nováček": {"matches": 6, "wins": 2, "winRate": 33, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 2, "wins": 1, "winRate": 50}, "trojice": {"matches": 4, "wins": 1, "winRate": 25}},
    "Matej Prachár": {"matches": 6, "wins": 2, "winRate": 33, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 3, "wins": 1, "winRate": 33}, "trojice": {"matches": 3, "wins": 1, "winRate": 33}},
    "Daniel Mikula": {"matches": 1, "wins": 0, "winRate": 0, "singl": {"matches": 0, "wins": 0, "winRate": 0}, "dvojice": {"matches": 0, "wins": 0, "winRate": 0}, "trojice": {"matches": 1, "wins": 0, "winRate": 0}},
}

# Load the extraligaTeams.js file
with open('src/extraligaTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

def add_playoff_to_player(player_text, player_name):
    """Add playoff stats to a player if they exist in our data"""
    if player_name not in playoff_data:
        return player_text

    # Check if player already has playoff data
    if '"playoff":' in player_text:
        print(f"  {player_name} uz ma playoff data - preskakuji")
        return player_text

    playoff = playoff_data[player_name]

    # Try to find insertion point - multiple patterns
    patterns = [
        (r'(\s*\],\s*"availableSkills":)', 'availableSkills'),  # After seasonStats, before availableSkills
        (r'(\s*\],\s*"typicalPositions":)', 'typicalPositions'),  # After seasonStats, before typicalPositions
        (r'(\s*\},\s*"typicalPositions":)', 'typicalPositions after regularSeason'),  # After regularSeason, before typicalPositions
        (r'(\s*\},\s*"availableSkills":)', 'availableSkills after regularSeason'),  # After regularSeason, before availableSkills
    ]

    playoff_json = f''',
        "playoff": {{
          "matches": {playoff['matches']},
          "wins": {playoff['wins']},
          "winRate": {playoff['winRate']},
          "singl": {{
            "matches": {playoff['singl']['matches']},
            "wins": {playoff['singl']['wins']},
            "winRate": {playoff['singl']['winRate']}
          }},
          "dvojice": {{
            "matches": {playoff['dvojice']['matches']},
            "wins": {playoff['dvojice']['wins']},
            "winRate": {playoff['dvojice']['winRate']}
          }},
          "trojice": {{
            "matches": {playoff['trojice']['matches']},
            "wins": {playoff['trojice']['wins']},
            "winRate": {playoff['trojice']['winRate']}
          }}
        }}'''

    for pattern, pattern_name in patterns:
        updated = re.sub(pattern, playoff_json + r'\1', player_text)
        if updated != player_text:
            print(f"  Pridany playoff statistiky pro {player_name} (using {pattern_name})")
            return updated

    print(f"  Nepodarilo se pridat playoff data pro {player_name} - pattern nenalezen")
    return player_text

# Process the file - find all player blocks
player_pattern = r'\{\s*"id": "[A-Z]{4}_\d+",\s*"name": "([^"]+)"[\s\S]*?\}(?=,?\s*\{[^{]*"id": "[A-Z]{4}_\d+"|,?\s*\]\s*\})'

def process_player(match):
    player_name = match.group(1)
    player_text = match.group(0)
    return add_playoff_to_player(player_text, player_name)

updated_content = re.sub(player_pattern, process_player, content)

# Save the updated file
with open('src/extraligaTeams.js', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("\nPlayoff statistiky byly uspesne doplneny!")
