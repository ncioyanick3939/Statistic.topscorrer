import { reactive } from 'vue'
// Feste Angaben: Teams mit Farben, Spielplan, dein Kader aus dem Topscorer-Spiel.

// Name, Trikotfarbe, Schriftfarbe darauf
export const TEAMS = {
  ZSC: ['ZSC Lions', '#0b4ea2', '#ffffff'],
  HCAP: ['Ambri-Piotta', '#1f5fbf', '#ffffff'],
  GSHC: ['Genève-Servette', '#7b1e3a', '#ffd24a'],
  SCL: ['SCL Tigers', '#d81e26', '#ffd400'],
  EVZ: ['EV Zug', '#0a3d7a', '#8fd0ff'],
  SCB: ['SC Bern', '#c8102e', '#ffd400'],
  FRI: ['Fribourg-Gottéron', '#15181e', '#ffffff'],
  LHC: ['Lausanne HC', '#c4122f', '#ffffff'],
  HCA: ['HC Ajoie', '#f6c800', '#151515'],
  HCD: ['HC Davos', '#f4c20d', '#0b2a6b'],
  EHCB: ['EHC Biel', '#d6001c', '#ffd400'],
  HCL: ['HC Lugano', '#1c1c1c', '#f2f2f2'],
  SCRJ: ['Rapperswil-Jona', '#b3122b', '#ffffff'],
  EHCK: ['EHC Kloten', '#16479e', '#ffffff']
}

// Teamnamen, wie sie im Export von sihf.ch stehen
export const EXPORT_TEAM = {
  'HC Ambri-Piotta': 'HCAP', 'HC Ajoie': 'HCA', 'ZSC Lions': 'ZSC', 'Fribourg-Gottéron': 'FRI',
  'SCL Tigers': 'SCL', 'EHC Kloten': 'EHCK', 'Lausanne HC': 'LHC', 'SC Rapperswil-Jona Lakers': 'SCRJ',
  'HC Lugano': 'HCL', 'EV Zug': 'EVZ', 'EHC Biel-Bienne': 'EHCB', 'Genève-Servette HC': 'GSHC',
  'SC Bern': 'SCB', 'HC Davos': 'HCD'
}

// Spielplan laut sihf.ch (Heim-Gast), hinterlegt bis 29.11.2026
export const SCHEDULE = {
  '2026-11-11': 'HCL-SCB EVZ-HCAP',
  '2026-11-12': 'EHCB-ZSC',
  '2026-11-13': 'SCB-FRI HCD-HCAP HCL-SCL EVZ-SCRJ',
  '2026-11-14': 'HCA-HCD FRI-EHCK GSHC-SCB SCRJ-HCL SCL-EHCB ZSC-EVZ',
  '2026-11-15': 'EHCK-GSHC HCAP-LHC',
  '2026-11-18': 'EVZ-HCA',
  '2026-11-19': 'LHC-ZSC',
  '2026-11-20': 'SCB-EHCK FRI-SCRJ HCL-HCA SCL-HCAP EVZ-GSHC',
  '2026-11-21': 'HCA-FRI HCAP-EVZ EHCB-SCB EHCK-HCD ZSC-HCL',
  '2026-11-22': 'GSHC-LHC SCRJ-SCL',
  '2026-11-24': 'SCB-HCAP HCD-GSHC FRI-ZSC LHC-SCRJ HCL-EHCB SCL-HCA EVZ-EHCK',
  '2026-11-26': 'HCA-EHCB',
  '2026-11-27': 'FRI-EVZ HCAP-EHCK SCRJ-ZSC LHC-SCB SCL-GSHC',
  '2026-11-28': 'HCL-FRI SCB-SCRJ EHCB-LHC GSHC-HCAP EHCK-SCL EVZ-HCD',
  '2026-11-29': 'ZSC-HCA HCD-HCL'
}
export const SCHEDULE_END = '2026-11-29'
export const SEASON_GAMES = 52

// Dein Kader (Screenshots vom 10.11.): Ø Punkte, Marktwert, Trend, in der Aufstellung, Import
export const MY_SQUAD = reactive({
  'Waeber Ludovic|FRI': [113, 550639, 'down', 1, 0],
  'Nyffeler Melvin|SCRJ': [69, 212671, 'up', 0, 0],
  'Säteri Harri|EHCB': [76, 371068, 'up', 0, 1],
  'Carrick Connor|LHC': [85, 565802, 'up', 1, 1],
  'Balestra Nic|SCB': [42, 120031, 'up', 1, 0],
  'Weber Yannick|ZSC': [86, 613580, 'up', 1, 0],
  'Bisig Robin|SCRJ': [26, 60000, 'flat', 1, 0],
  'Riva Elia|EVZ': [47, 240676, 'up', 1, 0],
  'Gernat Martin|HCD': [55, 337536, 'down', 0, 1],
  'Aebischer David|HCL': [55, 379607, 'down', 1, 0],
  'Schmid Sandro|FRI': [95, 689336, 'down', 1, 0],
  'Zadina Filip|HCD': [77, 556938, 'up', 0, 1],
  'Borgström Henrik|FRI': [94, 406370, 'up', 1, 1],
  'Kubalik Dominik|EVZ': [108, 401574, 'up', 1, 1],
  'Kurashev Philipp|LHC': [51, 419183, 'down', 1, 0],
  'Rajala Toni|EHCB': [83, 382928, 'up', 1, 1],
  'Hofmann Gregory|EVZ': [111, 573971, 'up', 1, 0],
  'Björninen Hannes|SCL': [83, 520489, 'up', 1, 1],
  'Müller Marco|SCB': [43, 261920, 'up', 1, 0],
  'Simic Axel|LHC': [55, 354875, 'down', 0, 0],
  'Vermin Joël|EHCB': [32, 199620, 'flat', 1, 0]
})

// Verletzung mit Ablaufdatum, danach verschwindet der Hinweis von selbst
export const INJURED = {
  'Zadina Filip|HCD': ['Er wurde operiert und fällt rund einen Monat aus.', '2026-12-10']
}

export const NOTES = {
  'Weber Yannick|ZSC': 'Er ist 37, und sein Schnitt hängt stark an den Siegen des ZSC.',
  'Kubalik Dominik|EVZ': 'Er spielt in einer Linie mit Zugs Topskorer Rohrer.',
  'Kurashev Philipp|LHC': 'Er ist erst seit Mitte Oktober in Lausanne und hat eine Ausstiegsklausel für die NHL.'
}

export const POSITION = { F: 'Stürmer', D: 'Verteidiger', G: 'Torhüter' }
