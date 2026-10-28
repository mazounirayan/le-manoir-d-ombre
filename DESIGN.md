---
name: Le Manoir d'Ombre
description: Système éditorial gothique XIXe siècle (Domaine de Valmorin, 1889). Papier d'obsidienne teinté à la suie, vélin d'archive, cire carmin coagulée et lueur de suif en OKLCH.

colors:
  paper: "oklch(14% 0.010 48)"
  paper-deep: "oklch(11% 0.010 48)"
  surface: "oklch(18% 0.012 48)"
  surface-raised: "oklch(22% 0.015 48)"
  vellum: "oklch(86% 0.028 78)"
  vellum-deep: "oklch(79% 0.035 76)"
  vellum-ink: "oklch(25% 0.026 38)"
  vellum-muted: "oklch(38% 0.024 45)"
  line: "oklch(31% 0.018 52)"
  line-strong: "oklch(44% 0.036 62)"
  ink: "oklch(92% 0.008 65)"
  muted: "oklch(73% 0.012 65)"
  faint: "oklch(62% 0.012 65)"
  accent: "oklch(55% 0.145 24)"
  accent-hover: "oklch(62% 0.150 24)"
  accent-ink: "oklch(96% 0.006 65)"
  candle: "oklch(79% 0.125 74)"
  candle-deep: "oklch(58% 0.110 68)"

typography:
  scale:
    "12": "0.75rem"
    "14": "0.875rem"
    "16": "1rem"
    "18": "1.125rem"
    "20": "1.25rem"
    "24": "1.5rem"
    "32": "2rem"
    "48": "3rem"
    "64": "4rem"
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.25rem)"
    fontWeight: 600
    letterSpacing: "-0.015em"
    lineHeight: 1.08
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.85rem, 3.4vw, 2.75rem)"
    fontWeight: 500
    letterSpacing: "-0.01em"
    lineHeight: 1.14
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  mono:
    fontFamily: "IBM Plex Mono, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.02em"

rounded:
  none: "0"
  xs: "2px"
  sm: "4px"
  md: "6px"

spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  "2xl": "64px"
  "3xl": "96px"
---

# 1. Overview
**Le Manoir d'Ombre** (*Domaine de Valmorin, inventaire notarial d'octobre 1889*) est une exposition gothique éditoriale et interactive. La direction artistique rejette intégralement les tropes numériques modernes et l'IA slop au profit de l'estampe en taille-douce du XIXe siècle, de la typographie romaine monumentale et de la physique d'une flamme de suif.

# 2. Colors
Tous les neutres sont teintés en OKLCH sur un axe de suie chaude et d'os ancien (`chroma >= 0.010`). Aucun noir pur ni blanc pur n'est employé. L'accent primaire (`accent`, cire carmin coagulée) est réservé aux sceaux et actions décisives ; l'accent secondaire (`candle`, or de cire d'abeille, distant de 50 degrés de teinte) accompagne la lueur physique du bougeoir.

# 3. Typography
- **Titrage (`Cormorant Garamond`)** : Exclusivement en romain droit, casse de phrase (*Sentence case*), sans sourcils (*eyebrows*) au-dessus des titres ni fragments colorés internes.
- **Labeur (`Spectral`)** : Lecture littéraire confortable (`1rem`, interlignage `1.65`, justification à gauche, largeur maximale `65ch`). L'italique est réservé aux épigraphes et citations manuscrites hors titres.
- **Cotes & Horodatages (`IBM Plex Mono`)** : Strictement confiné aux balises `<time>`, `<code>` et numéros d'inventaire.

# 4. Elevation
La profondeur repose sur l'étagement tonal franc (`paper` -> `surface` -> `surface-raised`) et des filets gravés de `1px` (`line`, `line-strong`). Aucun flou d'arrière-plan (`backdrop-blur`) ni ombre portée diffuse sur carte arrondie.

# 5. Components
- **Accrochage de Salon Asymétrique** : Quatre portraits aux formats historiques distincts (portrait d'apparat vertical, médaillon de deuil, portrait de confesseur, daguerréotype horizontal sur plaque humide).
- **Grimoire à Double Feuillet** : Vélin clair (`vellum`) contrastant avec l'encre ferro-gallique (`vellum-ink`), sceau de cire à rompre, tourne-page physique et rituel des cinq chandelles.
- **Moteur Audio Procédural Web Audio API** : Vent d'octobre filtré, balancier d'horloge comtoise, crépitement de mèche et grincements de parquet déclenchés uniquement après accord explicite de l'utilisateur.

# 6. Do's and Don'ts
- **Do** : Maintenir un contraste WCAG AA (`>= 4.5:1`) sur chaque couche, fournir `:focus-visible`, `:active` et `:disabled`, et respecter `@media (prefers-reduced-motion: reduce)`.
- **Don't** : Ne jamais introduire d'emojis, de tirets cadratins dans la prose JSX, de dégradés violets/oranges néon, de `rounded-2xl`, de `transition-all` ou de `duration-300`.
