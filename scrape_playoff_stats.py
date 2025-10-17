import requests
from bs4 import BeautifulSoup
import json

url = "https://www.nohejbal.org/soutez/statistiky/142-extraliga-muzi-play-off-out?stage=2"

response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Najít tabulku se statistikami
table = soup.find('table', class_='stats-table') or soup.find('table')

players = []

if table:
    rows = table.find_all('tr')[1:]  # Skip header
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= 6:
            name = cols[1].text.strip()
            team = cols[2].text.strip()
            matches = int(cols[3].text.strip())
            wins = int(cols[4].text.strip())
            losses = int(cols[5].text.strip())
            win_rate = int(cols[6].text.strip().replace('%', ''))

            players.append({
                'name': name,
                'team': team,
                'matches': matches,
                'wins': wins,
                'losses': losses,
                'winRate': win_rate
            })

# Uložit do JSON
with open('playoff_stats.json', 'w', encoding='utf-8') as f:
    json.dump(players, f, ensure_ascii=False, indent=2)

print(f"Staženo {len(players)} hráčů")
for player in players:
    print(f"{player['name']}|{player['team']}|{player['matches']}|{player['wins']}|{player['losses']}|{player['winRate']}%")
