# Opravy chyb v mapování animací

Tento dokument obsahuje konkrétní kroky pro opravu všech 14 chyb v PlayerDetail.js.

## ⚠️ CHYBY K OPRAVĚ

### 1. David Višvader (MODR_10) - Boží ruka
**Problém:** Animation je namapována na MODR_9, měla by být na MODR_10

**Současný stav v PlayerDetail.js:**
```javascript
'MODR_9': {
  1: modr_9_smec_stred_animation,
  6: modr_9_skakana_smec_animation,
  12: modr_9_blok_animation,
  15: modr_9_bozi_ruka_animation,  // ❌ ŠPATNĚ - mělo by být u MODR_10
  16: modr_9_hrud_animation,
}
```

**Správná verze:**
```javascript
'MODR_9': {
  1: modr_9_smec_stred_animation,
  6: modr_9_skakana_smec_animation,
  12: modr_9_blok_animation,
  // 15: ODSTRANIT
  16: modr_9_hrud_animation,
},
'MODR_10': {
  8: modr_10_kratas_za_blok_animation,
  11: modr_10_smecovany_servis_animation,
  15: modr_9_bozi_ruka_animation,  // ✅ PŘIDAT SEM (pozor: název souboru zůstává modr_9_bozi_ruka)
}
```

---

### 2. Tomáš Andris (CELA_1) - Tupá rána a Pata
**Problém:** Animations jsou namapovány na CELA_2, měly by být na CELA_1

**Současný stav:**
```javascript
'CELA_2': {
  4: cela_2_tupa_rana_animation,  // ❌ ŠPATNĚ
  11: cela_2_pata_animation,      // ❌ ŠPATNĚ (mělo by být skill 6, ne 11)
}
```

**Správná verze:**
```javascript
'CELA_1': {
  1: cela_1_smec_stred_animation,
  12: cela_1_blok_animation,
  13: cela_1_smecovany_servis_animation,
  4: cela_2_tupa_rana_animation,  // ✅ PŘESUNOUT Z CELA_2
  6: cela_2_pata_animation,       // ✅ PŘESUNOUT Z CELA_2 (a opravit skill ID z 11 na 6)
},
// 'CELA_2': ODSTRANIT CELOU SEKCI
```

---

### 3. Petr Nesládek (CELA_6) - 4 animace
**Problém:** Všechny animations jsou namapovány na CELA_3, měly by být na CELA_6

**Současný stav:**
```javascript
'CELA_3': {
  2: cela_3_smec_acko_animation,           // ❌ ŠPATNĚ
  4: cela_3_tupa_rana_animation,           // ❌ ŠPATNĚ
  12: cela_3_blok_animation,               // ❌ ŠPATNĚ
  15: cela_3_dat_neco_do_piti_sobe_i_blokari_animation,  // ❌ ŠPATNĚ
}
```

**Správná verze:**
```javascript
'CELA_3': {
  // ODSTRANIT VŠECHNY 4 ANIMACE
}
'CELA_6': {
  2: cela_3_smec_acko_animation,           // ✅ PŘESUNOUT (pozor: název souboru zůstává cela_3)
  4: cela_3_tupa_rana_animation,           // ✅ PŘESUNOUT
  12: cela_3_blok_animation,               // ✅ PŘESUNOUT
  15: cela_3_dat_neco_do_piti_sobe_i_blokari_animation,  // ✅ PŘESUNOUT
}
```

---

### 4. Vojtěch Holas (CELA_3) - Smečovaný servis a Slabší noha
**Problém:** Animations jsou namapovány na CELA_5, měly by být na CELA_3

**Současný stav:**
```javascript
'CELA_5': {
  13: cela_5_smecovany_servis_animation,  // ❌ ŠPATNĚ (mělo by být 11, ne 13)
  14: cela_5_slabsi_noha_animation,       // ❌ ŠPATNĚ
}
```

**Správná verze:**
```javascript
'CELA_3': {
  11: cela_5_smecovany_servis_animation,  // ✅ PŘESUNOUT Z CELA_5 (a opravit skill ID z 13 na 11)
  14: cela_5_slabsi_noha_animation,       // ✅ PŘESUNOUT Z CELA_5
}
// 'CELA_5': ODSTRANIT CELOU SEKCI
```

---

### 5. Daniel Matura (CELA_5) - Skákaná smeč
**Problém:** Animation je namapována na CELA_4, měla by být na CELA_5

**Současný stav:**
```javascript
'CELA_4': {
  6: cela_4_skakana_smec_animation,  // ❌ ŠPATNĚ (skill ID by mělo být 10, ne 6)
}
```

**Správná verze:**
```javascript
// 'CELA_4': ODSTRANIT CELOU SEKCI
'CELA_5': {
  10: cela_4_skakana_smec_animation,  // ✅ PŘESUNOUT Z CELA_4 (a opravit skill ID z 6 na 10)
  11: cela_5_smecovany_servis_animation,  // Toto přesunout k CELA_3 (viz oprava 4)
  14: cela_5_slabsi_noha_animation,       // Toto přesunout k CELA_3 (viz oprava 4)
}
```

---

