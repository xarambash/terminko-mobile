import { api } from './client';
import type { AppointmentCreated, AppointmentPayload } from './types';

export async function createAppointment(
  tenantId: string,
  payload: AppointmentPayload,
): Promise<AppointmentCreated> {
  const { data } = await api.post<AppointmentCreated>(
    `/tenants/${tenantId}/appointments`,
    payload,
  );
  return data;
}
