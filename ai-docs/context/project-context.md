# Terminko Mobile — Project Context

> Source: aligned with `docs/ProjectContext.md` (only the parts that apply to the guest mobile app).

## Role in the ecosystem

| Client | Users | Authentication |
|--------|--------|----------------|
| **This app (mobile)** | Guests (salon clients) | **No login** — no email/password account |
| Web (terminko-manager) | Owner, Staff | Email + password (JWT) |
| Backend | — | REST API for both clients |

The mobile app is for **guests only**: booking and viewing their own appointments, cancelling with a code from email.

## Architecture (from ProjectContext)

- **Mobile application** — guests book appointments; they open the app, pick a resource, service, time slot, and enter their details.
- **Backend** — same server as the web app (`terminko-server`): REST API, JSON, database access.
- **Multi-tenant** — data scoped by `tenant_id`; the app must run in the context of a single tenant (e.g. slug / id from build config or deep link).

## Functional requirements (guest)

- View the **resource list** (service providers) and select one.
- View **services** (name, price) and select one.
- View the **calendar** and pick an **available date/time** (slots from the system).
- Fill in the **booking form** (first name, last name, email, phone) and submit.
- **Cancel an appointment** using a **security code** sent by email after booking.
- View **their own reservations**; after the first booking, **`guestId`** is stored on the device (e.g. local storage) and used for “my appointments” when the user returns to the app.

*(Penalty points, bans, and guest management are handled by the Owner on the web — not in scope for the mobile MVP.)*

## UI flows (guest)

1. **Landing** — entry into the app (tenant branding as needed).
2. **Schedule** — booking flow:
   - pick resource → service list → calendar / slots → personal details form.
3. **Confirmation** — message and next steps after a successful booking.
4. **Reservations** — list of the guest’s appointments (`guestId`).
5. **Cancel** — cancellation using the code from email.
6. **About us** — information about the salon (tenant).

## MVP (guest, from ProjectContext)

- Complete the **full booking flow**: resource → service → available slot → details → submit.
- **Cancellation** using the code sent by email.

## Out of MVP / broader context

- Super Admin, Owner/Staff screens and web features are not part of this project — see `docs/ProjectContext.md`.

## Technologies (summary)

Defined in the root document: **React Native**, **Redux**, **date-fns**, and a **calendar** library in the React Native ecosystem. Full list and recommendations: **`tech-stack.md`**.

## API

- The client uses the **same REST API** as the web for public / guest operations (tenant, resources, services, slots, appointment creation, cancellation, etc. per `terminko-manager/ai-workflows/docs/api_reference.md` or the current API spec).

## Non-functional

Quality, security, performance, and environment — aligned with expectations in `ProjectContext.md`.
