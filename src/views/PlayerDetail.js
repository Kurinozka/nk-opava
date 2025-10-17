import { players, skills, skillDetails } from '../playerData.js'
import { getTeamWithStats as getExtraligaTeam, extraligaTeams } from '../extraligaTeams.js'
import { getTeamWithStats as getLeagueTeam, leagueTeams } from '../leagueTeams.js'
import { skillAnimations as globalSkillAnimations } from '../skillAnimations.js'
import { schoolVideos } from '../data/schoolVideos.js'
import { bokischSmecAnimation } from '../animations/bokisch-smec.js'
import { cela_10_blok_animation } from '../animations/cela-10-blok.js'
import { cela_10_hrud_animation } from '../animations/cela-10-hrud.js'
import { cela_10_kratas_pod_sebe_animation } from '../animations/cela-10-kratas-pod-sebe.js'
import { cela_1_blok_animation } from '../animations/cela-1-blok.js'
import { cela_1_smec_stred_animation } from '../animations/cela-1-smec-stred.js'
import { cela_1_smecovany_servis_animation } from '../animations/cela-1-smecovany-servis.js'
import { cela_2_pata_animation } from '../animations/cela-2-pata.js'
import { cela_2_tupa_rana_animation } from '../animations/cela-2-tupa-rana.js'
import { cela_3_blok_animation } from '../animations/cela-3-blok.js'
import { cela_3_dat_neco_do_piti_sobe_i_blokari_animation } from '../animations/cela-3-dat-neco-do-piti-sobe-i-blokari.js'
import { cela_3_smec_acko_animation } from '../animations/cela-3-smec-acko.js'
import { cela_3_tupa_rana_animation } from '../animations/cela-3-tupa-rana.js'
import { cela_4_skakana_smec_animation } from '../animations/cela-4-skakana-smec.js'
import { cela_5_slabsi_noha_animation } from '../animations/cela-5-slabsi-noha.js'
import { cela_5_smecovany_servis_animation } from '../animations/cela-5-smecovany-servis.js'
import { kvar_1_blok_animation } from '../animations/kvar-1-blok.js'
import { kvar_1_hrud_animation } from '../animations/kvar-1-hrud.js'
import { kvar_1_pata_animation } from '../animations/kvar-1-pata.js'
import { kvar_1_tupa_rana_animation } from '../animations/kvar-1-tupa-rana.js'
import { kvar_3_hrud_animation } from '../animations/kvar-3-hrud.js'
import { kvar_3_smec_becko_animation } from '../animations/kvar-3-smec-becko.js'
import { kvar_3_smec_becko_uspesna_animation } from '../animations/kvar-3-smec-becko-uspesna.js'
import { kvar_3_smec_becko_neuspesna_animation } from '../animations/kvar-3-smec-becko-neuspesna.js'
import { kvar_3_smecovany_servis_animation } from '../animations/kvar-3-smecovany-servis.js'
import { kvar_3_tupa_rana_animation } from '../animations/kvar-3-tupa-rana.js'
import { kvar_4_blok_animation } from '../animations/kvar-4-blok.js'
import { kvar_4_smec_stred_animation } from '../animations/kvar-4-smec-stred.js'
import { kvar_5_slabsi_noha_animation } from '../animations/kvar-5-slabsi-noha.js'
import { kvar_6_hrud_animation } from '../animations/kvar-6-hrud.js'
import { kvar_7_kratas_za_blok_animation } from '../animations/kvar-7-kratas-za-blok.js'
import { kvar_7_skakana_smec_animation } from '../animations/kvar-7-skakana-smec.js'
import { kvar_7_slabsi_noha_animation } from '../animations/kvar-7-slabsi-noha.js'
import { kvar_7_smec_stred_animation } from '../animations/kvar-7-smec-stred.js'
import { kvar_7_smecovany_servis_animation } from '../animations/kvar-7-smecovany-servis.js'
import { kvar_8_blok_animation } from '../animations/kvar-8-blok.js'
import { kvar_8_silnejsi_noha_animation } from '../animations/kvar-8-silnejsi-noha.js'
import { kvar_8_smec_becko_animation } from '../animations/kvar-8-smec-becko.js'
import { kvar_8_smec_pata_animation } from '../animations/kvar-8-smec-pata.js'
import { kvar_9_blok_animation } from '../animations/kvar-9-blok.js'
import { modr_10_kratas_za_blok_animation } from '../animations/modr-10-kratas-za-blok.js'
import { modr_10_smecovany_servis_animation } from '../animations/modr-10-smecovany-servis.js'
import { modr_1_hrud_animation } from '../animations/modr-1-hrud.js'
import { modr_1_kratas_pod_sebe_animation } from '../animations/modr-1-kratas-pod-sebe.js'
import { modr_1_kratas_pod_sebe_uspesny_animation } from '../animations/modr-1-kratas-pod-sebe-uspesny.js'
import { modr_1_kratas_pod_sebe_neuspesny_animation } from '../animations/modr-1-kratas-pod-sebe-neuspesny.js'
import { modr_1_smecovany_servis_animation } from '../animations/modr-1-smecovany-servis.js'
import { modr_2_kratas_za_blok_animation } from '../animations/modr-2-kratas-za-blok.js'
import { modr_3_blok_animation } from '../animations/modr-3-blok.js'
import { modr_3_smec_becko_animation } from '../animations/modr-3-smec-becko.js'
import { modr_4_silnejsi_noha_animation } from '../animations/modr-4-silnejsi-noha.js'
import { modr_5_nenapadna_vymena_balonu_za_prefoukany_animation } from '../animations/modr-5-nenapadna-vymena-balonu-za-prefoukany.js'
import { modr_5_smec_stred_animation } from '../animations/modr-5-smec-stred.js'
import { modr_6_lehke_povoleni_saka_animation } from '../animations/modr-6-lehke-povoleni-saka.js'
import { modr_9_blok_animation } from '../animations/modr-9-blok.js'
import { modr_9_bozi_ruka_animation } from '../animations/modr-9-bozi-ruka.js'
import { modr_9_hrud_animation } from '../animations/modr-9-hrud.js'
import { modr_9_skakana_smec_animation } from '../animations/modr-9-skakana-smec.js'
import { modr_9_smec_stred_animation } from '../animations/modr-9-smec-stred.js'
import { rado_11_blok_animation } from '../animations/rado-11-blok.js'
import { rado_11_silnejsi_noha_animation } from '../animations/rado-11-silnejsi-noha.js'
import { rado_13_tupa_rana_animation } from '../animations/rado-13-tupa-rana.js'
import { rado_14_hrud_animation } from '../animations/rado-14-hrud.js'
import { rado_15_kratas_pod_sebe_animation } from '../animations/rado-15-kratas-pod-sebe.js'
import { rado_16_smecovany_servis_animation } from '../animations/rado-16-smecovany-servis.js'
import { rado_17_blok_animation } from '../animations/rado-17-blok.js'
import { rado_1_skakana_smec_animation } from '../animations/rado-1-skakana-smec.js'
import { rado_1_slapany_kratas_animation } from '../animations/rado-1-slapany-kratas.js'
import { rado_1_tupa_rana_animation } from '../animations/rado-1-tupa-rana.js'
import { rado_2_blok_animation } from '../animations/rado-2-blok.js'
import { rado_3_kratas_pod_sebe_animation } from '../animations/rado-3-kratas-pod-sebe.js'
import { rado_3_smec_pata_animation } from '../animations/rado-3-smec-pata.js'
import { rado_3_smec_stred_animation } from '../animations/rado-3-smec-stred.js'
import { rado_3_tupa_rana_animation } from '../animations/rado-3-tupa-rana.js'
import { rado_9_hrud_animation } from '../animations/rado-9-hrud.js'
import { rado_9_klepak_animation } from '../animations/rado-9-klepak.js'
import { vset_1_blok_animation } from '../animations/vset-1-blok.js'
import { vset_1_bodlo_do_kouli_animation } from '../animations/vset-1-bodlo-do-kouli.js'
import { vset_2_blok_animation } from '../animations/vset-2-blok.js'
import { vset_2_hrud_animation } from '../animations/vset-2-hrud.js'
import { vset_2_kratas_za_blok_animation } from '../animations/vset-2-kratas-za-blok.js'
import { vset_2_silnejsi_noha_animation } from '../animations/vset-2-silnejsi-noha.js'
import { vset_4_klepak_animation } from '../animations/vset-4-klepak.js'
import { vset_4_silnejsi_noha_animation } from '../animations/vset-4-silnejsi-noha.js'
import { vset_5_smecovany_servis_animation } from '../animations/vset-5-smecovany-servis.js'
import { vset_9_staredown_animation } from '../animations/vset-9-staredown.js'
import { vset_9_tupa_rana_animation } from '../animations/vset-9-tupa-rana.js'
import { kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation } from '../animations/kurka-shaolin.js'
import { majstinikNonsenseAnimation } from '../animations/majstinik-pozdrav.js'
import { kuceraNohaAnimation } from '../animations/kucera-silnejsi-noha.js'
import { soucekHrudAnimation } from '../animations/soucek-hrud.js'
import { soucekSmecBeckoAnimation } from '../animations/soucek-smec-becko.js'
import { kalousSmecBeckoAnimation } from '../animations/kalous-smec-becko.js'
import { chadimSlabsiNohaAnimation } from '../animations/chadim-slabsi-noha.js'
import { chadimKratasAnimation } from '../animations/chadim-kratas.js'
import { chadimTSmecStredAnimation } from '../animations/chadim-t-smec-stred.js'
import { vankeBlokAnimation } from '../animations/vanke-blok.js'
import { vankeHrudAnimation } from '../animations/vanke-hrud.js'
import { vankePataAnimation } from '../animations/vanke-pata.js'
import { vankeTupaRanaAnimation } from '../animations/vanke-tupa-rana.js'
import { gregorKratasZaBlokAnimation } from '../animations/gregor-kratas-za-blok.js'
import { gregorLevaNohaAnimation } from '../animations/gregor-leva-noha.js'
import { gregorSkakanaSmecAnimation } from '../animations/gregor-skakana-smec.js'
import { gregorSmecStredAnimation } from '../animations/gregor-smec-stred.js'
import { jKalousSmecovanyServisAnimation } from '../animations/j-kalous-smecovany-servis.js'
import { chalupaHrudAnimation } from '../animations/chalupa-hrud.js'
import { chalupaKratasZaBlokAnimation } from '../animations/chalupa-kratas-za-blok.js'
import { chalupaSilnejsiNohaFailAnimation } from '../animations/chalupa-silnejsi-noha-fail.js'
import { chalupaVytlucenyBlokAnimation } from '../animations/chalupa-vytluceny-blok.js'
import { zbranekVytlucenyBlokAnimation } from '../animations/zbranek-vytluceny-blok.js'
import { zbranekBodloDoKouliAnimation } from '../animations/zbranek-bodlo-do-kouli.js'
import { zbranekBlokAnimation } from '../animations/zbranek-blok.js'
import { danBilySmecovanyServisAnimation } from '../animations/dan-bily-smecovany-servis.js'
import { dvorakSilnejsiNohaAnimation } from '../animations/dvorak-silnejsi-noha.js'
import { dvorakKlepakAnimation } from '../animations/dvorak-klepak.js'
import { staricnyNesmyslSuccessAnimation } from '../animations/staricny-nesmysl-success.js'
import { staricnyNesmyslFailAnimation } from '../animations/staricny-nesmysl-fail.js'
import { staricnyTupaRanaAnimation } from '../animations/staricny-tupa-rana.js'
import { tomekTupaRanaAnimation } from '../animations/tomek-tupa-rana.js'
import { andrisPataAnimation } from '../animations/andris-pata.js'
import { andrisTupaRanaAnimation } from '../animations/andris-tupa-rana.js'
import { holasSlabsiNohaAnimation } from '../animations/holas-slabsi-noha.js'
import { holasSmecovanyServisAnimation } from '../animations/holas-smecovany-servis.js'
import { maturaSkakanaSmecAnimation } from '../animations/matura-skakana-smec.js'
import { nesladekBlokAnimation } from '../animations/nesladek-blok.js'
import { nesladekSmecAckoAnimation } from '../animations/nesladek-smec-acko.js'
import { nesladekTupaRanaAnimation } from '../animations/nesladek-tupa-rana.js'
import { nesladekNesmyslAnimation } from '../animations/nesladek-nesmysl.js'
import { vojtisekHlavaAnimation } from '../animations/vojtisek-hlava.js'
import { vojtisekBlokAnimation } from '../animations/vojtisek-blok.js'
import { vojtisekVytlucenyBlokFailAnimation } from '../animations/vojtisek-vytluceny-blok-fail.js'
import { vojtisekKratasPodSebeAnimation } from '../animations/vojtisek-kratas-pod-sebe.js'
import { sysSmecovanyServisAnimation } from '../animations/sys-smecovany-servis.js'
import { juzekHlavickaAnimation } from '../animations/juzek-hlavicka.js'
import { muzikVytlucenyBlokAnimation } from '../animations/muzik-vytluceny-blok.js'
import { sehrigVytlucenyBlokFailAnimation } from '../animations/sehrig-vytluceny-blok-fail.js'
import { sehrigPravaNohaAnimation } from '../animations/sehrig-prava-noha.js'
import { trucSmecStredAnimation } from '../animations/truc-smec-stred.js'
import { trucSmecPataAnimation } from '../animations/truc-smec-pata.js'
import { trucKratasPodSebeAnimation } from '../animations/truc-kratas-pod-sebe.js'
import { trucSmecPodSebeAnimation } from '../animations/truc-smec-pod-sebe.js'
import { trucTupaRanaAnimation } from '../animations/truc-tupa-rana.js'
import { ungermannKratasPodSebeAnimation } from '../animations/ungermann-kratas-pod-sebe.js'
import { oVitTupaRanaAnimation } from '../animations/o-vit-tupa-rana.js'
import { oVitSkakanaSmecFailAnimation } from '../animations/o-vit-skakana-smec-fail.js'
import { oVitSlapanyKratasFailAnimation } from '../animations/o-vit-slapany-kratas-fail.js'
import { pVitVytlucenyBlokFailAnimation } from '../animations/p-vit-vytluceny-blok-fail.js'
import { vKalousSmecStredAnimation } from '../animations/v-kalous-smec-stred.js'
import { vKalousSmecovanyServisAnimation } from '../animations/v-kalous-smecovany-servis.js'
import { vKalousVytlucenyBlokAnimation } from '../animations/v-kalous-vytluceny-blok.js'
import { getTeamColors } from '../teamColors.js'

