export interface EyeSocket {
  xPct: number;
  yPct: number;
  rxPct: number;
  ryPct: number;
  lidRgb: [number, number, number];
}

export type PortraitAlteration = 'closed-eyes' | 'avoids-light' | 'mirrored' | 'none';

export interface AncestorPortrait {
  id: string;
  cote: string;
  name: string;
  alteredName?: string;
  title: string;
  years: string;
  medium: string;
  imageSrc: string;
  width: number;
  height: number;
  alt: string;
  aspectClass: string;
  layoutClass: string;
  epitaph: string;
  versoConfession: string;
  notaryNote: string;
  horrorPhenomenon: string;
  alteration: PortraitAlteration;
  dilation: number;
  eyes: EyeSocket[];
}

export interface GrimoireFolio {
  folioNumber: string;
  latinRubric: string;
  leftTitle: string;
  leftParagraphs: string[];
  corruptedParagraphs: string[];
  leftMarginalia: string;
  rightType: 'engraving' | 'ritual';
  engravingSrc?: string;
  engravingAlt?: string;
  engravingWidth?: number;
  engravingHeight?: number;
  rightCaption: string;
  rightText: string;
}

export interface WitnessEntry {
  id: string;
  name: string;
  dateLabel: string;
  isoDate: string;
  verse: string;
}

export interface WallPhantomMark {
  id: string;
  xRatio: number;
  docY: number;
  kind: 'tally' | 'whisper' | 'footprints';
  text?: string;
  count?: number;
  angleDeg?: number;
}

export const MANOR_ROOMS = [
  { id: 'vestibule', numeral: 'I', label: 'Le vestibule' },
  { id: 'galerie', numeral: 'II', label: 'La galerie' },
  { id: 'bibliotheque', numeral: 'III', label: 'Le grimoire' },
  { id: 'crypte', numeral: 'IV', label: 'La crypte' },
] as const;

// Marks scratched into the walls, visible only inside the candle halo.
export const WALL_PHANTOM_MARKS: WallPhantomMark[] = [
  { id: 'vestibule-tally', xRatio: 0.05, docY: 250, kind: 'tally', count: 13, text: 'XIII', angleDeg: -3 },
  { id: 'vestibule-whisper', xRatio: 0.47, docY: 640, kind: 'whisper', text: 'il regarde par la lucarne', angleDeg: -2 },
  { id: 'vestibule-steps', xRatio: 0.84, docY: 700, kind: 'footprints', text: 'pieds nus', angleDeg: 8 },
  { id: 'galerie-steps', xRatio: 0.54, docY: 1180, kind: 'footprints', text: 'ils montent', angleDeg: -14 },
  { id: 'galerie-whisper', xRatio: 0.05, docY: 1560, kind: 'whisper', text: 'ne les retourne pas', angleDeg: -2 },
  { id: 'galerie-tally', xRatio: 0.48, docY: 1960, kind: 'tally', count: 13, text: '3 h 17', angleDeg: 3 },
  { id: 'grimoire-whisper', xRatio: 0.06, docY: 2660, kind: 'whisper', text: 'derrière toi', angleDeg: -3 },
  { id: 'crypte-steps', xRatio: 0.46, docY: 3360, kind: 'footprints', text: 'aucun ne redescend', angleDeg: -8 },
  { id: 'crypte-tally', xRatio: 0.07, docY: 3740, kind: 'tally', count: 17, text: 'sous la craie', angleDeg: 2 },
];

