export interface EyeSocket {
  xPct: number;
  yPct: number;
  rxPct: number;
  ryPct: number;
  lidRgb: [number, number, number];
}

export interface AncestorPortrait {
  id: string;
  cote: string;
  name: string;
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
  eyes: EyeSocket[];
}

export interface GrimoireFolio {
  folioNumber: string;
  latinRubric: string;
  leftTitle: string;
  leftParagraphs: string[];
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

export const WALL_PHANTOM_MARKS: WallPhantomMark[] = [
  {
    id: 'vestibule-tally',
    xRatio: 0.05,
    docY: 250,
    kind: 'tally',
    count: 13,
    text: 'XIII nuits sans aube',
    angleDeg: -3,
  },
  {
    id: 'vestibule-center-whisper',
    xRatio: 0.48,
    docY: 560,
    kind: 'whisper',
    text: 'Quelqu’un vous observe depuis la lucarne haute',
    angleDeg: -2,
  },
  {
    id: 'vestibule-whisper',
    xRatio: 0.82,
    docY: 690,
    kind: 'footprints',
    text: 'Traces humides devant la grille',
    angleDeg: 8,
  },
  {
    id: 'galerie-steps',
    xRatio: 0.54,
    docY: 1180,
    kind: 'footprints',
    text: 'Pas montés de la cave à 03:17',
    angleDeg: -14,
  },
  {
    id: 'galerie-whisper-left',
    xRatio: 0.05,
    docY: 1560,
    kind: 'whisper',
    text: 'Leurs pupilles bougent sous l’huile sèche',
    angleDeg: -2,
  },
  {
    id: 'galerie-tally-mid',
    xRatio: 0.48,
    docY: 1960,
    kind: 'tally',
    count: 13,
    text: '03:17 : ne te retourne pas',
    angleDeg: 3,
  },
  {
    id: 'grimoire-whisper',
    xRatio: 0.06,
    docY: 2660,
    kind: 'whisper',
    text: 'Un sixième souffle lit par-dessus votre épaule',
    angleDeg: -3,
  },
  {
    id: 'crypte-footprints',
    xRatio: 0.46,
    docY: 3360,
    kind: 'footprints',
    text: 'Aucun pas ne redescend',
    angleDeg: -8,
  },
  {
    id: 'crypte-tally',
    xRatio: 0.07,
    docY: 3740,
    kind: 'tally',
    count: 17,
    text: 'Ils grattent sous la craie',
    angleDeg: 2,
  },
];

export const ANCESTOR_PORTRAITS: AncestorPortrait[] = [
  {
    id: 'severin',
    cote: 'PL. 01',
    name: 'Séverin de Valmorin',
    title: 'Dernier châtelain et garde des scellés',
    years: '1818 à 1889',
    medium: 'Huile sur toile de lin, vernis au bitume de Judée',
    imageSrc: '/assets/portrait-severin.webp',
    width: 896,
    height: 1200,
    alt: 'Portrait en clair-obscur de Séverin de Valmorin en redingote de velours noir',
    aspectClass: 'aspect-[3/4]',
    layoutClass: 'lg:col-span-7',
    epitaph:
      '« Il fit murer les horloges de l’aile ouest afin que nul ne sût à quelle heure la mer montait sous les caves. »',
    versoConfession:
      'Inscription tracée à la mine de plomb au dos du châssis : « J’ai vendu le sommeil des miens contre sept hivers de silence ; voici venir le huitième, et quelqu’un frappe déjà derrière la brique fraîche. »',
    notaryNote:
      'Toile retrouvée tiède au toucher lors de l’ouverture des portes à l’aube du premier novembre ; des traces d’ongles marquaient l’intérieur du châssis.',
    horrorPhenomenon:
      'Le bitume suinte sous vos doigts : une larme sombre perle sous sa paupière et une écriture traverse la toile.',
    eyes: [
      { xPct: 42.90, yPct: 31.05, rxPct: 1.75, ryPct: 0.56, lidRgb: [86, 61, 43] },
      { xPct: 54.45, yPct: 30.55, rxPct: 1.75, ryPct: 0.54, lidRgb: [76, 54, 38] },
    ],
  },
  {
    id: 'heloise',
    cote: 'PL. 02',
    name: 'Héloïse de Valmorin',
    title: 'La fiancée des brumes d’octobre',
    years: '1854 à 1879',
    medium: 'Huile sur panneau de noyer, voile de dentelle de Chantilly',
    imageSrc: '/assets/portrait-heloise.webp',
    width: 896,
    height: 1200,
    alt: 'Portrait sombre d’Héloïse de Valmorin vêtue de dentelle noire tenant une rose séchée',
    aspectClass: 'aspect-[3/4]',
    layoutClass: 'lg:col-span-5 lg:mt-20',
    epitaph:
      '« Ses gants de deuil furent découverts sur la balustrade de la falaise ; jamais la marée ne rendit son anneau. »',
    versoConfession:
      'Billet cousu avec un cheveu noir dans la doublure de toile : « Ne plaignez point mes larmes ; elles ne coulent que lorsque les vivants s’approchent du feu. »',
    notaryNote:
      'Les pétales peints au centre du corsage dégagent encore une odeur de cendre humide, de sel marin et de belladone.',
    horrorPhenomenon:
      'À la chaleur de votre mèche, deux filets de laque carmin s’écoulent lentement de ses cils inférieurs.',
    eyes: [
      { xPct: 44.15, yPct: 28.25, rxPct: 2.05, ryPct: 0.66, lidRgb: [94, 64, 55] },
      { xPct: 56.10, yPct: 27.75, rxPct: 2.00, ryPct: 0.62, lidRgb: [82, 55, 47] },
    ],
  },
  {
    id: 'malachie',
    cote: 'PL. 03',
    name: 'L’abbé Malachie',
    title: 'Archiviste et confesseur muet du domaine',
    years: '1822 à 1889',
    medium: 'Huile sur toile marouflée, gousset de laiton oxydé',
    imageSrc: '/assets/portrait-malachie.webp',
    width: 896,
    height: 1200,
    alt: 'Portrait à la bougie de l’abbé Malachie tenant une montre à gousset en laiton',
    aspectClass: 'aspect-[3/4]',
    layoutClass: 'lg:col-span-5',
    epitaph:
      '« Quarante ans il écouta derrière la grille de chêne sans prononcer une seule absolution. »',
    versoConfession:
      'Gravé au canif dans le bois du cadre : « L’aiguille s’est figée à trois heures dix-sept ; depuis lors, c’est la maison qui nous confesse, et sa voix monte du puits. »',
    notaryNote:
      'La montre représentée sur la toile correspond pièce pour pièce à celle trouvée arrêtée sur l’autel de la crypte, le verre fendu de l’intérieur.',
    horrorPhenomenon:
      'Le vernis craquelle autour du gousset peint : son regard refuse désormais de quitter votre flamme.',
    eyes: [
      { xPct: 48.75, yPct: 26.55, rxPct: 1.85, ryPct: 0.58, lidRgb: [82, 59, 41] },
      { xPct: 60.15, yPct: 27.00, rxPct: 1.60, ryPct: 0.50, lidRgb: [44, 31, 21] },
    ],
  },
  {
    id: 'jumeaux',
    cote: 'PL. 04',
    name: 'Céleste et Cyprien',
    title: 'Les enfants de la mansarde nord',
    years: '1871 à 1881',
    medium: 'Ferrotype au collodion humide sous verre et cuivre',
    imageSrc: '/assets/portrait-jumeaux.webp',
    width: 1200,
    height: 896,
    alt: 'Ferrotype ancien montrant les jumeaux Céleste et Cyprien immobiles dans un couloir boisé',
    aspectClass: 'aspect-[4/3]',
    layoutClass: 'lg:col-span-7 lg:mt-12',
    epitaph:
      '« Le photographe jura n’avoir fait poser qu’un seul enfant devant l’objectif ; le bain d’argent en révéla deux. »',
    versoConfession:
      'Trace crayeuse au revers de la plaque métallique : « Nous comptons les pas dans l’escalier ; il manque toujours celui qui redescend. »',
    notaryNote:
      'C’est à leur fenêtre mansardée que les pêcheurs affirment apercevoir, chaque trente et un octobre, une silhouette debout près d’une veilleuse.',
    horrorPhenomenon:
      'Les sels d’argent frémissent à la lueur du suif : la silhouette de Cyprien vacille sur la plaque comme un reflet sans corps.',
    eyes: [
      { xPct: 39.65, yPct: 33.55, rxPct: 0.85, ryPct: 0.44, lidRgb: [104, 94, 79] },
      { xPct: 42.75, yPct: 33.55, rxPct: 0.85, ryPct: 0.44, lidRgb: [98, 88, 74] },
      { xPct: 59.35, yPct: 34.95, rxPct: 0.85, ryPct: 0.42, lidRgb: [94, 84, 70] },
      { xPct: 62.60, yPct: 34.85, rxPct: 0.85, ryPct: 0.42, lidRgb: [92, 82, 68] },
    ],
  },
];

export const GRIMOIRE_FOLIOS: GrimoireFolio[] = [
  {
    folioNumber: 'Feuillet I',
    latinRubric: 'De nocte omnium animarum',
    leftTitle: 'Procès-verbal de la chambre close',
    leftParagraphs: [
      'L’an mil huit cent quatre-vingt-neuf, la veille de la Toussaint, nous, maître Anselme Vasseur, avons pénétré dans la bibliothèque haute du manoir de Valmorin après rupture des chaînes du portail.',
      'Sur le pupitre de chêne noir reposait le présent registre relié en peau de veau calcinée. Cinq chandelles de suif brûlaient encore autour de l’ouvrage, bien que le domaine fût déserté depuis trois marées et que les miroirs eussent été retournés face contre pierre.',
    ],
    leftMarginalia:
      'Note griffonnée d’une main tremblante : ne jamais souffler la cinquième mèche avant d’avoir refermé le fermoir de fer.',
    rightType: 'engraving',
    engravingSrc: '/assets/grimoire-botanique.webp',
    engravingAlt:
      'Gravure anatomique sur cuivre réunissant un crâne humain, un sphinx tête-de-mort et des rameaux de belladone',
    engravingWidth: 896,
    engravingHeight: 1200,
    rightCaption: 'Planche I : Herbier funèbre d’Atropa belladonna et sphinx Acherontia.',
    rightText:
      'Décoction employée par Héloïse de Valmorin pour dilater la pupille et percevoir, disait-elle, « les hôtes immobiles assis dans l’angle obscur des miroirs ».',
  },
  {
    folioNumber: 'Feuillet II',
    latinRubric: 'Horologium umbrarum',
    leftTitle: 'Mécanique de l’heure immobile',
    leftParagraphs: [
      'À trois heures dix-sept du matin, toutes les pendules du domaine s’arrêtèrent sur la même seconde. Le balancier du vestibule oscille pourtant encore dans le vide, et au treizième battement suspendu répond un pouls sourd sous les lattes du plancher.',
      'L’abbé Malachie consigna dans ses cahiers que l’architecture même du manoir avait été bâtie comme une sphère armillaire destinée à retenir une seule nuit d’automne hors du calendrier des vivants.',
    ],
    leftMarginalia:
      'Observation : quiconque prête l’oreille au treizième battement entend le silence prendre souffle sous ses pas.',
    rightType: 'engraving',
    engravingSrc: '/assets/grimoire-eclipse.webp',
    engravingAlt:
      'Gravure occulte d’une sphère armillaire aux rouages figés tenue par une main squelettique portant clé et sablier',
    engravingWidth: 896,
    engravingHeight: 1200,
    rightCaption: 'Planche II : Astrolabe d’éclipse et clef maîtresse du caveau familial.',
    rightText:
      'Les phases lunaires gravées au sommet indiquent le retour septennal du brouillard salin qui engloutit les falaises de Caux et verrouille les portes de l’intérieur.',
  },
  {
    folioNumber: 'Feuillet III',
    latinRubric: 'Vigilia quinque cereorum',
    leftTitle: 'Le rituel des cinq veilleuses',
    leftParagraphs: [
      'Selon le codicille secret de Séverin de Valmorin, cinq flammes doivent être éveillées sur la table de pierre pour rendre la parole aux pierres muettes de la crypte.',
      'Allumez chacune des cinq chandelles ci-contre afin d’éprouver la devise gravée sous le blason : lorsque la dernière mèche prend feu, la clause cachée du testament suinte à l’encre carmin sur le vélin.',
    ],
    leftMarginalia:
      'Avertissement du clerc : l’ordre importe peu, mais toute flamme éveillée appelle un témoin dans la pièce où vous lisez.',
    rightType: 'ritual',
    rightCaption: 'Épreuve notariale : allumez les cinq chandelles de veille.',
    rightText:
      'Chaque cierge correspond à une âme demeurée sous l’ardoise du manoir : Séverin, Héloïse, Malachie, Céleste et Cyprien.',
  },
];

export const INITIAL_WITNESSES: WitnessEntry[] = [
  {
    id: 'vasseur-1889',
    name: 'Anselme Vasseur, notaire à Dieppe',
    dateLabel: '31 octobre 1889',
    isoDate: '1889-10-31',
    verse:
      'J’ai apposé la cire rouge sur les portes de la galerie ; pourtant, en me retournant au bas du perron, la lucarne du grenier venait de se rallumer et quelqu’un m’observait derrière la vitre.',
  },
  {
    id: 'garance-1896',
    name: 'Garance de Saint-Clair',
    dateLabel: '31 octobre 1896',
    isoDate: '1896-10-31',
    verse:
      'Les portraits ne dorment point sous leur vernis noir. J’ai vu les pupilles d’Héloïse glisser vers ma bougie et une larme sombre rouler sur le bois du cadre.',
  },
  {
    id: 'docteur-moreau-1903',
    name: 'Docteur Théophile Moreau',
    dateLabel: '31 octobre 1903',
    isoDate: '1903-10-31',
    verse:
      'Aucune explication physique ne rend compte du double battement cardiaque qui résonne sous le parquet chaque fois que l’horloge sans poids retient sa treizième seconde.',
  },
];
