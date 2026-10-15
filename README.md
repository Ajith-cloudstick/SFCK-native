# SFCK Native

A React Native app built with Expo (managed workflow).

## Prerequisites

- [Node.js](https://nodejs.org) (LTS) and npm
- A phone with the **Expo Go** app installed (Android: Play Store, iOS: App Store) — for quick local testing
- For real installable builds (APK/IPA, TestFlight, Play Store):
  - [EAS CLI](https://docs.expo.dev/build/setup/): `npm install -g eas-cli`
  - An Expo account with access to this project
  - For iOS builds specifically: a Mac with Xcode + CocoaPods, or rely entirely on EAS's cloud build servers (no local Xcode required)

## Step 1 — Clone the Repository

```
git clone https://github.com/Ajith-cloudstick/SFCK-native.git
cd SFCK-native
```

## Step 2 — Install Dependencies

```
npm install
```

## Step 2b — The SFCK API

Nothing to set while developing. Start the API (`go run .` in `sfck-erp/backend`, port 8095), then start the app as usual:

```
npx expo start --tunnel --clear
```

`metro.config.js` forwards every `/api/v1/*` request from the phone to the API on this computer, so the API works through the same Expo tunnel (or over Wi-Fi without `--tunnel`). Leave `EXPO_PUBLIC_API_URL` empty in `.env`; set it only for release builds that talk to a real server. If the API runs on another port, start Metro with `SFCK_API_TARGET=http://127.0.0.1:<port>`.

If Expo prints "failed to start tunnel" (session closed / remote gone away), ngrok dropped the connection — run the same command again.

Sign in with a field account, for example `cc.worker.ma.cc.i` / `sfck@123` on the dev database (see `LOGINS.md` at the repo root). The account's role needs the "can sync mobile device" permission.

Everything the user does (attendance, block and muster assignments, collection) is saved to SQLite on the phone first and pushed to `/sync/push` when there is a connection, so the app keeps working offline. Open the account menu (avatar, top right) → Sync centre to see pending or rejected records.

## Step 3 — Run the App Locally (Expo Go)

Use this for day-to-day development and quick testing on your own device.

```
npm start
```

This runs `expo start` and prints a QR code in the terminal.

- **On your phone**: open Expo Go and scan the QR code (phone and computer must be on the same Wi-Fi network).
- **Android emulator**: press `a` in the terminal after `npm start`.
- **iOS simulator** (Mac only): press `i` in the terminal after `npm start`.
- **If your phone can't reach your computer's network** (VPN, restricted Wi-Fi, etc.):
  ```
  npm start -- --tunnel
  ```

Other available scripts (see `package.json`):
```
npm run android   # expo start --android
npm run ios        # expo start --ios
```

## Step 3b — Run in a Browser (Web Preview)

For presentations only: the real app, inside an Android phone frame in the browser. Run `npx expo start --tunnel --clear`, then press `w` or open **http://localhost:8081**.

All of the web preview lives in [`web/`](web/README.md), which also explains how to remove it.

## Step 4 — Git Workflow Before Any Build

Always make sure the latest code is committed and pushed before taking a build:

```
git status
git add .
git commit -m "Build ready changes"
git push origin main
```

Confirm the latest commit is visible on GitHub before triggering an EAS build, and confirm you're on the correct branch (`main`).

## Step 5 — Login to Expo/EAS

```
eas login
```

Use the team's shared Expo account credentials.

## Step 6 — Development Build

Use a development build (installable app with dev tools) for simulator/device testing, QA, and debugging beyond what Expo Go supports:

```
eas build --platform android --profile development
eas build --platform ios --profile development
```

If updates aren't reflecting properly, clear the cache:

```
eas build --platform android --profile development --clear-cache
eas build --platform ios --profile development --clear-cache
```

## Step 7 — Preview Build

Distributed internally (e.g. for QA/testers) without dev tools:

```
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Step 8 — Production Build

Use for App Store / Play Store submission or client-facing releases:

```
eas build --platform android --profile production
eas build --platform ios --profile production
```

With cache cleared, if needed:

```
eas build --platform android --profile production --clear-cache
eas build --platform ios --profile production --clear-cache
```

Build numbers/versions are managed automatically (`appVersionSource: "remote"`, `autoIncrement: true` in `eas.json`) — no manual Xcode build-number bump should be needed.

## Step 9 — View Build Details

Build logs, status, download links, and errors can be checked at [expo.dev](https://expo.dev) under this project's Expo account, or by running:

```
eas build:list
```

## Step 10 — Submit to App Store / Play Store

```
eas submit --platform ios
eas submit --platform android
```

Select the desired build during submission. Note: store credentials are not yet configured in `eas.json` (`submit.production` is empty) — you'll be prompted to provide them, or configure them ahead of time.

## Step 11 — TestFlight / Internal Testing (iOS)

In [App Store Connect](https://appstoreconnect.apple.com):
1. Open the app
2. Go to **TestFlight**
3. Select the tester group:
   - **Internal Testers** — in-house/developer/QA testing
   - **External Testers** — client testing, public beta

## Final Checklist Before a Production Build

- [ ] On the correct branch (`main`) with the latest code pulled
- [ ] All changes committed and pushed to GitHub
- [ ] Expo login successful (`eas login`)
- [ ] Correct build profile selected (`development` / `preview` / `production`)
- [ ] Build completed successfully (check on expo.dev)
- [ ] Tested before sharing with clients or external testers
