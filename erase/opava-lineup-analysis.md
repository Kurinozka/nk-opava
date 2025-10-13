# Analýza sestav NK Opava - Play Off/Out 2025

## Data ze 3 zápasů proti Zbečníku

### SINGL
- **Roman Kvarda**: 1x (zápas 4220)
- **Ondřej Kurka**: 1x (zápas 4221)
- **Radim Bokisch**: 1x (zápas 4222)

**Nejčastější**: Všichni stejně → použijeme Radim Bokisch (nejvíce singlů celkově podle statistik)

---

### DVOJICE

#### Dvojice kombinace:
- **Radim Bokisch + David Majštiník**: 2x ← NEJČASTĚJŠÍ
  - zápas 4221
  - zápas 4222

- **Radim Bokisch + Ondřej Kurka**: 1x
  - zápas 4220

- **Roman Kvarda + Josef Nezval**: 1x
  - zápas 4220

- **Ondřej Kurka + Josef Nezval**: 1x
  - zápas 4221

**Doporučené dvojice:**
1. **Radim Bokisch + David Majštiník** (2x - nejčastější)
2. **Ondřej Kurka + Josef Nezval** (1x)
3. **Roman Kvarda + Josef Nezval** (1x)

---

### TROJICE

#### Trojice kombinace:
- **Tomáš Hyžák + Ondřej Kurka + Josef Nezval**: 4x ← NEJČASTĚJŠÍ
  - zápas 4220 (trojice 1)
  - zápas 4221 (trojice 1)
  - zápas 4222 (trojice 2)
  - zápas 4222 (trojice 3)

- **Radim Bokisch + Roman Kvarda + Jan Němčík**: 2x
  - zápas 4220 (trojice 2)
  - zápas 4220 (trojice 3)

- **Radim Bokisch + Roman Kvarda + David Majštiník**: 2x
  - zápas 4221 (trojice 2)
  - zápas 4222 (trojice 1)

**Doporučené trojice:**
1. **Tomáš Hyžák + Ondřej Kurka + Josef Nezval** (4x - nejčastější)
2. **Radim Bokisch + Roman Kvarda + David Majštiník** (2x)
3. **Radim Bokisch + Roman Kvarda + Jan Němčík** (2x)

---

## Finální doporučení pro teamLineups.json

```json
{
  "singl": {
    "players": [1],
    "comment": "Radim Bokisch - nejvíce singlů celkově"
  },
  "dvojice1": {
    "players": [1, 7],
    "frequency": 66,
    "comment": "Radim Bokisch + David Majštiník (nejčastější - 2x ze 3 zápasů)"
  },
  "dvojice2": {
    "players": [4, 9],
    "frequency": 33,
    "comment": "Ondřej Kurka + Josef Nezval"
  },
  "dvojice3": {
    "players": [5, 9],
    "frequency": 33,
    "comment": "Roman Kvarda + Josef Nezval"
  },
  "trojice1": {
    "players": [2, 4, 9],
    "frequency": 100,
    "comment": "Tomáš Hyžák + Ondřej Kurka + Josef Nezval (nejčastější - 4x ze všech trojic)"
  },
  "trojice2": {
    "players": [1, 5, 7],
    "frequency": 50,
    "comment": "Radim Bokisch + Roman Kvarda + David Majštiník"
  },
  "trojice3": {
    "players": [1, 5, 17],
    "frequency": 50,
    "comment": "Radim Bokisch + Roman Kvarda + Jan Němčík"
  }
}
```
