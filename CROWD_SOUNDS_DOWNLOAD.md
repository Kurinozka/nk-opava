# Jak stáhnout zvuky davu z Freesound.org

## Krok 1: Zaregistruj se na Freesound.org
Jdi na https://freesound.org/home/register/ a vytvoř si účet (pokud už nemáš).

## Krok 2: Stáhni pack "Crowd Cheering Pack"
Jdi na: https://freesound.org/people/GregorQuendel/packs/27224/

Nebo můžeš stahovat jednotlivé zvuky z výsledků vyhledávání:
https://freesound.org/search/?q=crowd+cheer&f=pack_grouping%3A%2227224_Crowd+Cheering+Pack%22

## Krok 3: Ulož zvuky do projektu
Stažené soubory přejmenuj a ulož do složky: `public/sounds/crowd/`

**Doporučené názvy souborů:**
1. `crowd-strong-1.mp3` (z "Crowd Cheering - Strong Cheering 1.wav")
2. `crowd-strong-2-short.mp3` (z "Crowd Cheering - Strong Cheering 2 - Short.wav")
3. `crowd-soft-1.mp3` (z "Crowd Cheering - Soft Cheering 1.wav")
4. `crowd-soft-chatter.mp3` (z "Crowd Cheering - Soft Cheering and Chatter.wav")
5. `crowd-ambience-cheer.mp3` (z "Crowd Cheering - Ambience and Cheering.wav")
6. `crowd-rhythmic.mp3` (z "Crowd Cheering - Rhythmic Cheering.wav")
7. `crowd-strong-rhythmic-soft.mp3` (z "Crowd Cheering - Strong Cheering and Soft Rhythmic Cheering.wav")
8. `crowd-ambience.mp3` (z "Crowd Cheering - Ambience.wav")
9. `crowd-full.mp3` (z "Crowd Cheering - Full Recording.wav")
10. `crowd-soft-2.mp3` (z "Crowd Cheering - Soft Cheering 2.wav")
11. `crowd-strong-rhythmic-strong.mp3` (z "Crowd Cheering - Strong Cheering and Strong Rhythmic Cheering.wav")

**Poznámka:** Pokud Freesound poskytuje pouze WAV soubory, můžeš je převést na MP3 pomocí online konvertoru (např. https://cloudconvert.com/wav-to-mp3) pro menší velikost souborů.

## Krok 4: Po stažení restartuj dev server
Po umístění souborů do `public/sounds/crowd/`, restartuj `npm run dev`.
