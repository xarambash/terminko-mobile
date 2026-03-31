import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { fetchResources, fetchTenantBySlug } from '../bookingThunks';
import type { Resource } from '../../api/types';

export type BookingState = {
  tenantId: string | null;
  tenantName: string | null;
  resourceId: string | null;
  serviceId: string | null;
  selectedDate: string | null;
  slotStart: string | null;
  resources: Resource[];
  tenantStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resourcesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  tenantErrorCode: 'missingSlug' | 'tenantNotFound' | 'network' | null;
  resourcesError: boolean;
};

const initialState: BookingState = {
  tenantId: null,
  tenantName: null,
  resourceId: null,
  serviceId: null,
  selectedDate: null,
  slotStart: null,
  resources: [],
  tenantStatus: 'idle',
  resourcesStatus: 'idle',
  tenantErrorCode: null,
  resourcesError: false,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setResourceId(state, action: PayloadAction<string | null>) {
      state.resourceId = action.payload;
    },
    setServiceId(state, action: PayloadAction<string | null>) {
      state.serviceId = action.payload;
    },
    setSelectedDate(state, action: PayloadAction<string | null>) {
      state.selectedDate = action.payload;
    },
    setSlotStart(state, action: PayloadAction<string | null>) {
      state.slotStart = action.payload;
    },
    resetBooking() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenantBySlug.pending, (state) => {
        state.tenantStatus = 'loading';
        state.tenantErrorCode = null;
      })
      .addCase(fetchTenantBySlug.fulfilled, (state, action) => {
        state.tenantStatus = 'succeeded';
        state.tenantId = action.payload.id;
        state.tenantName = action.payload.name;
        state.resourcesStatus = 'idle';
        state.resources = [];
        state.resourcesError = false;
      })
      .addCase(fetchTenantBySlug.rejected, (state, action) => {
        state.tenantStatus = 'failed';
        state.tenantId = null;
        state.tenantName = null;
        state.tenantErrorCode = action.payload?.code ?? 'network';
      })
      .addCase(fetchResources.pending, (state) => {
        state.resourcesStatus = 'loading';
        state.resourcesError = false;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resourcesStatus = 'succeeded';
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state) => {
        state.resourcesStatus = 'failed';
        state.resourcesError = true;
        state.resources = [];
      });
  },
});

export const { setResourceId, setServiceId, setSelectedDate, setSlotStart, resetBooking } = bookingSlice.actions;
