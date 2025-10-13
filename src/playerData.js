export const skills = {
  1: {
    name: 'Smeč přes blok/do středu',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Slabší noha',
    stats: ['technika', 'cteniHry', 'obratnost']
  },
  2: {
    name: 'Smeč do béčka/do paty',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Slabší noha',
    stats: ['rana', 'obratnost', 'rychlost']
  },
  3: {
    name: 'Smeč po noze/do áčka',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Skluz',
    stats: ['rana', 'rana', 'rychlost']
  },
  4: {
    name: 'Tupá rána kamkoliv',
    type: 'special',
    effect: 'Hoď dvěma mincemi: hlava+hlava = prohraná výměna, 1 panna = standardní útok, 2 panny = efekt útočné ultimate',
    stats: ['vydrz', 'rana', 'rychlost']
  },
  5: {
    name: 'Klepák',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Blok',
    stats: ['obratnost', 'obetavost', 'vydrz']
  },
  6: {
    name: 'Pata',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Slabší noha',
    stats: ['technika', 'psychickaOdolnost', 'cteniHry']
  },
  7: {
    name: 'Kraťas pod sebe',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Skluz',
    stats: ['technika', 'cteniHry']
  },
  8: {
    name: 'Kraťas za blok',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Skluz',
    stats: ['technika', 'psychickaOdolnost', 'cteniHry']
  },
  9: {
    name: 'Šlapaný kraťas',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Blok',
    stats: ['technika', 'psychickaOdolnost', 'cteniHry']
  },
  10: {
    name: 'Skákaná smeč',
    type: 'offensive',
    effect: '+1 bod pro tým, pokud není v týmu soupeře aktivovaná schopnost Blok',
    stats: ['obratnost', 'obetavost', 'vydrz']
  },
  11: {
    name: 'Smečovaný servis',
    type: 'special',
    effect: 'Hoď dvěma mincemi: hlava+hlava = prohraná výměna, 1 panna = standardní útok, 2 panny = efekt obranné ultimate',
    stats: ['rana', 'psychickaOdolnost', 'vydrz']
  },
  12: {
    name: 'Blok',
    type: 'defensive',
    stats: ['obrana', 'obratnost', 'obetavost', 'rychlost']
  },
  13: {
    name: 'Skluz',
    type: 'defensive',
    stats: ['obrana', 'rychlost', 'obetavost']
  },
  14: {
    name: 'Slabší noha',
    type: 'defensive',
    stats: ['obrana', 'obrana', 'psychickaOdolnost', 'vydrz']
  },
  15: {
    name: 'Nesmysl',
    type: 'nonsense',
    successRate: 10,
    effect: 'Úspěch (10%): Nebránitelný bod + soupeř má poloviční statistiky do konce zápasu. Neúspěch (90%): Hráč je vystřídán a trenér má kousavé poznámky.',
    stats: []
  },
  16: {
    name: 'Hruď',
    type: 'defensive',
    successRate: 100,
    universalDefense: true,
    blockChance: 30,
    effect: '100% aktivace, 30% šance zablokovat jakýkoliv útok',
    stats: ['obrana', 'psychickaOdolnost', 'vydrz'],
    cannotBeUltimate: true
  },
  17: {
    name: 'Silnější noha',
    type: 'defensive',
    successRate: 100,
    universalDefense: true,
    blockChance: 30,
    effect: '100% aktivace, 30% šance zablokovat jakýkoliv útok',
    stats: ['obrana', 'obrana', 'rychlost'],
    cannotBeUltimate: true
  }
};

