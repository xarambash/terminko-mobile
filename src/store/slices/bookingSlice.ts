import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Resource, ResourceService, Slot } from '../../api/types';
import {
  fetchResources,
  fetchServices,
  fetchSlots,
  fetchTenantBySlug,
  submitBooking,
  type ConfirmationData,
} from '../bookingThunks';

/** Booking selections shared across the schedule flow; UI-only state stays on screens. */
export type BookingState = {
  tenantId: string | null;
  tenantName: string | null;
  resourceId: string | null;
  serviceId: string | null;
  selectedDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  resources: Resource[];
  services: ResourceService[];
  slots: Slot[];
  tenantStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resourcesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  servicesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  slotsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  tenantErrorCode: 'missingSlug' | 'tenantNotFound' | 'network' | null;
  resourcesError: boolean;
  servicesError: boolean;
  slotsError: boolean;
  submitError: string | null;
  confirmation: ConfirmationData | null;
};

const bookingDraftInitial = {
  resourceId: null as string | null,
  serviceId: null as string | null,
  selectedDate: null as string | null,
  slotStart: null as string | null,
  slotEnd: null as string | null,
};

const initialState: BookingState = {
  tenantId: null,
  tenantName: null,
  ...bookingDraftInitial,
  resources: [],
  services: [],
  slots: [],
  tenantStatus: 'idle',
  resourcesStatus: 'idle',
  servicesStatus: 'idle',
  slotsStatus: 'idle',
  submitStatus: 'idle',
  tenantErrorCode: null,
  resourcesError: false,
  servicesError: false,
  slotsError: false,
  submitError: null,
  confirmation: null,
};

function clearSlotSelection(state: BookingState) {
  state.slotStart = null;
  state.slotEnd = null;
}

function clearSlotsData(state: BookingState) {
  state.slots = [];
  state.slotsStatus = 'idle';
  state.slotsError = false;
  clearSlotSelection(state);
}

function clearFromServiceChange(state: BookingState) {
  state.selectedDate = null;
  clearSlotsData(state);
}

function clearServicesData(state: BookingState) {
  state.services = [];
  state.servicesStatus = 'idle';
  state.servicesError = false;
}

function clearFromResourceChange(state: BookingState) {
  state.serviceId = null;
  clearServicesData(state);
  clearFromServiceChange(state);
}

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    /** Pick provider; resets everything downstream in the booking flow. */
    pickResource(state, action: PayloadAction<string>) {
      state.resourceId = action.payload;
      clearFromResourceChange(state);
    },
    /** Pick service; resets date and slot (slots depend on service). */
    pickService(state, action: PayloadAction<string>) {
      state.serviceId = action.payload;
      clearFromServiceChange(state);
    },
    /** Set calendar day (YYYY-MM-DD); clears the slot list and chosen slot. */
    setSelectedDate(state, action: PayloadAction<string | null>) {
      state.selectedDate = action.payload;
      clearSlotsData(state);
    },
    /** Set both ends of the chosen slot from the API, or clear. */
    setSelectedSlot(state, action: PayloadAction<{ startAt: string; endAt: string } | null>) {
      if (!action.payload) {
        clearSlotSelection(state);
        return;
      }
      state.slotStart = action.payload.startAt;
      state.slotEnd = action.payload.endAt;
    },
    /** Reset submit state so the form can be retried (e.g. on navigation back). */
    resetSubmit(state) {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
    /**
     * Clears booking draft only; keeps tenant resolution and resource list.
     * Use after a successful booking or when starting a new appointment without reloading tenant.
     */
    resetBookingDraft(state) {
      state.resourceId = bookingDraftInitial.resourceId;
      state.serviceId = bookingDraftInitial.serviceId;
      state.selectedDate = bookingDraftInitial.selectedDate;
      state.slotStart = bookingDraftInitial.slotStart;
      state.slotEnd = bookingDraftInitial.slotEnd;
      clearServicesData(state);
      clearSlotsData(state);
      state.submitStatus = 'idle';
      state.submitError = null;
      state.confirmation = null;
    },
    /** Full store reset (e.g. debug); wipes tenant and resources too. */
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
        clearFromResourceChange(state);
        state.resourceId = null;
      })
      .addCase(fetchTenantBySlug.rejected, (state, action) => {
        state.tenantStatus = 'failed';
        state.tenantId = null;
        state.tenantName = null;
        state.tenantErrorCode = action.payload?.code ?? 'network';
        clearFromResourceChange(state);
        state.resourceId = null;
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
      })
      .addCase(fetchServices.pending, (state) => {
        state.servicesStatus = 'loading';
        state.servicesError = false;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.servicesStatus = 'succeeded';
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state) => {
        state.servicesStatus = 'failed';
        state.servicesError = true;
        state.services = [];
      })
      .addCase(fetchSlots.pending, (state) => {
        state.slotsStatus = 'loading';
        state.slotsError = false;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.slotsStatus = 'succeeded';
        state.slots = action.payload;
      })
      .addCase(fetchSlots.rejected, (state) => {
        state.slotsStatus = 'failed';
        state.slotsError = true;
        state.slots = [];
      })
      .addCase(submitBooking.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.confirmation = action.payload;
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload?.message ?? 'network';
      });
  },
});

export const {
  pickResource,
  pickService,
  setSelectedDate,
  setSelectedSlot,
  resetSubmit,
  resetBookingDraft,
  resetBooking,
} = bookingSlice.actions;
