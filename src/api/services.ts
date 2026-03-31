import { api } from './client';
import type { ResourceService } from './types';

export async function getResourceServices(
  tenantId: string,
  resourceId: string,
): Promise<ResourceService[]> {
  const { data } = await api.get<ResourceService[]>(
    `/tenants/${tenantId}/resources/${resourceId}/services`,
  );
  return data.filter((s) => s.isActive);
}