// Rozšířené informace o schopnostech (pro modal)
export const skillDetails = {
  1: {
    description: 'Silná smeč přes blok soupeře nebo přímo do středu hřiště. Vyžaduje dobré čtení hry a techniku.',
    keyStats: 'Technika, Čtení hry, Obratnost',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Slabší noha - dokáže přijmout i silné směči směřující do těla nebo k patě',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  2: {
    description: 'Agresivní smeč směřující do béčka nebo k patě soupeře. Kombinace síly a rychlosti.',
    keyStats: 'Rána, Obratnost, Rychlost',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Slabší noha - specialista na příjem míčů směřujících k patě',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  3: {
    description: 'Technicky náročná smeč po noze nebo do áčka. Vyžaduje vynikající sílu a rychlost.',
    keyStats: 'Rána (2x), Rychlost',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Skluz - umožňuje se dostat k obtížně dostupným míčům po noze',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  4: {
    description: 'Riskantní tupá rána kamkoliv na hřiště. Hodí se dvěma mincemi: 2x hlava = prohraná výměna, 1 panna = standardní útok, 2x panna = efekt útočné Ultimate!',
    keyStats: 'Výdrž, Rána, Rychlost',
    evaluationPhase: 'Speciální fáze - nejprve se hází mincemi, pak se vyhodnocuje podle výsledku',
    bestCounter: 'Univerzální obrany (Hruď, Silnější noha) mají vždy šanci zablokovat, jinak závisí na výsledku hodu',
    priority: 'Speciální priorita (po Ultimate, před standardními schopnostmi)'
  },
  5: {
    description: 'Klepák - technicky náročný úder vyžadující obratnost a obětavost. Těžko se brání.',
    keyStats: 'Obratnost, Obětavost, Výdrž',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Blok - jediná obrana schopná zastavit klepák',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  6: {
    description: 'Precizní úder patou vyžadující výbornou techniku a čtení hry. Psychicky náročný.',
    keyStats: 'Technika, Psychická odolnost, Čtení hry',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Slabší noha - specializace na příjem míčů k patě',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  7: {
    description: 'Kraťas pod sebe - krátký úder přímo před soupeře. Vyžaduje perfektní timing.',
    keyStats: 'Technika, Čtení hry',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Skluz - rychlá reakce a skluz umožňuje dosáhnout na krátké míče',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  8: {
    description: 'Kraťas za blok soupeře. Technicky náročný úder vyžadující skvělé čtení hry.',
    keyStats: 'Technika, Psychická odolnost, Čtení hry',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Skluz - umožňuje rychle reagovat na kraťasy za blok',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  9: {
    description: 'Šlapaný kraťas - vysoce technický úder s prvkem překvapení. Psychicky náročný.',
    keyStats: 'Technika, Psychická odolnost, Čtení hry',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Blok - správně načasovaný blok dokáže zastavit šlapaný kraťas',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  10: {
    description: 'Skákaná smeč - dynamický útok vyžadující výbornou obratnost a obětavost.',
    keyStats: 'Obratnost, Obětavost, Výdrž',
    evaluationPhase: 'Standardní útočná fáze - vyhodnocuje se proti obranným schopnostem',
    bestCounter: 'Blok - může zastavit i skákané směči',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  11: {
    description: 'Smečovaný servis - riskantní podání. Hodí se dvěma mincemi: 2x hlava = prohraná výměna, 1 panna = standardní útok, 2x panna = efekt obranné Ultimate!',
    keyStats: 'Rána, Psychická odolnost, Výdrž',
    evaluationPhase: 'Speciální fáze - nejprve se hází mincemi, pak se vyhodnocuje podle výsledku',
    bestCounter: 'Univerzální obrany (Hruď, Silnější noha) mají vždy šanci zablokovat, jinak závisí na výsledku hodu',
    priority: 'Speciální priorita (po Ultimate, před standardními schopnostmi)'
  },
  12: {
    description: 'Blok - skočení do výšky s nataženýma rukama. Brání proti klepákům, skákaným smečím a šlapaným kraťasům.',
    keyStats: 'Obrana, Obratnost, Obětavost, Rychlost',
    evaluationPhase: 'Obranná fáze - vyhodnocuje se proti útočným schopnostem 5, 9, 10',
    bestCounter: 'Nelze přímo counterovat obrannou schopnost, ale je účinná pouze proti specifickým útokům',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  13: {
    description: 'Skluz - skok do vzdálených míčů. Brání proti kraťasům a smečům po noze.',
    keyStats: 'Obrana, Rychlost, Obětavost',
    evaluationPhase: 'Obranná fáze - vyhodnocuje se proti útočným schopnostem 3, 7, 8',
    bestCounter: 'Nelze přímo counterovat obrannou schopnost, ale je účinná pouze proti specifickým útokům',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  14: {
    description: 'Slabší noha - příjem slabší nohou. Brání proti smečím do středu, béčka, paty a dalším směčím.',
    keyStats: 'Obrana (2x), Psychická odolnost, Výdrž',
    evaluationPhase: 'Obranná fáze - vyhodnocuje se proti útočným schopnostem 1, 2, 6',
    bestCounter: 'Nelze přímo counterovat obrannou schopnost, ale je účinná pouze proti specifickým útokům',
    priority: 'Normální priorita (po Ultimate a univerzálních obranách)'
  },
  15: {
    description: 'Nesmysl - šílený trik! Úspěch (10%): Nebránitelný bod + soupeř má poloviční statistiky do konce zápasu. Neúspěch (90%): Hráč je vystřídán a trenér zuří.',
    keyStats: 'Žádné - úspěšnost je pevně 10%',
    evaluationPhase: 'Prioritní fáze - vyhodnocuje se PŘED Ultimate schopnostmi',
    bestCounter: 'Nelze zabránit - vždy má 10% šanci na úspěch, nelze zablokovat',
    priority: 'Nejvyšší priorita - vyhodnocuje se jako první'
  },
  16: {
    description: 'Hruď - univerzální obrana hrudí. 100% aktivace, 30% šance zablokovat JAKÝKOLIV útok.',
    keyStats: 'Obrana, Psychická odolnost, Výdrž',
    evaluationPhase: 'Univerzální obranná fáze - vyhodnocuje se po Ultimate, ale před speciálními a běžnými schopnostmi',
    bestCounter: 'Nelze counterovat - funguje proti všem útokům. Pouze Ultimate útočné schopnosti mají přednost.',
    priority: 'Velmi vysoká priorita (po Ultimate, před všemi ostatními)'
  },
  17: {
    description: 'Silnější noha - univerzální obrana silnější nohou. 100% aktivace, 30% šance zablokovat JAKÝKOLIV útok.',
    keyStats: 'Obrana (2x), Rychlost',
    evaluationPhase: 'Univerzální obranná fáze - vyhodnocuje se po Ultimate, ale před speciálními a běžnými schopnostmi',
    bestCounter: 'Nelze counterovat - funguje proti všem útokům. Pouze Ultimate útočné schopnosti mají přednost.',
    priority: 'Velmi vysoká priorita (po Ultimate, před všemi ostatními)'
  }
};

// Hráči NK Opava
export const players = [
  {
    "id": 1,
    "name": "Radim Bokisch",
    "position": "Blokař/Smečař",
    "number": 4,
    "photo": "/players/bokisch.jpg",
    "nickname": "Švestka",
    "nonsenseName": "Backflip přes soupeře",
    "dominantFoot": "right",
    "trainingAttendance2025": 100,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 83,
      "obratnost": 82,
      "rana": 83,
      "technika": 77,
      "obetavost": 79,
      "psychickaOdolnost": 79,
      "obrana": 82,
      "cteniHry": 77,
      "vydrz": 78
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 10,
        "wins": 7,
        "losses": 3,
        "winRate": 70,
        "disciplines": {
          "singl": {
            "matches": 1,
            "wins": 1,
            "winRate": 100
          },
          "dvojice": {
            "matches": 4,
            "wins": 2,
            "winRate": 50
          },
          "trojice": {
            "matches": 5,
            "wins": 4,
            "winRate": 80
          }
        }
      },
      {
        "season": "2025",
        "league": "1. liga muži - základní část",
        "matches": 51,
        "wins": 13,
        "losses": 38,
        "winRate": 25,
        "disciplines": {
          "singl": {
            "matches": 9,
            "wins": 1,
            "winRate": 11
          },
          "dvojice": {
            "matches": 17,
            "wins": 6,
            "winRate": 35
          },
          "trojice": {
            "matches": 25,
            "wins": 6,
            "winRate": 24
          }
        }
      },
      {
        "season": "2024 Play-off",
        "league": "2. liga muži",
        "matches": 10,
        "wins": 4,
        "losses": 6,
        "winRate": 40,
        "disciplines": {
          "singl": {
            "matches": 2,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 3,
            "winRate": 100
          },
          "trojice": {
            "matches": 5,
            "wins": 1,
            "winRate": 20
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 30,
        "wins": 25,
        "losses": 5,
        "winRate": 83,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 12,
            "wins": 10,
            "winRate": 83
          },
          "trojice": {
            "matches": 18,
            "wins": 15,
            "winRate": 83
          }
        }
      }
    ]
  },
  {
    "id": 2,
    "name": "Tomáš Hyžák",
    "position": "Nahravač/Polař",
    "number": 8,
    "photo": "/players/hyzak.jpg",
    "nickname": "Háčko",
    "nonsenseName": "Trojitý piruet s plivnutím",
    "dominantFoot": "right",
    "trainingAttendance2025": 0,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 79,
      "obratnost": 80,
      "rana": 78,
      "technika": 84,
      "obetavost": 81,
      "psychickaOdolnost": 81,
      "obrana": 83,
      "cteniHry": 84,
      "vydrz": 79
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 5,
        "wins": 3,
        "losses": 2,
        "winRate": 60,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "trojice": {
            "matches": 5,
            "wins": 3,
            "winRate": 60
          }
        }
      },
      {
        "season": "2025",
        "league": "1. liga muží - základní část",
        "matches": 19,
        "wins": 6,
        "losses": 13,
        "winRate": 32,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 5,
            "wins": 2,
            "winRate": 40
          },
          "trojice": {
            "matches": 14,
            "wins": 4,
            "winRate": 29
          }
        }
      },
      {
        "season": "2024 Play-off",
        "league": "2. liga muži",
        "matches": 2,
        "wins": 1,
        "losses": 1,
        "winRate": 50,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "trojice": {
            "matches": 2,
            "wins": 1,
            "winRate": 50
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 20,
        "wins": 17,
        "losses": 3,
        "winRate": 85,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 7,
            "wins": 7,
            "winRate": 100
          },
          "trojice": {
            "matches": 13,
            "wins": 10,
            "winRate": 77
          }
        }
      }
    ]
  },
  {
    "id": 4,
    "name": "Ondřej Kurka",
    "position": "Blokař/Smečař",
    "number": 13,
    "photo": "/players/kurka.jpg",
    "nickname": "Kuřinožka",
    "nonsenseName": "Shaolin po obrně",
    "dominantFoot": "right",
    "trainingAttendance2025": 100,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 84,
      "obratnost": 83,
      "rana": 84,
      "technika": 78,
      "obetavost": 80,
      "psychickaOdolnost": 80,
      "obrana": 83,
      "cteniHry": 78,
      "vydrz": 79
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 10,
        "wins": 4,
        "losses": 6,
        "winRate": 40,
        "disciplines": {
          "singl": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 4,
            "wins": 1,
            "winRate": 25
          },
          "trojice": {
            "matches": 5,
            "wins": 3,
            "winRate": 60
          }
        }
      },
      {
        "season": "2025",
        "league": "1. liga muží - základní část",
        "matches": 46,
        "wins": 16,
        "losses": 30,
        "winRate": 35,
        "disciplines": {
          "singl": {
            "matches": 3,
            "wins": 1,
            "winRate": 33
          },
          "dvojice": {
            "matches": 17,
            "wins": 6,
            "winRate": 35
          },
          "trojice": {
            "matches": 26,
            "wins": 9,
            "winRate": 35
          }
        }
      },
      {
        "season": "2024 Play-off",
        "league": "2. liga muži",
        "matches": 9,
        "wins": 5,
        "losses": 4,
        "winRate": 56,
        "disciplines": {
          "singl": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 3,
            "winRate": 100
          },
          "trojice": {
            "matches": 5,
            "wins": 2,
            "winRate": 40
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 33,
        "wins": 26,
        "losses": 7,
        "winRate": 79,
        "disciplines": {
          "singl": {
            "matches": 2,
            "wins": 1,
            "winRate": 50
          },
          "dvojice": {
            "matches": 12,
            "wins": 10,
            "winRate": 83
          },
          "trojice": {
            "matches": 19,
            "wins": 15,
            "winRate": 79
          }
        }
      }
    ]
  },
  {
    "id": 5,
    "name": "Roman Kvarda",
    "position": "Polař/Smečař",
    "number": 24,
    "photo": "/players/kvarda.jpg",
    "nickname": "Kvarduplegik",
    "nonsenseName": "Kvarďákův pětiúhelník",
    "dominantFoot": "right",
    "trainingAttendance2025": 0,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 78,
      "obratnost": 81,
      "rana": 77,
      "technika": 81,
      "obetavost": 78,
      "psychickaOdolnost": 78,
      "obrana": 80,
      "cteniHry": 81,
      "vydrz": 77
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 9,
        "wins": 5,
        "losses": 4,
        "winRate": 56,
        "disciplines": {
          "singl": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 1,
            "winRate": 33
          },
          "trojice": {
            "matches": 5,
            "wins": 4,
            "winRate": 80
          }
        }
      },
      {
        "season": "2025",
        "league": "1. liga muží - základní část",
        "matches": 24,
        "wins": 9,
        "losses": 15,
        "winRate": 38,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 10,
            "wins": 4,
            "winRate": 40
          },
          "trojice": {
            "matches": 14,
            "wins": 5,
            "winRate": 36
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 10,
        "wins": 6,
        "losses": 4,
        "winRate": 60,
        "disciplines": {
          "singl": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 4,
            "wins": 3,
            "winRate": 75
          },
          "trojice": {
            "matches": 5,
            "wins": 3,
            "winRate": 60
          }
        }
      }
    ]
  },
  {
    "id": 7,
    "name": "David Majštiník",
    "position": "Polař/Smečař",
    "number": 23,
    "photo": "/players/majstinik.jpg",
    "nickname": "Majšitník/Majštěník",
    "nonsenseName": "Pozdrav přítelkyni",
    "dominantFoot": "right",
    "trainingAttendance2025": 0,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 82,
      "obratnost": 85,
      "rana": 81,
      "technika": 85,
      "obetavost": 82,
      "psychickaOdolnost": 82,
      "obrana": 84,
      "cteniHry": 85,
      "vydrz": 81
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 6,
        "wins": 5,
        "losses": 1,
        "winRate": 83,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 2,
            "winRate": 67
          },
          "trojice": {
            "matches": 3,
            "wins": 3,
            "winRate": 100
          }
        }
      },
      {
        "season": "2025",
        "league": "1. liga muží - základní část",
        "matches": 13,
        "wins": 5,
        "losses": 8,
        "winRate": 38,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 5,
            "wins": 2,
            "winRate": 40
          },
          "trojice": {
            "matches": 8,
            "wins": 3,
            "winRate": 38
          }
        }
      },
      {
        "season": "2024",
        "league": "1. liga muži (Vsetín)",
        "matches": 15,
        "wins": 12,
        "losses": 3,
        "winRate": 80,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 7,
            "wins": 6,
            "winRate": 86
          },
          "trojice": {
            "matches": 8,
            "wins": 6,
            "winRate": 75
          }
        }
      }
    ]
  },
  {
    "id": 9,
    "name": "Josef Nezval",
    "position": "Polař/Smečař",
    "number": 18,
    "photo": "/players/nezval.jpg",
    "nickname": "Kladívko",
    "nonsenseName": "Nezvalova spirála smrti",
    "dominantFoot": "right",
    "trainingAttendance2025": 50,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 78,
      "obratnost": 81,
      "rana": 77,
      "technika": 81,
      "obetavost": 78,
      "psychickaOdolnost": 78,
      "obrana": 80,
      "cteniHry": 81,
      "vydrz": 77
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 9,
        "wins": 4,
        "losses": 5,
        "winRate": 44,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 4,
            "wins": 1,
            "winRate": 25
          },
          "trojice": {
            "matches": 5,
            "wins": 3,
            "winRate": 60
          }
        }
      },
      {
        "season": "2025",
        "league": "1. liga muži - základní část",
        "matches": 36,
        "wins": 15,
        "losses": 21,
        "winRate": 42,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 14,
            "wins": 5,
            "winRate": 36
          },
          "trojice": {
            "matches": 22,
            "wins": 10,
            "winRate": 45
          }
        }
      },
      {
        "season": "2024 Play-off",
        "league": "2. liga muži",
        "matches": 9,
        "wins": 5,
        "losses": 4,
        "winRate": 56,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 2,
            "winRate": 67
          },
          "trojice": {
            "matches": 6,
            "wins": 3,
            "winRate": 50
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 18,
        "wins": 9,
        "losses": 9,
        "winRate": 50,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 7,
            "wins": 3,
            "winRate": 43
          },
          "trojice": {
            "matches": 11,
            "wins": 6,
            "winRate": 55
          }
        }
      }
    ]
  },
  {
    "id": 11,
    "name": "Jan Širocký",
    "position": "Trenér",
    "number": 69,
    "photo": "/players/sirocky.jpg",
    "stats": null,
    "coachQuotes": {
      "offensiveSuccess": [
        "Táááák!",
        "To je ono!",
        "Líp bych to nezahrál!",
        "Trhej!",
        "Nejsem překvapen!",
        "Tak tohle jsme trénovali!",
        "Výborně!",
        "Tak to má vypadat!",
        "Krásná akce!"
      ],
      "offensiveFail": [
        "Střídáme!",
        "Neflákej to!",
        "To je vážně všechno?",
        "Tak tohle jsme netrénovali!",
        "Soustřeď se!",
        "Sundej ty hnědé trenky!",
        "Jdu raději na cígo!",
        "Že já raději nešel na bowling!",
        "To snad není možné!"
      ],
      "defensiveFail": [
        "Zaber!",
        "Máš správné dioptrie?",
        "Kde máš hlavu?",
        "Běž na lavičku!",
        "To je ostuda!",
        "Sundej ty hnědé trenky!",
        "Jdu raději na cígo!",
        "Že já raději nešel na bowling!",
        "To snad není možné!"
      ],
      "encouragement": [
        "Ještě není konec!",
        "Pořád to můžeme otočit!",
        "Soustředíme se, máme to!",
        "Jeden bod po druhém!",
        "Teď si to vzít zpátky!"
      ]
    }
  },
  {
    "id": 12,
    "name": "Jan Stařičný",
    "position": "Nahravač/Polař",
    "number": 4,
    "photo": "/players/staricny.jpg",
    "nickname": "Hanz",
    "nonsenseName": "Stařičná kosa doleva",
    "dominantFoot": "right",
    "trainingAttendance2025": 0,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 74,
      "obratnost": 75,
      "rana": 73,
      "technika": 79,
      "obetavost": 76,
      "psychickaOdolnost": 76,
      "obrana": 78,
      "cteniHry": 79,
      "vydrz": 74
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025",
        "league": "1. liga muži - základní část",
        "matches": 8,
        "wins": 3,
        "losses": 5,
        "winRate": 38,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 1,
            "winRate": 33
          },
          "trojice": {
            "matches": 5,
            "wins": 2,
            "winRate": 40
          }
        }
      }
    ]
  },
  {
    "id": 13,
    "name": "Tomáš Volman",
    "position": "Nahravač/Polař",
    "number": 12,
    "photo": "/players/volman.jpg",
    "nickname": "Forest",
    "nonsenseName": "Volmanův tsunami",
    "dominantFoot": "right",
    "trainingAttendance2025": 0,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 72,
      "obratnost": 73,
      "rana": 71,
      "technika": 77,
      "obetavost": 74,
      "psychickaOdolnost": 74,
      "obrana": 76,
      "cteniHry": 77,
      "vydrz": 72
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025",
        "league": "1. liga muži - základní část",
        "matches": 2,
        "wins": 0,
        "losses": 2,
        "winRate": 0,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          },
          "trojice": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          }
        }
      },
      {
        "season": "2024 Play-off",
        "league": "2. liga muži",
        "matches": 5,
        "wins": 1,
        "losses": 4,
        "winRate": 20,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 1,
            "wins": 0,
            "winRate": 0
          },
          "trojice": {
            "matches": 4,
            "wins": 1,
            "winRate": 25
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 13,
        "wins": 9,
        "losses": 4,
        "winRate": 69,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 3,
            "wins": 2,
            "winRate": 67
          },
          "trojice": {
            "matches": 10,
            "wins": 7,
            "winRate": 70
          }
        }
      }
    ]
  },
  {
    "id": 14,
    "name": "Radim Adámek",
    "position": "Polař/Smečař",
    "number": 20,
    "photo": "/players/adamek.jpg",
    "nickname": "Odřené koleno",
    "nonsenseName": "Adámkův meteor",
    "dominantFoot": "right",
    "trainingAttendance2025": 25,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 84,
      "obratnost": 87,
      "rana": 83,
      "technika": 87,
      "obetavost": 84,
      "psychickaOdolnost": 84,
      "obrana": 86,
      "cteniHry": 87,
      "vydrz": 83
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2024 Play-off",
        "league": "2. liga muži",
        "matches": 8,
        "wins": 3,
        "losses": 5,
        "winRate": 38,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 2,
            "wins": 1,
            "winRate": 50
          },
          "trojice": {
            "matches": 6,
            "wins": 2,
            "winRate": 33
          }
        }
      },
      {
        "season": "2024",
        "league": "2. liga muži C",
        "matches": 24,
        "wins": 18,
        "losses": 6,
        "winRate": 75,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 11,
            "wins": 10,
            "winRate": 91
          },
          "trojice": {
            "matches": 21,
            "wins": 11,
            "winRate": 52
          }
        }
      }
    ]
  },
  {
    "id": 15,
    "name": "Jakub Václavek",
    "position": "Polař/Smečař",
    "number": 21,
    "photo": "/players/vaclavek.jpg",
    "nickname": "Posila",
    "nonsenseName": "Václavkův veletoč",
    "dominantFoot": "right",
    "trainingAttendance2025": 50,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 77,
      "obratnost": 80,
      "rana": 76,
      "technika": 80,
      "obetavost": 77,
      "psychickaOdolnost": 77,
      "obrana": 79,
      "cteniHry": 80,
      "vydrz": 76
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2024",
        "league": "2. liga muži C (Přerov)",
        "matches": 33,
        "wins": 13,
        "losses": 20,
        "winRate": 39,
        "disciplines": {
          "singl": {
            "matches": 7,
            "wins": 2,
            "winRate": 29
          },
          "dvojice": {
            "matches": 10,
            "wins": 6,
            "winRate": 60
          },
          "trojice": {
            "matches": 16,
            "wins": 5,
            "winRate": 31
          }
        }
      }
    ]
  },
  {
    "id": 17,
    "name": "Jan Němčík",
    "position": "Polař/Nahravač",
    "number": 5,
    "photo": "/players/nemcik.jpg",
    "nickname": "MVP",
    "nonsenseName": "Němčíkova neklidná smyčka",
    "dominantFoot": "right",
    "trainingAttendance2025": 100,
    "simulationStats": {
      "singl": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "dvojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      },
      "trojice": {
        "matches": 0,
        "wins": 0,
        "winRate": 0
      }
    },
    "stats": {
      "rychlost": 80,
      "obratnost": 81,
      "rana": 79,
      "technika": 85,
      "obetavost": 82,
      "psychickaOdolnost": 82,
      "obrana": 84,
      "cteniHry": 85,
      "vydrz": 80
    },
    "availableSkills": [
      16,
      17
    ],
    "seasonStats": [
      {
        "season": "2025 Play Out",
        "league": "1. liga muži",
        "matches": 2,
        "wins": 1,
        "losses": 1,
        "winRate": 50,
        "disciplines": {
          "singl": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "dvojice": {
            "matches": 0,
            "wins": 0,
            "winRate": 0
          },
          "trojice": {
            "matches": 2,
            "wins": 1,
            "winRate": 50
          }
        }
      }
    ]
  }
]
