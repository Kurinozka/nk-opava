import os
import re
import json
from pathlib import Path

# Mapping player names to IDs
PLAYER_NAME_TO_ID = {
    # NK Opava
    "Jan Bokisch": 1,
    "Jiří Majstřík": 4,
    "Tomáš Kuřátko": 7,

    # Čakovice
    "Jakub Chadim": "CAKO_1",
    "Zdeněk Kalous": "CAKO_3",
    "Zdeněk Souček": "CAKO_6",
    "Milan Kučera": "CAKO_7",

    # Karlovy Vary
    "Jan Vanke": "KVAR_1",
    "jan Vanke": "KVAR_1",  # lowercase variant
    "Michal Kokštein": "KVAR_2",
    "Karel Hron": "KVAR_3",
    "Tomáš Bíbr": "KVAR_4",
    "Matěj Medek": "KVAR_5",
    "Lukáš Tolar": "KVAR_6",
    "Tobiáš Gregor": "KVAR_7",
    "Jakub Medek": "KVAR_8",
    "Pavel Gregor": "KVAR_9",

    # Vsetín
    "Martin Zbranek": "VSET_1",
    "Jan Chalupa": "VSET_2",
    "David Dvořák": "VSET_4",
    "Daniel Bílý": "VSET_5",
    "Dan Bílý": "VSET_5",  # short variant
    "Rudolf Stařičný": "VSET_9",

    # Modřice
    "Michael Svoboda": "MODR_1",
    "Petr Bubniak": "MODR_2",
    "František Kalas": "MODR_3",
    "Pavel Kop": "MODR_4",
    "Jakub Pospíšil": "MODR_5",
    "Lukáš Rosenberk": "MODR_6",
    "David Višvader": "MODR_9",
    "Jan Hanus": "MODR_10",

    # Radomyšl
    "Ondřej Vít": "RADO_1",
    "Petr Vít": "RADO_2",
    "Nikolas Truc": "RADO_3",
    "Nikols Truc": "RADO_3",  # typo variant
    "Michal Nepodal": "RADO_9",
    "Martin Sehrig": "RADO_11",
    "Martin Tomek": "RADO_13",
    "Jan Jůzek": "RADO_14",
    "Vilém Ungermann": "RADO_15",
    "Vojtěch Sýs": "RADO_16",
    "vojtěch sýs": "RADO_16",  # lowercase variant
    "Matěj Mužík": "RADO_17",

    # Čelákovice
    "Václav Kalous": "CELA_1",
    "Petr Nesládek": "CELA_3",
    "Petr nesládek": "CELA_3",  # lowercase variant
    "Daniel Matura": "CELA_4",
    "Vojtěch Holas": "CELA_5",
    "Marek Votíšek": "CELA_10",
    "Marek Vojtíšek": "CELA_10",  # typo variant
    "Tomáš Andris": "CELA_2",
    "Tobiš Gregor": "KVAR_7",  # short variant
}

# Mapping skill names to skill IDs
SKILL_NAME_TO_ID = {
    # Offensive skills
    "t-smeč do středu": 1,
    "smeč do středu": 1,
    "smeč přes blok": 1,  # Treat as smeč do středu
    "smeč do áčka": 2,
    "smeč do béčka": 3,
    "smeč od sebe": 3,
    "tupá rána kamkoliv": 4,
    "tupá rána": 4,
    "šlapaný kraťas": 5,
    "skákaná smeč": 6,
    "kraťas za blok": 10,
    "kraťas pod sebe": 8,
    "smeč pod sebe": 8,
    "smeč do paty": 9,
    "pata": 11,
    "klepák": 7,
    "úder do béčka": 9,
    "smečovaný servis": 13,

    # Defensive skills
    "blok": 12,
    "vytlučený blok": 12,
    "základní pohyb": 16,
    "hruď": 16,
    "hlava": 16,
    "hlavička": 16,
    "silnější noha": 17,
    "pravá noha": 17,
    "slabší noha": 14,
    "levá noha": 14,
    "skluz": 12,  # Treat as blok defense

    # Special
    "nesmysl": 15,
}

def normalize_name(text):
    """Normalize text for file names"""
    # Remove accents and convert to lowercase
    text = text.lower()
    replacements = {
        'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e',
        'í': 'i', 'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's',
        'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Replace spaces and special chars with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

def parse_video_filename(filename):
    """Parse video filename to extract player, skill, and success info"""
    # Remove .mp4 extension
    name = filename.replace('.mp4', '')

    # Try to parse "Player - Skill (success info)" format
    match = re.match(r'^(.+?)\s*-\s*(.+?)\s*\((.+?)\)', name, re.IGNORECASE)
    if not match:
        print(f"Cannot parse: {filename}")
        return None

    player_name = match.group(1).strip()
    skill_desc = match.group(2).strip().lower()
    success_info = match.group(3).strip().lower()

    # Determine if it's success, fail, or both
    is_success = 'úspěšn' in success_info or 'úspěch' in success_info
    is_fail = 'neúspěšn' in success_info

    # Extract nesmysl name if present
    nesmysl_match = re.search(r'nesmysl s názvem (.+)', skill_desc)
    nesmysl_name = nesmysl_match.group(1) if nesmysl_match else None

    # Find skill name in description
    skill_id = None
    skill_key = None
    for skill_name, sid in SKILL_NAME_TO_ID.items():
        if skill_name in skill_desc:
            skill_id = sid
            skill_key = skill_name
            break

    # Check for nesmysl
    if nesmysl_match or 'nesmysl' in skill_desc:
        skill_id = 15
        skill_key = 'nesmysl'

    if not skill_id:
        print(f"Cannot find skill in: {skill_desc}")
        return None

    # Find player ID
    player_id = PLAYER_NAME_TO_ID.get(player_name)
    if not player_id:
        print(f"Cannot find player: {player_name}")
        return None

    return {
        'original_file': filename,
        'player_name': player_name,
        'player_id': player_id,
        'skill_id': skill_id,
        'skill_name': skill_key,
        'is_success': is_success,
        'is_fail': is_fail,
        'nesmysl_name': nesmysl_name
    }

def main():
    # Get all mp4 files in root directory
    video_files = [f for f in os.listdir('.') if f.endswith('.mp4')]

    print(f"Found {len(video_files)} video files")
    print("\\nParsing video files...")

    parsed_videos = []
    for video in sorted(video_files):
        result = parse_video_filename(video)
        if result:
            parsed_videos.append(result)
            print(f"  OK: {video}")
            print(f"      -> Player: {result['player_name']} ({result['player_id']})")
            print(f"      -> Skill: {result['skill_name']} (ID {result['skill_id']})")
            print(f"      -> Success: {result['is_success']}, Fail: {result['is_fail']}")
        else:
            print(f"  SKIP: {video}")

    print(f"\\n\\nSuccessfully parsed: {len(parsed_videos)}/{len(video_files)}")

    # Save results to JSON for next step
    with open('parsed_videos.json', 'w', encoding='utf-8') as f:
        json.dump(parsed_videos, f, indent=2, ensure_ascii=False)

    print("\\nResults saved to parsed_videos.json")

if __name__ == '__main__':
    main()