export const ANCESTOR_PORTRAITS: AncestorPortrait[] = [
  {
    id: 'severin',
    cote: 'PL. 01',
    name: 'Séverin de Valmorin',
    title: 'Dernier propriétaire',
    years: '1818 à 1889',
    medium: 'Huile sur toile',
    imageSrc: '/assets/portrait-severin.webp',
    width: 896,
    height: 1200,
    alt: 'Portrait en clair-obscur de Séverin de Valmorin en redingote noire',
    aspectClass: 'aspect-[3/4]',
    layoutClass: 'lg:col-span-7',
    epitaph: 'Mort le 31 octobre 1889. Heure inconnue.',
    versoConfession: 'Au dos, au crayon : « Ne les retournez pas. »',
    notaryNote: 'La toile était tiède quand on l’a décrochée.',
    horrorPhenomenon: 'Ses pupilles se sont dilatées.',
    alteration: 'closed-eyes',
    dilation: 0.75,
    eyes: [
      { xPct: 42.9, yPct: 31.05, rxPct: 1.75, ryPct: 0.56, lidRgb: [86, 61, 43] },
      { xPct: 54.45, yPct: 30.55, rxPct: 1.75, ryPct: 0.54, lidRgb: [76, 54, 38] },
    ],
  },
  {
    id: 'heloise',
    cote: 'PL. 02',
    name: 'Héloïse de Valmorin',
    title: 'Fille du précédent',
    years: '1854 à 1879',
    medium: 'Huile sur panneau de noyer',
    imageSrc: '/assets/portrait-heloise.webp',
    width: 896,
    height: 1200,
    alt: 'Portrait sombre d’Héloïse de Valmorin en voile de dentelle noire, une rose séchée entre les mains',
    aspectClass: 'aspect-[3/4]',
    layoutClass: 'lg:col-span-5 lg:mt-20',
    epitaph: 'Disparue en 1879. On n’a retrouvé que ses gants.',
    versoConfession: 'Cousue au dos de la toile : une mèche de cheveux noirs. Pas les siens.',
    notaryNote: 'Les yeux ont été repeints. Deux fois.',
    horrorPhenomenon: 'Ses yeux sont devenus noirs. Elle regarde toujours la bougie.',
    alteration: 'none',
    dilation: 1,
    eyes: [
      { xPct: 44.15, yPct: 28.25, rxPct: 2.05, ryPct: 0.66, lidRgb: [94, 64, 55] },
      { xPct: 56.1, yPct: 27.75, rxPct: 2.0, ryPct: 0.62, lidRgb: [82, 55, 47] },
    ],
  },
  {
    id: 'malachie',
    cote: 'PL. 03',
    name: 'L’abbé Malachie',
    title: 'Confesseur du domaine',
    years: '1822 à 1889',
    medium: 'Huile sur toile marouflée',
    imageSrc: '/assets/portrait-malachie.webp',
    width: 896,
    height: 1200,
    alt: 'Portrait à la bougie de l’abbé Malachie tenant une montre à gousset',
    aspectClass: 'aspect-[3/4]',
    layoutClass: 'lg:col-span-5',
    epitaph: 'N’a jamais donné l’absolution.',
    versoConfession: 'Gravé dans le bois du cadre : « 3 h 17 ».',
    notaryNote: 'Sa montre était sur l’autel de la crypte. Arrêtée à 3 h 17.',
    horrorPhenomenon: 'Il ne cligne plus.',
    alteration: 'avoids-light',
    dilation: 0.7,
    eyes: [
      { xPct: 48.75, yPct: 26.55, rxPct: 1.85, ryPct: 0.58, lidRgb: [82, 59, 41] },
      { xPct: 60.15, yPct: 27.0, rxPct: 1.6, ryPct: 0.5, lidRgb: [44, 31, 21] },
    ],
  },
  {
    id: 'jumeaux',
    cote: 'PL. 04',
    name: 'Céleste et Cyprien',
    alteredName: 'Cyprien et Céleste',
    title: 'Enfants du domaine',
    years: '1871 à 1881',
    medium: 'Ferrotype au collodion',
    imageSrc: '/assets/portrait-jumeaux.webp',
    width: 1200,
    height: 896,
    alt: 'Ferrotype ancien de deux enfants immobiles dans un couloir boisé',
    aspectClass: 'aspect-[4/3]',
    layoutClass: 'lg:col-span-7 lg:mt-12',
    epitaph: 'Le photographe n’a fait poser qu’un seul enfant.',
    versoConfession: 'Au dos de la plaque : « Il en manque un dans l’escalier. »',
    notaryNote: 'Une seule naissance est inscrite au registre de la paroisse.',
    horrorPhenomenon: 'L’un des deux s’efface de la plaque.',
    alteration: 'mirrored',
    dilation: 0.6,
    eyes: [
      { xPct: 39.65, yPct: 33.55, rxPct: 0.85, ryPct: 0.44, lidRgb: [104, 94, 79] },
      { xPct: 42.75, yPct: 33.55, rxPct: 0.85, ryPct: 0.44, lidRgb: [98, 88, 74] },
      { xPct: 59.35, yPct: 34.95, rxPct: 0.85, ryPct: 0.42, lidRgb: [94, 84, 70] },
      { xPct: 62.6, yPct: 34.85, rxPct: 0.85, ryPct: 0.42, lidRgb: [92, 82, 68] },
    ],
  },
];