### 6. Jan Chalupa (VSET_3) - Hruď, Kraťas za blok, Silnější noha
**Problém:** Animations jsou namapovány na VSET_2, měly by být na VSET_3

**Současný stav:**
```javascript
'VSET_2': {
  8: vset_2_kratas_za_blok_animation,
  12: vset_2_blok_animation,
  16: vset_2_hrud_animation,
  17: vset_2_silnejsi_noha_animation,
}
```

**Problém:** VSET_2 animations jsou správně, ALE animations Jana Chalupy (které mají stejný název) by měly být u VSET_3!

**Řešení:** Musíme zjistit, který hráč je VSET_2 a který VSET_3. Podle mapování:
- Jan Chalupa = VSET_3 (možná také VSET_2) ← NENÍ JEDNOZNAČNÉ!

**AKCE:** Potřebujeme určit, kdo je VSET_2. Pokud Jan Chalupa má být VSET_3, pak:

```javascript
'VSET_3': {
  8: vset_2_kratas_za_blok_animation,     // ✅ ZKOPÍROVAT (nebo přejmenovat soubory)
  16: vset_2_hrud_animation,              // ✅ ZKOPÍROVAT
  17: vset_2_silnejsi_noha_animation,     // ✅ ZKOPÍROVAT
}
```

---

### 7. Rudolf Stařičný (VSET_13) - Staredown a Tupá rána
**Problém:** Animations jsou namapovány na VSET_9, měly by být na VSET_13

**Současný stav:**
```javascript
'VSET_9': {
  4: vset_9_tupa_rana_animation,
  15: vset_9_staredown_animation,
}
```

**Správná verze:**
```javascript
// 'VSET_9': ODSTRANIT CELOU SEKCI
'VSET_13': {
  4: vset_9_tupa_rana_animation,      // ✅ PŘESUNOUT (pozor: název souboru zůstává vset_9)
  15: vset_9_staredown_animation,     // ✅ PŘESUNOUT
}
```

---

### 8. Michal Nepodal (RADO_3) - Klepák
**Problém:** Animation je namapována na RADO_9, měla by být na RADO_3

**Současný stav:**
```javascript
'RADO_9': {
  5: rado_9_klepak_animation,  // ❌ ŠPATNĚ
  16: rado_9_hrud_animation,
}
```

**Správná verze:**
```javascript
'RADO_3': {
  1: rado_3_smec_stred_animation,
  4: rado_3_tupa_rana_animation,
  7: rado_3_kratas_pod_sebe_animation,
  6: rado_3_smec_pata_animation,
  5: rado_9_klepak_animation,  // ✅ PŘESUNOUT Z RADO_9 (pozor: název souboru zůstává rado_9)
},
'RADO_9': {
  // 5: ODSTRANIT
  16: rado_9_hrud_animation,
}
```

---

## 📋 KONTROLNÍ SEZNAM

Po provedení všech oprav zkontrolovat:

- [ ] MODR_9: Odstraněno 15 (boží ruka)
- [ ] MODR_10: Přidáno 15 (boží ruka)
- [ ] CELA_1: Přidáno 4 (tupá rána) a 6 (pata)
- [ ] CELA_2: Odstraněna celá sekce
- [ ] CELA_3: Odstraněny všechny 4 animace, přidány 2 od CELA_5
- [ ] CELA_4: Odstraněna celá sekce
- [ ] CELA_5: Přidána skákaná smeč s ID 10
- [ ] CELA_6: Přidány všechny 4 animace od CELA_3
- [ ] VSET_2 vs VSET_3: Vyřešeno duplicity
- [ ] VSET_9: Odstraněna celá sekce
- [ ] VSET_13: Přidány 2 animace od VSET_9
- [ ] RADO_3: Přidán klepák od RADO_9
- [ ] RADO_9: Odstraněn klepák

---

## 🔧 POZNÁMKY K IMPLEMENTACI

1. **Názvy souborů NEměnit** - animační soubory mají historické názvy (např. modr_9_bozi_ruka zůstává, i když je přesunut k MODR_10)

2. **Skill ID opravit** - některé animace mají špatné skill ID:
   - CELA_2 pata: 11 → 6
   - CELA_4 skákaná smeč: 6 → 10
   - CELA_5 smečovaný servis: 13 → 11

3. **VSET_2 vs VSET_3** - potřebuje objasnění, kdo je který hráč

4. **Import statements** - nekopírovat, jsou již v souboru

---

## 📊 PRIORITA OPRAV

**PRIORITA 1 - Jednoduché přesuny (7 případů):**
- David Višvader (MODR_9 → MODR_10)
- Rudolf Stařičný (VSET_9 → VSET_13)
- Michal Nepodal (RADO_9 → RADO_3)

**PRIORITA 2 - Komplexní přesuny (4 případy):**
- Tomáš Andris (CELA_2 → CELA_1)
- Petr Nesládek (CELA_3 → CELA_6)
- Vojtěch Holas (CELA_5 → CELA_3)
- Daniel Matura (CELA_4 → CELA_5)

**PRIORITA 3 - Vyžaduje objasnění:**
- Jan Chalupa (VSET_2 vs VSET_3)
