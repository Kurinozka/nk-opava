# Inventář videí NK Opava Simulátor

Tento dokument obsahuje kompletní seznam všech videí použitých v simulátoru, včetně informací o hráčích, schopnostech a podmínkách přehrání.

## Legenda skill ID:
1. **Smeč do středu/přes blok** (útočná)
2. **Smeč pod sebe/do áčka** (útočná)
3. **Smeč od sebe/do béčka** (útočná)
4. **Tupá rána kamkoliv** (speciální - hod mincí)
5. **Klepák** (útočná)
6. **Pata** (útočná)
7. **Kraťas pod sebe** (útočná)
8. **Kraťas za blok** (útočná)
9. **Šlapaný kraťas** (útočná)
10. **Skákaná smeč** (speciální)
11. **Smečovaný servis** (speciální - hod mincí)
12. **Blok** (obranná)
13. **Skluz** (obranná)
14. **Slabší noha** (obranná)
15. **Nesmysl** (nonsense)
16. **Hruď** (univerzální obranná)
17. **Silnější noha** (univerzální obranná)
18. **Hlava** (univerzální obranná)

---

## Týmová videa (nespecifická pro hráče)

| Video | Popis | Umístění |
|-------|-------|----------|
| `cakovice-team.mov` | Týmové video Čákovice | Nad kartami hráčů (TeamRosterView.js) |
| `modrice-team.mov` | Týmové video Modřice | Nad kartami hráčů (TeamRosterView.js) |
| `celakovice-team.mov` | Týmové video Čelákovice | Nad kartami hráčů (TeamRosterView.js) |
| `karlovy-vary-team.mov` | Týmové video Karlovy Vary | Nad kartami hráčů (TeamRosterView.js) |
| `karlovy-vary-trenink.mp4` | Tréninková videa Karlovy Vary | Zatím nepoužito v kódu |

---

## NK Opava - Hráči

### Radim Bokisch (ID: 1)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `bokisch-smec.mp4` | 3 | Smeč od sebe/do béčka | Úspěšná | - |
| `bokisch-smec.mp4` | 5 | Klepák | Úspěšná | - |

**Poznámka:** Stejné video použito pro 2 různé schopnosti.

### Ondřej Kurka (ID: 4)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kurka-shaolin-success.mp4` | 15 | Nesmysl (Shaolin po obrně) | Úspěšná (10% šance) | - |
| `kurka-shaolin-fail.mp4` | 15 | Nesmysl (Shaolin po obrně) | Neúspěšná (90% šance) | - |

**Poznámka:** Má speciální hudbu "Everybody has come for fighting" při pokusu o nesmysl.

### David Majštiník (ID: 7)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `majstinik-pozdrav.mp4` | 15 | Nesmysl (Pozdrav přítelkyni) | Obě (úspěch i fail) | Stejné video pro oba výsledky |

---

## Čákovice (CAKO)

### CAKO_1 (Jakub Chadim)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `chadim-slabsi-noha.mp4` | 14 | Slabší noha | Úspěšná | **Podmínka:** Přehraje se pouze když slabší noha ubrání Patu (skill 6) |
| `chadim-kratas-uspesny.mp4` | 7 | Kraťas pod sebe | Úspěšná | - |
| `chadim-slabsi-noha-old.mp4` | - | (stará verze) | - | Nepoužívá se v kódu |

### CAKO_2 (Tomáš Chadim)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `chadim-t-smec-stred.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |

### CAKO_3 (Zdeněk Kalous)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kalous-smec-becko.mp4` | 3 | Smeč od sebe/do béčka | Úspěšná | ✅ Opraveno - nyní správně mapováno na skill 3 |

### CAKO_6 (Lukáš Souček)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `soucek-hrud.mp4` | 16 | Hruď | Úspěšná obrana | - |
| `soucek-smec-becko.mp4` | 3 | Smeč od sebe/do béčka | Úspěšná | ✅ Nové video nahrazeno - nyní správně mapováno na skill 3 |

### CAKO_7 (Milan Kučera)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kucera-silnejsi-noha.mp4` | 17 | Silnější noha | Úspěšná obrana | - |

