import { api } from './client';
import type { Resource } from './types';

export async function getResourcesByTenantId(tenantId: string): Promise<Resource[]> {
  const { data } = await api.get<Resource[]>(`/tenants/${tenantId}/resources`);
  return data.filter((r) => r.isActive);
}
