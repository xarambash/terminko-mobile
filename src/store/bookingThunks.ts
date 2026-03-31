import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { createAppointment } from '../api/appointments';
import { getResourcesByTenantId } from '../api/resources';
import { getResourceServices } from '../api/services';
import { getAvailableSlots } from '../api/slots';
import { getTenantBySlug } from '../api/tenants';
import type { AppointmentPayload, Resource, ResourceService, Slot } from '../api/types';
import { setGuestId } from '../lib/guestStorage';

export type TenantSummary = {
  id: string;
  name: string;
  slug: string;
};

export type TenantReject = { code: 'missingSlug' | 'tenantNotFound' | 'network' };
export type ResourcesReject = { code: 'network' };
export type ServicesReject = { code: 'network' };
export type SlotsReject = { code: 'network' };
export type SubmitReject = { message: string };

export const fetchTenantBySlug = createAsyncThunk<
  TenantSummary,
  string,
  { rejectValue: TenantReject }
>('booking/fetchTenant', async (slug, { rejectWithValue }) => {
  if (!slug.trim()) {
    return rejectWithValue({ code: 'missingSlug' });
  }
  try {
    const tenant = await getTenantBySlug(slug);
    return { id: tenant.id, name: tenant.name, slug: tenant.slug };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return rejectWithValue({ code: 'tenantNotFound' });
    }
    return rejectWithValue({ code: 'network' });
  }
});

export const fetchResources = createAsyncThunk<Resource[], string, { rejectValue: ResourcesReject }>(
  'booking/fetchResources',
  async (tenantId, { rejectWithValue }) => {
    try {
      return await getResourcesByTenantId(tenantId);
    } catch {
      return rejectWithValue({ code: 'network' });
    }
  },
);

export const fetchServices = createAsyncThunk<
  ResourceService[],
  { tenantId: string; resourceId: string },
  { rejectValue: ServicesReject }
>('booking/fetchServices', async ({ tenantId, resourceId }, { rejectWithValue }) => {
  try {
    return await getResourceServices(tenantId, resourceId);
  } catch {
    return rejectWithValue({ code: 'network' });
  }
});

export const fetchSlots = createAsyncThunk<
  Slot[],
  { tenantId: string; resourceId: string; serviceId: string; date: string },
  { rejectValue: SlotsReject }
>('booking/fetchSlots', async ({ tenantId, resourceId, serviceId, date }, { rejectWithValue }) => {
  try {
    return await getAvailableSlots(tenantId, resourceId, serviceId, date);
  } catch {
    return rejectWithValue({ code: 'network' });
  }
});

export type SubmitBookingArg = {
  tenantId: string;
  resourceName: string;
  serviceName: string;
  payload: AppointmentPayload;
};

export type ConfirmationData = {
  appointmentId: string;
  guestId: string;
  resourceName: string;
  serviceName: string;
  startAt: string;
  endAt: string;
};

export const submitBooking = createAsyncThunk<
  ConfirmationData,
  SubmitBookingArg,
  { rejectValue: SubmitReject }
>(
  'booking/submitBooking',
  async ({ tenantId, resourceName, serviceName, payload }, { rejectWithValue }) => {
    try {
      const result = await createAppointment(tenantId, payload);
      await setGuestId(result.guest.id);
      return {
        appointmentId: result.id,
        guestId: result.guest.id,
        resourceName,
        serviceName,
        startAt: result.startAt,
        endAt: result.endAt,
      };
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const msg: unknown = (e.response.data as { error?: string }).error;
        if (typeof msg === 'string') {
          return rejectWithValue({ message: msg });
        }
      }
      return rejectWithValue({ message: 'network' });
    }
  },
);
