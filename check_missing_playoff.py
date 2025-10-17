import re

# All players from playoff data
playoff_players = [
    "Jakub Pospíšil", "Lukáš Rosenberk", "David Višvader", "Radek Pelikán", "Pavel Kop", "Michael Svoboda", "Jan Hanus", "František Kalas",
    "Matěj Medek", "Lukáš Tolar", "Tobiáš Gregor",
    "Martin Zbranek", "Jan Chalupa", "Matúš Rácik", "Rastislav Tabaka", "Kryštof Ptáček", "David Dvořák", "Daniel Bílý", "Rudolf Stařičný",
    "Michal Nepodal", "Lukáš Hokr", "Lukáš Votava", "Josef Slavíček", "Jakub Sekáč", "Rudolf Toman", "Filip Hokr", "Vladimír Babka",
    "Jakub Chadim", "Jaroslav Vacek", "Milan Kučera", "Daniel Fík", "Ondřej Pachman", "David Tůma", "Tomáš Zelba",
    "Michal Kolenský", "Tomáš Andris", "Daniel Matura", "Čestmír Čuřík", "Vojtěch Holas", "Radek Šafr", "Petr Nesládek", "Václav Kalous",
    "Tomáš Landrichter", "Martin Kozár", "Jan Šafránek", "Luděk Dvořák", "Ivo Nováček", "Matej Prachár", "Daniel Mikula"
]

# Load the file
with open('src/extraligaTeams.js', 'r', encoding='utf-8') as f:
    content = f.read()

missing = []
found = []

for player in playoff_players:
    # Search for the player and check if they have playoff data
    # Pattern: find the player name, then check if playoff appears before the next player
    player_pattern = f'"name": "{re.escape(player)}"'

    if player_pattern.replace('\\', '') not in content:
        missing.append(f"{player} - NOT IN FILE")
        continue

    # Find player position and check for playoff within that player's block
    pos = content.find(f'"name": "{player}"')
    if pos == -1:
        missing.append(f"{player} - NOT FOUND")
        continue

    # Find the next player block (starts with "id":)
    next_player = content.find('"id":', pos + 1)
    if next_player == -1:
        next_player = len(content)

    player_block = content[pos:next_player]

    if '"playoff":' in player_block:
        found.append(player)
    else:
        missing.append(player)

print(f"\nHraci S playoff daty: {len(found)}")
print(f"Hraci BEZ playoff dat: {len(missing)}\n")

if missing:
    print("Hraci BEZ playoff dat:")
    for p in missing:
        print(f"  - {p}")
