# Terminko API Reference

Dokumentacija svih API endpoint-a. Ažurira se pri dodavanju novih endpoint-a ili promeni funkcionalnosti.

**Base URL:** `http://localhost:5000` (ili production URL)

**Auth:** Zaštićene rute zahtevaju header: `Authorization: Bearer <token>`

---

## 1. Health

### GET /health

Provera da li je server i baza dostupna.

| | |
|---|---|
| **Params** | — |
| **Body** | — |
| **Auth** | Ne |

**Success (200):**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Error (503):**
```json
{
  "status": "error",
  "database": "disconnected"
}
```

---

## 2. Auth

### POST /auth/register

Registracija owner-a (vlasnika salona).

| | |
|---|---|
| **Params** | — |
| **Body** | JSON (videti ispod) |
| **Auth** | Ne |

**Body:**
```json
{
  "tenantId": "uuid",
  "email": "string",
  "password": "string (min 8 chars)",
  "firstName": "string",
  "lastName": "string"
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "owner",
  "tenantId": "uuid",
  "createdAt": "ISO 8601"
}
```

**Error (400):**
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```
```json
{
  "error": "Registration failed: tenant not found or email already exists"
}
```

**Error (500):**
```json
{
  "error": "Failed to register"
}
```

---

### POST /auth/login

Login owner-a ili staff-a.

| | |
|---|---|
| **Params** | — |
| **Body** | JSON (videti ispod) |
| **Auth** | Ne |

**Body:**
```json
{
  "tenantId": "uuid (opciono)",
  "tenantSlug": "string (opciono)",
  "email": "string",
  "password": "string"
}
```
*Obavezno: `tenantId` ili `tenantSlug`*

**Success (200):**
```json
{
  "token": "JWT string",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "owner|staff",
    "tenantId": "uuid",
    "resourceId": "uuid|null (samo za staff)"
  }
}
```

**Error (400):**
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Error (500):**
```json
{
  "error": "Failed to login"
}
```

---

## 3. Tenants

### GET /tenants/:slug

Dohvatanje tenanta po slug-u (javno).

| | |
|---|---|
| **Params** | `slug` (string) – URL path |
| **Body** | — |
| **Auth** | Ne |

**Success (200):**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "type": "string",
  "timezone": "string",
  "currency": "string",
  "defaultLanguage": "string",
  ...
}
```

**Error (400):**
```json
{
  "error": "Slug is required"
}
```

**Error (404):**
```json
{
  "error": "Tenant not found"
}
```

---

### POST /tenants

Kreiranje tenanta (MVP: javno).

| | |
|---|---|
| **Params** | — |
| **Body** | JSON (videti ispod) |
| **Auth** | Ne |

**Body:**
```json
{
  "name": "string",
  "slug": "string (lowercase, alphanumeric, hyphens)",
  "type": "string",
  "timezone": "string",
  "currency": "string",
  "defaultLanguage": "string",
  "supportedLanguages": ["string"] (opciono)
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  ...
}
```

**Error (400):**
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

**Error (409):**
```json
{
  "error": "Tenant with this slug already exists"
}
```

---

## 4. Resources

### GET /tenants/:tenantId/resources

Lista resursa (berbera) tenanta. Javno za guest booking.

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Body** | — |
| **Auth** | Ne |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "profilePicture": "string|null",
    "email": "string|null",
    "phone": "string|null",
    "isActive": true,
    "displayOrder": 0,
    ...
  }
]
```

---

### POST /tenants/:tenantId/resources

Kreiranje resursa (berbera) + User za staff login. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Da (Owner) |

**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "profilePicture": "string (opciono)",
  "phone": "string (opciono)",
  "isActive": true (opciono),
  "displayOrder": 0 (opciono)
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  ...
}
```

**Error (400):**
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

**Error (404):**
```json
{
  "error": "Tenant not found"
}
```

---

## 5. Services

### GET /tenants/:tenantId/services

