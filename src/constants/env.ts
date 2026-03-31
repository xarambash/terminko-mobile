/** Public Expo env: tenant slug for this app build (GET /tenants/:slug). */
export const TENANT_SLUG = (process.env.EXPO_PUBLIC_TENANT_SLUG ?? '').trim();
