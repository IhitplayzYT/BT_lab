# UNO Bank Frontend

A premium digital banking frontend for UNO Bank, featuring a modern Angular application with award-level design and smooth animations. Built for the Banking Technology Lab microservices system.

## Features

- **Landing Page**: Hero section with WebGL particle effects, FD calculator, and marketing content
- **Authentication**: Login and signup flows with JWT token management
- **Dashboard**: User dashboard for managing FD accounts and viewing products
- **FD Calculator**: Interactive calculator with real-time maturity calculations
- **Responsive Design**: Mobile-first approach with glassmorphism UI
- **Animations**: GSAP-powered smooth scrolling, text reveals, and micro-interactions
- **Three.js Integration**: WebGL particle system in hero section

## Tech Stack

- **Framework**: Angular 20.3.0 (Standalone Components, Signals, New Control Flow)
- **Styling**: SCSS with CSS custom properties
- **Animations**: GSAP + ScrollTrigger, Lenis (smooth scroll), Three.js (WebGL)
- **HTTP**: Angular HttpClient with interceptors
- **State Management**: Angular Signals
- **Routing**: Angular Router

## Prerequisites

- Node.js 18+ 
- npm 9+

## Installation

```bash
cd uno-frontend
npm install
```

## Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload on file changes.

## Build

```bash
npm run build
```

Build artifacts are stored in the `dist/uno-frontend` directory.

## Project Structure

```
uno-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── auth/              # Login, Signup components
│   │   │   ├── dashboard/         # Dashboard component
│   │   │   ├── fd-calculator/     # FD Calculator component
│   │   │   ├── hero/              # Hero with WebGL
│   │   │   ├── landing/           # Landing page wrapper
│   │   │   └── navbar/            # Navigation component
│   │   ├── services/
│   │   │   ├── api-client.service.ts    # API client with JWT
│   │   │   ├── auth.service.ts          # Authentication service
│   │   │   └── animation.service.ts     # Animation utilities
│   │   ├── app.config.ts          # App configuration
│   │   ├── app.routes.ts          # Routing configuration
│   │   └── styles.scss            # Global styles
│   └── styles.scss                # Root styles
├── angular.json                   # Angular CLI config
└── package.json                   # Dependencies
```

## API Integration

The frontend integrates with the following backend services:

- **Auth Service** (Port 8090): Authentication and JWT tokens
- **Product Service** (Port 8080): FD product catalog
- **Calculator Service** (Port 8084): FD maturity calculations
- **Account Service** (Port 8086): FD account management

All API calls use JWT authentication (except auth endpoints).

## Architecture

### Services

- **ApiClientService**: Centralized HTTP client with token management
- **AuthService**: Authentication state and user session management
- **AnimationService**: GSAP animations, smooth scroll, and WebGL helpers

### Components

All components are standalone with their own templates and styles. They use Angular's new control flow (@if, @for) and signals for reactivity.

### Styling

- Dark theme with purple/green accent colors
- Glassmorphism effects
- Custom CSS properties for theming
- Responsive breakpoints at 768px

## Animation System

The application uses a sophisticated animation system:

- **Lenis**: Smooth inertial scrolling
- **GSAP**: Scroll-triggered animations, text reveals, parallax
- **Three.js**: WebGL particle system in hero section
- All animations run outside NgZone for performance
- Respects `prefers-reduced-motion` for accessibility

## Authentication Flow

1. User signs up/logs in via Auth Service
2. JWT tokens stored in localStorage
3. Token attached to all subsequent API requests
4. Automatic token refresh on 401 errors
5. Protected routes redirect to login if not authenticated

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy-loaded landing component
- Optimized bundle size (~380KB initial)
- WebP images where supported
- Code splitting by route
- Animation performance capped at 60fps

## Development Notes

- The project uses SSR-disabled build due to WebGL and browser-specific APIs
- All localStorage access is guarded with `isPlatformBrowser` checks
- Three.js pixel ratio is capped for performance
- Animations pause when off-screen using IntersectionObserver

## Future Enhancements

- Additional marketing sections (Features, How It Works, Testimonials, etc.)
- FD account creation flow
- Transaction history view
- Admin dashboard for bank officers
- PWA support
- Additional Three.js scenes
