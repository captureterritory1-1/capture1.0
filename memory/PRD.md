# CAPTURE PWA - Product Requirements Document

## Original Problem Statement
Build a mobile-first Progressive Web App (PWA) called "CAPTURE" - a territory capture game where users run/walk to claim areas on a map. The app features brand-sponsored territories with gamified scratch cards for rewards.

## Core Features

### 1. Authentication (MOCKED)
- Premium login/signup screens with dark runner photo background
- Bold "CAPTURE" branding (italic, uppercase)
- Clean white input fields with black buttons
- Any email/password works (mock implementation)

### 2. Onboarding Wizard
- Display name setup
- Units preference (km/miles)
- Activity type (run/walk)
- Territory color selection

### 3. Map Core
- Uses `react-leaflet` with CartoDB tiles
- **Light Mode:** CartoDB Positron tiles
- **Dark Mode:** CartoDB Dark Matter tiles
- Real-time GPS tracking with "Blue Dot" user location
- Fly-to animation when clicking territories

### 4. Brand Territories (7 Total)
**MuscleBlaze (3 territories):**
- Indiranagar 12th Main
- Koramangala 80ft Road
- HSR Layout Sector 2
- Color: #FF6B00 (Orange)
- Prize: ₹500 OFF (code: CAPTURE500)

**Super You (2 territories):**
- Indiranagar 100ft Road
- Indiranagar Double Road
- Color: #EF4444 (Red)
- Prize: 30% OFF (code: SUPERYOU30)

**The Whole Truth (2 territories):**
- Koramangala 5th Block
- Sony World Signal
- Color: #6B21A8 (Purple)
- Prize: FREE BAR (code: TRUTHBAR)

### 5. Scratch Card Gamification
- Full-screen modal with brand-colored header
- **User-uploaded brand logos** as scratchable surface
- Image proxy endpoint for CORS-safe canvas drawing
- Confetti animation on prize reveal
- Copy coupon code functionality

### 6. Profile Features
- **Profile Picture Upload** (cloud storage via MongoDB)
- Camera icon badge for upload trigger
- Edit profile button
- User stats grid (territories, distance, time)
- Recent captures list

### 7. Theme System
- **Dark/Light Mode Toggle** in Profile settings
- Persists in localStorage ('capture_theme')
- Moon/Sun icon indicator
- Toast notification on change

### 8. Territory Capture Gameplay
- "Start Capture" initiates GPS tracking
- Live polyline drawn on map
- "End Capture" analyzes path with `turf.js`
- Closed loop (< 50m gap) = Territory claimed
- Open path = Saved as run/trail

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI with MongoDB
- **Mapping:** react-leaflet, leaflet, turf.js
- **State:** React Context API
- **Animations:** react-confetti

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/territories` | GET/POST | User territories CRUD |
| `/api/territories/{id}` | GET/DELETE | Single territory |
| `/api/proxy-image` | GET | Image proxy for CORS |
| `/api/brand-territories` | GET | Sponsored brand territories |
| `/api/profile-picture/{user_id}` | GET/POST/DELETE | Profile picture |
| `/api/leaderboard` | GET | Top users |

## Assets Used
| Asset | Source | Usage |
|-------|--------|-------|
| MuscleBlaze Logo | `hdwrq9jx_images-2.png` | Map markers, scratch cards |
| Super You Logo | `qderkt0t_channels4_profile.jpg` | Map markers, scratch cards |
| The Whole Truth Logo | `en3r28t5_images-4.png` | Map markers, scratch cards |
| Dark Runner Photo | `d510rufc_WhatsApp Image...jpeg` | Login/Signup background |

## What's Implemented (as of Feb 2026)
1. ✅ Premium login/signup pages with dark runner background
2. ✅ CAPTURE branding (without C logo)
3. ✅ 7 realistic Bangalore brand territories
4. ✅ Real uploaded brand logos on map markers
5. ✅ Logo-based scratch cards for all 3 brands
6. ✅ Dark/Light mode toggle with persistence
7. ✅ Profile picture upload to cloud (MongoDB)
8. ✅ Territory capture with GPS tracking
9. ✅ Image proxy for CORS-free canvas rendering

## What's Mocked
- User authentication (any email/password works)
- User sessions (localStorage only)
- Friends list and social features

## P0 - Next Tasks
1. Real authentication with JWT tokens
2. User registration with password hashing
3. Session management with refresh tokens

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