// [[...]] marks a passage struck out by the notary.
export const GRIMOIRE_FOLIOS: GrimoireFolio[] = [
  {
    folioNumber: 'Feuillet I',
    latinRubric: 'De nocte omnium animarum',
    leftTitle: 'Procès-verbal',
    leftParagraphs: [
      '1er novembre 1889. Bibliothèque haute. Le registre était ouvert sur le pupitre, cinq bougies allumées autour.',
      'Le domaine était vide depuis trois jours. Les miroirs avaient été retournés contre le mur par [[une main d’enfant]].',
    ],
    corruptedParagraphs: [
      '1er novembre 1889. Bibliothèque haute. Le registre était ouvert sur le pupitre, cinq bougies allumées autour.',
      'Le domaine n’était pas vide. Les miroirs avaient été retournés contre le mur pour que nous ne voyions pas [[qui se tenait derrière nous]].',
    ],
    leftMarginalia: 'Ne pas souffler la cinquième.',
    rightType: 'engraving',
    engravingSrc: '/assets/grimoire-botanique.webp',
    engravingAlt: 'Gravure sur cuivre d’un crâne, d’un sphinx tête-de-mort et de rameaux de belladone',
    engravingWidth: 896,
    engravingHeight: 1200,
    rightCaption: 'Planche I : belladone.',
    rightText: 'Héloïse en prenait pour voir « ceux qui sont assis dans les miroirs ».',
  },
  {
    folioNumber: 'Feuillet II',
    latinRubric: 'Horologium umbrarum',
    leftTitle: 'Les pendules',
    leftParagraphs: [
      'Toutes les pendules du domaine se sont arrêtées à 3 h 17.',
      'Celle du vestibule bat encore. On lui a retiré ses poids le 2 novembre. Elle bat toujours.',
    ],
    corruptedParagraphs: [
      'Toutes les pendules du domaine se sont arrêtées à 3 h 17.',
      'Celle du vestibule bat encore. Elle bat plus vite quand quelqu’un lit ce feuillet.',
    ],
    leftMarginalia: 'Compter les battements. Il en manque un.',
    rightType: 'engraving',
    engravingSrc: '/assets/grimoire-eclipse.webp',
    engravingAlt: 'Gravure d’une sphère armillaire figée tenue par une main squelettique',
    engravingWidth: 896,
    engravingHeight: 1200,
    rightCaption: 'Planche II : la clef du caveau.',
    rightText: 'Le caveau a été muré en 1890. [[On frappait encore.]]',
  },
  {
    folioNumber: 'Feuillet III',
    latinRubric: 'Vigilia quinque cereorum',
    leftTitle: 'Les cinq bougies',
    leftParagraphs: ['Une bougie par nom. Allumez-les toutes.'],
    corruptedParagraphs: ['Une bougie par nom. Vous les avez déjà allumées une fois.'],
    leftMarginalia: 'Chaque bougie allumée appelle quelqu’un.',
    rightType: 'ritual',
    rightCaption: 'Séverin, Héloïse, Malachie, Céleste, Cyprien.',
    rightText: 'Cinq noms.',
  },
];

export const INITIAL_WITNESSES: WitnessEntry[] = [
  {
    id: 'vasseur-1889',
    name: 'Anselme Vasseur, notaire',
    dateLabel: '31 octobre 1889',
    isoDate: '1889-10-31',
    verse: 'J’ai scellé la galerie. En partant, [[quelqu’un marchait au-dessus de moi]]. La lucarne s’est rallumée.',
  },
  {
    id: 'garance-1896',
    name: 'Garance de Saint-Clair',
    dateLabel: '31 octobre 1896',
    isoDate: '1896-10-31',
    verse: 'Les yeux d’Héloïse ont suivi ma bougie. Son regard s’est tourné vers moi.',
  },
  {
    id: 'moreau-1903',
    name: 'Théophile Moreau, médecin',
    dateLabel: '31 octobre 1903',
    isoDate: '1903-10-31',
    verse: 'J’ai retiré les poids de l’horloge. Elle bat toujours. [[Quelque chose respire derrière la cloison.]]',
  },
];
