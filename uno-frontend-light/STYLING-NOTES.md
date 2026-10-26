# UNO Frontend: light styling build

Run: `npm install` then `npm start`. Needs Node `^22.22.3 || ^24.15.0 || >=26.0.0` (Angular CLI requirement).

## What changed from the heavy version
- Removed dependencies: gsap, lenis, three, @types/three (run `npm install` again to prune).
- Hero is now plain HTML/CSS (no WebGL scene, no letter-by-letter animation, no marquee). Star-background (three.js) component deleted.
- Global effects layer (FxService) reduced to one IntersectionObserver fade-up on cards/section headers. Cursor glow/ring, tilt, spotlight, magnetic buttons, ripples, parallax, count-up, scroll-drawn SVG are gone.
- AnimationService keeps its method names but uses native scrolling and the Web Animations API.
- No backdrop-filter, blur(), drop-shadow(), grain overlay, aurora background, or infinite decorative animations (only the loading spinner still loops).
- Shadows are single-layer and small (see --shadow-1/2/3 in styles/_tokens.scss). Surfaces are solid colours.
- Fonts: one family (Manrope 400/600/700/800) instead of Cormorant + Pinyon Script + Manrope. --font-display / --font-script now alias it.
- Theme toggle is a plain class flip (no view-transition circle); route changes no longer use view transitions.
- Long landing sections use content-visibility: auto.

## Design system
src/styles/: _tokens (colours, shadows, radii), _base, _motion, _ui, _panels, _auth, imported by src/styles.scss.
Theme: dark by default; light toggle remembered in localStorage("theme").
