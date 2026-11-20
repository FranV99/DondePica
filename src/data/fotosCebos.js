// Fotos de cebos y señuelos (Wikimedia Commons, con licencia libre: dominio público, CC0,
// CC BY o CC BY-SA). Se cargan desde internet; con "npm run cebos" se descargan a
// public/img/cebos/ para que funcionen sin conexión.
const C = 'https://upload.wikimedia.org/wikipedia/commons/'
const T = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/'
const W = 'https://commons.wikimedia.org/wiki/File:'

export const FOTOS_CEBOS = {
  mosca_seca: { url: `${T}6/6b/GreenDrakeDry.jpg/330px-GreenDrakeDry.jpg`, autor: 'Mike Cline', licencia: 'Dominio público', fuente: `${W}GreenDrakeDry.jpg` },
  ninfa: { url: `${T}e/ec/BrooksMontanaStone.jpg/330px-BrooksMontanaStone.jpg`, autor: 'Mike Cline', licencia: 'Dominio público', fuente: `${W}BrooksMontanaStone.jpg` },
  mosca_ahogada: { url: `${T}0/0c/Fly_fish.jpg/330px-Fly_fish.jpg`, autor: 'Berg (Wikipedia en búlgaro)', licencia: 'Dominio público', fuente: `${W}Fly_fish.jpg` },
  streamer: { url: `${T}2/21/PurpleAndBlackBeadHeadWoollyBugger.jpg/330px-PurpleAndBlackBeadHeadWoollyBugger.jpg`, autor: 'Mike Cline', licencia: 'Dominio público', fuente: `${W}PurpleAndBlackBeadHeadWoollyBugger.jpg` },
  hormiga: { url: `${T}1/18/Black_and_red_sinking_ant.jpg/330px-Black_and_red_sinking_ant.jpg`, autor: 'Mike Cline', licencia: 'CC BY-SA 4.0', fuente: `${W}Black_and_red_sinking_ant.jpg` },
  ondulante: { url: `${C}b/b1/Blizge.jpg`, autor: 'Vincas.k', licencia: 'CC BY-SA 3.0', fuente: `${W}Blizge.jpg` },
  devon: { url: `${T}2/24/Devon_Spinner.jpg/330px-Devon_Spinner.jpg`, autor: 'BentaxGermany', licencia: 'CC BY 3.0', fuente: `${W}Devon_Spinner.jpg` },
  cucharilla: { url: `${C}4/45/Spinner_lure_no_feather_ora.png`, autor: 'Jeremykemp (Wikipedia en inglés)', licencia: 'Dominio público', fuente: `${W}Spinner_lure_no_feather_ora.png` },
  spinnerbait: { url: `${T}f/fa/Spinnerbait.jpg/330px-Spinnerbait.jpg`, autor: 'E tac', licencia: 'CC0', fuente: `${W}Spinnerbait.jpg` },
  vinilo: { url: `${T}7/71/Angeln_zubehoer_twister_01.jpg/330px-Angeln_zubehoer_twister_01.jpg`, autor: 'Raboe001', licencia: 'CC BY-SA 2.5', fuente: `${W}Angeln_zubehoer_twister_01.jpg` },
  minnow: { url: `${T}4/4b/Assorted_cranks.JPG/330px-Assorted_cranks.JPG`, autor: 'E tac', licencia: 'Dominio público', fuente: `${W}Assorted_cranks.JPG` },
  crankbait: {
    url: `${T}1/18/Barsa-50_3%EF%BD%92%EF%BD%84%EF%BD%8A%EF%BD%92.jpg/330px-Barsa-50_3%EF%BD%92%EF%BD%84%EF%BD%8A%EF%BD%92.jpg`,
    autor: 'サミー',
    licencia: 'Dominio público',
    fuente: `${W}Barsa-50_3%EF%BD%92%EF%BD%84%EF%BD%8A%EF%BD%92.jpg`,
  },
  jig: { url: `${C}e/ef/Fishing_lure_jig.jpg`, autor: 'Autor desconocido', licencia: 'CC BY-SA 3.0', fuente: `${W}Fishing_lure_jig.jpg` },
  popper: { url: `${C}6/69/Popper_lure.jpg`, autor: 'Musky (Wikipedia en japonés)', licencia: 'Dominio público', fuente: `${W}Popper_lure.jpg` },
  rana: { url: `${T}a/af/Scum_frog.jpg/330px-Scum_frog.jpg`, autor: 'Musky (Wikipedia en japonés)', licencia: 'Dominio público', fuente: `${W}Scum_frog.jpg` },
  asticot: { url: `${T}7/72/Eurobait-white-maggot.jpg/330px-Eurobait-white-maggot.jpg`, autor: 'Andrew Barker', licencia: 'CC BY-SA 3.0', fuente: `${W}Eurobait-white-maggot.jpg` },
  boilie: { url: `${T}4/4b/2014-03-07_18-17-30_boulettes-31f.jpg/330px-2014-03-07_18-17-30_boulettes-31f.jpg`, autor: 'Thomas Bresson', licencia: 'CC BY 3.0', fuente: `${W}2014-03-07_18-17-30_boulettes-31f.jpg` },
  quisquilla: {
    url: `${T}d/d1/Common_Sandprawns_%28Kraussillichirus_kraussi%29_to_be_used_as_bait_..._%2852675353148%29.jpg/330px-Common_Sandprawns_%28Kraussillichirus_kraussi%29_to_be_used_as_bait_..._%2852675353148%29.jpg`,
    autor: 'Bernard Dupont',
    licencia: 'CC BY-SA 2.0',
    fuente: `${W}Common_Sandprawns_(Kraussillichirus_kraussi)_to_be_used_as_bait_..._(52675353148).jpg`,
  },
  lombriz: { url: `${T}b/b8/Earthworm_1.jpg/330px-Earthworm_1.jpg`, autor: 'Ines Zgonc', licencia: 'CC BY 3.0', fuente: `${W}Earthworm_1.jpg` },
  canutillo: {
    url: `${T}6/6d/Saddle-case_case-maker_caddisfly_larva_%287234727384%29.jpg/330px-Saddle-case_case-maker_caddisfly_larva_%287234727384%29.jpg`,
    autor: 'Bob Henricks',
    licencia: 'CC BY-SA 2.0',
    fuente: `${W}Saddle-case_case-maker_caddisfly_larva_(7234727384).jpg`,
  },
  gusarapa: { url: `${T}b/b2/M%C3%BCckenlarve-001.jpg/330px-M%C3%BCckenlarve-001.jpg`, autor: 'Amada44', licencia: 'CC BY 3.0', fuente: `${W}M%C3%BCckenlarve-001.jpg` },
  saltamontes: {
    url: `${T}3/3c/Chorthippus_biguttulus%2C_Vic-la-Gardiole_03.jpg/330px-Chorthippus_biguttulus%2C_Vic-la-Gardiole_03.jpg`,
    autor: 'Christian Ferrer',
    licencia: 'CC BY-SA 4.0',
    fuente: `${W}Chorthippus_biguttulus,_Vic-la-Gardiole_03.jpg`,
  },
  maiz: { url: `${T}e/e1/Sweet_Corns.jpg/330px-Sweet_Corns.jpg`, autor: 'HitroMilanese', licencia: 'CC BY-SA 3.0', fuente: `${W}Sweet_Corns.jpg` },
  pan: {
    url: `${T}8/8b/Transparent_Slice_of_Sara_Lee_white_whole_grain_bread_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.png/330px-Transparent_Slice_of_Sara_Lee_white_whole_grain_bread_in_the_Franklin_Farm_section_of_Oak_Hill%2C_Fairfax_County%2C_Virginia.png`,
    autor: 'Famartin',
    licencia: 'CC BY-SA 4.0',
    fuente: `${W}Transparent_Slice_of_Sara_Lee_white_whole_grain_bread_in_the_Franklin_Farm_section_of_Oak_Hill,_Fairfax_County,_Virginia.png`,
  },
  masa: { url: `${T}6/6c/Risen_bread_dough.jpg/330px-Risen_bread_dough.jpg`, autor: 'Gageills', licencia: 'CC0', fuente: `${W}Risen_bread_dough.jpg` },
  pellets: { url: `${T}a/a1/Fish_Feed_Pellets.jpg/330px-Fish_Feed_Pellets.jpg`, autor: 'Narek75', licencia: 'CC BY-SA 4.0', fuente: `${W}Fish_Feed_Pellets.jpg` },
  tigernut: { url: `${T}3/31/Cyperus_esculentus_012.jpg/330px-Cyperus_esculentus_012.jpg`, autor: 'Tamorlan', licencia: 'CC BY 3.0', fuente: `${W}Cyperus_esculentus_012.jpg` },
  fruta: { url: `${T}b/bb/Cherry_Stella444.jpg/330px-Cherry_Stella444.jpg`, autor: 'Benjamint444, editada por Fir0002', licencia: 'CC BY-SA 3.0', fuente: `${W}Cherry_Stella444.jpg` },
  calamar: { url: `${T}d/dd/Loligo_vulgaris.jpg/330px-Loligo_vulgaris.jpg`, autor: 'Hans Hillewaert', licencia: 'CC BY-SA 4.0', fuente: `${W}Loligo_vulgaris.jpg` },
  gusana: {
    url: `${T}5/5d/Hediste_diversicolor_%28YPM_IZ_080469%29_001.jpeg/330px-Hediste_diversicolor_%28YPM_IZ_080469%29_001.jpeg`,
    autor: 'Eric A. Lazo-Wasem (Yale Peabody Museum)',
    licencia: 'CC0',
    fuente: `${W}Hediste_diversicolor_(YPM_IZ_080469)_001.jpeg`,
  },
}