// Funkce pro nalezení hráče napříč všemi týmy
function findPlayerById(playerId) {
  // Nejprve hledat v hráčích NK Opavy
  let player = players.find(p => p.id == playerId)
  if (player) return { player, teamId: 'OPAVA', isExtraliga: false }

  // Hledat v extraligových týmech
  for (const teamData of extraligaTeams) {
    const team = getExtraligaTeam(teamData.id)
    if (team) {
      player = team.players.find(p => p.id == playerId)
      if (player) return { player, teamId: team.id, teamName: team.name, isExtraliga: true }
    }
  }

  // Hledat v týmech 1. ligy
  for (const teamData of leagueTeams) {
    const team = getLeagueTeam(teamData.id)
    if (team) {
      player = team.players.find(p => p.id == playerId)
      if (player) return { player, teamId: team.id, teamName: team.name, isExtraliga: false }
    }
  }

  return null
}

// Mapa animací specifických pro jednotlivé hráče a jejich dovednosti
const playerSkillAnimations = {
  'CELA_1': {
    1: cela_1_smec_stred_animation,
    12: cela_1_blok_animation,
    13: cela_1_smecovany_servis_animation,
    11: andrisPataAnimation,
    4: andrisTupaRanaAnimation
  },
  'CELA_10': {
    7: cela_10_kratas_pod_sebe_animation,
    12: cela_10_blok_animation,
    16: cela_10_hrud_animation,
  },
  'CELA_2': {
    4: cela_2_tupa_rana_animation,
    11: cela_2_pata_animation,
  },
  'CELA_3': {
    2: cela_3_smec_acko_animation,
    4: cela_3_tupa_rana_animation,
    12: cela_3_blok_animation,
    15: cela_3_dat_neco_do_piti_sobe_i_blokari_animation,
    14: holasSlabsiNohaAnimation,
    11: [holasSmecovanyServisAnimation, holasSmecovanyServisAnimation]
  },
  'CELA_4': {
    6: cela_4_skakana_smec_animation,
  },
  'CELA_5': {
    13: cela_5_smecovany_servis_animation,
    14: cela_5_slabsi_noha_animation,
    6: maturaSkakanaSmecAnimation
  },
  'KVAR_1': {
    4: kvar_1_tupa_rana_animation,
    11: kvar_1_pata_animation,
    12: kvar_1_blok_animation,
    16: kvar_1_hrud_animation,
  },
  'KVAR_3': {
    3: [kvar_3_smec_becko_uspesna_animation, kvar_3_smec_becko_neuspesna_animation],
    4: [kvar_3_tupa_rana_animation, kvar_3_tupa_rana_animation],
    11: kvar_3_smecovany_servis_animation,
    16: kvar_3_hrud_animation,
  },
  'KVAR_4': {
    1: kvar_4_smec_stred_animation,
    12: kvar_4_blok_animation,
  },
  'KVAR_5': {
    14: kvar_5_slabsi_noha_animation,
  },
  'KVAR_6': {
    16: kvar_6_hrud_animation,
  },
  'KVAR_7': {
    1: kvar_7_smec_stred_animation,
    10: kvar_7_skakana_smec_animation,
    8: kvar_7_kratas_za_blok_animation,
    11: kvar_7_smecovany_servis_animation,
    14: kvar_7_slabsi_noha_animation,
  },
  'KVAR_8': {
    3: kvar_8_smec_becko_animation,
    9: kvar_8_smec_pata_animation,
    12: kvar_8_blok_animation,
    17: kvar_8_silnejsi_noha_animation,
  },
  'KVAR_9': {
    12: kvar_9_blok_animation,
  },
  'MODR_1': {
    7: [modr_1_kratas_pod_sebe_uspesny_animation, modr_1_kratas_pod_sebe_neuspesny_animation],
    11: [modr_1_smecovany_servis_animation, modr_1_smecovany_servis_animation],
    16: modr_1_hrud_animation,
  },
  'MODR_10': {
    8: modr_10_kratas_za_blok_animation,
    11: modr_10_smecovany_servis_animation,
  },
  'MODR_2': {
    8: modr_2_kratas_za_blok_animation,
  },
  'MODR_3': {
    3: modr_3_smec_becko_animation,
    12: modr_3_blok_animation,
  },
  'MODR_4': {
    17: modr_4_silnejsi_noha_animation,
  },
  'MODR_5': {
    1: modr_5_smec_stred_animation,
    15: modr_5_nenapadna_vymena_balonu_za_prefoukany_animation,
  },
  'MODR_6': {
    15: modr_6_lehke_povoleni_saka_animation,
  },
  'MODR_9': {
    1: modr_9_smec_stred_animation,
    6: modr_9_skakana_smec_animation,
    12: modr_9_blok_animation,
    15: modr_9_bozi_ruka_animation,
    16: modr_9_hrud_animation,
  },
  'RADO_1': {
    4: rado_1_tupa_rana_animation,
    5: rado_1_slapany_kratas_animation,
    6: rado_1_skakana_smec_animation,
  },
  'RADO_11': {
    12: rado_11_blok_animation,
    17: rado_11_silnejsi_noha_animation,
  },
  'RADO_13': {
    4: rado_13_tupa_rana_animation,
  },
  'RADO_14': {
    16: rado_14_hrud_animation,
  },
  'RADO_15': {
    7: rado_15_kratas_pod_sebe_animation,
  },
  'RADO_16': {
    11: rado_16_smecovany_servis_animation,
  },
  'RADO_17': {
    12: rado_17_blok_animation,
  },
  'RADO_2': {
    12: rado_2_blok_animation,
  },
  'RADO_3': {
    1: rado_3_smec_stred_animation,
    4: rado_3_tupa_rana_animation,
    7: rado_3_kratas_pod_sebe_animation,
    6: rado_3_smec_pata_animation,
  },
  'RADO_9': {
    5: rado_9_klepak_animation,
    16: rado_9_hrud_animation,
  },
  'VSET_1': {
    12: vset_1_blok_animation,
    15: vset_1_bodlo_do_kouli_animation,
  },
  'VSET_2': {
    8: vset_2_kratas_za_blok_animation,
    12: vset_2_blok_animation,
    16: vset_2_hrud_animation,
    17: vset_2_silnejsi_noha_animation,
  },
  'VSET_3': {
    16: chalupaHrudAnimation,
    8: chalupaKratasZaBlokAnimation,
    17: [null, chalupaSilnejsiNohaFailAnimation],
    19: chalupaVytlucenyBlokAnimation,
  },
  'VSET_4': {
    5: vset_4_klepak_animation,
    17: vset_4_silnejsi_noha_animation,
  },
  'VSET_5': {
    19: zbranekVytlucenyBlokAnimation,
    15: zbranekBodloDoKouliAnimation,
    12: zbranekBlokAnimation,
  },
  'VSET_6': {
    11: danBilySmecovanyServisAnimation,
  },
  'VSET_8': {
    17: dvorakSilnejsiNohaAnimation,
    5: dvorakKlepakAnimation,
  },
  'VSET_9': {
    4: vset_9_tupa_rana_animation,
    15: vset_9_staredown_animation,
  },
  'VSET_13': {
    15: [staricnyNesmyslSuccessAnimation, staricnyNesmyslFailAnimation],
    4: staricnyTupaRanaAnimation,
  },
  'VSET_14': {
    4: tomekTupaRanaAnimation,
  },
  1: {
    3: bokischSmecAnimation,
    5: bokischSmecAnimation,
  },
  4: {
    15: [kurkaNonsenseSuccessAnimation, kurkaNonsenseFailAnimation]
  },
  7: {
    15: majstinikNonsenseAnimation
  },
  'CAKO_1': {
    14: chadimSlabsiNohaAnimation,
    7: chadimKratasAnimation
  },
  'CAKO_2': {
    1: chadimTSmecStredAnimation
  },
  'CAKO_3': {
    3: kalousSmecBeckoAnimation
  },
  'CAKO_4': {
    11: jKalousSmecovanyServisAnimation
  },
  'CAKO_6': {
    16: soucekHrudAnimation,
    3: soucekSmecBeckoAnimation
  },
  'CAKO_7': {
    17: kuceraNohaAnimation
  },
  'CELA_6': {
    12: nesladekBlokAnimation,
    2: [nesladekSmecAckoAnimation, nesladekSmecAckoAnimation],
    4: [nesladekTupaRanaAnimation, nesladekTupaRanaAnimation],
    15: nesladekNesmyslAnimation
  },
  'CELA_8': {
    18: vojtisekHlavaAnimation,
    12: vojtisekBlokAnimation,
    19: [null, vojtisekVytlucenyBlokFailAnimation],
    7: vojtisekKratasPodSebeAnimation
  },
  'ZATEC_1': {
    11: [sysSmecovanyServisAnimation, sysSmecovanyServisAnimation]
  },
  'ZATEC_2': {
    18: juzekHlavickaAnimation
  },
  'ZATEC_4': {
    19: muzikVytlucenyBlokAnimation
  },
  'ZATEC_6': {
    19: [null, sehrigVytlucenyBlokFailAnimation],
    17: sehrigPravaNohaAnimation
  },
  'ZATEC_7': {
    1: [trucSmecStredAnimation, trucSmecStredAnimation],
    9: [trucSmecPataAnimation, trucSmecPataAnimation],
    7: [trucKratasPodSebeAnimation, trucKratasPodSebeAnimation],
    10: trucSmecPodSebeAnimation,
    4: [trucTupaRanaAnimation, trucTupaRanaAnimation]
  },
  'ZATEC_9': {
    7: ungermannKratasPodSebeAnimation
  },
  'ZATEC_10': {
    4: [oVitTupaRanaAnimation, oVitTupaRanaAnimation],
    6: [null, oVitSkakanaSmecFailAnimation],
    5: [null, oVitSlapanyKratasFailAnimation]
  },
  'ZATEC_11': {
    19: [null, pVitVytlucenyBlokFailAnimation]
  },
  'CELA_B_3': {
    1: vKalousSmecStredAnimation,
    11: vKalousSmecovanyServisAnimation,
    19: vKalousVytlucenyBlokAnimation
  },
}

