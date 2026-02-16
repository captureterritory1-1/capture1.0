# CAPTURE Mobile App - Replit Version

Territory-claiming mobile game built with React Native and Expo. Run, walk, and claim territories on the map!

## 🚀 Quick Start on Replit

### 1. Setup Dependencies
Click the **"Run"** button in Replit, or run:
```bash
npm install
npm start
```

### 2. Connect with Expo Go
1. Install **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. In Replit, look for the QR code in the console output
3. Scan the QR code with:
   - **iOS**: Camera app → Tap notification
   - **Android**: Expo Go app → Scan QR Code
4. Your app will load on your phone!

## 🔧 Configure Backend API

Update the backend URL in `.env` file (create if it doesn't exist):

```env
EXPO_PUBLIC_API_URL=https://your-backend.username.repl.co/api
```

Or edit `src/services/api.js` directly.

## 📱 Features

- **Login**: User authentication
- **Map**: GPS tracking with real-time location
- **Territories**: Claim territories by running/walking routes
- **Leaderboard**: View top players
- **Profile**: User stats and preferences

## 🗂️ Project Structure

```
├── App.js                      # Main app entry with navigation
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js     # Login screen
│   │   ├── MapScreen.js       # Map with GPS tracking
│   │   ├── ProfileScreen.js   # User profile
│   │   └── RanksScreen.js     # Leaderboard
│   ├── services/
│   │   └── api.js             # Backend API integration
│   └── constants/
│       └── theme.js           # App theme and colors
└── package.json
```

## 🎨 Customization

### Change Colors
Edit `src/constants/theme.js`:
```javascript
export const COLORS = {
  primary: '#EF4444', // Change this!
  // ...
};
```

### Add New Screens
1. Create file in `src/screens/`
2. Add to `App.js` navigation

## 📦 Dependencies

- **expo**: Core Expo framework
- **expo-location**: GPS tracking
- **react-native-maps**: Map display
- **axios**: API calls
- **@react-navigation**: Navigation between screens

## 🐛 Troubleshooting

### Can't Connect to App
- Make sure phone and Replit are on same network (or use Expo Go's connection via Expo servers)
- Check Replit console for QR code
- Try restarting: Stop and click "Run" again

### API Errors
- Verify backend URL in `.env` or `src/services/api.js`
- Make sure backend server is running
- Check CORS settings on backend

### Map Not Loading
- Grant location permissions on your phone
- Check if GPS is enabled
- Verify you're outdoors or in a location with GPS signal

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## 🔗 Related

- **Backend**: Deploy your FastAPI backend on Replit
- **Web Version**: React web app version available

---

Built with ❤️ using Expo and React Native
