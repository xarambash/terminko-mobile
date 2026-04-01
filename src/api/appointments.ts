import { api } from './client';
import type { AppointmentCanceled, AppointmentCreated, AppointmentPayload } from './types';

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

export async function cancelAppointment(
  tenantId: string,
  cancellationCode: string,
): Promise<AppointmentCanceled> {
  const { data } = await api.patch<AppointmentCanceled>(
    `/tenants/${tenantId}/appointments/cancel-by-code`,
    { cancellationCode },
  );
  return data;
}
