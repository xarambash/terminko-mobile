import { api } from './client';
import type {
  AppointmentCreated,
  AppointmentPayload,
  CancelAppointmentPayload,
  CanceledAppointment,
  GuestAppointment,
} from './types';

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

export async function getGuestAppointments(
  tenantId: string,
  guestId: string,
): Promise<GuestAppointment[]> {
  const { data } = await api.get<GuestAppointment[]>(`/tenants/${tenantId}/appointments`, {
    params: { guestId },
  });
  return data;
}

export async function getInstallationAppointments(
  tenantId: string,
  installationId: string,
): Promise<GuestAppointment[]> {
  const { data } = await api.get<GuestAppointment[]>(`/tenants/${tenantId}/appointments`, {
    params: { installationId },
  });
  return data;
}

export async function cancelAppointment(
  tenantId: string,
  appointmentId: string,
  payload: CancelAppointmentPayload,
): Promise<CanceledAppointment> {
  const { data } = await api.patch<CanceledAppointment>(
    `/tenants/${tenantId}/appointments/${appointmentId}`,
    payload,
  );
  return data;
}
