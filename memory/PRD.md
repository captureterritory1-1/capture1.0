# CAPTURE PWA - Product Requirements Document

## Original Problem Statement
Build a mobile-first Progressive Web App (PWA) called "CAPTURE" - a territory capture game where users run/walk to claim areas on a map. The app features brand-sponsored territories with gamified scratch cards for rewards, and real-time multiplayer where users can see and claim each other's territories.

## Core Features

### 1. Authentication (MOCKED)
- Premium login/signup screens with dark runner photo background
- Bold "CAPTURE" branding (italic, uppercase)
- **Sign Up button: White background, black text**
- **Sign In button: Black background, white text**
- Any email/password works (mock implementation)

### 2. Real-Time Multiplayer Database
- **MongoDB stores all territories** from all users
- User A's captured territory is visible to User B immediately
- `allTerritories` state syncs from backend via `/api/territories`
- Territories persist across sessions

### 3. Territory Claiming (Over-Capture)
- Users can claim/over-capture existing territories
- API endpoint: `PUT /api/territories/{id}/claim`
- Updates owner_id, color, and stores previous_owner
- `checkTerritoryOverlap()` detects intersecting territories
- `claimTerritory()` updates ownership in database

### 4. Map Core
- Uses `react-leaflet` with CartoDB tiles
- **Light Mode:** CartoDB Positron tiles
- **Dark Mode:** CartoDB Dark Matter tiles
- Real-time GPS tracking with "Blue Dot" user location
- Fly-to animation when clicking territories

### 5. Brand Territories (7 Total)
**MuscleBlaze (3 territories):**
- Indiranagar 12th Main, Koramangala 80ft Road, HSR Layout Sector 2
- Color: #FF6B00 (Orange), Prize: ₹500 OFF

**Super You (2 territories):**
- Indiranagar 100ft Road, Indiranagar Double Road
- Color: #EF4444 (Red), Prize: 30% OFF

**The Whole Truth (2 territories):**
- Koramangala 5th Block, Sony World Signal
- Color: #6B21A8 (Purple), Prize: FREE BAR

### 6. Scratch Card Gamification
- Full-screen modal with brand-colored header
- **Clean scratch surface: ONLY brand logo (no overlay text/emojis)**
- Image proxy endpoint for CORS-safe canvas drawing
- Confetti animation on prize reveal
- Copy coupon code functionality

### 7. Metrics (Area REMOVED)
- **Stats displayed: Territories, Distance (km), Time (mm:ss)**
- **Area metric removed from:**
  - Profile page stats grid
  - Territory popups on map
  - Run summary after capture
  - Recent captures list

### 8. Profile Features
- Profile Picture Upload (cloud storage via MongoDB)
- Camera icon badge for upload trigger
- **3-column stats grid: Territories | Distance | Time**
- Dark/Light mode toggle
- Recent captures list (shows distance/time, not area)

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI with MongoDB
- **Database:** MongoDB (territories, users, profile_pictures collections)
- **Mapping:** react-leaflet, leaflet, turf.js
- **State:** React Context API

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/territories` | GET/POST | Get all/create territory |
| `/api/territories/{id}` | GET/DELETE | Single territory |
| `/api/territories/{id}/claim` | PUT | Claim/over-capture territory |
| `/api/proxy-image` | GET | Image proxy for CORS |
| `/api/brand-territories` | GET | Sponsored brand territories |
| `/api/profile-picture/{user_id}` | GET/POST/DELETE | Profile picture |
| `/api/leaderboard` | GET | Top users |

## What's Implemented (as of Feb 2026)
1. ✅ Premium login/signup (white Sign Up button)
2. ✅ Real-time MongoDB database for multi-user territories
3. ✅ Territory claiming API endpoint
4. ✅ Clean scratch cards (logo only, no overlay)
5. ✅ Area metric removed from all UI
6. ✅ Profile picture upload to cloud
7. ✅ Dark/Light mode toggle
8. ✅ 7 brand territories with real logos

## What's Mocked
- User authentication (any email/password works)
- User sessions (localStorage only)

## P0 - Next Tasks
1. Real JWT authentication with password hashing
2. UI for "Claim Territory" button when overlap detected
3. Real-time WebSocket updates for territory changes

## P1 - Future Features
1. Friends functionality
2. Leaderboard with actual user rankings
3. Push notifications for territory challenges
4. Social sharing of captured territories

## P2 - Enhancements
1. Offline mode with service worker
2. More brand partnerships
3. Achievement badges
4. Territory trading/selling