// Funkce pro získání animace pro konkrétního hráče a skill
function getPlayerSkillAnimation(playerId, skillId) {
  // NEJDŘÍV zkontrolovat playerSkillAnimations (pro specifické animace)
  if (playerSkillAnimations[playerId] && playerSkillAnimations[playerId][skillId] !== undefined) {
    return playerSkillAnimations[playerId][skillId]
  }

  // PAK zkusit globalSkillAnimations
  if (globalSkillAnimations[skillId]) {
    return globalSkillAnimations[skillId]
  }

  // FALLBACK: Hledat ve schoolVideos databázi
  if (schoolVideos[skillId] && schoolVideos[skillId].videos) {
    const videos = schoolVideos[skillId].videos

    // Najít všechna videa pro daného hráče
    const playerVideos = videos.filter(v => v.playerId === playerId || v.playerId === parseInt(playerId))

    if (playerVideos.length > 0) {
      // Najít úspěšné a neúspěšné video
      const successVideo = playerVideos.find(v => v.success === true)
      const failVideo = playerVideos.find(v => v.success === false)

      // Pokud existují obě verze, vrátit pole [success, fail]
      if (successVideo && failVideo) {
        return [
          `<video src="${successVideo.video}" autoplay muted loop playsinline></video>`,
          `<video src="${failVideo.video}" autoplay muted loop playsinline></video>`
        ]
      }

      // Pokud existuje jen úspěšná, vrátit ji jako HTML
      if (successVideo) {
        return `<video src="${successVideo.video}" autoplay muted loop playsinline></video>`
      }

      // Pokud existuje jen neúspěšná, vrátit ji jako HTML
      if (failVideo) {
        return `<video src="${failVideo.video}" autoplay muted loop playsinline></video>`
      }
    }
  }

  return null
}

