# CAPTURE Mobile App

React Native mobile app for iOS using Expo.

## Setup

```bash
cd mobile
npm install
```

## Run

```bash
npm start
```

This will start Expo and show a QR code. Scan it with:
- **iOS**: Camera app → Tap notification → Opens in Expo Go
- **Android**: Expo Go app → Scan QR code

## Requirements

- Node.js 18+
- Expo Go app on your phone
- Mac and phone on same WiFi network

## Backend Connection

The app connects to the FastAPI backend. Update the IP in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://YOUR_IP:8000/api';
```

## Features

- **Login**: Email and display name authentication
- **Map**: GPS tracking with real-time location
- **Territories**: Claim territories by running/walking routes
- **Leaderboard**: View top players
- **Profile**: User stats and preferences
