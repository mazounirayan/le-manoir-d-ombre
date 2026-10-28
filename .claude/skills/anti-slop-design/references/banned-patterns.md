# Banned AI-Slop Visual, CSS, Icon & Copywriting Patterns

Compiled from `avoid-ai-design`, `impeccable`, `hallmark`, `taste-skill`, `no-slop-ui`, `ux-skill`, and `anti-slop`.

## 1. Banned CSS & Tailwind Patterns
- **Gradients & Glassmorphism**: `backdrop-blur-*`, `backdrop-filter: blur()`, `bg-clip-text text-transparent`, indigo/violet/purple/fuchsia linear or radial gradients.
- **Radii & Shadows**: `rounded-2xl`, `rounded-3xl`, `rounded-xl shadow-lg`, colored glow shadows, `1px` border combined with wide blur shadows (`shadow-xl`/`shadow-2xl`), side-tab accent borders (`border-l-4`, `border-t-2` on rounded cards).
- **Viewport & Transitions**: `100vh` (`h-screen`), `100vw` (`w-screen`), `overflow-x: hidden` (use `overflow-x: clip`), `transition-all`, `duration-300`, `animate-bounce`, `animate-pulse` status dots, `hover:scale-105`.
- **Untinted Neutrals & Raw Palette Utilities**: `#000`, `#fff`, `oklch(L 0 H)`, `bg-slate-*`, `text-gray-*`, `bg-zinc-900 border-white/10`, arbitrary color utilities (`bg-[#...]`).

## 2. Banned Typography & Heading Anti-Patterns
- **Overused Typefaces**: `Inter`, `Roboto`, `Open Sans`, `Lato`, `Montserrat`, `Poppins`, `Space Grotesk`, `Plus Jakarta Sans`, `Outfit`, `Sora`, `Syne`, `Geist`, `Instrument Serif`, `Fraunces`, `Playfair Display`.
- **Heading Violations**: Eyebrow/kicker badges above `<h1>`–`<h3>`, Title Case 4+ word headings, `italic` or styled `<span>` elements inside headings, tracked uppercase UI chrome (`uppercase tracking-wider` on labels/buttons/nav), monospace applied to non-numeric prose labels.

## 3. Banned Iconography & Copywriting
- **Glyphs**: Any emoji (`🎃`, `👻`, `🕯️`, `✨`, `✦`, `✧`), trailing button arrows (`Explore ->`), default cliché Lucide icons (`Sparkles`, `Zap`, `Rocket`, `Star`, `Shield`).
- **Prose**: Em-dashes (`—`) and en-dashes (`–`), `Lorem ipsum`, SaaS filler (`Elevate`, `Unleash`, `Seamless`, `Next-generation`, `Get started`, `Learn more`, `Click here`).
