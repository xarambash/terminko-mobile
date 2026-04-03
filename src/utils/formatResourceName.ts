import type { Resource } from '../api/types';

export function formatResourceName(r: Resource): string {
  return `${r.firstName} ${r.lastName}`.trim();
}
