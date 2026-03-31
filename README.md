# terminko-mobile

Guest-facing mobile app for Terminko (Expo, React Native, TypeScript). Owners and staff use **terminko-manager** on the web.

## Docs

| File | Purpose |
|------|---------|
| [`project-context.md`](./project-context.md) | Scope, flows, API notes |
| [`tech-stack.md`](./tech-stack.md) | Dependencies and tooling |
| [`ai-docs/guides/production-mobile-api-setup.md`](./ai-docs/guides/production-mobile-api-setup.md) | Production API/mobile networking setup |

## Requirements

- **Node.js** 18+ (20 LTS recommended; use `nvm use` if you use nvm)
- **npm** 9+
- For device builds: Xcode (iOS) / Android Studio (Android), or Expo Go for development

## Setup

```bash
cd terminko-mobile
npm install
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL to your terminko-server URL (e.g. http://localhost:5000)
npm start
```

Then press `i` / `a` for simulator or scan the QR code with Expo Go.

## Required env vars

Set these in `.env`:

- `EXPO_PUBLIC_API_URL` - Base URL of `terminko-server` (for phone testing use your computer LAN IP, e.g. `http://192.168.1.37:5000`)
- `EXPO_PUBLIC_TENANT_SLUG` - Tenant slug used by `GET /tenants/:slug` (e.g. `salon-lepota`)

If the app shows a stale error after dependency changes, clear Metro’s cache:

```bash
npx expo start -c
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run ios` | Open iOS simulator |
| `npm run android` | Open Android emulator |
| `npm run web` | Web (limited; native is primary) |
| `npm run lint` | ESLint |

## Project layout

```
src/
  api/           # Axios instance (EXPO_PUBLIC_API_URL)
  components/    # Shared UI
  constants/     # e.g. AsyncStorage keys
  i18n/            # i18next + locales
  lib/             # guestId storage helpers
  navigation/      # Root stack
  screens/         # Guest flows (placeholders → wire to API)
  store/           # Redux Toolkit (booking draft state)
```

## Backend

Uses the same **terminko-server** REST API as the web app. Guest routes do not require JWT; persist `guestId` after the first booking (see `src/lib/guestStorage.ts`).
