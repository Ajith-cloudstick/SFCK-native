# Web preview (presentation only)

This folder runs the real SFCK Field app in a desktop browser, inside an Android phone frame. It's for presentations and desk testing. It's not part of the phone app: the Android and iOS builds never load anything from here, and `src/` has no web-only code.

## Run it

1. Start the API: run `go run .` in `sfck-erp/backend` (port 8095).
2. Start the app as usual: `npx expo start --tunnel --clear`.
3. Press `w`, or open **http://localhost:8081**. A desktop-width window shows the phone frame.
   - Add `?frame=off` to any address to see the app full window.
   - A phone browser opening the tunnel URL gets the app full screen.

Everything talks to the real API through the same Metro `/api/v1` proxy as the phone app: login, centre day, attendance, assignments, collection and sync.

## How it works

`metro.js` is hooked into `../metro.config.js` with one line. It does two things, both for web only.

**1. It swaps a few modules for web versions.** This happens only when app code in `src/` imports them:

| Phone uses | Web preview uses | Why |
|---|---|---|
| `expo-secure-store` | `shims/expo-secure-store.ts` (localStorage) | SecureStore has no browser build |
| `src/common/db/cacheRepo.ts`, `outboxRepo.ts` (SQLite) | `db/cacheRepo.ts`, `db/outboxRepo.ts` (localStorage) | SQLite on web needs a WASM worker and special headers |
| `expo-constants` | `shims/expo-constants.ts` | Supplies `hostUri` so `httpClient` finds the API |
| `react-native-safe-area-context` | `shims/safe-area-context.ts` | Fake status bar and gesture bar insets inside the frame; also loads `setup.ts` |
| `Stack` from `expo-router` (root layout only) | `shims/expo-router.tsx` (JS stack) | The native stack has no screen transitions in a browser |
| `src/common/theme/shadows.ts` | `theme/shadows.ts` | Android elevation becomes CSS box-shadow |

**2. It serves `preview.html`.** This is the phone frame, served when a browser opens an app route. The frame's iframe loads the app itself.

`setup.ts` makes the browser behave like the phone:
- It hides desktop scrollbars and tap highlights.
- It shows `Alert.alert` as an Android-style dialog, because react-native-web's version does nothing.

**If you change one of the swapped app files,** for example by adding an export to `outboxRepo.ts`, update its web version here too.

## Remove it after the presentation

1. Delete this `web/` folder.
2. In `../metro.config.js`, delete the `require("./web/metro").withWebPreview(config);` line and the comment above it.
3. Optional: uninstall the web packages with `npm uninstall react-native-web react-dom @expo/metro-runtime`.

Nothing in `src/` needs to change.
