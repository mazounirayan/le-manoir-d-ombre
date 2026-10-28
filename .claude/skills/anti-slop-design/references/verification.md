# Deterministic Anti-Slop Verification Suite

Every change to `src/` or `index.html` must pass the following deterministic checks with zero failures:

1. **TypeScript & Vite Production Build**:
   ```bash
   npm run build
   ```
2. **`avoid-ai-design` (36 rules, P0 + P1 + P2)**:
   ```bash
   node scripts/detect.mjs --min=P2 src index.html
   ```
3. **`ux-skill` (`ux-lint.py`, 156 rules, target 100/100)**:
   ```bash
   python bin/ux-lint.py --threshold low src index.html
   ```
4. **`hallmark` (`sloplint.mjs`, OKLCH, 4px grid, typography & prose gates)**:
   ```bash
   node skills/hallmark/scripts/sloplint.mjs src index.html --scope page
   ```
5. **`taste-skill` (`lint.mjs` & live multi-viewport `inspect.mjs`)**:
   ```bash
   node skills/taste-skill/scripts/lint.mjs --app src index.html
   ```
6. **`impeccable` (`impeccable detect`, 62 static & live browser rules)**:
   ```bash
   impeccable detect --no-advisory src index.html
   impeccable detect http://localhost:4173
   ```
