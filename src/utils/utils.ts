import type { Resource } from '../api/types';

export function formatResourceName(r: Resource): string {
  return `${r.firstName} ${r.lastName}`.trim();
}

/** Two-letter initials for avatar chips (Figma-style). */
export function formatResourceInitials(r: Resource): string {
  const f = r.firstName.trim().charAt(0);
  const l = r.lastName.trim().charAt(0);
  const pair = `${f}${l}`.toUpperCase();
  if (pair.length >= 2) return pair;
  return (f || l || '?').toUpperCase();
}