Lista usluga tenanta. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Body** | — |
| **Auth** | Da (Owner) |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "durationMinutes": 10,
    "description": "string|null",
    "isActive": true,
    "sortOrder": 0,
    ...
  }
]
```

---

### POST /tenants/:tenantId/services

Kreiranje usluge. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Da (Owner) |

**Body:**
```json
{
  "name": "string",
  "durationMinutes": 10,
  "description": "string (opciono)",
  "isActive": true (opciono),
  "sortOrder": 0 (opciono)
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "name": "string",
  "durationMinutes": 10,
  ...
}
```

**Error (404):**
```json
{
  "error": "Tenant not found"
}
```

---

## 6. Resource Services

### GET /tenants/:tenantId/resources/:resourceId/services

Lista usluga dodeljenih resursu sa cenama. Javno za guest booking.

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Body** | — |
| **Auth** | Ne |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "resourceId": "uuid",
    "serviceId": "uuid",
    "price": "10.00",
    "durationOverride": 15,
    "isActive": true,
    "service": { ... },
    ...
  }
]
```

**Error (404):**
```json
{
  "error": "Resource not found"
}
```

---

### POST /tenants/:tenantId/resources/:resourceId/services

Dodela usluge resursu. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Da (Owner) |

**Body:**
```json
{
  "serviceId": "uuid",
  "price": 10.0,
  "durationOverride": 15 (opciono),
  "isActive": true (opciono)
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "resourceId": "uuid",
  "serviceId": "uuid",
  "price": "10.00",
  ...
}
```

**Error (404):**
```json
{
  "error": "Resource or service not found, or does not belong to tenant"
}
```

**Error (409):**
```json
{
  "error": "Service is already assigned to this resource"
}
```

---

## 7. Available Slots

### GET /tenants/:tenantId/resources/:resourceId/available-slots

Lista slobodnih termina za zakazivanje. Guest/Owner: bilo koji resurs. Staff: samo svoj resurs.

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Query** | `serviceId` (UUID), `date` (YYYY-MM-DD) – obavezno |
| **Body** | — |
| **Auth** | Ne (opciono za Staff) |

**Success (200):**
```json
[
  {
    "startAt": "2025-03-15T09:00:00.000Z",
    "endAt": "2025-03-15T09:30:00.000Z"
  }
]
```

**Error (400):**
```json
{
  "error": "Missing required query params: serviceId, date (YYYY-MM-DD)"
}
```

**Error (404):**
```json
{
  "error": "Resource or service not found"
}
```

---

## 8. Working Hours

### GET /tenants/:tenantId/resources/:resourceId/working-hours

Lista radnog vremena resursa. Owner: svi. Staff: samo svoj resurs.

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Body** | — |
| **Auth** | Da (Owner ili Staff) |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "18:00",
    ...
  }
]
```

**Error (404):**
```json
{
  "error": "Resource not found"
}
```

---

### POST /tenants/:tenantId/resources/:resourceId/working-hours

Dodavanje radnog vremena. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Da (Owner) |

**Body:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "18:00"
}
```
*dayOfWeek: 0–6 (Sunday–Saturday). Vreme: HH:MM format.*

**Success (201):**
```json
{
  "id": "uuid",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "18:00",
  ...
}
```

**Error (400):**
```json
{
  "error": "endTime must be after startTime"
}
```

**Error (404):**
```json
{
  "error": "Resource not found"
}
```

---

## 9. Free Days

### GET /tenants/:tenantId/resources/:resourceId/free-days

Lista slobodnih dana resursa. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Body** | — |
| **Auth** | Da (Owner) |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "date": "2025-03-15",
    "reason": "string|null",
    ...
  }
]
```

**Error (404):**
```json
{
  "error": "Resource not found"
}
```

---

### POST /tenants/:tenantId/resources/:resourceId/free-days

Dodavanje slobodnog dana. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId`, `resourceId` (UUID) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Da (Owner) |

**Body:**
```json
{
  "date": "2025-03-15",
  "reason": "string (opciono)"
}
```

**Success (201):**
```json
{
  "id": "uuid",
  "date": "2025-03-15",
  "reason": "string|null",
  ...
}
```

**Error (404):**
```json
{
  "error": "Resource not found"
}
```

---

## 10. Guests

### GET /tenants/:tenantId/guests

