export interface EyeCoordinate {
  xPct: number;
  yPct: number;
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
  eyes: EyeCoordinate[];
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

export const MANOR_ROOMS = [
  { id: 'vestibule', numeral: 'I', label: 'Le vestibule' },
  { id: 'galerie', numeral: 'II', label: 'La galerie' },
  { id: 'bibliotheque', numeral: 'III', label: 'Le grimoire' },
  { id: 'crypte', numeral: 'IV', label: 'La crypte' },
] as const;

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
      'Inscription tracée à la mine de plomb au dos du châssis : « J’ai vendu le sommeil des miens contre sept hivers de silence ; voici venir le huitième. »',
    notaryNote:
      'Toile retrouvée tiède au toucher lors de l’ouverture des portes à l’aube du premier novembre.',
    eyes: [
      { xPct: 43.0, yPct: 30.8 },
      { xPct: 54.4, yPct: 30.3 },
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
      'Billet cousu dans la doublure de toile : « Ne plaignez point mes larmes ; elles ne coulent que lorsque les vivants s’approchent du feu. »',
    notaryNote:
      'Les pétales peints au centre du corsage dégagent encore une odeur de cendre humide et de belladone.',
    eyes: [
      { xPct: 44.3, yPct: 28.1 },
      { xPct: 56.1, yPct: 27.6 },
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
      'Gravé au canif dans le bois du cadre : « L’aiguille s’est figée à trois heures dix-sept ; depuis lors, c’est la maison qui nous confesse. »',
    notaryNote:
      'La montre représentée sur la toile correspond pièce pour pièce à celle trouvée arrêtée sur l’autel de la crypte.',
    eyes: [
      { xPct: 49.0, yPct: 26.6 },
      { xPct: 60.1, yPct: 27.0 },
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
      'C’est à leur fenêtre mansardée que les pêcheurs affirment apercevoir, chaque trente et un octobre, une veilleuse allumée.',
    eyes: [
      { xPct: 39.7, yPct: 33.4 },
      { xPct: 42.8, yPct: 33.4 },
      { xPct: 59.4, yPct: 34.4 },
      { xPct: 62.5, yPct: 34.3 },
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
      'Sur le pupitre de chêne noir reposait le présent registre relié en peau de veau calcinée. Cinq chandelles de suif brûlaient encore autour de l’ouvrage, bien que le domaine fût déserté depuis trois marées.',
    ],
    leftMarginalia:
      'Note en marge : ne jamais souffler la cinquième mèche avant d’avoir refermé le fermoir de fer.',
    rightType: 'engraving',
    engravingSrc: '/assets/grimoire-botanique.webp',
    engravingAlt:
      'Gravure anatomique sur cuivre réunissant un crâne humain, un sphinx tête-de-mort et des rameaux de belladone',
    engravingWidth: 896,
    engravingHeight: 1200,
    rightCaption: 'Planche I : Herbier funèbre d’Atropa belladonna et sphinx Acherontia.',
    rightText:
      'Décoction employée par Héloïse de Valmorin pour dilater la pupille et percevoir, disait-elle, « les hôtes assis dans l’angle obscur des miroirs ».',
  },
  {
    folioNumber: 'Feuillet II',
    latinRubric: 'Horologium umbrarum',
    leftTitle: 'Mécanique de l’heure immobile',
    leftParagraphs: [
      'À trois heures dix-sept du matin, toutes les pendules du domaine s’arrêtèrent sur la même seconde. Le balancier du vestibule oscille pourtant encore dans le vide, produisant un battement sec que nul ressort n’alimente.',
      'L’abbé Malachie consigna dans ses cahiers que l’architecture même du manoir avait été bâtie comme une sphère armillaire destinée à retenir une seule nuit d’automne hors du calendrier des vivants.',
    ],
    leftMarginalia:
      'Observation : quiconque prête l’oreille au treizième battement entend le silence prendre souffle.',
    rightType: 'engraving',
    engravingSrc: '/assets/grimoire-eclipse.webp',
    engravingAlt:
      'Gravure occulte d’une sphère armillaire aux rouages figés tenue par une main squelettique portant clé et sablier',
    engravingWidth: 896,
    engravingHeight: 1200,
    rightCaption: 'Planche II : Astrolabe d’éclipse et clef maîtresse du caveau familial.',
    rightText:
      'Les phases lunaires gravées au sommet indiquent le retour septennal du brouillard salin qui engloutit les falaises de Caux.',
  },
  {
    folioNumber: 'Feuillet III',
    latinRubric: 'Vigilia quinque cereorum',
    leftTitle: 'Le rituel des cinq veilleuses',
    leftParagraphs: [
      'Selon le codicille secret de Séverin de Valmorin, cinq flammes doivent être éveillées sur la table de pierre pour rendre la parole aux pierres muettes de la crypte.',
      'Allumez chacune des cinq chandelles ci-contre afin d’éprouver la devise gravée sous le blason : lorsque la dernière mèche prend feu, la clause cachée du testament se dévoile à l’encre carmin.',
    ],
    leftMarginalia:
      'Avertissement du clerc : l’ordre importe peu, mais toute flamme éveillée appelle un témoin.',
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
      'J’ai apposé la cire rouge sur les portes de la galerie ; pourtant, en me retournant au bas du perron, la lucarne du grenier venait de se rallumer.',
  },
  {
    id: 'garance-1896',
    name: 'Garance de Saint-Clair',
    dateLabel: '31 octobre 1896',
    isoDate: '1896-10-31',
    verse:
      'Les portraits ne dorment point sous leur vernis noir. J’ai cru voir les lèvres d’Héloïse frémir lorsque ma bougie s’est inclinée dans le courant d’air.',
  },
  {
    id: 'docteur-moreau-1903',
    name: 'Docteur Théophile Moreau',
    dateLabel: '31 octobre 1903',
    isoDate: '1903-10-31',
    verse:
      'Aucune explication physique ne rend compte du battement régulier de l’horloge dont j’ai moi-même retiré les poids de fonte.',
  },
];
