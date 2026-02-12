# CAPTURE PWA - Product Requirements Document

## Original Problem Statement
Build a mobile-first Progressive Web App (PWA) called "CAPTURE" - a territory capture game where users run/walk to claim areas on a map. The app features brand-sponsored territories with gamified scratch cards for rewards.

## Core Features

### 1. Authentication (MOCKED)
- Simple email/password login screen
- Any credentials work (mock implementation)
- Onboarding wizard: display name, units (km/miles), activity type (run/walk), territory color

### 2. Map Core
- Uses `react-leaflet` with CartoDB Positron/Dark Matter tiles
- Real-time GPS tracking with "Blue Dot" user location
- Support for both light and dark mode map tiles

### 3. Brand Territories (Implemented)
- **7 hardcoded territories in Bangalore neighborhoods**:
  - MuscleBlaze (3): Indiranagar 12th Main, Koramangala 80ft Road, HSR Layout Sector 2
  - Super You (2): Indiranagar 100ft Road, Indiranagar Double Road
  - The Whole Truth (2): Koramangala 5th Block, Sony World Signal
- Each territory displays brand logo marker on map
- Clicking territory triggers "fly-to" animation and opens scratch card

### 4. Scratch Card Gamification (Implemented)
- Full-screen modal with brand-colored header
- **Brand logo displayed as scratchable surface** (using canvas + proxy for CORS)
- Scratching reveals prize: discount codes, percentage off, free items
- Confetti animation on prize reveal
- Copy coupon code functionality

### 5. Territory Capture Gameplay
- "Start Capture" button initiates GPS tracking
- Live polyline drawn on map as user moves
- "End Capture" analyzes path with `turf.js`:
  - Closed loop (< 50m gap) = Territory claimed
  - Open path = Saved as run/trail
- Minimum area requirement for territory creation

### 6. UI/UX Features
- Mobile-first responsive design
- Dark/Light mode toggle with persistence
- Glassmorphism effects on UI elements
- Custom fonts: Inter (body), Oswald (headings)
- Persistent bottom navigation bar
- "Re-center" button for map

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI with MongoDB
- **Mapping**: react-leaflet, leaflet, turf.js
- **State**: React Context API
- **Animations**: react-confetti

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/territories` - Get all user territories
- `POST /api/territories` - Create new territory
- `GET /api/proxy-image?url=` - Image proxy for CORS (used by scratch cards)
- `GET /api/brand-territories` - Get sponsored brand territories
- `GET /api/leaderboard` - Get top users

## What's Implemented (as of Feb 2026)
1. Complete React/Vite frontend with all pages
2. Map with realistic Bangalore brand territories
3. Logo-based scratch cards for all 3 brands
4. GPS tracking and territory capture logic
5. Dark/light mode
6. Backend image proxy for CORS-free canvas rendering

## What's Mocked
- User authentication (any email/password works)
- User profiles and preferences (localStorage only)
- Friends list and social features
- Leaderboard data

## P0 - Backlog (Next Tasks)
1. Real authentication with MongoDB user storage
2. Persist user territories to MongoDB
3. Multi-user territory sync (see others' territories)

## P1 - Future Features
1. Friends functionality with real data
2. Leaderboard with actual user stats
3. Push notifications for territory challenges
4. Social sharing of captured territories

## P2 - Enhancements
1. Offline mode with service worker
2. More brand partnerships
3. Achievement badges
4. Territory trading/selling
