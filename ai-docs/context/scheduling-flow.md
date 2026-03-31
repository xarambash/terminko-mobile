# Scheduling appointment flow

Booking is done in five steps.

1. The user taps **Schedule appointment**.
2. **Resources** — Resolve the tenant: `GET /tenants/:slug` gives `tenantId` (UUID). Then load resources with `GET /tenants/:tenantId/resources`. The user picks a resource.
3. **Services** — Load services for that resource (prices and durations) with `GET /tenants/:tenantId/resources/:resourceId/services`, not the tenant-wide services list. The user picks a service.
4. **Calendar / slots** — The user picks a date; available slots load for that day (`available-slots` with `serviceId` and `date`). The user picks a slot.
5. **Your details** — The user enters their details (name, email, phone; notes optional).

On submit, the client sends `POST /tenants/:tenantId/appointments` and an appointment is created.