Lista gostiju tenanta. **Owner only.**

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Body** | — |
| **Auth** | Da (Owner) |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    ...
  }
]
```

---

## 11. Appointments

### GET /tenants/:tenantId/appointments

Lista termina.

- **Guest:** `?guestId=uuid` (bez auth) – prikazuje samo svoje termine
- **Owner (auth):** opciono `?resourceId`, `?date` – vidi sve termine tenanta, ili filtrirano
- **Staff (auth):** uvek samo termine svog resursa (`resourceId` iz JWT-a; query `resourceId` se ignoriše). Staff korisnik mora imati `resource_id` u bazi (vezan za `resources` red); inače **403**

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Query** | `guestId` (UUID) – za guest; `resourceId`, `date` (YYYY-MM-DD) – za **owner** (opciono) |
| **Body** | — |
| **Auth** | Ne (guest sa guestId) ili Da (owner/staff) |

**Success (200):**
```json
[
  {
    "id": "uuid",
    "resourceId": "uuid",
    "serviceId": "uuid",
    "guestId": "uuid",
    "startAt": "ISO 8601",
    "endAt": "ISO 8601",
    "status": "scheduled|completed|canceled",
    "priceAtBooking": "10.00",
    "notes": "string|null",
    "resource": { ... },
    "service": { ... },
    "guest": { ... }
  }
]
```

**Error (401):**
```json
{
  "error": "Authentication required"
}
```
```json
{
  "error": "Provide guestId to view your appointments"
}
```

**Error (403):**

Ako je ulogovan **staff** bez vezanog resursa (`users.resource_id` je `NULL`):

```json
{
  "error": "Staff account is not linked to a resource"
}
```

*Napomena za operativu: svi staff nalozi koji koriste manager treba da budu kreirani uz resurs (npr. preko owner flow-a za resurse) da bi imali `resource_id`.*

---

### POST /tenants/:tenantId/appointments

Kreiranje termina. Javno. Gost se kreira automatski ako email ne postoji.

| | |
|---|---|
| **Params** | `tenantId` (UUID) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Ne |

**Body:**
```json
{
  "resourceId": "uuid",
  "serviceId": "uuid",
  "guest": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "startAt": "ISO 8601",
  "endAt": "ISO 8601",
  "priceAtBooking": 10.0,
  "notes": "string"
}
```
*priceAtBooking i notes su opcioni.*

**Success (201):**
```json
{
  "id": "uuid",
  "resourceId": "uuid",
  "serviceId": "uuid",
  "guestId": "uuid",
  "startAt": "ISO 8601",
  "endAt": "ISO 8601",
  "status": "scheduled",
  "resource": { ... },
  "service": { ... },
  "guest": { "id": "uuid", "name": "...", "email": "..." }
}
```
*Čuvaj `guest.id` (guestId) za pregled i otkazivanje svojih termina.*

**Error (400):**
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```
```json
{
  "error": "Invalid request: resource or service not found; or resource does not offer this service; or time slot is already booked"
}
```

---

### PATCH /tenants/:tenantId/appointments/:id

Otkazivanje termina. Gost šalje guestId kao dokaz vlasništva.

| | |
|---|---|
| **Params** | `tenantId` (UUID), `id` (UUID – appointmentId) – URL path |
| **Body** | JSON (videti ispod) |
| **Auth** | Ne |

**Body:**
```json
{
  "guestId": "uuid"
}
```

**Success (200):**
```json
{
  "id": "uuid",
  "status": "canceled",
  "canceledAt": "ISO 8601",
  "resource": { ... },
  "service": { ... },
  "guest": { ... }
}
```

**Error (400):**
```json
{
  "error": "Appointment ID is required"
}
```
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

**Error (404):**
```json
{
  "error": "Appointment not found, already canceled, or guestId does not match"
}
```

---

## 12. Opšte greške

Za sve endpoint-e moguće su:

**Error (500):**
```json
{
  "error": "Failed to ..."
}
```

**Error (401):**
```json
{
  "error": "Authentication required"
}
```
```json
{
  "error": "Invalid or expired token"
}
```

**Error (403):**
```json
{
  "error": "Access denied to this tenant"
}
```
```json
{
  "error": "Owner role required"
}
```

---

## Changelog

| Datum | Promene |
|-------|---------|
| 2025-03 | Inicijalna verzija. PATCH /appointments/:id za otkazivanje. |
| 2025-03-24 | GET /appointments: staff uvek filtriran po `resourceId` iz JWT-a; 403 ako staff nema vezan resurs. |
