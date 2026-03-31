import { api } from './client';
import type { Tenant } from './types';

export async function getTenantBySlug(slug: string): Promise<Tenant> {
  const { data } = await api.get<Tenant>(`/tenants/${encodeURIComponent(slug)}`);
  return data;
}
