# UNO Frontend: restyle notes

Run: `npm install` then `npm start`. Needs Node matching `^22.22.3 || ^24.15.0 || >=26.0.0` (installed Angular CLI engine range); not every Node version above 22 is supported.

New dependencies added to package.json (the code already imported them): gsap, lenis, three, @types/three.

Design system: src/styles/ (_tokens, _base, _motion, _ui, _panels, _auth), imported by src/styles.scss.
Theme: dark by default; light toggle remembered in localStorage("theme").
Global effects: src/app/services/fx.service.ts (cursor glow, spotlight cards, tilt, ripple, reveals, count-up, scroll-drawn SVG).
3D hero: src/app/components/hero (three.js, lazy-loaded, falls back to CSS if WebGL is unavailable).
Icons: src/app/components/icon (SVG set replacing emoji).
angular.json: budgets raised; font inlining off so builds work offline.