### Jan Vanke (hráč Čákovice)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `vanke-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `vanke-hrud.mp4` | 16 | Hruď | Úspěšná obrana | - |
| `vanke-pata.mp4` | 6 | Pata | Úspěšná | - |
| `vanke-tupa-rana.mp4` | 4 | Tupá rána kamkoliv | Obě verze | - |

### Tobiáš Gregor (hráč Čákovice)

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `gregor-kratas-za-blok.mp4` | 8 | Kraťas za blok | Úspěšná | - |
| `gregor-leva-noha.mp4` | 14 | Slabší noha | Úspěšná obrana | Levá noha - hráč je levák |
| `gregor-skakana-smec.mp4` | 10 | Skákaná smeč | Úspěšná | - |
| `gregor-smec-stred.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |

---

## Čelákovice (CELA)

### CELA_1

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `cela-1-smec-do-stredu.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |
| `cela-1-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `cela-1-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |

### CELA_2

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `cela-2-pata.mp4` | 6 | Pata | Úspěšná | - |
| `cela-2-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |

### CELA_3

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `cela-3-smec-do-acka.mp4` | 2 | Smeč pod sebe/do áčka | Úspěšná | - |
| `cela-3-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |
| `cela-3-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `cela-3-dat-neco-do-piti-sobe-i-blokari.mp4` | 15 | Nesmysl | Obě verze | Neobvyklý nesmysl |

### CELA_4

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `cela-4-skakana-smec.mp4` | 10 | Skákaná smeč | Úspěšná | - |

### CELA_5

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `cela-5-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |
| `cela-5-slabsi-noha.mp4` | 14 | Slabší noha | Úspěšná obrana | - |

### CELA_10

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `cela-10-kratas-pod-sebe.mp4` | 7 | Kraťas pod sebe | Úspěšná | - |
| `cela-10-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `cela-10-hlava.mp4` | 18 | Hlava | Úspěšná obrana | Univerzální obrana |

---

## Karlovy Vary (KVAR)

### KVAR_1

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-1-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |
| `kvar-1-pata.mp4` | 6 | Pata | Úspěšná | - |
| `kvar-1-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `kvar-1-hrud.mp4` | 16 | Hruď | Úspěšná obrana | Univerzální obrana |

### KVAR_3

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-3-smec-do-becka.mp4` | 3 | Smeč od sebe/do béčka | Základní | Obecná verze |
| `kvar-3-smec-do-becka-uspesna.mp4` | 3 | Smeč od sebe/do béčka | Úspěšná | Používá se v poli [úspěch, fail] |
| `kvar-3-smec-do-becka-neuspesna.mp4` | 3 | Smeč od sebe/do béčka | Neúspěšná | Používá se v poli [úspěch, fail] |
| `kvar-3-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | V poli [úspěch, fail] - stejné video |
| `kvar-3-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |
| `kvar-3-hrud.mp4` | 16 | Hruď | Úspěšná obrana | Univerzální obrana |

**Poznámka:** KVAR_3 má nejkomplexnější mapping s více verzemi videa pro skill 3.

### KVAR_4

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-4-smec-pres-blok.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |
| `kvar-4-blok.mp4` | 12 | Blok | Úspěšná obrana | - |

### KVAR_5

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-5-slabsi-noha.mp4` | 14 | Slabší noha | Úspěšná obrana | - |

### KVAR_6

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-6-hlava.mp4` | 18 | Hlava | Úspěšná obrana | Univerzální obrana |

### KVAR_7

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-7-smec-do-stredu.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |
| `kvar-7-skakana-smec.mp4` | 10 | Skákaná smeč | Úspěšná | - |
| `kvar-7-kratas-za-blok.mp4` | 8 | Kraťas za blok | Úspěšná | - |
| `kvar-7-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |
| `kvar-7-leva-noha.mp4` | 14 | Slabší noha | Úspěšná obrana | Levá noha - hráč je pravděpodobně levák |

### KVAR_8

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-8-smec-do-becka.mp4` | 3 | Smeč od sebe/do béčka | Úspěšná | - |
| `kvar-8-smec-do-paty.mp4` | 6 | Pata | Úspěšná | - |
| `kvar-8-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `kvar-8-prava-noha.mp4` | 17 | Silnější noha | Úspěšná obrana | Pravá noha - univerzální obrana |

