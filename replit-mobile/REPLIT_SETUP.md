# 🚀 Import This Project to Replit

Follow these simple steps to get your CAPTURE mobile app running on Replit:

## Step 1: Import from GitHub

1. Go to [Replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Select **"Import from GitHub"**
4. Enter this repository URL:
   ```
   https://github.com/captureterritory1-1/capture-mobile-replit
   ```
5. Click **"Import from GitHub"**

## Step 2: Let Replit Set Up

Replit will automatically:
- Detect it's a React Native/Expo project
- Install all dependencies
- Configure the environment

## Step 3: Run the App

1. Click the **"Run"** button at the top
2. Wait 10-20 seconds for Metro bundler to start
3. Look for the **QR code** in the console/output

## Step 4: Connect Your Phone

### On iPhone:
1. Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from App Store
2. Open your **Camera app**
3. Point at the QR code in Replit
4. Tap the notification
5. App opens in Expo Go!

### On Android:
1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Open Expo Go app
3. Tap **"Scan QR Code"**
4. Point at QR code in Replit
5. App loads!

## Step 5: Configure Backend (Optional)

If you have a backend API:

1. In Replit, click on **"Secrets"** (lock icon on left sidebar)
2. Add a new secret:
   - Key: `EXPO_PUBLIC_API_URL`
   - Value: Your backend URL (e.g., `https://your-backend.username.repl.co/api`)
3. Click **"Add new secret"**
4. Restart your app (Stop and click Run again)

## 📱 Features You'll See

- **Login Screen** - Enter email and name
- **Map Screen** - GPS tracking (works on your phone)
- **Profile Screen** - Your stats
- **Leaderboard** - Top players

## 🔧 Making Changes

1. Edit files in Replit
2. Save (Ctrl+S / Cmd+S)
3. Shake your phone and tap **"Reload"**
OR
4. App auto-reloads in a few seconds

## ❓ Troubleshooting

**Can't see QR code?**
- Check the console output at the bottom
- Try clicking "Run" again

**App won't connect?**
- Make sure you have internet connection
- Try using mobile data instead of WiFi
- Restart the Repl

**GPS not working?**
- Make sure location permissions are enabled on your phone
- Go outside or near a window for better GPS signal

---

Need help? Check the [README.md](README.md) for more details!
