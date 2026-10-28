---
name: anti-slop-design
description: Enforce craft-floor UI engineering, tinted OKLCH token discipline, typographic restraint, WCAG AA contrast, semantic accessibility, and zero-AI-slop deterministic verification across all frontend components, stylesheets, and French literary copy.
---

# Anti-Slop Design & Gothic Editorial Craft Floor

Synthesized from 7 open-source anti-AI-slop frameworks (`pbakaus/impeccable`, `LeoStehlik/no-slop-ui`, `Leonxlnx/taste-skill`, `funboy322/avoid-ai-design`, `Nutlope/hallmark`, `Laith0003/ux-skill`, and `miqdadbadjuber/anti-slop`).

## 1. OKLCH Token Discipline
- Declare all color, font, radius, and fluid scale tokens once in `:root` and `@theme` inside `src/index.css`.
- Never use pure `#000000` or `#ffffff`, and never use zero-chroma `oklch(L 0 H)`. Tint every neutral surface, border, and ink along the warm soot-and-parchment axis (`chroma >= 0.010`).
- Never write raw Tailwind stock palette classes (`bg-slate-900`, `text-amber-500`, `bg-[#...]`) in `.tsx` components. Use semantic theme tokens (`bg-paper`, `bg-surface`, `bg-surface-raised`, `text-ink`, `text-muted`, `text-accent`, `text-candle`, `border-line`).
- Guarantee WCAG AA (`>= 4.5:1`) for all body and muted prose against every surface layer.

## 2. Typography & French Literary Copy
- **Approved Typefaces**: `Cormorant Garamond` (upright Roman monumental display), `Spectral` (literary body prose and blockquotes), and `IBM Plex Mono` (restricted strictly to `<time>`, `<code>`, `<kbd>`, and archival catalog numerals).
- **Hard Bans**: Never load `Inter`, `Roboto`, `Space Grotesk`, `Plus Jakarta Sans`, `Geist`, `Fraunces`, `Instrument Serif`, or `Playfair Display`.
- **Heading Architecture**:
  - Sentence case only on `<h1>` through `<h6>`.
  - Plain upright single-color text inside headings: never put `italic`, `<em>`, or colored `<span>` tags inside headings.
  - Zero eyebrows, kickers, or pill badges immediately before `<h1>`, `<h2>`, or `<h3>`. Archival dates and catalog numbers follow the heading.
  - Headings always carry more top margin than bottom margin.
- **Punctuation Hygiene**: Zero em-dashes or en-dashes in copy; use colons, semicolons, periods, French guillemets (`« … »`), curly apostrophes (`’`), and true ellipsis (`…`). Zero emojis anywhere in UI or prose.

## 3. Spatial Architecture, Surfaces & Motion
- Set `html, body { overflow-x: clip; }`. Never use `100vw` (`w-screen`) or `100vh` (`h-screen`); use `min-h-dvh`.
- Respect the `4px` spatial grid (`4, 8, 12, 16, 24, 32, 48, 64, 80px`) with at least 4 distinct spacing steps per component.
- Arrange the ancestor gallery in an asymmetrical 19th-century salon hang rather than a uniform 3-card grid.
- Zero `backdrop-blur`, zero `rounded-2xl`/`rounded-3xl`, zero side-border stripes, zero `transition-all`, and zero `duration-300`. Use crisp `2px` to `4px` printmaking corners and explicit `150ms` or `200ms` transitions.
- Support `@media (prefers-reduced-motion: reduce)` and provide `:hover`, `:active`, `:focus-visible`, and `:disabled` states on all interactive controls.

## 4. Progressive References
- Full visual, CSS, and copy banlist: [references/banned-patterns.md](references/banned-patterns.md)
- Deterministic CLI scanner suite: [references/verification.md](references/verification.md)