### KVAR_9

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `kvar-9-blok.mp4` | 12 | Blok | Úspěšná obrana | - |

---

## Modřice (MODR)

### MODR_1

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-1-kratas-pod-sebe.mp4` | 7 | Kraťas pod sebe | Základní | Obecná verze |
| `modr-1-kratas-pod-sebe-uspesny.mp4` | 7 | Kraťas pod sebe | Úspěšná | V poli [úspěch, fail] |
| `modr-1-kratas-pod-sebe-neuspesny.mp4` | 7 | Kraťas pod sebe | Neúspěšná | V poli [úspěch, fail] |
| `modr-1-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | V poli [úspěch, fail] - stejné video |
| `modr-1-hrud.mp4` | 16 | Hruď | Úspěšná obrana | Univerzální obrana |

**Poznámka:** Má úspěšné i neúspěšné verze videa pro Kraťas pod sebe.

### MODR_2

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-2-kratas-za-blok.mp4` | 8 | Kraťas za blok | Úspěšná | - |

### MODR_3

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-3-smec-do-becka.mp4` | 3 | Smeč od sebe/do béčka | Úspěšná | - |
| `modr-3-blok.mp4` | 12 | Blok | Úspěšná obrana | - |

### MODR_4

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-4-silnejsi-noha.mp4` | 17 | Silnější noha | Úspěšná obrana | Univerzální obrana |

### MODR_5

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-5-smec-pres-blok.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |
| `modr-5-nenapadna-vymena-balonu-za-prefoukany.mp4` | 15 | Nesmysl | Obě verze | Neobvyklý nesmysl |

### MODR_6

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-6-lehke-povoleni-saka.mp4` | 15 | Nesmysl | Obě verze | Neobvyklý nesmysl |

### MODR_9

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-9-smec-pres-blok.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |
| `modr-9-skakana-smec.mp4` | 10 | Skákaná smeč | Úspěšná | - |
| `modr-9-skluz.mp4` | 13 | Skluz | Úspěšná obrana | - |
| `modr-9-bozi-ruka.mp4` | 15 | Nesmysl (Boží ruka) | Obě verze | Neobvyklý nesmysl |
| `modr-9-hrud.mp4` | 16 | Hruď | Úspěšná obrana | Univerzální obrana |

### MODR_10

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `modr-10-kratas-za-blok.mp4` | 8 | Kraťas za blok | Úspěšná | - |
| `modr-10-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |

---

## Rádio (RADO)

### RADO_1

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-1-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |
| `rado-1-slapany-kratas.mp4` | 9 | Šlapaný kraťas | Úspěšná | - |
| `rado-1-skakana-smec.mp4` | 10 | Skákaná smeč | Úspěšná | - |

### RADO_2

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-2-blok.mp4` | 12 | Blok | Úspěšná obrana | - |

### RADO_3

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-3-smec-do-stredu.mp4` | 1 | Smeč do středu/přes blok | Úspěšná | - |
| `rado-3-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |
| `rado-3-smec-pod-sebe.mp4` | 7 | Kraťas pod sebe | Úspěšná | - |
| `rado-3-smec-do-paty.mp4` | 6 | Pata | Úspěšná | - |

### RADO_9

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-9-klepak.mp4` | 5 | Klepák | Úspěšná | - |
| `rado-9-hlava.mp4` | 18 | Hlava | Úspěšná obrana | Univerzální obrana |

### RADO_11

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-11-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `rado-11-prava-noha.mp4` | 17 | Silnější noha | Úspěšná obrana | Pravá noha - univerzální obrana |

### RADO_13

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-13-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |

### RADO_14

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-14-hlavicka.mp4` | 18 | Hlava | Úspěšná obrana | Univerzální obrana |

### RADO_15

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-15-kratas-pod-sebe.mp4` | 7 | Kraťas pod sebe | Úspěšná | - |

### RADO_16

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-16-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |

### RADO_17

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `rado-17-blok.mp4` | 12 | Blok | Úspěšná obrana | - |

---

## Vsetín (VSET)

### VSET_1

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `vset-1-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `vset-1-bodlo-do-kouli.mp4` | 15 | Nesmysl (Bodlo do koulí) | Obě verze | Neobvyklý nesmysl |

