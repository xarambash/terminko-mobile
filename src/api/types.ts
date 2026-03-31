/** Public tenant payload from GET /tenants/:slug */
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  timezone?: string;
  currency?: string;
  defaultLanguage?: string;
};

/** Resource row from GET /tenants/:tenantId/resources */
export type Resource = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  displayOrder: number;
};

/** Service assigned to a resource from GET /tenants/:tenantId/resources/:resourceId/services */
export type ResourceService = {
  id: string;
  resourceId: string;
  serviceId: string;
  price: string;
  durationOverride: number | null;
  isActive: boolean;
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
  };
};

/** Available time slot from GET .../available-slots */
export type Slot = {
  startAt: string;
  endAt: string;
};

/** Payload for POST /tenants/:tenantId/appointments */
export type AppointmentPayload = {
  resourceId: string;
  serviceId: string;
  installationId?: string;
  guest: {
    name: string;
    email: string;
    phone: string;
  };
  startAt: string;
  endAt: string;
  priceAtBooking?: number;
  notes?: string;
};

/** Response from POST /tenants/:tenantId/appointments */
export type AppointmentCreated = {
  id: string;
  resourceId: string;
  serviceId: string;
  guestId: string;
  startAt: string;
  endAt: string;
  status: string;
  guest: {
    id: string;
    name: string;
    email: string;
  };
};

/** Item from GET /tenants/:tenantId/appointments?guestId=... */
export type GuestAppointment = {
  id: string;
  resourceId: string;
  serviceId: string;
  guestId: string;
  startAt: string;
  endAt: string;
  status: 'scheduled' | 'completed' | 'canceled' | string;
  priceAtBooking?: string;
  notes?: string | null;
  resource?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  service?: {
    id: string;
    name?: string;
  };
};

/** Payload for PATCH /tenants/:tenantId/appointments/:id */
export type CancelAppointmentPayload = {
  guestId?: string;
  installationId?: string;
};

/** Response from PATCH /tenants/:tenantId/appointments/:id */
export type CanceledAppointment = {
  id: string;
  status: 'canceled' | string;
  canceledAt?: string;
};
