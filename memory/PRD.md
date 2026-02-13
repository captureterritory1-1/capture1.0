# CAPTURE PWA - Product Requirements Document

## Original Problem Statement
Build a mobile-first Progressive Web App (PWA) called "CAPTURE" - a territory capture game where users run/walk to claim areas on a map. Hyper-local multiplayer experience centered on Bannerghatta Road, Bangalore for the Vibe Coding Hackathon.

## Hackathon V2 Update - Hyper-Realistic Map Engine

### Map Configuration
- **Tile Provider:** Esri World Imagery (satellite) + World Transportation (labels)
- **Location:** Hard-locked to Bannerghatta Road, Bangalore
- **Center:** [12.8988, 77.6006]
- **Zoom:** Default 16, Min 14, Max 19
- **Bounds:** North 12.92, South 12.87, East 77.63, West 77.57
- **Panning:** Restricted to Bannerghatta area only

### Map Views (Toggle Button)
1. **Satellite** - Esri World Imagery + road labels (default)
2. **Streets** - CartoDB Light
3. **Dark** - CartoDB Dark Matter

## Brand Territories - Bannerghatta Road Landmarks

### MuscleBlaze (3 Territories) - Orange #FF6B00
1. **Decathlon Bannerghatta** - Near Gottigere junction
2. **Meenakshi Mall** - Main entrance area
3. **Hulimavu Gate** - Junction

### Super You (2 Territories) - Red #EF4444
4. **Arekere Signal** - Intersection
5. **IIM Bangalore** - Wall strip

### The Whole Truth (2 Territories) - Purple #6B21A8
6. **Vega City Mall** - Mall zone
7. **Jayadeva Flyover** - Start area

## Tracking Sheet UI (New Design)

### Header
- "Ready to Capture" / "Capturing..." status
- Yellow pulse indicator when capturing
- **BG indicator** - Green dot with "BG" label (background tracking)
- **GPS quality** - 4-bar signal strength indicator

### Metrics (3-Column Grid)
- **DISTANCE** - 0.00 km
- **DURATION** - 00:00
- **AVG PACE** - --:-- min/km

### Action Buttons
- **Start Capture** - Orange gradient (amber-500 to orange-500)
- **Pause/Resume** - Zinc-800 background
- **End** - Zinc-800 background
- **Hold to Finish** - Red confirmation button with progress bar

## Interaction Control

### Single Click on Territory
- Triggers flyTo animation (zoom 18, 1.5s duration)
- Toast: "Flying to [territory name]. Double-tap to open reward"
- Does NOT open modal

### Double Click on Territory
- Triggers flyTo animation
- Opens scratch card modal after 1.6s delay
- Shows brand reward

## Core Features

### Authentication (MOCKED)
- Premium login/signup with dark runner background
- Any email/password works

### Scratch Card Gamification
- Clean brand logo as scratchable surface (no overlay text)
- Confetti animation on reveal
- Prize codes: CAPTURE500, SUPERYOU30, TRUTHBAR

### Territory Claiming (Over-Capture)
- Claim Territory modal when overlap detected
- Updates owner_id in database
- Changes polygon color to new owner's color

### Profile Features
- Profile picture upload (MongoDB cloud storage)
- Dark/Light mode toggle
- Stats: Territories | Distance | Time (no area)

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI with MongoDB
- **Mapping:** react-leaflet, Esri tiles, turf.js
- **State:** React Context API

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/territories` | GET/POST | Territory CRUD |
| `/api/territories/{id}/claim` | PUT | Claim/over-capture |
| `/api/proxy-image` | GET | Image proxy for CORS |
| `/api/profile-picture/{user_id}` | GET/POST | Profile picture |

## What's Implemented (Hackathon Ready)
1. ✅ Hyper-realistic Esri satellite map
2. ✅ Bannerghatta Road hard-lock with bounds
3. ✅ 7 brand territories at real landmarks
4. ✅ GPS quality & BG indicators
5. ✅ Avg Pace metric during capture
6. ✅ Pause/Resume functionality
7. ✅ Single click flyTo, Double click scratch card
8. ✅ Layer toggle (satellite/streets/dark)
9. ✅ Claim Territory modal
10. ✅ Clean scratch cards (logo only)

## What's Mocked
- User authentication (any credentials work)
- User sessions

## Demo Mode (Hackathon)
- Pre-seeded brand territories visible immediately
- Fast login (any email/password)
- Visual impact on load (satellite imagery)
- 7 territories create competitive feel

## P0 - Next Tasks
1. Real JWT authentication
2. WebSocket for real-time territory updates
3. Multi-user territory sync

## P1 - Future Features
1. Friends system
2. Leaderboard
3. Push notifications
4. Social sharing