// Funkce pro výpočet úspěšnosti dovednosti
function calculateSkillSuccessRate(player, skillId) {
  const skill = skills[skillId]
  if (!skill || !skill.stats) return 100
  if (!player.stats) return 0

  const statValues = skill.stats.map(statName => player.stats[statName] || 0)
  const average = statValues.reduce((sum, val) => sum + val, 0) / statValues.length

  return Math.round(average)
}

// Funkce pro získání tooltip textu pro atribut
function getAttributeTooltip(attributeName, position) {
  const tooltips = {
    rychlost: {
      skills: ['Smeč do áčka', 'Skákaná smeč', 'Blok'],
      positions: {
        'Blokař/Smečař': 'velmi vysoká',
        'Smečař/Blokař': 'velmi vysoká',
        'Polař/Smečař': 'střední',
        'Smečař/Polař': 'střední'
      }
    },
    obratnost: {
      skills: ['Šlapaný kraťas', 'Kraťas pod sebe', 'Klepák', 'Skákaná smeč', 'Pata', 'Bekhend', 'Blok'],
      positions: {
        'Blokař/Smečař': 'vysoká',
        'Smečař/Blokař': 'vysoká',
        'Polař/Smečař': 'vysoká',
        'Smečař/Polař': 'vysoká'
      }
    },
    sila: {
      skills: [],
      positions: {
        'Blokař/Smečař': 'střední',
        'Smečař/Blokař': 'střední'
      }
    },
    svih: {
      skills: ['Smeč do áčka', 'Klepák', 'Skákaná smeč', 'Úder do béčka', 'Forhend'],
      positions: {
        'Blokař/Smečař': 'vysoká',
        'Smečař/Blokař': 'vysoká'
      }
    },
    technika: {
      skills: ['Běžná nahrávka', 'Šlapaný kraťas', 'Kraťas pod sebe', 'Úder do béčka', 'Lob', 'Pata', 'Forhend', 'Bekhend'],
      positions: {
        'Nahravač/Polař': 'velmi vysoká',
        'Polař/Nahravač': 'velmi vysoká',
        'Polař/Smečař': 'vysoká',
        'Smečař/Polař': 'vysoká',
        'Univerzál': 'vysoká'
      }
    },
    obetavost: {
      skills: ['Bojovnost'],
      positions: {}
    },
    psychika: {
      skills: ['Mentální síla'],
      positions: {}
    },
    cteniHry: {
      skills: ['Běžná nahrávka', 'Lob', 'Čtení hry', 'Základní obrana'],
      positions: {
        'Nahravač/Polař': 'velmi vysoká',
        'Polař/Nahravač': 'velmi vysoká',
        'Polař/Smečař': 'vysoká',
        'Smečař/Polař': 'vysoká',
        'Univerzál': 'vysoká'
      }
    },
    odolnost: {
      skills: ['Mentální síla', 'Bojovnost'],
      positions: {}
    }
  }

  const attr = tooltips[attributeName]
  if (!attr) return ''

  // Název atributu s velkým prvním písmenem
  const attrNameFormatted = attributeName.charAt(0).toUpperCase() + attributeName.slice(1)

  let parts = []

  // Přidat název atributu
  parts.push(attrNameFormatted)

  // Přidat dovednosti pokud existují
  if (attr.skills.length > 0) {
    parts.push('\n\nDůležitý pro tyto dovednosti:')
    attr.skills.forEach(skill => {
      parts.push(`• ${skill}`)
    })
  }

  // Přidat informaci o pozici pokud existuje
  if (position && attr.positions[position]) {
    parts.push('\n\nDůležité pro pozice:')
    parts.push(attr.positions[position])
  }

  return parts.join('\n')
}

// Funkce pro generování vysvětlení statistik
function generateStatsExplanation(player, teamId = null) {
  if (!player.seasonStats || player.seasonStats.length === 0) {
    return ''
  }

  // Zjistit nejvyšší ligu (pokud hraje více soutěží, počítá se ta vyšší)
  let highestLeague = '2. liga'
  let baseRating = 75

  for (const season of player.seasonStats) {
    if (season.league.includes('Extraliga')) {
      highestLeague = 'Extraligu'
      baseRating = 85
      break // Extraliga je nejvyšší, nemusíme dále hledat
    } else if (season.league.includes('1. liga') && highestLeague !== 'Extraligu') {
      highestLeague = '1. ligu'
      baseRating = 80
    }
  }

  // Vypočítat váženou úspěšnost za poslední 2 roky (aktuální sezóna má 2x větší váhu)
  let weightedMatches = 0
  let weightedWins = 0

  player.seasonStats.forEach((season, index) => {
    // Aktuální sezóna (index 0) má váhu 2, předchozí mají váhu 1
    const weight = index === 0 ? 2 : 1
    weightedMatches += season.matches * weight
    weightedWins += season.wins * weight
  })

  const overallWinRate = weightedMatches > 0 ? Math.round((weightedWins / weightedMatches) * 100) : 0

  // Celkový počet zápasů za poslední 2 roky
  const totalMatches = player.seasonStats.reduce((sum, s) => sum + s.matches, 0)
  const totalWins = player.seasonStats.reduce((sum, s) => sum + s.wins, 0)

  let explanation = `Hodnocení hráče vychází z jeho účasti a výkonů v soutěžích. `

  explanation += `V aktuální sezóně hraje hráč ${highestLeague}. `

  const leagueName = highestLeague === 'Extraligu' ? 'extraligy' : (highestLeague === '1. ligu' ? 'první ligy' : 'druhé ligy')
  explanation += `Hráči ${leagueName} mají základní hodnocení ${baseRating}. `

  explanation += `Celková úspěšnost hráče za poslední 2 roky činí ${overallWinRate}% (${totalWins}/${totalMatches} zápasů). `

  explanation += `Tato úspěšnost se rovněž odráží v parametrech hráče, s tím, že aktuální sezóna má dvakrát větší váhu než předchozí sezóna. `

  // Jiný text pro hráče Opavy vs ostatní týmy
  if (teamId === 'OPAVA') {
    explanation += `Účast na tréninku může parametry hráče pouze zvýšit, a to maximálně o 5% v případě 100% účasti na tréninku.`
  } else {
    explanation += `Účast na tréninku může parametry hráče jen zvýšit, a to maximálně o 5% v případě 100% účasti. Má to ale jeden háček. Evidujeme pouze účast na trenínku hráčů NK Opava.`
  }

  return explanation
}

