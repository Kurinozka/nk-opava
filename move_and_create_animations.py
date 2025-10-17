import json
import os
import shutil
import re

def normalize_filename(player_id, skill_name, nesmysl_name=None):
    """Create normalized filename from player_id and skill_name"""
    # Normalize player ID
    player_part = str(player_id).lower().replace('_', '-')

    # Normalize skill name
    skill_part = skill_name.lower()
    skill_part = skill_part.replace('á', 'a').replace('č', 'c').replace('ď', 'd')
    skill_part = skill_part.replace('é', 'e').replace('ě', 'e').replace('í', 'i')
    skill_part = skill_part.replace('ň', 'n').replace('ó', 'o').replace('ř', 'r')
    skill_part = skill_part.replace('š', 's').replace('ť', 't').replace('ú', 'u')
    skill_part = skill_part.replace('ů', 'u').replace('ý', 'y').replace('ž', 'z')
    skill_part = re.sub(r'[^a-z0-9]+', '-', skill_part).strip('-')

    if nesmysl_name:
        nesmysl_part = nesmysl_name.lower()
        nesmysl_part = nesmysl_part.replace('á', 'a').replace('č', 'c').replace('ď', 'd')
        nesmysl_part = nesmysl_part.replace('é', 'e').replace('ě', 'e').replace('í', 'i')
        nesmysl_part = nesmysl_part.replace('ň', 'n').replace('ó', 'o').replace('ř', 'r')
        nesmysl_part = nesmysl_part.replace('š', 's').replace('ť', 't').replace('ú', 'u')
        nesmysl_part = nesmysl_part.replace('ů', 'u').replace('ý', 'y').replace('ž', 'z')
        nesmysl_part = re.sub(r'[^a-z0-9]+', '-', nesmysl_part).strip('-')
        return f"{player_part}-{nesmysl_part}.mp4"

    return f"{player_part}-{skill_part}.mp4"

def create_animation_file(player_id, skill_id, video_filename, nesmysl_name=None):
    """Create animation JS file"""
    player_part = str(player_id).lower().replace('_', '-')

    if nesmysl_name:
        nesmysl_part = nesmysl_name.lower()
        nesmysl_part = nesmysl_part.replace('á', 'a').replace('č', 'c').replace('ď', 'd')
        nesmysl_part = nesmysl_part.replace('é', 'e').replace('ě', 'e').replace('í', 'i')
        nesmysl_part = nesmysl_part.replace('ň', 'n').replace('ó', 'o').replace('ř', 'r')
        nesmysl_part = nesmysl_part.replace('š', 's').replace('ť', 't').replace('ú', 'u')
        nesmysl_part = nesmysl_part.replace('ů', 'u').replace('ý', 'y').replace('ž', 'z')
        nesmysl_part = re.sub(r'[^a-z0-9]+', '-', nesmysl_part).strip('-')
        anim_filename = f"{player_part}-{nesmysl_part}.js"
        const_name = f"{player_part.replace('-', '_')}_{nesmysl_part.replace('-', '_')}_animation"
    else:
        skill_names = {
            1: "smec-stred",
            2: "smec-acko",
            3: "smec-becko",
            4: "tupa-rana",
            5: "slapany-kratas",
            6: "skakana-smec",
            7: "klepak",
            8: "kratas-pod-sebe",
            9: "smec-pata",
            10: "kratas-za-blok",
            11: "pata",
            12: "blok",
            13: "smecovany-servis",
            14: "slabsi-noha",
            15: "nesmysl",
            16: "hrud",
            17: "silnejsi-noha",
        }
        skill_name = skill_names.get(skill_id, f"skill-{skill_id}")
        anim_filename = f"{player_part}-{skill_name}.js"
        const_name = f"{player_part.replace('-', '_')}_{skill_name.replace('-', '_')}_animation"

    content = f'''export const {const_name} = `
  <video autoplay loop muted playsinline class="skill-video">
    <source src="/videos/{video_filename}" type="video/mp4">
  </video>
`
'''

    anim_path = f"src/animations/{anim_filename}"
    with open(anim_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return anim_filename, const_name

def main():
    # Load parsed videos
    with open('parsed_videos.json', 'r', encoding='utf-8') as f:
        videos = json.load(f)

    print(f"Processing {len(videos)} videos...")

    # Group videos by player and skill
    player_skill_videos = {}

    for video in videos:
        player_id = video['player_id']
        skill_id = video['skill_id']
        key = (player_id, skill_id)

        if key not in player_skill_videos:
            player_skill_videos[key] = []
        player_skill_videos[key].append(video)

    print(f"\\nFound {len(player_skill_videos)} unique player-skill combinations")

    # Process each video
    moved_count = 0
    created_animations = []

    for (player_id, skill_id), video_list in player_skill_videos.items():
        # Use first video for this player-skill combo
        video = video_list[0]

        # Create normalized filename
        new_filename = normalize_filename(player_id, video['skill_name'], video['nesmysl_name'])

        # Move video to public/videos/
        src = video['original_file']
        dst = f"public/videos/{new_filename}"

        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"  Moved: {src} -> {dst}")
            moved_count += 1

            # Create animation file
            anim_file, const_name = create_animation_file(
                player_id, skill_id, new_filename, video['nesmysl_name']
            )
            created_animations.append({
                'player_id': player_id,
                'skill_id': skill_id,
                'anim_file': anim_file,
                'const_name': const_name
            })
        else:
            print(f"  SKIP: {src} not found")

    print(f"\\nMoved {moved_count} videos")
    print(f"Created {len(created_animations)} animation files")

    # Save animation info for next step
    with open('created_animations.json', 'w', encoding='utf-8') as f:
        json.dump(created_animations, f, indent=2)

    print("\\nAnimation info saved to created_animations.json")

if __name__ == '__main__':
    main()
