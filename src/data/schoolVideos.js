// Mapování všech dostupných videí pro Školu nohejbalu
// Obsahuje úspěšné i neúspěšné verze dovedností

export const schoolVideos = {
  // Každá dovednost obsahuje pole videí s informacemi o hráči a úspěšnosti
  1: { // Smeč do středu/přes blok
    name: 'Smeč do středu/přes blok',
    videos: [
      { playerId: 'CAKO_2', playerName: 'Filip Chádim', teamCode: 'CAKO', video: '/videos/chadim-t-smec-stred.mp4', success: true },
      { playerId: 'GREGOR', playerName: 'Tobiáš Gregor', teamCode: 'RADO', video: '/videos/gregor-smec-stred.mp4', success: true },
      { playerId: 'MODR_10', playerName: 'David Višvader', teamCode: 'MODR', video: '/videos/modr-9-smec-pres-blok.mp4', success: true },
      { playerId: 'MODR_5', playerName: 'Jakub Pospíšil', teamCode: 'MODR', video: '/videos/modr-5-smec-pres-blok.mp4', success: true },
      { playerId: 'RADO_3', playerName: 'Nikolas Truc', teamCode: 'RADO', video: '/videos/rado-3-smec-stred.mp4', success: true },
      { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-smec-stred.mp4', success: true },
      { playerId: 'KVAR_4', playerName: 'Petr Neslídek', teamCode: 'KVAR', video: '/videos/kvar-4-smec-pres-blok.mp4', success: true },
      { playerId: 'CELA_1', playerName: 'Marek Vojtíšek', teamCode: 'CELA', video: '/videos/cela-1-smec-stred.mp4', success: true }
    ]
  },
  2: { // Smeč pod sebe/do áčka
    name: 'Smeč pod sebe/do áčka',
    videos: [
      { playerId: 'CELA_3', playerName: 'Petr Neslídek', teamCode: 'CELA', video: '/videos/cela-3-smec-do-acka.mp4', success: true }
    ]
  },
  3: { // Smeč od sebe/do béčka
    name: 'Smeč od sebe/do béčka',
    videos: [
      { playerId: 'CAKO_6', playerName: 'Zdeněk Souček', teamCode: 'CAKO', video: '/videos/soucek-smec-becko.mp4', success: true },
      { playerId: 'CAKO_3', playerName: 'Václav Kalous', teamCode: 'CAKO', video: '/videos/kalous-smec-becko.mp4', success: true },
      { playerId: 'MODR_3', playerName: 'František Kalas', teamCode: 'MODR', video: '/videos/modr-3-smec-becko.mp4', success: true },
      { playerId: 'KVAR_8', playerName: 'Jakub Medek', teamCode: 'KVAR', video: '/videos/kvar-8-smec-becko.mp4', success: true },
      { playerId: 'KVAR_3', playerName: 'Karel Hron', teamCode: 'KVAR', video: '/videos/kvar-3-smec-becko.mp4', success: true }
    ]
  },
  4: { // Tupá rána kamkoliv
    name: 'Tupá rána kamkoliv',
    videos: [
      { playerId: 'VANKE', playerName: 'Jan Vanke', teamCode: 'KVAR', video: '/videos/vanke-tupa-rana.mp4', success: true },
      { playerId: 'KVAR_1', playerName: 'Jan Hanus', teamCode: 'KVAR', video: '/videos/kvar-1-tupa-rana-kamkoliv.mp4', success: true },
      { playerId: 'KVAR_3', playerName: 'Karel Hron', teamCode: 'KVAR', video: '/videos/kvar-3-tupa-rana-kamkoliv.mp4', success: true },
      { playerId: 'RADO_13', playerName: 'Rudolf Staříčný', teamCode: 'RADO', video: '/videos/rado-13-tupa-rana-kamkoliv.mp4', success: true },
      { playerId: 'VSET_13', playerName: 'Rudolf Stařičný', teamCode: 'VSET', video: '/videos/vset-9-tupa-rana-kamkoliv.mp4', success: false },
      { playerId: 'RADO_3', playerName: 'Nikolas Truc', teamCode: 'RADO', video: '/videos/rado-3-tupa-rana-kamkoliv.mp4', success: true },
      { playerId: 'RADO_1', playerName: 'Ondřej Vít', teamCode: 'RADO', video: '/videos/rado-1-tupa-rana-kamkoliv.mp4', success: true },
      { playerId: 'CELA_3', playerName: 'Petr Neslídek', teamCode: 'CELA', video: '/videos/cela-3-tupa-rana-kamkoliv.mp4', success: true },
      { playerId: 'CELA_2', playerName: 'Tomáš Andris', teamCode: 'CELA', video: '/videos/cela-2-tupa-rana-kamkoliv.mp4', success: true }
    ]
  },
  5: { // Klepák
    name: 'Klepák',
    videos: [
      { playerId: 'VSET_8', playerName: 'David Dvořák', teamCode: 'VSET', video: '/videos/vset-4-klepak.mp4', success: false },
      { playerId: 'RADO_9', playerName: 'Michal Nepodal', teamCode: 'RADO', video: '/videos/rado-9-klepak.mp4', success: true }
    ]
  },
  6: { // Pata
    name: 'Pata',
    videos: [
      { playerId: 'VANKE', playerName: 'Jan Vanke', teamCode: 'KVAR', video: '/videos/vanke-pata.mp4', success: true },
      { playerId: 'KVAR_8', playerName: 'Jakub Medek', teamCode: 'KVAR', video: '/videos/kvar-8-smec-do-paty.mp4', success: false },
      { playerId: 'RADO_3', playerName: 'Nikolas Truc', teamCode: 'RADO', video: '/videos/rado-3-smec-do-paty.mp4', success: true },
      { playerId: 'CELA_2', playerName: 'Tomáš Andris', teamCode: 'CELA', video: '/videos/cela-2-pata.mp4', success: true }
    ]
  },
  7: { // Kraťas pod sebe
    name: 'Kraťas pod sebe',
    videos: [
      { playerId: 'CELA_10', playerName: 'Michael Svoboda', teamCode: 'CELA', video: '/videos/cela-10-kratas-pod-sebe.mp4', success: true },
      { playerId: 'MODR_1', playerName: 'Michael Svoboda', teamCode: 'MODR', video: '/videos/modr-1-kratas-pod-sebe.mp4', success: true },
      { playerId: 'RADO_3', playerName: 'Nikolas Truc', teamCode: 'RADO', video: '/videos/rado-3-smec-pod-sebe.mp4', success: true },
      { playerId: 'RADO_15', playerName: 'Michael Svoboda', teamCode: 'RADO', video: '/videos/rado-15-kratas-pod-sebe.mp4', success: true },
      { playerId: 'CAKO_1', playerName: 'Jakub Chádim', teamCode: 'CAKO', video: '/videos/chadim-kratas-uspesny.mp4', success: true }
    ]
  },
  8: { // Kraťas za blok
    name: 'Kraťas za blok',
    videos: [
      { playerId: 'GREGOR', playerName: 'Tobiáš Gregor', teamCode: 'RADO', video: '/videos/gregor-kratas-za-blok.mp4', success: true },
      { playerId: 'VSET_3', playerName: 'Jan Chalupa', teamCode: 'VSET', video: '/videos/vset-2-kratas-za-blok.mp4', success: true },
      { playerId: 'MODR_10', playerName: 'Jan Hanus', teamCode: 'MODR', video: '/videos/modr-10-kratas-za-blok.mp4', success: true },
      { playerId: 'MODR_2', playerName: 'Petr Bubniak', teamCode: 'MODR', video: '/videos/modr-2-kratas-za-blok.mp4', success: true },
      { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-kratas-za-blok.mp4', success: true }
    ]
  },
  9: { // Šlapaný kraťas
    name: 'Šlapaný kraťas',
    videos: [
      { playerId: 'RADO_1', playerName: 'Ondřej Vít', teamCode: 'RADO', video: '/videos/rado-1-slapany-kratas.mp4', success: false }
    ]
  },
  10: { // Skákaná smeč
    name: 'Skákaná smeč',
    videos: [
      { playerId: 'GREGOR', playerName: 'Tobiáš Gregor', teamCode: 'RADO', video: '/videos/gregor-skakana-smec.mp4', success: true },
      { playerId: 'MODR_10', playerName: 'David Višvader', teamCode: 'MODR', video: '/videos/modr-9-skakana-smec.mp4', success: true },
      { playerId: 'RADO_1', playerName: 'Ondřej Vít', teamCode: 'RADO', video: '/videos/rado-1-skakana-smec.mp4', success: false },
      { playerId: 'CELA_4', playerName: 'Daniel Matura', teamCode: 'CELA', video: '/videos/cela-4-skakana-smec.mp4', success: true },
      { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-skakana-smec.mp4', success: true }
    ]
  },
  11: { // Smečovaný servis
    name: 'Smečovaný servis',
    videos: [
      { playerId: 'VSET_5', playerName: 'Vojt\u011bch Sýs', teamCode: 'VSET', video: '/videos/vset-5-smecovany-servis.mp4', success: true },
      { playerId: 'CELA_10', playerName: 'Michael Svoboda', teamCode: 'CELA', video: '/videos/modr-1-smecovany-servis.mp4', success: true },
      { playerId: 'MODR_10', playerName: 'Jan Hanus', teamCode: 'MODR', video: '/videos/modr-10-smecovany-servis.mp4', success: true },
      { playerId: 'MODR_1', playerName: 'Michael Svoboda', teamCode: 'MODR', video: '/videos/modr-1-smecovany-servis.mp4', success: true },
      { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-smecovany-servis.mp4', success: true },
      { playerId: 'KVAR_3', playerName: 'Karel Hron', teamCode: 'KVAR', video: '/videos/kvar-3-smecovany-servis.mp4', success: true },
      { playerId: 'CELA_5', playerName: 'Vojt\u011bch Holas', teamCode: 'CELA', video: '/videos/cela-5-smecovany-servis.mp4', success: true },
      { playerId: 'CELA_1', playerName: 'Marek Vojtíšek', teamCode: 'CELA', video: '/videos/cela-1-smecovany-servis.mp4', success: true }
    ]
  },
  12: { // Blok
    name: 'Blok',
    videos: [
      { playerId: 'VANKE', playerName: 'Jan Vanke', teamCode: 'KVAR', video: '/videos/vanke-blok.mp4', success: true },
      { playerId: 'MODR_3', playerName: 'František Kalas', teamCode: 'MODR', video: '/videos/modr-3-blok.mp4', success: true },
      { playerId: 'KVAR_8', playerName: 'Jakub Medek', teamCode: 'KVAR', video: '/videos/kvar-8-blok.mp4', success: true },
      { playerId: 'CELA_10', playerName: 'Michael Svoboda', teamCode: 'CELA', video: '/videos/cela-10-blok.mp4', success: true },
      { playerId: 'RADO_11', playerName: 'David Dvořák', teamCode: 'RADO', video: '/videos/rado-11-blok.mp4', success: true },
      { playerId: 'RADO_17', playerName: 'Petr Vít', teamCode: 'RADO', video: '/videos/rado-17-blok.mp4', success: true },
      { playerId: 'RADO_2', playerName: 'Jakub Medek', teamCode: 'RADO', video: '/videos/rado-2-blok.mp4', success: true },
      { playerId: 'VSET_3', playerName: 'Jan Chalupa', teamCode: 'VSET', video: '/videos/vset-2-blok.mp4', success: true },
      { playerId: 'VSET_5', playerName: 'Martin Zbranek', teamCode: 'VSET', video: '/videos/vset-1-blok.mp4', success: true },
      { playerId: 'KVAR_9', playerName: 'Marek Vojtíšek', teamCode: 'KVAR', video: '/videos/kvar-9-blok.mp4', success: true },
      { playerId: 'KVAR_1', playerName: 'Jan Hanus', teamCode: 'KVAR', video: '/videos/kvar-1-blok.mp4', success: true },
      { playerId: 'KVAR_4', playerName: 'Petr Neslídek', teamCode: 'KVAR', video: '/videos/kvar-4-blok.mp4', success: true },
      { playerId: 'CELA_3', playerName: 'Petr Neslídek', teamCode: 'CELA', video: '/videos/cela-3-blok.mp4', success: true },
      { playerId: 'CELA_1', playerName: 'Marek Vojtíšek', teamCode: 'CELA', video: '/videos/cela-1-blok.mp4', success: true }
    ]
  },
  13: { // Skluz
    name: 'Skluz',
    videos: [
      { playerId: 'MODR_10', playerName: 'David Višvader', teamCode: 'MODR', video: '/videos/modr-9-skluz.mp4', success: true }
    ]
  },
  14: { // Slabší noha
    name: 'Slabší noha',
    videos: [
      { playerId: 'CAKO_1', playerName: 'Filip Chádim', teamCode: 'CAKO', video: '/videos/chadim-slabsi-noha.mp4', success: true },
      { playerId: 'KVAR_5', playerName: 'Matěj Medek', teamCode: 'KVAR', video: '/videos/kvar-5-slabsi-noha.mp4', success: true },
      // { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-slabsi-noha.mp4', success: false }, // Video neexistuje
      { playerId: 'CELA_5', playerName: 'Vojt\u011bch Holas', teamCode: 'CELA', video: '/videos/cela-5-slabsi-noha.mp4', success: true }
    ]
  },
  15: { // Nesmysl
    name: 'Nesmysl',
    videos: [
      // Úspěšné nesmysly
      { playerId: 4, playerName: 'Ondřej Kurka', teamCode: 'OPAVA', video: '/videos/kurka-shaolin-success.mp4', success: true },
      { playerId: 'MODR_5', playerName: 'Jakub Pospíšil', teamCode: 'MODR', video: '/videos/modr-5-nenapadna-vymena-balonu-za-prefoukany.mp4', success: true },
      { playerId: 'MODR_10', playerName: 'David Višvader', teamCode: 'MODR', video: '/videos/modr-9-bozi-ruka.mp4', success: true },
      { playerId: 'VSET_13', playerName: 'Rudolf Stařičný', teamCode: 'VSET', video: '/videos/vset-9-staredown.mp4', success: true },
      { playerId: 'CELA_6', playerName: 'Petr Nesládek', teamCode: 'CELA', video: '/videos/cela-3-dat-neco-do-piti-sobe-i-blokari.mp4', success: true },
      // Neúspěšné nesmysly
      { playerId: 4, playerName: 'Ondřej Kurka', teamCode: 'OPAVA', video: '/videos/kurka-shaolin-fail.mp4', success: false },
      { playerId: 'MODR_6', playerName: 'Lukáš Rosenberk', teamCode: 'MODR', video: '/videos/modr-6-lehke-povoleni-saka.mp4', success: false },
      { playerId: 'VSET_5', playerName: 'Martin Zbranek', teamCode: 'VSET', video: '/videos/vset-1-bodlo-do-kouli.mp4', success: false }
    ]
  },
  16: { // Hruď
    name: 'Hruď',
    videos: [
      { playerId: 'VANKE', playerName: 'Jan Vanke', teamCode: 'KVAR', video: '/videos/vanke-hrud.mp4', success: true },
      { playerId: 'CAKO_6', playerName: 'Zdeněk Souček', teamCode: 'CAKO', video: '/videos/soucek-hrud.mp4', success: true },
      { playerId: 'MODR_10', playerName: 'David Višvader', teamCode: 'MODR', video: '/videos/modr-9-hrud.mp4', success: true },
      { playerId: 'VSET_3', playerName: 'Jan Chalupa', teamCode: 'VSET', video: '/videos/vset-2-hrud.mp4', success: true },
      { playerId: 'CELA_10', playerName: 'Michael Svoboda', teamCode: 'CELA', video: '/videos/cela-10-hlava.mp4', success: true },
      { playerId: 'RADO_14', playerName: 'Karel Hron', teamCode: 'RADO', video: '/videos/rado-14-hlavicka.mp4', success: true },
      { playerId: 'RADO_9', playerName: 'Michal Nepodal', teamCode: 'RADO', video: '/videos/rado-9-hlava.mp4', success: true },
      { playerId: 'MODR_1', playerName: 'Michael Svoboda', teamCode: 'MODR', video: '/videos/modr-1-hrud.mp4', success: true },
      { playerId: 'KVAR_6', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-6-hlava.mp4', success: true },
      { playerId: 'KVAR_3', playerName: 'Karel Hron', teamCode: 'KVAR', video: '/videos/kvar-3-hrud.mp4', success: true },
      { playerId: 'KVAR_1', playerName: 'Jan Hanus', teamCode: 'KVAR', video: '/videos/kvar-1-hrud.mp4', success: true }
    ]
  },
  17: { // Silnější noha
    name: 'Silnější noha',
    videos: [
      { playerId: 'CAKO_7', playerName: 'Ondřej Kučera', teamCode: 'CAKO', video: '/videos/kucera-silnejsi-noha.mp4', success: true },
      { playerId: 'GREGOR', playerName: 'Tobiáš Gregor', teamCode: 'RADO', video: '/videos/gregor-leva-noha.mp4', success: true },
      { playerId: 'MODR_4', playerName: 'Martin Sehrig', teamCode: 'MODR', video: '/videos/modr-4-silnejsi-noha.mp4', success: true },
      { playerId: 'KVAR_8', playerName: 'Jakub Medek', teamCode: 'KVAR', video: '/videos/kvar-8-prava-noha.mp4', success: true },
      { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-leva-noha.mp4', success: false },
      { playerId: 'VSET_8', playerName: 'David Dvořák', teamCode: 'VSET', video: '/videos/vset-4-silnejsi-noha.mp4', success: true },
      { playerId: 'VSET_3', playerName: 'Jan Chalupa', teamCode: 'VSET', video: '/videos/vset-2-silnejsi-noha.mp4', success: true },
      { playerId: 'RADO_11', playerName: 'David Dvořák', teamCode: 'RADO', video: '/videos/rado-11-prava-noha.mp4', success: true }
    ]
  },
  18: { // Hlava
    name: 'Hlava',
    videos: [
      // TODO: Add proper hlava videos here
    ]
  },
  19: { // Vytlučený blok
    name: 'Vytlučený blok',
    videos: [
      // Note: Tyto videa v adresáři neexistují, ale ponechávám je pro budoucnost
      // { playerId: 'GREGOR', playerName: 'Tobiáš Gregor', teamCode: 'RADO', video: '/videos/gregor-vytluceny-blok.mp4', success: false },
      // { playerId: 'MODR_4', playerName: 'Martin Sehrig', teamCode: 'MODR', video: '/videos/modr-4-vytluceny-blok.mp4', success: false },
      // { playerId: 'KVAR_7', playerName: 'Jan Chalupa', teamCode: 'KVAR', video: '/videos/kvar-7-vytluceny-blok.mp4', success: false }
    ]
  }
}

// Komentáře Okurky pro jednotlivé dovednosti
export const okurkaComments = {
  1: {
    title: 'Smeč do středu/přes blok',
    comment: 'Klíčem je dobrý rozběh, výskok a správné načasování úderu. Míč musí jít přes blok soupeře, ne do něj. Při rozběhu se zaměř na to, aby tvoje poslední krok byl dlouhý a posunul ti těžiště dozadu pro silnější výskok. V tu chvíli se odraz celé tělo, ne jen nohy. Ruce máš za tělem, pak je švihneš dopředu. Míč máš trefit co nejblíže k tělu, ideálně nad hlavou nebo lehce před ní, a udeřit ho silnou rukou, která jde přes tělo jako bič. Zápěstí ohneš v poslední chvíli, aby míč šel dolů. Pohled měj na míč, dokud do něj neudřeš.'
  },
  2: {
    title: 'Smeč pod sebe/do áčka',
    comment: 'Cíl je trefit "áčko" - prostor těsně za sítí. Potřebuješ výborný výskok a precizní úder. Rozběh a výskok jsou stejné jako u běžné smeče, ale úder je jemnější. Smeč pod sebe znamená trefit míč takhle krátce, že soupeř na něj nestihne. V tu chvíli musíš míč trefit jemněji, víc v předklonu. Není to o síle, ale o umístění. Zápěstí ohneš dřív, už při úderu, míč trefit lehce shora a směřovat dolů těsně za síť. Při dopadu buď připravený na protiútok.'
  },
  3: {
    title: 'Smeč od sebe/do béčka',
    comment: 'Smeč do "béčka" míří k protější straně hřiště. Rozběh jako vždy, ale úder musí jít jinam. Namísto přímého úderu otočíš ramena a udřeš do míče pod jiným úhlem. Míč trefit víc z boku těla a úder vést diagonálně přes tělo. Ruka má jít přes míč od jedné strany k druhé, ne přímo dolů. Klíčové je skrýt záměr co nejdéle - soupeř nesmí poznat, kam míří, dokud neudeříš. Nadhazovač ti musí míč nahodit takhle, aby sis mohl udělat ten úhel.'
  },
  4: {
    title: 'Tupá rána kamkoliv',
    comment: 'Tupá rána je plochý úder, kdy míč letí nízko a rychle. Není to o výskoku, ale o síle a přesnosti. Rozběh je kratší, občas stačí jen jeden dva kroky. Míč nesmíš trefit shora jako při smeči, ale spíš z boku nebo zespoda. Dlaň máš napnutou, prsty u sebe a udřeš do míče plnou dlaní, ne přehnutým zápěstím. Úder musí být tvrdý a míč má letět nízko. Čím je míč níž, tím těžší je ho obránit. Můžeš mířit kamkoliv - doprostřed, do áčka, béčka, klidně na hráče, pokud je to takticky správně. Potřebuješ být ve správné pozici a mít dobrý timing.'
  },
  5: {
    title: 'Klepák',
    comment: 'Klepák je technický úder, kde míč "klepneš" přes síť blízko u ní. Není to o síle, ale o technice. Míč má jít jen tak tak přes síť. Potřebuješ být hodně blízko sítě, ideálně jeden krok. Rozběh je minimální. Míč trefit shora, ale jemně, zápěstím ho jen lehce směřuješ dolů. Je to jako když klepneš na dveře. Ruka má jít jen kousek nahoru a rázem dolů. Soupeř na to často nestihne zareagovat, protože to přijde rychle a blízko. Klíčové je nenabrat moc síly, jinak míč přeletí nebo ho rozbiješ do autu.'
  },
  6: {
    title: 'Pata',
    comment: 'Pata je jeden z nejtěžších úderů. Míč trefit patou nohy, což vyžaduje maximální flexibilitu a perfektní timing. Musíš umět odhadnout, kde míč přistane a v tom místě ho kopnout patou dozadu nebo na stranu. Noha má jít nahoru a dozadu, patou trefit střed míče. Většinou potřebuješ být v předklonu nebo dokonce v podřepu. Míč můžeš trefit patou různě - dolů, do stran, někdy i dozadu přes sebe, záleží na situaci. Důležité je mít míč na správné výšce - ne moc vysoko, ne moc nízko. Tohle je hodně o citu a hodně tréninku.'
  },
  7: {
    title: 'Kraťas pod sebe',
    comment: 'Kraťas pod sebe je krátký, jemný úder těsně před soupeře. Není to o síle, ale o překvapení. Soupeř očekává tvrdý úder, a ty místo toho jen "šimrneš" míč jemně přes síť. Míč má dopadnout tak blízko za sítí, aby na něj soupeř nestačil. Klíčové je neukázat, co chceš udělat. Pohyb má vypadat jako normální smeč, ale v poslední chvíli jen lehce míč dotkneš a pošleš ho krátce. Zápěstí ohneš hodně a míč jen lehce "posuneš" dopředu, ne švihneš. Je důležité nebýt moc daleko od sítě, jinak míč nedoleží. Tohle je úder na překvapení, nepoužívej ho moc často, jinak na tebe soupeř počká.'
  },
  8: {
    title: 'Kraťas za blok',
    comment: 'Kraťas za blok je rafinovaný úder, kterým míč pošleš za soupeřova blokové hráče. Zatímco blokař je připravený na sílu, ty míč šikovně umístíš za něj. Tohle vyžaduje perfektní načasování. Soupeř musí vyskočit na blok, ty pak trefit míč jemně a vést ho za něj. Úhel je klíčový - míč nesmí jít přímo, ale diagonálně za blokaře. Ruka má jít lehce do strany, míč trefit spíš z boku. Některý kraťasy jdou víc do šířky, jiné víc do hloubky, záleží na pozici blokaře. Důležité je maskování - pohyb má vypadat jak na normální smeč, změnu uděláš až na poslední chvíli.'
  },
  9: {
    title: 'Šlapaný kraťas',
    comment: 'Šlapaný kraťas je speciální varianta kraťasu, kde před úderem uděláš "šlápnutí" - rychlý pohyb nohou, kterým matouš soupeře. Při rozběhu na poslední krok přidáš extra "dupnutí", které vypadá, že půjdeš do velkého výskoku, ale místo toho trefit míč jemně a krátce. Je to o klamání. Soupeř vidí tvůj velký pohyb a připraví se na tvrdý úder, ale ty dáš kraťas. Šlápnutí má být zřetelné, ale ne moc drahé, jinak ztratíš rovnováhu. Hned po šlápnutí lehce trefit míč, ideálně krátce za síť nebo do strany. Tento úder je nejlepší, když už jsi několikrát předtím smečoval tvrdě, takže soupeř očekává další tvrdý úder.'
  },
  10: {
    title: 'Skákaná smeč',
    comment: 'Skákaná smeč je dynamický úder, kde přidáš extra výskok pro větší sílu. Rozběh je delší a rychlejší než u normální smeče. Poslední krok má být silný a vést k výraznému odrazu. V tu chvíli vyskočíš co nejvýš a udřeš do míče v nejvyšším bodě skoku. Celé tělo má jít do úderu - nejdřív ramena, pak paže, pak zápěstí. Míč trefit tak vysoko, jak jen můžeš, ideálně nad hlavou nebo lehce před ní. Čím výš jsi při úderu, tím lepší úhel máš a tím těžší je tě zablokovat. Po úderu se připrav na dopad, nohy mírně pokrčené. Skákaná smeč je náročná na kondici, ale má největší sílu.'
  },
  11: {
    title: 'Smečovaný servis',
    comment: 'Smečovaný servis je agresivní podání, které má za cíl získat bod přímo nebo značně ztížit soupeři příjem. Míč vyhazuješ výš než při normálním servisu, ideálně 2-3 metry nad sebou. Rozběh je krátký, ale rychlý, podobný jako u smeče. Míč trefit ve výskoku, co nejvýš a co nejsilněji. Úder má být plochý, jako u tupé rány, míč má letět nízko a rychle. Cíl je dostat míč přes síť tak rychle, že soupeř nestihne správně zareagovat. Ale pozor, smečovaný servis je riskantní - pokud chybíš, dáváš soupeři bod zadarmo. Takže trénink je klíčový. Navíc se můžeš snadno unavit, pokud podáváš takhle často.'
  },
  12: {
    title: 'Blok',
    comment: 'Blok je základní obranná technika proti smeči soupeře. Vyskočíš co nejvýš a ruce natáhneš nad síť, snažíš se zastavit míč dřív, než přeletí. Klíčové je timing - musíš vyskočit ve správnou chvíli, ne moc brzy, ne moc pozdě. Dívej se na smečaře, sleduj jeho pohyb a pozici míče. Ruce drž nahoře, prsty roztažené, dlaně směřuji k soupeři. Jakmile soupeř udeří, snaž se míč trefit dlaněmi a odrazit zpět. Nesmíš se dotknout sítě, to je faul. Po dopadu buď připravený na protiútok, míč může odskočit kamkoliv. Dobrej blok dokáže změnit celej zápas.'
  },
  13: {
    title: 'Skluz',
    comment: 'Skluz je obranná technika na vzdálené míče. Když míč letí daleko od tebe, neběž k němu, ale "sklouzni" - udělej dlouhý krok nebo skok tím směrem a dovol tělu sklouzit po zemi. Klíčové je načasování a odvaha. Vidíš míč letící do strany nebo daleko, uděláš razantní krok nebo skok tím směrem a nohu necháš sklouznout. V tu chvíli druhá noha ti drží rovnováhu a ruce jdou k míči. Míč trefit v nejnižším bodě, ideálně předloktím nebo dlaní zespoda, a nasměrovat ho nahoru. Po sklizu se rychle postav, hra pokračuje. Skluz vyžaduje odvahu, protože padáš na zem. Ale často je to jediná šance míč zachránit. Pozor na kolena a lokty, můžou se odřít.'
  },
  14: {
    title: 'Slabší noha',
    comment: 'Slabší noha je defenzivní technika, kde použiješ svou nedominantní nohu k příjmu míče. Pro většinu hráčů je to levá noha. Klíčem je flexibilita a schopnost rychle reagovat. Když míč letí na tvou slabší stranu, natočíš se a trefit ho slabší nohou. Noha má jít směrem k míči, ne příliš tvrde, spíš ho přesměruješ. Koleno mírně pokrčené, šlapka natočená tím směrem, kam chceš míč poslat. Úder má být kontrolovaný, ne divoký. Míč ideálně nasměruješ nahoru do středu nebo k partnerovi. Slabší noha je něco, co vyžaduje hodiny a hodiny tréninku, protože cit pro tu nohu prostě není přirozený. Ale když se to naučíš, staneš se mnohem komplexnějším hráčem.'
  },
  15: {
    title: 'Nesmysl',
    comment: 'Nesmysl je... no, nesmysl. Je to cokoliv, co normálně nedělá smysl, ale funguje to. Může to být cokoliv od divokých triků přes nečekané úhly až po psychologické hry. Cílem je překvapit soupeře něčím, co vůbec nečeká. Třeba úder hlavou, skok přes soupeře, finty, grimasy, všechno jde. Ale pozor, nesmysl je vysoké riziko, vysoká odměna. Pokud to vyjde, vypadáš jako génius. Pokud ne, vypadáš jako blázen. Klíčem je načasování a situace. Některé nesmysly fungují jen tehdy, když je soupeř unavený nebo rozrušený. Jiné fungují, když to nikdo nečeká. Nesmysl je o kreativitě, odvaze a troše šílenství. Právě to dělá nohejbal zábavným.'
  },
  16: {
    title: 'Hruď',
    comment: 'Hruď je obranná technika, kde přijímáš míč hrudí. Zní to šíleně, ale funguje to. Když míč letí přímo na tebe a nemáš čas na ruce ani nohy, použij hruď. Klíčem je postavení - hruď dopředu, ramena dozadu, tělo v mírném předklonu. Hruď má být našponovaná, ne měkká. Míč má narazit do středu hrudníku a odrazit se nahoru nebo dopředu. Ruce drž stranou nebo dozadu, aby ses nedotkl míče rukama omylem. Je to bolestivé, zvlášť pokud je míč rychlý, ale funguje to. Hruď je často poslední možnost obrany, když nic jiného nejde. Po příjmu se rychle přesměruj na další hru. Pozor na dýchání, úder do hrudníku může na chvíli vyrazit dech.'
  },
  17: {
    title: 'Silnější noha',
    comment: 'Silnější noha je to, co používáš nejčastěji - pro většinu hráčů pravá noha. Je to tvoje dominantní končetina, kterou máš nejlepší kontrolu a sílu. Klíčem je trénink a opakování, abys s tou nohou uměl všechno. Příjmy, přihrávky, střely, všechno. Úder má být kontrolovaný a přesný. Koleno lehce pokrčené, šlapka natočená směrem k cíli, noha má jít k míči přirozeným pohybem. Po úderu nechej nohu "doběhnout" v tom směru, kam jsi míč poslal, to pomáhá s přesností. Silnější noha je tvůj hlavní nástroj. Neznamená to, že bys měl ignorovat slabší nohu, ale silnější noha ti zachrání víc situací. Čím víc trénuješ, tím lepší kontrolu máš.'
  },
  19: {
    title: 'Vytlučený blok',
    comment: 'Vytlučený blok je speciální technika, kde neskáčeš přímo před smečaře, ale snažíš se míč "vytlučit" do autu. Místo zastavení míče ho chceš odrazit tak, aby vyletěl pryč z hřiště. Ruce natáhneš ne přímo před sebe, ale lehce do strany nebo nahoru, abys míč odrazil šikmo ven. Je to riskantní, protože pokud to uděláš špatně, míč odskočí do tvé strany hřiště. Klíčem je úhel rukou. Dlaně natočíš tak, aby míč odrazily ven, ne přímo zpátky. Vytlučený blok funguje nejlépe, když smečař míří blízko od tebe nebo když jsi v rohu hřiště. V tu chvíli je větší šance, že míč po odrazu vyletí ven. Ale buď opatrný, tohle vyžaduje perfektní timing a pozici.'
  }
}
