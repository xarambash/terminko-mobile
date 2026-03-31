import { api } from './client';
import type { Slot } from './types';

export async function getAvailableSlots(
  tenantId: string,
  resourceId: string,
  serviceId: string,
  date: string,
): Promise<Slot[]> {
  const { data } = await api.get<Slot[]>(
    `/tenants/${tenantId}/resources/${resourceId}/available-slots`,
    { params: { serviceId, date } },
  );
  return data;
}
