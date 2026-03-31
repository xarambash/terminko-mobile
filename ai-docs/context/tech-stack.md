## Tech Stack

Versions align with `terminko-mobile/package.json` (use that file as source of truth when bumping). The app is scaffolded on **Expo SDK 54** with **React Native 0.81** (compatible pins from `expo install`).

### App (`dependencies`)

| Package | Version |
| --- | --- |
| `expo` | ~54.0.33 |
| `expo-status-bar` | ~3.0.9 |
| `react` | 19.1.0 |
| `react-native` | 0.81.5 |
| `@react-navigation/native` | ^7.2.2 |
| `@react-navigation/native-stack` | ^7.14.10 |
| `react-native-screens` | ~4.16.0 |
| `react-native-safe-area-context` | ~5.6.0 |
| `react-native-gesture-handler` | ~2.28.0 (import first in `index.ts`) |
| `@reduxjs/toolkit` | ^2.11.2 |
| `react-redux` | ^9.2.0 |
| `axios` | ^1.14.0 |
| `date-fns` | ^4.1.0 |
| `@react-native-async-storage/async-storage` | 2.2.0 (Expo SDK 54 pin via `expo install`) |
| `i18next` | ^26.0.2 |
| `react-i18next` | ^17.0.1 |

### Tooling (`devDependencies`)

| Package | Version |
| --- | --- |
| `typescript` | ~5.9.2 |
| `@types/react` | ~19.1.0 |
| `eslint` | ^9.39.4 |
| `@eslint/js` | ^9.39.4 |
| `typescript-eslint` | ^8.56.1 |
| `eslint-plugin-react-hooks` | ^7.0.1 |

*(Optional later: `jest`, `@testing-library/react-native`, `jest-expo` when you add unit/component tests.)*

### Navigation & native shell

Screens use **React Navigation** (`@react-navigation/native` + native stack). Resource → service → slots → booking maps to stack routes; **react-native-screens** and **react-native-safe-area-context** are required peers. **Expo** is the runtime; prefer version pins from the Expo SDK when upgrading.

### Calendar & dates

**date-fns** handles parsing, formatting, and comparisons for API date strings. Add **`react-native-calendars`** with `npx expo install react-native-calendars` when you implement the month UI (ensure Expo-compatible version).

### Expo Go stability

- **`newArchEnabled`:** `false` in `app.json` for predictable Expo Go behaviour (enable when you move to dev/production builds if desired).
- **i18n:** `react: { useSuspense: false }` so screens do not suspend without a Suspense boundary.

### i18n

Implemented with `i18next` + `react-i18next` (versions in table above), aligned with `terminko-manager` patterns.

## API

- REST API
- JSON
- **Guest flows:** public tenant, resource, service, slot, and appointment create/cancel endpoints as documented; **no login** for guests. Persist `guestId` after the first successful booking (e.g. **Async Storage**) for “my appointments” and related calls.
- **Authorization:** Bearer JWT is not required for the core guest booking path; owner and staff use `terminko-manager`.
- **Backend:** terminko-server (Express + Prisma)
