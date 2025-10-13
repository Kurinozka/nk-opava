# Pravidla pro výpočet ratingu hráčů

## Vážená úspěšnost

### Vzorec pro výpočet vážené úspěšnosti:

1. **Úspěšnost 2025** = (všechny výhry v roce 2025 včetně play off/out) / (všechny zápasy v roce 2025 včetně play off/out) × 100
2. **Úspěšnost 2024** = (všechny výhry v roce 2024 včetně play off/out) / (všechny zápasy v roce 2024 včetně play off/out) × 100

3. **Vážená úspěšnost** - závisí na počtu odehraných zápasů v roce 2025:

   **a) Pokud hráč odehrál v roce 2025 alespoň 10 zápasů:**
   - Vážená úspěšnost = (Úspěšnost 2025 × 2 + Úspěšnost 2024) / 3
   - Rok 2025 má **dvojnásobnou váhu**

   **b) Pokud hráč odehrál v roce 2025 méně než 10 zápasů:**
   - Vážená úspěšnost = (Úspěšnost 2025 + Úspěšnost 2024) / 2
   - Oba roky mají **stejnou váhu**

### Výpočet základního ratingu:

- **Základní rating závisí na lize TÝMU** (ne individuálního hráče):
  - **Extraliga**: 85 (pro 50% úspěšnost)
  - **1. liga**: 80 (pro 50% úspěšnost) ← NK Opava
  - **2. liga a níže**: 75 (pro 50% úspěšnost)

#### Pokud je vážená úspěšnost > 50%:
- Zvýšení ratingu o **1-15%** podle vzorce:
- `rating = base_rating × (1 + (1 + ((vážená_úspěšnost - 50) / 50) × 14) / 100)`
- Příklad pro 1. ligu (base_rating = 80):
  - 50.01% úspěšnost ≈ 80 × 1.01 = 80.8
  - 100% úspěšnost = 80 × 1.15 = 92

#### Pokud je vážená úspěšnost < 50%:
- Snížení ratingu o **1-15%** podle vzorce:
- `rating = base_rating × (1 - (1 + ((50 - vážená_úspěšnost) / 50) × 14) / 100)`
- Příklad pro 1. ligu (base_rating = 80):
  - 49.99% úspěšnost ≈ 80 × 0.99 = 79.2
  - 0% úspěšnost = 80 × 0.85 = 68

#### Pokud je vážená úspěšnost = 50%:
- Rating zůstává na base_rating (žádná změna)
- Pro 1. ligu = 80, pro 2. ligu = 75, pro extraligu = 85

## Aplikace pozičních úprav

Po výpočtu základního ratingu se aplikují **poziční adjustmenty** podle pozice hráče:

### Blokař/Smečař:
- rychlost: +3
- obratnost: +2
- rana: +3
- technika: -3
- obrana: +2
- cteniHry: -3
- vydrz: -2
- obetavost: -1
- psychickaOdolnost: -1

### Nahravač/Polař:
- technika: +3
- cteniHry: +3
- obrana: +2
- rana: -3
- rychlost: -2
- obratnost: -1
- vydrz: -2
- obetavost: 0
- psychickaOdolnost: 0

### Polař/Smečař:
- technika: +2
- cteniHry: +2
- obratnost: +2
- rana: -2
- rychlost: -1
- obrana: +1
- vydrz: -2
- obetavost: -1
- psychickaOdolnost: -1

### Univerzál:
- technika: +3
- obrana: +3
- cteniHry: +2
- rana: -3
- rychlost: -2
- obratnost: -1
- vydrz: -2
- obetavost: 0
- psychickaOdolnost: 0

## Tréninkový bonus (pouze NK Opava)

Po aplikaci pozičních úprav se přidává **tréninkový bonus** podle docházky:

- **100% docházka** = +2 body ke všem parametrům
- **50% docházka** = +1 bod ke všem parametrům
- **25% docházka** = +0.5 bodu (zaokrouhleno)
- **0% docházka** = 0 bonusu

Vzorec: `bonus_multiplier = docházka / 50`

## Postup výpočtu (shrnutí)

1. Vypočítat váženou úspěšnost z dat 2024 a 2025
2. Vypočítat základní rating podle vážené úspěšnosti
3. Aplikovat poziční adjustmenty na všechny parametry
4. Škálovat parametry tak, aby průměr odpovídal základnímu ratingu
5. Aplikovat tréninkový bonus (pouze NK Opava)