export function createPlayerDetailView(playerId) {
  const result = findPlayerById(playerId)

  if (!result) {
    return `
      <div class="player-detail-container">
        <div class="error-message">
          <h2>Hráč nenalezen</h2>
          <button class="back-button" onclick="window.history.back()">← Zpět na tým</button>
        </div>
      </div>
    `
  }

  const { player, teamId, teamName, isExtraliga } = result

  const allSkillIds = Object.keys(skills).map(Number)

  // Pro trenéra
  if (!player.stats && player.coachQuotes) {
    const backButton = teamId === 'OPAVA'
      ? `<button class="back-button" data-nav="team">← Zpět na tým</button>`
      : `<button class="back-button" data-nav-team="${teamId}" data-nav-extraliga="${isExtraliga}">← Zpět na ${teamName || 'tým'}</button>`

    return `
      <div class="player-detail-container" data-current-player-id="${player.id}">
        ${backButton}

        <div class="player-detail-header">
          <div class="player-detail-photo">
            <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23FFD700%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22%23000%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
          </div>
          <div class="player-detail-info">
            <h1>${player.name}</h1>
            <p class="player-detail-position">${player.position} • #${player.number}</p>
          </div>
        </div>

        <div class="coach-quotes-section">
          <h2>🗣️ Trenérovy hlášky</h2>

          <div class="quote-category">
            <h3>📉 Při neúspěšném útoku:</h3>
            <ul>
              ${player.coachQuotes.offensiveFail.map(quote => `<li>"${quote}"</li>`).join('')}
            </ul>
          </div>

          <div class="quote-category">
            <h3>🛡️ Při neúspěšné obraně:</h3>
            <ul>
              ${player.coachQuotes.defensiveFail.map(quote => `<li>"${quote}"</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `
  }

  // Pro hráče
  const avgRating = player.stats ? Math.round(
    (player.stats.rychlost + player.stats.obratnost + player.stats.sila +
     player.stats.svih + player.stats.technika + player.stats.obetavost +
     player.stats.psychika + player.stats.cteniHry + player.stats.odolnost) / 9
  ) : 0

  // Vypočítat celkovou úspěšnost v disciplínách za poslední 2 roky
  const calculateDisciplineStats = () => {
    if (!player.seasonStats || player.seasonStats.length === 0) {
      return { singl: 0, dvojice: 0, trojice: 0 }
    }

    const disciplineData = { singl: { matches: 0, wins: 0 }, dvojice: { matches: 0, wins: 0 }, trojice: { matches: 0, wins: 0 } }

    player.seasonStats.forEach(season => {
      if (season.disciplines) {
        disciplineData.singl.matches += season.disciplines.singl.matches
        disciplineData.singl.wins += season.disciplines.singl.wins
        disciplineData.dvojice.matches += season.disciplines.dvojice.matches
        disciplineData.dvojice.wins += season.disciplines.dvojice.wins
        disciplineData.trojice.matches += season.disciplines.trojice.matches
        disciplineData.trojice.wins += season.disciplines.trojice.wins
      }
    })

    return {
      singl: disciplineData.singl.matches > 0 ? Math.round((disciplineData.singl.wins / disciplineData.singl.matches) * 100) : 0,
      dvojice: disciplineData.dvojice.matches > 0 ? Math.round((disciplineData.dvojice.wins / disciplineData.dvojice.matches) * 100) : 0,
      trojice: disciplineData.trojice.matches > 0 ? Math.round((disciplineData.trojice.wins / disciplineData.trojice.matches) * 100) : 0
    }
  }

  const disciplineStats = calculateDisciplineStats()

  // Přidat playoff statistiky do seasonStats, pokud existují
  if (player.playoff && (!player.seasonStats || !player.seasonStats.some(s => s.season.includes('Play-off')))) {
    if (!player.seasonStats) {
      player.seasonStats = []
    }

    // Přidat playoff jako samostatnou sezónu
    player.seasonStats.unshift({
      season: "2025 Play-off",
      league: isExtraliga ? "Extraliga muži" : "1. liga muži",
      matches: player.playoff.matches,
      wins: player.playoff.wins,
      losses: player.playoff.matches - player.playoff.wins,
      winRate: player.playoff.winRate,
      disciplines: {
        singl: player.playoff.singl || { matches: 0, wins: 0, winRate: 0 },
        dvojice: player.playoff.dvojice || { matches: 0, wins: 0, winRate: 0 },
        trojice: player.playoff.trojice || { matches: 0, wins: 0, winRate: 0 }
      }
    })
  }

  // Vypočítat roční statistiky z seasonStats pokud neexistují
  if (!player.yearlyStats && player.seasonStats && player.seasonStats.length > 0) {
    player.yearlyStats = {}
    player.seasonStats.forEach(season => {
      // Extrahovat rok z názvu sezóny (např. "2024 - základní část" -> "2024")
      const year = season.season.match(/^\d{4}/)?.[0]
      if (year) {
        // Pokud už rok existuje, přičti playoff statistiky k roku
        if (player.yearlyStats[year]) {
          player.yearlyStats[year].matches += season.matches
          player.yearlyStats[year].wins += season.wins
          player.yearlyStats[year].losses += season.losses || (season.matches - season.wins)
          player.yearlyStats[year].winRate = Math.round((player.yearlyStats[year].wins / player.yearlyStats[year].matches) * 100)
        } else {
          player.yearlyStats[year] = {
            matches: season.matches,
            wins: season.wins,
            losses: season.losses || (season.matches - season.wins),
            winRate: season.winRate
          }
        }
      }
    })
  }

  const backButton = teamId === 'OPAVA'
    ? `<button class="back-button" data-nav="team">← Zpět na tým</button>`
    : `<button class="back-button" data-nav-team="${teamId}" data-nav-extraliga="${isExtraliga}">← Zpět na ${teamName || 'tým'}</button>`

  // Získat barvy týmu
  const teamColors = getTeamColors(teamId)

  // Top stats pro kartu
  const topStats = [
    { name: 'RYC', value: player.stats.rychlost },
    { name: 'OBR', value: player.stats.obratnost },
    { name: 'SÍL', value: player.stats.sila },
    { name: 'TEC', value: player.stats.technika },
    { name: 'OBĚ', value: player.stats.obetavost },
    { name: 'PSY', value: player.stats.psychika }
  ]

  return `
    <div class="player-detail-container" data-current-player-id="${player.id}">
      ${backButton}

      <!-- Player Card (hexagon style) -->
      <div style="display: flex; justify-content: center; margin: 2rem 0 3rem 0;">
        <div class="hexagon-card" style="max-width: 320px;">
          <style>
            .hexagon-card-${teamId}::before {
              background: linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.accent} 100%) !important;
            }
            .hexagon-card-${teamId}:hover {
              box-shadow: 0 20px 60px ${teamColors.primary}66, 0 0 0 2px ${teamColors.primary} inset !important;
            }
          </style>
          <div class="hexagon-card-${teamId}" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;"></div>
          <div class="player-image">
            <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22${encodeURIComponent(teamColors.primary)}%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
          </div>
          <div class="card-badge">
            <div class="card-badge-rating">${avgRating}</div>
          </div>
          <div class="player-number">${player.number}</div>
          <div class="player-info">
            <h3 class="player-name">${player.name}</h3>
            <p class="player-position">${player.position}</p>
            <div class="player-stats-mini">
              <div class="stat"><span class="stat-value">${player.stats.rychlost}</span><span class="stat-label">Rychlost</span></div>
              <div class="stat"><span class="stat-value">${player.stats.obratnost}</span><span class="stat-label">Obratnost</span></div>
              <div class="stat"><span class="stat-value">${player.stats.sila}</span><span class="stat-label">Síla</span></div>
              <div class="stat"><span class="stat-value">${player.stats.svih}</span><span class="stat-label">Švih</span></div>
              <div class="stat"><span class="stat-value">${player.stats.technika}</span><span class="stat-label">Technika</span></div>
              <div class="stat"><span class="stat-value">${player.stats.obetavost}</span><span class="stat-label">Obětavost</span></div>
              <div class="stat"><span class="stat-value">${player.stats.psychika}</span><span class="stat-label">Psychika</span></div>
              <div class="stat"><span class="stat-value">${player.stats.cteniHry}</span><span class="stat-label">Čtení hry</span></div>
              <div class="stat"><span class="stat-value">${player.stats.odolnost}</span><span class="stat-label">Odolnost</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="player-detail-header">
        <div class="player-detail-photo">
          <img src="${player.photo}" alt="${player.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22${encodeURIComponent(teamColors.primary)}%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22white%22 font-size=%22120%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${player.number}%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="player-detail-info-wrapper">
          <div class="player-content-grid">
            <div class="player-stats-column">
              <div class="player-header-section">
                <div>
                  <h1>${player.name}</h1>
                  <p class="player-detail-position">${player.position} • #${player.number}</p>
                </div>
                <div class="player-rating-badge player-rating-tooltip" data-tooltip="${player.attributeExplanation || generateStatsExplanation(player, teamId)}">${avgRating}</div>
              </div>

              <div class="player-detail-stats">
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('rychlost', player.position)}">
                <span class="stat-value">${player.stats.rychlost}</span>
                <span class="stat-name">Rychlost</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('obratnost', player.position)}">
                <span class="stat-value">${player.stats.obratnost}</span>
                <span class="stat-name">Obratnost</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('sila', player.position)}">
                <span class="stat-value">${player.stats.sila}</span>
                <span class="stat-name">Síla</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('svih', player.position)}">
                <span class="stat-value">${player.stats.svih}</span>
                <span class="stat-name">Švih</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('technika', player.position)}">
                <span class="stat-value">${player.stats.technika}</span>
                <span class="stat-name">Technika</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('obetavost', player.position)}">
                <span class="stat-value">${player.stats.obetavost}</span>
                <span class="stat-name">Obětavost</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('psychika', player.position)}">
                <span class="stat-value">${player.stats.psychika}</span>
                <span class="stat-name">Psychika</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('cteniHry', player.position)}">
                <span class="stat-value">${player.stats.cteniHry}</span>
                <span class="stat-name">Čtení hry</span>
              </div>
              <div class="stat-item stat-item-tooltip" data-tooltip="${getAttributeTooltip('odolnost', player.position)}">
                <span class="stat-value">${player.stats.odolnost}</span>
                <span class="stat-name">Odolnost</span>
              </div>
            </div>
            </div>

            <div class="player-extra-info">
              ${player.nickname ? `
                <div class="info-item">
                  <span class="info-label">🏷️ Přezdívka:</span>
                  <span class="info-value">${player.nickname}</span>
                </div>
              ` : ''}
              ${player.dominantFoot ? `
                <div class="info-item">
                  <span class="info-label">${player.dominantFoot === 'left' ? '⚽ Dominantní noha:' : '⚽ Dominantní noha:'}</span>
                  <span class="info-value">${player.dominantFoot === 'left' ? 'Levá' : 'Pravá'}</span>
                </div>
              ` : ''}
              ${player.trainingAttendance2025 !== undefined ? `
                <div class="info-item">
                  <span class="info-label">💪 Účast na tréninku (2025):</span>
                  <span class="info-value">${player.trainingAttendance2025}%</span>
                </div>
              ` : ''}
              ${player.seasonStats && player.seasonStats.length > 0 ? `
                <div class="info-item">
                  <span class="info-label">📊 Úspěšnost za poslední 2 roky:</span>
                  <div class="discipline-success-rates">
                    <span class="discipline-stat">👤 S: ${disciplineStats.singl}%</span>
                    <span class="discipline-stat">👥 D: ${disciplineStats.dvojice}%</span>
                    <span class="discipline-stat">👨‍👩‍👦 T: ${disciplineStats.trojice}%</span>
                  </div>
                </div>
              ` : ''}
              ${player.yearlyStats ? `
                <div class="info-item yearly-stats-highlight">
                  <span class="info-label">📅 Roční úspěšnost:</span>
                  <div class="yearly-stats-grid">
                    ${player.yearlyStats['2025'] ? `
                      <div class="year-stat">
                        <span class="year-label">2025</span>
                        <span class="year-value">${player.yearlyStats['2025'].winRate}%</span>
                        <span class="year-matches">(${player.yearlyStats['2025'].wins}/${player.yearlyStats['2025'].matches})</span>
                      </div>
                    ` : ''}
                    ${player.yearlyStats['2024'] ? `
                      <div class="year-stat">
                        <span class="year-label">2024</span>
                        <span class="year-value">${player.yearlyStats['2024'].winRate}%</span>
                        <span class="year-matches">(${player.yearlyStats['2024'].wins}/${player.yearlyStats['2024'].matches})</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
              ${player.simulationStats ? `
                <div class="info-item">
                  <span class="info-label">🎮 Úspěšnost v simulaci:</span>
                  <div class="discipline-success-rates">
                    <span class="discipline-stat">👤 S: ${player.simulationStats.singl.winRate}% (${player.simulationStats.singl.wins}/${player.simulationStats.singl.matches})</span>
                    <span class="discipline-stat">👥 D: ${player.simulationStats.dvojice.winRate}% (${player.simulationStats.dvojice.wins}/${player.simulationStats.dvojice.matches})</span>
                    <span class="discipline-stat">👨‍👩‍👦 T: ${player.simulationStats.trojice.winRate}% (${player.simulationStats.trojice.wins}/${player.simulationStats.trojice.matches})</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      ${player.seasonStats && player.seasonStats.length > 0 ? `
      <section class="player-section">
        <h2>📊 Statistiky sezón</h2>
        ${player.seasonStats.map(stat => `
          <div class="season-stats-block">
            <h3 class="season-title">${stat.season} - ${stat.league}</h3>
            <div class="stats-overview">
              <div class="stat-box total">
                <span class="stat-label">Celkem</span>
                <span class="stat-number">${stat.matches}</span>
                <span class="stat-desc">zápasů</span>
                <span class="stat-winrate">${stat.winRate}%</span>
              </div>
              <div class="stat-box wins">
                <span class="stat-label">Výhry</span>
                <span class="stat-number">${stat.wins}</span>
              </div>
              <div class="stat-box losses">
                <span class="stat-label">Prohry</span>
                <span class="stat-number">${stat.losses}</span>
              </div>
            </div>

            ${stat.disciplines ? `
            <div class="disciplines-stats">
              <h4>Úspěšnost v disciplínách</h4>
              <div class="disciplines-grid">
                <div class="discipline-card">
                  <span class="discipline-name">👤 Jednotlivci (S)</span>
                  <span class="discipline-matches">${stat.disciplines.singl.matches} zápasů</span>
                  <span class="discipline-wins">${stat.disciplines.singl.wins} výher</span>
                  <span class="discipline-winrate">${stat.disciplines.singl.winRate}%</span>
                </div>
                <div class="discipline-card">
                  <span class="discipline-name">👥 Dvojice (D)</span>
                  <span class="discipline-matches">${stat.disciplines.dvojice.matches} zápasů</span>
                  <span class="discipline-wins">${stat.disciplines.dvojice.wins} výher</span>
                  <span class="discipline-winrate">${stat.disciplines.dvojice.winRate}%</span>
                </div>
                <div class="discipline-card">
                  <span class="discipline-name">👨‍👩‍👦 Trojice (T)</span>
                  <span class="discipline-matches">${stat.disciplines.trojice.matches} zápasů</span>
                  <span class="discipline-wins">${stat.disciplines.trojice.wins} výher</span>
                  <span class="discipline-winrate">${stat.disciplines.trojice.winRate}%</span>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      <section class="player-section">
        <div class="section-header-with-link">
          <h2>🎯 Dovednosti v simulaci</h2>
          <button class="simulation-link" data-nav="simulation">→ Zkusit simulaci</button>
        </div>

        <div class="skills-main-tabs">
          <button class="skill-main-tab active" data-main-tab="success">✅ Úspěšné údery</button>
          <button class="skill-main-tab" data-main-tab="fail">❌ Neúspěšné údery</button>
        </div>

        <!-- Úspěšné údery -->
        <div class="skill-main-content active" data-main-content="success">

          <h3 class="skill-category-title">⚔️ Útočné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'offensive' || skills[id].type === 'special').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              let animation = getPlayerSkillAnimation(player.id, skillId)
              // Pokud je animace pole [success, fail], vybrat úspěšnou verzi
              if (Array.isArray(animation)) {
                animation = animation[0]
              }
              return `
                <div class="skill-detail-card offensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${successRate}%</span>
                      <span class="rate-label">úspěšnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-ball-container">
                      <div class="skill-ball offensive">
                        <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
                      </div>
                      <div class="skill-ball-string"></div>
                      <div class="skill-ball-tag offensive">
                        <p class="skill-ball-tag-text">${skillName}</p>
                      </div>
                    </div>
                  `}
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🛡️ Obranné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'defensive').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              let animation = getPlayerSkillAnimation(player.id, skillId)
              // Pokud je animace pole [success, fail], vybrat úspěšnou verzi
              if (Array.isArray(animation)) {
                animation = animation[0]
              }
              return `
                <div class="skill-detail-card defensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${successRate}%</span>
                      <span class="rate-label">úspěšnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-ball-container">
                      <div class="skill-ball defensive">
                        <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
                      </div>
                      <div class="skill-ball-string"></div>
                      <div class="skill-ball-tag defensive">
                        <p class="skill-ball-tag-text">${skillName}</p>
                      </div>
                    </div>
                  `}
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🎲 Nesmyslné dovednosti</h3>
          <div class="skills-grid">
            ${(() => {
              const animation = getPlayerSkillAnimation(player.id, 15)

              // Pokud je animace pole (úspěch + neúspěch), zobraz pouze úspěšnou verzi
              if (Array.isArray(animation)) {
                return `
                  <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15" data-success-type="success">
                    <div class="skill-detail-header">
                      <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                      <div class="skill-rate">
                        <span class="rate-number">10%</span>
                        <span class="rate-label">úspěšnost</span>
                      </div>
                    </div>
                    <div class="animation-box">
                      ${animation[0]}
                    </div>
                  </div>
                `
              }

              // Jinak jedna karta
              return `
                <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15" data-success-type="success">
                  <div class="skill-detail-header">
                    <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">10%</span>
                      <span class="rate-label">úspěšnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-ball-container">
                      <div class="skill-ball nonsense">
                        <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
                      </div>
                      <div class="skill-ball-string"></div>
                      <div class="skill-ball-tag nonsense">
                        <p class="skill-ball-tag-text">${player.nonsenseName || 'Nesmysl'}</p>
                      </div>
                    </div>
                  `}
                </div>
              `
            })()}
          </div>
        </div>

        <!-- Neúspěšné údery -->
        <div class="skill-main-content" data-main-content="fail">

          <h3 class="skill-category-title">⚔️ Útočné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'offensive' || skills[id].type === 'special').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              const failRate = 100 - successRate
              let animation = getPlayerSkillAnimation(player.id, skillId)
              // Pokud je animace pole [success, fail], vybrat neúspěšnou verzi
              let failAnimation = null
              if (Array.isArray(animation)) {
                failAnimation = animation[1]
              }
              return `
                <div class="skill-detail-card offensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${failRate}%</span>
                      <span class="rate-label">pravděpodobnost</span>
                    </div>
                  </div>
                  ${failAnimation ? `
                    <div class="animation-box">
                      ${failAnimation}
                    </div>
                  ` : `
                  <div class="skill-ball-container">
                    <div class="skill-ball offensive">
                      <img src="/public/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
                    </div>
                    <div class="skill-ball-string"></div>
                    <div class="skill-ball-tag offensive">
                      <p class="skill-ball-tag-text">${skillName}</p>
                    </div>
                  </div>
                  `}
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🛡️ Obranné dovednosti</h3>
          <div class="skills-grid">
            ${allSkillIds.filter(id => skills[id].type === 'defensive').map(skillId => {
              const successRate = calculateSkillSuccessRate(player, skillId)
              const skillName = skills[skillId].name
              const failRate = 100 - successRate
              let animation = getPlayerSkillAnimation(player.id, skillId)
              // Pokud je animace pole [success, fail], vybrat neúspěšnou verzi
              let failAnimation = null
              if (Array.isArray(animation)) {
                failAnimation = animation[1]
              }
              return `
                <div class="skill-detail-card defensive skill-clickable" data-skill-id="${skillId}">
                  <div class="skill-detail-header">
                    <h3>${skillName}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">${failRate}%</span>
                      <span class="rate-label">pravděpodobnost</span>
                    </div>
                  </div>
                  ${failAnimation ? `
                    <div class="animation-box">
                      ${failAnimation}
                    </div>
                  ` : `
                  <div class="skill-ball-container">
                    <div class="skill-ball defensive">
                      <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
                    </div>
                    <div class="skill-ball-string"></div>
                    <div class="skill-ball-tag defensive">
                      <p class="skill-ball-tag-text">${skillName}</p>
                    </div>
                  </div>
                  `}
                </div>
              `
            }).join('')}
          </div>

          <h3 class="skill-category-title">🎲 Nesmyslné dovednosti</h3>
          <div class="skills-grid">
            ${(() => {
              const animation = getPlayerSkillAnimation(player.id, 15)

              // Pokud je animace pole (úspěch + neúspěch), zobraz pouze neúspěšnou verzi
              if (Array.isArray(animation)) {
                return `
                  <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15">
                    <div class="skill-detail-header">
                      <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                      <div class="skill-rate">
                        <span class="rate-number">90%</span>
                        <span class="rate-label">pravděpodobnost</span>
                      </div>
                    </div>
                    <div class="animation-box">
                      ${animation[1]}
                    </div>
                  </div>
                `
              }

              // Jinak placeholder nebo animace
              return `
                <div class="skill-detail-card nonsense skill-clickable" data-skill-id="15">
                  <div class="skill-detail-header">
                    <h3>${player.nonsenseName || 'Nesmysl'}</h3>
                    <div class="skill-rate">
                      <span class="rate-number">90%</span>
                      <span class="rate-label">pravděpodobnost</span>
                    </div>
                  </div>
                  ${animation ? `
                    <div class="animation-box">
                      ${animation}
                    </div>
                  ` : `
                    <div class="skill-ball-container">
                      <div class="skill-ball nonsense">
                        <img src="/images/nohejbalovy-mic.avif" alt="Nohejbalový míč">
                      </div>
                      <div class="skill-ball-string"></div>
                      <div class="skill-ball-tag nonsense">
                        <p class="skill-ball-tag-text">${player.nonsenseName || 'Nesmysl'}</p>
                      </div>
                    </div>
                  `}
                </div>
              `
            })()}
          </div>
        </div>
      </section>

      ${player.stats ? `
      ${(() => {
        // Zjistit, zda hráč má oblíbené údery (jiné než základní 16, 17)
        const hasFavoriteSkills = player.availableSkills && player.availableSkills.length > 0 &&
          player.availableSkills.some(id => id !== 16 && id !== 17);

        if (hasFavoriteSkills) {
          const favoriteSkills = player.availableSkills.filter(id => id !== 16 && id !== 17);
          const favoriteOffensive = favoriteSkills.filter(id => skills[id] && (skills[id].type === 'offensive' || skills[id].type === 'special'));
          const favoriteDefensive = favoriteSkills.filter(id => skills[id] && skills[id].type === 'defensive');

          return `
            <section class="player-section">
              <h2>❤️ Oblíbené údery</h2>
              <div class="favorite-skills-container">
                ${favoriteOffensive.length > 0 ? `
                  <div class="favorite-skills-column">
                    <h3>⚔️ Oblíbené útoky</h3>
                    <div class="favorite-skills-list">
                      ${favoriteOffensive.map(skillId => {
                        const successRate = calculateSkillSuccessRate(player, skillId);
                        return `
                          <div class="favorite-skill-item offensive">
                            <span class="skill-name">${skills[skillId].name}</span>
                            <span class="skill-rate">${successRate}%</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
                ${favoriteDefensive.length > 0 ? `
                  <div class="favorite-skills-column">
                    <h3>🛡️ Oblíbené obrany</h3>
                    <div class="favorite-skills-list">
                      ${favoriteDefensive.map(skillId => {
                        const successRate = calculateSkillSuccessRate(player, skillId);
                        return `
                          <div class="favorite-skill-item defensive">
                            <span class="skill-name">${skills[skillId].name}</span>
                            <span class="skill-rate">${successRate}%</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </section>
          `;
        }
        return '';
      })()}

      <section class="player-section">
        <h2>🎯 Nejlepší schopnosti hráče</h2>
        <div class="favorite-skills-container">
          <div class="favorite-skills-column">
            <h3>⚔️ Nejlepší útoky</h3>
            <div class="favorite-skills-list">
              ${(() => {
                const offensiveSkills = allSkillIds
                  .filter(id => skills[id].type === 'offensive' || skills[id].type === 'special')
                  .map(id => ({
                    id,
                    name: skills[id].name,
                    successRate: calculateSkillSuccessRate(player, id)
                  }))
                  .sort((a, b) => b.successRate - a.successRate)
                  .slice(0, 3);

                return offensiveSkills.map(skill => `
                  <div class="favorite-skill-item offensive">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-rate">${skill.successRate}%</span>
                  </div>
                `).join('');
              })()}
            </div>
          </div>
          <div class="favorite-skills-column">
            <h3>🛡️ Nejlepší obrany</h3>
            <div class="favorite-skills-list">
              ${(() => {
                const defensiveSkills = allSkillIds
                  .filter(id => skills[id].type === 'defensive')
                  .map(id => ({
                    id,
                    name: skills[id].name,
                    successRate: calculateSkillSuccessRate(player, id)
                  }))
                  .sort((a, b) => b.successRate - a.successRate)
                  .slice(0, 3);

                return defensiveSkills.map(skill => `
                  <div class="favorite-skill-item defensive">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-rate">${skill.successRate}%</span>
                  </div>
                `).join('');
              })()}
            </div>
          </div>
        </div>
      </section>
      ` : ''}
    </div>
  `
}

export function setupPlayerDetailHandlers() {
  // Handler pro běžná navigační tlačítka
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.nav
      // Import navigateTo z main.js
      if (window.navigateToView) {
        window.navigateToView(view)
      }
    })
  })

  // Handler pro zpět tlačítka s team ID
  document.querySelectorAll('[data-nav-team]').forEach(btn => {
    btn.addEventListener('click', () => {
      const teamId = btn.dataset.navTeam
      const isExtraliga = btn.dataset.navExtraliga === 'true'
      if (window.navigateToView) {
        window.navigateToView('team-roster', teamId, isExtraliga)
      }
    })
  })

  // Tab switching pro hlavní záložky (Úspěšné/Neúspěšné údery)
  document.querySelectorAll('.skill-main-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mainTabType = tab.dataset.mainTab

      // Odstranit active ze všech hlavních tabů
      document.querySelectorAll('.skill-main-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.skill-main-content').forEach(c => c.classList.remove('active'))

      // Přidat active k aktuálnímu tabu
      tab.classList.add('active')
      const activeContent = document.querySelector(`[data-main-content="${mainTabType}"]`)
      if (activeContent) {
        activeContent.classList.add('active')
      }
    })
  })

  // Handler pro kliknutí na skill cards - zobrazení modalu s detaily
  document.querySelectorAll('.skill-clickable').forEach(card => {
    card.addEventListener('click', () => {
      console.log('Skill card clicked!')
      const skillId = parseInt(card.dataset.skillId)
      const container = card.closest('.player-detail-container')
      const playerId = container ? container.dataset.currentPlayerId : null
      // Zjistit, zda je karta v sekci úspěšných nebo neúspěšných úderů
      const isSuccessTab = card.closest('[data-main-content="success"]') !== null
      console.log('Opening modal for skill:', skillId, 'player:', playerId, 'isSuccessTab:', isSuccessTab)
      showSkillDetailModal(skillId, playerId, isSuccessTab)
    })
  })
}

// Funkce pro zobrazení modalu s detaily schopnosti
function showSkillDetailModal(skillId, playerId = null, isSuccessTab = true) {
  console.log('showSkillDetailModal called with skillId:', skillId, 'playerId:', playerId, 'isSuccessTab:', isSuccessTab)

  const skill = skills[skillId]
  const details = skillDetails[skillId]

  if (!skill || !details) {
    console.error(`Skill ${skillId} not found`)
    return
  }

  // Získat animaci pro daného hráče a skill (pokud máme playerId)
  let animation = playerId ? getPlayerSkillAnimation(playerId, skillId) : null

  // Pro nonsense dovednosti s polem animací (úspěch + neúspěch), vybrat správnou verzi
  if (Array.isArray(animation)) {
    animation = isSuccessTab ? animation[0] : animation[1]
  }

  // Získat jméno dovednosti (pro nonsense použít player-specific name)
  let skillName = skill.name
  if (playerId && skillId === 15) {
    const result = findPlayerById(playerId)
    if (result && result.player && result.player.nonsenseName) {
      skillName = result.player.nonsenseName
    }
  }

  console.log('Creating modal with skillName:', skillName)

  // Vytvořit modal overlay
  const modal = document.createElement('div')
  modal.className = 'skill-modal-overlay'
  modal.innerHTML = `
    <div class="skill-modal-content">
      <div class="skill-modal-header">
        <h2>${skillName}</h2>
        <button class="skill-modal-close">&times;</button>
      </div>
      <div class="skill-modal-body">
        ${animation ? `
          <div class="skill-detail-section skill-animation-large">
            <div class="animation-box-large">
              ${animation}
            </div>
          </div>
        ` : ''}

        <div class="skill-detail-section">
          <h3>📝 Popis</h3>
          <p>${details.description}</p>
        </div>

        <div class="skill-detail-section">
          <h3>📊 Klíčové atributy</h3>
          <p><strong>${details.keyStats}</strong></p>
          <p class="skill-detail-hint">Úspěšnost schopnosti se vypočítá jako průměr těchto atributů hráče.</p>
        </div>

        <div class="skill-detail-section">
          <h3>⚙️ Vyhodnocování</h3>
          <p>${details.evaluationPhase}</p>
        </div>

        <div class="skill-detail-section">
          <h3>🛡️ Nejlepší obrana</h3>
          <p>${details.bestCounter}</p>
        </div>

        <div class="skill-detail-section priority-section">
          <h3>🔢 Priorita</h3>
          <p>${details.priority}</p>
        </div>

        ${skill.effect ? `
          <div class="skill-detail-section effect-section">
            <h3>✨ Efekt</h3>
            <p>${skill.effect}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `

  // Přidat modal do body
  document.body.appendChild(modal)

  // Přidat event listener pro zavření
  const closeBtn = modal.querySelector('.skill-modal-close')
  closeBtn.addEventListener('click', () => {
    modal.remove()
  })

  // Zavřít při kliknutí mimo modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })

  // Zavřít při stisknutí ESC
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', escapeHandler)
    }
  }
  document.addEventListener('keydown', escapeHandler)
}
