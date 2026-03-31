# Plan: Scheduling flow — steps 1 & 2 (landing CTA + tenant + resources)

This plan implements only **step 1** and **step 2** from [`ai-docs/context/scheduling-flow.md`](../ai-docs/context/scheduling-flow.md), aligned with [`project-context.md`](../ai-docs/context/project-context.md), [`tech-stack.md`](../ai-docs/context/tech-stack.md), and [`API-Reference.md`](../ai-docs/context/API-Reference.md).

## Scope

| Step | Behaviour | In scope |
| --- | --- | --- |
| 1 | User taps control to start booking | Yes — wire/verify navigation to the resource step |
| 2 | Resolve tenant by slug → `tenantId`; load resources; user picks one | Yes |
| 3–5 | Services, slots, details, submit | **Out of scope** for this plan |

## Preconditions

- **Backend:** `terminko-server` running and reachable at `EXPO_PUBLIC_API_URL` (see [`src/api/client.ts`](../src/api/client.ts)).
- **Data:** A tenant exists whose **slug** matches what the app will use; that tenant has at least one **active** resource for meaningful QA.

## API contract (guest, no auth)

From `API-Reference.md`:

1. **`GET /tenants/:slug`** — Public. Returns tenant object including **`id`** (UUID). Errors: `400` (slug missing), `404` (tenant not found).
2. **`GET /tenants/:tenantId/resources`** — Public (“Javno za guest booking”). Returns an array of resources with fields such as `id`, `firstName`, `lastName`, `profilePicture`, `isActive`, `displayOrder`, etc.

**Ordering:** Resolve slug → `tenantId` first; never call `/resources` without a valid `tenantId`.

## Configuration

- **Tenant slug** must come from the environment (or equivalent), per project context (“single tenant per app context”). Add **`EXPO_PUBLIC_TENANT_SLUG`** (or reuse an existing convention if the repo already names it differently) and document it in `.env.example` alongside `EXPO_PUBLIC_API_URL`.
- Slug is **not** a secret; it is safe in Expo public env vars.

## State management (Redux Toolkit)

[`bookingSlice`](../src/store/slices/bookingSlice.ts) already stores `resourceId`. Extend it for step 2:

- **`tenantId: string | null`** — Set after a successful tenant load (needed for steps 3+ later, and keeps resource requests consistent).
- Optionally cache **minimal tenant fields** for UI (e.g. `tenantName`, `timezone`) if you show branding on `ResourceSelect` or the header; otherwise keep only `tenantId` + `resourceId` for MVP of this slice.

Use **`createAsyncThunk`** (or a small RTK Query API slice if you prefer) for:

- `fetchTenantBySlug(slug)` → calls `GET /tenants/:slug`, returns `tenantId` (+ optional payload).
- `fetchResources(tenantId)` → calls `GET /tenants/:tenantId/resources`.

Handle loading and error states in the UI (spinner, retry, friendly message on `404`).

## API layer

- Add typed helpers or a thin module (e.g. `src/api/tenants.ts`, `src/api/resources.ts`) that use the shared **`api`** axios instance from [`src/api/client.ts`](../src/api/client.ts).
- Define **TypeScript types** for tenant and resource list items matching the API reference (at least the fields you render).

## Navigation & UI

- **Step 1:** [`LandingScreen`](../src/screens/LandingScreen.tsx) already navigates to `ResourceSelect` via the primary booking button. Confirm copy matches product intent (“Schedule appointment” / existing i18n key `landing.book`); adjust translations only if needed.
- **Step 2:** Replace [`ResourceSelectScreen`](../src/screens/ResourceSelectScreen.tsx) placeholder with:
  - On focus (or on mount): if `tenantId` is missing, run tenant fetch; then fetch resources (or fetch resources once `tenantId` is known).
  - **List** resources (`FlatList` or `ScrollView` + map). Show display name (e.g. `firstName` + `lastName`, or a single field if the API adds one later).
  - **Filter** inactive rows if the API returns `isActive: false` and you should hide them (confirm with backend behaviour).
  - **Select** a row → dispatch `setResourceId` and optionally `setTenantId` if not already set → `navigation.navigate('ServiceSelect')` (next screen stays placeholder until step 3 is implemented).
- Keep **React Navigation** stack as in [`RootNavigator`](../src/navigation/RootNavigator.tsx); no new routes required for steps 1–2 unless you split “loading tenant” into a dedicated screen (not recommended for MVP).

## i18n

- Add/reuse keys for loading, error (tenant not found, generic network error), empty resource list, and accessibility labels if applicable. Follow existing [`src/i18n`](../src/i18n/) patterns.

## Tech stack notes

- **HTTP:** Axios (already in [`tech-stack.md`](../ai-docs/context/tech-stack.md)).
- **Navigation:** React Navigation native stack (already in use).
- **Dates:** Not required for steps 1–2 (`date-fns` used later for slots).
- **Async Storage:** Not required for steps 1–2 (`guestId` persistence is after first booking).

## Testing / verification

- Manual: set `EXPO_PUBLIC_TENANT_SLUG` to a valid slug → open app → book → land on resource list with real data → select resource → navigate forward (service screen may still be stub).
- Error: wrong slug → user sees clear error, no crash.
- Empty resources list → empty state message.

## Deliverables checklist

- [ ] `EXPO_PUBLIC_TENANT_SLUG` (or equivalent) documented and read in app code.
- [ ] Typed API calls for tenant + resources.
- [ ] Redux: `tenantId` (+ optional tenant display fields) and existing `resourceId` updated on selection.
- [ ] `ResourceSelectScreen` implements fetch + list + selection + error/empty/loading.
- [ ] i18n strings for new UI/error copy.
- [ ] Steps 3–5 unchanged or stubbed; no requirement to implement services/slots in this plan.

## References

- Flow: [`ai-docs/context/scheduling-flow.md`](../ai-docs/context/scheduling-flow.md) (steps 1–2).
- Product: [`ai-docs/context/project-context.md`](../ai-docs/context/project-context.md) (guest, multi-tenant by slug).
- Endpoints: [`ai-docs/context/API-Reference.md`](../ai-docs/context/API-Reference.md) — sections **Tenants** (`GET /tenants/:slug`), **Resources** (`GET /tenants/:tenantId/resources`).
- Stack: [`ai-docs/context/tech-stack.md`](../ai-docs/context/tech-stack.md).
