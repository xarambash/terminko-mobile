# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**terminko-mobile** is a React Native (Expo) guest-facing booking app for the Terminko appointment scheduling system. Guests use it to browse service providers, pick a service and time slot, and submit/cancel bookings. The companion app for owners/staff is terminko-manager (separate repo).

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Launch iOS simulator
npm run android    # Launch Android emulator
npm run lint       # Run ESLint
```

No test suite is configured.

## Environment Setup

Create a `.env` file at the root:

```
EXPO_PUBLIC_API_URL=http://localhost:5000        # terminko-server base URL
EXPO_PUBLIC_TENANT_SLUG=salon-lepota            # tenant identifier
```

For physical device testing, use the machine's LAN IP instead of `localhost`.

## Architecture

### Booking Flow (7 screens, linear)

```
Landing → ResourceSelect → ServiceSelect → SlotSelect → BookingForm → Confirmation
                                                                      CancelAppointment (standalone)
```

Navigation is a native stack (`src/navigation/`). Screen param types are in `src/navigation/types.ts`.

### State Management

Single Redux slice (`src/store/bookingSlice.ts`) holds all booking draft state and loaded data:
- Draft: `resourceId`, `serviceId`, `selectedDate`, `slotStart`, `slotEnd`
- Loaded: `resources[]`, `services[]`, `slots[]`, `tenant`
- Async thunks live in `src/store/bookingThunks.ts`; each has a `status` field (`idle | loading | succeeded | failed`) and typed error codes (e.g., `missingSlug`, `tenantNotFound`, `network`)

Typed hooks are in `src/store/hooks.ts` — prefer `useAppDispatch` / `useAppSelector` over raw Redux hooks.

### API Layer

Axios client at `src/api/client.ts` reads `EXPO_PUBLIC_API_URL`. All endpoints are unauthenticated (guest access):

| Purpose | Endpoint |
|---------|----------|
| Tenant info | `GET /tenants/:slug` |
| Resources | `GET /tenants/:tenantId/resources` |
| Services | `GET /tenants/:tenantId/resources/:resourceId/services` |
| Available slots | `GET /tenants/:tenantId/resources/:resourceId/services/:serviceId/available-slots?date=YYYY-MM-DD` |
| Submit booking | `POST /tenants/:tenantId/appointments` |
| Cancel booking | `PATCH /tenants/:tenantId/appointments/:id` |

API types are in `src/api/types.ts`.

### Persistence

`src/lib/guestStorage.ts` wraps AsyncStorage to persist `guestId` after the first booking (key constants in `src/constants/storageKeys.ts`), associating repeat bookings to the same guest.

### Theming

Two themes in `src/theme/`:
- **Light** (default): cream/beige/purple palette (`#F7F6E5`, `#281C59`)
- **Dark**: blue/orange (placeholder, not fully refined)
- **Landing brand**: separate dark hero palette (`#0f0d0b`, `#d4bc94`) used only on the first screen

Six custom Google Fonts are loaded at app startup: Ubuntu, Montserrat Alternates, Explora, Dongle, Cormorant Garamond, Shizuru.

### Internationalization

`src/i18n/` configures i18next with `useSuspense: false` (required for React Native). Translation strings live in `src/locales/en.json`. Only English is currently set up.

## Key Constraints

- **New Architecture disabled** (`newArchEnabled: false` in `app.json`) — legacy React Native architecture.
- Styling uses React Native `StyleSheet` only — no CSS-in-JS library.
- Component-specific styles live at the bottom of the component file, never inline.
- **No scroll on any screen** — all content must fit within the visible viewport.

## UI Library

**React Native Paper** (MD3) is the UI component library. Custom Paper theme lives in `src/theme/paperTheme.ts`.

- Import components from `react-native-paper`
- Use `useTheme()` from `react-native-paper` to access theme tokens inside components — never hardcode hex colors
- The Paper theme is configured with the `landingBrand` dark palette; see `src/theme/paperTheme.ts` for token mappings
- `react-native-calendars` is kept for the calendar on `SlotSelectScreen`; its `theme` prop is kept in sync with Paper theme colors

## Code Conventions

### One component per file
Every component lives in its own file. No multiple component exports from a single file except for co-located small helpers that are not reused elsewhere.

### Component folders
When a component is composed of multiple files (sub-components, styles, types), it gets its own folder with an `index.ts` barrel:

```
src/components/
  BookingStepLayout/
    BookingStepLayout.tsx
    ShellHeader.tsx
    BackButton.tsx
    ProgressBar.tsx
    types.ts
    index.ts          ← re-exports public API
```

### Types
- **Navigation param types**: `src/navigation/types.ts`
- **API types**: `src/api/types.ts`
- **Component prop types**: exported as `ComponentNameProps` from the component file, or from a co-located `types.ts` inside a component folder
- **Screen-local types** (not reused elsewhere): defined at the top of the screen file
- No type defined in more than one place — import, don't duplicate

### Exports
- Named exports only — no default exports
- Each component folder exposes its public API through `index.ts`
- Types that are used outside a component folder must be exported from `index.ts`

### Styles
- Always `StyleSheet.create()` — no inline style objects
- Styles defined at the bottom of the file they belong to
- Paper theme tokens used for all colors — raw hex only in `paperTheme.ts`