### VSET_2

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `vset-2-kratas-za-blok.mp4` | 8 | Kraťas za blok | Úspěšná | - |
| `vset-2-blok.mp4` | 12 | Blok | Úspěšná obrana | - |
| `vset-2-hrud.mp4` | 16 | Hruď | Úspěšná obrana | Univerzální obrana |
| `vset-2-silnejsi-noha.mp4` | 17 | Silnější noha | Úspěšná obrana | Univerzální obrana |

### VSET_4

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `vset-4-klepak.mp4` | 5 | Klepák | Úspěšná | - |
| `vset-4-silnejsi-noha.mp4` | 17 | Silnější noha | Úspěšná obrana | Univerzální obrana |

### VSET_5

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `vset-5-smecovany-servis.mp4` | 11 | Smečovaný servis | Obě verze | Speciální skill s hodem mincí |

### VSET_9

| Video | Skill ID | Skill název | Verze | Podmínky |
|-------|----------|-------------|-------|----------|
| `vset-9-tupa-rana-kamkoliv.mp4` | 4 | Tupá rána kamkoliv | Obě verze | Speciální skill s hodem mincí |
| `vset-9-staredown.mp4` | 15 | Nesmysl (Staredown) | Obě verze | Neobvyklý nesmysl |

---

## Souhrn statistik

### Celkový počet videí: 111
- **Týmová videa:** 5 (Čákovice, Modřice, Čelákovice, Karlovy Vary - portréty, Karlovy Vary - trénink)
- **Videa hráčů:** 106

### Pokrytí podle skill typu:
- **Útočné (1-10):** 62 videí
- **Obranné (12-14):** 26 videí
- **Univerzální obranné (16-18):** 14 videí
- **Nesmysly (15):** 10 videí
- **Nepoužívané:** 1 video (chadim-slabsi-noha-old.mp4)

### Speciální podmínky:

1. **Podmíněné přehrání:**
   - `chadim-slabsi-noha.mp4` - přehrává se pouze když slabší noha ubrání Patu (skill 6)

2. **Videa s oddělenými verzemi úspěch/fail:**
   - `kurka-shaolin-success.mp4` / `kurka-shaolin-fail.mp4` (skill 15)
   - `kvar-3-smec-do-becka-uspesna.mp4` / `kvar-3-smec-do-becka-neuspesna.mp4` (skill 3)
   - `modr-1-kratas-pod-sebe-uspesny.mp4` / `modr-1-kratas-pod-sebe-neuspesny.mp4` (skill 7)

3. **Jedno video pro obě verze (v kódu v poli [video, video]):**
   - Většina videa pro Tupou ránu (skill 4)
   - Většina videí pro Smečovaný servis (skill 11)
   - Většina nesmyslů (skill 15)

### Poznámky k implementaci:

- **Speciální skill s hodem mincí (4, 11):**
  - 0x panna (2x hlava) = fail - bod pro soupeře
  - 1x panna = standardní útok
  - 2x panna = efekt ultimate

- **Nesmysly (skill 15):**
  - 10% šance na úspěch = nebránitelný bod + soupeř má poloviční statistiky
  - 90% šance na fail = hráč je vystřídán a trenér zuří

- **Univerzální obrany (16, 17, 18):**
  - 100% aktivace, 25% šance zablokovat jakýkoliv útok
  - Nemohou být ultimate skill

---

## Přehled podle týmů:

| Tým | Počet hráčů s videi | Počet videí |
|-----|---------------------|-------------|
| NK Opava | 2 | 4 |
| Čákovice | 6 | 22 |
| Čelákovice | 5 | 13 |
| Karlovy Vary | 9 | 25 |
| Modřice | 10 | 21 |
| Rádio | 8 | 15 |
| Vsetín | 5 | 10 |

---

*Poznámka: Tento dokument je generován na základě analýzy kódu v `src/game.js` (playerSkillVideos) a `src/views/PlayerDetail.js` (playerSkillAnimations).*

*Poslední aktualizace: 16. října 2025 - Opraveno mapování videí Kalouse a Součka, nahrazeno video Součka novým, přidána týmová videa pro Čelákovice a Karlovy Vary.*
